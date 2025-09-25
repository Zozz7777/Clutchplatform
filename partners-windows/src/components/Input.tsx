import React from 'react';
import { InputProps } from '../types';

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  maxLength,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const errorClasses = error ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-ring';
  const disabledClasses = disabled ? 'bg-muted cursor-not-allowed' : 'bg-background';
  
  const classes = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

  return (
    <div>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        className={classes}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
