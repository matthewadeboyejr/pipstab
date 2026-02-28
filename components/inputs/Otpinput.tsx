import { forwardRef } from "react";
import { InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | FieldError;
  name?: string;
}

const OtpInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    error = "",
    disabled = false,
    placeholder = "X",
    name = "",
    ...rest
  } = props;

  return (
    <div
      className={`otp-input-box w-[80px] h-[80px] flex items-center rounded-md bg-secondary transition-all
          border ${error ? "border-red-500" : "border-border"}
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "focus-within:border-foreground"
          }
        `}
    >
      <input
        type="text"
        maxLength={1}
        inputMode="numeric"
        pattern="[0-9]*"
        name={name}
        ref={ref}
        value={props.value}
        onChange={props.onChange}
        onPaste={props.onPaste}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none otp-input text-foreground"
        {...rest}
      />
    </div>
  );
});

OtpInput.displayName = "OtpInput";
export default OtpInput;
