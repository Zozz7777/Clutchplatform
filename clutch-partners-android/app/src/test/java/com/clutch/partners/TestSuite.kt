package com.clutch.partners

import com.clutch.partners.data.model.*
import com.clutch.partners.ui.theme.AppLanguage
import com.clutch.partners.ui.theme.AppTheme
import org.junit.Test
import org.junit.Assert.*

/**
 * Comprehensive test suite for Clutch Partners App
 * Tests all major features and functionality
 */
class TestSuite {

    @Test
    fun testPartnerUserModel() {
        // Test PartnerUser data model
        val partnerUser = PartnerUser(
            id = "test-id",
            email = "test@example.com",
            phone = "+1234567890",
            businessName = "Test Business",
            ownerName = "Test Owner",
            partnerType = PartnerType.REPAIR_CENTER,
            businessAddress = BusinessAddress(
                street = "123 Test St",
                city = "Test City",
                state = "Test State",
                zipCode = "12345",
                country = "Egypt"
            ),
            role = PartnerRole.OWNER,
            isActive = true
        )

        assertEquals("test-id", partnerUser.id)
        assertEquals("test@example.com", partnerUser.email)
        assertEquals(PartnerType.REPAIR_CENTER, partnerUser.partnerType)
        assertEquals(PartnerRole.OWNER, partnerUser.role)
        assertTrue(partnerUser.isActive)
    }

    @Test
    fun testPartnerOrderModel() {
        // Test PartnerOrder data model
        val order = PartnerOrder(
            id = "order-123",
            customerName = "John Doe",
            customerPhone = "+1234567890",
            serviceName = "Oil Change",
            totalAmount = 50.0,
            status = OrderStatus.PENDING,
            orderType = OrderType.SERVICE
        )

        assertEquals("order-123", order.id)
        assertEquals("John Doe", order.customerName)
        assertEquals("Oil Change", order.serviceName)
        assertEquals(50.0, order.totalAmount, 0.01)
        assertEquals(OrderStatus.PENDING, order.status)
        assertEquals(OrderType.SERVICE, order.orderType)
    }

    @Test
    fun testPartnerPaymentModel() {
        // Test PartnerPayment data model
        val payment = PartnerPayment(
            id = "payment-123",
            amount = 1000.0,
            status = PaymentStatus.COMPLETED,
            type = PaymentType.WEEKLY_PAYOUT
        )

        assertEquals("payment-123", payment.id)
        assertEquals(1000.0, payment.amount, 0.01)
        assertEquals(PaymentStatus.COMPLETED, payment.status)
        assertEquals(PaymentType.WEEKLY_PAYOUT, payment.type)
    }

    @Test
    fun testPartnerTypeEnum() {
        // Test all partner types
        assertEquals("Repair Center", PartnerType.REPAIR_CENTER.displayName)
        assertEquals("Auto Parts Shop", PartnerType.AUTO_PARTS_SHOP.displayName)
        assertEquals("Accessories Shop", PartnerType.ACCESSORIES_SHOP.displayName)
        assertEquals("Importer/Manufacturer", PartnerType.IMPORTER_MANUFACTURER.displayName)
        assertEquals("Service Center", PartnerType.SERVICE_CENTER.displayName)
    }

    @Test
    fun testPartnerRoleEnum() {
        // Test all partner roles
        assertEquals("Owner", PartnerRole.OWNER.displayName)
        assertEquals("Manager", PartnerRole.MANAGER.displayName)
        assertEquals("Staff", PartnerRole.STAFF.displayName)
        assertEquals("Accountant", PartnerRole.ACCOUNTANT.displayName)
    }

    @Test
    fun testPermissionEnum() {
        // Test all permissions
        assertEquals("Manage Orders", Permission.MANAGE_ORDERS.displayName)
        assertEquals("Manage Invoices", Permission.MANAGE_INVOICES.displayName)
        assertEquals("Manage Store Settings", Permission.MANAGE_STORE_SETTINGS.displayName)
        assertEquals("View Payments", Permission.VIEW_PAYMENTS.displayName)
        assertEquals("View Orders", Permission.VIEW_ORDERS.displayName)
        assertEquals("Update Order Status", Permission.UPDATE_ORDER_STATUS.displayName)
        assertEquals("View Invoices", Permission.VIEW_INVOICES.displayName)
    }

