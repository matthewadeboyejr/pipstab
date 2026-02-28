import { forwardRef, SelectHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  desc?: string;
  isRequired?: boolean;
  error?: string | FieldError;
  name?: string;
  options: { value: string; label: string }[];
  className?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      desc,
      isRequired = false,
      error = "",
      disabled = false,
      name = "",
      options,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={name} className="block auth-label mb-1">
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
        )}

        <div
          className={`auth-input-box w-full relative flex items-center rounded-md bg-secondary transition-all
            border ${error ? "border-red-500" : "border-border"}
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "focus-within:border-foreground"
            }
          `}
        >
          <select
            name={name}
            ref={ref}
            disabled={disabled}
            className="w-full bg-transparent outline-none auth-input text-foreground p-2"
            {...rest}
          >
            <option value="" className="bg-secondary text-foreground">
              -- Select --
            </option>
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-secondary text-foreground"
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {desc && <span className="input-description">{desc}</span>}
        {error && (
          <p className="mt-1 text-xs text-red-500">
            {typeof error === "string" ? error : error?.message}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
