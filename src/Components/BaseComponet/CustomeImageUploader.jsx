// src/components/common/ImageUploader.js
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

// A helper function to validate file type
const isImageFile = (file) => file && file.type.startsWith("image/");

function CustomeImageUploader({
  title,
  onFileChange,
  className = "",
  initialBase64 = null,
  maxSize = 5 * 1024 * 1024,
  acceptedFileTypes = ["image/jpeg", "image/png", "image/jpg"],
}) {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    if (initialBase64) {
      setPreview(`data:;base64,${initialBase64}`);
    } else {
      setPreview(null);
    }
  }, [initialBase64]);

  // --- File Processing ---
  const processFile = (file) => {
    if (!isImageFile(file)) {
      toast.error("Invalid file type. Please upload an image.");
      return;
    }

    if (!acceptedFileTypes.includes(file.type)) {
      const allowedExtensions = acceptedFileTypes
        .map((type) => type.split("/")[1].toUpperCase())
        .join(", ");

      toast.error(`Invalid file type. Only ${allowedExtensions} are allowed.`);
      return;
    }

    if (maxSize && file.size > maxSize) {
      const sizeInMb = Math.floor(maxSize / (1024 * 1024));
      toast.error(`File is too large. Maximum size is ${sizeInMb}MB.`);
      return;
    }

    // Set preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Lift state up to parent
    onFileChange(file);
  };

  // --- Event Handlers ---
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow drop
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePaste = (e) => {
    const file = e.clipboardData.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    onFileChange(null);
    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --- Effect for Paste ---
  // We attach the paste listener to the drop zone
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener("paste", handlePaste);
    }
    // Cleanup
    return () => {
      if (dropZone) {
        dropZone.removeEventListener("paste", handlePaste);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // --- Dynamic Styles ---
  const dropZoneClasses = `
    border-2 border-dashed rounded-lg text-center
    cursor-pointer transition-all duration-200
    ${
      isDragging
        ? "border-blue-500 bg-blue-50"
        : "border-gray-300 hover:border-gray-400"
    }
    ${className}
  `;

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Drop Zone & Preview Area */}
      <div
        ref={dropZoneRef}
        className={dropZoneClasses}
        onClick={() => fileInputRef.current?.click()} // Trigger file input on click
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0} // Make it focusable for paste
      >
        {preview ? (
          // --- Preview State ---
          <div className="relative group">
            <img
              src={preview}
              alt={`${title} Preview`}
              className="w-full h-40 object-contain rounded-md"
            />
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent click from triggering file input
                clearPreview();
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full 
                         opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          // --- Empty State ---
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-8 h-8 mb-3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                strokeWidth={2}
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>

            <p className="font-semibold">
              Drag & drop or{" "}
              <span className="text-blue-600">click to upload</span>
            </p>
            <p className="text-sm">You can also paste an image</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomeImageUploader;
