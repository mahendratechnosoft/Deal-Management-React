import React, { useState } from 'react';
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";

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

    const convertToDateTimeLocal = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        return convertToDateTimeLocal(now);
    };

    const handleEditClick = (record, type) => {
        setIsEditing(true);
        setIsCreating(false);
        setEditingRecord({ ...record, type });
        const formattedDate = convertToDateTimeLocal(record.timeStamp);
        setEditedTime(formattedDate);
    };

    const handleCreateClick = () => {
        setIsCreating(true);
        setIsEditing(false);
        setNewRecordTime(getCurrentDateTimeLocal());
        setNewRecordStatus(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setIsCreating(false);
        setEditingRecord(null);
        setEditedTime('');
        setNewRecordTime('');
    };

    const handleSaveEdit = async () => {
        if (!editedTime || !editingRecord) return;

        setLoading(true);
        try {
            const localDate = new Date(editedTime);
            const newTimestamp = localDate.getTime();

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

        const targetEmployeeId = employeeId || (clickPopup.records[0] && clickPopup.records[0].employeeId);

        if (!targetEmployeeId) {
            toast.error('Cannot create record: Employee information not found');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const localDate = new Date(newRecordTime);
            const newTimestamp = localDate.getTime();

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

        if (!window.confirm(confirmMessage)) {
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
                            <button
                                onClick={handleCreateClick}
                                className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create
                            </button>
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

                {/* Content - Compact Design */}
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
                                        onChange={(e) => setEditedTime(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

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
                                        onChange={(e) => setNewRecordTime(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
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
                                                onChange={() => setNewRecordStatus(true)}
                                                className="w-3 h-3"
                                            />
                                            <span className="text-green-600 font-medium">Check-in</span>
                                        </label>
                                        <label className="flex items-center gap-1 text-sm">
                                            <input
                                                type="radio"
                                                value="false"
                                                checked={newRecordStatus === false}
                                                onChange={() => setNewRecordStatus(false)}
                                                className="w-3 h-3"
                                            />
                                            <span className="text-red-600 font-medium">Check-out</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateRecord}
                                        disabled={loading || !newRecordTime}
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
                        // View Mode - Compact Session List
                        <div className="space-y-3">
                            {pairs.length > 0 ? (
                                pairs.map((p, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        {/* Session Header */}
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded">
                                                Session {idx + 1}
                                            </span>
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
                                        </div>

                                   {/* Connected Time Pair with Edit Buttons Aligned */}
<div className="flex items-center gap-3">
    <div className="flex flex-col items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <div className="w-0.5 h-4 bg-gray-300 my-1"></div>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    </div>
    <div className="space-y-2 flex-1">
        {/* Start Time with Edit In Button */}
        <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
                <span className="font-medium">Start:</span> {formatTimeSimple(new Date(p.in.timeStamp))}
            </div>
            <button
                onClick={() => handleEditClick(p.in, 'in')}
                className="bg-blue-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1 ml-2"
                title="Edit check-in time"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {/* <span className="hidden sm:inline">In</span> */}
            </button>
        </div>
        
        {/* End Time with Edit Out Button */}
        <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
                <span className="font-medium">End:</span> {p.out ? formatTimeSimple(new Date(p.out.timeStamp)) : "—"}
            </div>
            {p.out ? (
                <button
                    onClick={() => handleEditClick(p.out, 'out')}
                    className="bg-blue-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1 ml-2"
                    title="Edit check-out time"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {/* <span className="hidden sm:inline"> Out</span> */}
                </button>
            ) : (
                <>
                <div className="w-20"></div> {/* Spacer for alignment when no check-out */}
           </> )}
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