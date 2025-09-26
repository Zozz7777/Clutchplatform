package com.clutch.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.clutch.app.ui.components.BottomNavigation
import com.clutch.app.ui.screens.DashboardScreen
import com.clutch.app.ui.screens.SplashScreen
import com.clutch.app.ui.screens.auth.LoginScreen
import com.clutch.app.ui.screens.onboarding.OnboardingScreen
import com.clutch.app.ui.screens.auth.SignupScreen
import com.clutch.app.ui.screens.auth.ForgotPasswordScreen
import com.clutch.app.ui.screens.parts.MyPartsScreen
import com.clutch.app.ui.screens.maintenance.MaintenanceScreen
import com.clutch.app.ui.screens.account.AccountScreen
import com.clutch.app.ui.screens.car.CarHealthScreen
import com.clutch.app.ui.screens.service.BookServiceScreen
import com.clutch.app.ui.screens.parts.OrderPartsScreen
import com.clutch.app.ui.screens.community.CommunityScreen
import com.clutch.app.ui.screens.loyalty.LoyaltyScreen
import com.clutch.app.ui.theme.ClutchAppTheme
import com.clutch.app.utils.SessionManager
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    @Inject
    lateinit var sessionManager: SessionManager
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            ClutchAppTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    ClutchApp(
                        sessionManager = sessionManager,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun ClutchApp(
    sessionManager: SessionManager,
    modifier: Modifier = Modifier
) {
    var currentScreen by remember { mutableStateOf("splash") }
    var selectedTab by remember { mutableStateOf("home") }
    
    // Check if user is already logged in
    LaunchedEffect(Unit) {
        if (sessionManager.isLoggedIn()) {
            currentScreen = "dashboard"
        }
    }
    
    when (currentScreen) {
        "splash" -> SplashScreen(
            onNavigateToLogin = { currentScreen = "onboarding" },
            onNavigateToDashboard = { currentScreen = "dashboard" }
        )
          "onboarding" -> OnboardingScreen(
              onGetStarted = { currentScreen = "login" },
              onSkip = { currentScreen = "login" }
          )
          "login" -> LoginScreen(
              onLoginSuccess = { currentScreen = "dashboard" },
              onNavigateToSignup = { currentScreen = "signup" },
              onNavigateToForgotPassword = { currentScreen = "forgot_password" }
          )
          "signup" -> SignupScreen(
              onNavigateBack = { currentScreen = "login" },
              onNavigateToLogin = { currentScreen = "login" },
              onSignupSuccess = { currentScreen = "dashboard" }
          )
          "forgot_password" -> ForgotPasswordScreen(
              onNavigateBack = { currentScreen = "login" },
              onNavigateToLogin = { currentScreen = "login" },
              onResetPassword = { currentScreen = "login" }
          )
        "dashboard" -> {
            Scaffold(
                bottomBar = {
                    BottomNavigation(
                        selectedRoute = selectedTab,
                        onNavigate = { route ->
                            selectedTab = route
                        }
                    )
                },
                containerColor = Color.Transparent
            ) { paddingValues ->
                Box(modifier = Modifier.padding(paddingValues)) {
                    when (selectedTab) {
                        "home" -> DashboardScreen(
                            onNavigateToCarHealth = { selectedTab = "car_health" },
                            onNavigateToBookService = { selectedTab = "book_service" },
                            onNavigateToOrderParts = { selectedTab = "order_parts" },
                            onNavigateToCommunity = { selectedTab = "community" },
                            onNavigateToLoyalty = { selectedTab = "loyalty" }
                        )
                        "parts" -> MyPartsScreen()
                        "maintenance" -> MaintenanceScreen()
                        "account" -> AccountScreen()
                        "car_health" -> CarHealthScreen()
                        "book_service" -> BookServiceScreen()
                        "order_parts" -> OrderPartsScreen()
                        "community" -> CommunityScreen()
                        "loyalty" -> LoyaltyScreen()
                    }
                }
            }
        }
    }
}
