import React, { useState } from "react";
import Select from "react-select";

const CircularAssigneesSelector = ({
  value = [],
  options = [],
  onChange,
  loading = false,
  getInitials
}) => {
  const [open, setOpen] = useState(false);

  const selectedValues = options.filter(opt => value.includes(opt.value));

  // ✅ Always return minimum 2 characters
  const getTwoCharInitials = (name) => {
    if (!name) return "NA";
    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const handleChange = (selectedOptions) => {
    const ids = selectedOptions ? selectedOptions.map(o => o.value) : [];
    onChange(ids);
  };

  return (
    <div>
      {/* ✅ Circular Selected Avatars */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedValues.length > 0 ? (
          selectedValues.map(member => (
            <div
              key={member.value}
              title={member.label}   // ✅ Native tooltip on hover
              className="relative group w-10 h-10 rounded-full
                         bg-gradient-to-br from-blue-500 to-purple-600
                         flex items-center justify-center
                         text-white text-xs font-bold shadow
                         cursor-pointer transition-transform hover:scale-105"
            >
              {getTwoCharInitials(member.label)}

              {/* ✅ Custom Tooltip (Modern) */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block
                              bg-black text-white text-[10px] rounded px-2 py-1
                              whitespace-nowrap shadow">
                {member.label}
              </div>
            </div>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">
            No assignees selected
          </span>
        )}
      </div>

      {/* ✅ Select Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-sm px-3 py-1.5 rounded
                   border border-blue-500 text-blue-600
                   hover:bg-blue-50 transition"
      >
        {open ? "Close Assignees List" : "Select Assignees"}
      </button>

      {/* ✅ Hidden Selector Panel */}
      {open && (
        <div className="mt-3">
          <Select
            isMulti
            value={selectedValues}
            onChange={handleChange}
            options={options}
            isLoading={loading}
            placeholder="Select assignees..."
            closeMenuOnSelect={false}
            className="text-sm"
            menuPlacement="top"
          />
        </div>
      )}
    </div>
  );
};

export default CircularAssigneesSelector;
