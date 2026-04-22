import { Request, Response, NextFunction } from 'express'

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Simple validation middleware - for now just pass through
  // TODO: Add proper validation logic
  return next()
}

export const validateUUID = (field: string) => {
  // Simple UUID validation
  return {
    validator: (value: any) => {
      return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    },
    message: `${field} must be a valid UUID`
  }
}

export const validateRequired = (field: string) => ({
  validator: (value: any) => value !== undefined && value !== null && value !== '',
  message: `${field} is required`
})

export const validateEmail = (field: string) => ({
  validator: (value: any) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message: `${field} must be a valid email`
})

export const validateEnum = (field: string, values: string[]) => ({
  validator: (value: any) => values.includes(value),
  message: `${field} must be one of: ${values.join(', ')}`
})

export const validateNumber = (field: string, options: { min?: number; max?: number } = {}) => ({
  validator: (value: any) => {
    const num = Number(value)
    if (isNaN(num)) return false
    if (options.min !== undefined && num < options.min) return false
    if (options.max !== undefined && num > options.max) return false
    return true
  },
  message: `${field} must be a valid number${options.min !== undefined ? ` >= ${options.min}` : ''}${options.max !== undefined ? ` <= ${options.max}` : ''}`
})

export const validateDate = (field: string) => ({
  validator: (value: any) => !isNaN(Date.parse(value)),
  message: `${field} must be a valid date`
})

export const validateLength = (field: string, options: { min?: number; max?: number } = {}) => ({
  validator: (value: any) => {
    if (typeof value !== 'string') return false
    if (options.min !== undefined && value.length < options.min) return false
    if (options.max !== undefined && value.length > options.max) return false
    return true
  },
  message: `${field} must be between ${options.min || 0} and ${options.max || 'unlimited'} characters`
})

export const validateDateTime = (field: string) => ({
  validator: (value: any) => !isNaN(Date.parse(value)),
  message: `${field} must be a valid ISO 8601 datetime`
})
