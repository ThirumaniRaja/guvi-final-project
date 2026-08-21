import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={htmlFor}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {error ? <p className="form-error">{error}</p> : hint ? <p className="form-hint">{hint}</p> : null}
    </div>
  );
}
