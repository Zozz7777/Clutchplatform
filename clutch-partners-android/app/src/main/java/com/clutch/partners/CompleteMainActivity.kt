package com.clutch.partners

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.draw.shadow
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.clutch.partners.ui.theme.ClutchPartnersTheme
import com.clutch.partners.ui.theme.*
import com.clutch.partners.ui.viewmodel.AuthViewModel
import com.clutch.partners.ui.viewmodel.AuthState
import kotlinx.coroutines.delay
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.LayoutDirection
import com.clutch.partners.utils.LanguageManager
import com.clutch.partners.utils.ThemeManager
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.center
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class CompleteMainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val isDarkTheme = ThemeManager.isSystemDarkTheme(this@CompleteMainActivity)
            ClutchPartnersTheme(darkTheme = isDarkTheme) {
                val layoutDirection = LanguageManager.getLayoutDirection(this@CompleteMainActivity)
                CompositionLocalProvider(
                    LocalLayoutDirection provides layoutDirection
                ) {
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
    var authMode by remember { mutableStateOf("signin") }
    
    when (currentScreen) {
        "splash" -> SplashScreen(
            onNavigate = { currentScreen = "onboarding" }
        )
        "onboarding" -> OnboardingScreen(
            onNavigate = { currentScreen = "partner_selector" }
        )
        "partner_selector" -> PartnerTypeSelectorScreen(
            onPartnerSelected = { type ->
                selectedPartnerType = type
                currentScreen = "auth_selector"
        }
        )
        "auth_selector" -> AuthSelectorScreen(
            onAuthModeSelected = { mode ->
                authMode = mode
                currentScreen = "auth"
            },
            onBack = { currentScreen = "partner_selector" }
        )
        "auth" -> AuthScreen(
            authMode = authMode,
            partnerType = selectedPartnerType,
            onAuthenticated = { currentScreen = "dashboard" },
            onBack = { currentScreen = "auth_selector" }
        )
        "dashboard" -> DashboardScreen()
    }
}

@Composable
fun SplashScreen(onNavigate: () -> Unit) {
    val context = LocalContext.current
    val isDarkTheme = ThemeManager.isSystemDarkTheme(context)
    
    LaunchedEffect(Unit) {
        delay(3000)
        onNavigate()
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SplashBackground),
        contentAlignment = Alignment.Center
    ) {
        // Large Rotor with Logo in the center - matching the design exactly
        Box(
            contentAlignment = Alignment.Center
        ) {
            // Large spinning rotor (1.5x larger)
            AnimatedRotor(
                modifier = Modifier.size(420.dp)
            )
            
            // Logo in the center of the rotor (3x larger) - white for dark theme, black for light theme
            Image(
                painter = painterResource(
                    id = if (isDarkTheme) R.drawable.clutch_logo_white else R.drawable.clutch_logo_black
                ),
                contentDescription = "Clutch Partners Logo",
                modifier = Modifier.size(180.dp)
            )
    }
    }
}

@Composable
fun AnimatedRotor(
    modifier: Modifier = Modifier
) {
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
        modifier = modifier
            .graphicsLayer {
                rotationZ = rotation
        }
    )
}

@Composable
fun LoadingRotor(
    modifier: Modifier = Modifier,
    color: Color = Color.White.copy(alpha = 0.8f)
) {
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
        modifier = modifier
            .graphicsLayer {
                rotationZ = rotation
        }
    )
}

