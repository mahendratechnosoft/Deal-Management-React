import React, { useState } from 'react';
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";

function EditTimesheetModal({
    clickPopup,
    onClose,
    buildTimePairs,
    formatDuration,
    formatTimeSimple
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editedTime, setEditedTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [newRecordTime, setNewRecordTime] = useState('');
    const [newRecordStatus, setNewRecordStatus] = useState(true); // true = check-in, false = check-out
    const [deletingRecord, setDeletingRecord] = useState(null); // Track which record is being deleted

    if (!clickPopup) return null;

    const pairs = buildTimePairs(clickPopup.records);
    const totalMs = getTotalTimeFromPairs(pairs);
    const totalText = formatDuration(totalMs);

    // Calculate total time from pairs
    function getTotalTimeFromPairs(pairs) {
        let total = 0;
        pairs.forEach(p => {
            if (p.out) {
                total += (new Date(p.out.timeStamp) - new Date(p.in.timeStamp));
            }
        });
        return total;
    }

    // Convert timestamp to datetime-local format
    const convertToDateTimeLocal = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Get current datetime for new records (default to now)
    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        return convertToDateTimeLocal(now);
    };

    // Start editing a record
    const handleEditClick = (record, type) => {
        setIsEditing(true);
        setIsCreating(false);
        setEditingRecord({ ...record, type });
        const formattedDate = convertToDateTimeLocal(record.timeStamp);
        setEditedTime(formattedDate);
    };

    // Start creating a new record
    const handleCreateClick = () => {
        setIsCreating(true);
        setIsEditing(false);
        setNewRecordTime(getCurrentDateTimeLocal());
        setNewRecordStatus(true); // Default to check-in
    };

    // Cancel editing/creating
    const handleCancel = () => {
        setIsEditing(false);
        setIsCreating(false);
        setEditingRecord(null);
        setEditedTime('');
        setNewRecordTime('');
    };

    // Save edited time
    const handleSaveEdit = async () => {
        if (!editedTime || !editingRecord) return;

        setLoading(true);
        try {
            const localDate = new Date(editedTime);
            const newTimestamp = localDate.getTime();

            const updateData = {
                attendanceId: editingRecord.attendanceId,
                // adminId: editingRecord.adminId,
                employeeId: editingRecord.employeeId,
                timeStamp: newTimestamp,
                status: editingRecord.status
            };

            console.log('Updating record:', updateData);
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

    // Create new attendance record - FIXED VERSION
  
    const handleCreateRecord = async () => {
        if (!newRecordTime) {
            toast.error('Please select a date and time');
            return;
        }

        setLoading(true);
        try {
            const localDate = new Date(newRecordTime);
            const newTimestamp = localDate.getTime();

            // Get employee data from existing records or clickPopup context
            const sampleRecord = clickPopup.records[0];
           
            if (!sampleRecord || !sampleRecord.employeeId) {
                toast.error('Cannot create record: Employee information not found');
                return;
            }

            const adminId = sampleRecord.adminId ; 

            // Prepare create data - NO attendanceId for creation
            const createData = {
                // adminId: adminId,
                employeeId: sampleRecord.employeeId,
                timeStamp: newTimestamp,
                status: newRecordStatus // true = check-in, false = check-out
            };

            console.log('Creating record with data:', createData);

            // Use PUT for create (as per your backend requirement)
            await axiosInstance.put('updateAttendance', createData);

            toast.success(`New ${newRecordStatus ? 'check-in' : 'check-out'} record created successfully`);
            handleCancel();
            onClose(true);

        } catch (error) {
            console.error('Error creating attendance:', error);
            console.error('Error response:', error.response);
            toast.error('Failed to create attendance record');
        } finally {
            setLoading(false);
        }
    };

    // Delete attendance record
    const handleDeleteRecord = async (record) => {
        if (!record.attendanceId) {
            toast.error('Cannot delete record: No attendance ID found');
            return;
        }

        setDeletingRecord(record.attendanceId);
        try {
            await axiosInstance.delete(`deleteAttendance/${record.attendanceId}`);

            toast.success('Attendance record deleted successfully');
            onClose(true); // Refresh the data

        } catch (error) {
            console.error('Error deleting attendance:', error);
            toast.error('Failed to delete attendance record');
        } finally {
            setDeletingRecord(null);
        }
    };

    // Delete entire session (both in and out records)
    const handleDeleteSession = async (session) => {
        const recordsToDelete = [session.in];
        if (session.out) {
            recordsToDelete.push(session.out);
        }

        // Confirm deletion
        const confirmMessage = session.out
            ? `Are you sure you want to delete this entire session (both check-in and check-out)?`
            : `Are you sure you want to delete this check-in record?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setLoading(true);
        try {
            // Delete all records in the session
            const deletePromises = recordsToDelete.map(record =>
                axiosInstance.delete(`deleteAttendance/${record.attendanceId}`)
            );

            await Promise.all(deletePromises);
            toast.success(`Session deleted successfully`);
            onClose(true); // Refresh the data

        } catch (error) {
            console.error('Error deleting session:', error);
            toast.error('Failed to delete session');
        } finally {
            setLoading(false);
        }
    };

    // Format for display in edit mode
    const getEditingDisplayTime = () => {
        if (!editingRecord) return '';
        return formatTimeSimple(new Date(editingRecord.timeStamp));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header with close button and total time */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                                {clickPopup.employeeName}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <span>{clickPopup.dateKey}</span>
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium text-gray-900">{totalText}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onClose(false)}
                        disabled={loading}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-96 overflow-y-auto">
                    {isEditing ? (
                        // Edit Mode
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <h4 className="font-semibold text-yellow-800 mb-2">
                                    Editing {editingRecord?.type === 'in' ? 'Check-in' : 'Check-out'} Time
                                </h4>

                                <div className="mb-3 p-2 bg-white rounded border">
                                    <div className="text-sm text-gray-600">
                                        Current: <span className="font-medium text-gray-800">{getEditingDisplayTime()}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Record ID: {editingRecord?.attendanceId}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={editedTime}
                                            onChange={(e) => setEditedTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {editedTime ? `Will update to: ${new Date(editedTime).toLocaleString()}` : 'Select a new date and time'}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={loading || !editedTime}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={loading}
                                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : isCreating ? (
                        // Create Mode
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <h4 className="font-semibold text-green-800 mb-2">
                                    Create New Attendance Record
                                </h4>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={newRecordTime}
                                            onChange={(e) => setNewRecordTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Record Type
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="true"
                                                    checked={newRecordStatus === true}
                                                    onChange={() => setNewRecordStatus(true)}
                                                    className="mr-2"
                                                />
                                                <span className="text-green-600 font-medium">Check-in</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="false"
                                                    checked={newRecordStatus === false}
                                                    onChange={() => setNewRecordStatus(false)}
                                                    className="mr-2"
                                                />
                                                <span className="text-red-600 font-medium">Check-out</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCreateRecord}
                                            disabled={loading || !newRecordTime}
                                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Creating...' : 'Create Record'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={loading}
                                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <div>
                            {/* Create Button */}
                            <div className="mb-4">
                                <button
                                    onClick={handleCreateClick}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Attendance Record
                                </button>
                            </div>

                            {/* Existing Records */}
                            {pairs.length > 0 ? (
                                <div className="space-y-3">
                                    {pairs.map((p, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">
                                                    Session {idx + 1}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEditClick(p.in, 'in')}
                                                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                                        title="Edit check-in time"
                                                    >
                                                        Edit In
                                                    </button>
                                                    {p.out && (
                                                        <button
                                                            onClick={() => handleEditClick(p.out, 'out')}
                                                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                                            title="Edit check-out time"
                                                        >
                                                            Edit Out
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteSession(p)}
                                                        disabled={loading}
                                                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                                                        title="Delete entire session"
                                                    >
                                                        {loading ? '...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <div className="flex flex-col items-center pt-1">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    <div className="w-px h-5 bg-gray-300"></div>
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                </div>
                                                <div className="text-sm space-y-1 flex-1">
                                                    {/* Check-in Record */}
                                                    <div className="flex justify-between items-center group">
                                                        <div className="text-gray-800">
                                                            <span className="font-medium">Start:</span>{" "}
                                                            {formatTimeSimple(new Date(p.in.timeStamp))}
                                                        </div>
                                                        {/* <button
                                                            onClick={() => handleDeleteRecord(p.in)}
                                                            disabled={deletingRecord === p.in.attendanceId || loading}
                                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200 disabled:opacity-50"
                                                            title="Delete check-in record"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button> */}
                                                    </div>

                                                    {/* Check-out Record */}
                                                    <div className="flex justify-between items-center group">
                                                        <div className="text-gray-800">
                                                            <span className="font-medium">End:</span>{" "}
                                                            {p.out
                                                                ? formatTimeSimple(new Date(p.out.timeStamp))
                                                                : "—"}
                                                        </div>
                                                        {/* {p.out && (
                                                            <button
                                                                onClick={() => handleDeleteRecord(p.out)}
                                                                disabled={deletingRecord === p.out.attendanceId || loading}
                                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200 disabled:opacity-50"
                                                                title="Delete check-out record"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        )} */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-lg">
                                    No attendance records found for this day
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