    @Test
    fun testOrderStatusEnum() {
        // Test all order statuses
        assertEquals("Pending", OrderStatus.PENDING.displayName)
        assertEquals("Paid", OrderStatus.PAID.displayName)
        assertEquals("Rejected", OrderStatus.REJECTED.displayName)
        assertEquals("Completed", OrderStatus.COMPLETED.displayName)
        assertEquals("Cancelled", OrderStatus.CANCELLED.displayName)
    }

    @Test
    fun testPaymentStatusEnum() {
        // Test all payment statuses
        assertEquals("Pending", PaymentStatus.PENDING.displayName)
        assertEquals("Completed", PaymentStatus.COMPLETED.displayName)
        assertEquals("Failed", PaymentStatus.FAILED.displayName)
        assertEquals("Cancelled", PaymentStatus.CANCELLED.displayName)
    }

    @Test
    fun testPaymentTypeEnum() {
        // Test all payment types
        assertEquals("Weekly Payout", PaymentType.WEEKLY_PAYOUT.displayName)
        assertEquals("Bonus", PaymentType.BONUS.displayName)
        assertEquals("Refund", PaymentType.REFUND.displayName)
        assertEquals("Adjustment", PaymentType.ADJUSTMENT.displayName)
    }

    @Test
    fun testOrderTypeEnum() {
        // Test all order types
        assertEquals("Service", OrderType.SERVICE.displayName)
        assertEquals("Product", OrderType.PRODUCT.displayName)
        assertEquals("Appointment", OrderType.APPOINTMENT.displayName)
    }

    @Test
    fun testAppLanguageEnum() {
        // Test language enum
        assertEquals("ar", AppLanguage.ARABIC.code)
        assertEquals("en", AppLanguage.ENGLISH.code)
        assertEquals("العربية", AppLanguage.ARABIC.displayName)
        assertEquals("English", AppLanguage.ENGLISH.displayName)
        assertTrue(AppLanguage.ARABIC.isRTL)
        assertFalse(AppLanguage.ENGLISH.isRTL)
        
        // Test fromCode method
        assertEquals(AppLanguage.ARABIC, AppLanguage.fromCode("ar"))
        assertEquals(AppLanguage.ENGLISH, AppLanguage.fromCode("en"))
        assertEquals(AppLanguage.ENGLISH, AppLanguage.fromCode("invalid"))
    }

    @Test
    fun testAppThemeEnum() {
        // Test theme enum
        assertEquals("Light", AppTheme.LIGHT.displayName)
        assertEquals("Dark", AppTheme.DARK.displayName)
        assertEquals("Auto", AppTheme.AUTO.displayName)
        
        // Test fromString method
        assertEquals(AppTheme.LIGHT, AppTheme.fromString("light"))
        assertEquals(AppTheme.DARK, AppTheme.fromString("dark"))
        assertEquals(AppTheme.AUTO, AppTheme.fromString("auto"))
        assertEquals(AppTheme.AUTO, AppTheme.fromString("invalid"))
    }

    @Test
    fun testBusinessAddressModel() {
        // Test BusinessAddress model
        val address = BusinessAddress(
            street = "123 Main St",
            city = "Cairo",
            state = "Cairo",
            zipCode = "11511",
            country = "Egypt"
        )

        assertEquals("123 Main St", address.street)
        assertEquals("Cairo", address.city)
        assertEquals("Cairo", address.state)
        assertEquals("11511", address.zipCode)
        assertEquals("Egypt", address.country)
    }

