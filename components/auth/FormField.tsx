"use client";

import { InputHTMLAttributes, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export default function FormField({
  label,
  error,
  hint,
  icon,
  className = "",
  ...inputProps
}: FormFieldProps) {
  return (
    <div>
      <Label 
        htmlFor={inputProps.id} 
        className="text-sm font-medium text-gray-700 flex items-center gap-2"
      >
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </Label>
      <div className="relative mt-1">
        <Input
          {...inputProps}
          className={`h-12 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} transition-all ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputProps.id}-error` : hint ? `${inputProps.id}-hint` : undefined}
          autoComplete={
            inputProps.type === 'password' 
              ? inputProps.id === 'password' || inputProps.id === 'confirmPassword'
                ? 'current-password'
                : 'new-password'
              : inputProps.type === 'email'
              ? 'email'
              : inputProps.autoComplete
          }
        />
      </div>
      {error && (
        <p 
          id={`${inputProps.id}-error`}
          className="mt-1 text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p 
          id={`${inputProps.id}-hint`}
          className="mt-1 text-xs text-gray-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
}

