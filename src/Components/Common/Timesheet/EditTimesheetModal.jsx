import React, { useState, useEffect } from 'react';
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { hasPermission } from '../../BaseComponet/permissions';
import { showDeleteConfirmation } from '../../BaseComponet/alertUtils';

function EditTimesheetModal({
    clickPopup,
    onClose,
    buildTimePairs,
    formatDuration,
    formatTimeSimple,
    employeeId,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editedTime, setEditedTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [newRecordTime, setNewRecordTime] = useState('');
    const [newRecordStatus, setNewRecordStatus] = useState(true);
    const [deletingRecord, setDeletingRecord] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [allRecords, setAllRecords] = useState([]);

    // Initialize records when clickPopup changes
    useEffect(() => {
        if (clickPopup?.records) {
            setAllRecords([...clickPopup.records].sort((a, b) => a.timeStamp - b.timeStamp));
        }
    }, [clickPopup]);

    if (!clickPopup) return null;

    const pairs = buildTimePairs(clickPopup.records);
    const totalMs = getTotalTimeFromPairs(pairs);
    const totalText = formatDuration(totalMs);

    function getTotalTimeFromPairs(pairs) {
        let total = 0;
        pairs.forEach(p => {
            if (p.out) {
                total += (new Date(p.out.timeStamp) - new Date(p.in.timeStamp));
            }
        });
        return total;
    }

    // ==================== ENHANCED VALIDATION FUNCTIONS ====================

    const getCurrentTime = () => {
        return new Date();
    };

    const isFutureTime = (timestamp) => {
        return new Date(timestamp) > getCurrentTime();
    };

    // ==================== ENHANCED VALIDATION FUNCTIONS ====================

    const validateRecordTime = (dateTimeString, recordType, currentRecord = null) => {
        const errors = [];
        const newTime = parseDateTimeLocal(dateTimeString);
        const currentTime = new Date();
        const dateKey = clickPopup.dateKey;

        // Get all records for the day (using local date comparison)
        const dayRecords = allRecords.filter(record => {
            const recordDate = formatYMD(new Date(record.timeStamp));
            return recordDate === dateKey;
        });

        // Validation 1: Cannot set future time
        if (newTime > currentTime) {
            errors.push('Cannot set time in the future');
        }

        // Validation 2: Time must be within the selected date (using local date)
        const recordDate = formatYMD(newTime);
        if (recordDate !== dateKey) {
            errors.push(`Time must be within ${dateKey}`);
        }

        // Validation 3: No duplicate timestamps
        const newTimestamp = newTime.getTime();
        const duplicate = dayRecords.find(record =>
            record.timeStamp === newTimestamp &&
            (!currentRecord || record.attendanceId !== currentRecord.attendanceId)
        );
        if (duplicate) {
            errors.push('Duplicate timestamp found');
        }

        // NEW VALIDATION: Check-in time must be from day start (midnight)
        if (recordType === 'in') {
            const startOfDay = parseDateTimeLocal(`${dateKey}T00:00`);
            if (newTime < startOfDay) {
                errors.push('Check-in time must be from day start (00:00)');
            }

            // ... rest of your existing validations for 'in' records
            const correspondingOut = currentRecord ?
                dayRecords.find(record =>
                    record.attendanceId !== currentRecord.attendanceId &&
                    record.timeStamp > currentRecord.timeStamp &&
                    !record.status
                ) : null;

            if (correspondingOut && newTime >= new Date(correspondingOut.timeStamp)) {
                errors.push('Check-in time must be before check-out time');
            }

            const currentIndex = dayRecords.findIndex(record =>
                currentRecord && record.attendanceId === currentRecord.attendanceId
            );
            if (currentIndex > -1 && currentIndex + 1 < dayRecords.length) {
                const nextRecord = dayRecords[currentIndex + 1];
                if (newTime >= new Date(nextRecord.timeStamp)) {
                    errors.push('Check-in cannot be after next record');
                }
            }

            if (currentIndex > 0) {
                const prevRecord = dayRecords[currentIndex - 1];
                if (newTime <= new Date(prevRecord.timeStamp)) {
                    errors.push('Check-in must be after previous record');
                }
            }

        } else if (recordType === 'out') {
            // ... rest of your existing validations for 'out' records
            const correspondingIn = currentRecord ?
                dayRecords.find(record => record.attendanceId === currentRecord.attendanceId) : null;

            if (correspondingIn && newTime <= new Date(correspondingIn.timeStamp)) {
                errors.push('Check-out time must be after check-in time');
            }

            const currentIndex = dayRecords.findIndex(record =>
                currentRecord && record.attendanceId === currentRecord.attendanceId
            );
            if (currentIndex > -1 && currentIndex + 1 < dayRecords.length) {
                const nextRecord = dayRecords[currentIndex + 1];
                if (nextRecord.status === true && newTime >= new Date(nextRecord.timeStamp)) {
                    errors.push('Check-out cannot be after next check-in time');
                }
            }

            if (currentIndex > 0) {
                const prevRecord = dayRecords[currentIndex - 1];
                if (!prevRecord.status && newTime <= new Date(prevRecord.timeStamp)) {
                    errors.push('Check-out must be after previous check-out');
                }
            }
        }

        // Validation: Time must be within day boundaries
        const startOfDay = parseDateTimeLocal(`${dateKey}T00:00`);
        const endOfDay = parseDateTimeLocal(`${dateKey}T23:59`);
        if (newTime < startOfDay || newTime > endOfDay) {
            errors.push(`Time must be between 00:00 and 23:59 on ${dateKey}`);
        }

        // Validation: Minimum session duration (1 minute)
        if (recordType === 'out' && currentRecord) {
            const inTime = new Date(currentRecord.timeStamp);
            const duration = newTime - inTime;
            if (duration < 1 * 60 * 1000) {
                errors.push('Minimum session duration is 1 minute');
            }
        }

        // Validation: Maximum session duration (24 hours)
        if (recordType === 'out' && currentRecord) {
            const inTime = new Date(currentRecord.timeStamp);
            const duration = newTime - inTime;
            if (duration > 24 * 60 * 60 * 1000) {
                errors.push('Maximum session duration is 24 hours');
            }
        }

        return errors;
    };


    const validateNewRecord = (dateTimeString, status) => {
        const errors = [];
        const newTime = parseDateTimeLocal(dateTimeString);
        const currentTime = new Date();
        const dateKey = clickPopup.dateKey;

        const dayRecords = allRecords.filter(record => {
            const recordDate = formatYMD(new Date(record.timeStamp));
            return recordDate === dateKey;
        });

        // Validation 1: Cannot create future records
        if (newTime > currentTime) {
            errors.push('Cannot create records with future time');
        }

        // Validation 2: Date must match selected date (using local date)
        const recordDate = formatYMD(newTime);
        if (recordDate !== dateKey) {
            errors.push(`Time must be within ${dateKey}`);
        }

        // Validation 3: No duplicates
        const newTimestamp = newTime.getTime();
        const duplicate = dayRecords.find(record => {
            return record.timeStamp === newTimestamp;
        });
        if (duplicate) {
            errors.push('Duplicate timestamp found');
        }

        // Validation 4: Time must be within day boundaries
        const startOfDay = parseDateTimeLocal(`${dateKey}T00:00`);
        const endOfDay = parseDateTimeLocal(`${dateKey}T23:59`);
        if (newTime < startOfDay || newTime > endOfDay) {
            errors.push(`Time must be between 00:00 and 23:59 on ${dateKey}`);
        }

        if (status === true) { // Check-in
            // Check-in time must be from day start (midnight)
            if (newTime < startOfDay) {
                errors.push('Check-in time must be from day start (00:00)');
            }

            // Validation 5: Check-in must be first record or after last check-out
            const lastRecord = dayRecords[dayRecords.length - 1];
            if (lastRecord && lastRecord.status === true) {
                errors.push('Cannot create check-in when last record is also check-in');
            }
            if (lastRecord && newTime <= new Date(lastRecord.timeStamp)) {
                errors.push('New check-in must be after last record');
            }
        } else { // Check-out
            // Validation 6: Check-out requires an open check-in
            const lastRecord = dayRecords[dayRecords.length - 1];
            if (!lastRecord || lastRecord.status === false) {
                errors.push('Cannot create check-out without an open check-in');
            } else {
                // Validation 7: Check-out must be after last check-in
                if (newTime <= new Date(lastRecord.timeStamp)) {
                    errors.push('Check-out must be after the last check-in');
                }

                // Validation 8: Minimum duration (1 minute)
                const duration = newTime - new Date(lastRecord.timeStamp);
                if (duration < 1 * 60 * 1000) {
                    errors.push('Minimum session duration is 1 minute');
                }

                // Validation 9: Maximum duration (24 hours)
                if (duration > 24 * 60 * 60 * 1000) {
                    errors.push('Maximum session duration is 24 hours');
                }
            }
        }

        return errors;
    };


    // ==================== UTILITY FUNCTIONS ====================

    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        const selectedDate = clickPopup.dateKey;
        const currentDate = formatYMD(now);

        if (selectedDate > currentDate) {
            return `${selectedDate}T00:00`;
        } else if (selectedDate < currentDate) {
            return `${selectedDate}T00:00`;
        } else {
            const startOfDay = parseDateTimeLocal(`${selectedDate}T00:00`);
            return now < startOfDay ? `${selectedDate}T00:00` : convertToDateTimeLocal(now);
        }
    };

    const getMinDateTimeLocal = () => {
        const selectedDate = clickPopup.dateKey;
        return `${selectedDate}T00:00`;
    };

    const getMaxDateTimeLocal = () => {
        const selectedDate = clickPopup.dateKey;
        const currentDate = formatYMD(new Date());

        if (selectedDate > currentDate) {
            return `${selectedDate}T23:59`;
        } else if (selectedDate < currentDate) {
            return `${selectedDate}T23:59`;
        } else {
            return convertToDateTimeLocal(new Date());
        }
    };

    const parseDateTimeLocal = (dateTimeString) => {
        if (!dateTimeString) return null;

        // Split the datetime string into date and time parts
        const [datePart, timePart] = dateTimeString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = (timePart || '00:00').split(':').map(Number);

        // Create date in local timezone (this preserves the exact local time)
        return new Date(year, month - 1, day, hours, minutes, 0, 0);
    };

    // Helper function to format date as YYYY-MM-DD (local time)
    const formatYMD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const convertToDateTimeLocal = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };



    const canCreateCheckout = () => {
        const dayRecords = allRecords.filter(record => {
            const recordDate = formatYMD(new Date(record.timeStamp));
            return recordDate === clickPopup.dateKey;
        });

        const lastRecord = dayRecords[dayRecords.length - 1];
        return lastRecord && lastRecord.status === true;
    };

    const canCreateCheckin = () => {
        const dayRecords = allRecords.filter(record => {
            const recordDate = formatYMD(new Date(record.timeStamp));
            return recordDate === clickPopup.dateKey;
        });

        const lastRecord = dayRecords[dayRecords.length - 1];
        return !lastRecord || lastRecord.status === false;
    };



    // ==================== EVENT HANDLERS ====================

    const handleEditClick = (record, type) => {
        setIsEditing(true);
        setIsCreating(false);
        setEditingRecord({ ...record, type });
        const formattedDate = convertToDateTimeLocal(record.timeStamp);
        setEditedTime(formattedDate);
        setValidationErrors({});
    };

    const handleCreateClick = () => {
        setIsCreating(true);
        setIsEditing(false);
        setNewRecordTime(getCurrentDateTimeLocal());
        setNewRecordStatus(true);
        setValidationErrors({});
    };

    const handleCancel = () => {
        setIsEditing(false);
        setIsCreating(false);
        setEditingRecord(null);
        setEditedTime('');
        setNewRecordTime('');
        setValidationErrors({});
    };

    const handleSaveEdit = async () => {
        if (!editedTime || !editingRecord) return;

        // Run validation with the datetime string directly
        const errors = validateRecordTime(
            editedTime, // Pass the string directly, not the timestamp
            editingRecord.type,
            editingRecord
        );

        if (errors.length > 0) {
            setValidationErrors({ edit: errors });
            toast.error('Validation failed: ' + errors.join(', '));
            return;
        }

        setLoading(true);
        try {
            const newTimestamp = parseDateTimeLocal(editedTime).getTime();

            const updateData = {
                attendanceId: editingRecord.attendanceId,
                employeeId: editingRecord.employeeId,
                timeStamp: newTimestamp,
                status: editingRecord.status
            };

            await axiosInstance.put('updateAttendance', updateData);
            toast.success('Attendance record updated successfully');
            handleCancel();
            onClose(true);

        } catch (error) {
            console.error('Error updating attendance:', error);
            toast.error('Failed to update attendance record');
        } finally {
            setLoading(false);
        }
    };


    const handleCreateRecord = async () => {
        if (!newRecordTime) {
            toast.error('Please select a date and time');
            return;
        }

        // Run validation with the datetime string directly
        const errors = validateNewRecord(newRecordTime, newRecordStatus);

        if (errors.length > 0) {
            setValidationErrors({ create: errors });
            toast.error('Validation failed: ' + errors.join(', '));
            return;
        }

        const targetEmployeeId = employeeId || (clickPopup.records[0] && clickPopup.records[0].employeeId);

        if (!targetEmployeeId) {
            toast.error('Cannot create record: Employee information not found');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const newTimestamp = parseDateTimeLocal(newRecordTime).getTime();

            const createData = {
                employeeId: targetEmployeeId,
                timeStamp: newTimestamp,
                status: newRecordStatus
            };

            await axiosInstance.put('updateAttendance', createData);
            toast.success(`New ${newRecordStatus ? 'check-in' : 'check-out'} record created successfully`);
            handleCancel();
            onClose(true);

        } catch (error) {
            console.error('Error creating attendance:', error);
            if (error.response?.data?.message) {
                toast.error(`Failed to create record: ${error.response.data.message}`);
            } else {
                toast.error('Failed to create attendance record');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (session) => {
        const recordsToDelete = [session.in];
        if (session.out) {
            recordsToDelete.push(session.out);
        }

        const confirmMessage = session.out
            ? `Are you sure you want to delete this entire session?`
            : `Are you sure you want to delete this check-in record?`;

        const result = await showDeleteConfirmation(confirmMessage);
        if (!result.isConfirmed) {
            return;
        }

        setLoading(true);
        try {
            const deletePromises = recordsToDelete.map(record =>
                axiosInstance.delete(`deleteAttendance/${record.attendanceId}`)
            );

            await Promise.all(deletePromises);
            toast.success(`Session deleted successfully`);
            onClose(true);

        } catch (error) {
            console.error('Error deleting session:', error);
            toast.error('Failed to delete session');
        } finally {
            setLoading(false);
        }
    };

    const getEditingDisplayTime = () => {
        if (!editingRecord) return '';
        return formatTimeSimple(new Date(editingRecord.timeStamp));
    };

    // ==================== RENDER ====================

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">
                {/* Header */}
                <div className="bg-white px-4 py-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {clickPopup.employeeName}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{clickPopup.dateKey}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">{totalText}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Hide Create button when editing */}
                            {!isEditing && hasPermission("timeSheet", "Create") && (
                                <button
                                    onClick={handleCreateClick}
                                    className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create
                                </button>
                            )}
                            <button
                                onClick={() => onClose(false)}
                                disabled={loading}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 max-h-80 overflow-y-auto">
                    {isEditing ? (
                        // Edit Mode
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <h3 className="font-semibold text-blue-900 text-sm">
                                    Edit {editingRecord?.type === 'in' ? 'Check-in' : 'Check-out'}
                                </h3>
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs text-gray-600">
                                    Current: <span className="font-medium">{getEditingDisplayTime()}</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        New Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={editedTime}
                                        min={getMinDateTimeLocal()} // ADD THIS LINE
                                        max={getMaxDateTimeLocal()}
                                        onChange={(e) => {
                                            setEditedTime(e.target.value);
                                            setValidationErrors({});
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        Allowed range: {getMinDateTimeLocal().replace('T', ' ')} to {getMaxDateTimeLocal().replace('T', ' ')}
                                    </div>
                                </div>

                                {/* Validation Errors for Edit */}
                                {validationErrors.edit && validationErrors.edit.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                        <div className="text-red-800 text-xs font-medium mb-1">Validation Errors:</div>
                                        <ul className="text-red-700 text-xs list-disc list-inside space-y-1">
                                            {validationErrors.edit.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={loading || !editedTime}
                                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-400 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : isCreating ? (
                        // Create Mode
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <h3 className="font-semibold text-green-900 text-sm">Create Record</h3>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={newRecordTime}
                                        min={getMinDateTimeLocal()}
                                        max={getMaxDateTimeLocal()}
                                        onChange={(e) => {
                                            console.log('Selected time:', e.target.value); // Debug
                                            setNewRecordTime(e.target.value);
                                            setValidationErrors({});
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        step="60" // Allow only minute steps
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        Allowed range: {getMinDateTimeLocal().replace('T', ' ')} to {getMaxDateTimeLocal().replace('T', ' ')}
                                    </div>
                                    {/* <div className="text-xs text-blue-500 mt-1">
        Selected: {newRecordTime ? newRecordTime.replace('T', ' ') : 'None'}
    </div> */}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-1 text-sm">
                                            <input
                                                type="radio"
                                                value="true"
                                                checked={newRecordStatus === true}
                                                onChange={() => {
                                                    setNewRecordStatus(true);
                                                    setValidationErrors({});
                                                }}
                                                className="w-3 h-3"
                                                disabled={!canCreateCheckin()}
                                            />
                                            <span className={`font-medium ${!canCreateCheckin() ? 'text-gray-400' : 'text-green-600'}`}>
                                                Check-in {!canCreateCheckin() && '(Not allowed)'}
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-1 text-sm">
                                            <input
                                                type="radio"
                                                value="false"
                                                checked={newRecordStatus === false}
                                                onChange={() => {
                                                    setNewRecordStatus(false);
                                                    setValidationErrors({});
                                                }}
                                                className="w-3 h-3"
                                                disabled={!canCreateCheckout()}
                                            />
                                            <span className={`font-medium ${!canCreateCheckout() ? 'text-gray-400' : 'text-red-600'}`}>
                                                Check-out {!canCreateCheckout() && '(Not allowed)'}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Validation Errors for Create */}
                                {validationErrors.create && validationErrors.create.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                        <div className="text-red-800 text-xs font-medium mb-1">Validation Errors:</div>
                                        <ul className="text-red-700 text-xs list-disc list-inside space-y-1">
                                            {validationErrors.create.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateRecord}
                                        disabled={loading || !newRecordTime ||
                                            (newRecordStatus && !canCreateCheckin()) ||
                                            (!newRecordStatus && !canCreateCheckout())}
                                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-400 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <div className="space-y-3">
                            {pairs.length > 0 ? (
                                pairs.map((p, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded">
                                                Session {idx + 1}
                                            </span>
                                            {hasPermission("timeSheet", "Delete") && (
                                                <button
                                                    onClick={() => handleDeleteSession(p)}
                                                    disabled={loading}
                                                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                                    title="Delete session"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <div className="w-0.5 h-4 bg-gray-300 my-1"></div>
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Start:</span> {formatTimeSimple(new Date(p.in.timeStamp))}
                                                    </div>
                                                    {hasPermission("timeSheet", "Edit") && (
                                                        <button
                                                            onClick={() => handleEditClick(p.in, 'in')}
                                                            className="bg-blue-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1 ml-2"
                                                            title="Edit check-in time"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">End:</span> {p.out ? formatTimeSimple(new Date(p.out.timeStamp)) : "—"}
                                                    </div>
                                                    {p.out ? (
                                                        <>
                                                            {hasPermission("timeSheet", "Edit") && (
                                                                <button
                                                                    onClick={() => handleEditClick(p.out, 'out')}
                                                                    className="bg-blue-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1 ml-2"
                                                                    title="Edit check-out time"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="w-20"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500 text-sm">No attendance records found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditTimesheetModal;