import React from 'react';
import { jsPDF } from "jspdf";
import { toast } from "react-hot-toast";

function HandoverDocsPDF() {
  // Mock data for the report
  const donorData = {
    // Header Information
    pageNumber: "03/2022",
    reportDate: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY format
    
    // Donor Information
    sampleId: "PSB-D-2234",
    donorCode: "D-2234",
    height: "5'10\" (178 cm)",
    hairColor: "Black",
    bloodGroup: "O+",
    skinTone: "Wheatish",
    eyeColor: "Brown",
    education: "B.E. Computer Science",
    profession: "Software Engineer",
    religion: "Hindu",
    age: "28 Years",
    nativePlace: "Pune, Maharashtra",
    
    // Medical Test Results
    hiv: "NON-REACTIVE",
    hbsag: "NON-REACTIVE",
    vdrl: "NON-REACTIVE",
    hcv: "NON-REACTIVE",
    cmv: "NEGATIVE",
    hbElectrophoresis: "NORMAL",
    creatinine: "0.8 mg/dL",
    
    // Family History
    familyHistory: "NO SIGNIFICANT HISTORY",
    kids: "None",
    anyIllness: "None",
    
    // Sibling Information
    brother: {
      age: "30",
      profession: "Doctor",
      kids: "1",
      illness: "None"
    },
    sister: {
      age: "25",
      profession: "Teacher",
      kids: "0",
      illness: "None"
    },
    
    // Semen Analysis
    semenAnalysis: {
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      media: "SpermFreeze™",
      volume: "3.5 mL",
      
      // Test Parameters
      parameters: [
        { test: "Sperm Concentration", result: "85", unit: "Million/ML" },
        { test: "Progressive Motility %", result: "65", unit: "%" },
        { test: "Rapid Progressive (A)", result: "45", unit: "%" },
        { test: "Slow Progressive (B)", result: "20", unit: "%" },
        { test: "Non-Progressive (C)", result: "15", unit: "%" },
        { test: "Normal Morphology", result: "12", unit: "%" },
        { test: "Any Abnormality", result: "NIL", unit: "" }
      ]
    },
    
    // Additional Notes
    notes: "Semen Donor is Tested for HIV 1&2, HCV, HBsAg, VDRL & Thalassemia.",
    
    // Hospital Information
    hospitalName: "ASHWIN HOSPITAL, ART BANK",
    address: "Amega, S.No. 1/8, Plot No.4, Dawa Chowk, Bakewadi, Pune 411043",
    phone: "9975035364",
    website: "www.punespermbank.com"
  };

  const generateDonorReportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // ==================== HEADER SECTION ====================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 51, 102); // Dark blue color
      
      // Main Hospital Name
      const hospitalName = "PUNE SPERM BANK";
      doc.text(hospitalName, pageWidth / 2, yPos, { align: "center" });
      yPos += 7;
      
      // Sub Header
      doc.setFontSize(14);
      doc.text("ASHWINI HOSPITAL, ART BANK", pageWidth / 2, yPos, { align: "center" });
      yPos += 5;
      
      // Address
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(donorData.address, pageWidth / 2, yPos, { align: "center" });
      yPos += 4;
      
      // Contact Information
      doc.text(`Phone: ${donorData.phone} | Web: ${donorData.website}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 8;
      
      // Page Number and Report Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Page No.: ${donorData.pageNumber}`, margin, yPos);
      doc.text("FROZEN DONOR SEMEN REPORT", pageWidth - margin, yPos, { align: "right" });
      yPos += 8;
      
      // Date Line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Date: ${donorData.reportDate}`, margin, yPos);
      yPos += 12;
      
      // ==================== DONOR INFORMATION TABLE ====================
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      
      // First Row - Sample ID and Height
      const col1X = margin;
      const col2X = col1X + 40;
      const col3X = col2X + 40;
      const colWidth = 40;
      const rowHeight = 8;
      
      // Table Header
      doc.setFont("helvetica", "bold");
      doc.setFillColor(240, 240, 240);
      doc.rect(col1X, yPos, colWidth, rowHeight, 'F');
      doc.rect(col2X, yPos, colWidth, rowHeight, 'F');
      doc.rect(col3X, yPos, colWidth, rowHeight, 'F');
      
      doc.text("PARAMETER", col1X + 20, yPos + 5, { align: "center" });
      doc.text("DONOR DETAILS", col2X + 20, yPos + 5, { align: "center" });
      doc.text("TEST RESULTS", col3X + 20, yPos + 5, { align: "center" });
      
      yPos += rowHeight;
      
      // Draw table borders
      doc.rect(col1X, yPos - rowHeight, colWidth * 3, rowHeight * 15);
      doc.line(col2X, yPos - rowHeight, col2X, yPos + rowHeight * 14);
      doc.line(col3X, yPos - rowHeight, col3X, yPos + rowHeight * 14);
      
      // Table Rows - Left Column (Parameters)
      const leftParams = [
        "SAMPLE ID:",
        "HEIGHT:",
        "HAIR:",
        "BLOOD GROUP:",
        "SKIN TONE:",
        "EYES:",
        "EDUCATION:",
        "PROFESSION:",
        "RELIGION:",
        "AGE:",
        "NATIVE PLACE:",
        "HIV I & II:",
        "HBSAG:",
        "HCV:",
        "VDRL:"
      ];
      
      // Table Rows - Middle Column (Donor Details)
      const middleDetails = [
        donorData.sampleId,
        donorData.height,
        donorData.hairColor,
        donorData.bloodGroup,
        donorData.skinTone,
        donorData.eyeColor,
        donorData.education,
        donorData.profession,
        donorData.religion,
        donorData.age,
        donorData.nativePlace,
        donorData.hiv,
        donorData.hbsag,
        donorData.hcv,
        donorData.vdrl
      ];
      
      // Table Rows - Right Column (Additional Tests)
      const rightTests = [
        "CMV:",
        "HB Electrophoresis:",
        "SR. Creatinine:",
        "FAMILY HISTORY:",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        donorData.cmv,
        donorData.hbElectrophoresis,
        donorData.creatinine,
        donorData.familyHistory
      ];
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      
      for (let i = 0; i < leftParams.length; i++) {
        const currentY = yPos + (i * rowHeight);
        
        // Draw horizontal lines
        if (i > 0) {
          doc.line(col1X, currentY, col1X + colWidth * 3, currentY);
        }
        
        // Left Column (Bold labels)
        doc.text(leftParams[i], col1X + 2, currentY + rowHeight/2 + 2);
        
        // Middle Column (Normal text)
        doc.setFont("helvetica", "normal");
        doc.text(middleDetails[i], col2X + 2, currentY + rowHeight/2 + 2);
        
        // Right Column
        if (rightTests[i]) {
          doc.setFont("helvetica", i >= 11 ? "normal" : "bold");
          doc.text(rightTests[i], col3X + (i >= 11 ? 2 : 2), currentY + rowHeight/2 + 2);
        }
        
        doc.setFont("helvetica", "bold");
      }
      
      yPos += rowHeight * leftParams.length + 10;
      
      // ==================== FAMILY HISTORY SECTION ====================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("FAMILY DETAILS:", margin, yPos);
      yPos += 7;
      
      // Family History Table Header
      const familyCols = ["", "AGE", "PROFESSION", "KIDS", "ANY ILLNESS"];
      const familyColWidth = 35;
      const familyStartX = margin;
      
      // Header Background
      doc.setFillColor(240, 240, 240);
      doc.rect(familyStartX, yPos, familyColWidth * 5, rowHeight, 'F');
      
      // Header Text
      doc.setFontSize(10);
      familyCols.forEach((col, index) => {
        doc.text(col, familyStartX + (familyColWidth * index) + familyColWidth/2, yPos + 5, { align: "center" });
      });
      
      yPos += rowHeight;
      
      // Draw family table borders
      doc.rect(familyStartX, yPos - rowHeight, familyColWidth * 5, rowHeight * 3);
      
      // Brother Row
      doc.text("BROTHER", familyStartX + 2, yPos + rowHeight/2 + 2);
      doc.setFont("helvetica", "normal");
      doc.text(donorData.brother.age, familyStartX + familyColWidth + familyColWidth/2, yPos + rowHeight/2 + 2, { align: "center" });
      doc.text(donorData.brother.profession, familyStartX + (familyColWidth * 2) + familyColWidth/2, yPos + rowHeight/2 + 2, { align: "center" });
      doc.text(donorData.brother.kids, familyStartX + (familyColWidth * 3) + familyColWidth/2, yPos + rowHeight/2 + 2, { align: "center" });
      doc.text(donorData.brother.illness, familyStartX + (familyColWidth * 4) + familyColWidth/2, yPos + rowHeight/2 + 2, { align: "center" });
      
      yPos += rowHeight;
      doc.line(familyStartX, yPos, familyStartX + familyColWidth * 5, yPos);
      
      // Sister Row
      doc.setFont("helvetica", "bold");
      doc.text("SISTER", familyStartX + 2, yPos + rowHeight/2 + 2);
      doc.setFont("helvetica", "normal");
      doc.text(donorData.sister.age, familyStartX + familyColWidth + familyColWidth/2, yPos + rowHeight/2 + 2, { align: "center" });
      doc.text(donorData.sister.profession, familyStartX + (familyColWidth * 2) + familyColWidth/2, yPos + rowHeight/2 + 2, { align: "center" });
      doc.text(donorData.sister.kids, familyStartX + (familyColWidth * 3) + familyColWidth/2, yPos + rowHeight/2 + 2, { align: "center" });
      doc.text(donorData.sister.illness, familyStartX + (familyColWidth * 4) + familyColWidth/2, yPos + rowHeight/2 + 2, { align: "center" });
      
      yPos += rowHeight * 2 + 10;
      
      // ==================== SEMEN ANALYSIS SECTION ====================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("SEMEN ANALYSIS REPORT:", margin, yPos);
      yPos += 7;
      
      // Analysis Details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`DATE: ${donorData.semenAnalysis.date}`, margin, yPos);
      doc.text(`MEDIA: ${donorData.semenAnalysis.media}`, margin + 60, yPos);
      doc.text(`REPORT: FROZEN DONOR SEMEN`, margin + 120, yPos);
      yPos += 5;
      doc.text(`TIME: ${donorData.semenAnalysis.time}`, margin, yPos);
      doc.text(`VOLUME: ${donorData.semenAnalysis.volume}`, margin + 60, yPos);
      yPos += 10;
      
      // Semen Analysis Parameters Table
      const semenCols = ["TEST", "RESULT", "UNIT"];
      const semenColWidth = 60;
      const semenStartX = margin;
      
      // Header
      doc.setFillColor(240, 240, 240);
      doc.rect(semenStartX, yPos, semenColWidth * 3, rowHeight, 'F');
      doc.setFont("helvetica", "bold");
      semenCols.forEach((col, index) => {
        doc.text(col, semenStartX + (semenColWidth * index) + semenColWidth/2, yPos + 5, { align: "center" });
      });
      
      yPos += rowHeight;
      doc.rect(semenStartX, yPos - rowHeight, semenColWidth * 3, rowHeight * (donorData.semenAnalysis.parameters.length + 1));
      
      // Parameters Rows
      donorData.semenAnalysis.parameters.forEach((param, index) => {
        const currentY = yPos + (index * rowHeight);
        
        if (index > 0) {
          doc.line(semenStartX, currentY, semenStartX + semenColWidth * 3, currentY);
        }
        
        doc.setFont("helvetica", "bold");
        doc.text(param.test, semenStartX + 2, currentY + rowHeight/2 + 2);
        
        doc.setFont("helvetica", "normal");
        doc.text(param.result, semenStartX + semenColWidth + semenColWidth/2, currentY + rowHeight/2 + 2, { align: "center" });
        doc.text(param.unit, semenStartX + (semenColWidth * 2) + semenColWidth/2, currentY + rowHeight/2 + 2, { align: "center" });
      });
      
      yPos += rowHeight * donorData.semenAnalysis.parameters.length + 15;
      
      // ==================== TESTING DECLARATION ====================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(donorData.notes, margin, yPos);
      yPos += 10;
      
      // ==================== SIGNATURE SECTION ====================
      // Signature Label
      doc.text("Signature:", margin, yPos);
      yPos += 20;
      
      // Hospital Name and Stamp Area
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 102);
      doc.text(donorData.hospitalName, pageWidth / 2, yPos, { align: "center" });
      
      // Add horizontal line for signature
      yPos += 15;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin + 50, yPos, pageWidth - margin - 50, yPos);
      
      // ==================== FOOTER ====================
      const footerY = pageHeight - 10;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("This is a computer-generated report. No physical signature required.", pageWidth / 2, footerY, { align: "center" });
      
      // ==================== SAVE PDF ====================
      const fileName = `Donor_Report_${donorData.sampleId}_${donorData.reportDate.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast.success(`PDF "${fileName}" downloaded successfully!`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Donor Semen Report Generator</h1>
                <p className="text-blue-100 mt-1">Generate professional donor semen analysis reports</p>
              </div>
            </div>
            <div className="text-white text-right">
              <div className="text-sm opacity-90">Sample ID</div>
              <div className="text-xl font-bold">{donorData.sampleId}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Preview Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Report Preview
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Donor Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">Height:</span> {donorData.height}</div>
                    <div><span className="text-gray-600">Blood Group:</span> {donorData.bloodGroup}</div>
                    <div><span className="text-gray-600">Profession:</span> {donorData.profession}</div>
                    <div><span className="text-gray-600">Education:</span> {donorData.education}</div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-medium text-green-800 mb-2">Medical Tests</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">HIV I & II:</span> <span className="text-green-600 font-medium">{donorData.hiv}</span></div>
                    <div><span className="text-gray-600">HBsAg:</span> <span className="text-green-600 font-medium">{donorData.hbsag}</span></div>
                    <div><span className="text-gray-600">HCV:</span> <span className="text-green-600 font-medium">{donorData.hcv}</span></div>
                    <div><span className="text-gray-600">VDRL:</span> <span className="text-green-600 font-medium">{donorData.vdrl}</span></div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="font-medium text-purple-800 mb-2">Semen Analysis</h3>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Sperm Concentration:</span>
                      <span className="font-medium">{donorData.semenAnalysis.parameters[0].result} {donorData.semenAnalysis.parameters[0].unit}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Progressive Motility:</span>
                      <span className="font-medium">{donorData.semenAnalysis.parameters[1].result}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Normal Morphology:</span>
                      <span className="font-medium">{donorData.semenAnalysis.parameters[5].result}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Generate Report
              </h2>

              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="font-medium text-gray-700 mb-3">Report Includes</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Complete donor profile and medical history
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Comprehensive medical test results
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Detailed semen analysis parameters
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Family history and sibling information
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Official hospital signature and stamp
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <button
                    onClick={generateDonorReportPDF}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl shadow-lg flex items-center justify-center space-x-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-lg">Download Donor Report PDF</span>
                  </button>
                  
                  <p className="text-sm text-gray-500 mt-3">
                    Click to download a professionally formatted PDF report
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-yellow-700">
                      <span className="font-medium">Note:</span> This report includes all mandatory medical disclosures and testing declarations as per ART guidelines.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Info Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">{donorData.hospitalName}</span>
              <span className="text-gray-400">•</span>
              <span>{donorData.address}</span>
              <span className="text-gray-400">•</span>
              <span>Phone: {donorData.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HandoverDocsPDF;