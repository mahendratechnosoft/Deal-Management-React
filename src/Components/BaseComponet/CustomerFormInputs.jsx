import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';




/* ---------------------------------------------
   🔹 GlobalInputField — Text Input with Standard Label
--------------------------------------------- */
export const GlobalInputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  placeholder = "",
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
      
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

/* ---------------------------------------------
   🔹 GlobalTextAreaField — TextArea with Standard Label
--------------------------------------------- */
export const GlobalTextAreaField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  placeholder = "",
  rows = 4,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
      
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

/* ---------------------------------------------
   🔹 GlobalSelectField — Select Input with Standard Label
--------------------------------------------- */
export const GlobalSelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
  disabled = false,
  placeholder = "Select...",
  className = "",
  isSearchable = true,
}) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      borderColor: state.isFocused
        ? "#3b82f6"
        : error
        ? "#ef4444"
        : "#e5e7eb",
      borderWidth: "1px",
      borderRadius: "6px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
      },
      backgroundColor: disabled ? "#f9fafb" : "white",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
      borderRadius: "6px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      "&:active": {
        backgroundColor: "#3b82f6",
        color: "white",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1f2937",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
    }),
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <Select
        name={name}
        value={options.find(option => option.value === value)}
        onChange={(selectedOption) => onChange({
          target: {
            name,
            value: selectedOption ? selectedOption.value : ""
          }
        })}
        options={options}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isDisabled={disabled}
        styles={customStyles}
        menuPlacement="auto"
      />
      
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
/* ---------------------------------------------
   🔹 GlobalPhoneInputField — Phone Input with Standard Label
--------------------------------------------- */
export const GlobalPhoneInputField = ({
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
  placeholder = "Enter phone number",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handlePhoneChange = (phone) => {
    onChange({
      target: {
        name,
        value: phone
      }
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Phone Input Container with black focus border */}
      <div className={`relative border rounded-lg transition-all duration-200 ${
        error 
          ? 'border-red-500 ring-1 ring-red-500' 
          : isFocused 
            ? 'border-black ring-2 ring-blue ring-opacity-20' 
            : 'border-gray-300'
      } ${disabled ? 'bg-gray-100' : ''}`}>
        
        <PhoneInput
          country={country}
          value={value}
          onChange={handlePhoneChange}
          enableSearch={enableSearch}
          placeholder={placeholder}
          disabled={disabled}
          inputProps={{
            name,
            required,
            autoFocus: false,
            disabled,
            onFocus: handleFocus,
            onBlur: handleBlur,
          }}
          inputStyle={{
            width: "100%",
            height: "40px",
            fontSize: "14px",
            border: "none",
            borderRadius: "8px",
            paddingLeft: "48px",
            backgroundColor: "transparent",
            boxShadow: "none",
            outline: "none",
            color: "#111827",
            fontWeight: "400",
          }}
          buttonStyle={{
            border: "none",
            backgroundColor: "transparent",
            height: "40px",
            marginRight: "4px",
          }}
          containerStyle={{
            border: "none",
            backgroundColor: "transparent",
          }}
          dropdownStyle={{
            borderRadius: "8px",
            fontSize: "14px",
            zIndex: 50,
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          searchStyle={{
            fontSize: "14px",
            padding: "8px",
            margin: "4px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            color: "#111827",
          }}
          searchPlaceholder="Search countries..."
        />
      </div>
      
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

/* ---------------------------------------------
   🔹 GlobalDateTimeField — Date/Time Input with Standard Label
--------------------------------------------- */
export const GlobalDateTimeField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = "",
  type = "datetime-local",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
      
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};






/* ---------------------------------------------
   🔹 GlobalMultiSelectField — Multi-Select using react-select
--------------------------------------------- */
export const GlobalMultiSelectField = ({
  label,
  name,
  value = [],
  onChange,
  options = [],
  placeholder = 'Select options...',
  error,
  required = false,
  disabled = false,
  loading = false,
  className = '',
  helpText = '',
  isSearchable = true,
  closeMenuOnSelect = false,  // Keep menu open after selection (optional)
}) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      borderColor: state.isFocused
        ? "#3b82f6"
        : error
        ? "#ef4444"
        : "#e5e7eb",
      borderWidth: "1px",
      borderRadius: "6px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
      },
      backgroundColor: disabled ? "#f9fafb" : "white",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
      borderRadius: "6px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      "&:active": {
        backgroundColor: "#3b82f6",
        color: "white",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#dbeafe",
      borderRadius: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#1e40af",
      fontWeight: "500",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#3b82f6",
      ":hover": {
        backgroundColor: "#bfdbfe",
        color: "#1e40af",
      },
    }),
  };

  // Convert array of IDs to react-select format
  const selectedValues = options.filter(option => 
    Array.isArray(value) && value.includes(option.value)
  );

  const handleChange = (selectedOptions) => {
    // Convert selected options back to array of IDs
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    onChange(selectedIds);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <Select
        isMulti
        name={name}
        value={selectedValues}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isDisabled={disabled || loading}
        isLoading={loading}
        closeMenuOnSelect={closeMenuOnSelect} // Optional: Keep menu open after selection
        // hideSelectedOptions prop is removed, so it defaults to true
        styles={customStyles}
        menuPlacement="auto"
        noOptionsMessage={() => "No options found"}
        loadingMessage={() => "Loading..."}
      />
      
      {/* Help Text */}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

/* ---------------------------------------------
   🔹 GlobalFormSection — Section Wrapper
--------------------------------------------- */
export const GlobalFormSection = ({
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};

// Default export for backward compatibility
function GlobalFormInputs() {
  return null;
}

export default GlobalFormInputs;


