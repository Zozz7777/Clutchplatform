export interface ValidationResult<T> {
  isValid: boolean
  data: T | null
  error?: string
}

export const validateApiResponse = <T>(
  response: any, 
  expectedStructure: string,
  fallbackData?: T
): ValidationResult<T> => {
  try {
    if (!response) {
      return {
        isValid: false,
        data: fallbackData || null,
        error: 'No response received from server'
      }
    }

    if (!response.success) {
      return {
        isValid: false,
        data: fallbackData || null,
        error: response.message || 'Request failed'
      }
    }

    if (!response.data && response.data !== 0 && response.data !== false) {
      return {
        isValid: false,
        data: fallbackData || null,
        error: 'No data received from server'
      }
    }

    return {
      isValid: true,
      data: response.data as T
    }
  } catch (error: any) {
    return {
      isValid: false,
      data: fallbackData || null,
      error: `Validation error: ${error.message}`
    }
  }
}

export const validateArrayResponse = <T>(
  response: any,
  fallbackData: T[] = []
): ValidationResult<T[]> => {
  const result = validateApiResponse<T[]>(response, 'array', fallbackData)
  
  if (result.isValid && !Array.isArray(result.data)) {
    return {
      isValid: false,
      data: fallbackData,
      error: 'Expected array data but received different format'
    }
  }
  
  return result
}

export const validateObjectResponse = <T>(
  response: any,
  fallbackData: T | null = null
): ValidationResult<T> => {
  const result = validateApiResponse<T>(response, 'object', fallbackData || undefined)
  
  if (result.isValid && (Array.isArray(result.data) || typeof result.data !== 'object')) {
    return {
      isValid: false,
      data: fallbackData,
      error: 'Expected object data but received different format'
    }
  }
  
  return result
}

// Employee data structure validation and transformation
export const validateEmployeeData = (data: any): any => {
  // Check if data is already in nested structure
  if (data.basicInfo || data.employment || data.compensation) {
    return data
  }
  
  // Transform flat structure to nested structure
  const transformed: any = {}
  
  if (data.firstName || data.lastName || data.email || data.phone) {
    transformed.basicInfo = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone
    }
  }
  
  if (data.department || data.position || data.hireDate || data.status) {
    transformed.employment = {
      department: data.department,
      position: data.position,
      hireDate: data.hireDate,
      status: data.status || 'active'
    }
  }
  
  if (data.salary) {
    transformed.compensation = {
      salary: data.salary
    }
  }
  
  // Copy other fields that don't need transformation
  if (data.roles) transformed.roles = data.roles
  if (data.skills) transformed.skills = data.skills
  if (data.emergencyContact) transformed.emergencyContact = data.emergencyContact
  if (data.address) transformed.address = data.address
  if (data.notes) transformed.notes = data.notes
  
  return transformed
}

// Fleet data structure validation
export const validateFleetData = (data: any): any => {
  // Ensure tenantId is properly set
  if (data && !data.tenantId && data.organization) {
    data.tenantId = data.organization
  }
  
  return data
}

// Generic data sanitization
export const sanitizeData = <T>(data: T): T => {
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data } as any
    
    // Remove undefined values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key]
      }
    })
    
    return sanitized
  }
  
  return data
}
