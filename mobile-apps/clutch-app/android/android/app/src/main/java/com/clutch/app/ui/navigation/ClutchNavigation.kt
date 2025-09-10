package com.clutch.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.clutch.app.ui.screens.auth.LoginScreen
import com.clutch.app.ui.screens.auth.RegisterScreen
import com.clutch.app.ui.screens.auth.OtpVerificationScreen
import com.clutch.app.ui.screens.auth.ForgotPasswordScreen
import com.clutch.app.ui.screens.onboarding.OnboardingScreen
import com.clutch.app.ui.screens.main.MainScreen
import com.clutch.app.ui.screens.main.HomeScreen
import com.clutch.app.ui.screens.parts.PartsScreen
import com.clutch.app.ui.screens.parts.PartsCategoryScreen
import com.clutch.app.ui.screens.parts.PartDetailsScreen
import com.clutch.app.ui.screens.parts.ExpiringPartsScreen
import com.clutch.app.ui.screens.parts.PartsScreenIntegrated
import com.clutch.app.ui.screens.parts.AddPartScreen
import com.clutch.app.ui.screens.cart.ShoppingCartScreen
import com.clutch.app.ui.screens.cart.CheckoutScreen
import com.clutch.app.ui.screens.cart.OrderConfirmationScreen
import com.clutch.app.ui.screens.cart.OrderHistoryScreen
import com.clutch.app.ui.screens.cart.ShoppingCartScreenIntegrated
import com.clutch.app.ui.screens.cart.OrderDetailsScreen
import com.clutch.app.ui.screens.services.ServiceCentersScreen
import com.clutch.app.ui.screens.services.ServiceCentersScreenIntegrated
import com.clutch.app.ui.screens.services.ServiceCenterDetailsScreen
import com.clutch.app.ui.screens.services.ServiceCategoryScreen
import com.clutch.app.ui.screens.services.BookServiceScreen
import com.clutch.app.ui.screens.services.BookingsScreen
import com.clutch.app.ui.screens.services.BookingConfirmationScreen
import com.clutch.app.ui.screens.services.BookingDetailsScreen
import com.clutch.app.ui.screens.profile.UserProfileScreen
import com.clutch.app.ui.screens.profile.SettingsScreen
import com.clutch.app.ui.screens.profile.PaymentMethodsScreen
import com.clutch.app.ui.screens.profile.LoyaltyScreen
import com.clutch.app.ui.screens.profile.HelpScreen

@Composable
fun ClutchNavigation(
    navController: NavHostController,
    startDestination: String = "onboarding"
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Authentication Flow
        composable("onboarding") {
            OnboardingScreen(navController = navController)
        }
        
        composable("login") {
            LoginScreen(navController = navController)
        }
        
        composable("register") {
            RegisterScreen(navController = navController)
        }
        
        composable("otp_verification") {
            OtpVerificationScreen(navController = navController)
        }
        
        composable("forgot_password") {
            ForgotPasswordScreen(navController = navController)
        }
        
        // Main App Flow
        composable("main") {
            MainScreen(navController = navController)
        }
        
        composable("home") {
            HomeScreen(navController = navController)
        }
        
        // Parts Management
        composable("parts") {
            PartsScreenIntegrated(navController = navController)
        }
        
        composable("add_part") {
            AddPartScreen(navController = navController)
        }
        
        composable("part_details/{partId}") { backStackEntry ->
            val partId = backStackEntry.arguments?.getString("partId") ?: ""
            PartDetailsScreen(
                navController = navController,
                partId = partId
            )
        }
        
        composable("parts_category/{category}") { backStackEntry ->
            val category = backStackEntry.arguments?.getString("category") ?: ""
            PartsCategoryScreen(
                navController = navController,
                categoryId = category
            )
        }
        
        composable("expiring_parts") {
            ExpiringPartsScreen(navController = navController)
        }
        
        // Shopping Cart & Orders
        composable("shopping_cart") {
            ShoppingCartScreenIntegrated(navController = navController)
        }
        
        composable("checkout") {
            CheckoutScreen(navController = navController)
        }
        
        composable("order_confirmation") {
            OrderConfirmationScreen(navController = navController)
        }
        
        composable("order_history") {
            OrderHistoryScreen(navController = navController)
        }
        
        composable("order_details/{orderId}") { backStackEntry ->
            val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
            OrderDetailsScreen(
                navController = navController,
                orderId = orderId
            )
        }
        
        // Service Management
        composable("service_centers") {
            ServiceCentersScreenIntegrated(navController = navController)
        }
        
        composable("service_center/{centerId}") { backStackEntry ->
            val centerId = backStackEntry.arguments?.getString("centerId") ?: ""
            ServiceCenterDetailsScreen(
                navController = navController,
                centerId = centerId
            )
        }
        
        composable("service_category/{category}") { backStackEntry ->
            val category = backStackEntry.arguments?.getString("category") ?: ""
            ServiceCategoryScreen(
                navController = navController,
                categoryId = category
            )
        }
        
        composable("book_service/{centerId}/{serviceName}") { backStackEntry ->
            val centerId = backStackEntry.arguments?.getString("centerId") ?: ""
            val serviceName = backStackEntry.arguments?.getString("serviceName") ?: ""
            BookServiceScreen(
                navController = navController,
                centerId = centerId,
                serviceName = serviceName
            )
        }
        
        composable("bookings") {
            BookingsScreen(navController = navController)
        }
        
        composable("booking_confirmation") {
            BookingConfirmationScreen(navController = navController)
        }
        
        composable("booking_details/{bookingId}") { backStackEntry ->
            val bookingId = backStackEntry.arguments?.getString("bookingId") ?: ""
            BookingDetailsScreen(
                navController = navController,
                bookingId = bookingId
            )
        }
        
        // Profile & Settings
        composable("profile") {
            UserProfileScreen(navController = navController)
        }
        
        composable("settings") {
            SettingsScreen(navController = navController)
        }
        
        composable("payment_methods") {
            PaymentMethodsScreen(navController = navController)
        }
        
        composable("loyalty") {
            LoyaltyScreen(navController = navController)
        }
        
        composable("help") {
            HelpScreen(navController = navController)
        }
    }
}
