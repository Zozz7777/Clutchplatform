package com.clutch.app.data.api

import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RetryInterceptor @Inject constructor() : Interceptor {
    
    companion object {
        private const val MAX_RETRY_ATTEMPTS = 3
        private const val RETRY_DELAY_MS = 1000L
    }
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        var response: Response? = null
        var exception: IOException? = null
        
        // Try the request up to MAX_RETRY_ATTEMPTS times
        for (attempt in 1..MAX_RETRY_ATTEMPTS) {
            try {
                response = chain.proceed(request)
                
                // If successful, return the response
                if (response.isSuccessful) {
                    return response
                }
                
                // If not successful, check if we should retry
                if (shouldRetry(response.code(), attempt)) {
                    response.close()
                    Thread.sleep(RETRY_DELAY_MS * attempt) // Exponential backoff
                    continue
                } else {
                    return response
                }
            } catch (e: IOException) {
                exception = e
                
                // If it's a network error and we haven't exceeded max attempts, retry
                if (attempt < MAX_RETRY_ATTEMPTS && isRetryableException(e)) {
                    Thread.sleep(RETRY_DELAY_MS * attempt) // Exponential backoff
                    continue
                } else {
                    throw e
                }
            }
        }
        
        // If we get here, all retries failed
        return response ?: throw exception ?: IOException("Request failed after $MAX_RETRY_ATTEMPTS attempts")
    }
    
    /**
     * Determine if we should retry based on HTTP status code
     */
    private fun shouldRetry(statusCode: Int, attempt: Int): Boolean {
        return when (statusCode) {
            408, // Request Timeout
            429, // Too Many Requests
            500, // Internal Server Error
            502, // Bad Gateway
            503, // Service Unavailable
            504  // Gateway Timeout
            -> attempt < MAX_RETRY_ATTEMPTS
            
            else -> false
        }
    }
    
    /**
     * Determine if we should retry based on exception type
     */
    private fun isRetryableException(exception: IOException): Boolean {
        return when (exception) {
            is java.net.SocketTimeoutException,
            is java.net.ConnectException,
            is java.net.UnknownHostException -> true
            else -> false
        }
    }
}
