import { useState, useCallback, useMemo } from 'react'
import { z } from 'zod'
import { validateContent, ValidationError } from '@/lib/schemas/content-validation'

interface UseFormValidationProps<T> {
  schema: z.ZodSchema<T>
  initialData?: any
}

interface FormValidationState {
  errors: Record<string, string>
  isValid: boolean
  isSubmittable: boolean
  touchedFields: Set<string>
  hasBeenValidated: boolean
}

export function useFormValidation<T>({ schema, initialData }: UseFormValidationProps<T>) {
  const [validationState, setValidationState] = useState<FormValidationState>({
    errors: {},
    isValid: false,
    isSubmittable: false,
    touchedFields: new Set(),
    hasBeenValidated: false
  })

  const validateField = useCallback((fieldName: string, value: any, formData: any) => {
    setValidationState(prev => {
      const newTouchedFields = new Set(prev.touchedFields)
      newTouchedFields.add(fieldName)

      // Run full schema validation with the updated field value
      const updatedFormData = { ...formData, [fieldName]: value }
      const fullValidation = validateContent(schema, updatedFormData)
      
      // Extract field-specific errors from schema validation
      const newErrors = { ...prev.errors }
      
      // Clear the current field's error first
      delete newErrors[fieldName]
      
      // Add any new errors for this field from schema validation
      const fieldError = fullValidation.errors.find(error => error.field === fieldName)
      if (fieldError) {
        newErrors[fieldName] = fieldError.message
      }

      return {
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
        isSubmittable: fullValidation.isValid,
        touchedFields: newTouchedFields,
        hasBeenValidated: prev.hasBeenValidated
      }
    })
  }, [schema])

  const validateForm = useCallback((formData: any, showAllErrors: boolean = false): { isValid: boolean; errors: ValidationError[] } => {
    const result = validateContent(schema, formData)
    
    setValidationState(prev => {
      const newErrors: Record<string, string> = {}
      
      // Only show errors for touched fields unless showAllErrors is true (form submission)
      result.errors.forEach(error => {
        if (showAllErrors || prev.touchedFields.has(error.field) || prev.touchedFields.has(error.field.split('.')[0])) {
          newErrors[error.field] = error.message
        }
      })



      return {
        errors: newErrors,
        isValid: result.isValid,
        isSubmittable: result.isValid,
        touchedFields: prev.touchedFields,
        hasBeenValidated: showAllErrors || prev.hasBeenValidated
      }
    })

    return result
  }, [schema])

  const clearFieldError = useCallback((fieldName: string) => {
    setValidationState(prev => {
      const newErrors = { ...prev.errors }
      delete newErrors[fieldName]
      
      const hasErrors = Object.keys(newErrors).length > 0
      
      return {
        ...prev,
        errors: newErrors,
        isValid: !hasErrors,
        isSubmittable: !hasErrors
      }
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setValidationState(prev => ({
      ...prev,
      errors: {},
      isValid: true,
      isSubmittable: true,
      touchedFields: new Set()
    }))
  }, [])

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    // Only return error if field has been touched
    if (validationState.touchedFields.has(fieldName)) {
      return validationState.errors[fieldName]
    }
    return undefined
  }, [validationState.errors, validationState.touchedFields])

  const hasFieldError = useCallback((fieldName: string): boolean => {
    // Only return error if field has been touched
    if (validationState.touchedFields.has(fieldName)) {
      return fieldName in validationState.errors
    }
    return false
  }, [validationState.errors, validationState.touchedFields])

  const isFieldTouched = useCallback((fieldName: string): boolean => {
    return validationState.touchedFields.has(fieldName)
  }, [validationState.touchedFields])

  // Get errors for nested fields (like contentSections.0.title)
  const getNestedFieldError = useCallback((basePath: string, index?: number, subField?: string): string | undefined => {
    const fullPath = index !== undefined && subField ? `${basePath}.${index}.${subField}` : basePath
    if (validationState.touchedFields.has(fullPath)) {
      return validationState.errors[fullPath]
    }
    return undefined
  }, [validationState.errors, validationState.touchedFields])

  return {
    // State
    errors: validationState.errors,
    isValid: validationState.isValid,
    isSubmittable: validationState.isSubmittable,
    
    // Methods
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    getNestedFieldError,
    
    // Computed properties
    hasAnyErrors: Object.keys(validationState.errors).length > 0
  }
} 