# Mobile App Email Marketing Integration Guide

## Overview
This guide provides comprehensive integration examples for the Clutch Email Marketing Service in mobile applications. The service supports email campaigns, automation workflows, subscriber management, and analytics tracking.

## Base URL
```
https://clutch-main-nk7x.onrender.com/api/v1/email-marketing
```

## Authentication
All API endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. React Native Integration

### Setup
```bash
npm install axios @react-native-async-storage/async-storage
```

### Email Service Class
```javascript
// services/EmailMarketingService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EmailMarketingService {
  constructor() {
    this.baseURL = 'https://clutch-main-nk7x.onrender.com/api/v1/email-marketing';
    this.setupAxios();
  }

  async setupAxios() {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  async updateAuthToken(token) {
    await AsyncStorage.setItem('authToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Subscribe user to email marketing
  async subscribeUser(userData) {
    try {
      const response = await axios.post(`${this.baseURL}/subscribers`, {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        preferences: {
          newsletter: true,
          promotions: true,
          serviceReminders: true,
          maintenanceAlerts: true
        },
        tags: ['mobile-app', 'new-customer'],
        metadata: {
          signupSource: 'mobile-app',
          lastActivity: new Date().toISOString(),
          totalOrders: 0,
          loyaltyPoints: 0
        }
      });
      return response.data;
    } catch (error) {
      console.error('Subscribe error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update subscriber preferences
  async updatePreferences(email, preferences) {
    try {
      const response = await axios.put(`${this.baseURL}/subscribers/${email}`, {
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user's email campaigns
  async getUserCampaigns() {
    try {
      const response = await axios.get(`${this.baseURL}/campaigns`);
      return response.data;
    } catch (error) {
      console.error('Get campaigns error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Track email engagement
  async trackEngagement(emailId, action) {
    try {
      const response = await axios.post(`${this.baseURL}/analytics/track`, {
        emailId,
        action, // 'open', 'click', 'unsubscribe'
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: 'react-native',
          version: '1.0.0'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Track engagement error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Unsubscribe from emails
  async unsubscribe(email, reason = '') {
    try {
      const response = await axios.post(`${this.baseURL}/subscribers/${email}/unsubscribe`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Unsubscribe error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new EmailMarketingService();
```

### Usage in Components
```javascript
// components/EmailPreferences.js
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import EmailMarketingService from '../services/EmailMarketingService';

const EmailPreferences = ({ userEmail }) => {
  const [preferences, setPreferences] = useState({
    newsletter: true,
    promotions: true,
    serviceReminders: true,
    maintenanceAlerts: true
  });

  const handlePreferenceChange = async (key, value) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);
      
      await EmailMarketingService.updatePreferences(userEmail, newPreferences);
      Alert.alert('Success', 'Email preferences updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
      setPreferences(preferences); // Revert on error
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Email Preferences
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
        <Text>Newsletter</Text>
        <Switch
          value={preferences.newsletter}
          onValueChange={(value) => handlePreferenceChange('newsletter', value)}
        />
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
        <Text>Promotions</Text>
        <Switch
          value={preferences.promotions}
          onValueChange={(value) => handlePreferenceChange('promotions', value)}
        />
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
        <Text>Service Reminders</Text>
        <Switch
          value={preferences.serviceReminders}
          onValueChange={(value) => handlePreferenceChange('serviceReminders', value)}
        />
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
        <Text>Maintenance Alerts</Text>
        <Switch
          value={preferences.maintenanceAlerts}
          onValueChange={(value) => handlePreferenceChange('maintenanceAlerts', value)}
        />
      </View>
    </View>
  );
};

export default EmailPreferences;
```

---

## 2. Flutter Integration

### Setup
```yaml
# pubspec.yaml
dependencies:
  http: ^1.1.0
  shared_preferences: ^2.2.2
```

