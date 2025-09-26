package com.clutch.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.clutch.app.ui.screens.auth.LoginScreen
import com.clutch.app.ui.screens.auth.RegisterScreen
import com.clutch.app.ui.screens.auth.SocialLoginScreen
import com.clutch.app.ui.screens.dashboard.DashboardScreenNew
import com.clutch.app.ui.screens.onboarding.OnboardingScreen
import com.clutch.app.ui.screens.splash.SplashScreen
import com.clutch.app.ui.screens.car.CarHealthScreen
import com.clutch.app.ui.screens.car.CarListScreen
import com.clutch.app.ui.screens.car.AddCarScreen
import com.clutch.app.ui.screens.maintenance.MaintenanceHistoryScreen
import com.clutch.app.ui.screens.booking.BookServiceScreen
import com.clutch.app.ui.screens.parts.OrderPartsScreen
import com.clutch.app.ui.screens.payments.PaymentsScreen
import com.clutch.app.ui.screens.community.CommunityScreen
import com.clutch.app.ui.screens.community.CreateTipScreen
import com.clutch.app.ui.screens.community.TipDetailScreen
import com.clutch.app.ui.screens.loyalty.LoyaltyScreen
import com.clutch.app.ui.screens.loyalty.RewardsScreen
import com.clutch.app.ui.screens.profile.ProfileScreen
import com.clutch.app.ui.screens.settings.SettingsScreen
import com.clutch.app.utils.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@Composable
fun ClutchNavigation(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    sessionManager: SessionManager
) {
    val isLoggedIn = sessionManager.isLoggedIn()
    val hasCompletedOnboarding = sessionManager.hasCompletedOnboarding()
    
    NavHost(
        navController = navController,
        startDestination = when {
            !hasCompletedOnboarding -> "onboarding"
            !isLoggedIn -> "splash"
            else -> "dashboard"
        },
        modifier = modifier
    ) {
        // Onboarding
        composable("onboarding") {
            OnboardingScreen(
                onComplete = {
                    sessionManager.setOnboardingCompleted(true)
                    navController.navigate("splash") {
                        popUpTo("onboarding") { inclusive = true }
                    }
                }
            )
        }
        
        // Splash Screen
        composable("splash") {
            SplashScreen(
                onNavigateToLogin = {
                    navController.navigate("login") {
                        popUpTo("splash") { inclusive = true }
                    }
                },
                onNavigateToDashboard = {
                    navController.navigate("dashboard") {
                        popUpTo("splash") { inclusive = true }
                    }
                }
            )
        }
        
        // Authentication
        composable("login") {
            LoginScreen(
                onNavigateToRegister = {
                    navController.navigate("register")
                },
                onNavigateToSocialLogin = {
                    navController.navigate("social_login")
                },
                onLoginSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }
        
        composable("register") {
            RegisterScreen(
                onNavigateToLogin = {
                    navController.popBackStack()
                },
                onRegisterSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("register") { inclusive = true }
                    }
                }
            )
        }
        
        composable("social_login") {
            SocialLoginScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onLoginSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("social_login") { inclusive = true }
                    }
                }
            )
        }
        
        // Main Dashboard
        composable("dashboard") {
            DashboardScreenNew(
                onNavigateToCarHealth = { carId ->
                    navController.navigate("car_health/$carId")
                },
                onNavigateToMaintenance = {
                    navController.navigate("maintenance")
                },
                onNavigateToBookService = {
                    navController.navigate("book_service")
                },
                onNavigateToOrderParts = {
                    navController.navigate("order_parts")
                },
                onNavigateToCommunity = {
                    navController.navigate("community")
                },
                onNavigateToLoyalty = {
                    navController.navigate("loyalty")
                },
                onNavigateToProfile = {
                    navController.navigate("profile")
                }
            )
        }
        
        // Car Management
        composable("cars") {
            CarListScreen(
                onNavigateToAddCar = {
                    navController.navigate("add_car")
                },
                onNavigateToCarHealth = { carId ->
                    navController.navigate("car_health/$carId")
                }
            )
        }
        
        composable("add_car") {
            AddCarScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onCarAdded = {
                    navController.popBackStack()
                }
            )
        }
        
        composable("car_health/{carId}") { backStackEntry ->
            val carId = backStackEntry.arguments?.getString("carId") ?: ""
            CarHealthScreen(
                carId = carId,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        // Maintenance
        composable("maintenance") {
            MaintenanceHistoryScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        // Booking
        composable("book_service") {
            BookServiceScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onBookingSuccess = {
                    navController.popBackStack()
                }
            )
        }
        
        // Parts
        composable("order_parts") {
            OrderPartsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onOrderSuccess = {
                    navController.popBackStack()
                }
            )
        }
        
        // Payments
        composable("payments") {
            PaymentsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        // Community
        composable("community") {
            CommunityScreen(
                onNavigateToCreateTip = {
                    navController.navigate("create_tip")
                },
                onNavigateToTipDetail = { tipId ->
                    navController.navigate("tip_detail/$tipId")
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable("create_tip") {
            CreateTipScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onTipCreated = {
                    navController.popBackStack()
                }
            )
        }
        
        composable("tip_detail/{tipId}") { backStackEntry ->
            val tipId = backStackEntry.arguments?.getString("tipId") ?: ""
            TipDetailScreen(
                tipId = tipId,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        // Loyalty
        composable("loyalty") {
            LoyaltyScreen(
                onNavigateToRewards = {
                    navController.navigate("rewards")
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable("rewards") {
            RewardsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onRewardRedeemed = {
                    navController.popBackStack()
                }
            )
        }
        
        // Profile & Settings
        composable("profile") {
            ProfileScreen(
                onNavigateToSettings = {
                    navController.navigate("settings")
                },
                onNavigateToCars = {
                    navController.navigate("cars")
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable("settings") {
            SettingsScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onLogout = {
                    navController.navigate("login") {
                        popUpTo("settings") { inclusive = true }
                    }
                }
            )
        }
    }
}
