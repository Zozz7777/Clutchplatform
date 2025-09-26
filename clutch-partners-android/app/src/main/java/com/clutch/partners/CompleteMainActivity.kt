package com.clutch.partners

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.foundation.Image
import com.clutch.partners.ui.theme.ClutchPartnersTheme
import com.clutch.partners.ui.theme.*
import com.clutch.partners.utils.LanguageManager
import com.clutch.partners.utils.ThemeManager
import com.clutch.partners.ui.viewmodel.AuthViewModel
import com.clutch.partners.ui.viewmodel.AuthState
import com.clutch.partners.ui.viewmodel.OrdersViewModel
import com.clutch.partners.ui.viewmodel.OrdersState
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@AndroidEntryPoint
class CompleteMainActivity : ComponentActivity() {
    
    private fun clearUserSession(context: Context) {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().remove("auth_token").remove("user_data").apply()
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val context = this@CompleteMainActivity
        val isDarkTheme = ThemeManager.isDarkTheme(context)
        val layoutDirection = LanguageManager.getLayoutDirection(context)
        
        setContent {
            ClutchPartnersTheme(darkTheme = isDarkTheme) {
                CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
                    CompleteClutchPartnersApp()
                }
            }
        }
    }
}

@Composable
fun CompleteClutchPartnersApp() {
    var currentScreen by remember { mutableStateOf("splash") }
    var selectedPartnerType by remember { mutableStateOf("") }
    var selectedAuthMode by remember { mutableStateOf("") }
    // val authViewModel: AuthViewModel = viewModel() // Removed unused variable
    
    when (currentScreen) {
        "splash" -> SplashScreen(onNavigate = { currentScreen = "onboarding" })
        "onboarding" -> OnboardingScreen(onNavigate = { currentScreen = "partner_selector" })
        "partner_selector" -> PartnerTypeSelectorScreen(
            onNavigate = { partnerType -> 
                selectedPartnerType = partnerType
                currentScreen = "auth_selector"
            }
        )
        "auth_selector" -> AuthSelectorScreen(
            onNavigate = { authMode -> 
                selectedAuthMode = authMode
                currentScreen = "auth"
            },
            onBack = { currentScreen = "partner_selector" }
        )
        "auth" -> AuthScreen(
            authMode = selectedAuthMode,
            onAuthenticated = { currentScreen = "dashboard" },
            onBack = { currentScreen = "auth_selector" }
        )
        "dashboard" -> DashboardScreen()
    }
}

@Composable
fun SplashScreen(onNavigate: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        // Logo inside the rotor circle - both centered
        Box(
            modifier = Modifier.size(380.dp),
            contentAlignment = Alignment.Center
        ) {
            // Animated Rotor - centered and 1.5x size
            AnimatedRotor()
            
            // White Clutch Logo inside the rotor circle
            Image(
                painter = painterResource(id = R.drawable.clutch_logo_white),
                contentDescription = "Clutch Partners Logo",
                modifier = Modifier.size(120.dp)
            )
        }
    }
    
    LaunchedEffect(Unit) {
        delay(3000)
        onNavigate()
    }
}

@Composable
fun AnimatedRotor() {
    val infiniteTransition = rememberInfiniteTransition(label = "rotor")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )
    
    Image(
        painter = painterResource(id = R.drawable.rotor_partner),
        contentDescription = "Loading Rotor",
        modifier = Modifier
            .size(380.dp) // Even bigger rotor size
            .graphicsLayer {
                rotationZ = rotation
            }
    )
}

