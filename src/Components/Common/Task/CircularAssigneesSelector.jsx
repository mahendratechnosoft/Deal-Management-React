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
  taskId
}) => {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const selectedValues = options.filter(opt => value.includes(opt.value));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get two character initials
  const getTwoCharInitials = (name) => {
    if (!name) return "NA";
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
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
      const response = await axiosInstance.delete(`removeTaskAssignee/${taskId}/${employeeId}`);
      
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

  return (
    <div className="relative">
      {/* Selected People Circles */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedValues.length > 0 ? (
          selectedValues.map(member => (
            <div
              key={member.value}
              className="relative group w-10 h-10 rounded-full
                         bg-gradient-to-br from-blue-500 to-purple-600
                         flex items-center justify-center
                         text-white text-xs font-bold shadow
                         cursor-pointer"
            >
              {getTwoCharInitials(member.label)}
              
              {/* Delete Button - Shows on hover */}
              <button
                onClick={() => handleRemoveEmployee(member.value)}
                disabled={removing}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full 
                           flex items-center justify-center text-xs opacity-0 group-hover:opacity-100
                           transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Remove ${member.label}`}
              >
                ×
              </button>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block
                              bg-gray-900 text-white text-[10px] rounded px-2 py-1
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
          className="absolute bottom-full left-0 mb-2 border border-gray-200 rounded-lg shadow-lg bg-white w-48 max-h-60 overflow-y-auto z-20"
        >
          <div className="p-2 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-700">
              Select {type === 'assignees' ? 'assignee' : 'follower'}
            </div>
          </div>
          
          {options.length > 0 ? (
            <div className="py-1">
              {options
                .filter(opt => !value.includes(opt.value))
                .map(employee => (
                  <button
                    key={employee.value}
                    onClick={() => handleSelectEmployee(employee.value)}
                    disabled={adding}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 
                             cursor-pointer transition text-left disabled:opacity-50 disabled:cursor-not-allowed
                             text-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                      {getTwoCharInitials(employee.label)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{employee.label}</div>
                    </div>
                    {adding && (
                      <svg className="animate-spin h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </button>
                ))}
              
              {options.filter(opt => !value.includes(opt.value)).length === 0 && (
                <div className="text-center py-3 text-gray-500 text-xs">
                  All members selected
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-3 text-gray-500 text-xs">
              No members available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CircularAssigneesSelector;