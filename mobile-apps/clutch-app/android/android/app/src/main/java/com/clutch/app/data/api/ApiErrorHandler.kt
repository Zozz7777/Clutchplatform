package com.clutch.app.data.api

import com.clutch.app.data.model.ApiError
import com.clutch.app.data.model.ApiResponse
import retrofit2.Response
import java.io.IOException
import java.net.HttpURLConnection
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ApiErrorHandler @Inject constructor() {
    
    /**
     * Handle API response and extract error information
     */
    fun <T> handleResponse(response: Response<T>): Result<T> {
        return when {
            response.isSuccessful -> {
                response.body()?.let { body ->
                    Result.success(body)
                } ?: Result.failure(ApiException("Empty response body"))
            }
            else -> {
                val error = parseError(response)
                Result.failure(ApiException(error.message, error.code, response.code()))
            }
        }
    }
    
    /**
     * Handle network exceptions
     */
    fun handleException(exception: Throwable): ApiException {
        return when (exception) {
            is IOException -> {
                ApiException(
                    message = "Network error. Please check your internet connection.",
                    code = "NETWORK_ERROR",
                    httpCode = 0
                )
            }
            is ApiException -> exception
            else -> {
                ApiException(
                    message = "An unexpected error occurred. Please try again.",
                    code = "UNKNOWN_ERROR",
                    httpCode = 0
                )
            }
        }
    }
    
    /**
     * Parse error from API response
     */
    private fun parseError(response: Response<*>): ApiError {
        return try {
            val errorBody = response.errorBody()?.string()
            if (!errorBody.isNullOrEmpty()) {
                // Try to parse as ApiResponse
                try {
                    val apiResponse = com.google.gson.Gson().fromJson(errorBody, ApiResponse::class.java)
                    ApiError(
                        code = apiResponse.message,
                        message = apiResponse.message,
                        details = null
                    )
                } catch (e: Exception) {
                    // Fallback to generic error
                    ApiError(
                        code = "PARSE_ERROR",
                        message = errorBody,
                        details = null
                    )
                }
            } else {
                ApiError(
                    code = "EMPTY_ERROR",
                    message = getDefaultErrorMessage(response.code()),
                    details = null
                )
            }
        } catch (e: Exception) {
            ApiError(
                code = "ERROR_PARSE_FAILED",
                message = getDefaultErrorMessage(response.code()),
                details = null
            )
        }
    }
    
    /**
     * Get default error message for HTTP status codes
     */
    private fun getDefaultErrorMessage(httpCode: Int): String {
        return when (httpCode) {
            HttpURLConnection.HTTP_BAD_REQUEST -> "Invalid request. Please check your input."
            HttpURLConnection.HTTP_UNAUTHORIZED -> "Authentication required. Please log in again."
            HttpURLConnection.HTTP_FORBIDDEN -> "Access denied. You don't have permission to perform this action."
            HttpURLConnection.HTTP_NOT_FOUND -> "The requested resource was not found."
            HttpURLConnection.HTTP_INTERNAL_ERROR -> "Server error. Please try again later."
            HttpURLConnection.HTTP_BAD_GATEWAY -> "Service temporarily unavailable. Please try again later."
            HttpURLConnection.HTTP_UNAVAILABLE -> "Service is currently unavailable. Please try again later."
            else -> "An error occurred. Please try again."
        }
    }
    
    /**
     * Check if error is retryable
     */
    fun isRetryableError(exception: Throwable): Boolean {
        return when (exception) {
            is IOException -> true
            is ApiException -> {
                when (exception.httpCode) {
                    HttpURLConnection.HTTP_INTERNAL_ERROR,
                    HttpURLConnection.HTTP_BAD_GATEWAY,
                    HttpURLConnection.HTTP_UNAVAILABLE -> true
                    else -> false
                }
            }
            else -> false
        }
    }
    
    /**
     * Get user-friendly error message
     */
    fun getUserFriendlyMessage(exception: Throwable): String {
        return when (exception) {
            is ApiException -> {
                when (exception.code) {
                    "NETWORK_ERROR" -> "Please check your internet connection and try again."
                    "AUTHENTICATION_ERROR" -> "Your session has expired. Please log in again."
                    "VALIDATION_ERROR" -> "Please check your input and try again."
                    "SERVER_ERROR" -> "Our servers are experiencing issues. Please try again later."
                    else -> exception.message ?: "Something went wrong. Please try again."
                }
            }
            is IOException -> "Please check your internet connection and try again."
            else -> "Something went wrong. Please try again."
        }
    }
}

/**
 * Custom API Exception class
 */
data class ApiException(
    val message: String,
    val code: String,
    val httpCode: Int
) : Exception(message)
