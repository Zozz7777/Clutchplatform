package com.clutch.partners.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.clutch.partners.data.repository.PartnersRepository
import com.clutch.partners.ui.screens.auth.AuthScreen
import com.clutch.partners.ui.screens.auth.PartnerTypeSelectorScreen
import com.clutch.partners.ui.screens.auth.RequestToJoinScreen
import com.clutch.partners.ui.screens.auth.SignInScreen
import com.clutch.partners.ui.screens.auth.SignUpScreen
import com.clutch.partners.ui.screens.dashboard.DashboardScreen
import com.clutch.partners.ui.screens.onboarding.OnboardingScreen
import com.clutch.partners.ui.screens.splash.SplashScreen
import org.koin.compose.koinInject

@Composable
fun ClutchPartnersNavigation(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    val repository: PartnersRepository = koinInject()
    val isAuthenticated = repository.isAuthenticated()
    
    NavHost(
        navController = navController,
        startDestination = if (isAuthenticated) Screen.Dashboard.route else Screen.Splash.route,
        modifier = modifier
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToOnboarding = {
                    navController.navigate(Screen.Onboarding.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToDashboard = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Onboarding.route) {
            OnboardingScreen(
                onGetStarted = {
                    navController.navigate(Screen.PartnerTypeSelector.route)
                }
            )
        }
        
        composable(Screen.PartnerTypeSelector.route) {
            PartnerTypeSelectorScreen(
                onPartnerTypeSelected = { partnerType ->
                    navController.navigate(Screen.Auth.route + "?partnerType=$partnerType")
                }
            )
        }
        
        composable(Screen.Auth.route) { backStackEntry ->
            val partnerType = backStackEntry.arguments?.getString("partnerType") ?: ""
            AuthScreen(
                partnerType = partnerType,
                onSignIn = {
                    navController.navigate(Screen.SignIn.route + "?partnerType=$partnerType")
                },
                onSignUp = {
                    navController.navigate(Screen.SignUp.route + "?partnerType=$partnerType")
                },
                onRequestToJoin = {
                    navController.navigate(Screen.RequestToJoin.route + "?partnerType=$partnerType")
                }
            )
        }
        
        composable(Screen.SignIn.route) { backStackEntry ->
            val partnerType = backStackEntry.arguments?.getString("partnerType") ?: ""
            SignInScreen(
                partnerType = partnerType,
                onSignInSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.SignUp.route) { backStackEntry ->
            val partnerType = backStackEntry.arguments?.getString("partnerType") ?: ""
            SignUpScreen(
                partnerType = partnerType,
                onSignUpSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.RequestToJoin.route) { backStackEntry ->
            val partnerType = backStackEntry.arguments?.getString("partnerType") ?: ""
            RequestToJoinScreen(
                partnerType = partnerType,
                onRequestSubmitted = {
                    navController.navigate(Screen.SignIn.route + "?partnerType=$partnerType") {
                        popUpTo(Screen.PartnerTypeSelector.route) { inclusive = true }
                    }
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(Screen.Dashboard.route) {
            DashboardScreen(
                onLogout = {
                    repository.logout()
                    navController.navigate(Screen.Splash.route) {
                        popUpTo(Screen.Dashboard.route) { inclusive = true }
                    }
                }
            )
        }
    }
}

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object PartnerTypeSelector : Screen("partner_type_selector")
    object Auth : Screen("auth?partnerType={partnerType}")
    object SignIn : Screen("sign_in?partnerType={partnerType}")
    object SignUp : Screen("sign_up?partnerType={partnerType}")
    object RequestToJoin : Screen("request_to_join?partnerType={partnerType}")
    object Dashboard : Screen("dashboard")
}
