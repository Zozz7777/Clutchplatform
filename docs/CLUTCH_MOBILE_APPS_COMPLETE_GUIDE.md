# 📱 Clutch Mobile Apps - Complete Documentation

> **Note**: This documentation covers the mobile applications that were part of the Clutch platform. The mobile apps have been removed from the codebase, but this documentation preserves all the technical details and implementation information for reference.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Clutch App (Customer App)](#clutch-app-customer-app)
3. [Clutch Partners App](#clutch-partners-app)
4. [Technical Architecture](#technical-architecture)
5. [Key Features Comparison](#key-features-comparison)
6. [API Integration](#api-integration)
7. [User Interface & Design](#user-interface--design)
8. [Authentication & Security](#authentication--security)
9. [Data Models](#data-models)
10. [Development & Building](#development--building)
11. [File Structure](#file-structure)
12. [Integration with Backend](#integration-with-backend)
13. [Support & Resources](#support--resources)

---

## 🎯 System Overview

The **Clutch Mobile Apps** consist of two complementary Android applications that form the core of the Clutch automotive platform ecosystem:

### **1. Clutch App (Customer App)**
- **Target Users**: Vehicle owners and customers
- **Purpose**: Order auto parts, book services, manage vehicles
- **Platform**: Android (Kotlin + Jetpack Compose)
- **Integration**: Connects to Clutch backend for real-time data

### **2. Clutch Partners App**
- **Target Users**: Mechanics, service centers, auto parts shops
- **Purpose**: Manage orders, provide quotes, handle customer requests
- **Platform**: Android (Kotlin + Jetpack Compose)
- **Integration**: Business management and customer service

### **Platform Integration**
Both apps integrate seamlessly with the Clutch shared backend, providing real-time synchronization, notifications, and comprehensive business management capabilities.

---

## 📱 Clutch App (Customer App)

### **App Overview**
The Clutch customer app is a comprehensive mobile application designed for vehicle owners to manage their automotive needs. Built with modern Android technologies, it provides an intuitive interface for ordering parts, booking services, and managing vehicle information.

### **Core Features**

#### **🔐 Authentication System**
- **User Registration**: Email-based registration with OTP verification
- **Login/Logout**: Secure authentication with JWT tokens
- **Password Management**: Forgot password and reset functionality
- **Biometric Authentication**: Fingerprint and face recognition support
- **Session Management**: Automatic token refresh and secure storage

#### **🚗 Vehicle Management**
- **Vehicle Registration**: Add multiple vehicles to user profile
- **Vehicle Information**: Make, model, year, VIN, license plate, color, mileage
- **Vehicle History**: Service history and maintenance records
- **Vehicle Photos**: Image storage and management
- **Vehicle Updates**: Edit and update vehicle information

#### **🔧 Auto Parts Ordering**
- **Parts Catalog**: Browse comprehensive auto parts inventory
- **Category Navigation**: Organized by parts categories and subcategories
- **Search Functionality**: Advanced search with filters (brand, category, price)
- **Part Details**: Detailed specifications, compatibility, and pricing
- **Shopping Cart**: Add multiple parts and manage quantities
- **Order Processing**: Complete checkout with multiple payment options
- **Order Tracking**: Real-time order status and delivery tracking
- **Order History**: Complete order history and reorder functionality

#### **🛠️ Service Booking**
- **Service Centers**: Find nearby service centers with ratings and reviews
- **Service Categories**: Browse services by category (maintenance, repair, etc.)
- **Service Booking**: Schedule appointments with preferred time slots
- **Booking Management**: View, modify, and cancel bookings
- **Service History**: Track completed services and maintenance records
- **Service Reviews**: Rate and review service experiences

#### **💳 Payment & Billing**
- **Multiple Payment Methods**: Credit cards, digital wallets, bank transfers
- **Payment Security**: Encrypted payment processing
- **Billing History**: Complete transaction history
- **Receipt Management**: Digital receipts and invoices
- **Loyalty Program**: Points and rewards system

#### **📱 User Experience**
- **Modern UI**: Material Design 3 with custom Clutch branding
- **Dark/Light Theme**: User preference support
- **Offline Capability**: Core features work without internet
- **Push Notifications**: Real-time updates and alerts
- **Multi-language Support**: Arabic and English localization

### **Technical Specifications**

#### **Technology Stack**
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Architecture**: MVVM with Repository pattern
- **Dependency Injection**: Hilt
- **Networking**: Retrofit + OkHttp
- **Database**: Room (local caching)
- **Image Loading**: Coil
- **Navigation**: Navigation Compose

#### **App Configuration**
```kotlin
// App Configuration Constants
const val BASE_URL = "https://clutch-main-nk7x.onrender.com/api/v1/"
const val API_TIMEOUT_SECONDS = 30L
const val MAX_RETRY_ATTEMPTS = 3
const val CACHE_SIZE_MB = 50L
const val CACHE_EXPIRY_HOURS = 24L
const val TOKEN_REFRESH_THRESHOLD_MINUTES = 5L
const val MAX_LOGIN_ATTEMPTS = 5
const val LOCKOUT_DURATION_MINUTES = 15L
const val ANIMATION_DURATION_MS = 300L
const val DEBOUNCE_DELAY_MS = 500L
const val PAGINATION_PAGE_SIZE = 20
```

#### **Feature Flags**
- **Biometric Authentication**: Enabled
- **Push Notifications**: Enabled
- **Analytics**: Enabled
- **Crash Reporting**: Enabled
- **Performance Monitoring**: Enabled

### **App Structure**

#### **Navigation Flow**
```
Onboarding → Authentication → Main App
├── Home Dashboard
├── Parts Management
│   ├── Parts Catalog
│   ├── Part Details
│   ├── Shopping Cart
│   └── Order History
├── Service Management
│   ├── Service Centers
│   ├── Service Booking
│   └── Booking History
└── Profile & Settings
    ├── User Profile
    ├── Vehicle Management
    ├── Payment Methods
    └── Settings
```

#### **Key Screens**
1. **OnboardingScreen**: App introduction and feature overview
2. **LoginScreen**: User authentication
3. **RegisterScreen**: New user registration
4. **OtpVerificationScreen**: OTP verification
5. **MainScreen**: Main app container with bottom navigation
6. **HomeScreen**: Dashboard with quick actions and recent activity
7. **PartsScreen**: Auto parts catalog and search
8. **PartDetailsScreen**: Detailed part information
9. **ShoppingCartScreen**: Cart management and checkout
10. **ServiceCentersScreen**: Find and browse service centers
11. **BookServiceScreen**: Service booking interface
12. **UserProfileScreen**: User profile management
13. **SettingsScreen**: App settings and preferences

---

## 🤝 Clutch Partners App

### **App Overview**
The Clutch Partners app is designed for mechanics, service centers, and auto parts shops to manage their business operations, handle customer requests, and provide quotes for auto parts and services.

### **Core Features**

#### **🏪 Shop Management**
- **Shop Profile**: Complete business information and settings
- **Location Management**: Service areas and delivery zones
- **Business Hours**: Operating hours and availability
- **Contact Information**: Phone, email, and communication preferences
- **Business Verification**: Document verification and approval process

#### **📦 Inventory Management**
- **Parts Inventory**: Manage auto parts stock and availability
- **Stock Tracking**: Real-time inventory levels and alerts
- **Category Management**: Organize parts by categories
- **Price Management**: Set pricing and markup strategies
- **Supplier Integration**: Manage supplier relationships

#### **📋 Order Management**
- **Order Notifications**: Real-time notifications for new orders
- **Quote System**: Provide quotes for auto parts orders
- **Order Processing**: Handle order fulfillment and delivery
- **Order Tracking**: Track order status and delivery
- **Customer Communication**: Chat and messaging with customers

#### **💰 Business Analytics**
- **Sales Reports**: Revenue and transaction analytics
- **Performance Metrics**: Order completion rates and customer satisfaction
- **Inventory Reports**: Stock levels and movement analysis
- **Financial Reports**: Profit and loss statements
- **Customer Insights**: Customer behavior and preferences

#### **🔔 Notification System**
- **Real-time Alerts**: Instant notifications for new orders
- **Quote Requests**: Notifications for quote opportunities
- **Order Updates**: Status changes and delivery notifications
- **System Alerts**: Important system and business notifications
- **Custom Notifications**: Personalized notification preferences

### **Partners App Integration Features**

#### **Auto Parts Shop Onboarding**
The Partners app includes a comprehensive onboarding system for auto parts shops:

1. **Business Information**: Shop name, license, tax ID, contact info
2. **Location Setup**: Address, coordinates, service radius, delivery areas
3. **Vehicle Brands**: Supported brands and specializations
4. **Inventory Setup**: Current inventory and system integration
5. **Pricing Strategy**: Markup percentages and competitive pricing
6. **Verification**: Document verification and bank account setup

#### **Real-Time Order Notification System**
- **Location-Based Matching**: Find nearby shops by vehicle brand and location
- **Order Notifications**: Instant alerts for new auto parts orders
- **Quote Management**: Provide quotes with available and missing parts
- **Delivery Estimation**: Calculate delivery times based on location
- **Priority System**: High, medium, low priority based on order urgency

#### **Quote Response System**
- **Available Parts**: Mark parts as available with pricing
- **Missing Parts**: Identify unavailable parts with alternatives
- **Total Pricing**: Calculate total order cost
- **Delivery Time**: Estimate delivery timeframe
- **Terms & Conditions**: Warranty, return policy, payment terms
- **Quote Validity**: 24-hour quote validity period

### **Technical Architecture**

#### **Dual-Sided Architecture**
The Partners app supports two user types:

1. **Mechanics**: Service order management, customer management, scheduling
2. **Auto Parts Shops**: Inventory management, quote system, order fulfillment

#### **Integration Components**
- **API Manager**: HTTP requests to Clutch backend
- **WebSocket Manager**: Real-time communication
- **Notification Service**: Push notifications and alerts
- **Location Service**: GPS and location-based features
- **Payment Integration**: Payment processing for orders

---

## 🏗️ Technical Architecture

### **Shared Architecture Components**

#### **Backend Integration**
```
┌─────────────────────────────────────────────────────────────────┐
│                    CLUTCH SHARED BACKEND                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   API       │  │  WEBSOCKET  │  │   DATABASE  │            │
│  │  SERVICES   │  │  SERVICES   │  │   (MongoDB) │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE APPS                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   CLUTCH    │  │   CLUTCH    │  │   ADMIN     │            │
│  │     APP     │  │  PARTNERS   │  │  DASHBOARD  │            │
│  │ (Customers) │  │     APP     │  │   (Web)     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

#### **API Endpoints**
Both apps connect to the same backend API with role-based access:

**Authentication Endpoints:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/verify-otp` - OTP verification
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

**Parts Endpoints:**
- `GET /parts` - Get parts with filters
- `GET /parts/{partId}` - Get specific part
- `GET /parts/categories` - Get part categories
- `GET /parts/expiring` - Get expiring parts

**Service Endpoints:**
- `GET /services` - Get services
- `GET /service-centers` - Get service centers
- `POST /bookings` - Create booking
- `GET /bookings` - Get user bookings

**Order Endpoints:**
- `GET /orders` - Get user orders
- `POST /orders` - Create order
- `GET /cart` - Get shopping cart
- `POST /cart/items` - Add to cart

### **Data Flow Architecture**

#### **Real-Time Synchronization**
1. **Local Database**: SQLite for offline capability
2. **API Synchronization**: Regular sync with backend
3. **WebSocket Connection**: Real-time updates
4. **Conflict Resolution**: Handle data conflicts
5. **Offline Queue**: Store operations when offline

#### **Caching Strategy**
- **Memory Cache**: Frequently accessed data
- **Disk Cache**: Persistent local storage
- **Network Cache**: API response caching
- **Image Cache**: Part and service images
- **Cache Invalidation**: Smart cache management

---

## ⚡ Key Features Comparison

| Feature | Clutch App (Customer) | Clutch Partners App |
|---------|----------------------|-------------------|
| **User Type** | Vehicle owners | Mechanics & shops |
| **Primary Function** | Order parts & services | Manage business operations |
| **Authentication** | Customer login | Business account login |
| **Vehicle Management** | ✅ Add/manage vehicles | ❌ Not applicable |
| **Parts Ordering** | ✅ Browse & order parts | ✅ Manage inventory |
| **Service Booking** | ✅ Book services | ✅ Manage bookings |
| **Quote System** | ❌ Receive quotes | ✅ Provide quotes |
| **Order Management** | ✅ Track orders | ✅ Process orders |
| **Payment Processing** | ✅ Make payments | ✅ Receive payments |
| **Notifications** | ✅ Order updates | ✅ New orders & quotes |
| **Analytics** | ✅ Personal history | ✅ Business analytics |
| **Location Services** | ✅ Find nearby services | ✅ Service area management |

---

## 🔌 API Integration

### **API Service Interface**
```kotlin
interface ApiService {
    // Authentication
    @POST("auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>
    
    @POST("auth/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>
    
    // Parts Management
    @GET("parts")
    suspend fun getParts(
        @Query("category") category: String? = null,
        @Query("brand") brand: String? = null,
        @Query("search") search: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<PaginatedResponse<Part>>
    
    // Service Management
    @GET("services")
    suspend fun getServices(
        @Query("category") category: String? = null,
        @Query("centerId") centerId: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<PaginatedResponse<Service>>
    
    // Order Management
    @GET("orders")
    suspend fun getUserOrders(
        @Query("status") status: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<PaginatedResponse<Order>>
    
    // Cart Management
    @GET("cart")
    suspend fun getCart(): Response<ApiResponse>
    
    @POST("cart/items")
    suspend fun addToCart(@Body item: AddToCartRequest): Response<ApiResponse>
}
```

### **Repository Pattern**
```kotlin
@Singleton
class PartsRepository @Inject constructor(
    private val apiService: ApiService
) {
    suspend fun getParts(
        category: String? = null,
        brand: String? = null,
        search: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<PaginatedResponse<Part>> {
        return try {
            val response = apiService.getParts(category, brand, search, page, limit)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch parts"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

---

## 🎨 User Interface & Design

### **Design System**

#### **Color Scheme**
```kotlin
// Primary Colors
val ClutchRed = Color(0xFFE53E3E)
val White = Color(0xFFFFFFFF)
val Black = Color(0xFF000000)

// Status Colors
val SuccessGreen = Color(0xFF10B981)
val WarningOrange = Color(0xFFF59E0B)
val ErrorRed = Color(0xFFEF4444)
val InfoBlue = Color(0xFF3B82F6)
```

#### **Typography**
- **Headings**: Bold, 20-24sp
- **Body Text**: Regular, 16sp
- **Caption**: Medium, 14sp
- **Small Text**: Regular, 12sp

#### **Component Library**
- **ClutchButton**: Primary action button with loading states
- **ClutchOutlinedButton**: Secondary action button
- **ClutchTextField**: Input field with validation
- **ClutchCard**: Content container with elevation
- **ClutchHeader**: Screen header with navigation
- **ClutchLoadingIndicator**: Loading states
- **ClutchErrorMessage**: Error display
- **ClutchEmptyState**: Empty state display
- **ClutchStatusBadge**: Status indicators

### **Navigation Architecture**

#### **Navigation Structure**
```kotlin
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
        composable("onboarding") { OnboardingScreen(navController) }
        composable("login") { LoginScreen(navController) }
        composable("register") { RegisterScreen(navController) }
        composable("otp_verification") { OtpVerificationScreen(navController) }
        
        // Main App Flow
        composable("main") { MainScreen(navController) }
        composable("home") { HomeScreen(navController) }
        
        // Parts Management
        composable("parts") { PartsScreenIntegrated(navController) }
        composable("part_details/{partId}") { backStackEntry ->
            val partId = backStackEntry.arguments?.getString("partId") ?: ""
            PartDetailsScreen(navController = navController, partId = partId)
        }
        
        // Service Management
        composable("service_centers") { ServiceCentersScreenIntegrated(navController) }
        composable("book_service/{centerId}/{serviceName}") { backStackEntry ->
            val centerId = backStackEntry.arguments?.getString("centerId") ?: ""
            val serviceName = backStackEntry.arguments?.getString("serviceName") ?: ""
            BookServiceScreen(navController = navController, centerId = centerId, serviceName = serviceName)
        }
        
        // Profile & Settings
        composable("profile") { UserProfileScreen(navController) }
        composable("settings") { SettingsScreen(navController) }
    }
}
```

---

## 🔒 Authentication & Security

### **Security Features**

#### **Authentication Flow**
1. **User Registration**: Email + password with OTP verification
2. **Login**: Secure authentication with JWT tokens
3. **Token Management**: Automatic refresh and secure storage
4. **Biometric Auth**: Fingerprint and face recognition
5. **Session Management**: Secure session handling

#### **Security Measures**
- **Data Encryption**: All sensitive data encrypted
- **Secure Storage**: Encrypted local storage for tokens
- **Network Security**: HTTPS with certificate pinning
- **Input Validation**: Client and server-side validation
- **Rate Limiting**: API rate limiting and abuse prevention
- **Audit Logging**: Complete activity logging

#### **Token Management**
```kotlin
class SecurityManager @Inject constructor(
    private val context: Context
) {
    private val prefs = context.getSharedPreferences("clutch_secure", Context.MODE_PRIVATE)
    
    fun saveTokens(accessToken: String, refreshToken: String) {
        prefs.edit()
            .putString("access_token", accessToken)
            .putString("refresh_token", refreshToken)
            .apply()
    }
    
    fun getAccessToken(): String? {
        return prefs.getString("access_token", null)
    }
    
    fun clearTokens() {
        prefs.edit().clear().apply()
    }
}
```

---

## 📊 Data Models

### **Core Data Models**

#### **User Models**
```kotlin
data class User(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val profileImage: String? = null,
    val isEmailVerified: Boolean = false,
    val createdAt: String,
    val updatedAt: String
)

data class UserProfile(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val profileImage: String? = null,
    val dateOfBirth: String? = null,
    val address: Address? = null,
    val preferences: UserPreferences? = null,
    val createdAt: String,
    val updatedAt: String
)
```

#### **Vehicle Models**
```kotlin
data class Vehicle(
    val id: String,
    val userId: String,
    val make: String,
    val model: String,
    val year: Int,
    val vin: String? = null,
    val licensePlate: String? = null,
    val color: String? = null,
    val mileage: Int? = null,
    val imageUrl: String? = null,
    val createdAt: String,
    val updatedAt: String
)
```

#### **Parts Models**
```kotlin
data class Part(
    val id: String,
    val name: String,
    val category: String,
    val brand: String,
    val partNumber: String,
    val description: String,
    val price: Double,
    val imageUrl: String? = null,
    val inStock: Boolean = true,
    val stockQuantity: Int = 0,
    val vehicleCompatibility: List<String> = emptyList(),
    val specifications: Map<String, String> = emptyMap(),
    val createdAt: String,
    val updatedAt: String
)

data class PartCategory(
    val id: String,
    val name: String,
    val description: String,
    val imageUrl: String? = null,
    val partsCount: Int = 0
)
```

#### **Service Models**
```kotlin
data class Service(
    val id: String,
    val name: String,
    val description: String,
    val category: String,
    val price: Double,
    val duration: Int, // in minutes
    val imageUrl: String? = null,
    val isAvailable: Boolean = true,
    val serviceCenters: List<String> = emptyList()
)

data class ServiceCenter(
    val id: String,
    val name: String,
    val address: String,
    val phone: String,
    val email: String,
    val rating: Double,
    val reviewCount: Int,
    val imageUrl: String? = null,
    val services: List<String> = emptyList(),
    val workingHours: Map<String, String> = emptyMap(),
    val location: Location? = null
)
```

#### **Order Models**
```kotlin
data class Order(
    val id: String,
    val userId: String,
    val items: List<OrderItem>,
    val totalAmount: Double,
    val status: OrderStatus,
    val shippingAddress: Address,
    val paymentMethod: String,
    val createdAt: String,
    val updatedAt: String
)

data class OrderItem(
    val partId: String,
    val quantity: Int,
    val unitPrice: Double,
    val totalPrice: Double
)

enum class OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
```

#### **Booking Models**
```kotlin
data class Booking(
    val id: String,
    val userId: String,
    val serviceId: String,
    val serviceCenterId: String,
    val vehicleId: String,
    val scheduledDate: String,
    val scheduledTime: String,
    val status: BookingStatus,
    val totalPrice: Double,
    val notes: String? = null,
    val createdAt: String,
    val updatedAt: String
)

enum class BookingStatus {
    PENDING,
    CONFIRMED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}
```

---

## 🛠️ Development & Building

### **Development Environment**

#### **Prerequisites**
- **Android Studio**: Latest stable version
- **JDK**: Java Development Kit 11 or higher
- **Android SDK**: API level 24 (Android 7.0) minimum
- **Kotlin**: Version 1.8.0 or higher
- **Gradle**: Version 7.4 or higher

#### **Project Setup**
1. **Clone Repository**: Clone the mobile apps repository
2. **Open Project**: Open in Android Studio
3. **Sync Dependencies**: Run Gradle sync
4. **Configure Backend**: Update API base URL in configuration
5. **Build Project**: Build and run on device/emulator

#### **Build Configuration**
```gradle
android {
    compileSdk 34
    
    defaultConfig {
        applicationId "com.clutch.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
    
    kotlinOptions {
        jvmTarget = '11'
    }
    
    buildFeatures {
        compose true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.4'
    }
}
```

### **Dependencies**

#### **Core Dependencies**
```gradle
dependencies {
    // Core Android
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-compose:1.8.2'
    
    // Jetpack Compose
    implementation platform('androidx.compose:compose-bom:2023.10.01')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.ui:ui-graphics'
    implementation 'androidx.compose.ui:ui-tooling-preview'
    implementation 'androidx.compose.material3:material3'
    
    // Navigation
    implementation 'androidx.navigation:navigation-compose:2.7.5'
    
    // Dependency Injection
    implementation 'com.google.dagger:hilt-android:2.48'
    kapt 'com.google.dagger:hilt-compiler:2.48'
    
    // Networking
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
    
    // Image Loading
    implementation 'io.coil-kt:coil-compose:2.5.0'
    
    // Local Database
    implementation 'androidx.room:room-runtime:2.6.1'
    implementation 'androidx.room:room-ktx:2.6.1'
    kapt 'androidx.room:room-compiler:2.6.1'
    
    // Security
    implementation 'androidx.security:security-crypto:1.1.0-alpha06'
    
    // Testing
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    androidTestImplementation platform('androidx.compose:compose-bom:2023.10.01')
    androidTestImplementation 'androidx.compose.ui:ui-test-junit4'
    debugImplementation 'androidx.compose.ui:ui-tooling'
    debugImplementation 'androidx.compose.ui:ui-test-manifest'
}
```

---

## 📂 File Structure

### **Clutch App Structure**
```
mobile-apps/clutch-app/
├── android/
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/
│   │       └── main/
│   │           ├── AndroidManifest.xml
│   │           ├── java/com/clutch/app/
│   │           │   ├── ClutchApplication.kt
│   │           │   ├── MainActivity.kt
│   │           │   ├── config/
│   │           │   │   └── AppConfig.kt
│   │           │   ├── data/
│   │           │   │   ├── api/
│   │           │   │   │   ├── ApiClient.kt
│   │           │   │   │   ├── ApiService.kt
│   │           │   │   │   ├── AuthInterceptor.kt
│   │           │   │   │   └── RetryInterceptor.kt
│   │           │   │   ├── cache/
│   │           │   │   │   └── CacheManager.kt
│   │           │   │   ├── model/
│   │           │   │   │   └── ApiModels.kt
│   │           │   │   └── repository/
│   │           │   │       ├── AuthRepository.kt
│   │           │   │       ├── PartsRepository.kt
│   │           │   │       ├── ServicesRepository.kt
│   │           │   │       └── OrdersRepository.kt
│   │           │   ├── di/
│   │           │   │   └── NetworkModule.kt
│   │           │   ├── security/
│   │           │   │   └── SecurityManager.kt
│   │           │   └── ui/
│   │           │       ├── components/
│   │           │       │   ├── ClutchComponents.kt
│   │           │       │   └── SearchAndFilterComponents.kt
│   │           │       ├── navigation/
│   │           │       │   └── ClutchNavigation.kt
│   │           │       ├── screens/
│   │           │       │   ├── auth/
│   │           │       │   ├── main/
│   │           │       │   ├── parts/
│   │           │       │   ├── services/
│   │           │       │   ├── cart/
│   │           │       │   └── profile/
│   │           │       ├── theme/
│   │           │       │   ├── Color.kt
│   │           │       │   ├── Theme.kt
│   │           │       │   └── Type.kt
│   │           │       └── viewmodels/
│   │           │           ├── PartsViewModel.kt
│   │           │           ├── ServicesViewModel.kt
│   │           │           └── OrdersViewModel.kt
│   │           └── res/
│   │               ├── values/
│   │               │   ├── colors.xml
│   │               │   ├── strings.xml
│   │               │   └── themes.xml
│   │               └── xml/
│   │                   ├── backup_rules.xml
│   │                   └── data_extraction_rules.xml
│   ├── build.gradle
│   ├── gradle/
│   │   └── wrapper/
│   │       └── gradle-wrapper.properties
│   ├── gradlew.bat
│   └── settings.gradle
```

### **Clutch Partners App Structure**
```
mobile-apps/clutchpartners/
├── android/
│   ├── app/
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
```

---

## 🔗 Integration with Backend

### **Backend Connection**

#### **API Configuration**
- **Base URL**: `https://clutch-main-nk7x.onrender.com/api/v1/`
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json`
- **Timeout**: 30 seconds
- **Retry Policy**: 3 attempts with exponential backoff

#### **WebSocket Integration**
- **Real-time Updates**: Order status, notifications, chat
- **Connection Management**: Auto-reconnect on network changes
- **Message Types**: Order updates, quote requests, notifications
- **Error Handling**: Graceful degradation on connection loss

#### **Data Synchronization**
- **Offline Support**: Core features work without internet
- **Sync Strategy**: Background sync when connection restored
- **Conflict Resolution**: Last-write-wins with user notification
- **Cache Management**: Smart cache invalidation

### **Error Handling**

#### **Network Error Handling**
```kotlin
class ApiErrorHandler {
    fun handleError(throwable: Throwable): String {
        return when (throwable) {
            is HttpException -> {
                when (throwable.code()) {
                    401 -> "Authentication required"
                    403 -> "Access denied"
                    404 -> "Resource not found"
                    500 -> "Server error"
                    else -> "Network error occurred"
                }
            }
            is SocketTimeoutException -> "Request timeout"
            is UnknownHostException -> "No internet connection"
            else -> "An unexpected error occurred"
        }
    }
}
```

#### **Retry Logic**
```kotlin
class RetryInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var response = chain.proceed(chain.request())
        var retryCount = 0
        
        while (!response.isSuccessful && retryCount < MAX_RETRY_ATTEMPTS) {
            retryCount++
            response.close()
            response = chain.proceed(chain.request())
        }
        
        return response
    }
}
```

---

## 📞 Support & Resources

### **Development Resources**

#### **Documentation**
- **API Documentation**: Complete API reference
- **UI Guidelines**: Design system and component library
- **Architecture Guide**: Technical architecture overview
- **Testing Guide**: Unit and integration testing
- **Deployment Guide**: Build and release process

#### **Development Tools**
- **Android Studio**: Primary IDE
- **Postman**: API testing
- **Figma**: UI/UX design
- **Git**: Version control
- **Gradle**: Build system

### **Testing Strategy**

#### **Unit Testing**
- **ViewModel Tests**: Business logic testing
- **Repository Tests**: Data layer testing
- **Utility Tests**: Helper function testing
- **Mock Objects**: API and database mocking

#### **Integration Testing**
- **API Integration**: Backend connectivity testing
- **Database Testing**: Local storage testing
- **Navigation Testing**: Screen flow testing
- **Authentication Testing**: Login/logout flow testing

#### **UI Testing**
- **Compose Testing**: UI component testing
- **Navigation Testing**: Screen navigation testing
- **User Flow Testing**: End-to-end user journey testing
- **Accessibility Testing**: Screen reader and accessibility testing

### **Performance Optimization**

#### **App Performance**
- **Memory Management**: Efficient memory usage
- **Image Optimization**: Compressed images and lazy loading
- **Network Optimization**: Request batching and caching
- **Database Optimization**: Efficient queries and indexing

#### **User Experience**
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Offline Support**: Core functionality without internet
- **Accessibility**: Screen reader and accessibility support

---

## 📝 Conclusion

The **Clutch Mobile Apps** represent a comprehensive solution for the automotive industry, providing both customer-facing and business management capabilities. With modern Android development practices, robust architecture, and seamless backend integration, these apps deliver a superior user experience for all stakeholders in the automotive ecosystem.

### **Key Strengths**
- ✅ **Modern Architecture**: MVVM with Jetpack Compose
- ✅ **Comprehensive Features**: Complete automotive solution
- ✅ **Real-time Integration**: Live updates and notifications
- ✅ **Offline Capability**: Core features work without internet
- ✅ **Security**: Enterprise-grade security measures
- ✅ **Scalability**: Designed for growth and expansion
- ✅ **User Experience**: Intuitive and responsive interface

### **Future Roadmap**
- **iOS Support**: Native iOS applications
- **Advanced Analytics**: Enhanced business intelligence
- **AI Integration**: Smart recommendations and insights
- **Multi-language Support**: Additional language support
- **Advanced Features**: Enhanced functionality and integrations

For more information, support, or to get started with the Clutch Mobile Apps, please refer to the additional documentation files or contact the development team.

---

*This documentation provides a comprehensive overview of both Clutch mobile applications. For specific technical details, please refer to the individual source code files and API documentation.*