@Composable
fun OnboardingScreen(onNavigate: () -> Unit) {
    var currentPage by remember { mutableStateOf(0) }
    
    val pages = listOf(
        OnboardingPage(
            imageRes = R.drawable.onboarding_manage_store,
            title = "إدارة متجرك من هاتفك",
            description = "يمكنك الآن إدارة جميع عمليات متجرك بسهولة من خلال تطبيق شركاء كلاتش"
        ),
        OnboardingPage(
            imageRes = R.drawable.onboarding_receive_orders,
            title = "استقبال طلبات كلاتش",
            description = "احصل على طلبات العملاء ومواعيد الصيانة مباشرة من منصة كلاتش"
        ),
        OnboardingPage(
            imageRes = R.drawable.onboarding_track_earnings,
            title = "تتبع الإيرادات والمدفوعات",
            description = "راقب إيراداتك الأسبوعية ومواعيد استلام المدفوعات بسهولة"
        )
    )
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(40.dp))
        
        // Logo - Big and Centered (like AuthSelectorScreen)
        Image(
            painter = painterResource(id = R.drawable.clutch_logo_black),
            contentDescription = "Clutch Partners Logo",
            modifier = Modifier.size(80.dp)
        )
        
        Spacer(modifier = Modifier.height(40.dp))
        
        // Page Content with Swipe Support
        val page = pages[currentPage]
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .shadow(
                    elevation = 8.dp,
                    shape = RoundedCornerShape(20.dp)
                )
                        .pointerInput(Unit) {
                            detectDragGestures { _, dragAmount ->
                                // RTL swipe: swipe left (negative x) to go to next page, swipe right (positive x) to go to previous page
                                if (dragAmount.x < -100 && currentPage < pages.size - 1) {
                                    currentPage++
                                } else if (dragAmount.x > 100 && currentPage > 0) {
                                    currentPage--
                            }
                        }
                        },
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
                // Illustration
                Image(
                    painter = painterResource(id = page.imageRes),
                    contentDescription = null,
                    modifier = Modifier
                        .size(270.dp) // 1.5x bigger (180 * 1.5 = 270)
                        .padding(8.dp)
                )
                
                Spacer(modifier = Modifier.height(20.dp))
                
                Text(
                    text = page.title,
                    fontSize = 33.sp, // 1.5x bigger (22 * 1.5 = 33)
                    fontWeight = FontWeight.Bold,
                    color = LightForeground,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Text(
                    text = page.description,
                    fontSize = 22.5.sp, // 1.5x bigger (15 * 1.5 = 22.5)
                    color = LightMutedForeground,
                    textAlign = TextAlign.Center,
                    lineHeight = 33.sp // 1.5x bigger (22 * 1.5 = 33)
                )
        }
    }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Page Indicators
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            repeat(pages.size) { index ->
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(
                            color = if (index == currentPage) LightPrimary else LightMutedForeground.copy(alpha = 0.3f),
                            shape = RoundedCornerShape(4.dp)
                        )
                )
        }
    }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Navigation Buttons - RTL layout
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Next/Start button on the right (RTL)
            if (currentPage < pages.size - 1) {
                Button(
                    onClick = { currentPage++ },
                    colors = ButtonDefaults.buttonColors(containerColor = LightPrimary)
                ) {
                    Text(
                        text = "التالي",
                        color = Color.White
                    )
            }
            } else {
                Button(
                    onClick = onNavigate,
                    colors = ButtonDefaults.buttonColors(containerColor = LightPrimary)
                ) {
                    Text(
                        text = "ابدأ الآن",
                        color = Color.White
                    )
            }
        }
            
            // Previous button on the left (RTL)
            if (currentPage > 0) {
                TextButton(
                    onClick = { currentPage-- }
                ) {
                    Text(
                        text = "السابق",
                        color = LightMutedForeground
                    )
            }
            } else {
                Spacer(modifier = Modifier.width(80.dp))
        }
    }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PartnerTypeSelectorScreen(onPartnerSelected: (String) -> Unit) {
    val partnerTypes = listOf(
        PartnerType("repair", "مركز صيانة", "🛠️", "صيانة وإصلاح السيارات"),
        PartnerType("parts", "متجر قطع غيار", "⚙️", "بيع قطع غيار السيارات"),
        PartnerType("accessories", "متجر إكسسوارات", "🎯", "إكسسوارات وتجهيزات السيارات"),
        PartnerType("importer", "مستورد/مصنع", "🏭", "استيراد وتصنيع قطع الغيار"),
        PartnerType("service", "مركز خدمة", "🚗", "خدمات متنوعة للسيارات")
    )
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .padding(24.dp)
    ) {
        // Header - Centered Text with Logo on RTL/LTR Side
        Box(
            modifier = Modifier.fillMaxWidth()
        ) {
            // Centered Text
            Text(
                text = "اختر نوع متجرك",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground,
                modifier = Modifier.align(Alignment.Center)
            )
            
            // Logo positioned based on RTL/LTR
            val context = LocalContext.current
            val isRTL = LanguageManager.isRTL(context)
            
            Image(
                painter = painterResource(id = R.drawable.clutch_logo_black),
                contentDescription = "Clutch Partners Logo",
                modifier = Modifier
                    .size(40.dp)
                    .align(if (isRTL) Alignment.CenterEnd else Alignment.CenterStart)
            )
    }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Text(
            text = "اختر نوع النشاط التجاري الذي تمارسه",
            fontSize = 16.sp,
            color = LightMutedForeground,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // Partner Type Cards in 2x3 Grid with proper spacing
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.weight(1f)
        ) {
            // First row - 3 cards
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    partnerTypes.take(3).forEach { type ->
                        PartnerTypeCard(
                            type = type,
                            onSelected = onPartnerSelected,
                            modifier = Modifier.weight(1f)
                        )
                }
            }
        }
            
            // Second row - 2 cards centered
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center
                ) {
                    partnerTypes.drop(3).forEach { type ->
                        PartnerTypeCard(
                            type = type,
                            onSelected = onPartnerSelected,
                            modifier = Modifier
                                .weight(1f)
                                .padding(horizontal = 6.dp)
                        )
                }
            }
        }
            
            // Add bottom padding to prevent cards from being cut off
            item {
                Spacer(modifier = Modifier.height(32.dp))
        }
    }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PartnerTypeCard(
    type: PartnerType,
    onSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = { onSelected(type.id) },
        modifier = modifier
            .height(120.dp)
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
            // Emoji/Icon
            Text(
                text = type.emoji,
                fontSize = 32.sp,
                modifier = Modifier.size(40.dp),
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(6.dp))
            
            // Title
            Text(
                text = type.name,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground,
                textAlign = TextAlign.Center,
                maxLines = 2,
                lineHeight = 15.sp
            )
            
            Spacer(modifier = Modifier.height(3.dp))
            
            // Description
            Text(
                text = type.description,
                fontSize = 9.sp,
                color = LightMutedForeground,
                textAlign = TextAlign.Center,
                maxLines = 2,
                lineHeight = 11.sp
            )
    }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthSelectorScreen(
    onAuthModeSelected: (String) -> Unit,
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
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Back button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = if (isRTL) Arrangement.End else Arrangement.Start
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = if (isRTL) "رجوع" else "Back",
                        tint = LightPrimary,
                        modifier = Modifier.size(24.dp)
                    )
            }
        }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Logo
            Image(
                painter = painterResource(id = R.drawable.clutch_logo_black),
                contentDescription = "Clutch Partners Logo",
                modifier = Modifier.size(80.dp)
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                text = if (isRTL) "كيف تريد المتابعة؟" else "How would you like to proceed?",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = if (isRTL) "اختر الطريقة المناسبة لك للدخول إلى حسابك" else "Choose the appropriate method to access your account",
                fontSize = 16.sp,
                color = LightMutedForeground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(40.dp))
            
            // Auth Options
            val authOptions = if (isRTL) {
                listOf(
                    AuthOption("signin", "تسجيل الدخول", "لديك حساب بالفعل؟", Icons.Default.Login),
                    AuthOption("signup", "إنشاء حساب جديد", "لديك كود شريك؟", Icons.Default.PersonAdd),
                    AuthOption("request", "طلب الانضمام", "تريد الانضمام إلينا؟", Icons.Default.RequestPage)
                )
            } else {
                listOf(
                    AuthOption("signin", "Sign In", "Already have an account?", Icons.Default.Login),
                    AuthOption("signup", "Create Account", "Have a partner code?", Icons.Default.PersonAdd),
                    AuthOption("request", "Request to Join", "Want to join us?", Icons.Default.RequestPage)
                )
        }
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(authOptions) { option ->
                Card(
                    onClick = { onAuthModeSelected(option.id) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(
                            elevation = 4.dp,
                            shape = RoundedCornerShape(16.dp)
                        ),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(
                        modifier = Modifier.padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Card(
                            modifier = Modifier.size(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = LightPrimary.copy(alpha = 0.1f))
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = option.icon,
                                    contentDescription = null,
                                    modifier = Modifier.size(24.dp),
                                    tint = LightPrimary
                                )
                        }
                    }
                        
                        Spacer(modifier = Modifier.width(16.dp))
                        
                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = option.title,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = LightForeground
                            )
                            
                            Spacer(modifier = Modifier.height(4.dp))
                            
                            Text(
                                text = option.description,
                                fontSize = 14.sp,
                                color = LightMutedForeground
                            )
                    }
                        
                        Icon(
                            imageVector = Icons.Default.ArrowForwardIos,
                            contentDescription = null,
                            tint = LightMutedForeground,
                            modifier = Modifier.size(16.dp)
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
    partnerType: String,
    onAuthenticated: () -> Unit,
    onBack: () -> Unit
) {
    val authViewModel: AuthViewModel = hiltViewModel()
    val authState by authViewModel.authState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LightBackground)
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Back button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = if (isRTL) Arrangement.End else Arrangement.Start
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.size(48.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = if (isRTL) "رجوع" else "Back",
                        tint = LightPrimary,
                        modifier = Modifier.size(24.dp)
                    )
            }
        }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Logo
            Image(
                painter = painterResource(id = R.drawable.clutch_logo_black),
                contentDescription = "Clutch Partners Logo",
                modifier = Modifier.size(80.dp)
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                text = when (authMode) {
                    "signin" -> if (isRTL) "تسجيل الدخول" else "Sign In"
                    "signup" -> if (isRTL) "إنشاء حساب جديد" else "Create Account"
                    "request" -> if (isRTL) "طلب الانضمام" else "Request to Join"
                    else -> if (isRTL) "المصادقة" else "Authentication"
                },
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground,
                textAlign = TextAlign.Center
            )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // Show appropriate form based on auth mode
        when (authMode) {
            "signin" -> SignInForm(authViewModel = authViewModel, onAuthenticated = onAuthenticated, onBack = onBack)
            "signup" -> SignUpForm(authViewModel = authViewModel, onAuthenticated = onAuthenticated, onBack = onBack)
            "request" -> RequestToJoinForm(authViewModel = authViewModel, onAuthenticated = onAuthenticated, onBack = onBack)
        }
        
        // Handle auth state
        LaunchedEffect(authState) {
            if (authState is AuthState.Success) {
                onAuthenticated()
            }
        }
        }
    }
}

