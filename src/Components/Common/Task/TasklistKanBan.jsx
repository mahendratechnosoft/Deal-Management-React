import React, { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance.js";

function TasklistKanBan({
    onStatusChange,
    onEdit,
    onDelete,
    onPreview,
    teamMembers = [],
    searchTerm = "",
    listType = "ASSIGNED",
    initialTotalCounts = {},
    refreshKanban,
    taskUpdateTrigger = 0,
    newTaskCreated = false,
}) {
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [kanbanTasks, setKanbanTasks] = useState([]);
    const [kanbanLoading, setKanbanLoading] = useState(false);
    const [columns, setColumns] = useState([]);
    const kanbanRef = useRef(null);

    // Initialize with initialTotalCounts from parent
    const [totalCounts, setTotalCounts] = useState(() => ({
        NOT_STARTED: initialTotalCounts.NOT_STARTED || 0,
        IN_PROGRESS: initialTotalCounts.IN_PROGRESS || 0,
        TESTING: initialTotalCounts.TESTING || 0,
        AWAITING_FEEDBACK: initialTotalCounts.AWAITING_FEEDBACK || 0,
        COMPLETE: initialTotalCounts.COMPLETE || 0,
        TOTAL: initialTotalCounts.TOTAL || 0,
    }));
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (isMounted) {
                await fetchInitialKanbanTasks();
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (newTaskCreated) {
            console.log('New task created detected, refreshing Kanban...');
            handleManualRefresh();
        }
    }, [newTaskCreated]);

    // Refresh Kanban when parent triggers it
    useEffect(() => {
        if (taskUpdateTrigger > 0) {
            console.log("Refreshing Kanban due to task update");
            handleManualRefresh();
        }
    }, [taskUpdateTrigger]);


    useEffect(() => {
        console.log('Kanban: initialTotalCounts updated', initialTotalCounts);

        // Always update when we get new counts from parent
        // Use functional update to ensure we get the latest state
        setColumns(prevColumns => {
            // If no initialTotalCounts, return previous columns
            if (Object.keys(initialTotalCounts).length === 0) {
                return prevColumns;
            }

            // Map through columns and update totalCount
            return prevColumns.map(col => ({
                ...col,
                totalCount: initialTotalCounts[col.id] || 0
            }));
        });
    }, [initialTotalCounts]); // Remove the countsChanged logic

    // Initialize columns with total counts
    const initializeColumns = () => {
        return [
            {
                id: "NOT_STARTED",
                title: "Not Started",
                color: "bg-gray-50",
                textColor: "text-gray-800",
                borderColor: "border-gray-300",
                totalCount: totalCounts.NOT_STARTED || 0,
                currentPage: 0,
                hasMore: true,
                isLoading: false,
                tasks: []
            },
            {
                id: "IN_PROGRESS",
                title: "In Progress",
                color: "bg-blue-50",
                textColor: "text-blue-800",
                borderColor: "border-blue-200",
                totalCount: totalCounts.IN_PROGRESS || 0,
                currentPage: 0,
                hasMore: true,
                isLoading: false,
                tasks: []
            },
            {
                id: "TESTING",
                title: "Testing",
                color: "bg-yellow-50",
                textColor: "text-yellow-800",
                borderColor: "border-yellow-200",
                totalCount: totalCounts.TESTING || 0,
                currentPage: 0,
                hasMore: true,
                isLoading: false,
                tasks: []
            },
            {
                id: "AWAITING_FEEDBACK",
                title: "Awaiting Feedback",
                color: "bg-orange-50",
                textColor: "text-orange-800",
                borderColor: "border-orange-200",
                totalCount: totalCounts.AWAITING_FEEDBACK || 0,
                currentPage: 0,
                hasMore: true,
                isLoading: false,
                tasks: []
            },
            {
                id: "COMPLETE",
                title: "Complete",
                color: "bg-green-50",
                textColor: "text-green-800",
                borderColor: "border-green-200",
                totalCount: totalCounts.COMPLETE || 0,
                currentPage: 0,
                hasMore: true,
                isLoading: false,
                tasks: []
            },
        ];
    };

    // Fetch total task counts from API
    const fetchTotalTaskCounts = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`getTaskCount?listType=${listType}`);
            const data = response.data;

            if (data) {
                const newCounts = {
                    NOT_STARTED: data.NOT_STARTED || 0,
                    IN_PROGRESS: data.IN_PROGRESS || 0,
                    TESTING: data.TESTING || 0,
                    AWAITING_FEEDBACK: data.AWAITING_FEEDBACK || 0,
                    COMPLETE: data.COMPLETE || 0,
                    TOTAL: data.TOTAL || 0,
                };

                setTotalCounts(newCounts);

                // Update columns with new counts
                setColumns(prevColumns =>
                    prevColumns.map(col => ({
                        ...col,
                        totalCount: newCounts[col.id] || 0
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching total task counts:", error);
        }
    }, [listType]);

    // Fetch tasks for a specific column
    const fetchColumnTasks = async (columnId, page = 0, isLoadMore = false) => {
        try {
            setColumns(prevColumns =>
                prevColumns.map(col =>
                    col.id === columnId ? { ...col, isLoading: true } : col
                )
            );

            const url = `getAllTaskList/${page}/5?status=${columnId}&listType=${listType}${searchTerm ? `&search=${searchTerm}` : ''}`;

            const response = await axiosInstance.get(url);

            if (response.data && response.data.taskList) {
                const transformedTasks = response.data.taskList.map((task) => ({
                    id: task.taskId,
                    taskId: task.taskId,
                    subject: task.subject || "",
                    status: task.status || columnId,
                    priority: (task.priority || "medium").toLowerCase(),
                    assignees: task.assignedEmployees
                        ? task.assignedEmployees.map(
                            (emp) => emp.name || emp.employeeName || "Unnamed"
                        )
                        : [],
                    startDate: task.startDate,
                    dueDate: task.endDate,
                    hourlyRate: task.hourlyRate || 0,
                    estimateHours: task.estimatedHours || 0,
                    tags: task.relatedTo ? [task.relatedTo] : [],
                    relatedTo: task.relatedTo || "",
                    relatedToName: task.relatedToName || "",
                    followersEmployees: task.followersEmployees || [],
                }));

                // Update tasks state
                if (isLoadMore) {
                    setKanbanTasks(prevTasks => {
                        const existingTaskIds = new Set(prevTasks.map(t => t.taskId));
                        const newTasks = transformedTasks.filter(task => !existingTaskIds.has(task.taskId));
                        return [...prevTasks, ...newTasks];
                    });
                } else {
                    // Remove existing tasks for this column and add new ones
                    setKanbanTasks(prevTasks => {
                        const otherTasks = prevTasks.filter(task => task.status !== columnId);
                        return [...otherTasks, ...transformedTasks];
                    });
                }

                // Update column with new page info
                setColumns(prevColumns =>
                    prevColumns.map(col => {
                        if (col.id === columnId) {
                            const hasMoreData = response.data.totalPages > page + 1;
                            const columnTasks = isLoadMore
                                ? [...col.tasks, ...transformedTasks]
                                : transformedTasks;

                            return {
                                ...col,
                                currentPage: page,
                                hasMore: hasMoreData,
                                isLoading: false,
                                tasks: columnTasks
                            };
                        }
                        return col;
                    })
                );
            } else {
                setColumns(prevColumns =>
                    prevColumns.map(col =>
                        col.id === columnId ? { ...col, isLoading: false, tasks: [] } : col
                    )
                );
            }
        } catch (error) {
            console.error(`Error fetching ${columnId} tasks:`, error);
            setColumns(prevColumns =>
                prevColumns.map(col =>
                    col.id === columnId ? { ...col, isLoading: false } : col
                )
            );
            toast.error(`Failed to load ${columnId} tasks`);
        }
    };

    // Fetch initial tasks for all columns
    const fetchInitialKanbanTasks = async () => {
        try {
            setKanbanLoading(true);
            setKanbanTasks([]);

            // Fetch total counts first
            await fetchTotalTaskCounts();

            // Initialize columns
            const initialColumns = initializeColumns();
            setColumns(initialColumns);

            // Fetch all columns in parallel
            const columnPromises = initialColumns.map(column =>
                fetchColumnTasks(column.id, 0, false)
            );

            await Promise.all(columnPromises);
        } catch (error) {
            console.error("Error fetching initial kanban tasks:", error);
            toast.error("Failed to load kanban tasks");
        } finally {
            setKanbanLoading(false);
        }
    };

    const handleManualRefresh = async () => {
        console.log('Manual refresh called');

        try {
            setKanbanLoading(true);

            // Don't fetch counts if parent already provided them
            // Just refresh the tasks
            const initialColumns = initializeColumns();
            setColumns(initialColumns);

            // Fetch all columns in parallel
            const columnPromises = initialColumns.map(column =>
                fetchColumnTasks(column.id, 0, false)
            );

            await Promise.all(columnPromises);

            // toast.success("Kanban refreshed");
        } catch (error) {
            console.error("Error refreshing kanban:", error);
            toast.error("Failed to refresh kanban");
        } finally {
            setKanbanLoading(false);
        }
    };

    // Remove a task from Kanban (for delete operations)
    const removeTaskFromKanban = (taskId) => {
        const taskToRemove = kanbanTasks.find(t => t.taskId === taskId);

        if (taskToRemove) {
            // Remove from kanbanTasks
            setKanbanTasks(prevTasks => prevTasks.filter(task => task.taskId !== taskId));

            // Update columns
            setColumns(prevColumns =>
                prevColumns.map(col => {
                    if (col.id === taskToRemove.status) {
                        const newTasks = col.tasks.filter(task => task.taskId !== taskId);
                        return {
                            ...col,
                            tasks: newTasks,
                            totalCount: Math.max(0, col.totalCount - 1)
                        };
                    }
                    return col;
                })
            );

            // Update total counts
            setTotalCounts(prev => ({
                ...prev,
                [taskToRemove.status]: Math.max(0, (prev[taskToRemove.status] || 0) - 1),
                TOTAL: Math.max(0, prev.TOTAL - 1)
            }));
        }
    };

    // Update a task in Kanban (for edit operations)
    const updateTaskInKanban = (updatedTask) => {
        if (!updatedTask || !updatedTask.taskId) return;

        const oldTask = kanbanTasks.find(t => t.taskId === updatedTask.taskId);

        if (!oldTask) {
            // Task not found, might be a new task, refresh everything
            fetchInitialKanbanTasks();
            return;
        }

        // Update task in kanbanTasks
        setKanbanTasks(prevTasks =>
            prevTasks.map(task =>
                task.taskId === updatedTask.taskId ? { ...task, ...updatedTask } : task
            )
        );

        // Update columns
        setColumns(prevColumns => {
            const newColumns = [...prevColumns];

            // Remove from old column if status changed
            if (oldTask && oldTask.status !== updatedTask.status) {
                newColumns.forEach(col => {
                    if (col.id === oldTask.status) {
                        const filteredTasks = col.tasks.filter(t => t.taskId !== updatedTask.taskId);
                        return {
                            ...col,
                            tasks: filteredTasks,
                            totalCount: Math.max(0, col.totalCount - 1)
                        };
                    }
                });
            }

            // Add to new column or update in same column
            newColumns.forEach(col => {
                if (col.id === updatedTask.status) {
                    const exists = col.tasks.some(t => t.taskId === updatedTask.taskId);
                    if (!exists) {
                        // Add to new column
                        return {
                            ...col,
                            tasks: [...col.tasks, updatedTask],
                            totalCount: col.totalCount + 1
                        };
                    } else {
                        // Update existing task in column
                        return {
                            ...col,
                            tasks: col.tasks.map(t =>
                                t.taskId === updatedTask.taskId ? { ...t, ...updatedTask } : t
                            )
                        };
                    }
                }
                return col;
            });

            return newColumns;
        });

        // Update total counts if status changed
        if (oldTask && oldTask.status !== updatedTask.status) {
            setTotalCounts(prev => ({
                ...prev,
                [oldTask.status]: Math.max(0, (prev[oldTask.status] || 0) - 1),
                [updatedTask.status]: (prev[updatedTask.status] || 0) + 1,
            }));
        }
    };

    // Handle edit button click
    const handleEditClick = async (taskId) => {
        // Call parent's onEdit
        onEdit(taskId);
    };

    // Handle delete with proper state updates
    const handleDeleteClick = async (taskId, taskName) => {
        try {
            // Remove from local state immediately (optimistic update)
            removeTaskFromKanban(taskId);

            // Call parent's delete function
            await onDelete(taskId, taskName);

        } catch (error) {
            console.error("Error in kanban delete:", error);
            // If error, refresh everything
            await fetchInitialKanbanTasks();
            toast.error("Failed to delete task");
        }
    };

    // Initialize on mount
    useEffect(() => {
        fetchInitialKanbanTasks();
    }, []);

    // Refresh when search term changes
    useEffect(() => {
        if (searchTerm !== undefined) {
            const debounceTimer = setTimeout(() => {
                fetchInitialKanbanTasks();
            }, 500);

            return () => clearTimeout(debounceTimer);
        }
    }, [searchTerm]);

    // Refresh when listType changes
    useEffect(() => {
        if (listType) {
            fetchInitialKanbanTasks();
        }
    }, [listType]);

    // Filter tasks based on search
    const filteredTasks = kanbanTasks.filter(task => {
        if (!searchTerm || !searchTerm.trim()) return true;

        const subject = task.subject ? task.subject.toLowerCase() : "";
        const relatedToName = task.relatedToName ? task.relatedToName.toLowerCase() : "";
        const search = searchTerm.toLowerCase();

        return subject.includes(search) || relatedToName.includes(search);
    });

    // Group tasks by status for display
    const groupedTasks = columns.reduce((acc, column) => {
        acc[column.id] = filteredTasks.filter(task => task.status === column.id);
        return acc;
    }, {});

    // Drag and drop handlers with proper state updates
    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.taskId);
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = async (e, columnId) => {
        e.preventDefault();
        if (!draggedTask) return;

        // Only update if status changed
        if (draggedTask.status !== columnId) {
            const oldStatus = draggedTask.status;
            const taskId = draggedTask.taskId;

            try {
                // Update local state immediately (optimistic update)
                const updatedTask = { ...draggedTask, status: columnId };
                updateTaskInKanban(updatedTask);

                // Call API to update status on server
                await onStatusChange(taskId, columnId);

                toast.success(`Task moved to ${columns.find(c => c.id === columnId)?.title}`);

                // Refresh total counts to ensure sync
                setTimeout(() => {
                    fetchTotalTaskCounts();
                }, 300);

            } catch (error) {
                console.error("Error moving task:", error);
                // Revert on error by refreshing from server
                await fetchInitialKanbanTasks();
                toast.error("Failed to move task");
            }
        }

        setDraggedTask(null);
        setDragOverColumn(null);
    };

    // Load more tasks for a specific column
    const loadMoreColumnTasks = async (columnId) => {
        const column = columns.find(col => col.id === columnId);
        if (!column || !column.hasMore || column.isLoading) return;

        const nextPage = column.currentPage + 1;
        await fetchColumnTasks(columnId, nextPage, true);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } catch (error) {
            return "Invalid Date";
        }
    };

    // Check if task is overdue
    const isOverdue = (dueDate, status) => {
        if (!dueDate || status === "COMPLETE") return false;
        try {
            return new Date(dueDate) < new Date();
        } catch (error) {
            return false;
        }
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        if (!priority) return "bg-gray-100 text-gray-800";

        switch (priority.toLowerCase()) {
            case "low": return "bg-green-100 text-green-800";
            case "medium": return "bg-yellow-100 text-yellow-800";
            case "high": return "bg-orange-100 text-orange-800";
            case "urgent": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Format priority display
    const formatPriority = (priority) => {
        if (!priority) return "Medium";
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    // Kanban skeleton loader
    const KanbanSkeleton = () => (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {initializeColumns().map((column) => (
                <div key={column.id} className="flex-shrink-0 w-72">
                    <div className="bg-gray-100 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                                    <div className="flex justify-between">
                                        <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (kanbanLoading && kanbanTasks.length === 0) {
        return <KanbanSkeleton />;
    }

    return (
        <div className="kanban-board">
            {/* Refresh button */}
            {/* <div className="flex justify-end mb-4">
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="Refresh Kanban"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div> */}

            {/* Kanban Columns with individual scrollbars */}
            <div
                ref={kanbanRef}
                className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-300px)] min-h-[500px] px-1"
            >
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className={`flex-shrink-0 w-72 ${dragOverColumn === column.id ? 'ring-2 ring-blue-500 ring-inset rounded-lg' : ''}`}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >

                        {/* Column Header */}
                        <div className={`${column.color} rounded-lg p-2 mb-3 border ${column.borderColor} sticky top-0 z-1`}>
                            <div className="flex items-center justify-between mb-0">
                                <div className="flex items-center gap-2 pl-2">
                                    <h3 className={`font-semibold text-sm ${column.textColor}`}>
                                        {column.title}
                                    </h3>
                                    <span className={`text-xs px-2 py-1 rounded-full bg-white ${column.textColor} border ${column.borderColor}`}>
                                        {column.totalCount}
                                        {searchTerm && groupedTasks[column.id]?.length !== column.totalCount && (
                                            <span className="text-gray-400 ml-1">
                                                ({groupedTasks[column.id]?.length || 0} shown)
                                            </span>
                                        )}
                                    </span>
                                </div>
                                {column.isLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                )}
                            </div>
                        </div>

                        {/* Task Cards with individual scroll */}
                        <div
                            className="space-y-3 max-h-[calc(100vh-380px)] min-h-[100px] overflow-y-auto pr-1 kanban-column-scroll"
                            onScroll={(e) => {
                                const { scrollTop, scrollHeight, clientHeight } = e.target;
                                if (scrollHeight - scrollTop <= clientHeight + 50 && column.hasMore && !column.isLoading) {
                                    loadMoreColumnTasks(column.id);
                                }
                            }}
                        >
                            {groupedTasks[column.id]?.map((task, index) => {
                                const overdue = isOverdue(task.dueDate, task.status);
                                const isLastTask = index === groupedTasks[column.id].length - 1;

                                return (
                                    <div
                                        key={task.taskId}
                                        data-column={column.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task)}
                                        className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-move ${overdue ? 'border-l-4 border-l-red-500' : ''}`}
                                    >
                                        {/* Task Header */}
                                        <div className="flex justify-between items-start mb-2">
                                            <h4
                                                className="font-medium text-sm text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
                                                onClick={() => onPreview(task.taskId)}
                                                title={task.subject || "No Title"}
                                            >
                                                {task.subject || "Untitled Task"}
                                            </h4>
                                            <div className="flex items-center gap-1">
                                                {/* Preview Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onPreview(task.taskId);
                                                    }}
                                                    className="text-gray-400 hover:text-green-600 p-1"
                                                    title="Preview"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                {/* Edit Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(task.taskId);
                                                    }}
                                                    className="text-gray-400 hover:text-blue-600 p-1"
                                                    title="Edit"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(task.taskId, task.subject || "Untitled Task");
                                                    }}
                                                    className="text-gray-400 hover:text-red-600 p-1"
                                                    title="Delete"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Priority Badge */}
                                        {task.priority && task.priority !== "medium" && (
                                            <div className="mb-2">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                                    {formatPriority(task.priority)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Related To */}
                                        {task.relatedTo && (
                                            <div className="mb-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {task.relatedTo}
                                                </span>
                                            </div>
                                        )}

                                        {/* Dates */}
                                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                                            <div>
                                                {task.startDate && (
                                                    <span>Start: {formatDate(task.startDate)}</span>
                                                )}
                                            </div>
                                            <div className={`font-medium ${overdue ? 'text-red-600' : ''}`}>
                                                {task.dueDate && (
                                                    <span>Due: {formatDate(task.dueDate)}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Assignees */}
                                        <div className="flex items-center justify-between">
                                            {task.assignees && task.assignees.length > 0 ? (
                                                <div className="flex -space-x-2">
                                                    {task.assignees.slice(0, 3).map((assignee, index) => (
                                                        <div
                                                            key={index}
                                                            className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                                                            title={assignee}
                                                        >
                                                            {assignee.charAt(0).toUpperCase()}
                                                        </div>
                                                    ))}
                                                    {task.assignees.length > 3 && (
                                                        <div
                                                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold border-2 border-white"
                                                            title={`${task.assignees.slice(3).join(", ")}`}
                                                        >
                                                            +{task.assignees.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Unassigned</span>
                                            )}
                                        </div>

                                        {/* Infinite scroll trigger - only on last task */}
                                        {isLastTask && column.hasMore && (
                                            <div className="text-center mt-3 pt-3 border-t border-gray-200">
                                                <button
                                                    onClick={() => loadMoreColumnTasks(column.id)}
                                                    disabled={column.isLoading}
                                                    className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                                                >
                                                    {column.isLoading ? 'Loading...' : 'Load more'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Empty Column State */}
                            {(!groupedTasks[column.id] || groupedTasks[column.id].length === 0) && !column.isLoading && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="text-sm text-gray-500">No tasks</p>
                                </div>
                            )}

                            {/* Loading indicator for column */}
                            {column.isLoading && groupedTasks[column.id] && groupedTasks[column.id].length > 0 && (
                                <div className="text-center py-4">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {kanbanTasks.length === 0 && !kanbanLoading && (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? "Try adjusting your search criteria" : "Get started by creating your first task"}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={fetchInitialKanbanTasks}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                            Refresh Tasks
                        </button>
                    )}
                </div>
            )}

            {/* Drag and Drop Instruction */}
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Drag and drop tasks between columns to update status
                </p>
            </div>

            {/* Add CSS for custom scrollbar */}
            <style jsx>{`
        .kanban-column-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .kanban-column-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .kanban-column-scroll::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .kanban-column-scroll::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
        </div>
    );
}

export default TasklistKanBan;