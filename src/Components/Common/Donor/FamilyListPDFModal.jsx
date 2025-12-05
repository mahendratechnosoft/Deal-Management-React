import React, { useState, useEffect } from 'react';
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";

function FamilyListPDFModal({ isOpen, onClose, familyId }) {
  const [loading, setLoading] = useState(false);
  const [familyData, setFamilyData] = useState(null);

  useEffect(() => {
    if (isOpen && familyId) {
      fetchFamilyData();
    }
  }, [isOpen, familyId]);

  const fetchFamilyData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`getFamilyById/${familyId}`);
      setFamilyData(res.data);
    } catch (err) {
      console.error("Failed to fetch family data", err);
      toast.error("Failed to load family details for PDF.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (download = false) => {
    if (!familyData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const tableWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // ==================== HEADER SECTION ====================


    // ==================== FORM TITLE ====================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    const subtitleText = "FORM TO BE FILLED BY COUPLE BEFORE DONOR IUI";
    const subtitleWidth = doc.getTextWidth(subtitleText);
    doc.text(subtitleText, (pageWidth - subtitleWidth) / 2, yPos);

    // Draw full-width border below the form title
    yPos += 3;
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 10;

    // Define table properties with proper column widths
    const col1Width = 75; // Specification column
    const col2Width = 55; // Husband column
    const col3Width = 55; // Wife column
    const rowHeight = 10;
    const headerHeight = 12;

    const col1X = margin;
    const col2X = col1X + col1Width;
    const col3X = col2X + col2Width;

    // Draw table header with borders
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);

    // Draw header borders
    doc.rect(margin, yPos, tableWidth, headerHeight);
    doc.line(col2X, yPos, col2X, yPos + headerHeight);
    doc.line(col3X, yPos, col3X, yPos + headerHeight);

    // Header text
    doc.setFont("Arial", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Specification", col1X + 5, yPos + headerHeight / 2 + 3);
    doc.text("Husband", col2X + col2Width / 2, yPos + headerHeight / 2 + 3, { align: "center" });
    doc.text("Wife", col3X + col3Width / 2, yPos + headerHeight / 2 + 3, { align: "center" });

    yPos += headerHeight;
    doc.setTextColor(0, 0, 0);

    // Table data with line break for genetic illness
    const tableData = [
      { label: "Height", husband: familyData.husbandHeight || "N/A", wife: familyData.wifeHeight || "N/A" },
      { label: "Weight", husband: familyData.husbandWeight || "N/A", wife: familyData.wifeWeight || "N/A" },
      { label: "Blood Group", husband: familyData.husbandBloodGroup || "N/A", wife: familyData.wifeBloodGroup || "N/A" },
      { label: "Skin Colour", husband: familyData.husbandSkinColor || "N/A", wife: familyData.wifeSkinColor || "N/A" },
      { label: "Eye Colour", husband: familyData.husbandEyeColor || "N/A", wife: familyData.wifeEyeColor || "N/A" },
      { label: "Religion", husband: familyData.husbandReligion || "N/A", wife: familyData.wifeReligion || "N/A" },
      { label: "Education", husband: familyData.husbandEducation || "N/A", wife: familyData.wifeEducation || "N/A" },
      { label: "Native District", husband: familyData.husbandDistrict || "N/A", wife: familyData.wifeDistrict || "N/A" },
      { label: "Country", husband: familyData.husbandCountry || "N/A", wife: familyData.wifeCountry || "N/A" },
      {
        label: "Family H/o Genetic\nIllness (Yes/No)",
        husband: familyData.husbandGenticIllness ? "Yes" : "No",
        wife: familyData.wifeGenticIllness ? "Yes" : "No"
      }
    ];

    // Draw table rows with borders
    doc.setFontSize(11);

    tableData.forEach((row, index) => {
      // Draw cell borders
      doc.rect(margin, yPos, tableWidth, rowHeight);
      doc.line(col2X, yPos, col2X, yPos + rowHeight);
      doc.line(col3X, yPos, col3X, yPos + rowHeight);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);

      // Draw cell content
      const textY = yPos + rowHeight / 2 + 3;

      // Specification column
      let label = row.label;
      doc.setFont("Arial", "bold");

      // For genetic illness row, we need to handle line break
      if (row.label.includes("\n")) {
        const lines = row.label.split("\n");
        doc.setFontSize(10);
        // First line
        doc.text(lines[0], col1X + 5, yPos + rowHeight / 3);
        // Second line
        doc.text(lines[1], col1X + 5, yPos + (2 * rowHeight) / 3);
        doc.setFontSize(11);
      } else {
        if (row.label.length > 25) {
          doc.setFontSize(10);
        }
        doc.text(label, col1X + 5, textY);
      }

      // Husband column
      doc.setFont("Arial", "normal");
      doc.setFontSize(11);
      doc.text(row.husband.toString(), col2X + col2Width / 2, textY, { align: "center" });

      // Wife column
      doc.text(row.wife.toString(), col3X + col3Width / 2, textY, { align: "center" });

      yPos += rowHeight;
    });

    yPos += 15;

    // Declaration text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const maxLineWidth = pageWidth - (2 * margin);

    // First paragraph
    const declarationText1 = "All above mentioned information is correct & true to our knowledge.";
    doc.text(declarationText1, margin, yPos);
    yPos += 10;

    // Second paragraph with line breaks
    const declarationText2 = "Aforementioned specifications help to screen the target D- sample. We understand that despite of the above specifications, phenotypic & genotypic differences might occur & which is inevitable. We both willfully agree & give consent to use donor semen sample for IUI.";

    const splitText = doc.splitTextToSize(declarationText2, maxLineWidth);
    splitText.forEach((line, index) => {
      doc.text(line, margin, yPos);
      yPos += (index === splitText.length - 1) ? 15 : 7;
    });

    yPos += 0;

    // ==================== DOCTOR'S SECTION ====================

    // Add UIN and couple names at the top of Doctor's section
    doc.setFont("Arial", "bold");
    doc.setFontSize(11);

    // UIN
    doc.text(`UIN: ${familyData.uin || "Not assigned"}`, margin, yPos);
    yPos += 8;

    // Husband name (on separate line)
    doc.text(`Husband: ${familyData.husbandName || "N/A"}`, margin, yPos);
    yPos += 8;

    // Wife name (on separate line)
    doc.text(`Wife: ${familyData.wifeName || "N/A"}`, margin, yPos);
    yPos += 15;

    // Doctor's details
    doc.setFont("Arial", "normal");

    // Doctor's Name
    const doctorText = "Doctor's Name :";
    doc.text(doctorText, margin, yPos);

 

    yPos += 10;

    // Signature
    const signatureText = "Signature :";
    doc.text(signatureText, margin, yPos);

  

    yPos += 10;

    // Dated
    const datedText = "Dated :";
    doc.text(datedText, margin, yPos);



    // Footer
    // const footerY = pageHeight - 15;
    // doc.setFontSize(10);
    // doc.setFont("Arial", "italic");
    // const generatedDate = new Date().toLocaleDateString();
    // doc.text(`Generated on: ${generatedDate}`, pageWidth - margin - doc.getTextWidth(`Generated on: ${generatedDate}`), footerY);

    if (download) {
      const fileName = `Donor_IUI_Consent_${familyData.uin || familyData.familyInfoId}.pdf`;
      doc.save(fileName);
      toast.success(`PDF "${fileName}" downloaded successfully!`);
    } else {
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfUrl, "_blank");
      if (!newWindow) {
        toast.error("Please allow pop-ups to view the PDF");
      }
    }
  };
  const handleDownload = () => {
    generatePDF(true);
  };

  const handleView = () => {
    generatePDF(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Modal header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Family Consent Form
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    UIN: {familyData?.uin || "Loading..."}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-3 text-gray-600">Loading family data...</p>
                </div>
              </div>
            ) : familyData ? (
              <div className="space-y-6">
                {/* Couple info */}
                {/* Couple info */}


                {/* PDF Preview */}
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="bg-white p-6 shadow-inner border border-gray-200">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-800 border-b border-gray-800 pb-1">
                          FORM TO BE FILLED BY COUPLE BEFORE DONOR IUI
                        </p>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="mb-6 overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-800">
                        <thead>
                          <tr className="bg-gray-100 text-gray-900">
                            <th className="border border-gray-800 px-4 py-3 text-left font-bold w-2/5">Specification</th>
                            <th className="border border-gray-800 px-4 py-3 text-center font-bold w-1/4">Husband</th>
                            <th className="border border-gray-800 px-4 py-3 text-center font-bold w-1/4">Wife</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: "Height", husband: familyData.husbandHeight || "N/A", wife: familyData.wifeHeight || "N/A" },
                            { label: "Weight", husband: familyData.husbandWeight || "N/A", wife: familyData.wifeWeight || "N/A" },
                            { label: "Blood Group", husband: familyData.husbandBloodGroup || "N/A", wife: familyData.wifeBloodGroup || "N/A" },
                            { label: "Skin Colour", husband: familyData.husbandSkinColor || "N/A", wife: familyData.wifeSkinColor || "N/A" },
                            { label: "Eye Colour", husband: familyData.husbandEyeColor || "N/A", wife: familyData.wifeEyeColor || "N/A" },
                            { label: "Religion", husband: familyData.husbandReligion || "N/A", wife: familyData.wifeReligion || "N/A" },
                            { label: "Education", husband: familyData.husbandEducation || "N/A", wife: familyData.wifeEducation || "N/A" },
                            { label: "Native District", husband: familyData.husbandDistrict || "N/A", wife: familyData.wifeDistrict || "N/A" },
                            { label: "Country", husband: familyData.husbandCountry || "N/A", wife: familyData.wifeCountry || "N/A" },
                            {
                              label: "Family H/o Genetic Illness (Yes/No)",
                              husband: familyData.husbandGenticIllness ? "Yes" : "No",
                              wife: familyData.wifeGenticIllness ? "Yes" : "No"
                            }
                          ].map((row, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                              <td className="border border-gray-800 px-4 py-3 font-medium">
                                <div className="whitespace-pre-line">{row.label}</div>
                              </td>
                              <td className="border border-gray-800 px-4 py-3 text-center">{row.husband}</td>
                              <td className="border border-gray-800 px-4 py-3 text-center">{row.wife}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Declaration */}
                    <div className="mb-8 space-y-3">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        All above mentioned information is correct & true to our knowledge.
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        Aforementioned specifications help to screen the target D- sample. We understand that despite of the above specifications, phenotypic & genotypic differences might occur & which is inevitable. We both willfully agree & give consent to use donor semen sample for IUI.
                      </p>
                    </div>

                    {/* Doctor's Section */}
                    <div className="pt-6 mt-8 border-t border-gray-300">
                
                      <div className="">
                        <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center">
                              <span className="font-bold text-gray-700 w-24">UIN:</span>
                              <span className="font-medium text-gray-900">{familyData.uin || "Not assigned"}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-bold text-gray-700 w-24">Husband:</span>
                              <span className="font-medium text-gray-900">
                                {familyData.husbandName || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-bold text-gray-700 w-24">Wife:</span>
                              <span className="font-medium text-gray-900">
                                {familyData.wifeName || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center">
                            <span className="font-bold w-40 text-gray-800">Doctor's Name :</span>
                          
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold w-40 text-gray-800">Signature :</span>
         
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold w-40 text-gray-800">Dated :</span>

                          </div>
                        </div>
                      </div>


                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium shadow-sm hover:shadow"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleView}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview PDF
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 mb-4">No family data available</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FamilyListPDFModal;