@Composable
fun SignInForm(
    authViewModel: AuthViewModel,
    onAuthenticated: () -> Unit,
    onBack: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val authState by authViewModel.authState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column {
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text(if (isRTL) "البريد الإلكتروني أو رقم الهاتف" else "Email or Phone Number") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Text,
                    imeAction = ImeAction.Next
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    focusedLabelColor = LightPrimary,
                    focusedTextColor = LightForeground,
                    unfocusedTextColor = LightForeground,
                    cursorColor = LightPrimary
                )
            )
            
            Spacer(modifier = Modifier.height(20.dp))
            
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text(if (isRTL) "كلمة المرور" else "Password") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder,
                    focusedLabelColor = LightPrimary,
                    focusedTextColor = LightForeground,
                    unfocusedTextColor = LightForeground,
                    cursorColor = LightPrimary
                )
            )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = { 
                authViewModel.signIn(email, password)
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
            shape = RoundedCornerShape(10.dp)
        ) {
            if (authState is AuthState.Loading) {
                LoadingRotor(
                    modifier = Modifier.size(20.dp),
                    color = Color.White
                )
            } else {
                Text(
                    text = if (isRTL) "تسجيل الدخول" else "Sign In",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
        }
    }
        
        if (authState is AuthState.Error) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = (authState as AuthState.Error).message,
                color = LightDestructive,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
    }
        
        // Handle authentication success
        LaunchedEffect(authState) {
            if (authState is AuthState.Success) {
                onAuthenticated()
            }
        }
        }
    }
}

