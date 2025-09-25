package com.clutch.partners

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.clutch.partners.ui.screens.splash.SplashScreen
import com.clutch.partners.ui.screens.onboarding.OnboardingScreen
import com.clutch.partners.ui.screens.auth.AuthScreen
import com.clutch.partners.ui.screens.dashboard.DashboardScreen
import com.clutch.partners.ui.theme.ClutchPartnersTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * UI Test Suite for Clutch Partners App
 * Tests user interface components and interactions
 */
@RunWith(AndroidJUnit4::class)
class UITestSuite {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun testSplashScreen() {
        composeTestRule.setContent {
            ClutchPartnersTheme {
                SplashScreen(
                    onNavigateToOnboarding = {},
                    onNavigateToDashboard = {}
                )
            }
        }

        // Verify splash screen elements
        composeTestRule.onNodeWithText("Clutch Partners")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("Loading...")
            .assertIsDisplayed()
    }

    @Test
    fun testOnboardingScreen() {
        composeTestRule.setContent {
            ClutchPartnersTheme {
                OnboardingScreen(
                    onNavigateToPartnerTypeSelector = {}
                )
            }
        }

        // Verify onboarding screen elements
        composeTestRule.onNodeWithText("Manage Your Store")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("Next")
            .assertIsDisplayed()
    }

    @Test
    fun testAuthScreen() {
        composeTestRule.setContent {
            ClutchPartnersTheme {
                AuthScreen(
                    onNavigateToSignIn = {},
                    onNavigateToSignUp = {},
                    onNavigateToRequestToJoin = {}
                )
            }
        }

        // Verify auth screen elements
        composeTestRule.onNodeWithText("Welcome to Clutch Partners")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("Sign In")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("Sign Up")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("Request to Join")
            .assertIsDisplayed()
    }

    @Test
    fun testDashboardScreen() {
        composeTestRule.setContent {
            ClutchPartnersTheme {
                DashboardScreen(
                    orders = emptyList(),
                    payments = emptyList(),
                    userRole = com.clutch.partners.data.model.PartnerRole.OWNER,
                    userPermissions = com.clutch.partners.data.model.PartnerRole.OWNER.permissions,
                    onOrderClick = {},
                    onUpdateOrderStatus = { _, _ -> },
                    onRefresh = {},
                    onLogout = {}
                )
            }
        }

        // Verify dashboard screen elements
        composeTestRule.onNodeWithText("Orders & Appointments")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("Payments")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("Store Settings")
            .assertIsDisplayed()
    }

    @Test
    fun testLanguageToggle() {
        composeTestRule.setContent {
            ClutchPartnersTheme {
                // Test language toggle component
                com.clutch.partners.ui.components.LanguageToggleButton(
                    onLanguageChanged = {}
                )
            }
        }

        // Verify language toggle button is displayed
        composeTestRule.onNodeWithContentDescription("Language")
            .assertIsDisplayed()
    }

    @Test
    fun testThemeToggle() {
        composeTestRule.setContent {
            ClutchPartnersTheme {
                // Test theme toggle component
                com.clutch.partners.ui.components.ThemeToggleButton(
                    onThemeChanged = {}
                )
            }
        }

        // Verify theme toggle button is displayed
        composeTestRule.onNodeWithContentDescription("Switch to Light")
            .assertIsDisplayed()
    }

    @Test
    fun testRoleBasedAccess() {
        composeTestRule.setContent {
            ClutchPartnersTheme {
                // Test role-based access component
                com.clutch.partners.ui.components.RoleBasedView(
                    requiredRole = com.clutch.partners.data.model.PartnerRole.MANAGER,
                    userRole = com.clutch.partners.data.model.PartnerRole.STAFF,
                    userPermissions = com.clutch.partners.data.model.PartnerRole.STAFF.permissions
                ) {
                    // This content should not be displayed for staff role
                    androidx.compose.material3.Text("Manager Only Content")
                }
            }
        }

        // Verify access denied message is displayed
        composeTestRule.onNodeWithText("Access Denied")
            .assertIsDisplayed()
    }

    @Test
    fun testOrderCard() {
        val testOrder = com.clutch.partners.data.model.PartnerOrder(
            id = "test-order",
            customerName = "John Doe",
            customerPhone = "+1234567890",
            serviceName = "Oil Change",
            totalAmount = 50.0,
            status = com.clutch.partners.data.model.OrderStatus.PENDING,
            orderType = com.clutch.partners.data.model.OrderType.SERVICE
        )

        composeTestRule.setContent {
            ClutchPartnersTheme {
                com.clutch.partners.ui.screens.dashboard.OrderCard(
                    order = testOrder,
                    userRole = com.clutch.partners.data.model.PartnerRole.OWNER,
                    userPermissions = com.clutch.partners.data.model.PartnerRole.OWNER.permissions,
                    onClick = {},
                    onUpdateStatus = {}
                )
            }
        }

        // Verify order card elements
        composeTestRule.onNodeWithText("Oil Change")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("Customer: John Doe")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("Amount: EGP 50.0")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("View Details")
            .assertIsDisplayed()
    }

    @Test
    fun testPaymentCard() {
        val testPayment = com.clutch.partners.data.model.PartnerPayment(
            id = "test-payment",
            amount = 1000.0,
            status = com.clutch.partners.data.model.PaymentStatus.COMPLETED,
            type = com.clutch.partners.data.model.PaymentType.WEEKLY_PAYOUT
        )

        composeTestRule.setContent {
            ClutchPartnersTheme {
                com.clutch.partners.ui.screens.dashboard.PaymentCard(
                    payment = testPayment
                )
            }
        }

        // Verify payment card elements
        composeTestRule.onNodeWithText("EGP 1000.00")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("Weekly Payout")
            .assertIsDisplayed()
    }

    @Test
    fun testEmptyStates() {
        composeTestRule.setContent {
            ClutchPartnersTheme {
                com.clutch.partners.ui.screens.dashboard.EmptyOrdersState()
            }
        }

        // Verify empty state elements
        composeTestRule.onNodeWithText("No Orders Yet")
            .assertIsDisplayed()
        
        composeTestRule.onNodeWithText("You'll see customer orders and appointments here once they start coming in.")
            .assertIsDisplayed()
    }

    @Test
    fun testStatusBadges() {
        composeTestRule.setContent {
            ClutchPartnersTheme {
                com.clutch.partners.ui.screens.dashboard.StatusBadge(
                    status = "pending"
                )
            }
        }

        // Verify status badge
        composeTestRule.onNodeWithText("Pending")
            .assertIsDisplayed()
    }

    @Test
    fun testNavigationFlow() {
        // Test complete navigation flow
        composeTestRule.setContent {
            ClutchPartnersTheme {
                // Start with splash screen
                SplashScreen(
                    onNavigateToOnboarding = {
                        // Navigate to onboarding
                        composeTestRule.setContent {
                            ClutchPartnersTheme {
                                OnboardingScreen(
                                    onNavigateToPartnerTypeSelector = {
                                        // Navigate to auth
                                        composeTestRule.setContent {
                                            ClutchPartnersTheme {
                                                AuthScreen(
                                                    onNavigateToSignIn = {},
                                                    onNavigateToSignUp = {},
                                                    onNavigateToRequestToJoin = {}
                                                )
                                            }
                                        }
                                    }
                                )
                            }
                        }
                    },
                    onNavigateToDashboard = {}
                )
            }
        }

        // Verify initial splash screen
        composeTestRule.onNodeWithText("Clutch Partners")
            .assertIsDisplayed()
    }
}
