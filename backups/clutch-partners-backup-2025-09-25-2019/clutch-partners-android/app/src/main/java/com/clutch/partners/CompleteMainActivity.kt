package com.clutch.partners

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@AndroidEntryPoint
class CompleteMainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val context = this@CompleteMainActivity
        val isDarkTheme = ThemeManager.isSystemDarkTheme(context)
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
    val authViewModel: AuthViewModel = viewModel()
    
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
            partnerType = selectedPartnerType,
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
    partnerType: String,
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
    var emailOrPhone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
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
                onValueChange = { emailOrPhone = it },
                label = { Text(if (isRTL) "البريد الإلكتروني أو رقم الهاتف" else "Email or Phone") },
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
            
            Button(
                onClick = onAuthenticated,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = if (isRTL) "إنشاء حساب" else "Sign Up",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
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
            
            Button(
                onClick = onAuthenticated,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = if (isRTL) "إرسال الطلب" else "Submit Request",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
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
    
    val tabs = listOf(
        if (isRTL) "الطلبات" else "Orders",
        if (isRTL) "المدفوعات" else "Payments",
        if (isRTL) "لوحة التحكم" else "Dashboard",
        if (isRTL) "الإعدادات" else "Settings"
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
        ) {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(LightPrimary)
                    .padding(20.dp)
            ) {
                Text(
                    text = if (isRTL) "لوحة تحكم الشريك" else "Partner Dashboard",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
            
            // Tabs
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.White,
                contentColor = LightPrimary
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }
            
            // Tab content
            when (selectedTab) {
                0 -> OrdersTab()
                1 -> PaymentsTab()
                2 -> BusinessDashboardTab()
                3 -> SettingsTab()
            }
        }
    }
}

@Composable
fun OrdersTab() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val orders = listOf(
        MockOrder("1", "Oil Change", "Ahmed Ali", "2024-01-15", "Pending"),
        MockOrder("2", "Brake Repair", "Sara Mohamed", "2024-01-14", "Paid"),
        MockOrder("3", "Tire Replacement", "Omar Hassan", "2024-01-13", "Rejected")
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(orders) { order ->
                OrderCard(order = order)
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
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isRTL) "المدفوعات" else "Payments",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = if (isRTL) "سيتم إضافة محتوى المدفوعات قريباً" else "Payments content will be added soon",
                fontSize = 16.sp,
                color = LightMutedForeground,
                textAlign = TextAlign.Center
            )
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
                .padding(16.dp)
        ) {
            Text(
                text = if (isRTL) "لوحة التحكم التجارية" else "Business Dashboard",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Stats row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StatCard(
                    title = if (isRTL) "الطلبات" else "Orders",
                    value = "24",
                    modifier = Modifier.weight(1f)
                )
                
                Spacer(modifier = Modifier.width(16.dp))
                
                StatCard(
                    title = if (isRTL) "الإيرادات" else "Revenue",
                    value = "EGP 12,500",
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StatCard(
                    title = if (isRTL) "العملاء" else "Customers",
                    value = "156",
                    modifier = Modifier.weight(1f)
                )
                
                Spacer(modifier = Modifier.width(16.dp))
                
                StatCard(
                    title = if (isRTL) "التقييم" else "Rating",
                    value = "4.8",
                    modifier = Modifier.weight(1f)
                )
            }
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
                    onClick = { /* Handle settings option click */ },
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
    val status: String
)

data class SettingsOption(
    val title: String,
    val description: String,
    val icon: ImageVector
)