@Composable
fun SignUpForm(
    authViewModel: AuthViewModel,
    onAuthenticated: () -> Unit,
    onBack: () -> Unit
) {
    var partnerId by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val authState by authViewModel.authState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column {
        OutlinedTextField(
            value = partnerId,
            onValueChange = { partnerId = it },
            label = { Text(if (isRTL) "كود الشريك" else "Partner Code") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LightPrimary,
                unfocusedBorderColor = LightBorder,
                focusedLabelColor = LightPrimary,
                focusedTextColor = LightForeground,
                unfocusedTextColor = LightForeground,
                cursorColor = LightPrimary
            )
        )
        
        Spacer(modifier = Modifier.height(20.dp))
        
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text(if (isRTL) "البريد الإلكتروني أو رقم الهاتف" else "Email or Phone Number") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LightPrimary,
                unfocusedBorderColor = LightBorder,
                focusedLabelColor = LightPrimary,
                focusedTextColor = LightForeground,
                unfocusedTextColor = LightForeground,
                cursorColor = LightPrimary
            )
        )
        
        Spacer(modifier = Modifier.height(20.dp))
        
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text(if (isRTL) "كلمة المرور" else "Password") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LightPrimary,
                unfocusedBorderColor = LightBorder,
                focusedLabelColor = LightPrimary,
                focusedTextColor = LightForeground,
                unfocusedTextColor = LightForeground,
                cursorColor = LightPrimary
            )
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = { 
                authViewModel.signUp(partnerId, email, password)
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
            shape = RoundedCornerShape(10.dp)
        ) {
            if (authState is AuthState.Loading) {
                LoadingRotor(
                    modifier = Modifier.size(20.dp),
                    color = Color.White
                )
            } else {
                Text(
                    text = if (isRTL) "إنشاء الحساب" else "Create Account",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
        }
    }
        
        if (authState is AuthState.Error) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = (authState as AuthState.Error).message,
                color = LightDestructive,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
    }
        
        // Handle authentication success
        LaunchedEffect(authState) {
            if (authState is AuthState.Success) {
                onAuthenticated()
            }
        }
        }
    }
}

