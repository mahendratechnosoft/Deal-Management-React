import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RichTextEditor = React.forwardRef(
  (
    {
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
    },
    ref
  ) => {
    const [editorValue, setEditorValue] = useState(value);
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [sourceCode, setSourceCode] = useState(value);
    const quillRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(null);
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

     const handleEditorBlur = () => {
       if (quillRef.current) {
         const editor = quillRef.current.getEditor();
         const range = editor.getSelection();
         if (range) {
           setCursorPosition(range.index);
         }
       }
     };
     
    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      insertAtCursor: (text) => {
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();

          // Try to get current selection first
          let range = editor.getSelection();

          // If no current selection, use saved cursor position
          if (!range && cursorPosition !== null) {
            // Set selection to saved position
            editor.setSelection(cursorPosition, 0);
            range = { index: cursorPosition };
          }

          if (range) {
            editor.insertText(range.index, text);
            // Move cursor after inserted text
            const newPosition = range.index + text.length;
            editor.setSelection(newPosition, 0);
          } else {
            // Fallback: insert at end
            const length = editor.getLength();
            editor.insertText(length, text);
          }

          // Clear saved position after use
          setCursorPosition(null);
        }
      },

      // Method to save cursor position before opening modal
      saveCursorPosition: () => {
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection();
          if (range) {
            setCursorPosition(range.index);
            return range.index;
          }
        }
        return null;
      },
    }));

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

    // Open source code modal
    const openSourceModal = () => {
      setSourceCode(editorValue);
      setShowSourceModal(true);
    };

    // Apply source code changes
    const applySourceCode = () => {
      setEditorValue(sourceCode);
      if (onChange) {
        onChange(sourceCode);
      }
      setShowSourceModal(false);
    };

    // Close source code modal without applying changes
    const closeSourceModal = () => {
      setShowSourceModal(false);
      // Reset to current editor value
      setSourceCode(editorValue);
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
      setSourceCode(value);
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

              {/* Source Code Button */}
              <button
                type="button"
                onClick={openSourceModal}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors duration-200 flex items-center gap-1"
                title="Edit HTML Source Code"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                Source Code
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
              onBlur={handleEditorBlur} // Add this line
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

        {/* Source Code Modal */}
        {showSourceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Edit HTML Source Code
                </h3>
                <button
                  onClick={closeSourceModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Source Code Editor */}
              <div className="flex-1 overflow-hidden p-4">
                <div className="h-full flex flex-col">
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">
                      Edit the HTML code below. Changes will be reflected in the
                      editor.
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>HTML tags supported</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>CSS inline styles supported</span>
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={sourceCode}
                    onChange={(e) => setSourceCode(e.target.value)}
                    className="w-full h-full min-h-[400px] font-mono text-sm p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter HTML code here..."
                    spellCheck="false"
                    autoFocus
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end items-center gap-3 p-4 border-t bg-gray-50">
                <button
                  onClick={closeSourceModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applySourceCode}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}

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
  }
);

export default RichTextEditor;
