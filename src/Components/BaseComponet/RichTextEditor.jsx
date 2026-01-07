import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start typing...",
  height = "300px",
  readOnly = false,
  toolbarConfig = "email", // Default to email toolbar
  theme = "snow",
  className = "",
  label = "",
  error = "",
  required = false,
}) => {
  const [editorValue, setEditorValue] = useState(value);
  const quillRef = useRef(null);

  // Simplified toolbar configurations for email
  const toolbarOptions = {
    email: [
      ["bold", "italic", "underline"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
    minimal: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  // Module configurations
  const modules = {
    toolbar: toolbarOptions[toolbarConfig] || toolbarOptions.email,
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true,
    },
  };

  // Formats for the editor (simplified for email)
  const formats = [
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
    "color",
    "background",
    "align",
    "clean",
  ];

  // Handle editor change
  const handleChange = (content, delta, source, editor) => {
    setEditorValue(content);
    if (onChange) {
      onChange(content, editor.getText(), delta, source, editor);
    }
  };

  // Custom image handler for email (optional)
  const imageHandler = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target.result;
            const range = editor.getSelection();
            editor.insertEmbed(range.index, "image", imageUrl);
          };
          reader.readAsDataURL(file);
        }
      };
    }
  };

  // Add custom buttons to toolbar
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const toolbar = editor.getModule("toolbar");

      // Add custom image handler if needed
      toolbar.addHandler("image", imageHandler);
    }
  }, [toolbarConfig]);

  // Update editor value when prop changes
  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  // Get word count
  const getWordCount = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const text = editor.getText().trim();
      return text === "" ? 0 : text.split(/\s+/).length;
    }
    return 0;
  };

  // Get character count
  const getCharacterCount = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      return editor.getText().length - 1;
    }
    return 0;
  };

  // Clear editor
  const clearEditor = () => {
    setEditorValue("");
    if (onChange) {
      onChange("");
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white">
        {/* Simplified Top Toolbar */}
        <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={clearEditor}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors duration-200"
              title="Clear editor"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500 font-medium">
              Words: <span className="text-gray-700">{getWordCount()}</span> |
              Chars:{" "}
              <span className="text-gray-700">{getCharacterCount()}</span>
            </span>
          </div>
        </div>

        {/* Editor */}
        <div style={{ height }} className="relative">
          <ReactQuill
            ref={quillRef}
            theme={theme}
            value={editorValue}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            readOnly={readOnly}
            className="h-full border-0"
            style={{ fontFamily: "inherit" }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gray-50 border-t border-gray-300 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Custom CSS for Quill editor */}
      <style jsx>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background-color: #f9fafb !important;
          padding: 8px !important;
        }

        .ql-container.ql-snow {
          border: none !important;
          font-size: 14px !important;
        }

        .ql-editor {
          min-height: 150px !important;
          font-family: inherit !important;
          line-height: 1.5 !important;
        }

        .ql-editor.ql-blank::before {
          color: #9ca3af !important;
          font-style: normal !important;
          left: 16px !important;
        }

        .ql-snow .ql-stroke {
          stroke: #6b7280 !important;
        }

        .ql-snow .ql-fill {
          fill: #6b7280 !important;
        }

        .ql-snow .ql-picker {
          color: #6b7280 !important;
        }

        .ql-snow.ql-toolbar button:hover,
        .ql-snow .ql-toolbar button:hover,
        .ql-snow.ql-toolbar button:focus,
        .ql-snow .ql-toolbar button:focus,
        .ql-snow.ql-toolbar button.ql-active,
        .ql-snow .ql-toolbar button.ql-active,
        .ql-snow.ql-toolbar .ql-picker-label:hover,
        .ql-snow .ql-toolbar .ql-picker-label:hover,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active,
        .ql-snow.ql-toolbar .ql-picker-item:hover,
        .ql-snow .ql-toolbar .ql-picker-item:hover,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
          color: #3b82f6 !important;
        }

        .ql-snow.ql-toolbar button:hover .ql-stroke,
        .ql-snow .ql-toolbar button:hover .ql-stroke,
        .ql-snow.ql-toolbar button:focus .ql-stroke,
        .ql-snow .ql-toolbar button:focus .ql-stroke,
        .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .ql-snow .ql-toolbar button.ql-active .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
        .ql-snow.ql-toolbar button:hover .ql-fill,
        .ql-snow .ql-toolbar button:hover .ql-fill,
        .ql-snow.ql-toolbar button:focus .ql-fill,
        .ql-snow .ql-toolbar button:focus .ql-fill,
        .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .ql-snow .ql-toolbar button.ql-active .ql-fill,
        .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
        .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
        .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
        .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
        .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
        .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
        .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
        .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill {
          stroke: #3b82f6 !important;
          fill: #3b82f6 !important;
        }

        .ql-snow .ql-tooltip {
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          color: #374151 !important;
        }

        .ql-snow .ql-tooltip input[type="text"] {
          border: 1px solid #d1d5db !important;
          border-radius: 0.375rem !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
