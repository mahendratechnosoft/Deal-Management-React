import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { hasPermission } from "../../BaseComponet/permissions";

// Helper function for file icons - same as CreateTaskModal
const getFileIconComponent = (fileName, contentType) => {
  const extension = fileName?.split(".").pop().toLowerCase();

  // Check by content type first
  if (contentType?.includes("image")) {
    return (
      <div className="text-blue-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  if (contentType?.includes("pdf")) {
    return (
      <div className="text-red-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  if (
    contentType?.includes("word") ||
    contentType?.includes("document") ||
    extension === "doc" ||
    extension === "docx"
  ) {
    return (
      <div className="text-blue-600">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  if (
    contentType?.includes("excel") ||
    contentType?.includes("spreadsheet") ||
    extension === "xls" ||
    extension === "xlsx"
  ) {
    return (
      <div className="text-green-600">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  if (
    contentType?.includes("zip") ||
    contentType?.includes("compressed") ||
    extension === "zip" ||
    extension === "rar" ||
    extension === "7z"
  ) {
    return (
      <div className="text-yellow-600">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  // Default file icon
  return (
    <div className="text-gray-600">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
};

const FileUploadComponent = ({
  label = "Upload File",
  onFileUpload,
  onFileRemove,
  existingFile = null,
  currentFile = null,
  maxFileSize = 5,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localAttachment, setLocalAttachment] = useState(null);
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const fileInputRef = useRef(null);

  // Initialize existing file from props
  useEffect(() => {
    if (existingFile && existingFile.fileName && existingFile.fileType) {
      setExistingAttachment({
        ...existingFile,
        isExisting: true,
        size: existingFile.fileSize || 0,
      });
    } else {
      setExistingAttachment(null);
    }
  }, [existingFile]);

  // Initialize current file from props (for create mode)
  useEffect(() => {
    if (currentFile && currentFile.fileName && currentFile.fileType) {
      setLocalAttachment({
        ...currentFile,
        isExisting: false,
        size: currentFile.fileSize || 0,
      });
    } else {
      setLocalAttachment(null);
    }
  }, [currentFile]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Create blob URL from base64 for preview
  const createBlobUrlFromBase64 = (base64, fileType) => {
    try {
      const base64Data = base64.replace(/\s/g, "");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error creating blob URL from base64:", error);
      return null;
    }
  };

  // Handle file preview - enhanced for both new and existing files
  const handlePreviewAttachment = (fileToPreview) => {
    if (!fileToPreview) return;

    try {
      const fileType = fileToPreview.fileType;
      const fileName = fileToPreview.fileName;

      // Create blob URL based on what data is available
      let blobUrl = null;

      if (fileToPreview.base64) {
        // If we have base64 data, use it (works for both create and edit)
        blobUrl = createBlobUrlFromBase64(fileToPreview.base64, fileType);
      } else if (fileToPreview.file) {
        // If we have a File object (immediate upload)
        blobUrl = URL.createObjectURL(fileToPreview.file);
      }

      if (!blobUrl) {
        toast.error("Unable to preview file");
        return;
      }

      // Check if it's an image file
      if (fileType.includes("image")) {
        const newWindow = window.open(blobUrl, "_blank");
        if (newWindow) {
          newWindow.focus();
          setTimeout(() => {
            try {
              URL.revokeObjectURL(blobUrl);
            } catch (e) {
              // Ignore errors
            }
          }, 5000);
        } else {
          // Fallback: create modal for preview
          toast.error("Popup blocked. Please allow popups to preview images.");
          const img = document.createElement("img");
          img.src = blobUrl;
          img.style.maxWidth = "90vw";
          img.style.maxHeight = "90vh";

          const modal = document.createElement("div");
          modal.style.position = "fixed";
          modal.style.top = "0";
          modal.style.left = "0";
          modal.style.width = "100%";
          modal.style.height = "100%";
          modal.style.backgroundColor = "rgba(0,0,0,0.8)";
          modal.style.display = "flex";
          modal.style.alignItems = "center";
          modal.style.justifyContent = "center";
          modal.style.zIndex = "9999";
          modal.style.cursor = "pointer";

          modal.appendChild(img);
          modal.onclick = () => {
            document.body.removeChild(modal);
            try {
              URL.revokeObjectURL(blobUrl);
            } catch (e) {
              // Ignore errors
            }
          };
          document.body.appendChild(modal);
        }
      } else if (fileType.includes("pdf")) {
        window.open(blobUrl, "_blank");
        setTimeout(() => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (e) {
            // Ignore errors
          }
        }, 5000);
      } else {
        // For other file types, download instead
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (e) {
            // Ignore cleanup errors
          }
        }, 100);

        toast.success(`Downloading ${fileName}`);
      }
    } catch (error) {
      console.error("Error previewing attachment:", error);
      toast.error("Failed to preview file");
    }
  };

  // Handle file download
  const handleDownloadAttachment = (fileToDownload) => {
    if (!fileToDownload) return;

    try {
      const fileType = fileToDownload.fileType;
      const fileName = fileToDownload.fileName;

      // Create blob URL based on what data is available
      let blobUrl = null;

      if (fileToDownload.base64) {
        // If we have base64 data, use it
        blobUrl = createBlobUrlFromBase64(fileToDownload.base64, fileType);
      } else if (fileToDownload.file) {
        // If we have a File object
        blobUrl = URL.createObjectURL(fileToDownload.file);
      }

      if (!blobUrl) {
        toast.error("Unable to download file");
        return;
      }

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 100);

      toast.success(`Downloading ${fileName}`);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("Failed to download file");
    }
  };

  // Handle file removal
  const handleRemoveAttachment = async (fileToRemove) => {
    if (!fileToRemove) return;

    try {
      // Clean up any blob URLs
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      // Remove from appropriate state
      if (fileToRemove.isExisting) {
        setExistingAttachment(null);
      } else {
        setLocalAttachment(null);
      }

      setAttachmentError("");

      // Call parent callback for removal
      if (onFileRemove) {
        await onFileRemove();
      }

      toast.success("File removed");
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast.error("Failed to remove file");
    }
  };

  // Validate file type
  const isValidFileType = (file) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/zip",
      "application/x-rar-compressed",
    ];

    return allowedTypes.includes(file.type);
  };

  // Handle file upload
  const handleAttachmentChange = async (file) => {
    if (!file) return;

    // Validate file size
    const maxSize = maxFileSize * 1024 * 1024;
    if (file.size > maxSize) {
      setAttachmentError(`File exceeds ${maxFileSize}MB limit`);
      toast.error(`"${file.name}" exceeds ${maxFileSize}MB limit`);
      return;
    }

    // Validate file type
    if (!isValidFileType(file)) {
      setAttachmentError("Invalid file type");
      toast.error(`"${file.name}" has invalid file type`);
      return;
    }

    // Convert to base64 and update local state
    try {
      const base64Data = await convertFileToBase64(file);

      // Create local attachment object
      const newAttachment = {
        file: file,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        base64: base64Data,
        id: Date.now() + Math.random(),
        isExisting: false,
        preview: file.type.includes("image") ? URL.createObjectURL(file) : null,
      };

      setLocalAttachment(newAttachment);
      setAttachmentError("");

      // Call parent callback with file data
      if (onFileUpload) {
        await onFileUpload({
          base64: base64Data,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          id: newAttachment.id,
        });
      }

      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error converting file to base64:", error);
      toast.error("Failed to process file. Please try again.");
      setLocalAttachment(null);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle file input change
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleAttachmentChange(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleAttachmentChange(file);
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (localAttachment?.preview) {
        URL.revokeObjectURL(localAttachment.preview);
      }
      // Note: We don't revoke blob URLs for existingAttachment
      // because they're created on-demand in preview/download functions
    };
  }, [localAttachment]);

  // Render file row component
  const renderFileRow = (fileData, isExisting = false) => (
    <div className="flex items-center justify-between p-2 bg-gray-50 hover:bg-blue-50 rounded border border-gray-200 transition-colors group">
      <div
        className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
        onClick={() => handlePreviewAttachment(fileData)}
        title={`Click to preview ${fileData.fileName}`}
      >
        <div className="flex-shrink-0 w-8 h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
          {getFileIconComponent(fileData.fileName, fileData.fileType)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 text-xs truncate hover:text-blue-600">
            {fileData.fileName}
          </div>
          {/* <div className="text-xs text-gray-500">
            {formatFileSize(fileData.size)} {isExisting && "(Existing)"}
          </div> */}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePreviewAttachment(fileData);
          }}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="Preview"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadAttachment(fileData);
          }}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="Download"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>

           {hasPermission("expense", "Edit") && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveAttachment(fileData);
          }}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Remove"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
           )}
      </div>
    </div>
  );

  // Determine which file to show
  const fileToShow = localAttachment || existingAttachment;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* File Input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
      />

      {/* Show file if present */}
      {fileToShow && (
        <div className="space-y-3">
          {renderFileRow(fileToShow, !!existingAttachment)}
        </div>
      )}

      {/* Show upload area if no file is attached */}
      {!fileToShow && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>

          <div
            onClick={handleButtonClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <div className="mx-auto w-8 h-8 mb-2 text-gray-400">
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                <span className="text-blue-600">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: {maxFileSize}MB
              </p>
              <p className="text-xs text-gray-500">
                PDF, Images, Documents, Text files, Archives
              </p>
            </div>
          </div>

          {attachmentError && (
            <p className="mt-2 text-xs text-red-600">{attachmentError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