@Composable
fun RequestToJoinForm(
    authViewModel: AuthViewModel,
    onAuthenticated: () -> Unit,
    onBack: () -> Unit
) {
    var businessName by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var ownerName by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    val authState by authViewModel.authState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column {
        OutlinedTextField(
            value = businessName,
            onValueChange = { businessName = it },
            label = { Text(if (isRTL) "اسم المتجر" else "Business Name") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LightPrimary,
                unfocusedBorderColor = LightBorder,
                focusedLabelColor = LightPrimary,
                focusedTextColor = LightForeground,
                unfocusedTextColor = LightForeground,
                cursorColor = LightPrimary
            )
        )
        
        Spacer(modifier = Modifier.height(20.dp))
        
        OutlinedTextField(
            value = address,
            onValueChange = { address = it },
            label = { Text(if (isRTL) "العنوان" else "Address") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LightPrimary,
                unfocusedBorderColor = LightBorder,
                focusedLabelColor = LightPrimary,
                focusedTextColor = LightForeground,
                unfocusedTextColor = LightForeground,
                cursorColor = LightPrimary
            )
        )
        
        Spacer(modifier = Modifier.height(20.dp))
        
        OutlinedTextField(
            value = ownerName,
            onValueChange = { ownerName = it },
            label = { Text(if (isRTL) "اسم المالك" else "Owner Name") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LightPrimary,
                unfocusedBorderColor = LightBorder,
                focusedLabelColor = LightPrimary,
                focusedTextColor = LightForeground,
                unfocusedTextColor = LightForeground,
                cursorColor = LightPrimary
            )
        )
        
        Spacer(modifier = Modifier.height(20.dp))
        
        OutlinedTextField(
            value = phoneNumber,
            onValueChange = { newValue ->
                // Validate phone number: 11 digits starting with 01
                if (newValue.isEmpty() || (newValue.length <= 11 && newValue.all { it.isDigit() } && (newValue.startsWith("01") || newValue.isEmpty()))) {
                    phoneNumber = newValue
            }
            },
            label = { Text(if (isRTL) "رقم الهاتف (01xxxxxxxxx)" else "Phone Number (01xxxxxxxxx)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Phone,
                imeAction = ImeAction.Done
            ),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LightPrimary,
                unfocusedBorderColor = LightBorder,
                focusedLabelColor = LightPrimary,
                focusedTextColor = LightForeground,
                unfocusedTextColor = LightForeground,
                cursorColor = LightPrimary
            )
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = { 
                authViewModel.requestToJoin(businessName, address, ownerName, phoneNumber, "repair")
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
            shape = RoundedCornerShape(10.dp)
        ) {
            if (authState is AuthState.Loading) {
                LoadingRotor(
                    modifier = Modifier.size(20.dp),
                    color = Color.White
                )
            } else {
                Text(
                    text = if (isRTL) "إرسال الطلب" else "Send Request",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
        }
    }
        
        if (authState is AuthState.Error) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = (authState as AuthState.Error).message,
                color = LightDestructive,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
    }
        
        // Handle authentication success
        LaunchedEffect(authState) {
            if (authState is AuthState.Success) {
                onAuthenticated()
            }
        }
        }
    }
}