@Composable
fun OnboardingScreen(onNavigate: () -> Unit) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    var currentPage by remember { mutableStateOf(0) }
    
    val pages = listOf(
        OnboardingPage(
            imageRes = R.drawable.business_plan,
            title = if (isRTL) "إدارة متجرك من هاتفك" else "Manage your store from your phone",
            description = if (isRTL) "إدارة المخزون وتتبع المبيعات وتحديث معلومات عملك في مكان واحد" else "Easily manage your inventory, track sales, and update your business information all in one place"
        ),
        OnboardingPage(
            imageRes = R.drawable.online_world,
            title = if (isRTL) "احصل على طلبات كلاتش" else "Get Clutch orders & appointments",
            description = if (isRTL) "استقبل الطلبات والمواعيد مباشرة من عملاء كلاتش" else "Receive orders and appointments directly from Clutch customers"
        ),
        OnboardingPage(
            imageRes = R.drawable.finance_app,
            title = if (isRTL) "تتبع الإيرادات والمدفوعات" else "Track revenue & payouts",
            description = if (isRTL) "راقب أرباحك ومدفوعاتك الأسبوعية" else "Monitor your earnings and weekly payouts"
        )
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header with logo and language toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Language toggle button
                IconButton(
                    onClick = {
                        LanguageManager.toggleLanguage(context)
                        // Restart activity to apply language change
                        (context as? ComponentActivity)?.recreate()
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Language,
                        contentDescription = if (isRTL) "تغيير اللغة" else "Change Language",
                        tint = LightPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                }
                
                // Logo at center
            Image(
                painter = painterResource(id = R.drawable.clutch_logo_black),
                contentDescription = "Clutch Partners Logo",
                modifier = Modifier.size(80.dp)
            )
                
                // Empty space for balance
                Spacer(modifier = Modifier.size(48.dp))
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Onboarding card
            Card(
                modifier = Modifier
                    .weight(1f)
                    .shadow(
                        elevation = 8.dp,
                        shape = RoundedCornerShape(20.dp)
                    ),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // Illustration - 1.5x size
                    Image(
                        painter = painterResource(id = pages[currentPage].imageRes),
                        contentDescription = null,
                        modifier = Modifier
                            .size(270.dp) // 1.5x size (180 * 1.5 = 270)
                            .padding(8.dp)
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = pages[currentPage].title,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = LightForeground,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = pages[currentPage].description,
                        fontSize = 15.sp,
                        color = LightMutedForeground,
                        textAlign = TextAlign.Center,
                        lineHeight = 22.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Page indicators
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                pages.forEachIndexed { index, _ ->
                    Box(
                        modifier = Modifier
                            .size(if (index == currentPage) 12.dp else 8.dp)
                            .background(
                                color = if (index == currentPage) LightPrimary else LightMutedForeground,
                                shape = RoundedCornerShape(50)
                            )
                    )
                    if (index < pages.size - 1) {
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Navigation button - changes based on current page
            Button(
                onClick = {
                    if (currentPage < pages.size - 1) {
                        currentPage++
                    } else {
                        onNavigate()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = when {
                        currentPage < pages.size - 1 -> if (isRTL) "التالي" else "Next"
                        else -> if (isRTL) "ابدأ الآن" else "Start Now"
                    },
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
fun PartnerTypeSelectorScreen(onNavigate: (String) -> Unit) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val partnerTypes = listOf(
        PartnerType("repair", if (isRTL) "مركز إصلاح" else "Repair Center", "🛠️", if (isRTL) "إصلاح السيارات" else "Auto repair services"),
        PartnerType("parts", if (isRTL) "متجر قطع غيار" else "Auto Parts Shop", "⚙️", if (isRTL) "قطع غيار السيارات" else "Auto parts and accessories"),
        PartnerType("accessories", if (isRTL) "متجر إكسسوارات" else "Accessories Shop", "🎯", if (isRTL) "إكسسوارات السيارات" else "Car accessories and modifications"),
        PartnerType("importer", if (isRTL) "مستورد/مصنع" else "Importer/Manufacturer", "🏭", if (isRTL) "استيراد وتصنيع" else "Import and manufacturing"),
        PartnerType("service", if (isRTL) "مركز خدمة" else "Service Center", "🚗", if (isRTL) "خدمات السيارات" else "Car service and maintenance")
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
                .padding(20.dp)
        ) {
            // Header with logo and title
            Box(
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = if (isRTL) "اختر نوع متجرك" else "Choose your shop type",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = LightForeground,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.align(Alignment.Center)
                )
                
                Image(
                    painter = painterResource(id = R.drawable.clutch_logo_black),
                    contentDescription = "Clutch Partners Logo",
                    modifier = Modifier
                        .size(40.dp)
                        .align(if (isRTL) Alignment.CenterEnd else Alignment.CenterStart)
                )
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Partner type cards in 2x3 layout (2 columns, 3 rows)
            LazyColumn {
                // First row - 2 cards
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        partnerTypes.take(2).forEach { partnerType ->
                            PartnerTypeCard(
                                partnerType = partnerType,
                                onClick = { onNavigate(partnerType.id) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
                
                item {
                    Spacer(modifier = Modifier.height(20.dp))
                }
                
                // Second row - 2 cards
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        partnerTypes.drop(2).take(2).forEach { partnerType ->
                            PartnerTypeCard(
                                partnerType = partnerType,
                                onClick = { onNavigate(partnerType.id) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
                
                item {
                    Spacer(modifier = Modifier.height(20.dp))
                }
                
                // Third row - 1 card centered
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        partnerTypes.drop(4).take(1).forEach { partnerType ->
                            PartnerTypeCard(
                                partnerType = partnerType,
                                onClick = { onNavigate(partnerType.id) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
                
                item {
                    Spacer(modifier = Modifier.height(32.dp))
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PartnerTypeCard(
    partnerType: PartnerType,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier
            .height(160.dp)
            .padding(12.dp)
            .shadow(
                elevation = 6.dp,
                shape = RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = partnerType.icon,
                fontSize = 36.sp
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = partnerType.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground,
                textAlign = TextAlign.Center,
                maxLines = 2,
                lineHeight = 18.sp
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = partnerType.description,
                fontSize = 12.sp,
                color = LightMutedForeground,
                textAlign = TextAlign.Center,
                maxLines = 2,
                lineHeight = 14.sp
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthSelectorScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val authOptions = listOf(
        AuthOption("signin", if (isRTL) "تسجيل الدخول" else "Sign In", if (isRTL) "لديك حساب بالفعل؟" else "Already have an account?"),
        AuthOption("signup", if (isRTL) "إنشاء حساب" else "Sign Up", if (isRTL) "إنشاء حساب جديد" else "Create new account"),
        AuthOption("request", if (isRTL) "طلب الانضمام" else "Request to Join", if (isRTL) "طلب الانضمام كشريك" else "Request to join as partner")
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Back button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = if (isRTL) Arrangement.End else Arrangement.Start
            ) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = if (isRTL) "رجوع" else "Back",
                        tint = LightPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Logo - horizontally centered
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.clutch_logo_black),
                    contentDescription = "Clutch Partners Logo",
                    modifier = Modifier.size(80.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Title and description
            Text(
                text = if (isRTL) "اختر طريقة الدخول" else "Choose your login method",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (isRTL) "اختر الطريقة المناسبة للوصول إلى حسابك" else "Choose the appropriate method to access your account",
                fontSize = 16.sp,
                color = LightMutedForeground,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(40.dp))
            
            // Auth options
            authOptions.forEach { option ->
                Card(
                    onClick = { onNavigate(option.id) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .shadow(
                            elevation = 4.dp,
                            shape = RoundedCornerShape(12.dp)
                        ),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = option.title,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = LightForeground
                            )
                            
                            Text(
                                text = option.description,
                                fontSize = 14.sp,
                                color = LightMutedForeground
                            )
                        }
                        
                        Icon(
                            imageVector = Icons.Default.ArrowForward,
                            contentDescription = null,
                            tint = LightPrimary
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AuthScreen(
    authMode: String,
    onAuthenticated: () -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
                .padding(20.dp)
        ) {
            // Header with back button and logo
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Back button
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = if (isRTL) "رجوع" else "Back",
                        tint = LightPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                }
                
                // Black logo in center
                Image(
                    painter = painterResource(id = R.drawable.clutch_logo_black),
                    contentDescription = "Clutch Partners Logo",
                    modifier = Modifier.size(40.dp)
                )
                
                // Empty space for balance
                Spacer(modifier = Modifier.size(48.dp))
            }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Title
            Text(
                text = when (authMode) {
                    "signin" -> if (isRTL) "تسجيل الدخول" else "Sign In"
                    "signup" -> if (isRTL) "إنشاء حساب" else "Sign Up"
                    "request" -> if (isRTL) "طلب الانضمام" else "Request to Join"
                    else -> if (isRTL) "المصادقة" else "Authentication"
                },
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(40.dp))
            
            // Auth form
            when (authMode) {
                "signin" -> SignInForm(onAuthenticated = onAuthenticated)
                "signup" -> SignUpForm(onAuthenticated = onAuthenticated)
                "request" -> RequestToJoinForm(onAuthenticated = onAuthenticated)
            }
        }
    }
}

@Composable
fun SignInForm(onAuthenticated: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    val authViewModel: AuthViewModel = viewModel()
    val authState by authViewModel.authState.collectAsState()
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text(if (isRTL) "البريد الإلكتروني أو رقم الهاتف" else "Email or Phone") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Next
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black,
                    focusedLabelColor = LightPrimary,
                    unfocusedLabelColor = LightMutedForeground,
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    cursorColor = LightPrimary
                ),
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text(if (isRTL) "كلمة المرور" else "Password") },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black,
                    focusedLabelColor = LightPrimary,
                    unfocusedLabelColor = LightMutedForeground,
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    cursorColor = LightPrimary
                ),
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Handle auth state
            LaunchedEffect(authState) {
                when (authState) {
                    is AuthState.Success -> {
                        onAuthenticated()
                    }
                    is AuthState.Error -> {
                        // Show error message
                    }
                    else -> {}
                }
            }
            
            Button(
                onClick = { 
                    if (email.isNotEmpty() && password.isNotEmpty()) {
                        authViewModel.signIn(email, password)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
                shape = RoundedCornerShape(12.dp),
                enabled = authState !is AuthState.Loading
            ) {
                if (authState is AuthState.Loading) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                } else {
                Text(
                    text = if (isRTL) "تسجيل الدخول" else "Sign In",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
            
            // Show error message if any
            val currentAuthState = authState
            when (currentAuthState) {
                is AuthState.Error -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = currentAuthState.message,
                        color = Color.Red,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center
                    )
                }
                else -> {}
            }
        }
    }
}

@Composable
fun SignUpForm(onAuthenticated: () -> Unit) {
    var partnerId by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var businessName by remember { mutableStateOf("") }
    var ownerName by remember { mutableStateOf("") }
    var street by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }
    var zipCode by remember { mutableStateOf("") }
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    val authViewModel: AuthViewModel = viewModel()
    val authState by authViewModel.authState.collectAsState()
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedTextField(
                value = partnerId,
                onValueChange = { partnerId = it },
                label = { Text(if (isRTL) "معرف الشريك" else "Partner ID") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Text,
                    imeAction = ImeAction.Next
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black,
                    focusedLabelColor = LightPrimary,
                    unfocusedLabelColor = LightMutedForeground,
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    cursorColor = LightPrimary
                ),
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text(if (isRTL) "البريد الإلكتروني" else "Email") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Next
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black,
                    focusedLabelColor = LightPrimary,
                    unfocusedLabelColor = LightMutedForeground,
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    cursorColor = LightPrimary
                ),
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text(if (isRTL) "كلمة المرور" else "Password") },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black,
                    focusedLabelColor = LightPrimary,
                    unfocusedLabelColor = LightMutedForeground,
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    cursorColor = LightPrimary
                ),
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Handle auth state
            LaunchedEffect(authState) {
                when (authState) {
                    is AuthState.Success -> {
                        onAuthenticated()
                    }
                    is AuthState.Error -> {
                        // Show error message
                    }
                    else -> {}
                }
            }
            
            Button(
                onClick = { 
                    if (partnerId.isNotEmpty() && email.isNotEmpty() && phone.isNotEmpty() && 
                        password.isNotEmpty() && businessName.isNotEmpty() && ownerName.isNotEmpty() &&
                        street.isNotEmpty() && city.isNotEmpty() && state.isNotEmpty() && zipCode.isNotEmpty()) {
                        // Create BusinessAddress from form data
                        val businessAddress = com.clutch.partners.data.api.BusinessAddress(
                            street = street,
                            city = city,
                            state = state,
                            zipCode = zipCode
                        )
                        authViewModel.signUp(
                            partnerId, 
                            email, 
                            phone,
                            password,
                            businessName,
                            ownerName,
                            "repair_center", // Default partner type
                            businessAddress
                        )
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
                shape = RoundedCornerShape(12.dp),
                enabled = authState !is AuthState.Loading
            ) {
                if (authState is AuthState.Loading) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                } else {
                Text(
                    text = if (isRTL) "إنشاء حساب" else "Sign Up",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
            
            // Show error message if any
            val currentAuthState = authState
            when (currentAuthState) {
                is AuthState.Error -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = currentAuthState.message,
                        color = Color.Red,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center
                    )
                }
                else -> {}
            }
        }
    }
}

@Composable
fun RequestToJoinForm(onAuthenticated: () -> Unit) {
    var businessName by remember { mutableStateOf("") }
    var ownerName by remember { mutableStateOf("") }
    var emailOrPhone by remember { mutableStateOf("") }
    var businessAddress by remember { mutableStateOf("") }
    var partnerType by remember { mutableStateOf("") }
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    val authViewModel: AuthViewModel = viewModel()
    val authState by authViewModel.authState.collectAsState()
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedTextField(
                value = businessName,
                onValueChange = { businessName = it },
                label = { Text(if (isRTL) "اسم المتجر" else "Business Name") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black,
                    focusedLabelColor = LightPrimary,
                    unfocusedLabelColor = LightMutedForeground,
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    cursorColor = LightPrimary
                ),
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = ownerName,
                onValueChange = { ownerName = it },
                label = { Text(if (isRTL) "اسم المالك" else "Owner Name") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black,
                    focusedLabelColor = LightPrimary,
                    unfocusedLabelColor = LightMutedForeground,
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    cursorColor = LightPrimary
                ),
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = emailOrPhone,
                onValueChange = { 
                    // Phone validation: 11 digits starting with "01"
                    if (it.length <= 11 && (it.isEmpty() || it.startsWith("01") && it.all { char -> char.isDigit() })) {
                        emailOrPhone = it
                    }
                },
                label = { Text(if (isRTL) "رقم الهاتف" else "Phone Number") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black,
                    focusedLabelColor = LightPrimary,
                    unfocusedLabelColor = LightMutedForeground,
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    cursorColor = LightPrimary
                ),
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = businessAddress,
                onValueChange = { businessAddress = it },
                label = { Text(if (isRTL) "عنوان المتجر" else "Business Address") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black,
                    focusedLabelColor = LightPrimary,
                    unfocusedLabelColor = LightMutedForeground,
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    cursorColor = LightPrimary
                ),
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = partnerType,
                onValueChange = { partnerType = it },
                label = { Text(if (isRTL) "نوع المتجر" else "Shop Type") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black,
                    focusedLabelColor = LightPrimary,
                    unfocusedLabelColor = LightMutedForeground,
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    cursorColor = LightPrimary
                ),
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Handle auth state
            LaunchedEffect(authState) {
                when (authState) {
                    is AuthState.Success -> {
                        onAuthenticated()
                    }
                    is AuthState.Error -> {
                        // Show error message
                    }
                    else -> {}
                }
            }
            
            Button(
                onClick = { 
                    if (businessName.isNotEmpty() && ownerName.isNotEmpty() && emailOrPhone.isNotEmpty() && businessAddress.isNotEmpty() && partnerType.isNotEmpty()) {
                        authViewModel.requestToJoin(businessName, ownerName, emailOrPhone, emailOrPhone, businessAddress, partnerType)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
                shape = RoundedCornerShape(12.dp),
                enabled = authState !is AuthState.Loading
            ) {
                if (authState is AuthState.Loading) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                } else {
                Text(
                    text = if (isRTL) "إرسال الطلب" else "Submit Request",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
            
            // Show error message if any
            val currentAuthState = authState
            when (currentAuthState) {
                is AuthState.Error -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = currentAuthState.message,
                        color = Color.Red,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center
                    )
                }
                else -> {}
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                Text(
                            text = if (isRTL) "مرحباً، أحمد" else "Welcome, Ahmed",
                            fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = LightPrimary
                    ),
                    actions = {
                        IconButton(onClick = { 
                            // TODO: Implement notification screen navigation
                            // For now, show notification count or recent notifications
                        }) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = if (isRTL) "الإشعارات" else "Notifications",
                                tint = Color.White
                            )
                        }
                    }
                )
            },
            bottomBar = {
                BottomNavigationBar(
                    selectedTab = selectedTab,
                    onTabSelected = { selectedTab = it },
                    isRTL = isRTL
                )
            }
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(LightBackground)
                    .padding(paddingValues)
            ) {
            when (selectedTab) {
                0 -> OrdersTab()
                1 -> PaymentsTab()
                2 -> BusinessDashboardTab()
                3 -> KYCTab()
                4 -> SupportTab()
                5 -> SettingsTab()
                }
            }
        }
    }
}

@Composable
fun BottomNavigationBar(
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
    isRTL: Boolean
) {
    val tabs = listOf(
        BottomNavItem(
            title = if (isRTL) "الطلبات" else "Orders",
            icon = Icons.Default.List,
            selectedIcon = Icons.Default.List
        ),
        BottomNavItem(
            title = if (isRTL) "المدفوعات" else "Payments",
            icon = Icons.Default.Payment,
            selectedIcon = Icons.Default.Payment
        ),
        BottomNavItem(
            title = if (isRTL) "لوحة التحكم" else "Dashboard",
            icon = Icons.Default.Dashboard,
            selectedIcon = Icons.Default.Dashboard
        ),
        BottomNavItem(
            title = if (isRTL) "التحقق" else "KYC",
            icon = Icons.Outlined.VerifiedUser,
            selectedIcon = Icons.Outlined.VerifiedUser
        ),
        BottomNavItem(
            title = if (isRTL) "الدعم" else "Support",
            icon = Icons.Outlined.Support,
            selectedIcon = Icons.Outlined.Support
        ),
        BottomNavItem(
            title = if (isRTL) "الإعدادات" else "Settings",
            icon = Icons.Default.Settings,
            selectedIcon = Icons.Default.Settings
        )
    )
    
    NavigationBar(
        containerColor = Color.White,
        contentColor = LightPrimary
    ) {
        tabs.forEachIndexed { index, item ->
            NavigationBarItem(
                selected = selectedTab == index,
                onClick = { onTabSelected(index) },
                icon = {
                    Icon(
                        imageVector = if (selectedTab == index) item.selectedIcon else item.icon,
                        contentDescription = item.title,
                        tint = if (selectedTab == index) LightPrimary else LightMutedForeground
                    )
                },
                label = {
                    Text(
                        text = item.title,
                        fontSize = 12.sp,
                        color = if (selectedTab == index) LightPrimary else LightMutedForeground
                    )
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersTab() {
    var selectedFilter by remember { mutableStateOf(0) }
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    val ordersViewModel: OrdersViewModel = viewModel()
    val ordersState by ordersViewModel.ordersState.collectAsState()
    
    // Load orders when component is first created
    LaunchedEffect(Unit) {
        ordersViewModel.loadOrders()
    }
    
    // Convert API orders to MockOrder for display (temporary until UI is updated)
    val currentOrdersState = ordersState
    val orders = when (currentOrdersState) {
        is OrdersState.Success -> currentOrdersState.orders.map { order ->
            MockOrder(
                id = order.id,
                service = order.service,
                customer = order.customer.name,
                date = order.createdAt,
                status = order.status,
                price = order.price,
                time = order.time
            )
        }
        else -> listOf(
        MockOrder("1", "Oil Change", "Ahmed Ali", "2024-01-15", "Pending", "EGP 150", "10:30 AM"),
        MockOrder("2", "Brake Repair", "Sara Mohamed", "2024-01-14", "Paid", "EGP 450", "2:15 PM"),
        MockOrder("3", "Tire Replacement", "Omar Hassan", "2024-01-13", "Rejected", "EGP 800", "9:45 AM"),
        MockOrder("4", "Engine Check", "Fatma Ibrahim", "2024-01-12", "Paid", "EGP 200", "11:20 AM"),
        MockOrder("5", "AC Repair", "Mohamed Ali", "2024-01-11", "Pending", "EGP 300", "3:30 PM")
        )
    }
    
    val filters = listOf(
        if (isRTL) "الكل" else "All",
        if (isRTL) "معلق" else "Pending",
        if (isRTL) "مدفوع" else "Paid",
        if (isRTL) "مرفوض" else "Rejected"
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
        ) {
            // Header with stats
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .shadow(
                        elevation = 4.dp,
                        shape = RoundedCornerShape(16.dp)
                    ),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp)
                ) {
                    Text(
                        text = if (isRTL) "إحصائيات اليوم" else "Today's Stats",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = LightForeground
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        StatItem(
                            title = if (isRTL) "الطلبات" else "Orders",
                            value = "12",
                            color = LightPrimary
                        )
                        StatItem(
                            title = if (isRTL) "المكتملة" else "Completed",
                            value = "8",
                            color = Color(0xFF4CAF50)
                        )
                        StatItem(
                            title = if (isRTL) "الإيراد" else "Revenue",
                            value = "EGP 2,400",
                            color = Color(0xFFFF9800)
                        )
                    }
                }
            }
            
            // Filter chips
            LazyRow(
                modifier = Modifier.padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filters.size) { index ->
                    FilterChip(
                        selected = selectedFilter == index,
                        onClick = { selectedFilter = index },
                        label = {
                            Text(
                                text = filters[index],
                                fontSize = 14.sp,
                                fontWeight = if (selectedFilter == index) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = LightPrimary,
                            selectedLabelColor = Color.White,
                            containerColor = Color.White
                        )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Orders list
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                    .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(orders) { order ->
                                EnhancedOrderCard(
                                    order = order,
                                    onClick = { 
                                        // Navigate to order details
                                        // In a real app, this would open OrderDetailScreen
                                    }
                                )
                            }
            }
        }
    }
}

@Composable
fun PaymentsTab() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
        ) {
            // Weekly income card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .shadow(
                        elevation = 6.dp,
                        shape = RoundedCornerShape(20.dp)
                    ),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = LightPrimary
                )
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                        text = if (isRTL) "إيراد هذا الأسبوع" else "This Week's Income",
                        fontSize = 16.sp,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "EGP 8,450",
                        fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                        color = Color.White
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                                text = if (isRTL) "الطلبات" else "Orders",
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.8f)
                            )
                            Text(
                                text = "24",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = if (isRTL) "المتوسط" else "Average",
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.8f)
                            )
                            Text(
                                text = "EGP 352",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
            
            // Payout countdown card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .shadow(
                        elevation = 4.dp,
                        shape = RoundedCornerShape(16.dp)
                    ),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        tint = Color(0xFFFF9800),
                        modifier = Modifier.size(32.dp)
                    )
                    
                    Spacer(modifier = Modifier.width(16.dp))
                    
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (isRTL) "الدفعة القادمة" else "Next Payout",
                fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = LightForeground
                        )
                        Text(
                            text = if (isRTL) "متبقي 3 أيام" else "3 days remaining",
                            fontSize = 14.sp,
                            color = LightMutedForeground
                        )
                    }
                    
                    Text(
                        text = "EGP 8,450",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFF9800)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Payment history
            Text(
                text = if (isRTL) "سجل المدفوعات" else "Payment History",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(getPaymentHistory()) { payment ->
                    PaymentHistoryCard(payment = payment)
                }
            }
        }
    }
}

@Composable
fun BusinessDashboardTab() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
        ) {
            // Revenue overview card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                .padding(16.dp)
                    .shadow(
                        elevation = 6.dp,
                        shape = RoundedCornerShape(20.dp)
                    ),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF2E7D32)
                )
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                        text = if (isRTL) "إجمالي الإيرادات" else "Total Revenue",
                        fontSize = 16.sp,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "EGP 45,200",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    Text(
                        text = "+12% من الشهر الماضي",
                        fontSize = 14.sp,
                        color = Color(0xFF81C784)
                    )
                }
            }
            
            // Quick stats grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    EnhancedStatCard(
                        title = if (isRTL) "طلبات كلتش" else "Clutch Orders",
                    value = "156",
                        subtitle = if (isRTL) "هذا الشهر" else "This month",
                        icon = Icons.Default.ShoppingCart,
                        color = LightPrimary
                    )
                }
                
                item {
                    EnhancedStatCard(
                        title = if (isRTL) "مبيعات المتجر" else "Store Sales",
                        value = "89",
                        subtitle = if (isRTL) "هذا الشهر" else "This month",
                        icon = Icons.Default.Store,
                        color = Color(0xFFFF9800)
                    )
                }
                
                item {
                    EnhancedStatCard(
                        title = if (isRTL) "العملاء الجدد" else "New Customers",
                        value = "23",
                        subtitle = if (isRTL) "هذا الأسبوع" else "This week",
                        icon = Icons.Default.PersonAdd,
                        color = Color(0xFF4CAF50)
                    )
                }
                
                item {
                    EnhancedStatCard(
                    title = if (isRTL) "التقييم" else "Rating",
                    value = "4.8",
                        subtitle = if (isRTL) "من 5 نجوم" else "out of 5",
                        icon = Icons.Default.Star,
                        color = Color(0xFFFFC107)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Recent activity
            Text(
                text = if (isRTL) "النشاط الأخير" else "Recent Activity",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(getRecentActivity()) { activity ->
                    ActivityCard(activity = activity)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KYCTab() {
    var kycStatus by remember { mutableStateOf("pending") }
    var documents by remember { mutableStateOf<List<Document>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        isLoading = true
        // Mock KYC data - in real app, this would fetch from API
        documents = listOf(
            Document("VAT Certificate", "pending", "2024-01-15"),
            Document("Trade License", "approved", "2024-01-14"),
            Document("Owner ID", "pending", "2024-01-15")
        )
        kycStatus = "pending"
        isLoading = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "التحقق من الهوية",
                style = MaterialTheme.typography.headlineSmall,
                color = LightOnBackground
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // KYC Status Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "حالة التحقق",
                        style = MaterialTheme.typography.titleMedium,
                        color = LightOnBackground
                    )
                    Box(
                        modifier = Modifier
                            .background(
                                when (kycStatus) {
                                    "approved" -> LightSuccess
                                    "rejected" -> LightRejected
                                    else -> LightAmber
                                },
                                RoundedCornerShape(12.dp)
                            )
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = when (kycStatus) {
                                "approved" -> "موافق عليه"
                                "rejected" -> "مرفوض"
                                else -> "في الانتظار"
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.White
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = when (kycStatus) {
                        "approved" -> "تم التحقق من جميع المستندات بنجاح"
                        "rejected" -> "يرجى مراجعة المستندات المرفوضة وإعادة رفعها"
                        else -> "جاري مراجعة المستندات من قبل فريق الدعم"
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = LightOnBackground
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Documents List
        Text(
            text = "المستندات المطلوبة",
            style = MaterialTheme.typography.titleMedium,
            color = LightOnBackground
        )

        Spacer(modifier = Modifier.height(8.dp))

        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = LightPrimary)
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(documents) { document ->
                    DocumentCard(document = document)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Upload Button
        Button(
            onClick = { /* TODO: Implement document upload */ },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = LightPrimary)
        ) {
            Icon(
                imageVector = Icons.Default.Upload,
                contentDescription = "رفع مستند",
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("رفع مستند جديد")
        }
    }
}

@Composable
fun DocumentCard(document: Document) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = document.name,
                    style = MaterialTheme.typography.titleSmall,
                    color = LightOnBackground
                )
                Text(
                    text = "تاريخ الرفع: ${document.uploadDate}",
                    style = MaterialTheme.typography.bodySmall,
                    color = LightOnBackground.copy(alpha = 0.7f)
                )
            }
            
            Box(
                modifier = Modifier
                    .background(
                        when (document.status) {
                            "approved" -> LightSuccess
                            "rejected" -> LightRejected
                            else -> LightAmber
                        },
                        RoundedCornerShape(8.dp)
                    )
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = when (document.status) {
                        "approved" -> "موافق عليه"
                        "rejected" -> "مرفوض"
                        else -> "في الانتظار"
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
fun SupportTab() {
    var supportTickets by remember { mutableStateOf<List<SupportTicket>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        isLoading = true
        // Mock support tickets - in real app, this would fetch from API
        supportTickets = listOf(
            SupportTicket("TKT001", "مشكلة في تسجيل الدخول", "open", "2024-01-15"),
            SupportTicket("TKT002", "استفسار حول الدفع", "resolved", "2024-01-14"),
            SupportTicket("TKT003", "طلب ميزة جديدة", "in_progress", "2024-01-13")
        )
        isLoading = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "الدعم الفني",
                style = MaterialTheme.typography.headlineSmall,
                color = LightOnBackground
            )
            
            Button(
                onClick = { /* TODO: Implement new ticket */ },
                colors = ButtonDefaults.buttonColors(containerColor = LightPrimary)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "تذكرة جديدة",
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("تذكرة جديدة")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Quick Actions
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "الإجراءات السريعة",
                    style = MaterialTheme.typography.titleMedium,
                    color = LightOnBackground
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    QuickActionButton(
                        icon = Icons.Default.Phone,
                        label = "اتصال",
                        onClick = { /* TODO: Implement call */ }
                    )
                    QuickActionButton(
                        icon = Icons.Default.Email,
                        label = "بريد إلكتروني",
                        onClick = { /* TODO: Implement email */ }
                    )
                    QuickActionButton(
                        icon = Icons.Default.Chat,
                        label = "محادثة",
                        onClick = { /* TODO: Implement chat */ }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Support Tickets
        Text(
            text = "تذاكر الدعم",
            style = MaterialTheme.typography.titleMedium,
            color = LightOnBackground
        )

        Spacer(modifier = Modifier.height(8.dp))

        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = LightPrimary)
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(supportTickets) { ticket ->
                    SupportTicketCard(ticket = ticket)
                }
            }
        }
    }
}

@Composable
fun QuickActionButton(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        IconButton(
            onClick = onClick,
            modifier = Modifier
                .size(48.dp)
                .background(LightPrimary, CircleShape)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = Color.White,
                modifier = Modifier.size(24.dp)
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = LightOnBackground
        )
    }
}

@Composable
fun SupportTicketCard(ticket: SupportTicket) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = ticket.subject,
                    style = MaterialTheme.typography.titleSmall,
                    color = LightOnBackground
                )
                
                Box(
                    modifier = Modifier
                        .background(
                            when (ticket.status) {
                                "open" -> LightAmber
                                "in_progress" -> LightPrimary
                                "resolved" -> LightSuccess
                                else -> LightRejected
                            },
                            RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = when (ticket.status) {
                            "open" -> "مفتوح"
                            "in_progress" -> "قيد المعالجة"
                            "resolved" -> "محلول"
                            else -> "مغلق"
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = "رقم التذكرة: ${ticket.id}",
                style = MaterialTheme.typography.bodySmall,
                color = LightOnBackground.copy(alpha = 0.7f)
            )
            
            Text(
                text = "تاريخ الإنشاء: ${ticket.createdDate}",
                style = MaterialTheme.typography.bodySmall,
                color = LightOnBackground.copy(alpha = 0.7f)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsTab() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val settingsOptions = listOf(
        SettingsOption(
            if (isRTL) "معلومات المتجر" else "Store Information",
            if (isRTL) "إدارة معلومات متجرك" else "Manage your store information",
            Icons.Default.Store
        ),
        SettingsOption(
            if (isRTL) "الإشعارات" else "Notifications",
            if (isRTL) "إعدادات الإشعارات" else "Notification settings",
            Icons.Default.Notifications
        ),
        SettingsOption(
            if (isRTL) "اللغة" else "Language",
            if (isRTL) "تغيير لغة التطبيق" else "Change app language",
            Icons.Default.Language
        ),
        SettingsOption(
            if (isRTL) "المظهر" else "Theme",
            if (isRTL) "تغيير مظهر التطبيق" else "Change app theme",
            Icons.Default.Palette
        ),
        SettingsOption(
            if (isRTL) "المساعدة" else "Help",
            if (isRTL) "الحصول على المساعدة" else "Get help",
            Icons.Default.Help
        ),
        SettingsOption(
            if (isRTL) "تسجيل الخروج" else "Logout",
            if (isRTL) "تسجيل الخروج من التطبيق" else "Logout from the app",
            Icons.Default.ExitToApp
        )
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(settingsOptions) { option ->
                Card(
                    onClick = { 
                        when (option.title) {
                            if (isRTL) "معلومات المتجر" else "Store Information" -> {
                                // Navigate to store information screen
                            }
                            if (isRTL) "الإشعارات" else "Notifications" -> {
                                // Navigate to notification settings
                            }
                            if (isRTL) "اللغة" else "Language" -> {
                                // Toggle language
                                LanguageManager.toggleLanguage(context)
                                (context as? ComponentActivity)?.recreate()
                            }
                            if (isRTL) "المظهر" else "Theme" -> {
                                // Toggle theme
                                ThemeManager.toggleTheme(context)
                                (context as? ComponentActivity)?.recreate()
                            }
                            if (isRTL) "المساعدة" else "Help" -> {
                                // Navigate to help screen
                            }
                            if (isRTL) "تسجيل الخروج" else "Logout" -> {
                                // Handle logout - clear session and navigate to auth
                                // Clear user session - in real app would use proper session management
                                val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
                                prefs.edit().remove("auth_token").remove("user_data").apply()
                                // Navigate back to auth screen
                                // In a real app, this would use proper navigation
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(
                            elevation = 2.dp,
                            shape = RoundedCornerShape(8.dp)
                        ),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = option.icon,
                            contentDescription = null,
                            tint = LightPrimary,
                            modifier = Modifier.size(24.dp)
                        )
                        
                        Spacer(modifier = Modifier.width(16.dp))
                        
                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = option.title,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = LightForeground
                            )
                            
                            Text(
                                text = option.description,
                                fontSize = 14.sp,
                                color = LightMutedForeground
                            )
                        }
                        
                        Icon(
                            imageVector = Icons.Default.ArrowForward,
                            contentDescription = null,
                            tint = LightMutedForeground
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun OrderCard(order: MockOrder) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val statusColor = when (order.status) {
        "Pending" -> Color(0xFFFF9800)
        "Paid" -> Color(0xFF4CAF50)
        "Rejected" -> Color(0xFFF44336)
        else -> LightMutedForeground
    }
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(
                    elevation = 2.dp,
                    shape = RoundedCornerShape(8.dp)
                ),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = order.service,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = LightForeground
                    )
                    
                    Box(
                        modifier = Modifier
                            .background(
                                color = statusColor,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .padding(horizontal = 12.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = order.status,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "${if (isRTL) "العميل:" else "Customer:"} ${order.customer}",
                    fontSize = 14.sp,
                    color = LightMutedForeground
                )
                
                Text(
                    text = "${if (isRTL) "التاريخ:" else "Date:"} ${order.date}",
                    fontSize = 14.sp,
                    color = LightMutedForeground
                )
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp)
            ),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = LightPrimary
            )
            
            Text(
                text = title,
                fontSize = 14.sp,
                color = LightMutedForeground,
                textAlign = TextAlign.Center
            )
        }
    }
}

// Enhanced Components
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EnhancedOrderCard(order: MockOrder, onClick: () -> Unit = {}) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val statusColor = when (order.status) {
        "Pending" -> Color(0xFFFF9800)
        "Paid" -> Color(0xFF4CAF50)
        "Rejected" -> Color(0xFFF44336)
        else -> LightMutedForeground
    }
    
    val statusIcon = when (order.status) {
        "Pending" -> Icons.Default.Schedule
        "Paid" -> Icons.Default.CheckCircle
        "Rejected" -> Icons.Default.Cancel
        else -> Icons.Default.Info
    }
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Card(
            onClick = onClick,
            modifier = Modifier
                .fillMaxWidth()
                .shadow(
                    elevation = 3.dp,
                    shape = RoundedCornerShape(12.dp)
                ),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = statusIcon,
                            contentDescription = null,
                            tint = statusColor,
                            modifier = Modifier.size(20.dp)
                        )
                        
                        Spacer(modifier = Modifier.width(8.dp))
                        
                        Text(
                            text = order.service,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = LightForeground
                        )
                    }
                    
                    Box(
                        modifier = Modifier
                            .background(
                                color = statusColor,
                                shape = RoundedCornerShape(8.dp)
                            )
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = order.status,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "${if (isRTL) "العميل:" else "Customer:"} ${order.customer}",
                            fontSize = 14.sp,
                            color = LightMutedForeground
                        )
                        Text(
                            text = "${if (isRTL) "التاريخ:" else "Date:"} ${order.date}",
                            fontSize = 14.sp,
                            color = LightMutedForeground
                        )
                    }
                    
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = order.price,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = LightPrimary
                        )
                        Text(
                            text = order.time,
                            fontSize = 12.sp,
                            color = LightMutedForeground
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StatItem(
    title: String,
    value: String,
    color: Color
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = title,
            fontSize = 12.sp,
            color = LightMutedForeground
        )
    }
}

