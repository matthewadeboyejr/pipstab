import { forwardRef, TextareaHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  desc?: string;
  isRequired?: boolean;
  error?: string | FieldError;
  name?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    const {
      label,
      desc,
      isRequired = false,
      error = "",
      disabled = false,
      placeholder = "",
      name = "",
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
          className={`textarea-input-box w-full relative flex items-center rounded-md bg-secondary transition-all
            border ${error ? "border-red-500" : "border-border"}
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "focus-within:border-white"
            }
          `}
        >
          <textarea
            name={name}
            autoComplete="off"
            ref={ref}
            disabled={disabled}
            placeholder={placeholder}
            rows={5}
            className="p-3 w-full textarea-input-box bg-transparent outline-none auth-input text-foreground"
            {...rest}
          ></textarea>
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

Textarea.displayName = "Textarea";
export default Textarea;