### Email Service Class
```dart
// services/email_marketing_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class EmailMarketingService {
  static const String baseURL = 'https://clutch-main-nk7x.onrender.com/api/v1/email-marketing';
  
  static Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('authToken');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await _getAuthToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Subscribe user to email marketing
  static Future<Map<String, dynamic>> subscribeUser({
    required String email,
    required String firstName,
    required String lastName,
    String? phone,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseURL/subscribers'),
        headers: headers,
        body: jsonEncode({
          'email': email,
          'firstName': firstName,
          'lastName': lastName,
          'phone': phone,
          'preferences': {
            'newsletter': true,
            'promotions': true,
            'serviceReminders': true,
            'maintenanceAlerts': true,
          },
          'tags': ['mobile-app', 'new-customer'],
          'metadata': {
            'signupSource': 'mobile-app',
            'lastActivity': DateTime.now().toIso8601String(),
            'totalOrders': 0,
            'loyaltyPoints': 0,
          },
        }),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to subscribe: ${response.body}');
      }
    } catch (e) {
      throw Exception('Subscribe error: $e');
    }
  }

  // Update subscriber preferences
  static Future<Map<String, dynamic>> updatePreferences({
    required String email,
    required Map<String, bool> preferences,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.put(
        Uri.parse('$baseURL/subscribers/$email'),
        headers: headers,
        body: jsonEncode({'preferences': preferences}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to update preferences: ${response.body}');
      }
    } catch (e) {
      throw Exception('Update preferences error: $e');
    }
  }

  // Track email engagement
  static Future<Map<String, dynamic>> trackEngagement({
    required String emailId,
    required String action,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseURL/analytics/track'),
        headers: headers,
        body: jsonEncode({
          'emailId': emailId,
          'action': action,
          'timestamp': DateTime.now().toIso8601String(),
          'deviceInfo': {
            'platform': 'flutter',
            'version': '1.0.0',
          },
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to track engagement: ${response.body}');
      }
    } catch (e) {
      throw Exception('Track engagement error: $e');
    }
  }

  // Unsubscribe from emails
  static Future<Map<String, dynamic>> unsubscribe({
    required String email,
    String reason = '',
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseURL/subscribers/$email/unsubscribe'),
        headers: headers,
        body: jsonEncode({'reason': reason}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to unsubscribe: ${response.body}');
      }
    } catch (e) {
      throw Exception('Unsubscribe error: $e');
    }
  }
}
```

### Usage in Widgets
```dart
// widgets/email_preferences_widget.dart
import 'package:flutter/material.dart';
import '../services/email_marketing_service.dart';

class EmailPreferencesWidget extends StatefulWidget {
  final String userEmail;

  const EmailPreferencesWidget({Key? key, required this.userEmail}) : super(key: key);

  @override
  _EmailPreferencesWidgetState createState() => _EmailPreferencesWidgetState();
}

class _EmailPreferencesWidgetState extends State<EmailPreferencesWidget> {
  Map<String, bool> preferences = {
    'newsletter': true,
    'promotions': true,
    'serviceReminders': true,
    'maintenanceAlerts': true,
  };

  bool _isLoading = false;

  Future<void> _updatePreference(String key, bool value) async {
    setState(() {
      _isLoading = true;
      preferences[key] = value;
    });

    try {
      await EmailMarketingService.updatePreferences(
        email: widget.userEmail,
        preferences: preferences,
      );
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Preferences updated successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
      // Revert on error
      setState(() {
        preferences[key] = !value;
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Email Preferences')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text(
                  'Email Preferences',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                _buildPreferenceSwitch('Newsletter', 'newsletter'),
                _buildPreferenceSwitch('Promotions', 'promotions'),
                _buildPreferenceSwitch('Service Reminders', 'serviceReminders'),
                _buildPreferenceSwitch('Maintenance Alerts', 'maintenanceAlerts'),
              ],
            ),
    );
  }

  Widget _buildPreferenceSwitch(String title, String key) {
    return SwitchListTile(
      title: Text(title),
      value: preferences[key] ?? false,
      onChanged: (value) => _updatePreference(key, value),
    );
  }
}
```

---

## 3. Native iOS Integration (Swift)

### Setup
```swift
// Add to your Podfile
pod 'Alamofire'
pod 'SwiftyJSON'
```

