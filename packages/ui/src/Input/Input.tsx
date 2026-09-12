export type InputSize = "small" | "medium" | "large";

export interface InputProps {
  size?: InputSize;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

export function Input({
  size = "medium",
  disabled = false,
  error = false,
  placeholder,
}: InputProps) {
  return (
    <input
      disabled={disabled}
      placeholder={placeholder}
      data-size={size}
      data-error={error}
    />
  );
}
