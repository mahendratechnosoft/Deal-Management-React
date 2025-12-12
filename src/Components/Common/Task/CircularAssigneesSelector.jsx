import React, { useState, useRef, useEffect } from "react";
import axiosInstance from '../../BaseComponet/axiosInstance';
import toast from "react-hot-toast";

const CircularAssigneesSelector = ({
  value = [],
  options = [],
  onChange,
  loading = false,
  getInitials,
  type = 'assignees',
  taskId,
  excludeIds = [],  // New prop for excluding IDs from other selector
}) => {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedValues = options.filter(opt => value.includes(opt.value));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setOpen(false);
        setSearchTerm(""); // Clear search when closing
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [open]);

  // Get two character initials
  const getTwoCharInitials = (name) => {
    if (!name) return "NA";
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  // Filter options based on search term and excluded IDs
  const getFilteredOptions = () => {
    return options
      .filter(opt => {
        // Exclude already selected in current selector
        if (value.includes(opt.value)) return false;
        
        // Exclude if in excludeIds (selected in other selector)
        if (excludeIds.includes(opt.value)) return false;
        
        // Filter by search term
        if (searchTerm.trim() === "") return true;
        
        const searchLower = searchTerm.toLowerCase();
        return opt.label.toLowerCase().includes(searchLower) ||
               opt.value.toString().toLowerCase().includes(searchLower);
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // API call to add assignee
  const handleAddAssignee = async (employeeId) => {
    if (!taskId || !employeeId) return;
    
    setAdding(true);
    try {
      const response = await axiosInstance.put(`addAssigneesToTask/${taskId}`, [employeeId]);
      
      if (response.data) {
        const newValue = [...value, employeeId];
        onChange(newValue);
        toast.success('Assignee added successfully');
        setOpen(false);
        setSearchTerm("");
      }
    } catch (error) {
      console.error('Error adding assignee:', error);
      toast.error(error.response?.data?.message || 'Failed to add assignee');
    } finally {
      setAdding(false);
    }
  };

  // API call to add follower
  const handleAddFollower = async (employeeId) => {
    if (!taskId || !employeeId) return;
    
    setAdding(true);
    try {
      const response = await axiosInstance.put(`addFollowersToTask/${taskId}`, [employeeId]);
      
      if (response.data) {
        const newValue = [...value, employeeId];
        onChange(newValue);
        toast.success('Follower added successfully');
        setOpen(false);
        setSearchTerm("");
      }
    } catch (error) {
      console.error('Error adding follower:', error);
      toast.error(error.response?.data?.message || 'Failed to add follower');
    } finally {
      setAdding(false);
    }
  };

  // API call to remove assignee
  const handleRemoveAssignee = async (employeeId) => {
    if (!taskId || !employeeId) return;
    
    setRemoving(true);
    try {
      const response = await axiosInstance.delete(`removeTaskAssignee/${taskId}/${employeeId}`);
      
      if (response.data) {
        const newValue = value.filter(id => id !== employeeId);
        onChange(newValue);
        toast.success('Assignee removed successfully');
      }
    } catch (error) {
      console.error('Error removing assignee:', error);
      toast.error(error.response?.data?.message || 'Failed to remove assignee');
    } finally {
      setRemoving(false);
    }
  };

  // API call to remove follower
  const handleRemoveFollower = async (employeeId) => {
    if (!taskId || !employeeId) return;
    
    setRemoving(true);
    try {
      const response = await axiosInstance.delete(`removeTaskFollower/${taskId}/${employeeId}`);
      
      if (response.data) {
        const newValue = value.filter(id => id !== employeeId);
        onChange(newValue);
        toast.success('Follower removed successfully');
      }
    } catch (error) {
      console.error('Error removing follower:', error);
      toast.error(error.response?.data?.message || 'Failed to remove follower');
    } finally {
      setRemoving(false);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    if (type === 'assignees') {
      handleAddAssignee(employeeId);
    } else {
      handleAddFollower(employeeId);
    }
  };

  const handleRemoveEmployee = (employeeId) => {
    if (type === 'assignees') {
      handleRemoveAssignee(employeeId);
    } else {
      handleRemoveFollower(employeeId);
    }
  };

  const filteredOptions = getFilteredOptions();

  return (
    <div className="relative">
      {/* Selected People Circles - REDUCED SIZE */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selectedValues.length > 0 ? (
          selectedValues.map(member => (
            <div
              key={member.value}
              className="relative group w-7 h-7 rounded-full
                         bg-gradient-to-br from-blue-500 to-purple-600
                         flex items-center justify-center
                         text-white text-[10px] font-bold shadow
                         cursor-pointer"
            >
              {getTwoCharInitials(member.label)}
              
              {/* Delete Button - Shows on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveEmployee(member.value);
                }}
                disabled={removing}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full 
                           flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100
                           transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed
                           leading-none"
                title={`Remove ${member.label}`}
              >
                ×
              </button>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 hidden group-hover:block
                              bg-gray-900 text-white text-[9px] rounded px-1.5 py-0.5
                              whitespace-nowrap shadow z-10">
                {member.label}
              </div>
            </div>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">
            No {type === 'assignees' ? 'assignees' : 'followers'} selected
          </span>
        )}
      </div>

      {/* Small Select Button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        disabled={loading || adding}
        className="px-2 py-1 text-xs rounded-md
                   border border-blue-300 text-blue-600 bg-blue-50
                   hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-1"
        title={`Select ${type === 'assignees' ? 'assignees' : 'followers'}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add
      </button>

      {/* Employee Dropdown - Opens on Top */}
      {open && (
        <div 
          ref={dropdownRef}
          className="absolute bottom-full left-0 mb-2 border border-gray-200 rounded-lg shadow-lg bg-white w-56 max-h-64 overflow-hidden z-20"
        >
          {/* Header with title and close */}
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-700">
                Select {type === 'assignees' ? 'assignee' : 'follower'}
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setSearchTerm("");
                }}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ×
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                         placeholder:text-gray-400"
              />
              <svg 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Employee List */}
          <div className="py-1 max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(employee => (
                <button
                  key={employee.value}
                  onClick={() => handleSelectEmployee(employee.value)}
                  disabled={adding}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 
                           cursor-pointer transition text-left disabled:opacity-50 disabled:cursor-not-allowed
                           text-xs border-b border-gray-100 last:border-b-0"
                >
                  {/* Reduced circle size in dropdown */}
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 
                                flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">
                    {getTwoCharInitials(employee.label)}
                  </div>
                  <div className="flex-1 text-left truncate">
                    <div className="font-medium text-gray-900 truncate">{employee.label}</div>
             
                  </div>
                  {adding && (
                    <svg className="animate-spin h-2.5 w-2.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-xs">
                {searchTerm.trim() ? 
                  `No matching employees found for "${searchTerm}"` : 
                  "All available employees are already selected"}
              </div>
            )}
          </div>

          {/* Info footer for excluded employees */}
          {excludeIds.length > 0 && (
            <div className="p-2 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {excludeIds.length} employee{excludeIds.length > 1 ? 's are' : ' is'} already {type === 'assignees' ? 'followers' : 'assignees'} and not shown
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CircularAssigneesSelector;