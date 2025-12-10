// TaskAttachments.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirmation,
  showAutoCloseSuccess,
  showInfoAlert,
  showWarningAlert
} from '../../BaseComponet/alertUtils'; // Adjust the path as needed

function TaskAttachments({ taskId, attachments: initialAttachments = [], onAttachmentsUpdate }) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingAttachment, setDeletingAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchAttachments();
    }
  }, [taskId]);

  const fetchAttachments = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`getTaskAttachmentByTaskId/${taskId}`);
      
      if (response.data && Array.isArray(response.data)) {
        setAttachments(response.data);
        if (onAttachmentsUpdate) {
          onAttachmentsUpdate(response.data);
        }
      } else {
        setAttachments([]);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
      showErrorAlert('Failed to load attachments');
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !taskId) return;

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
        showAutoCloseSuccess(`${files.length} file(s) uploaded successfully`);
        // Refresh attachments list
        fetchAttachments();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showErrorAlert('Failed to upload file(s)');
    } finally {
      setUploadingFile(false);
      // Clear file input
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId, fileName) => {
    try {
      const result = await showDeleteConfirmation(fileName);
      
      if (result.isConfirmed) {
        setDeletingAttachment(attachmentId);
        
        const response = await axiosInstance.delete(`deleteTaskAttachement/${attachmentId}`);

        if (response.status === 200) {
          showAutoCloseSuccess('Attachment deleted successfully');
          // Remove from local state
          const updatedAttachments = attachments.filter(att => att.taskAttachmentId !== attachmentId);
          setAttachments(updatedAttachments);
          if (onAttachmentsUpdate) {
            onAttachmentsUpdate(updatedAttachments);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      showErrorAlert('Failed to delete attachment');
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

      showAutoCloseSuccess(`Downloading ${attachment.fileName}`);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      showErrorAlert('Failed to download file');
    }
  };

  const handlePreviewAttachment = (attachment) => {
    try {
      // Create a blob from base64 data
      const byteCharacters = atob(attachment.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachment.contentType });

      // Create object URL
      const url = window.URL.createObjectURL(blob);

      // Open in new tab
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        newWindow.focus();
        
        // Clean up the URL after the window is loaded (or after a delay)
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        // If popup blocked, fall back to download with a warning
        showWarningAlert(
          'Popup blocked. The file will be downloaded instead. To preview files, please allow popups for this site.',
          'Popup Blocked'
        );
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      }
    } catch (error) {
      console.error('Error previewing attachment:', error);
      showErrorAlert('Failed to preview file');
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
    const sizeInBytes = (base64String.length * 3) / 4;

    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isPreviewable = (contentType) => {
    // Files that can be previewed in browser
    const previewableTypes = [
      'image/',
      'application/pdf',
      'text/',
      'application/json',
      'application/xml'
    ];
    
    return previewableTypes.some(type => contentType.includes(type));
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <p className="text-xs text-gray-500 mt-1">Loading attachments...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm">Attachments</h4>
        <div>
          <input
            type="file"
            id="fileUpload"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploadingFile || !taskId}
          />
          <label
            htmlFor="fileUpload"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              uploadingFile || !taskId
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            }`}
          >
            {uploadingFile ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Files
              </>
            )}
          </label>
        </div>
      </div>

      {attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.taskAttachmentId || attachment.id}
              className="flex items-center justify-between p-2 bg-gray-50 hover:bg-blue-50 rounded border border-gray-200 transition-colors group"
            >
              <div 
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                onClick={() => handlePreviewAttachment(attachment)}
                title={`Click to preview ${attachment.fileName}`}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                  {getFileIconComponent(attachment.fileName, attachment.contentType)}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="font-medium text-gray-900 text-xs truncate hover:text-blue-600"
                  >
                    {attachment.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(attachment.data)}
                
                    {attachment.uploadedBy && ` • ${attachment.uploadedBy}`}
                    {attachment.uploadedAt && (
                      <span className="ml-1">
                        • {new Date(attachment.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewAttachment(attachment);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Preview in new tab"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadAttachment(attachment);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Download"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAttachment(
                      attachment.taskAttachmentId || attachment.id,
                      attachment.fileName
                    );
                  }}
                  disabled={deletingAttachment === (attachment.taskAttachmentId || attachment.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  {deletingAttachment === (attachment.taskAttachmentId || attachment.id) ? (
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded">
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm text-gray-500">No attachments yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload files by clicking "Add Files" button</p>
        </div>
      )}
    </div>
  );
}

export default TaskAttachments;