### Email Service Class
```swift
// EmailMarketingService.swift
import Foundation
import Alamofire
import SwiftyJSON

class EmailMarketingService {
    static let shared = EmailMarketingService()
    private let baseURL = "https://clutch-main-nk7x.onrender.com/api/v1/email-marketing"
    
    private init() {}
    
    private func getHeaders() -> HTTPHeaders {
        var headers: HTTPHeaders = [
            "Content-Type": "application/json"
        ]
        
        if let token = UserDefaults.standard.string(forKey: "authToken") {
            headers["Authorization"] = "Bearer \(token)"
        }
        
        return headers
    }
    
    // Subscribe user to email marketing
    func subscribeUser(email: String, firstName: String, lastName: String, phone: String? = nil, completion: @escaping (Result<JSON, Error>) -> Void) {
        let parameters: [String: Any] = [
            "email": email,
            "firstName": firstName,
            "lastName": lastName,
            "phone": phone ?? "",
            "preferences": [
                "newsletter": true,
                "promotions": true,
                "serviceReminders": true,
                "maintenanceAlerts": true
            ],
            "tags": ["mobile-app", "new-customer"],
            "metadata": [
                "signupSource": "mobile-app",
                "lastActivity": ISO8601DateFormatter().string(from: Date()),
                "totalOrders": 0,
                "loyaltyPoints": 0
            ]
        ]
        
        AF.request("\(baseURL)/subscribers", method: .post, parameters: parameters, encoding: JSONEncoding.default, headers: getHeaders())
            .responseJSON { response in
                switch response.result {
                case .success(let value):
                    completion(.success(JSON(value)))
                case .failure(let error):
                    completion(.failure(error))
                }
            }
    }
    
    // Update subscriber preferences
    func updatePreferences(email: String, preferences: [String: Bool], completion: @escaping (Result<JSON, Error>) -> Void) {
        let parameters: [String: Any] = ["preferences": preferences]
        
        AF.request("\(baseURL)/subscribers/\(email)", method: .put, parameters: parameters, encoding: JSONEncoding.default, headers: getHeaders())
            .responseJSON { response in
                switch response.result {
                case .success(let value):
                    completion(.success(JSON(value)))
                case .failure(let error):
                    completion(.failure(error))
                }
            }
    }
    
    // Track email engagement
    func trackEngagement(emailId: String, action: String, completion: @escaping (Result<JSON, Error>) -> Void) {
        let parameters: [String: Any] = [
            "emailId": emailId,
            "action": action,
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "deviceInfo": [
                "platform": "ios",
                "version": "1.0.0"
            ]
        ]
        
        AF.request("\(baseURL)/analytics/track", method: .post, parameters: parameters, encoding: JSONEncoding.default, headers: getHeaders())
            .responseJSON { response in
                switch response.result {
                case .success(let value):
                    completion(.success(JSON(value)))
                case .failure(let error):
                    completion(.failure(error))
                }
            }
    }
    
    // Unsubscribe from emails
    func unsubscribe(email: String, reason: String = "", completion: @escaping (Result<JSON, Error>) -> Void) {
        let parameters: [String: Any] = ["reason": reason]
        
        AF.request("\(baseURL)/subscribers/\(email)/unsubscribe", method: .post, parameters: parameters, encoding: JSONEncoding.default, headers: getHeaders())
            .responseJSON { response in
                switch response.result {
                case .success(let value):
                    completion(.success(JSON(value)))
                case .failure(let error):
                    completion(.failure(error))
                }
            }
    }
}
```

### Usage in View Controllers
```swift
// EmailPreferencesViewController.swift
import UIKit

class EmailPreferencesViewController: UIViewController {
    @IBOutlet weak var newsletterSwitch: UISwitch!
    @IBOutlet weak var promotionsSwitch: UISwitch!
    @IBOutlet weak var serviceRemindersSwitch: UISwitch!
    @IBOutlet weak var maintenanceAlertsSwitch: UISwitch!
    
    var userEmail: String = ""
    private var preferences: [String: Bool] = [:]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupSwitches()
    }
    
    private func setupSwitches() {
        preferences = [
            "newsletter": newsletterSwitch.isOn,
            "promotions": promotionsSwitch.isOn,
            "serviceReminders": serviceRemindersSwitch.isOn,
            "maintenanceAlerts": maintenanceAlertsSwitch.isOn
        ]
    }
    
    @IBAction func switchValueChanged(_ sender: UISwitch) {
        let key: String
        switch sender {
        case newsletterSwitch:
            key = "newsletter"
        case promotionsSwitch:
            key = "promotions"
        case serviceRemindersSwitch:
            key = "serviceReminders"
        case maintenanceAlertsSwitch:
            key = "maintenanceAlerts"
        default:
            return
        }
        
        preferences[key] = sender.isOn
        updatePreferences()
    }
    
    private func updatePreferences() {
        EmailMarketingService.shared.updatePreferences(email: userEmail, preferences: preferences) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(_):
                    self.showAlert(title: "Success", message: "Preferences updated successfully")
                case .failure(let error):
                    self.showAlert(title: "Error", message: "Failed to update preferences: \(error.localizedDescription)")
                }
            }
        }
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
```

---

## 4. Native Android Integration (Kotlin)

### Setup
```gradle
// build.gradle
dependencies {
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.9.0'
}
```

