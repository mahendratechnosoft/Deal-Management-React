import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import toast from "react-hot-toast";
import Chart from 'chart.js/auto';

function PreviewTaskModal({ taskId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState('timelogs');
  const [showAssigneesDropdown, setShowAssigneesDropdown] = useState(false);
  const [showFollowersDropdown, setShowFollowersDropdown] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [searchAssignees, setSearchAssignees] = useState('');
  const [searchFollowers, setSearchFollowers] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const timerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const teamMembers = [
    "Dnyanesh Patil", "Aditya Lohar", "Punamdeep Kaur", "Shital Dhomase",
    "Rucha Gawas", "Roshan Manik Hiray", "Rohan Sonawane"
  ];

  const timeLogs = [
    { id: 1, member: "Dnyanesh Patil", startTime: "10-12-2024 9:24 AM", endTime: "10-12-2024 6:32 PM", timeSpent: "09:08", decimalTime: "9.14" },
    { id: 2, member: "Dnyanesh Patil", startTime: "02-12-2024 9:18 AM", endTime: "02-12-2024 6:35 PM", timeSpent: "09:16", decimalTime: "9.28" },
    { id: 3, member: "Dnyanesh Patil", startTime: "27-11-2024 9:16 AM", endTime: "27-11-2024 6:38 PM", timeSpent: "09:21", decimalTime: "9.36" },
    { id: 4, member: "Dnyanesh Patil", startTime: "26-11-2024 9:21 AM", endTime: "26-11-2024 6:30 PM", timeSpent: "09:09", decimalTime: "9.16" },
    { id: 5, member: "Dnyanesh Patil", startTime: "25-11-2024 9:26 AM", endTime: "25-11-2024 6:37 PM", timeSpent: "09:11", decimalTime: "9.19" }
  ];

  const mockAttachments = [
    { id: 1, name: "design-mockup.png", size: "2.4 MB", type: "image" },
    { id: 2, name: "requirements.pdf", size: "1.8 MB", type: "pdf" },
    { id: 3, name: "wireframes.fig", size: "3.2 MB", type: "design" }
  ];

  const mockTags = [
    { id: 1, name: "design", color: "bg-purple-100 text-purple-800" },
    { id: 2, name: "development", color: "bg-blue-100 text-blue-800" },
    { id: 3, name: "urgent", color: "bg-red-100 text-red-800" },
    { id: 4, name: "frontend", color: "bg-green-100 text-green-800" }
  ];

  const references = [
    { id: 1, name: "Rathi Sir Ref.", active: false },
    { id: 2, name: "Payment #MDS Recurring", active: false },
    { id: 3, name: "For Yuva Carrer Academy", active: true },
    { id: 4, name: "GMB Account", active: true },
    { id: 5, name: "Microsoft 365", active: true },
    { id: 6, name: "Payment reference", active: true },
    { id: 7, name: "Urgeth", active: true },
    { id: 8, name: "Vinali Mam Ref.", active: true }
  ];

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

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const initChart = useCallback(() => {
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Dnyanesh Patil',
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
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockTask = {
        id: taskId,
        subject: "Website Development",
        description: "No description for this task",
        status: "in-progress",
        priority: "medium",
        assignees: ["Dnyanesh Patil"],
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
      setSelectedAssignees(mockTask.assignees);
      setSelectedFollowers(mockTask.followers);
      setComments([
        { id: 1, user: "Punamdeep Kaur", avatar: "PK", comment: "Please review the homepage layout", timestamp: "Today 10:30 AM", isEdited: false },
        { id: 2, user: "Aditya Lohar", avatar: "AL", comment: "Working on the contact form integration", timestamp: "Yesterday 3:45 PM", isEdited: false }
      ]);
      setAttachments(mockAttachments);
      setTags(mockTags);
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Failed to load task details");
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

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    const newCommentObj = {
      id: comments.length + 1,
      user: "You",
      avatar: "ME",
      comment: newComment,
      timestamp: "Just now",
      isEdited: false
    };
    setComments([newCommentObj, ...comments]);
    setNewComment('');
    toast.success("Comment added");
  };

  const handleToggleAssignee = (member) => {
    if (selectedAssignees.includes(member)) {
      setSelectedAssignees(selectedAssignees.filter(m => m !== member));
    } else {
      setSelectedAssignees([...selectedAssignees, member]);
    }
  };

  const handleToggleFollower = (member) => {
    if (selectedFollowers.includes(member)) {
      setSelectedFollowers(selectedFollowers.filter(m => m !== member));
    } else {
      setSelectedFollowers([...selectedFollowers, member]);
    }
  };

  const handleToggleReference = (refId) => {
    const updatedReferences = references.map(ref => 
      ref.id === refId ? { ...ref, active: !ref.active } : ref
    );
    if (task) {
      setTask({
        ...task,
        references: updatedReferences.filter(r => r.active).map(r => r.name)
      });
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTag.trim()) {
      toast.error("Please enter a tag");
      return;
    }
    const newTagObj = {
      id: tags.length + 1,
      name: newTag.toLowerCase(),
      color: "bg-gray-100 text-gray-800"
    };
    setTags([...tags, newTagObj]);
    setNewTag('');
    toast.success("Tag added");
  };

  const handleRemoveTag = (tagId) => {
    setTags(tags.filter(tag => tag.id !== tagId));
    toast.success("Tag removed");
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file, index) => ({
      id: attachments.length + index + 1,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type.split('/')[0] || 'file'
    }));
    setAttachments([...attachments, ...newAttachments]);
    toast.success(`${files.length} file(s) uploaded`);
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

  const getFileIcon = (type) => {
    switch(type) {
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'design': return '🎨';
      default: return '📎';
    }
  };

  const filteredAssignees = teamMembers.filter(member =>
    member.toLowerCase().includes(searchAssignees.toLowerCase())
  );

  const filteredFollowers = teamMembers.filter(member =>
    member.toLowerCase().includes(searchFollowers.toLowerCase())
  );

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
                      <span className="text-sm font-medium text-blue-600">In Progress</span>
                      <button onClick={handleTogglePublic} className="text-sm text-blue-600 hover:text-blue-800">
                        {task.isPublic ? 'Public Task' : 'Private Task'} - Make {task.isPublic ? 'Private' : 'Public'}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleMarkComplete} className="px-3 py-1.5 bg-green-100 text-green-700 rounded font-medium hover:bg-green-200 text-sm">
                    Mark complete
                  </button>
                </div>

                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-100">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <div className="text-sm">
                      <span className="font-medium text-blue-800">Related: </span>
                      <span className="text-blue-600">{task.projectId} - {task.projectName}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">Timeline</h3>
                    <button onClick={handleToggleTimer} className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 text-sm ${
                      isTimerRunning ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}>
                      {isTimerRunning ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                          Stop
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                  <span className="font-medium">{log.member.split(' ')[0]}</span>
                                  <span className="text-gray-600">{log.member.split(' ')[1]}</span>
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
                          <span className="text-xs text-gray-600">Dnyanesh Patil</span>
                        </div>
                      </div>
                      
                      <div className="relative h-48 mb-2">
                        <canvas ref={chartRef}></canvas>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500">Member:</span>
                            <span className="font-medium text-blue-600">Dnyanesh Patil</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500">Avg Time:</span>
                            <span className="font-medium text-gray-900">8.75 hrs/day</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium text-gray-900">61.25 hrs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <h3 className="font-semibold text-gray-900 mb-2">Comments</h3>
                <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-100 pb-2 last:border-0">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {comment.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 text-sm">{comment.user}</span>
                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                          </div>
                          <p className="text-gray-700 text-sm mt-0.5">{comment.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddComment} className="flex gap-1.5">
                  <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add comment..." className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                  <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    Add
                  </button>
                </form>
              </div>

              {/* Attachments */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Attachments</h3>
                  <div>
                    <input type="file" id="fileUpload" multiple onChange={handleFileUpload} className="hidden" />
                    <label htmlFor="fileUpload" className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      + Add Files
                    </label>
                  </div>
                </div>
                
                {attachments.length > 0 ? (
                  <div className="space-y-1.5">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getFileIcon(attachment.type)}</span>
                          <div>
                            <div className="font-medium text-gray-900 text-xs">{attachment.name}</div>
                            <div className="text-xs text-gray-500">{attachment.size}</div>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveAttachment(attachment.id)} className="text-gray-400 hover:text-red-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 italic p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                    No attachments yet
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
                      PK
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Created by</div>
                      <div className="font-medium text-gray-900 text-sm">Punamdeep Kaur</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Status</div>
                      <div className="font-medium text-blue-600 text-sm">In Progress</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Priority</div>
                      <div className="font-medium text-gray-900 text-sm">Medium</div>
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
                      <div className="font-medium text-gray-900 text-sm">₹{task.hourlyRate.toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">Billable</div>
                      <div className="font-medium text-gray-900 text-sm">{task.isBillable ? 'Billable' : 'Non-billable'}</div>
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

              {/* Tags */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-xs ${tag.color}`}>
                      <span>#{tag.name}</span>
                      <button onClick={() => handleRemoveTag(tag.id)} className="text-current opacity-70 hover:opacity-100">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddTag} className="flex gap-1.5">
                  <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag..." className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500" />
                  <button type="submit" className="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
                    Add
                  </button>
                </form>
              </div>

              {/* References */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <h3 className="font-semibold text-gray-900 mb-2">References</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {references.map((ref) => (
                    <button key={ref.id} onClick={() => handleToggleReference(ref.id)} className={`flex items-center justify-between px-2 py-1.5 rounded border text-xs transition-colors ${
                      ref.active ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                      <span className="truncate">{ref.name}</span>
                      <span className={`ml-0.5 ${ref.active ? 'text-blue-500' : 'text-gray-400'}`}>
                        {ref.active ? '✓' : '✕'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignees */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Assignees</h3>
                  <button onClick={() => setShowAssigneesDropdown(!showAssigneesDropdown)} className="text-sm text-blue-600 hover:text-blue-800">
                    {showAssigneesDropdown ? 'Close' : 'Assign task'}
                  </button>
                </div>
                
                <div className="mb-2 space-y-1.5">
                  {selectedAssignees.map((assignee) => (
                    <div key={assignee} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded border border-gray-200">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(assignee)}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{assignee}</span>
                    </div>
                  ))}
                </div>

                {showAssigneesDropdown && (
                  <div className="mb-2 p-2 bg-white rounded border border-gray-200 shadow">
                    <input type="text" value={searchAssignees} onChange={(e) => setSearchAssignees(e.target.value)} placeholder="Search members..." className="w-full px-2 py-1.5 mb-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500" />
                    <div className="max-h-40 overflow-y-auto">
                      {filteredAssignees.map((member) => (
                        <div key={member} onClick={() => handleToggleAssignee(member)} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-sm ${
                          selectedAssignees.includes(member) ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}>
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(member)}
                          </div>
                          <span className={selectedAssignees.includes(member) ? 'text-blue-700' : 'text-gray-900'}>
                            {member}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Followers - Exact copy of Assignees section */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Followers</h3>
                  <button onClick={() => setShowFollowersDropdown(!showFollowersDropdown)} className="text-sm text-blue-600 hover:text-blue-800">
                    {showFollowersDropdown ? 'Close' : 'Add followers'}
                  </button>
                </div>
                
                <div className="mb-2 space-y-1.5">
                  {selectedFollowers.map((follower) => (
                    <div key={follower} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded border border-gray-200">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(follower)}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{follower}</span>
                    </div>
                  ))}
                </div>

                {showFollowersDropdown && (
                  <div className="mb-2 p-2 bg-white rounded border border-gray-200 shadow">
                    <input type="text" value={searchFollowers} onChange={(e) => setSearchFollowers(e.target.value)} placeholder="Search members..." className="w-full px-2 py-1.5 mb-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500" />
                    <div className="max-h-40 overflow-y-auto">
                      {filteredFollowers.map((member) => (
                        <div key={member} onClick={() => handleToggleFollower(member)} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-sm ${
                          selectedFollowers.includes(member) ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}>
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(member)}
                          </div>
                          <span className={selectedFollowers.includes(member) ? 'text-blue-700' : 'text-gray-900'}>
                            {member}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reminders */}
              <div className="bg-white rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Reminders</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Create
                  </button>
                </div>
                <div className="text-center text-gray-500 italic p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                  No reminders
                </div>
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