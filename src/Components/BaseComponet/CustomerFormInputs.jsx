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
        menuPosition="fixed"

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



export const CustomMultiSelect = ({
  label,
  name,
  value = [],
  onChange,
  options = [],
  placeholder = 'Select employees...',
  error,
  required = false,
  disabled = false,
  loading = false,
  className = '',
  helpText = '',
  excludedValues = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option click
  const handleOptionClick = (optionValue) => {
    if (disabled) return;

    let newValue;
    if (value.includes(optionValue)) {
      // Remove if already selected
      newValue = value.filter(v => v !== optionValue);
    } else {
      // Add if not selected
      newValue = [...value, optionValue];
    }
    onChange(newValue);
  };

  // Clear search when dropdown closes
  const handleToggleDropdown = () => {
    if (disabled || loading) return;
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchTerm('');
    }
  };

  // Placeholder text
  const displayPlaceholder = value.length > 0 
    ? `${value.length} employee(s) selected` 
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Main Input - Just shows count, not names */}
      <div className="relative">
        <div
          onClick={handleToggleDropdown}
          className={`
            w-full min-h-[40px] px-3 py-2 border rounded-md cursor-pointer
            flex items-center justify-between
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            hover:border-blue-500 transition-colors
          `}
        >
          <span className={`truncate ${value.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
            {displayPlaceholder}
          </span>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-10 top-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <svg 
                className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                {searchTerm ? 'No matching employees found' : 'No employees available'}
              </div>
            ) : (
              <ul className="py-1">
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  const isExcluded = excludedValues.includes(option.value) && !isSelected;
                  const isDisabled = isExcluded;

                  return (
                    <li key={option.value}>
                      <div
                        onClick={() => !isDisabled && handleOptionClick(option.value)}
                        className={`
                          px-3 py-2 text-sm cursor-pointer flex items-center justify-between
                          ${isSelected 
                            ? 'bg-gray-300 text-black' 
                            : isDisabled
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'hover:bg-gray-50 text-gray-900'
                          }
                        `}
                      >
                        <div className="flex items-center">
                          {/* Checkbox/Checkmark */}
                          <div className={`
                            w-4 h-4 border rounded mr-3 flex items-center justify-center
                            ${isSelected 
                              ? 'bg-white border-white' 
                              : 'border-gray-300'
                            }
                            ${isDisabled ? 'border-gray-300' : ''}
                          `}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="truncate">{option.label}</span>
                        </div>
                        {isDisabled && (
                          <span className="text-xs text-gray-500 italic ml-2">(assigned elsewhere)</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

  
        </div>
      )}




    
      {/* Help Text */}
      {helpText && !error && (
        <div className="mt-1 text-xs text-gray-500">{helpText}</div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-1 text-xs text-red-600">{error}</div>
      )}
    </div>
  );
};

/* ---------------------------------------------
   🔹 CustomMultiSelectWithExclusion
   Wrapper that automatically handles mutual exclusion
--------------------------------------------- */
export const CustomMultiSelectWithExclusion = (props) => {
  const { 
    type, // 'assignees' or 'followers'
    assignees = [],
    followers = [],
    onAssigneesChange,
    onFollowersChange,
    ...otherProps 
  } = props;

  if (type === 'assignees') {
    return (
      <CustomMultiSelect
        {...otherProps}
        value={assignees}
        onChange={onAssigneesChange}
        excludedValues={followers}
        placeholder="Select assignees..."
     
      />
    );
  }

  if (type === 'followers') {
    return (
      <CustomMultiSelect
        {...otherProps}
        value={followers}
        onChange={onFollowersChange}
        excludedValues={assignees}
        placeholder="Select followers..."

      />
    );
  }

  return <CustomMultiSelect {...otherProps} />;
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


