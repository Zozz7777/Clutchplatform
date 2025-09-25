package com.clutch.partners

import android.app.Application
import com.clutch.partners.di.appModule
import com.google.firebase.FirebaseApp
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class ClutchPartnersApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        
        // Initialize Firebase
        FirebaseApp.initializeApp(this)
        
        // Initialize Koin
        startKoin {
            androidContext(this@ClutchPartnersApplication)
            modules(appModule)
        }
    }
}
