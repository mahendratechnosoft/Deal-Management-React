import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import toast from "react-hot-toast";
import Chart from 'chart.js/auto';
import { GlobalMultiSelectField } from '../../BaseComponet/CustomerFormInputs';
import TaskComments from './TaskComments';
import CircularAssigneesSelector from './CircularAssigneesSelector';

function PreviewTaskModal({ taskId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState('timelogs');

  const [attachments, setAttachments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [timeLogs, setTimeLogs] = useState([]);
  const timerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingAttachment, setDeletingAttachment] = useState(null);
  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);


  useEffect(() => {
    // Get current user info from localStorage or your auth system
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser({
          employeeId: parsedUser.employeeId || parsedUser.id,
          name: parsedUser.name || parsedUser.username || 'You'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        // Fallback to a default user
        setCurrentUser({
          employeeId: 'current-user',
          name: 'You'
        });
      }
    } else {
      // Fallback if no user data found
      setCurrentUser({
        employeeId: 'current-user',
        name: 'You'
      });
    }
  }, []);
  // Fetch task details when taskId changes
  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  useEffect(() => {
    if (activeTab === 'statistics' && chartRef.current) initChart();
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [activeTab]);

  // Add this useEffect after the existing useEffect that fetches task details
  useEffect(() => {
    if (taskId) {
      fetchAttachments();
    }
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      console.log('Fetching attachments for taskId:', taskId);
      const response = await axiosInstance.get(`getTaskAttachmentByTaskId/${taskId}`);
      console.log('Attachments API response:', response);

      if (response.data && Array.isArray(response.data)) {
        console.log('Attachments received:', response.data.length);
        setAttachments(response.data);
      } else {
        console.log('No attachments array in response');
        setAttachments([]);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load attachments');
      setAttachments([]);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingFile(true);

    try {
      // Read files as base64
      const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve({
              taskId: taskId,
              fileName: file.name,
              contentType: file.type,
              data: base64String
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const attachmentData = await Promise.all(filePromises);

      // Upload files to API
      const response = await axiosInstance.post('addTaskAttachement', attachmentData);

      if (response.status === 200) {
        toast.success(`${files.length} file(s) uploaded successfully`);
        // Refresh attachments list
        fetchAttachments();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file(s)');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;

    setDeletingAttachment(attachmentId);

    try {
      const response = await axiosInstance.delete(`deleteTaskAttachement/${attachmentId}`);

      if (response.status === 200) {
        toast.success('Attachment deleted successfully');
        // Remove from local state
        setAttachments(attachments.filter(att => att.taskAttachmentId !== attachmentId));
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    } finally {
      setDeletingAttachment(null);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      // Create a blob from base64 data
      const byteCharacters = atob(attachment.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachment.contentType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error('Failed to download file');
    }
  };

  const getFileIconComponent = (fileName, contentType) => {
    const extension = fileName.split('.').pop().toLowerCase();

    // Check by content type first
    if (contentType.includes('image')) {
      return (
        <div className="text-blue-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (contentType.includes('pdf')) {
      return (
        <div className="text-red-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (contentType.includes('word') || contentType.includes('document') || extension === 'doc' || extension === 'docx') {
      return (
        <div className="text-blue-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (contentType.includes('excel') || contentType.includes('spreadsheet') || extension === 'xls' || extension === 'xlsx') {
      return (
        <div className="text-green-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (contentType.includes('zip') || contentType.includes('compressed') || extension === 'zip' || extension === 'rar' || extension === '7z') {
      return (
        <div className="text-yellow-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    // Default file icon
    return (
      <div className="text-gray-600">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  const formatFileSize = (base64String) => {
    if (!base64String) return '0 KB';

    // Calculate size from base64 string
    const sizeInBytes = (base64String.length * 3) / 4;

    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ====================================================================

  const fetchTeamMembers = async () => {
    setLoadingTeam(true);
    try {
      const response = await axiosInstance.get('getEmployeeNameAndId');
      if (response.data && Array.isArray(response.data)) {
        // Format for react-select
        const formattedTeamMembers = response.data.map(member => ({
          value: member.employeeId,
          label: member.name
        }));
        setTeamMembers(formattedTeamMembers);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoadingTeam(false);
    }
  };

  const initChart = useCallback(() => {
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Time Spent',
        data: [9.14, 8.5, 9.28, 8.75, 9.36, 7.2, 8.9],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(14, 165, 233, 0.8)', 'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)',
          'rgb(239, 68, 68)', 'rgb(139, 92, 246)', 'rgb(14, 165, 233)', 'rgb(236, 72, 153)'
        ],
        borderWidth: 1,
        borderRadius: 6,
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, max: 12, grid: { color: 'rgba(0, 0, 0, 0.03)' } },
        x: { grid: { display: false } }
      }
    };

    chartInstance.current = new Chart(ctx, { type: 'bar', data, options });
  }, []);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);

      // Fetch task data from API
      const response = await axiosInstance.get(`getTaskByItemId/${taskId}`);

      if (response.data) {
        const taskData = response.data;

        // Format dates to readable format
        const formatDate = (dateString) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } catch (e) {
            console.error('Error parsing date:', dateString, e);
            return '';
          }
        };

        // Format time logs from API response
        const formattedTimeLogs = taskData.timeLogs || [];

        // Format comments from API response
        const formattedComments = taskData.comments || [];

        // Format attachments from API response
        const formattedAttachments = taskData.attachments || [];

        // Extract assignee and follower IDs from the response
        const assigneeIds = taskData.assignedEmployees
          ? taskData.assignedEmployees.map(emp => emp.employeeId)
          : [];

        const followerIds = taskData.followersEmployees
          ? taskData.followersEmployees.map(emp => emp.employeeId)
          : [];

        // Calculate total logged time
        const totalLoggedTime = taskData.totalLoggedTime || 0;

        // Set task data
        setTask({
          taskId: taskData.taskId,
          adminId: taskData.adminId || '',
          subject: taskData.subject || '',
          description: taskData.description || '',
          hourlyRate: taskData.hourlyRate || 0,
          startDate: formatDate(taskData.startDate),
          dueDate: formatDate(taskData.endDate),
          priority: taskData.priority || 'Medium',
          status: taskData.status || 'pending',
          relatedTo: taskData.relatedTo || '',
          relatedId: taskData.relatedToId || '',
          relatedName: taskData.relatedToName || '',
          assignees: assigneeIds,
          followers: followerIds,
          estimateHours: taskData.estimatedHours || 0,
          isBillable: taskData.isBillable || false,
          isPublic: taskData.isPublic || false,
          totalLoggedTime: totalLoggedTime,
          createdAt: taskData.createdAt || '',
          createdBy: taskData.createdBy || '',
          projectName: taskData.projectName || 'No Project',
          projectId: taskData.projectId || 'N/A'
        });

        setTimerSeconds(totalLoggedTime);
        setTimeLogs(formattedTimeLogs);

        setAttachments(formattedAttachments);
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Failed to load task details");

      // Fallback to mock data if API fails
      const mockTask = {
        id: taskId,
        subject: "Website Development",
        description: "No description for this task",
        status: "in-progress",
        priority: "medium",
        assignees: [],
        followers: [],
        startDate: "25-11-2024",
        dueDate: "30-11-2024",
        hourlyRate: 0.00,
        isBillable: true,
        isPublic: false,
        totalLoggedTime: 166080,
        projectName: "Muscleholic Nutrition",
        projectId: "#101",
        createdBy: "Punamdeep Kaur",
        createdAt: "2024-11-25"
      };

      setTask(mockTask);
      setTimerSeconds(mockTask.totalLoggedTime);

      // Mock time logs
      setTimeLogs([
        { id: 1, member: "Dnyanesh Patil", startTime: "10-12-2024 9:24 AM", endTime: "10-12-2024 6:32 PM", timeSpent: "09:08", decimalTime: "9.14" },
        { id: 2, member: "Dnyanesh Patil", startTime: "02-12-2024 9:18 AM", endTime: "02-12-2024 6:35 PM", timeSpent: "09:16", decimalTime: "9.28" },
        { id: 3, member: "Dnyanesh Patil", startTime: "27-11-2024 9:16 AM", endTime: "27-11-2024 6:38 PM", timeSpent: "09:21", decimalTime: "9.36" }
      ]);

    } finally {
      setLoading(false);
    }
  };

  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    toast.success(isTimerRunning ? "Timer stopped" : "Timer started");
  };

  const handleTogglePublic = () => {
    if (task) {
      setTask({ ...task, isPublic: !task.isPublic });
      toast.success(`Task is now ${!task.isPublic ? 'public' : 'private'}`);
    }
  };

  const handleMarkComplete = () => {
    if (task) {
      setTask({ ...task, status: 'completed' });
      toast.success("Task marked as complete");
    }
  };



  const handleAssigneesChange = (selectedIds) => {
    if (task) {
      setTask(prev => ({
        ...prev,
        assignees: selectedIds
      }));
    }
  };

  const handleFollowersChange = (selectedIds) => {
    if (task) {
      setTask(prev => ({
        ...prev,
        followers: selectedIds
      }));
    }
  };



  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
    toast.success("Attachment removed");
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };


  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'on-hold': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Find selected assignee names
  const getSelectedAssigneeNames = () => {
    if (!task || !task.assignees || !Array.isArray(teamMembers)) return [];
    return task.assignees.map(id => {
      const member = teamMembers.find(m => m.value === id);
      return member ? member.label : `Employee ${id}`;
    });
  };

  // Find selected follower names
  const getSelectedFollowerNames = () => {
    if (!task || !task.followers || !Array.isArray(teamMembers)) return [];
    return task.followers.map(id => {
      const member = teamMembers.find(m => m.value === id);
      return member ? member.label : `Employee ${id}`;
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
          <div className="text-center p-4">
            <p className="text-red-500">Task not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Task Preview</h2>
                <p className="text-blue-100 text-xs">View and manage task details</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-3">
              {/* Task Header */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{task.subject}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                        {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
                      </span>
                      <button onClick={handleTogglePublic} className="text-sm text-blue-600 hover:text-blue-800">
                        {task.isPublic ? 'Public Task' : 'Private Task'} - Make {task.isPublic ? 'Private' : 'Public'}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleMarkComplete} className="px-3 py-1.5 bg-green-100 text-green-700 rounded font-medium hover:bg-green-200 text-sm">
                    Mark complete
                  </button>
                </div>

                {/* Description */}
                <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">Description</h4>
                  <p className="text-gray-700 text-sm">
                    {task.description || "No description for this task"}
                  </p>
                </div>

                {/* Related Info */}
                {task.relatedTo && task.relatedName && (
                  <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-100">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <div className="text-sm">
                        <span className="font-medium text-blue-800">Related: </span>
                        <span className="text-blue-600">
                          {task.relatedTo.charAt(0).toUpperCase() + task.relatedTo.slice(1)} - {task.relatedName}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline Section */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">Timeline</h3>
                    <button onClick={handleToggleTimer} className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 text-sm ${isTimerRunning ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}>
                      {isTimerRunning ? (
                        <>
                          {/* Animated clock with moving second hand */}
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                            {/* Hour hand */}
                            <line x1="12" y1="12" x2="12" y2="9" strokeWidth="2" strokeLinecap="round" />
                            {/* Minute hand */}
                            <line x1="12" y1="12" x2="15" y2="12" strokeWidth="1.5" strokeLinecap="round" />
                            {/* Animated second hand */}
                            <line x1="12" y1="12" x2="12" y2="6" strokeWidth="1" strokeLinecap="round" className="origin-center animate-spin" style={{ animationDuration: '1s' }} />
                            {/* Stop square */}
                            <rect x="9" y="9" width="6" height="6" strokeWidth="1.5" />
                          </svg>
                          Stop
                        </>
                      ) : (
                        <>
                          {/* Static clock with play symbol */}
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9l3 1.5-3 1.5V9z" />
                          </svg>
                          Start
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 font-mono">{formatTime(timerSeconds)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Current session</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Total logged time</div>
                      <div className="text-lg font-bold text-gray-900">{formatTime(task.totalLoggedTime + timerSeconds)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded border border-gray-200">
                <div className="border-b border-gray-200">
                  <nav className="flex px-3">
                    <button onClick={() => setActiveTab('timelogs')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'timelogs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                      Time Logs
                    </button>
                    <button onClick={() => setActiveTab('statistics')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'statistics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                      Statistics
                    </button>
                  </nav>
                </div>

                <div className="p-3">
                  {activeTab === 'timelogs' ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Member</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Start Time</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">End Time</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Time Spent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {timeLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="font-medium">{log.member?.split(' ')[0] || 'Unknown'}</span>
                                  <span className="text-gray-600">{log.member?.split(' ')[1] || ''}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-gray-900">{log.startTime}</td>
                              <td className="px-3 py-2 text-gray-900">{log.endTime}</td>
                              <td className="px-3 py-2">
                                <div className="font-medium">Time (h): {log.timeSpent}</div>
                                <div className="text-gray-500 text-xs">Decimal: {log.decimalTime}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">Weekly Time Distribution</h4>
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
                          <span className="text-xs text-gray-600">Time Spent (hours)</span>
                        </div>
                      </div>

                      <div className="relative h-48 mb-2">
                        <canvas ref={chartRef}></canvas>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500">Total Time:</span>
                            <span className="font-medium text-gray-900">
                              {formatTime(task.totalLoggedTime + timerSeconds)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500">Estimate:</span>
                            <span className="font-medium text-gray-900">
                              {task.estimateHours || 0} hours
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments */}
              <TaskComments taskId={taskId} />
              {/* Attachments */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">Attachments</h3>
                  <div className="flex items-center gap-2">
                    {uploadingFile && (
                      <span className="text-xs text-gray-500">Uploading...</span>
                    )}
                    <input
                      type="file"
                      id="fileUpload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingFile}
                    />
                    <label
                      htmlFor="fileUpload"
                      className={`text-xs px-2 py-1 rounded ${uploadingFile ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-50 hover:bg-blue-100'}`}
                    >
                      + Add
                    </label>
                  </div>
                </div>

                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.taskAttachmentId || attachment.id}
                        className="border border-gray-200 rounded p-2 hover:border-blue-300 hover:shadow-sm transition-all group"
                      >
                        <div className="flex flex-col h-full">
                          {/* File icon and name */}
                          <div className="flex items-start gap-2 mb-1">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                              {getFileIconComponent(attachment.fileName, attachment.contentType)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="font-medium text-gray-900 text-xs truncate cursor-pointer hover:text-blue-600"
                                onClick={() => handleDownloadAttachment(attachment)}
                                title={attachment.fileName}
                              >
                                {attachment.fileName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatFileSize(attachment.data)}
                              </div>
                            </div>
                          </div>

                          {/* Meta info and actions */}
                          <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-100">
                            <div className="text-xs text-gray-500 truncate max-w-[70%]" title={attachment.uploadedBy || 'Unknown'}>
                              {attachment.uploadedBy || 'Unknown'}
                            </div>
                            <div className="flex items-center gap-1">
                              {attachment.uploadedAt && (
                                <span className="text-xs text-gray-400">
                                  {new Date(attachment.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteAttachment(attachment.taskAttachmentId || attachment.id)}
                                disabled={deletingAttachment === (attachment.taskAttachmentId || attachment.id)}
                                className="text-gray-400 hover:text-red-500 ml-1"
                                title="Delete"
                              >
                                {deletingAttachment === (attachment.taskAttachmentId || attachment.id) ? (
                                  <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 italic text-xs p-4 bg-gray-50 rounded border border-dashed border-gray-300">
                    No attachments uploaded yet
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Task Info */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <h3 className="font-semibold text-gray-900 mb-2">Task Info</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(task.createdBy)}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Created by</div>
                      <div className="font-medium text-gray-900 text-sm">{task.createdBy || 'Unknown'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Status</div>
                      <div className={`font-medium text-sm ${getStatusColor(task.status)}`}>
                        {task.status?.charAt(0).toUpperCase() + task.status?.slice(1) || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Priority</div>
                      <div className={`font-medium text-sm ${getPriorityColor(task.priority)}`}>
                        {task.priority || 'Medium'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">Start Date</div>
                      <div className="font-medium text-gray-900 text-sm">{task.startDate}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">Due Date</div>
                      <div className="font-medium text-gray-900 text-sm">{task.dueDate}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">Hourly Rate</div>
                      <div className="font-medium text-gray-900 text-sm">₹{parseFloat(task.hourlyRate || 0).toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">Billable</div>
                      <div className="font-medium text-gray-900 text-sm">{task.isBillable ? 'Billable' : 'Non-billable'}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">Estimate Hours</div>
                      <div className="font-medium text-gray-900 text-sm">{task.estimateHours || 0} hours</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">Total logged time</div>
                      <div className="font-bold text-gray-900 text-sm">{formatTime(task.totalLoggedTime + timerSeconds)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignees - Using GlobalMultiSelectField */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <h3 className="font-semibold text-gray-900 mb-2">Assignees</h3>


                <CircularAssigneesSelector
                  value={task.assignees || []}
                  options={teamMembers}
                  loading={loadingTeam}
                  onChange={handleAssigneesChange}
                  getInitials={getInitials}
                />



                {/* Display selected assignees */}
                {/* {getSelectedAssigneeNames().length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {getSelectedAssigneeNames().map((assignee, index) => (
                      <div key={index} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded border border-gray-200">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(assignee)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{assignee}</span>
                      </div>
                    ))}
                  </div>
                )} */}
              </div>

              {/* Followers - Using GlobalMultiSelectField */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <h3 className="font-semibold text-gray-900 mb-2">Followers</h3>

                <CircularAssigneesSelector
                  value={task.followers || []}
                  options={teamMembers}
                  loading={loadingTeam}
                  onChange={handleFollowersChange}
                  getInitials={getInitials}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium">
              Close
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewTaskModal;