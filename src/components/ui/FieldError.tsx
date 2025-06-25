interface FieldErrorProps {
  error?: string
  className?: string
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null

  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`}>
      {error}
    </p>
  )
}

interface FieldWrapperProps {
  children: React.ReactNode
  error?: string
  label?: string
  required?: boolean
  className?: string
}

export function FieldWrapper({ children, error, label, required = false, className = '' }: FieldWrapperProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      <FieldError error={error} />
    </div>
  )
} 