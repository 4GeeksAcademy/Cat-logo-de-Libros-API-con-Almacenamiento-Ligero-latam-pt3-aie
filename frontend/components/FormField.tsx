import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
}

export function FormField({ label, id, hint, ...inputProps }: FormFieldProps) {
  const inputId = id ?? inputProps.name;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} {...inputProps} aria-describedby={hint ? `${inputId}-hint` : undefined} />
      {hint && <small id={`${inputId}-hint`} className="field-hint">{hint}</small>}
    </div>
  );
}