@Composable
fun PaymentHistoryCard(payment: PaymentHistory) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(
                    elevation = 2.dp,
                    shape = RoundedCornerShape(8.dp)
                ),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Payment,
                    contentDescription = null,
                    tint = Color(0xFF4CAF50),
                    modifier = Modifier.size(24.dp)
                )
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = payment.period,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = LightForeground
                    )
                    Text(
                        text = payment.date,
                        fontSize = 12.sp,
                        color = LightMutedForeground
                    )
                }
                
                Text(
                    text = payment.amount,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF4CAF50)
                )
            }
        }
    }
}

@Composable
fun EnhancedStatCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    color: Color
) {
    Card(
        modifier = Modifier
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(12.dp)
            ),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(32.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = value,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
            
            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground,
                textAlign = TextAlign.Center
            )
            
            Text(
                text = subtitle,
                fontSize = 10.sp,
                color = LightMutedForeground,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun ActivityCard(activity: RecentActivity) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(
                    elevation = 2.dp,
                    shape = RoundedCornerShape(8.dp)
                ),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = activity.icon,
                    contentDescription = null,
                    tint = activity.color,
                    modifier = Modifier.size(20.dp)
                )
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = activity.title,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = LightForeground
                    )
                    Text(
                        text = activity.description,
                        fontSize = 12.sp,
                        color = LightMutedForeground
                    )
                }
                
                Text(
                    text = activity.time,
                    fontSize = 10.sp,
                    color = LightMutedForeground
                )
            }
        }
    }
}