### Email Service Class
```kotlin
// EmailMarketingService.kt
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.*

interface EmailMarketingApi {
    @POST("subscribers")
    suspend fun subscribeUser(@Body subscriber: SubscriberRequest): ApiResponse<Subscriber>
    
    @PUT("subscribers/{email}")
    suspend fun updatePreferences(@Path("email") email: String, @Body request: PreferencesRequest): ApiResponse<Subscriber>
    
    @POST("analytics/track")
    suspend fun trackEngagement(@Body request: EngagementRequest): ApiResponse<Unit>
    
    @POST("subscribers/{email}/unsubscribe")
    suspend fun unsubscribe(@Path("email") email: String, @Body request: UnsubscribeRequest): ApiResponse<Unit>
}

class EmailMarketingService {
    companion object {
        private const val BASE_URL = "https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/"
        private var instance: EmailMarketingService? = null
        
        fun getInstance(): EmailMarketingService {
            if (instance == null) {
                instance = EmailMarketingService()
            }
            return instance!!
        }
    }
    
    private val api: EmailMarketingApi
    
    init {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .addInterceptor { chain ->
                val original = chain.request()
                val token = getAuthToken()
                val request = if (token != null) {
                    original.newBuilder()
                        .header("Authorization", "Bearer $token")
                        .build()
                } else {
                    original
                }
                chain.proceed(request)
            }
            .build()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        api = retrofit.create(EmailMarketingApi::class.java)
    }
    
    private fun getAuthToken(): String? {
        // Get token from SharedPreferences
        return null // Implement based on your auth system
    }
    
    suspend fun subscribeUser(email: String, firstName: String, lastName: String, phone: String? = null): Result<Subscriber> {
        return try {
            val request = SubscriberRequest(
                email = email,
                firstName = firstName,
                lastName = lastName,
                phone = phone,
                preferences = Preferences(
                    newsletter = true,
                    promotions = true,
                    serviceReminders = true,
                    maintenanceAlerts = true
                ),
                tags = listOf("mobile-app", "new-customer"),
                metadata = SubscriberMetadata(
                    signupSource = "mobile-app",
                    lastActivity = Date(),
                    totalOrders = 0,
                    loyaltyPoints = 0
                )
            )
            
            val response = api.subscribeUser(request)
            if (response.success) {
                Result.success(response.data!!)
            } else {
                Result.failure(Exception(response.error ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updatePreferences(email: String, preferences: Preferences): Result<Subscriber> {
        return try {
            val request = PreferencesRequest(preferences = preferences)
            val response = api.updatePreferences(email, request)
            if (response.success) {
                Result.success(response.data!!)
            } else {
                Result.failure(Exception(response.error ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun trackEngagement(emailId: String, action: String): Result<Unit> {
        return try {
            val request = EngagementRequest(
                emailId = emailId,
                action = action,
                timestamp = Date(),
                deviceInfo = DeviceInfo(
                    platform = "android",
                    version = "1.0.0"
                )
            )
            
            val response = api.trackEngagement(request)
            if (response.success) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.error ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun unsubscribe(email: String, reason: String = ""): Result<Unit> {
        return try {
            val request = UnsubscribeRequest(reason = reason)
            val response = api.unsubscribe(email, request)
            if (response.success) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.error ?: "Unknown error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// Data classes
data class SubscriberRequest(
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String?,
    val preferences: Preferences,
    val tags: List<String>,
    val metadata: SubscriberMetadata
)

data class Preferences(
    val newsletter: Boolean,
    val promotions: Boolean,
    val serviceReminders: Boolean,
    val maintenanceAlerts: Boolean
)

data class SubscriberMetadata(
    val signupSource: String,
    val lastActivity: Date,
    val totalOrders: Int,
    val loyaltyPoints: Int
)

data class PreferencesRequest(val preferences: Preferences)
data class EngagementRequest(val emailId: String, val action: String, val timestamp: Date, val deviceInfo: DeviceInfo)
data class UnsubscribeRequest(val reason: String)
data class DeviceInfo(val platform: String, val version: String)
data class ApiResponse<T>(val success: Boolean, val data: T?, val error: String?)
data class Subscriber(val id: String, val email: String, val firstName: String, val lastName: String)
```