@Composable
fun DashboardScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    
    val tabs = listOf("الطلبات", "المدفوعات", "لوحة الأعمال", "الإعدادات")
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
    ) {
        // Top App Bar
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(
                    elevation = 4.dp,
                    shape = RoundedCornerShape(bottomStart = 20.dp, bottomEnd = 20.dp)
                ),
            shape = RoundedCornerShape(bottomStart = 20.dp, bottomEnd = 20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Image(
                    painter = painterResource(id = R.drawable.clutch_logo_black),
                    contentDescription = "Clutch Partners Logo",
                    modifier = Modifier.size(40.dp)
                )
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column {
                    Text(
                        text = "مرحباً بك",
                        fontSize = 16.sp,
                        color = LightMutedForeground
                    )
                    Text(
                        text = "متجر الصيانة",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = LightForeground
                    )
            }
                
                Spacer(modifier = Modifier.weight(1f))
                
                IconButton(
                    onClick = { /* TODO: Add notifications */ }
                ) {
                    Icon(
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "Notifications",
                        tint = LightPrimary
                    )
            }
        }
    }
        
        // Tab Row
        ScrollableTabRow(
            selectedTabIndex = selectedTab,
            modifier = Modifier.fillMaxWidth(),
            containerColor = Color.Transparent,
            contentColor = LightPrimary,
            indicator = { tabPositions ->
                TabRowDefaults.Indicator(
                    modifier = Modifier,
                    color = LightPrimary
                )
        }
        ) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = {
                        Text(
                            text = title,
                            color = if (selectedTab == index) LightPrimary else LightMutedForeground,
                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal
                        )
                }
                )
        }
    }
        
        // Tab Content
        when (selectedTab) {
            0 -> OrdersTab()
            1 -> PaymentsTab()
            2 -> BusinessDashboardTab()
            3 -> SettingsTab()
    }
    }
}

@Composable
fun OrdersTab() {
    // Mock orders data
    val mockOrders = listOf(
        MockOrder("12345", "صيانة مكيف", "أحمد محمد", "مكيف السيارة لا يعمل", "معلق", "2024-01-15"),
        MockOrder("12346", "تغيير زيت", "فاطمة علي", "تغيير زيت المحرك", "مدفوع", "2024-01-14"),
        MockOrder("12347", "إصلاح فرامل", "محمد حسن", "فرامل السيارة تصدر صوت", "مرفوض", "2024-01-13")
    )
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "الطلبات والمواعيد",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = LightForeground
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(mockOrders) { order ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(
                            elevation = 2.dp,
                            shape = RoundedCornerShape(12.dp)
                        ),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Card(
                            modifier = Modifier.size(50.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = when (order.status) {
                                    "معلق" -> LightWarning.copy(alpha = 0.2f)
                                    "مدفوع" -> LightSuccess.copy(alpha = 0.2f)
                                    "مرفوض" -> LightDestructive.copy(alpha = 0.2f)
                                    "مكتمل" -> LightInfo.copy(alpha = 0.2f)
                                    else -> MaterialTheme.colorScheme.surfaceVariant
                            }
                            )
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.DirectionsCar,
                                    contentDescription = null,
                                    modifier = Modifier.size(24.dp),
                                    tint = when (order.status) {
                                        "معلق" -> LightWarning
                                        "مدفوع" -> LightSuccess
                                        "مرفوض" -> LightDestructive
                                        "مكتمل" -> LightInfo
                                        else -> LightMutedForeground
                                }
                                )
                        }
                    }
                        
                        Spacer(modifier = Modifier.width(16.dp))
                        
                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = order.service,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = LightForeground
                            )
                            Text(
                                text = order.customer,
                                fontSize = 14.sp,
                                color = LightMutedForeground
                            )
                            Text(
                                text = order.date,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = LightPrimary
                            )
                    }
                        
                        Card(
                            shape = RoundedCornerShape(8.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = when (order.status) {
                                    "معلق" -> LightWarning.copy(alpha = 0.2f)
                                    "مدفوع" -> LightSuccess.copy(alpha = 0.2f)
                                    "مرفوض" -> LightDestructive.copy(alpha = 0.2f)
                                    "مكتمل" -> LightInfo.copy(alpha = 0.2f)
                                    else -> MaterialTheme.colorScheme.surfaceVariant
                            }
                            )
                        ) {
                            Text(
                                text = order.status,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = when (order.status) {
                                    "معلق" -> LightWarning
                                    "مدفوع" -> LightSuccess
                                    "مرفوض" -> LightDestructive
                                    "مكتمل" -> LightInfo
                                    else -> LightMutedForeground
                            }
                            )
                    }
                }
            }
        }
    }
    }
}