// Helper functions
fun getPaymentHistory(): List<PaymentHistory> {
    return listOf(
        PaymentHistory("Week 1", "Jan 1-7, 2024", "EGP 6,200"),
        PaymentHistory("Week 2", "Jan 8-14, 2024", "EGP 7,800"),
        PaymentHistory("Week 3", "Jan 15-21, 2024", "EGP 5,900"),
        PaymentHistory("Week 4", "Jan 22-28, 2024", "EGP 8,100")
    )
}

fun getRecentActivity(): List<RecentActivity> {
    return listOf(
        RecentActivity(
            "New Order",
            "Oil change service requested",
            "2 min ago",
            Icons.Default.ShoppingCart,
            LightPrimary
        ),
        RecentActivity(
            "Payment Received",
            "EGP 450 payment processed",
            "15 min ago",
            Icons.Default.Payment,
            Color(0xFF4CAF50)
        ),
        RecentActivity(
            "Store Sale",
            "Brake pads sold in store",
            "1 hour ago",
            Icons.Default.Store,
            Color(0xFFFF9800)
        ),
        RecentActivity(
            "Customer Review",
            "5-star rating received",
            "2 hours ago",
            Icons.Default.Star,
            Color(0xFFFFC107)
        )
    )
}

// Data classes
data class OnboardingPage(
    val imageRes: Int,
    val title: String,
    val description: String
)

data class PartnerType(
    val id: String,
    val title: String,
    val icon: String,
    val description: String
)

data class AuthOption(
    val id: String,
    val title: String,
    val description: String
)

data class MockOrder(
    val id: String,
    val service: String,
    val customer: String,
    val date: String,
    val status: String,
    val price: String,
    val time: String
)

data class SettingsOption(
    val title: String,
    val description: String,
    val icon: ImageVector
)

data class BottomNavItem(
    val title: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector
)

data class PaymentHistory(
    val period: String,
    val date: String,
    val amount: String
)

data class Document(
    val name: String,
    val status: String,
    val uploadDate: String
)

data class SupportTicket(
    val id: String,
    val subject: String,
    val status: String,
    val createdDate: String
)

data class RecentActivity(
    val title: String,
    val description: String,
    val time: String,
    val icon: ImageVector,
    val color: Color
)