    @Test
    fun testWorkingHoursModel() {
        // Test WorkingHours model
        val workingHours = WorkingHours(
            monday = DayHours("09:00", "18:00", false),
            tuesday = DayHours("09:00", "18:00", false),
            wednesday = DayHours("09:00", "18:00", false),
            thursday = DayHours("09:00", "18:00", false),
            friday = DayHours("09:00", "18:00", false),
            saturday = DayHours("10:00", "16:00", false),
            sunday = null // Closed on Sunday
        )

        assertNotNull(workingHours.monday)
        assertNotNull(workingHours.tuesday)
        assertNull(workingHours.sunday)
        assertEquals("09:00", workingHours.monday?.open)
        assertEquals("18:00", workingHours.monday?.close)
    }

    @Test
    fun testBusinessSettingsModel() {
        // Test BusinessSettings model
        val settings = BusinessSettings(
            enableServiceOrders = true,
            enableProductOrders = true,
            enableAppointments = false,
            connectedToPartsSystem = true
        )

        assertTrue(settings.enableServiceOrders)
        assertTrue(settings.enableProductOrders)
        assertFalse(settings.enableAppointments)
        assertTrue(settings.connectedToPartsSystem)
    }

    @Test
    fun testNotificationSettingsModel() {
        // Test NotificationSettings model
        val notificationSettings = NotificationSettings(
            pushNotifications = true,
            emailNotifications = true,
            smsNotifications = false,
            orderNotifications = true,
            paymentNotifications = true,
            systemNotifications = false
        )

        assertTrue(notificationSettings.pushNotifications)
        assertTrue(notificationSettings.emailNotifications)
        assertFalse(notificationSettings.smsNotifications)
        assertTrue(notificationSettings.orderNotifications)
        assertTrue(notificationSettings.paymentNotifications)
        assertFalse(notificationSettings.systemNotifications)
    }

    @Test
    fun testAppPreferencesModel() {
        // Test AppPreferences model
        val preferences = AppPreferences(
            language = "ar",
            theme = "dark",
            currency = "EGP"
        )

        assertEquals("ar", preferences.language)
        assertEquals("dark", preferences.theme)
        assertEquals("EGP", preferences.currency)
    }

    @Test
    fun testNotificationTypeEnum() {
        // Test all notification types
        val types = NotificationType.values()
        assertTrue(types.contains(NotificationType.NEW_ORDER))
        assertTrue(types.contains(NotificationType.ORDER_UPDATE))
        assertTrue(types.contains(NotificationType.PAYMENT_RECEIVED))
        assertTrue(types.contains(NotificationType.PAYOUT_ISSUED))
        assertTrue(types.contains(NotificationType.INVOICE_REJECTED))
        assertTrue(types.contains(NotificationType.SYSTEM_UPDATE))
    }

    @Test
    fun testDataModelValidation() {
        // Test data validation
        val validPartner = PartnerUser(
            id = "valid-id",
            email = "valid@example.com",
            phone = "+1234567890",
            businessName = "Valid Business",
            ownerName = "Valid Owner",
            partnerType = PartnerType.REPAIR_CENTER,
            businessAddress = BusinessAddress(
                street = "Valid Street",
                city = "Valid City",
                state = "Valid State",
                zipCode = "12345",
                country = "Egypt"
            ),
            role = PartnerRole.OWNER,
            isActive = true
        )

        // All required fields should be present
        assertNotNull(validPartner.id)
        assertNotNull(validPartner.email)
        assertNotNull(validPartner.phone)
        assertNotNull(validPartner.businessName)
        assertNotNull(validPartner.ownerName)
        assertNotNull(validPartner.partnerType)
        assertNotNull(validPartner.businessAddress)
        assertNotNull(validPartner.role)
    }

    @Test
    fun testEnumCompleteness() {
        // Test that all enums have expected values
        assertEquals(5, PartnerType.values().size)
        assertEquals(4, PartnerRole.values().size)
        assertEquals(7, Permission.values().size)
        assertEquals(5, OrderStatus.values().size)
        assertEquals(4, PaymentStatus.values().size)
        assertEquals(4, PaymentType.values().size)
        assertEquals(3, OrderType.values().size)
        assertEquals(2, AppLanguage.values().size)
        assertEquals(3, AppTheme.values().size)
        assertEquals(6, NotificationType.values().size)
    }
}
