interface FormErrorMessageProps {
  message: string;
}

export function FormErrorMessage({ message }: FormErrorMessageProps) {
  return (
    <p className="text-xs text-destructive mt-1" role="alert">
      {message}
    </p>
  );
}
