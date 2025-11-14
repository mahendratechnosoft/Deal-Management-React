import { useState } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import { useNavigate } from "react-router-dom";

function ImportLeadModal({ open, onClose }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);   // <-- Loader state
  const { LayoutComponent, role } = useLayout();

  if (!open) return null; // hide modal

  const downloadTemplate = async () => {
    try {
      const response = await axiosInstance.get("leadTemplateExcel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "LeadTemplate.xlsx";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  const importExcel = async () => {
    if (!file) {
      setMessage("⚠️ Please select an Excel file");
      return;
    }

    setLoading(true); // show loader

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axiosInstance.post("importLeads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Leads Imported Successfully!");
      setFile(null);

      setTimeout(() => {
        setMessage("");
        onClose();
        window.location.reload();
      }, 1200);
    } catch (error) {
      console.error(error);
      setMessage("❌ Error importing Excel file");
    } finally {
      setLoading(false); // hide loader
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 w-full max-w-lg rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Import Leads from Excel</h2>

        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg mb-4"
        >
          Download Excel Template
        </button>

        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full border px-3 py-2 rounded-lg"
        />

        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: <b>{file.name}</b>
          </p>
        )}

        {message && (
          <p className="mt-2 font-medium text-center">{message}</p>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={importExcel}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white 
              ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Importing...
              </div>
            ) : (
              "Import"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportLeadModal;
