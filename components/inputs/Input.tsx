import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  desc?: string;
  isRequired?: boolean;
  inputIcon?: React.ReactNode;
  typeToggle?: boolean;
  error?: string | FieldError;
  name?: string;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    label,
    desc,
    isRequired = false,
    inputIcon,
    typeToggle = false,
    error = "",
    disabled = false,
    placeholder = "",
    name = "",
    className,
    ...rest
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const type = typeToggle ? (showPassword ? "text" : "password") : "text";

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block auth-label mb-1">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`auth-input-box w-full relative flex items-center rounded-md  transition-all
          border ${error ? "border-red-500" : "border-border"}
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "focus-within:border-white"
          }
        `}
      >
        {inputIcon && <span className="mr-2 text-gray-400">{inputIcon}</span>}
        <input
          type={type}
          name={name}
          autoComplete="off"
          ref={ref}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none auth-input text-white  "
          {...rest}
        />

        {typeToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-gray-400 hover:text-gray-200"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {desc && <span className="input-description">{desc}</span>}

      {error && (
        <p className="mt-1 text-xs text-red-500">
          {typeof error === "string" ? error : error?.message}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
