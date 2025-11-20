import React, { useState } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
/* ---------------------------------------------
   🔹 Custom Styles for React Select
--------------------------------------------- */
export const customReactSelectStyles = (hasError) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: "38px",
    backgroundColor: state.isDisabled ? "#f3f4f6" : "transparent",
    cursor: state.isDisabled ? "not-allowed" : "default",
    borderColor: state.isDisabled
      ? "#9b9fa3ff"
      : hasError
      ? "#ef4444"
      : state.isFocused
      ? "#3b82f6"
      : "#9b9fa3ff",
    borderRadius: "0.5rem",
    borderWidth: state.isFocused ? "2px" : "1px",
    boxShadow: "none",
    "&:hover": {
      borderColor: state.isDisabled
        ? "#d1d5db"
        : hasError
        ? "#ef4444"
        : state.isFocused
        ? "#3b82f6"
        : "#9ca3af",
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "2px 8px",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "transparent",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 50,
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "#9ca3af" : "hsl(0, 0%, 20%)",
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "#9ca3af" : provided.color,
  }),
});

/* ---------------------------------------------
   🔹 FormInput — Text, Email, Number etc.
--------------------------------------------- */
export const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  error,
  disabled = false,
  className = "",
  background = "transparent",
}) => (
  <div className={`relative ${className}`}>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      disabled={disabled}
      style={{
        backgroundColor: background === "white" ? "#ffffff" : "transparent",
      }}
      className={`block w-full px-3 py-2 bg-transparent border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm ${
        error
          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
          : "border-gray-400 focus:ring-blue-500 focus:border-blue-500"
      } ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
    />
    <label
      htmlFor={name}
      className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 left-1 
        peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2 
        peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none 
        ${error ? "text-red-600" : "text-gray-700 peer-focus:text-blue-600"} 
        ${disabled ? "text-gray-400" : ""}`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

/* ---------------------------------------------
   🔹 FormInputWithPrefix — e.g. Proposal No.
--------------------------------------------- */
export const FormInputWithPrefix = ({
  label,
  name,
  value,
  onChange,
  prefix,
  type = "text",
  required = false,
  error,
  className = "",
  disabled = false,
  background = "transparent",
}) => (
  <div className={`relative ${className}`}>
    <div
      className={`flex rounded-lg border ${
        error ? "border-red-500" : "border-gray-400"
      } focus-within:ring-2 ${
        error
          ? "focus-within:ring-red-500 focus-within:border-red-500"
          : "focus-within:ring-blue-500 focus-within:border-blue-500"
      }`}
    >
      <span className="flex items-center px-3 text-sm text-gray-700 bg-gray-50 border-r border-gray-300 rounded-l-lg">
        {prefix}
      </span>

      <div className="relative w-full">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder=" "
          disabled={disabled}
          className={`block w-full px-3 py-2 bg-transparent appearance-none focus:outline-none peer text-sm rounded-r-lg border-none
            ${disabled ? "bg-gray-200 cursor-not-allowed text-gray-500" : ""}`}
        />
        <label
          htmlFor={name}
          className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 
            peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2 
            peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none 
            ${
              error ? "text-red-600" : "text-gray-700 peer-focus:text-blue-600"
            }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

/* ---------------------------------------------
    🔹 FormTextarea — Floating Label Textarea
--------------------------------------------- */
export const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = "",
  rows = 4, // Added a default rows prop
  background = "transparent",
}) => (
  <div className={`relative ${className}`}>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      disabled={disabled}
      rows={rows}
      style={{
        backgroundColor: background === "white" ? "#ffffff" : "transparent",
      }}
      className={`block w-full px-3 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm resize-y ${
        error
          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
          : "border-gray-400 focus:ring-blue-500 focus:border-blue-500"
      } ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
    />
    <label
      htmlFor={name}
      className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 
        peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2 
        peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none 
        ${error ? "text-red-600" : "text-gray-700 peer-focus:text-blue-600"} 
        ${disabled ? "text-gray-400" : ""}`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

/* ---------------------------------------------
   🔹 FormSelect — Dropdown (react-select)
--------------------------------------------- */
export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  isDisabled = false,
  className = "",
  background = "transparent",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = !!value;

  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={name}
        className={`absolute text-sm duration-300 transform z-10 origin-[0] px-2 left-1 pointer-events-none
          ${
            isFocused || hasValue
              ? "scale-75 -translate-y-4 top-2"
              : "scale-100 translate-y-0 top-1.5"
          }
          ${
            error
              ? "text-red-600"
              : isFocused
              ? "text-blue-600"
              : "text-gray-700"
          }
          ${isDisabled ? "text-gray-400 bg-gray-50" : "bg-white"}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        placeholder=" "
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        styles={customReactSelectStyles(!!error)}
        isDisabled={isDisabled}
        classNamePrefix="select"
        menuPlacement="auto"
        maxMenuHeight={200}
        {...props}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export const FormNumberInputWithPrefix = ({
  label,
  name,
  value,
  onChange,
  prefix,
  required = false,
  error,
  className = "",
  disabled = false,
  minDigits = 6, // default 6 digits
}) => {
  const handleChange = (e) => {
    // remove non-digits
    const rawValue = e.target.value.replace(/\D/g, "");

    // Ensure max 6 digits if needed
    const numericValue = rawValue.slice(-minDigits);

    // Notify parent (stores plain number string)
    onChange({
      target: {
        name,
        value: numericValue,
      },
    });
  };

  // Always display padded version
  const displayValue = value
    ? value.toString().padStart(minDigits, "0")
    : "".padStart(minDigits, "0");

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex rounded-lg border ${
          error ? "border-red-500" : "border-gray-400"
        } focus-within:ring-2 ${
          error
            ? "focus-within:ring-red-500 focus-within:border-red-500"
            : "focus-within:ring-blue-500 focus-within:border-blue-500"
        }`}
      >
        {prefix && (
          <span className="flex items-center px-3 text-sm text-gray-700 bg-gray-50 border-r border-gray-400 rounded-l-lg">
            {prefix}
          </span>
        )}

        <div className="relative w-full">
          <input
            type="text"
            id={name}
            name={name}
            inputMode="numeric"
            pattern="[0-9]*"
            value={displayValue}
            onChange={handleChange}
            placeholder=" "
            disabled={disabled}
            className={`block w-full px-3 py-2 bg-transparent appearance-none focus:outline-none peer text-sm rounded-r-lg border-none
              ${
                disabled ? "bg-gray-200 cursor-not-allowed text-gray-500" : ""
              }`}
          />

          <label
            htmlFor={name}
            className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 
              peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2 
              peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none 
              ${
                error
                  ? "text-red-600"
                  : "text-gray-700 peer-focus:text-blue-600"
              }`}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

/* ---------------------------------------------
   🔹 FormPhoneInputFloating — Phone Input with Floating Label
--------------------------------------------- */
export const FormPhoneInputFloating = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = "",
  country = "in",
  enableSearch = true,
  background = "transparent",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = !!value;

  return (
    <div className={`relative ${className}`}>
      <PhoneInput
        country={country}
        value={value}
        onChange={(phone) => onChange(phone)}
        inputProps={{
          name,
          required,
          autoFocus: false,
          disabled,
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
        }}
        inputStyle={{
          width: "100%",
          height: "42px",
          fontSize: "14px",
          border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
          borderRadius: "8px",
          paddingLeft: "48px",
          backgroundColor: disabled
            ? "#f3f4f6"
            : background === "white"
            ? "#ffffff"
            : "transparent",
        }}
        buttonStyle={{
          border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
          borderRadius: "8px 0 0 8px",
          backgroundColor: disabled ? "#f3f4f6" : "#f9fafb",
          height: "42px",
        }}
        dropdownStyle={{
          borderRadius: "8px",
          fontSize: "14px",
          zIndex: 50,
        }}
        searchStyle={{
          fontSize: "14px",
          padding: "8px",
          margin: "4px",
          borderRadius: "6px",
          border: "1px solid #d1d5db",
        }}
        enableSearch={enableSearch}
        searchPlaceholder="Search countries..."
        isValid={(value, country) => {
          if (value.match(/12345/)) {
            return "Invalid value: " + value + ", " + country.name;
          } else if (value.match(/1234/)) {
            return false;
          } else {
            return true;
          }
        }}
        disabled={disabled}
      />

      {/* Properly Aligned Floating Label */}
      {/* Fixed Floating Label - Always stay up when there's any value */}
      <label
        className={`absolute text-sm duration-300 transform z-10 origin-[0] px-2 left-1 pointer-events-none 
          scale-75 -translate-y-4 top-2
          ${
            error
              ? "text-red-600"
              : isFocused
              ? "text-blue-600"
              : "text-gray-500"
          }
          ${disabled ? "text-gray-400" : ""}`}
        style={{
          backgroundColor: background === "white" ? "#ffffff" : "transparent",
        }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