### Usage in Activities
```kotlin
// EmailPreferencesActivity.kt
import android.os.Bundle
import android.widget.Switch
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class EmailPreferencesActivity : AppCompatActivity() {
    private lateinit var newsletterSwitch: Switch
    private lateinit var promotionsSwitch: Switch
    private lateinit var serviceRemindersSwitch: Switch
    private lateinit var maintenanceAlertsSwitch: Switch
    
    private val emailService = EmailMarketingService.getInstance()
    private var userEmail: String = ""
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_email_preferences)
        
        userEmail = intent.getStringExtra("user_email") ?: ""
        setupViews()
        setupListeners()
    }
    
    private fun setupViews() {
        newsletterSwitch = findViewById(R.id.newsletter_switch)
        promotionsSwitch = findViewById(R.id.promotions_switch)
        serviceRemindersSwitch = findViewById(R.id.service_reminders_switch)
        maintenanceAlertsSwitch = findViewById(R.id.maintenance_alerts_switch)
    }
    
    private fun setupListeners() {
        newsletterSwitch.setOnCheckedChangeListener { _, isChecked ->
            updatePreferences()
        }
        
        promotionsSwitch.setOnCheckedChangeListener { _, isChecked ->
            updatePreferences()
        }
        
        serviceRemindersSwitch.setOnCheckedChangeListener { _, isChecked ->
            updatePreferences()
        }
        
        maintenanceAlertsSwitch.setOnCheckedChangeListener { _, isChecked ->
            updatePreferences()
        }
    }
    
    private fun updatePreferences() {
        val preferences = Preferences(
            newsletter = newsletterSwitch.isChecked,
            promotions = promotionsSwitch.isChecked,
            serviceReminders = serviceRemindersSwitch.isChecked,
            maintenanceAlerts = maintenanceAlertsSwitch.isChecked
        )
        
        lifecycleScope.launch {
            try {
                val result = emailService.updatePreferences(userEmail, preferences)
                result.fold(
                    onSuccess = {
                        Toast.makeText(this@EmailPreferencesActivity, "Preferences updated successfully", Toast.LENGTH_SHORT).show()
                    },
                    onFailure = { error ->
                        Toast.makeText(this@EmailPreferencesActivity, "Error: ${error.message}", Toast.LENGTH_LONG).show()
                    }
                )
            } catch (e: Exception) {
                Toast.makeText(this@EmailPreferencesActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}
```

---

## 5. Testing the Integration

### Test Email Sending
```bash
# Test the email service
curl -X POST "https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"to":"YourClutchauto@gmail.com"}'
```

### Test Subscriber Management
```bash
# Add a subscriber
curl -X POST "https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/subscribers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "preferences": {
      "newsletter": true,
      "promotions": true,
      "serviceReminders": true,
      "maintenanceAlerts": true
    }
  }'
```

### Test Campaign Creation
```bash
# Create a campaign
curl -X POST "https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/campaigns" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Welcome Campaign",
    "subject": "Welcome to Clutch!",
    "templateType": "welcome",
    "targetAudience": {
      "segments": ["new-customer"]
    }
  }'
```

---

## 6. Best Practices

### 1. Error Handling
- Always implement proper error handling for network requests
- Show user-friendly error messages
- Implement retry logic for failed requests
- Log errors for debugging

### 2. User Experience
- Show loading indicators during API calls
- Provide immediate feedback for user actions
- Implement offline support where possible
- Use local caching for preferences

### 3. Security
- Never store sensitive data in plain text
- Use secure storage for authentication tokens
- Validate all user inputs
- Implement proper session management

### 4. Performance
- Implement request caching
- Use pagination for large data sets
- Optimize image loading in emails
- Monitor API response times

### 5. Analytics
- Track user engagement with emails
- Monitor unsubscribe rates
- Analyze campaign performance
- Use A/B testing for email content

---

## 7. Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if JWT token is valid
   - Ensure token is included in Authorization header
   - Verify token hasn't expired

2. **404 Not Found**
   - Verify API endpoint URL is correct
   - Check if service is deployed and running
   - Ensure route is properly registered

3. **500 Internal Server Error**
   - Check server logs for detailed error
   - Verify request payload format
   - Ensure all required fields are provided

4. **Email Not Sending**
   - Verify SMTP configuration
   - Check email credentials
   - Ensure recipient email is valid
   - Check spam folder

### Debug Tools
- Use browser developer tools for web testing
- Use Postman or similar tools for API testing
- Check server logs for detailed error messages
- Monitor network requests in mobile app

---

## 8. Support

For technical support or questions about the email marketing integration:

1. Check the API documentation
2. Review server logs for errors
3. Test endpoints using provided examples
4. Contact the development team

The email marketing service is now fully configured and ready for mobile app integration!
