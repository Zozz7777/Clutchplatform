export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

export const handleApiError = (error: any, context: string): string => {
  console.error(`Failed to ${context}:`, error)
  
  // Network/connection errors
  if (error.message?.includes('Network error') || 
      error.message?.includes('fetch') ||
      error.message?.includes('Failed to fetch')) {
    return 'Unable to connect to the server. Please check your connection and try again.'
  }
  
  // Authentication errors
  if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
    return 'Authentication required. Please log in again.'
  }
  
  // Permission errors
  if (error.statusCode === 403 || error.code === 'FORBIDDEN') {
    return 'You do not have permission to perform this action.'
  }
  
  // Validation errors
  if (error.statusCode === 400 || error.code === 'VALIDATION_ERROR') {
    return error.message || 'Invalid data provided. Please check your input.'
  }
  
  // Server errors
  if (error.statusCode >= 500 || error.code === 'INTERNAL_ERROR') {
    return 'Server error occurred. Please try again later.'
  }
  
  // Not found errors
  if (error.statusCode === 404 || error.code === 'NOT_FOUND') {
    return 'The requested resource was not found.'
  }
  
  // Rate limiting
  if (error.statusCode === 429 || error.code === 'RATE_LIMIT') {
    return 'Too many requests. Please wait a moment and try again.'
  }
  
  // Default error message
  return error.message || `Failed to ${context}`
}

export const logError = (error: any, context: string, additionalData?: any) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    },
    additionalData,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  }
  
  console.error(`🚨 Error [${context}]:`, JSON.stringify(errorDetails, null, 2))
}

export const createErrorBoundary = (error: any, context: string) => {
  logError(error, context)
  return handleApiError(error, context)
}
