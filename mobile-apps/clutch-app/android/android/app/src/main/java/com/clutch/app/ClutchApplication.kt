package com.clutch.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ClutchApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize app components
        initializeApp()
    }
    
    private fun initializeApp() {
        // Initialize any global app components here
        // This is called when the application starts
    }
}

