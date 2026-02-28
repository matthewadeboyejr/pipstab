import { forwardRef, useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { FieldError } from "react-hook-form";

interface MultiInputProps {
  label?: string;
  desc?: string;
  isRequired?: boolean;
  error?: string | FieldError;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string[];
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
}

const MultiInput = forwardRef<HTMLInputElement, MultiInputProps>(
  (props, ref) => {
    const {
      label,
      desc,
      isRequired = false,
      error = "",
      disabled = false,
      placeholder = "Type and press Enter or comma to add items...",
      value = [],
      onChange,
      onBlur,
      name = "",
      ...rest
    } = props;

    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addItem();
      }
    };

    const addItem = () => {
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !value.includes(trimmedValue)) {
        const newValue = [...value, trimmedValue];
        onChange?.(newValue);
        setInputValue("");
      }
    };

    const removeItem = (indexToRemove: number) => {
      const newValue = value.filter((_, index) => index !== indexToRemove);
      onChange?.(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.includes(",")) {
        const items = val
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item);
        const newItems = items.filter((item) => !value.includes(item));
        if (newItems.length > 0) {
          onChange?.([...value, ...newItems]);
        }
        setInputValue("");
      } else {
        setInputValue(val);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={name} className="block auth-label mb-1">
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
        )}

        <div
          className={`auth-input-box w-full relative flex flex-wrap items-center gap-2 rounded-md bg-secondary transition-all p-2 min-h-[42px]
          border ${error ? "border-red-500" : "border-border"}
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "focus-within:border-foreground"
          }
        `}
        >
          {/* Display selected items as tags */}
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-foreground text-sm rounded-md"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-gray-400 hover:text-red-400 transition-colors"
                disabled={disabled}
              >
                <X size={14} />
              </button>
            </span>
          ))}

          {/* Input field */}
          <input
            type="text"
            name={name}
            ref={ref}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 bg-transparent outline-none auth-input text-foreground min-w-[120px]"
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

MultiInput.displayName = "MultiInput";
export default MultiInput;
