package com.clutch.partners

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.ListAlt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.partners.ui.theme.ClutchPartnersTheme
import com.clutch.partners.ui.theme.*
import kotlinx.coroutines.delay

class SimpleMainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ClutchPartnersTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = LightMuted
                ) {
                    SimpleClutchPartnersApp()
                }
            }
        }
    }
}

@Composable
fun SimpleClutchPartnersApp() {
    var currentScreen by remember { mutableStateOf("auth") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    when (currentScreen) {
        "auth" -> SimpleAuthScreen(
            onNavigate = { currentScreen = "dashboard" },
            isLoading = isLoading,
            onLoadingChange = { isLoading = it },
            errorMessage = errorMessage,
            onErrorMessageChange = { errorMessage = it }
        )
        "dashboard" -> SimpleDashboardScreen(
            onNavigate = { currentScreen = "auth" },
            isLoading = isLoading,
            onLoadingChange = { isLoading = it },
            errorMessage = errorMessage,
            onErrorMessageChange = { errorMessage = it }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SimpleAuthScreen(
    onNavigate: () -> Unit,
    isLoading: Boolean,
    onLoadingChange: (Boolean) -> Unit,
    errorMessage: String,
    onErrorMessageChange: (String) -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    // Handle loading state
    LaunchedEffect(isLoading) {
        if (isLoading) {
            delay(2000)
            onLoadingChange(false)
            onNavigate()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "تسجيل الدخول",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = LightForeground
        )
        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("البريد الإلكتروني أو رقم الهاتف") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp), // 0.625rem from design.json
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LightPrimary,
                unfocusedBorderColor = LightBorder,
                focusedLabelColor = LightPrimary
            )
        )

        Spacer(modifier = Modifier.height(20.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("كلمة المرور") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp), // 0.625rem from design.json
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LightPrimary,
                unfocusedBorderColor = LightBorder,
                focusedLabelColor = LightPrimary
            )
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = {
                if (email.isNotEmpty() && password.isNotEmpty()) {
                    onLoadingChange(true)
                    onErrorMessageChange("")
                } else {
                    onErrorMessageChange("يرجى ملء جميع الحقول")
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(10.dp), // 0.625rem from design.json
            colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            } else {
                Text("تسجيل الدخول", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }

        if (errorMessage.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = errorMessage,
                color = LightDestructive,
                fontSize = 14.sp
            )
        }
    }
}

@Composable
fun SimpleDashboardScreen(
    onNavigate: () -> Unit,
    isLoading: Boolean,
    onLoadingChange: (Boolean) -> Unit,
    errorMessage: String,
    onErrorMessageChange: (String) -> Unit
) {
    var orders by remember { mutableStateOf<List<DemoOrder>>(emptyList()) }

    LaunchedEffect(Unit) {
        onLoadingChange(true)
        delay(1000)
        orders = getDemoOrders()
        onLoadingChange(false)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "الطلبات",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground
            )
            
            Button(
                onClick = onNavigate,
                colors = ButtonDefaults.buttonColors(containerColor = LightMutedForeground)
            ) {
                Text("تسجيل الخروج", color = Color.White)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        when {
            isLoading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = LightPrimary)
                }
            }
            orders.isEmpty() -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.ListAlt,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = LightMutedForeground
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "لا توجد طلبات",
                            fontSize = 18.sp,
                            color = LightMutedForeground
                        )
                    }
                }
            }
            else -> {
                Column(
                    modifier = Modifier.verticalScroll(rememberScrollState())
                ) {
                    orders.forEach { order ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "الخدمة: ${order.serviceOrProduct}",
                                    fontWeight = FontWeight.Bold,
                                    color = LightForeground
                                )
                                Text(
                                    text = "العميل: ${order.customerName}",
                                    color = LightMutedForeground
                                )
                                Text(
                                    text = "المبلغ: ${order.totalAmount} جنيه",
                                    color = LightMutedForeground
                                )
                                Text(
                                    text = "الحالة: ${order.status}",
                                    color = when (order.status) {
                                        "مكتمل" -> LightSuccess
                                        "معلق" -> LightWarning
                                        "مرفوض" -> LightDestructive
                                        else -> LightMutedForeground
                                    },
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

data class DemoOrder(
    val serviceOrProduct: String,
    val customerName: String,
    val totalAmount: Double,
    val status: String
)

fun getDemoOrders(): List<DemoOrder> {
    return listOf(
        DemoOrder("صيانة الفرامل", "أحمد محمد", 250.0, "مكتمل"),
        DemoOrder("تغيير الزيت", "فاطمة علي", 180.0, "معلق"),
        DemoOrder("إصلاح المحرك", "محمد حسن", 1200.0, "مرفوض"),
        DemoOrder("تغيير الإطارات", "سارة أحمد", 400.0, "مكتمل"),
        DemoOrder("صيانة التكييف", "علي محمود", 300.0, "معلق")
    )
}