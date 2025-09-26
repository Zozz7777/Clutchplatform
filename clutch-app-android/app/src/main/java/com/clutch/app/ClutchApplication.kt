package com.clutch.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import com.google.firebase.FirebaseApp

@HiltAndroidApp
class ClutchApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Firebase
        FirebaseApp.initializeApp(this)
        
        // Initialize other services
        initializeServices()
    }
    
    private fun initializeServices() {
        // Initialize analytics, crashlytics, etc.
    }
}