@Composable
fun PaymentsTab() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "المدفوعات",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = LightForeground
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Weekly Income Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
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
                    text = "الإيراد الأسبوعي",
                    fontSize = 16.sp,
                    color = LightMutedForeground
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "2,450 جنيه",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = LightForeground
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "+12% من الأسبوع الماضي",
                    fontSize = 14.sp,
                    color = LightSuccess
                )
        }
    }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Upcoming Payout Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
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
                    text = "الدفعة القادمة",
                    fontSize = 16.sp,
                    color = LightMutedForeground
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "3 أيام",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = LightPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "الجمعة 25 يناير 2024",
                    fontSize = 14.sp,
                    color = LightMutedForeground
                )
        }
    }
    }
}

@Composable
fun BusinessDashboardTab() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "لوحة الأعمال",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = LightForeground
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Stats Cards
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard("الطلبات", "24", LightPrimary)
            StatCard("العملاء", "18", LightSuccess)
    }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard("الإيراد", "9,800", LightWarning)
            StatCard("التقييم", "4.8", LightInfo)
    }
    }
}

@Composable
fun StatCard(title: String, value: String, color: Color) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(
                elevation = 2.dp,
                shape = RoundedCornerShape(12.dp)
            ),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = title,
                fontSize = 14.sp,
                color = LightMutedForeground
            )
    }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsTab() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "الإعدادات",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = LightForeground
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Settings Options
        val settingsOptions = listOf(
            SettingsOption("الملف الشخصي", "تحديث معلومات المتجر", Icons.Default.Person),
            SettingsOption("ساعات العمل", "تحديد أوقات العمل", Icons.Default.Schedule),
            SettingsOption("الخدمات", "تفعيل/إلغاء الخدمات", Icons.Default.Settings),
            SettingsOption("اللغة", "العربية / English", Icons.Default.Language),
            SettingsOption("الإشعارات", "إعدادات الإشعارات", Icons.Default.Notifications),
            SettingsOption("تسجيل الخروج", "الخروج من الحساب", Icons.Default.Logout)
        )
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(settingsOptions) { option ->
                Card(
                    onClick = { /* TODO: Handle settings action */ },
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(
                            elevation = 2.dp,
                            shape = RoundedCornerShape(12.dp)
                        ),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
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
                                fontWeight = FontWeight.Medium,
                                color = LightForeground
                            )
                            Text(
                                text = option.description,
                                fontSize = 14.sp,
                                color = LightMutedForeground
                            )
                    }
                        
                        Icon(
                            imageVector = Icons.Default.ArrowForwardIos,
                            contentDescription = null,
                            tint = LightMutedForeground,
                            modifier = Modifier.size(16.dp)
                        )
                }
            }
        }
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
    val name: String,
    val emoji: String,
    val description: String
)

data class AuthOption(
    val id: String,
    val title: String,
    val description: String,
    val icon: ImageVector
)

data class MockOrder(
    val id: String,
    val service: String,
    val customer: String,
    val description: String,
    val status: String,
    val date: String
)

data class SettingsOption(
    val title: String,
    val description: String,
    val icon: ImageVector
)

data class OnboardingPage(
    val title: String,
    val description: String,
    val imageRes: Int
)

data class PartnerType(
    val id: String,
    val name: String,
    val icon: ImageVector
)

