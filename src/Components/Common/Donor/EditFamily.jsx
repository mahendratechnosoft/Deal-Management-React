import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";

import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";

function EditFamily() {
  const navigate = useNavigate();
  const { familyInfoId } = useParams();
  const { LayoutComponent, role } = useLayout();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("family");
  const [errors, setErrors] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);

  // State for allocation data
  const [allocations, setAllocations] = useState([]);
  const [allocationsLoading, setAllocationsLoading] = useState(false);

  // 1. Family Info State
  const [familyInfo, setFamilyInfo] = useState({
    familyInfoId: "",
    adminId: "",
    employeeId: "",
    uin: "",
    referHospital: "",
    referHospitalAddress: "",
    referDoctor: "",
    referDoctorContactNumber: "",
    husbandName: "",
    husbandMobile: "",
    husbandHeight: "",
    husbandWeight: "",
    husbandBloodGroup: "",
    husbandSkinColor: "",
    husbandEyeColor: "",
    husbandReligion: "",
    husbandEducation: "",
    husbandDistrict: "",
    husbandCountry: "",
    husbandGenticIllness: "",
    wifeName: "",
    wifeMobile: "",
    wifeHeight: "",
    wifeWeight: "",
    wifeBloodGroup: "",
    wifeSkinColor: "",
    wifeEyeColor: "",
    wifeReligion: "",
    wifeEducation: "",
    wifeDistrict: "",
    wifeCountry: "",
    wifeGenticIllness: "",
  });

  const tabs = [
    { id: "family", label: "Family Information" },
    { id: "donorList", label: "Linked Donors" },
  ];

  // Fetch family data
  useEffect(() => {
    const fetchFamilyData = async () => {
      setLoading(true);
      try {
        if (activeTab === "family") {
          const res = await axiosInstance.get(`getFamilyById/${familyInfoId}`);
          setFamilyInfo(res.data);
        } else if (activeTab === "donorList") {
          fetchAllocations();
        }
      } catch (err) {
        console.error("Failed to fetch family data", err);
        toast.error("Failed to load family details.");
      } finally {
        setLoading(false);
      }
    };

    if (familyInfoId) fetchFamilyData();
  }, [activeTab, familyInfoId]);

  // Fetch allocations data
  const fetchAllocations = async () => {
    setAllocationsLoading(true);
    try {
      const res = await axiosInstance.get(
        `getAllFinalReportByFamilyId/${familyInfoId}`
      );
      setAllocations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch allocations", err);
      toast.error("Failed to load donor allocations.");
      setAllocations([]);
    } finally {
      setAllocationsLoading(false);
    }
  };

  // Fetch final report data and generate PDF
  const handleGenerateDonorReport = async (allocationId) => {
    setPdfLoading(true);

    try {
      const response = await axiosInstance.get(`getFinalReport/${allocationId}`);
      const reportData = response.data;

      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ************** ONE-PAGE SAFE MARGINS **************** //
      const margin = 6;
      let y = margin;

      // Reduce font sizes globally
      const HEADER_SIZE = 14;
      const SUBHEADER_SIZE = 10;
      const SECTION_TITLE = 10;
      const NORMAL = 8;

     const compactTableStyles = {
  theme: "grid",
  headStyles: {
    fillColor: [245, 245, 245],
    textColor: 0,
    fontSize: 8,
    fontStyle: "bold",
    cellPadding: 1,
    lineWidth: 0.1,
  },
  bodyStyles: {
    textColor: 0,
    fontSize: 8,
    cellPadding: 1,
    lineWidth: 0.1,
  },
  columnStyles: {
  0: { cellWidth: 49 },
  1: { cellWidth: 49 },
  2: { cellWidth: 49 },
  3: { cellWidth: 49 },
},

  // ✅ Let AutoTable auto-stretch full width
  tableWidth: "auto",
};


      // Prevent ANY page break from autoTable
      const noBreak = {
        pageBreak: "avoid",
        rowPageBreak: "avoid",
        avoidHeight: 2000,
      };

      // =====================================================
      // HEADER (COMPACT)
      // =====================================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(HEADER_SIZE);
      doc.text("PUNE SPERM BANK", pageWidth / 2, y, { align: "center" });
      y += 5;

      doc.setFontSize(SUBHEADER_SIZE);
      doc.text("ASHWINI HOSPITAL - ART BANK", pageWidth / 2, y, {
        align: "center",
      });
      y += 4;

      doc.setFontSize(NORMAL);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Amega, S.No. 1/8, Plot 4, Dawa Chowk, Pune - 411043",
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 3;

      doc.text("Phone: 9975035364 | Web: www.punespermbank.com", pageWidth / 2, y, {
        align: "center",
      });
      y += 4;

      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      // =====================================================
      // MAIN TITLE
      // =====================================================
      doc.setFont("helvetica", "bold");
      doc.setFontSize(SECTION_TITLE + 1);
      doc.text("FROZEN DONOR SEMEN REPORT", pageWidth / 2, y, {
        align: "center",
      });
      y += 5;

      // =====================================================
      // UNIVERSAL FUNC – Four Column Tables (Improved Spacing)
      // =====================================================
const makeTable = (startY, title, rows) => {

  // Add top space ALWAYS
  startY += 4;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(SECTION_TITLE);
  doc.text(title, margin, startY);

  // Add clean spacing below title
  startY += 6;

  autoTable(doc, {
    startY,
    head: [["Parameter", "Value", "Parameter", "Value"]],
    body: rows,
    margin: { left: margin, right: margin },
    ...compactTableStyles,
    ...noBreak,
  });

  return doc.lastAutoTable.finalY + 4;
};




      // =====================================================
      // SECTION — HOSPITAL & FAMILY INFO
      // =====================================================
      // SECTION — HOSPITAL & FAMILY INFO
      doc.setFont("helvetica", "bold");
      doc.setFontSize(SECTION_TITLE);
      doc.text("Hospital & Family Information", margin, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        head: [],
        body: [
          ["Refer Hospital", reportData.referHospitalAddress || "-", "Refer Doctor", reportData.referDoctor || "-"],
          ["Husband Name", reportData.husbandName || "-", "Wife Name", reportData.wifeName || "-"],
          ["Family UIN", reportData.familyUin || "-", "", ""], // Remove Donor UIN
        ],
        margin: { left: margin, right: margin },
        ...compactTableStyles,
        ...noBreak,
      });

      y = doc.lastAutoTable.finalY + 3;


      // =====================================================
      // DONOR INFORMATION
      // =====================================================
y = makeTable(y, "Donor Information", [
  // ✅ Sample ID = Donor UIN ONLY (as per your rule)
  ["Sample ID", reportData.donorUin || "-", "Height", "-"],

  // ✅ Donor ID REMOVED COMPLETELY
  ["Blood Group", reportData.bloodGroup || "-", "Skin Tone", reportData.skinColor || "-"],
  ["Eyes", reportData.eyeColor || "-", "Education", reportData.education || "-"],
  ["Profession", reportData.profession || "-", "Religion", reportData.religion || "-"],
  ["Vials Assigned", reportData.vialsAssignedCount || "0", "", ""],
]);


      // =====================================================
      // BLOOD REPORT
      // =====================================================
      y = makeTable(y, "Blood Report", [
        ["Blood Group", reportData.bloodGroup || "-", "HIV I & II", reportData.hiv || "-"],
        ["HBsAg", reportData.hbsag || "-", "VDRL", reportData.vdrl || "-"],
        ["HCV", reportData.hcv || "-", "HB Electrophoresis", reportData.hbelectrophoresis || "-"],
        ["BSL", reportData.bsl || "-", "Serum Creatinine", reportData.srcreatinine || "-"],
        ["CMV", reportData.cmv || "-", "", ""],
      ]);

      // =====================================================
      // SEMEN REPORT
      // =====================================================
      y = makeTable(y, "Semen Report", [
        [
          "Date",
          reportData.semenReportDateAndTime
            ? new Date(reportData.semenReportDateAndTime).toLocaleDateString("en-GB")
            : "-",
          "Time",
          reportData.semenReportDateAndTime
            ? new Date(reportData.semenReportDateAndTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "-",
        ],
        ["Media", reportData.media || "-", "Volume", reportData.volumne ? `${reportData.volumne} ml` : "-"],
        ["Report", "-", "Concentration", reportData.spermConcentration || "-"],
        [
          "Motility A",
          reportData.progressiveMotilityA ? `${reportData.progressiveMotilityA}%` : "-",
          "Motility B",
          reportData.progressiveMotilityB ? `${reportData.progressiveMotilityB}%` : "-",
        ],
        [
          "Motility C",
          reportData.progressiveMotilityC ? `${reportData.progressiveMotilityC}%` : "-",
          "Morphology",
          reportData.morphology || "-",
        ],
        ["Abnormality", reportData.abnormality || "-", "", ""],
      ]);

   // =====================================================
// DECLARATION (UPDATED AS PER YOUR TEXT)
// =====================================================
doc.setFont("helvetica", "bold");
doc.setFontSize(SECTION_TITLE);
doc.text("Declaration:", margin, y);
y += 4;

doc.setFont("helvetica", "normal");
doc.setFontSize(NORMAL);

const declarationText = `
All above mentioned information is correct & true to our knowledge. 
Aforementioned specifications help to screen the target D- sample. We understand that despite of the 
above specifications, phenotypic & genotypic differences might occur & which is inevitable. We both 
willfully agree & give consent to use donor semen sample for IUI.
`;

// Declaration Paragraph
doc.text(declarationText.trim(), margin, y, {
  maxWidth: pageWidth - margin * 2,
});
y += 18;

// -------------------
// Doctor Name, Signature, Date Layout
// -------------------

doc.setFont("helvetica", "bold");
doc.text("Doctor's Name :", margin, y);
// doc.line(margin + 30, y, margin + 90, y);

y += 8;

doc.text("Signature :", margin, y);
// doc.line(margin + 30, y, margin + 90, y);

y += 8;

doc.text("Dated :", margin, y);
// doc.line(margin + 30, y, margin + 90, y);





      
      // =====================================================
      // SAVE PDF
      // =====================================================
      const date = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
      const fileName = `Frozen_Donor_Semen_Report_${reportData.donorUin}_${date}.pdf`;
      doc.save(fileName);

      toast.success("PDF generated successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF report");
    } finally {
      setPdfLoading(false);
    }
  };



  // Handlers (same as before)
  const handleChange = (e) => {
    const { name, value } = e.target;
    const mobileFields = [
      "referDoctorContactNumber",
      "husbandMobile",
      "wifeMobile",
    ];

    if (mobileFields.includes(name)) {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 10) {
        setFamilyInfo({ ...familyInfo, [name]: numericValue });

        if (errors[name]) {
          setErrors({ ...errors, [name]: "" });
        }
      }
      return;
    }

    if (name === "husbandGenticIllness" || name === "wifeGenticIllness") {
      if (value.length <= 500) {
        setFamilyInfo({ ...familyInfo, [name]: value });
      }
    } else {
      setFamilyInfo({ ...familyInfo, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    const validateMobile = (fieldName, label) => {
      const value = familyInfo[fieldName];
      if (value && value.length !== 10) {
        tempErrors[fieldName] = `${label} must be exactly 10 digits`;
        isValid = false;
      }
    };

    if (familyInfo.husbandGenticIllness && familyInfo.husbandGenticIllness.length > 500) {
      tempErrors.husbandGenticIllness = "Genetic illness cannot exceed 500 characters";
      isValid = false;
    }

    if (familyInfo.wifeGenticIllness && familyInfo.wifeGenticIllness.length > 500) {
      tempErrors.wifeGenticIllness = "Genetic illness cannot exceed 500 characters";
      isValid = false;
    }

    validateMobile("referDoctorContactNumber", "Doctor Contact");
    validateMobile("husbandMobile", "Husband Mobile");
    validateMobile("wifeMobile", "Wife Mobile");

    setErrors(tempErrors);
    return isValid;
  };

  const updateFamilyInfo = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.put("updateFamilyInfo", familyInfo);
      toast.success("Family Information Updated Successfully!");
    } catch (error) {
      console.error("Error updating family info:", error);
      toast.error("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const skinColorOptions = [
    { value: "Fair", label: "Fair" },
    { value: "Wheatish", label: "Wheatish" },
    { value: "Dark", label: "Dark" },
  ];
  const eyeColorOptions = [
    { value: "Brown", label: "Brown" },
    { value: "Black", label: "Black" },
    { value: "Gray", label: "Gray" },
    { value: "Blue", label: "Blue" },
    { value: "Green", label: "Green" },
    { value: "Hazel", label: "Hazel" },
    { value: "Amber", label: "Amber" },
  ];
  const educationOptions = [
    { value: "UnderGraduation", label: "Under Graduation" },
    { value: "PostGraduation", label: "Post Graduation" },
    { value: "Masters", label: "Masters" },
    { value: "Graduated", label: "Graduated" },
  ];
  const bloodGroupOptions = [
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
  ];

  const handleSelectChange = (option, fieldName) => {
    setFamilyInfo((prev) => ({
      ...prev,
      [fieldName]: option ? option.value : "",
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // --- Render Functions ---

  const renderFamilyInformation = () => (
    <form onSubmit={updateFamilyInfo} className="space-y-6">
      {/* Top Update Button inside Tab */}
      <div className="flex justify-end mb-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? "Updating..." : "Update Family Info"}
        </button>
      </div>

      {/* Referral Information */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Referral Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Referral Hospital"
            name="referHospital"
            value={familyInfo.referHospital}
            onChange={handleChange}
          />
          <FormInput
            label="Hospital Address"
            name="referHospitalAddress"
            value={familyInfo.referHospitalAddress}
            onChange={handleChange}
          />
          <FormInput
            label="Referral Doctor"
            name="referDoctor"
            value={familyInfo.referDoctor}
            onChange={handleChange}
          />
          <FormInput
            label="Doctor Contact No."
            name="referDoctorContactNumber"
            value={familyInfo.referDoctorContactNumber}
            onChange={handleChange}
            error={errors.referDoctorContactNumber}
          />
        </div>
      </div>

      {/* Husband Information */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">
          Husband Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Name"
            name="husbandName"
            value={familyInfo.husbandName}
            onChange={handleChange}
          />
          <FormInput
            label="Contact Number"
            name="husbandMobile"
            value={familyInfo.husbandMobile}
            onChange={handleChange}
            error={errors.husbandMobile}
          />
          <FormInput
            label="Height(cm)"
            name="husbandHeight"
            value={familyInfo.husbandHeight}
            onChange={handleChange}
          />
          <FormInput
            label="Weight(kg)"
            name="husbandWeight"
            value={familyInfo.husbandWeight}
            onChange={handleChange}
          />

          <FormSelect
            label="Blood Group"
            name="husbandBloodGroup"
            value={bloodGroupOptions.find(
              (o) => o.value === familyInfo.husbandBloodGroup
            )}
            options={skinColorOptions}
            onChange={(o) => handleSelectChange(o, "skinColor", familyInfo)}
          />
          <FormSelect
            label="Skin Color"
            name="husbandSkinColor"
            value={skinColorOptions.find(
              (o) => o.value === familyInfo.husbandSkinColor
            )}
            options={skinColorOptions}
            onChange={(o) => handleSelectChange(o, "skinColor", familyInfo)}
          />
          <FormSelect
            label="Eye Color"
            name="husbandEyeColor"
            value={eyeColorOptions.find(
              (o) => o.value === familyInfo.husbandEyeColor
            )}
            options={eyeColorOptions}
            onChange={(o) => handleSelectChange(o, "eyeColor", familyInfo)}
          />

          <FormInput
            label="Religion"
            name="husbandReligion"
            value={familyInfo.husbandReligion}
            onChange={handleChange}
          />

          <FormSelect
            label="Education"
            name="husbandEducation"
            value={educationOptions.find(
              (o) => o.value === familyInfo.husbandEducation
            )}
            options={educationOptions}
            onChange={(o) => handleSelectChange(o, "education", familyInfo)}
          />
          <FormInput
            label="District"
            name="husbandDistrict"
            value={familyInfo.husbandDistrict}
            onChange={handleChange}
          />
          <FormInput
            label="Country"
            name="husbandCountry"
            value={familyInfo.husbandCountry}
            onChange={handleChange}
          />
          <div className="md:col-span-3">
            <FormTextarea
              label="Genetic Illness"
              name="husbandGenticIllness"
              value={familyInfo.husbandGenticIllness}
              onChange={handleChange}
              rows={2}
              error={errors.husbandGenticIllness}
            />
            <div className="text-right mt-1">
              <span className={`text-xs ${familyInfo.husbandGenticIllness.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                {familyInfo.husbandGenticIllness.length}/500 characters
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wife Information */}
      <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
        <h3 className="text-lg font-semibold text-pink-800 mb-4 border-b border-pink-200 pb-2">
          Wife Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Name"
            name="wifeName"
            value={familyInfo.wifeName}
            onChange={handleChange}
          />
          <FormInput
            label="Contact Number"
            name="wifeMobile"
            value={familyInfo.wifeMobile}
            onChange={handleChange}
            error={errors.wifeMobile}
          />
          <FormInput
            label="Height"
            name="wifeHeight"
            value={familyInfo.wifeHeight}
            onChange={handleChange}
          />
          <FormInput
            label="Weight"
            name="wifeWeight"
            value={familyInfo.wifeWeight}
            onChange={handleChange}
          />

          <FormSelect
            label="Blood Group"
            name="wifeBloodGroup"
            value={bloodGroupOptions.find(
              (o) => o.value === familyInfo.wifeBloodGroup
            )}
            options={skinColorOptions}
            onChange={(o) => handleSelectChange(o, "skinColor", familyInfo)}
          />
          <FormSelect
            label="Skin Color"
            name="wifeSkinColor"
            value={skinColorOptions.find(
              (o) => o.value === familyInfo.wifeSkinColor
            )}
            options={skinColorOptions}
            onChange={(o) => handleSelectChange(o, "skinColor", familyInfo)}
          />
          <FormSelect
            label="Eye Color"
            name="wifeEyeColor"
            value={eyeColorOptions.find(
              (o) => o.value === familyInfo.wifeEyeColor
            )}
            options={eyeColorOptions}
            onChange={(o) => handleSelectChange(o, "eyeColor", familyInfo)}
          />

          <FormInput
            label="Religion"
            name="wifeReligion"
            value={familyInfo.wifeReligion}
            onChange={handleChange}
          />
          <FormSelect
            label="Education"
            name="wifeEducation"
            value={educationOptions.find(
              (o) => o.value === familyInfo.wifeEducation
            )}
            options={educationOptions}
            onChange={(o) => handleSelectChange(o, "education", familyInfo)}
          />
          <FormInput
            label="District"
            name="wifeDistrict"
            value={familyInfo.wifeDistrict}
            onChange={handleChange}
          />
          <FormInput
            label="Country"
            name="wifeCountry"
            value={familyInfo.wifeCountry}
            onChange={handleChange}
          />
          <div className="md:col-span-3">
            <FormTextarea
              label="Genetic Illness"
              name="wifeGenticIllness"
              value={familyInfo.wifeGenticIllness}
              onChange={handleChange}
              rows={2}
              error={errors.wifeGenticIllness}
            />
            <div className="text-right mt-1">
              <span className={`text-xs ${familyInfo.wifeGenticIllness.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                {familyInfo.wifeGenticIllness.length}/500 characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );

  const renderDonorList = () => (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Allocated Donors</h3>
        <button
          type="button"
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium"
          onClick={fetchAllocations}
          disabled={allocationsLoading}
        >
          {allocationsLoading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {allocationsLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading allocations...</p>
        </div>
      ) : allocations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No donor allocations found for this family.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor UIN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vials Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocation Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allocations.map((allocation) => (
                <tr key={allocation.allocationId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleGenerateDonorReport(allocation.allocationId)}
                      disabled={pdfLoading}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pdfLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Generate PDF
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {allocation.donarUin || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {allocation.donarName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {allocation.vialsAssignedCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(allocation.allocationDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );


  const renderTabContent = () => {
    if (loading && !familyInfo.familyInfoId)
      return <div className="p-4 text-center">Loading...</div>;

    switch (activeTab) {
      case "family":
        return renderFamilyInformation();
      case "donorList":
        return renderDonorList();
      default:
        return renderFamilyInformation();
    }
  };

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Header Section */}
        <div className="">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                if (role === "ROLE_ADMIN") navigate("/Admin/FamilyList");
                else if (role === "ROLE_EMPLOYEE")
                  navigate("/Employee/FamilyList");
              }}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Family List
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Edit Family Details
              </h1>
              {familyInfo.uin && (
                <span className="text-sm text-gray-500 font-medium">
                  UIN: {familyInfo.uin}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto h-[72vh] CRM-scroll-width-none mt-2">
          <div className="p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200">
                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500">
                  {tabs.map((tab) => (
                    <li key={tab.id} className="me-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-block p-4 rounded-t-lg transition-colors duration-200 ${activeTab === tab.id
                          ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                          : "hover:text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tab Content */}
              <div className="p-6">{renderTabContent()}</div>
            </div>
          </div>
        </div>
      </div>



    </LayoutComponent>
  );
}

export default EditFamily;
