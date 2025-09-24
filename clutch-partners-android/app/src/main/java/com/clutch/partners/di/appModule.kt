package com.clutch.partners.di

import android.content.Context
import com.clutch.partners.data.api.PartnersApiService
import com.clutch.partners.data.local.PartnersLocalDataSource
import com.clutch.partners.data.local.PreferencesManager
import com.clutch.partners.data.repository.PartnersRepository
import com.clutch.partners.service.NotificationManager
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

val appModule = module {
    
    // Context
    single<Context> { androidContext() }
    
    // Gson
    single<Gson> {
        GsonBuilder()
            .setLenient()
            .create()
    }
    
    // OkHttp
    single<OkHttpClient> {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    // Retrofit
    single<Retrofit> {
        Retrofit.Builder()
            .baseUrl("https://clutch-main-nk7x.onrender.com/api/v1/")
            .client(get())
            .addConverterFactory(GsonConverterFactory.create(get()))
            .build()
    }
    
    // API Service
    single<PartnersApiService> {
        get<Retrofit>().create(PartnersApiService::class.java)
    }
    
    // Local Data Source
    single<PartnersLocalDataSource> { PartnersLocalDataSource() }
    
    // Preferences Manager
    single<PreferencesManager> { PreferencesManager(get()) }
    
    // Repository
    single<PartnersRepository> {
        PartnersRepository(
            apiService = get(),
            localDataSource = get(),
            preferencesManager = get()
        )
    }
    
    // Services
    single<NotificationManager> {
        NotificationManager(get())
    }
}
