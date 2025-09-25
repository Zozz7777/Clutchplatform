# Google Play App Access Requirements

## Test Account (Google Review Only)

### Credentials
- **Username (Partner ID or email):** `reviewer@yourclutch.com`
- **Password:** `Clutch@2025`

## App Access Instructions

### 1. Initial Setup
1. Open the app → splash screen → onboarding pages
   - Tap **Skip** if you don't want to view all onboarding steps
2. On the **Partner Type** screen, select **Auto Parts Shop**
3. Use the credentials above to sign in

### 2. Testing Features
Once logged in, you can test:

#### Orders Tab
- View orders & invoices with statuses (Pending / Paid / Rejected)
- Test order status updates
- View customer details and service/product information

#### Payments Tab
- View weekly income and payout countdown
- Check payout history in EGP
- Test payment status notifications

#### Store Settings Tab
- View and edit basic partner profile
- Update business information
- Modify working hours and contact details

### 3. Notifications
- Notifications are triggered for invoice/payment status changes
- Test push notifications for new orders
- Verify email/SMS notifications for rejected invoices

### 4. Language Support
- App defaults to **Arabic** (RTL)
- To switch to English → Settings → Language → English
- Test RTL/LTR layout switching

### 5. Theme Support
- Test light/dark theme toggle
- Verify theme persistence across app restarts

## Important Notes

- **No 2-step verification, QR codes, biometric login, or location-based restrictions are required**
- This account is pre-filled with demo data so reviewers can fully test app flows without generating real orders
- Please enable **"Allow Android to use the credentials you provide for performance and app compatibility testing."**

## Demo Data Available

The test account includes:
- 15+ sample orders with various statuses
- 8+ payment records with different amounts
- Complete business profile information
- Sample notifications and alerts
- Multi-language content (Arabic/English)

## Backend Integration

- All API endpoints are functional and tested
- Real-time data synchronization
- Proper error handling and validation
- RBAC (Role-Based Access Control) implemented

## Contact Information

For any issues during review:
- **Support Email:** support@yourclutch.com
- **Technical Contact:** dev@yourclutch.com
- **Backend Status:** https://clutch-main-nk7x.onrender.com/health

---

**Note:** This test account is specifically created for Google Play review purposes and contains demo data only. All features are fully functional and ready for testing.
