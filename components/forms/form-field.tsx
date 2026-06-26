"use client";

import { type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { FormErrorMessage } from "./form-error-message";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  description?: string;
  required?: boolean;
}

export function FormField({
  label,
  error,
  children,
  description,
  required,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
      {error && <FormErrorMessage message={error} />}
    </div>
  );
}
