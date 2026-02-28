import { forwardRef } from "react";
import { InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface ImageInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  desc?: string;
  isRequired?: boolean;
  inputIcon?: React.ReactNode;
  error?: string | FieldError;
  name?: string;
  accept?: string;
  onImageChange?: (file: File) => void;
}

const ImageInput = forwardRef<HTMLInputElement, ImageInputProps>(
  (props, ref) => {
    const {
      label,
      desc,
      isRequired = false,
      inputIcon,
      error = "",
      disabled = false,
      placeholder = "",
      name = "",
      accept = "image/jpeg,image/png",
      onImageChange = () => {},
      ...rest
    } = props;

    return (
      <div className="w-full">
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
          {inputIcon && <span className="mr-2 text-gray-400">{inputIcon}</span>}
          <input
            type="file"
            name={name}
            autoComplete="off"
            ref={ref}
            disabled={disabled}
            placeholder={placeholder}
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImageChange(file);
              }
            }}
            className="w-full bg-transparent outline-none auth-input text-foreground"
            {...rest}
          />
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

ImageInput.displayName = "ImageInput";
export default ImageInput;