data class AuthOption(
    val id: String,
    val title: String,
    val description: String,
    val icon: ImageVector
)

data class MockOrder(
    val id: String,
    val service: String,
    val customer: String,
    val description: String,
    val status: String,
    val date: String
)

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: ImageVector,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = LightPrimary,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = value,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = LightForeground
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

@Composable
fun OrdersTab() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "الطلبات",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = LightForeground
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Mock orders
        val orders = listOf(
            MockOrder("1", "صيانة محرك", "أحمد محمد", "صيانة شاملة للمحرك", "معلق", "2024-01-15"),
            MockOrder("2", "تغيير زيت", "فاطمة علي", "تغيير زيت المحرك", "مدفوع", "2024-01-14"),
            MockOrder("3", "إصلاح فرامل", "محمد حسن", "إصلاح نظام الفرامل", "مرفوض", "2024-01-13")
        )
        
        LazyColumn(
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
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "المدفوعات",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = LightForeground
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Payment stats
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                title = "إجمالي الأرباح",
                value = "15,000 ج.م",
                icon = Icons.Default.AttachMoney,
                modifier = Modifier.weight(1f)
            )
            
            StatCard(
                title = "المدفوعات",
                value = "12,000 ج.م",
                icon = Icons.Default.Payment,
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                title = "المعلقة",
                value = "3,000 ج.م",
                icon = Icons.Default.Schedule,
                modifier = Modifier.weight(1f)
            )
            
            StatCard(
                title = "المرفوضة",
                value = "0 ج.م",
                icon = Icons.Default.Cancel,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun BusinessDashboardTab() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "لوحة الأعمال",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = LightForeground
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Business stats
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                title = "إجمالي الطلبات",
                value = "45",
                icon = Icons.Default.ShoppingCart,
                modifier = Modifier.weight(1f)
            )
            
            StatCard(
                title = "الطلبات المكتملة",
                value = "38",
                icon = Icons.Default.CheckCircle,
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                title = "الطلبات المعلقة",
                value = "5",
                icon = Icons.Default.Schedule,
                modifier = Modifier.weight(1f)
            )
            
            StatCard(
                title = "الطلبات المرفوضة",
                value = "2",
                icon = Icons.Default.Cancel,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun SettingsTab() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "الإعدادات",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = LightForeground
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Settings options
        val settingsOptions = listOf(
            SettingsOption("الملف الشخصي", "تعديل معلومات الحساب", Icons.Default.Person),
            SettingsOption("الإشعارات", "إدارة الإشعارات", Icons.Default.Notifications),
            SettingsOption("اللغة", "تغيير لغة التطبيق", Icons.Default.Language),
            SettingsOption("المظهر", "تغيير مظهر التطبيق", Icons.Default.Palette),
            SettingsOption("الأمان", "إعدادات الأمان", Icons.Default.Security),
            SettingsOption("المساعدة", "الدعم والمساعدة", Icons.Default.Help)
        )
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(settingsOptions) { option ->
                Card(
                    onClick = { /* Handle settings option click */ },
                    modifier = Modifier
                        .fillMaxWidth()
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
                                fontWeight = FontWeight.Medium,
                                color = LightForeground
                            )
                            
                            Text(
                                text = option.description,
                                fontSize = 14.sp,
                                color = LightMutedForeground
                            )
                        }
                        
                        Icon(
                            imageVector = Icons.Default.ArrowForwardIos,
                            contentDescription = null,
                            tint = LightMutedForeground,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun OrderCard(order: MockOrder) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
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
                    text = order.service,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = LightForeground
                )
                
                Box(
                    modifier = Modifier
                        .background(
                            color = when (order.status) {
                                "معلق" -> Color(0xFFFFA726)
                                "مدفوع" -> Color(0xFF4CAF50)
                                "مرفوض" -> Color(0xFFF44336)
                                else -> LightMutedForeground
                            },
                            shape = RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = order.status,
                        fontSize = 12.sp,
                        color = Color.White,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "العميل: ${order.customer}",
                fontSize = 14.sp,
                color = LightMutedForeground
            )
            
            Text(
                text = "التاريخ: ${order.date}",
                fontSize = 14.sp,
                color = LightMutedForeground
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = order.description,
                fontSize = 14.sp,
                color = LightForeground
            )
        }
    }
}
