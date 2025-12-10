import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axiosInstance from '../../BaseComponet/axiosInstance';
import { useLayout } from '../../Layout/useLayout';
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirmation,
  showAutoCloseSuccess,
  showInfoAlert,
  showWarningAlert,
  showConfirmDialog
} from '../../BaseComponet/alertUtils'; // Adjust path as needed

const TaskComments = ({ taskId, currentUser }) => {
    const { LayoutComponent, role } = useLayout();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [postingComment, setPostingComment] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [commentAttachments, setCommentAttachments] = useState([]);
    const [uploadingAttachments, setUploadingAttachments] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const commentsEndRef = useRef(null);
    const observerRef = useRef(null);
    const quillRef = useRef(null);
    const fileInputRef = useRef(null);

    // Fixed Quill editor modules configuration
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ color: [] }, { background: [] }],
            ['link'],
            ['clean']
        ],
    };

    const formats = [
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background',
        'link'
    ];

    // Fetch comments on initial load
    useEffect(() => {
        if (taskId) {
            fetchComments(0);
        }
    }, [taskId]);

    // Setup intersection observer for infinite scroll
    useEffect(() => {
        if (hasMore && !loading && comments.length > 0) {
            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        loadMoreComments();
                    }
                },
                { threshold: 0.1 }
            );

            if (observerRef.current) {
                observer.observe(observerRef.current);
            }

            return () => {
                if (observerRef.current) {
                    observer.unobserve(observerRef.current);
                }
            };
        }
    }, [hasMore, loading, comments.length]);

    const fetchComments = async (pageNum) => {
        if (!taskId) return;

        try {
            setLoading(true);
            const response = await axiosInstance.get(
                `getAllCommentsByTaskId/${taskId}?page=${pageNum}&size=10`
            );

            if (response.data && Array.isArray(response.data.content)) {
                if (pageNum === 0) {
                    setComments(response.data.content);
                } else {
                    setComments(prev => [...prev, ...response.data.content]);
                }

                setHasMore(!response.data.last);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            showErrorAlert('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const loadMoreComments = () => {
        if (!loading && hasMore) {
            fetchComments(page + 1);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();

        // Check if comment is empty or contains only whitespace/formatting tags
        const cleanContent = commentContent.trim();
        const isEmpty = commentContent.replace(/<(.|\n)*?>/g, '').trim().length === 0;

        if (isEmpty && commentAttachments.length === 0) {
            showErrorAlert('Please enter a comment or add attachments');
            return;
        }

        if (!taskId) {
            showErrorAlert('Task ID is missing');
            return;
        }

        setPostingComment(true);

        try {
            const commentData = {
                taskId: taskId,
                content: commentContent,
                attachments: await prepareAttachments(commentAttachments)
            };

            // If no content but has attachments, add a placeholder message
            if (isEmpty && commentAttachments.length > 0) {
                commentData.content = '<p>Attached files</p>';
            }

            const response = await axiosInstance.post('addCommentOnTask', commentData);

            if (response.status === 200 || response.status === 201) {
                // Add new comment to the top of the list
                const newComment = {
                    ...response.data,
                    user: currentUser?.name || 'You',
                    createdBy: currentUser?.employeeId,
                    commentedAt: new Date().toISOString(),
                    attachments: commentData.attachments
                };

                setComments(prev => [newComment, ...prev]);
                setCommentContent('');
                setCommentAttachments([]);
                showAutoCloseSuccess('Comment added successfully');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            showErrorAlert('Failed to post comment');
        } finally {
            setPostingComment(false);
        }
    };

    const prepareAttachments = async (attachments) => {
        if (attachments.length === 0) return [];

        const preparedAttachments = [];

        for (const file of attachments) {
            try {
                const base64String = await convertFileToBase64(file);
                preparedAttachments.push({
                    fileName: file.name,
                    contentType: file.type,
                    data: base64String
                });
            } catch (error) {
                console.error('Error converting file to base64:', error);
            }
        }

        return preparedAttachments;
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileAttachment = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingAttachments(true);

        // Limit total attachments to 5
        const totalAttachments = commentAttachments.length + files.length;
        if (totalAttachments > 5) {
            showErrorAlert('Maximum 5 attachments allowed');
            setUploadingAttachments(false);
            return;
        }

        // Validate file size (max 5MB per file)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                showErrorAlert(`${file.name} exceeds 5MB limit`);
                return false;
            }
            return true;
        });

        setCommentAttachments(prev => [...prev, ...validFiles]);
        setUploadingAttachments(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        showAutoCloseSuccess(`${validFiles.length} file(s) added`);
    };

    const handleRemoveAttachment = (index) => {
        setCommentAttachments(prev => prev.filter((_, i) => i !== index));
    };

 const handleDeleteComment = async (commentId, comment) => {
    if (!commentId) return;

    const isAdmin = role === 'ROLE_ADMIN';
    const isDeleted = comment?.deleted === true;

    // Use appropriate confirmation dialog based on user role and comment status
    let result;
    if (isAdmin) {
        // Admin can permanently delete any comment (even already soft deleted ones)
        const commentText = comment?.content 
            ? `comment: "${comment.content.replace(/<[^>]*>/g, '').substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`
            : 'this comment';
        result = await showDeleteConfirmation(commentText);
    } else {
        // Employee can only delete non-deleted comments
        if (isDeleted) {
            showErrorAlert('This comment is already deleted');
            return;
        }
        result = await showConfirmDialog('Are you sure you want to delete this comment?', 'Delete Comment');
    }

    if (!result.isConfirmed) {
        return;
    }

    setDeletingCommentId(commentId);

    try {
        // Use the same API endpoint for both admin and employee
        // The backend should handle the logic based on user role
        const response = await axiosInstance.delete(`deleteTaskComment/${commentId}`);

        if (response.status === 200) {
            if (isAdmin) {
                // Admin: Hard delete (permanent) - remove from local state
                setComments(prev => prev.filter(c => c.commentId !== commentId));
                showAutoCloseSuccess('Comment permanently deleted');
            } else {
                // Employee: Soft delete - update local state to mark as deleted
                setComments(prev => prev.map(c =>
                    c.commentId === commentId
                        ? { ...c, deleted: true }
                        : c
                ));
                showAutoCloseSuccess('Comment deleted');
            }
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        showErrorAlert('Failed to delete comment');
    } finally {
        setDeletingCommentId(null);
    }
};
    // Function to open attachment preview
    const openAttachmentPreview = (attachment) => {
        if (!attachment.data) {
            showErrorAlert('Attachment data is not available');
            return;
        }

        try {
            // Decode base64 data
            const byteCharacters = atob(attachment.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: attachment.contentType });

            // Create object URL
            const url = window.URL.createObjectURL(blob);

            // Check if file is an image, PDF, or text that can be previewed
            const canPreview =
                attachment.contentType.startsWith('image/') ||
                attachment.contentType === 'application/pdf' ||
                attachment.contentType.startsWith('text/');

            if (canPreview) {
                // Open in new tab for preview
                const previewWindow = window.open(url, '_blank');

                if (previewWindow) {
                    // For PDFs, we need to use embed
                    if (attachment.contentType === 'application/pdf') {
                        previewWindow.document.write(`
              <html>
                <head>
                  <title>${attachment.fileName}</title>
                  <style>
                    body { margin: 0; padding: 0; }
                    embed { width: 100%; height: 100vh; }
                  </style>
                </head>
                <body>
                  <embed src="${url}" type="application/pdf" />
                </body>
              </html>
            `);
                        previewWindow.document.close();
                    }

                    // Release URL after window loads
                    previewWindow.onload = () => {
                        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                    };
                } else {
                    // If popup blocked, fallback to download with warning
                    showWarningAlert('Popup blocked. The file will be downloaded instead. To preview files, please allow popups for this site.', 'Popup Blocked');
                    downloadFile(attachment);
                }
            } else {
                // For non-previewable files, download
                downloadFile(attachment, url);
            }
        } catch (error) {
            console.error('Error opening attachment:', error);
            showErrorAlert('Failed to open attachment');
        }
    };

    // Helper function to download file
    const downloadFile = (attachment, url = null) => {
        try {
            if (!url && attachment.data) {
                const byteCharacters = atob(attachment.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: attachment.contentType });
                url = window.URL.createObjectURL(blob);
            }

            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showAutoCloseSuccess(`Downloading ${attachment.fileName}`);
        } catch (error) {
            console.error('Error downloading file:', error);
            showErrorAlert('Failed to download file');
        }
    };

    // Fixed date formatting using "commentedAt"
    const formatDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        } catch (e) {
            console.error('Error parsing date:', dateString, e);
            return '';
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const renderCommentContent = (content) => {
        if (!content || content === 'Attached files') return null;

        return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
    };

    // Check if delete button should be shown
    const shouldShowDeleteButton = (comment) => {
        const isAdmin = role === 'ROLE_ADMIN';
        const isDeleted = comment?.deleted === true;
        
        // Admin always sees delete button (for permanent deletion)
        if (isAdmin) {
            return true;
        }
        
        // Employee sees delete button only for non-deleted comments
        if (!isDeleted) {
            return true;
        }
        
        return false;
    };

    // Get delete button title based on user role and comment status
    const getDeleteButtonTitle = (comment) => {
        const isAdmin = role === 'ROLE_ADMIN';
        const isDeleted = comment?.deleted === true;
        
        if (isAdmin) {
            if (isDeleted) {
                return 'Permanently delete this comment';
            }
            return 'Permanently delete comment';
        }
        
        return 'Delete comment';
    };

    // Get file icon based on file type
    const getFileIcon = (contentType) => {
        if (contentType.includes('image/')) {
            return (
                <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        } else if (contentType.includes('pdf')) {
            return (
                <svg className="w-3 h-3 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        } else if (contentType.includes('word') || contentType.includes('document')) {
            return (
                <svg className="w-3 h-3 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
            return (
                <svg className="w-3 h-3 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        } else {
            return (
                <svg className="w-3 h-3 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        }
    };

    return (
        <div className="bg-white rounded border border-gray-200 p-3">
            <h3 className="font-semibold text-gray-900 mb-3">Comments</h3>

            {/* Add Comment Form */}
            <div className="mb-4">
                <div className="mb-2 bg-white border border-gray-300 rounded-md overflow-hidden relative">
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={commentContent}
                        onChange={setCommentContent}
                        modules={modules}
                        formats={formats}
                        placeholder="Write a comment..."
                        className="
                            [&_.ql-toolbar]:sticky 
                            [&_.ql-toolbar]:top-0 
                            [&_.ql-toolbar]:z-10 
                            [&_.ql-toolbar]:bg-gray-50
                            [&_.ql-container]:border-0 
                            [&_.ql-editor]:min-h-[120px] 
                            [&_.ql-editor]:max-h-[220px]
                            [&_.ql-editor]:overflow-y-auto
                        "
                    />
                </div>

                {/* File Attachments */}
                {commentAttachments.length > 0 && (
                    <div className="mb-3 p-2 bg-gray-50 rounded border">
                        <div className="flex flex-wrap gap-2">
                            {commentAttachments.map((file, index) => (
                                <div key={index} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 hover:border-blue-300">
                                    {getFileIcon(file.type)}
                                    <span className="text-xs text-gray-600 truncate max-w-[120px]">
                                        {file.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAttachment(index)}
                                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                        <input
                            ref={fileInputRef}
                            type="file"
                            id="commentFileUpload"
                            multiple
                            onChange={handleFileAttachment}
                            className="hidden"
                            disabled={uploadingAttachments || postingComment}
                        />
                        <label
                            htmlFor="commentFileUpload"
                            className={`inline-flex items-center gap-1 text-xs px-3 py-2 rounded border cursor-pointer transition-colors ${uploadingAttachments || postingComment ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border-gray-300'}`}
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            {uploadingAttachments ? 'Uploading...' : 'Attach files'}
                        </label>
                    </div>

                    <button
                        onClick={handleAddComment}
                        disabled={postingComment || (!commentContent.replace(/<[^>]*>/g, '').trim() && commentAttachments.length === 0)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${postingComment || (!commentContent.replace(/<[^>]*>/g, '').trim() && commentAttachments.length === 0) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {postingComment ? (
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Posting...
                            </span>
                        ) : 'Post Comment'}
                    </button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {comments.length > 0 ? (
                    <>
                        {comments.map((comment, index) => (
                            <div
                                key={comment.commentId || index}
                                className="border-b border-gray-100 pb-3 last:border-0 group relative"
                            >
                                <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${comment.deleted ? 'bg-gray-300' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                                            }`}>
                                            {getInitials(comment.commentedBy || comment.user || comment.createdBy)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium text-sm text-gray-900">
                                                    {comment.commentedBy || comment.user || comment.createdBy || 'Anonymous'}
                                                </span>
                                                {comment.isEdited && (
                                                    <span className="text-xs text-gray-500">(edited)</span>
                                                )}
                                                {comment.deleted && (
                                                    <span className="text-xs text-gray-400">•</span>
                                                )}
                                            </div>
                                            {comment.deleted && (
                                                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold">
                                                    Deleted
                                                </span>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {formatDate(comment.commentedAt || comment.createdAt || comment.timestamp)}
                                                </span>

                                                {/* Delete button - Fixed: Show for admin always, for employee only if not deleted */}
                                                {shouldShowDeleteButton(comment) && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.commentId, comment)}
                                                        disabled={deletingCommentId === comment.commentId}
                                                        className="flex-shrink-0 text-gray-400 hover:text-red-500"
                                                        title={getDeleteButtonTitle(comment)}
                                                    >
                                                        {deletingCommentId === comment.commentId ? (
                                                            <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                                        ) : (
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {comment.content && comment.content !== 'Attached files' && (
                                            <div className="mb-2 text-gray-700 text-sm">
                                                {renderCommentContent(comment.content)}
                                            </div>
                                        )}

                                        {/* Comment Attachments - Show for all users if comment has attachments */}
                                        {comment.attachments && comment.attachments.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {comment.attachments.map((attachment, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => openAttachmentPreview(attachment)}
                                                        className="flex items-center gap-2 p-1.5 bg-gray-50 rounded border text-xs hover:bg-gray-100 transition-colors cursor-pointer"
                                                    >
                                                        {getFileIcon(attachment.contentType)}
                                                        <span className="text-gray-700 truncate flex-1">
                                                            {attachment.fileName}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {attachment.data ? Math.round((attachment.data.length * 3) / 4 / 1024) + ' KB' : 'File'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Infinite scroll loader */}
                        <div ref={observerRef} className="py-2">
                            {loading && (
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                            {!hasMore && comments.length > 0 && (
                                <div className="text-center text-gray-400 text-xs py-2">
                                    No more comments
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-400 italic text-sm py-8">
                        {loading ? 'Loading comments...' : 'No comments yet. Be the first to comment!'}
                    </div>
                )}

                <div ref={commentsEndRef} />
            </div>
        </div>
    );
};

export default TaskComments;