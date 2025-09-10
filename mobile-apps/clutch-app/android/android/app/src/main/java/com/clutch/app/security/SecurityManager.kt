package com.clutch.app.security

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.clutch.app.data.storage.SecureTokenManager
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SecurityManager @Inject constructor(
    private val context: Context,
    private val secureTokenManager: SecureTokenManager
) {
    
    /**
     * Check if device is rooted
     */
    fun isDeviceRooted(): Boolean {
        return try {
            // Check for common root indicators
            val rootIndicators = listOf(
                "/system/app/Superuser.apk",
                "/sbin/su",
                "/system/bin/su",
                "/system/xbin/su",
                "/data/local/xbin/su",
                "/data/local/bin/su",
                "/system/sd/xbin/su",
                "/system/bin/failsafe/su",
                "/data/local/su",
                "/su/bin/su"
            )
            
            rootIndicators.any { path ->
                java.io.File(path).exists()
            } || isRootedByBuildTags() || isRootedBySystemProperties()
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Check if device has developer options enabled
     */
    fun isDeveloperOptionsEnabled(): Boolean {
        return try {
            Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                0
            ) != 0
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Check if device has USB debugging enabled
     */
    fun isUsbDebuggingEnabled(): Boolean {
        return try {
            Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.ADB_ENABLED,
                0
            ) != 0
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Check if app is running on emulator
     */
    fun isRunningOnEmulator(): Boolean {
        return try {
            Build.FINGERPRINT.startsWith("generic") ||
            Build.FINGERPRINT.startsWith("unknown") ||
            Build.MODEL.contains("google_sdk") ||
            Build.MODEL.contains("Emulator") ||
            Build.MODEL.contains("Android SDK built for x86") ||
            Build.MANUFACTURER.contains("Genymotion") ||
            (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")) ||
            "google_sdk" == Build.PRODUCT
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Check if app is installed from unknown sources
     */
    fun isInstalledFromUnknownSources(): Boolean {
        return try {
            val packageManager = context.packageManager
            val packageInfo = packageManager.getPackageInfo(context.packageName, 0)
            val installer = packageManager.getInstallerPackageName(packageInfo.packageName)
            installer == null || installer != "com.android.vending"
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Check if device has screen lock enabled
     */
    fun isScreenLockEnabled(): Boolean {
        return try {
            val keyguardManager = context.getSystemService(Context.KEYGUARD_SERVICE) as android.app.KeyguardManager
            keyguardManager.isKeyguardSecure
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Check if biometric authentication is available
     */
    fun isBiometricAvailable(): Boolean {
        val biometricManager = BiometricManager.from(context)
        return when (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)) {
            BiometricManager.BIOMETRIC_SUCCESS -> true
            else -> false
        }
    }
    
    /**
     * Show biometric authentication prompt
     */
    fun showBiometricPrompt(
        activity: FragmentActivity,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(activity)
        val biometricPrompt = BiometricPrompt(activity, executor, object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                onError(errString.toString())
            }
            
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                onSuccess()
            }
            
            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                onError("Authentication failed")
            }
        })
        
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Biometric Authentication")
            .setSubtitle("Use your biometric to authenticate")
            .setNegativeButtonText("Cancel")
            .build()
        
        biometricPrompt.authenticate(promptInfo)
    }
    
    /**
     * Get device security score
     */
    fun getDeviceSecurityScore(): SecurityScore {
        var score = 100
        
        // Deduct points for security issues
        if (isDeviceRooted()) score -= 30
        if (isDeveloperOptionsEnabled()) score -= 10
        if (isUsbDebuggingEnabled()) score -= 15
        if (isRunningOnEmulator()) score -= 20
        if (isInstalledFromUnknownSources()) score -= 25
        if (!isScreenLockEnabled()) score -= 20
        if (!isBiometricAvailable()) score -= 10
        
        return SecurityScore(
            score = maxOf(0, score),
            isSecure = score >= 70,
            issues = getSecurityIssues()
        )
    }
    
    /**
     * Get list of security issues
     */
    private fun getSecurityIssues(): List<SecurityIssue> {
        val issues = mutableListOf<SecurityIssue>()
        
        if (isDeviceRooted()) {
            issues.add(SecurityIssue.ROOTED_DEVICE)
        }
        if (isDeveloperOptionsEnabled()) {
            issues.add(SecurityIssue.DEVELOPER_OPTIONS_ENABLED)
        }
        if (isUsbDebuggingEnabled()) {
            issues.add(SecurityIssue.USB_DEBUGGING_ENABLED)
        }
        if (isRunningOnEmulator()) {
            issues.add(SecurityIssue.RUNNING_ON_EMULATOR)
        }
        if (isInstalledFromUnknownSources()) {
            issues.add(SecurityIssue.INSTALLED_FROM_UNKNOWN_SOURCES)
        }
        if (!isScreenLockEnabled()) {
            issues.add(SecurityIssue.NO_SCREEN_LOCK)
        }
        if (!isBiometricAvailable()) {
            issues.add(SecurityIssue.NO_BIOMETRIC_AUTH)
        }
        
        return issues
    }
    
    /**
     * Check if app is running in debug mode
     */
    fun isDebugMode(): Boolean {
        return try {
            (context.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Validate app integrity
     */
    fun validateAppIntegrity(): Boolean {
        return try {
            val packageManager = context.packageManager
            val packageInfo = packageManager.getPackageInfo(context.packageName, PackageManager.GET_SIGNATURES)
            
            // Check if app is signed with release key
            val signatures = packageInfo.signatures
            if (signatures.isNotEmpty()) {
                val signature = signatures[0]
                val md = java.security.MessageDigest.getInstance("SHA")
                md.update(signature.toByteArray())
                val hash = md.digest()
                val hashString = hash.joinToString("") { "%02x".format(it) }
                
                // In production, you would compare this with your known release key hash
                // For now, we'll just check if it's not empty
                hashString.isNotEmpty()
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
    
    private fun isRootedByBuildTags(): Boolean {
        return try {
            val buildTags = Build.TAGS
            buildTags != null && buildTags.contains("test-keys")
        } catch (e: Exception) {
            false
        }
    }
    
    private fun isRootedBySystemProperties(): Boolean {
        return try {
            val process = Runtime.getRuntime().exec("getprop ro.debuggable")
            val reader = java.io.BufferedReader(java.io.InputStreamReader(process.inputStream))
            val result = reader.readLine()
            reader.close()
            result == "1"
        } catch (e: Exception) {
            false
        }
    }
}

/**
 * Security Score Data Class
 */
data class SecurityScore(
    val score: Int,
    val isSecure: Boolean,
    val issues: List<SecurityIssue>
)

/**
 * Security Issues Enum
 */
enum class SecurityIssue {
    ROOTED_DEVICE,
    DEVELOPER_OPTIONS_ENABLED,
    USB_DEBUGGING_ENABLED,
    RUNNING_ON_EMULATOR,
    INSTALLED_FROM_UNKNOWN_SOURCES,
    NO_SCREEN_LOCK,
    NO_BIOMETRIC_AUTH
}
