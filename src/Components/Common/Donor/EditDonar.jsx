import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import {
  FormFileAttachment,
  FormInput,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";

const bloodGroupOptions = [
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
];

const reportOptions = [
  { value: "Positive", label: "Positive" },
  { value: "Negative", label: "Negative" },
];
const EditDonorPageSkeleton = () => {
  return (
    <div className="p-4 bg-gray-50 h-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-300 rounded w-1/4"></div> {/* Title */}
        <div className="h-10 bg-gray-300 rounded w-20"></div>{" "}
        {/* Back Button */}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs Skeleton */}
        <div className="border-b border-gray-200 px-4 pt-4">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 rounded-t-lg"></div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-6 space-y-6">
          {/* Images Section Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border p-4 rounded bg-gray-50 flex flex-col items-center">
              <div className="h-40 w-40 rounded-full bg-gray-300 mb-3"></div>
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
            </div>
            <div className="border p-4 rounded bg-gray-50 flex flex-col items-center">
              <div className="h-40 w-40 rounded bg-gray-300 mb-3"></div>
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>

          {/* Form Inputs Grid Skeleton */}
          <div>
            <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>{" "}
            {/* Section Title */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-1"></div>{" "}
                  {/* Label */}
                  <div className="h-10 w-full bg-gray-200 rounded"></div>{" "}
                  {/* Input */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const validateName = (name) => {
  if (!name?.trim()) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 50) return "Name cannot exceed 50 characters";
  return "";
};

const validateAge = (age) => {
  if (!age) return "Age is required";
  const ageNum = parseInt(age, 10);
  if (isNaN(ageNum)) return "Age must be a valid number";
  return "";
};

const validateDateOfBirth = (dob) => {
  if (!dob) return "Date of birth is required";

  const dobDate = new Date(dob);
  const today = new Date();

  if (dobDate > today) return "Date of birth cannot be in the future";

  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120);
  if (dobDate < minDate) return "Please enter a valid date of birth";

  return "";
};

const validateMobile = (mobile) => {
  if (!mobile) return "Mobile number is required";
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobile)) {
    return "Please enter a valid 10-digit Indian mobile number";
  }
  return "";
};

const validateEmail = (email) => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  if (email.length > 100) return "Email cannot exceed 100 characters";
  return "";
};

const validatePincode = (pincode) => {
  if (!pincode) return "Pincode is required";
  const pincodeRegex = /^\d{6}$/;
  if (!pincodeRegex.test(pincode)) {
    return "Please enter a valid 6-digit pincode";
  }
  if (pincode.startsWith("0")) {
    return "Pincode cannot start with 0";
  }
  return "";
};

const validateHeight = (height) => {
  if (!height) return "Height is required";
  const heightNum = parseFloat(height);
  if (isNaN(heightNum)) return "Height must be a valid number";
  return "";
};

const validateWeight = (weight) => {
  if (!weight) return "Weight is required";
  const weightNum = parseFloat(weight);
  if (isNaN(weightNum)) return "Weight must be a valid number";
  return "";
};

const validateCity = (city) => {
  if (!city?.trim()) return "City is required";
  if (city.length < 2) return "City must be at least 2 characters";
  if (city.length > 50) return "City cannot exceed 50 characters";
  const cityRegex = /^[a-zA-Z\s.,'-]{2,}$/;
  if (!cityRegex.test(city.trim())) {
    return "Please enter a valid city name";
  }
  return "";
};

const validateProfession = (profession) => {
  if (!profession?.trim()) return "Profession is required";
  if (profession.length < 2) return "Profession must be at least 2 characters";
  if (profession.length > 100) return "Profession cannot exceed 100 characters";
  return "";
};

const validateAddress = (address) => {
  if (!address?.trim()) return "Address is required";
  if (address.length < 10) return "Address must be at least 10 characters";
  if (address.length > 500) return "Address cannot exceed 500 characters";
  return "";
};

const validateMaritalStatus = (status) => {
  if (!status) return "Marital status is required";
  return "";
};

const validateBloodGroup = (bloodGroup) => {
  if (!bloodGroup) return "Blood group is required";
  return "";
};

const validateGeneticIllness = (text) => {
  if (!text) return ""; // Optional field
  if (text.length > 500) return "Genetic illness cannot exceed 500 characters";
  return "";
};
function EditDonar() {
  const navigate = useNavigate();
  const { donorId } = useParams();
  const { LayoutComponent, role } = useLayout();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [personalErrors, setPersonalErrors] = useState({});
  const [allocations, setAllocations] = useState([]);
  // --- State Management ---

  // 1. Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    age: "",
    dateOfBirth: "",
    adharCardNo: "",
    marriedStatus: "",
    maleKidsCount: "",
    femaleKidsCount: "",
    height: "",
    weight: "",
    religion: "",
    skinColor: "",
    eyeColor: "",
    education: "",
    profession: "",
    address: "",
    city: "",
    pincode: "",
    phoneNumber: "",
    email: "",
    selfeImage: null,
    fullLengthImage: null,
    // Medical History
    hospitalAdmissionStatus: false,
    hospitalAdmissionReason: "",
    surgeryStatus: false,
    surgeryReason: "",
    bloodDonationStatus: false,
    bloodDonationReason: "",
    prolongedIllnessStatus: false,
    prolongedIllnessReason: "",
    status: "",
    geneticElements: "",
  });

  // 2. Family Info State (Split into Brothers and Sisters)
  const [brothers, setBrothers] = useState([]);
  const [sisters, setSisters] = useState([]);

  // 3. Blood Reports State

  const [bloodReports, setBloodReports] = useState([]);
  // 4. Semen Report State
  const [semenReport, setSemenReport] = useState([]);

  // 5. Sample Report State
  const [sampleReport, setSampleReport] = useState({});

  const tabs = [
    { id: "personal", label: "Personal Information" },
    { id: "family", label: "Family Information" },
    { id: "blood", label: "Blood Reports" },
    { id: "semen", label: "Semen Report" },
    { id: "sample", label: "Sample Storage" },
    { id: "linkedFamily", label: "Linked Family" },
  ];

  // Options
  const statusOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];
  const marriedOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];
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

  const visibleTabs = tabs.filter((tab) => {
    const status = personalInfo.status;

    if (status === "New Donor") {
      return (
        tab.id !== "semen" &&
        tab.id !== "sample" &&
        tab.id !== "blood" &&
        tab.id !== "family" &&
        tab.id !== "linkedFamily"
      );
    }

    if (status === "Selected") {
      return (
        tab.id !== "semen" && tab.id !== "sample" && tab.id !== "linkedFamily"
      );
    }

    if (status === "Shortlisted" || status === "Quarantined") {
      return tab.id !== "sample" && tab.id !== "linkedFamily";
    }

    if (status === "Qualified") {
      return tab.id !== "linkedFamily";
    }
    return true;
  });

  // ADD THESE VALIDATION FUNCTIONS INSIDE THE COMPONENT
  const validatePersonalField = (name, value) => {
    switch (name) {
      case "name":
        return validateName(value);
      case "age":
        return validateAge(value);
      case "dateOfBirth":
        return validateDateOfBirth(value);
      case "height":
        return validateHeight(value);
      case "weight":
        return validateWeight(value);
      case "phoneNumber":
        return validateMobile(value);
      case "email":
        return validateEmail(value);
      case "pincode":
        return validatePincode(value);
      case "city":
        return validateCity(value);
      case "profession":
        return validateProfession(value);
      case "address":
        return validateAddress(value);
      case "marriedStatus":
        return validateMaritalStatus(value);
      case "bloodGroup":
        return validateBloodGroup(value);
      case "geneticElements":
        return validateGeneticIllness(value);
      // Aadhar, Religion, Kids counts are NOT required (optional in edit form)
      default:
        return "";
    }
  };

  const validatePersonalForm = () => {
    const errors = {};

    // Only validate fields that exist in Create form
    const createFormFields = [
      "name",
      "marriedStatus",
      "age",
      "dateOfBirth",
      "address",
      "city",
      "pincode",
      "phoneNumber",
      "email",
      "height",
      "weight",
      "bloodGroup",
      "profession",
    ];

    createFormFields.forEach((field) => {
      const error = validatePersonalField(field, personalInfo[field]);
      if (error) {
        errors[field] = error;
      }
    });

    // ADD THIS: Also validate geneticElements for character limit
    const geneticError = validateGeneticIllness(personalInfo.geneticElements);
    if (geneticError) {
      errors.geneticElements = geneticError;
    }

    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "personal") {
          const res = await axiosInstance.get(`getDonorById/${donorId}`);
          setPersonalInfo(res.data);
        } else if (activeTab === "family") {
          const res = await axiosInstance.get(`getDonorFamilyInfo/${donorId}`);
          const data = res.data || [];

          // Parse the combined API data into separate arrays for UI
          const bList = data
            .map((item) => ({
              donorFamailyId: item.donorFamailyId,
              age: item.brotherAge,
              profession: item.brotherProfession,
              kidsCount: item.brotherKidsCount,
              illness: item.brotherIllness,
            }))
            .filter((b) => b.age || b.profession); // Optional: Filter out empty rows if needed

          const sList = data
            .map((item) => ({
              donorFamailyId: item.donorFamailyId,
              age: item.sisterAge,
              profession: item.sisterProfession,
              kidsCount: item.sisterKidsCount,
              illness: item.sisterIllness,
            }))
            .filter((s) => s.age || s.profession);

          // If empty, initialize with one empty row
          setBrothers(
            bList.length
              ? bList
              : [
                  {
                    age: "",
                    profession: "",
                    kidsCount: "",
                    illness: "",
                    donorFamailyId: "",
                  },
                ]
          );
          setSisters(
            sList.length
              ? sList
              : [
                  {
                    age: "",
                    profession: "",
                    kidsCount: "",
                    illness: "",
                    donorFamailyId: "",
                  },
                ]
          );
        } else if (activeTab === "blood") {
          const res = await axiosInstance.get(`getDonorBloodReport/${donorId}`);
          setBloodReports(res.data || []);
        } else if (activeTab === "semen") {
          const res = await axiosInstance.get(
            `getSemenReportByDonorId/${donorId}`
          );
          setSemenReport(res.data || []);
        } else if (activeTab === "sample") {
          const res = await axiosInstance.get(
            `getSampleReportByDonorId/${donorId}`
          );
          setSampleReport(res.data || { donorId: donorId });
        } else if (activeTab === "linkedFamily") {
          const res = await axiosInstance.get(`getAllDonation/${donorId}`);
          setAllocations(res.data || []);
        }
      } catch (err) {
        console.error(`Failed to fetch ${activeTab} data`, err);
      } finally {
        setLoading(false);
      }
    };
    if (donorId) fetchData();
  }, [activeTab, donorId]);

  useEffect(() => {
    const isTabVisible = visibleTabs.some((t) => t.id === activeTab);
    if (!isTabVisible && visibleTabs.length > 0) {
      setActiveTab("personal");
    }
  }, [personalInfo.status, activeTab]);

  // --- Generic Handlers ---
  const handleObjectChange = (e, stateSetter) => {
    const { name, value, type, checked } = e.target;
    stateSetter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user types
    if (personalErrors[name]) {
      setPersonalErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // ADD REAL-TIME VALIDATION FOR GENETIC ELEMENTS
    if (name === "geneticElements") {
      const error = validateGeneticIllness(value);
      if (error) {
        setPersonalErrors((prev) => ({ ...prev, geneticElements: error }));
      } else if (personalErrors.geneticElements) {
        setPersonalErrors((prev) => ({ ...prev, geneticElements: "" }));
      }
    }
  };

  const handleSelectChange = (option, name, stateSetter) => {
    stateSetter((prev) => ({
      ...prev,
      [name]: option ? option.value : "",
    }));

    // Clear error when user selects
    if (personalErrors[name]) {
      setPersonalErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // --- Image Handling ---
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64DataUrl = await convertToBase64(file);
        const rawBase64 = base64DataUrl.split(",")[1];
        setPersonalInfo((prev) => ({ ...prev, [fieldName]: rawBase64 }));
      } catch (error) {
        toast.error("Error processing image");
      }
    }
  };

  const handleAttachmentUpload = (e, index, type) => {
    console.log("Index:", index);
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.length > 200) {
      toast.error(
        "File name is too long. Please rename it to under 200 characters."
      );
      e.target.value = null;
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds the 5MB limit.");
      e.target.value = null;
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload a PDF, Word, or Excel document."
      );
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];

      const updateList = (prevList) => {
        const newList = [...prevList];
        newList[index] = {
          ...newList[index],
          attachmentFile: base64String,
          attachmentFileName: file.name,
          attachmentFileType: file.type,
        };
        return newList;
      };

      if (type === "blood") {
        setBloodReports(updateList);
      } else if (type === "semen") {
        setSemenReport(updateList);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (index, type) => {
    const updateList = (prevList) => {
      const newList = [...prevList];
      newList[index] = {
        ...newList[index],
        attachmentFile: "",
        attachmentFileName: "",
        attachmentFileType: "",
      };
      return newList;
    };

    if (type === "blood") {
      setBloodReports(updateList);
    } else if (type === "semen") {
      setSemenReport(updateList);
    }
  };

  const downloadFile = (base64String, fileName, mimeType) => {
    if (!base64String) return;
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const previewFile = (base64String, mimeType) => {
    if (!base64String) return;
    const previewableTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!previewableTypes.includes(mimeType)) {
      toast.error("Preview not available for this file type. Please download.");
      return;
    }

    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
  };

  // --- SUBMIT HANDLERS (Per Tab) ---

  const updatePersonal = async (e) => {
    e.preventDefault();

    // Validate before submitting (only fields that exist in Create form)
    if (!validatePersonalForm()) {
      toast.error("Please fix the validation errors in the form");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put("updateDonor", personalInfo);
      toast.success("Personal Information Updated!");
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderFormInput = (fieldConfig, isRequired = true) => {
    const { label, name, type = "text", ...props } = fieldConfig;
    const error = personalErrors[name];

    return (
      <div>
        <FormInput
          label={
            isRequired ? (
              <>
                {label} <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              label
            )
          }
          name={name}
          type={type}
          value={personalInfo[name] || ""}
          onChange={(e) => handleObjectChange(e, setPersonalInfo)}
          disabled={loading}
          placeholder={props.placeholder}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  const renderFormSelect = (fieldConfig, isRequired = true) => {
    const { label, name, options, ...props } = fieldConfig;
    const error = personalErrors[name];

    return (
      <div>
        <FormSelect
          label={
            isRequired ? (
              <>
                {label} <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              label
            )
          }
          name={name}
          value={options.find((o) => o.value === personalInfo[name])}
          onChange={(o) => handleSelectChange(o, name, setPersonalInfo)}
          options={options}
          isDisabled={loading}
          placeholder={props.placeholder || `Select ${label.toLowerCase()}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  const renderFormTextarea = (fieldConfig, isRequired = true) => {
    const { label, name, rows = 3, ...props } = fieldConfig;
    const error = personalErrors[name];

    return (
      <div>
        <FormTextarea
          label={
            isRequired ? (
              <>
                {label} <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              label
            )
          }
          name={name}
          value={personalInfo[name] || ""}
          onChange={(e) => handleObjectChange(e, setPersonalInfo)}
          rows={rows}
          disabled={loading}
          placeholder={props.placeholder}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  const updateFamily = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Merge Brothers and Sisters arrays back into the single object structure expected by API
    // We match them by index. If lengths differ, we pad with empty values.
    const maxLen = Math.max(brothers.length, sisters.length);
    const payload = [];

    for (let i = 0; i < maxLen; i++) {
      const bro = brothers[i] || {
        age: "",
        profession: "",
        kidsCount: "",
        illness: "",
        donorFamailyId: "",
      };
      const sis = sisters[i] || {
        age: "",
        profession: "",
        kidsCount: "",
        illness: "",
        donorFamailyId: "",
      };

      payload.push({
        donorFamailyId: bro.donorFamailyId || null,
        donorId: donorId,
        brotherAge: bro.age,
        brotherProfession: bro.profession,
        brotherKidsCount: bro.kidsCount,
        brotherIllness: bro.illness,
        sisterAge: sis.age,
        sisterProfession: sis.profession,
        sisterKidsCount: sis.kidsCount,
        sisterIllness: sis.illness,
      });
    }

    try {
      await axiosInstance.put("updateDonorFamilyInfo", payload);
      toast.success("Family Information Updated!");
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateBlood = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put("updateDonorBloodReport", bloodReports);
      toast.success("Blood Reports Updated!");
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateSemen = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put("updateSemenReport", semenReport);
      toast.success("Semen Report Updated!");
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateSample = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put("updateSampleReport", sampleReport);
      toast.success("Sample Report Updated!");
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // --- RENDER FUNCTIONS ---

  const renderPersonalInformation = () => (
    <form onSubmit={updatePersonal} className="space-y-6">
      <div className="flex justify-end mb-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? "Updating..." : "Update Personal Info"}
        </button>
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border p-4 rounded bg-gray-50 flex flex-col items-center">
          <span className="text-sm font-bold text-gray-700 mb-2">
            Selfie Image
          </span>
          {personalInfo.selfeImage ? (
            <img
              src={`data:image/jpeg;base64,${personalInfo.selfeImage}`}
              alt="Selfie"
              className="h-40 w-40 object-cover rounded-full border-2 border-blue-200 mb-3"
            />
          ) : (
            <div className="h-40 w-40 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-3">
              No Image
            </div>
          )}
          <label className="cursor-pointer bg-white border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50 shadow-sm">
            Choose File{" "}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e, "selfeImage")}
            />
          </label>
        </div>
        <div className="border p-4 rounded bg-gray-50 flex flex-col items-center">
          <span className="text-sm font-bold text-gray-700 mb-2">
            Full Length Image
          </span>
          {personalInfo.fullLengthImage ? (
            <img
              src={`data:image/jpeg;base64,${personalInfo.fullLengthImage}`}
              alt="Full Length"
              className="h-40 w-auto object-contain border border-gray-200 mb-3"
            />
          ) : (
            <div className="h-40 w-40 bg-gray-200 flex items-center justify-center text-gray-400 mb-3">
              No Image
            </div>
          )}
          <label className="cursor-pointer bg-white border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50 shadow-sm">
            Choose File{" "}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e, "fullLengthImage")}
            />
          </label>
        </div>
      </div>

      {/* Personal Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
          Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {renderFormInput({
            label: "Name",
            name: "name",
            placeholder: "Enter full name",
          })}

          {renderFormSelect({
            label: "Married",
            name: "marriedStatus",
            options: marriedOptions,
          })}

          {renderFormInput({
            label: "Age",
            name: "age",
            type: "number",
            placeholder: "e.g., 30",
          })}

          {renderFormInput({
            label: "DOB",
            name: "dateOfBirth",
            type: "date",
          })}

          {renderFormInput({
            label: "Height (cm)",
            name: "height",
            type: "number",
            step: "0.1",
            placeholder: "e.g., 175.5",
          })}

          {renderFormInput({
            label: "Weight (kg)",
            name: "weight",
            type: "number",
            step: "0.1",
            placeholder: "e.g., 70.5",
          })}

          {renderFormSelect({
            label: "Blood Group",
            name: "bloodGroup",
            options: bloodGroupOptions,
          })}

          {/* Optional fields (not in Create form - no validation) */}
          <FormInput
            label="Aadhar No"
            name="adharCardNo"
            value={personalInfo.adharCardNo || ""}
            onChange={(e) => handleObjectChange(e, setPersonalInfo)}
            disabled={loading}
            placeholder="Enter 12-digit Aadhar number"
          />

          <FormInput
            label="Male Kids"
            name="maleKidsCount"
            value={personalInfo.maleKidsCount || ""}
            onChange={(e) => handleObjectChange(e, setPersonalInfo)}
            type="number"
            disabled={loading}
            placeholder="e.g., 2"
          />

          <FormInput
            label="Female Kids"
            name="femaleKidsCount"
            value={personalInfo.femaleKidsCount || ""}
            onChange={(e) => handleObjectChange(e, setPersonalInfo)}
            type="number"
            disabled={loading}
            placeholder="e.g., 1"
          />

          {renderFormSelect(
            {
              label: "Skin Color",
              name: "skinColor",
              options: skinColorOptions,
            },
            false
          )}

          {renderFormSelect(
            {
              label: "Eye Color",
              name: "eyeColor",
              options: eyeColorOptions,
            },
            false
          )}

          {renderFormSelect(
            {
              label: "Education",
              name: "education",
              options: educationOptions,
            },
            false
          )}

          {renderFormInput({
            label: "Profession",
            name: "profession",
            placeholder: "e.g., Software Engineer",
          })}

          <FormInput
            label="Religion"
            name="religion"
            value={personalInfo.religion || ""}
            onChange={(e) => handleObjectChange(e, setPersonalInfo)}
            disabled={loading}
            placeholder="e.g., Hindu"
          />
        </div>
      </div>

      {/* Address & Contact - UPDATED */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
          Address & Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            {renderFormTextarea({
              label: "Address",
              name: "address",
              rows: 3,
              placeholder: "Enter full residential address",
            })}
          </div>

          {renderFormInput({
            label: "City",
            name: "city",
            placeholder: "Enter city name",
          })}

          {renderFormInput({
            label: "Pincode",
            name: "pincode",
            placeholder: "e.g., 400001",
          })}

          {renderFormInput({
            label: "Mobile",
            name: "phoneNumber",
            placeholder: "Enter 10-digit number",
          })}

          {renderFormInput({
            label: "Email",
            name: "email",
            type: "email",
            placeholder: "john@example.com",
          })}
        </div>
      </div>

      {/* Medical History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
          Medical History
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-3 rounded">
            <FormSelect
              label="Hospital Admission"
              name="hospitalAdmissionStatus"
              value={statusOptions.find(
                (o) => o.value === personalInfo.hospitalAdmissionStatus
              )}
              options={statusOptions}
              onChange={(o) =>
                handleSelectChange(
                  o,
                  "hospitalAdmissionStatus",
                  setPersonalInfo
                )
              }
            />
            {personalInfo.hospitalAdmissionStatus && (
              <FormTextarea
                label="Reason"
                name="hospitalAdmissionReason"
                value={personalInfo.hospitalAdmissionReason}
                onChange={(e) => handleObjectChange(e, setPersonalInfo)}
                rows={2}
              />
            )}
          </div>
          <div className="border p-3 rounded">
            <FormSelect
              label="Surgery"
              name="surgeryStatus"
              value={statusOptions.find(
                (o) => o.value === personalInfo.surgeryStatus
              )}
              options={statusOptions}
              onChange={(o) =>
                handleSelectChange(o, "surgeryStatus", setPersonalInfo)
              }
            />
            {personalInfo.surgeryStatus && (
              <FormTextarea
                label="Reason"
                name="surgeryReason"
                value={personalInfo.surgeryReason}
                onChange={(e) => handleObjectChange(e, setPersonalInfo)}
                rows={2}
              />
            )}
          </div>
          <div className="border p-3 rounded">
            <FormSelect
              label="Blood Donation"
              name="bloodDonationStatus"
              value={statusOptions.find(
                (o) => o.value === personalInfo.bloodDonationStatus
              )}
              options={statusOptions}
              onChange={(o) =>
                handleSelectChange(o, "bloodDonationStatus", setPersonalInfo)
              }
            />
            {personalInfo.bloodDonationStatus && (
              <FormTextarea
                label="Reason"
                name="bloodDonationReason"
                value={personalInfo.bloodDonationReason}
                onChange={(e) => handleObjectChange(e, setPersonalInfo)}
                rows={2}
              />
            )}
          </div>
          <div className="border p-3 rounded">
            <FormSelect
              label="Prolonged Illness"
              name="prolongedIllnessStatus"
              value={statusOptions.find(
                (o) => o.value === personalInfo.prolongedIllnessStatus
              )}
              options={statusOptions}
              onChange={(o) =>
                handleSelectChange(o, "prolongedIllnessStatus", setPersonalInfo)
              }
            />
            {personalInfo.prolongedIllnessStatus && (
              <FormTextarea
                label="Reason"
                name="prolongedIllnessReason"
                value={personalInfo.prolongedIllnessReason}
                onChange={(e) => handleObjectChange(e, setPersonalInfo)}
                rows={2}
              />
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-3 border-b pb-2">
            Genetic Illness
          </h3>
          <div className="border p-3 rounded mt-4">
            <div>
              <FormTextarea
                name="geneticElements"
                value={personalInfo.geneticElements || ""}
                onChange={(e) => handleObjectChange(e, setPersonalInfo)}
                rows={2}
                placeholder="Enter genetic illness details"
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {personalErrors.geneticElements && (
                    <p className="text-sm text-red-600">
                      {personalErrors.geneticElements}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {personalInfo.geneticElements?.length || 0}/500 characters
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );

  const renderFamilyInformation = () => {
    // --- Brother Logic ---
    const handleBrotherChange = (index, e) => {
      const list = [...brothers];
      list[index][e.target.name] = e.target.value;
      setBrothers(list);
    };
    const addBrother = () =>
      setBrothers([
        ...brothers,
        { age: "", profession: "", kidsCount: "", illness: "" },
      ]);
    const removeBrother = async (index, donorFamailyId) => {
      try {
        await axiosInstance.delete(`deleteDonorFamilyInfo/${donorFamailyId}`);
        toast.success("Info Deleted");
      } catch (error) {
        toast.error("Update failed.");
      }
      const list = [...brothers];
      list.splice(index, 1);
      setBrothers(list);
    };

    // --- Sister Logic ---
    const handleSisterChange = (index, e) => {
      const list = [...sisters];
      list[index][e.target.name] = e.target.value;
      setSisters(list);
    };
    const addSister = () =>
      setSisters([
        ...sisters,
        { age: "", profession: "", kidsCount: "", illness: "" },
      ]);
    const removeSister = async (index, donorFamailyId) => {
      try {
        await axiosInstance.delete(`deleteDonorFamilyInfo/${donorFamailyId}`);
        toast.success("Info Deleted");
      } catch (error) {
        toast.error("Update failed.");
      }
      const list = [...sisters];
      list.splice(index, 1);
      setSisters(list);
    };

    return (
      <form onSubmit={updateFamily} className="space-y-6">
        <div className="flex justify-end mb-4">
          <button
            type="submit"
            disabled={loading}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update Family Info
          </button>
        </div>

        {/* BROTHERS SECTION */}
        <div className="bg-gray-50 p-4 rounded border">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold text-blue-700">Brothers</h3>
            <button
              type="button"
              onClick={addBrother}
              className="text-sm bg-green-500 text-white px-3 py-1 rounded"
            >
              + Add Brother
            </button>
          </div>
          {brothers.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end"
            >
              <input
                type="hidden"
                name="donorFamailyId"
                value={item.donorFamailyId || ""}
              />
              <FormInput
                label="Age"
                name="age"
                value={item.age}
                onChange={(e) => handleBrotherChange(index, e)}
                type="number"
              />
              <FormInput
                label="Profession"
                name="profession"
                value={item.profession}
                onChange={(e) => handleBrotherChange(index, e)}
              />
              <FormInput
                label="Kids"
                name="kidsCount"
                value={item.kidsCount}
                onChange={(e) => handleBrotherChange(index, e)}
                type="number"
              />
              <FormInput
                label="Illness"
                name="illness"
                value={item.illness}
                onChange={(e) => handleBrotherChange(index, e)}
              />
              <button
                type="button"
                onClick={() => removeBrother(index, item.donorFamailyId)}
                className="text-red-500 hover:text-red-700 text-sm font-medium mb-2 border border-red-200 px-2 py-1 rounded bg-white"
              >
                Remove
              </button>
            </div>
          ))}
          {brothers.length === 0 && (
            <p className="text-sm text-gray-500">No brothers added.</p>
          )}
        </div>

        {/* SISTERS SECTION */}
        <div className="bg-gray-50 p-4 rounded border">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold text-pink-700">Sisters</h3>
            <button
              type="button"
              onClick={addSister}
              className="text-sm bg-green-500 text-white px-3 py-1 rounded"
            >
              + Add Sister
            </button>
          </div>
          {sisters.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end"
            >
              <input
                type="hidden"
                name="donorFamailyId"
                value={item.donorFamailyId || ""}
              />
              <FormInput
                label="Age"
                name="age"
                value={item.age}
                onChange={(e) => handleSisterChange(index, e)}
                type="number"
              />
              <FormInput
                label="Profession"
                name="profession"
                value={item.profession}
                onChange={(e) => handleSisterChange(index, e)}
              />
              <FormInput
                label="Kids"
                name="kidsCount"
                value={item.kidsCount}
                onChange={(e) => handleSisterChange(index, e)}
                type="number"
              />
              <FormInput
                label="Illness"
                name="illness"
                value={item.illness}
                onChange={(e) => handleSisterChange(index, e)}
              />
              <button
                type="button"
                onClick={() => removeSister(index, item.donorFamailyId)}
                className="text-red-500 hover:text-red-700 text-sm font-medium mb-2 border border-red-200 px-2 py-1 rounded bg-white"
              >
                Remove
              </button>
            </div>
          ))}
          {sisters.length === 0 && (
            <p className="text-sm text-gray-500">No sisters added.</p>
          )}
        </div>
      </form>
    );
  };

  const renderBloodReports = () => {
    const handleBloodChange = (index, e) => {
      const list = [...bloodReports];
      list[index][e.target.name] = e.target.value;
      setBloodReports(list);
    };
    const addReport = () => {
      const now = new Date();
      const currentDateTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      setBloodReports([
        ...bloodReports,
        {
          donorId: donorId,
          reportDateTime: currentDateTime,
          bloodGroup: "",
          bsl: "",
          reportType: "",
          hiv: "",
          hbsag: "",
          vdrl: "",
          hcv: "",
          hbelectrophoresis: "",
          srcreatinine: "",
          cmv: "",
          attachmentFile: null,
          attachmentFileName: null,
          attachmentFileType: null,
          stage: personalInfo.status || "Unknown",
        },
      ]);
    };
    const removeReport = async (index, bloodReportId) => {
      try {
        await axiosInstance.delete(`deleteDonorBloodReport/${bloodReportId}`);
        toast.success("Sample Report Updated!");
      } catch (error) {
        toast.error("Update failed.");
      }
      const list = [...bloodReports];
      list.splice(index, 1);
      setBloodReports(list);
    };

    return (
      <form onSubmit={updateBlood} className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Blood Reports</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addReport}
              className="text-sm bg-green-500 text-white px-3 py-2 rounded"
            >
              + Add Report
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update Blood Reports
            </button>
          </div>
        </div>
        {bloodReports.map((report, index) => (
          <div
            key={index}
            className="border p-4 rounded bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4 relative mb-4"
          >
            <div className="md:col-span-4 flex justify-between font-bold text-gray-500 border-b pb-1 mb-2">
              <span>Report #{index + 1}</span>
              <div className="flex items-center gap-3">
                {/* Stage Badge - Display Only */}
                {report.stage && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Stage: {report.stage}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => removeReport(index, report.donorBloodReportId)}
                  className="text-red-500 hover:text-red-700 text-xs transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
            <input
              type="hidden"
              name="donorFamailyId"
              value={report.donorBloodReportId || ""}
            />
            <FormInput
              label="Date & Time"
              name="reportDateTime"
              type="datetime-local"
              value={report.reportDateTime}
              onChange={(e) => handleBloodChange(index, e)}
            />
            {/* <FormInput
              label="Report Type"
              name="reportType"
              value={report.reportType}
              onChange={(e) => handleBloodChange(index, e)}
            /> */}

            <FormSelect
              label="Blood Group"
              name="bloodGroup"
              value={bloodGroupOptions.find(
                (o) => o.value === report.bloodGroup
              )}
              options={bloodGroupOptions}
              onChange={(selectedOption) => {
                const list = [...bloodReports];
                list[index]["bloodGroup"] = selectedOption
                  ? selectedOption.value
                  : "";
                setBloodReports(list);
              }}
            />

            <FormInput
              label="BSL"
              name="bsl"
              type="number"
              value={report.bsl}
              onChange={(e) => handleBloodChange(index, e)}
            />

            <FormSelect
              label="HIV"
              name="hiv"
              value={reportOptions.find((o) => o.value === report.hiv)}
              options={reportOptions}
              onChange={(selectedOption) => {
                const list = [...bloodReports];
                list[index]["hiv"] = selectedOption ? selectedOption.value : "";
                setBloodReports(list);
              }}
            />
            <FormSelect
              label="HBSAG"
              name="hbsag"
              value={reportOptions.find((o) => o.value === report.hbsag)}
              options={reportOptions}
              onChange={(selectedOption) => {
                const list = [...bloodReports];
                list[index]["hbsag"] = selectedOption
                  ? selectedOption.value
                  : "";
                setBloodReports(list);
              }}
            />
            <FormSelect
              label="VDRL"
              name="vdrl"
              value={reportOptions.find((o) => o.value === report.vdrl)}
              options={reportOptions}
              onChange={(selectedOption) => {
                const list = [...bloodReports];
                list[index]["vdrl"] = selectedOption
                  ? selectedOption.value
                  : "";
                setBloodReports(list);
              }}
            />
            <FormSelect
              label="HCV"
              name="hcv"
              value={reportOptions.find((o) => o.value === report.hcv)}
              options={reportOptions}
              onChange={(selectedOption) => {
                const list = [...bloodReports];
                list[index]["hcv"] = selectedOption ? selectedOption.value : "";
                setBloodReports(list);
              }}
            />
            <FormSelect
              label="HB Electrophoresis"
              name="hbelectrophoresis"
              value={reportOptions.find(
                (o) => o.value === report.hbelectrophoresis
              )}
              options={reportOptions}
              onChange={(selectedOption) => {
                const list = [...bloodReports];
                list[index]["hbelectrophoresis"] = selectedOption
                  ? selectedOption.value
                  : "";
                setBloodReports(list);
              }}
            />
            <FormSelect
              label="SR. Creatinine"
              name="srcreatinine"
              value={reportOptions.find((o) => o.value === report.srcreatinine)}
              options={reportOptions}
              onChange={(selectedOption) => {
                const list = [...bloodReports];
                list[index]["srcreatinine"] = selectedOption
                  ? selectedOption.value
                  : "";
                setBloodReports(list);
              }}
            />
            <FormSelect
              label="CMV"
              name="cmv"
              value={reportOptions.find((o) => o.value === report.cmv)}
              options={reportOptions}
              onChange={(selectedOption) => {
                const list = [...bloodReports];
                list[index]["cmv"] = selectedOption ? selectedOption.value : "";
                setBloodReports(list);
              }}
            />
            <FormFileAttachment
              label="Attachment"
              name="attachment"
              fileName={report.attachmentFileName || ""}
              onChange={(e) => handleAttachmentUpload(e, index, "blood")}
              onRemove={() => handleRemoveAttachment(index)}
              onDownload={() =>
                downloadFile(
                  report.attachmentFile,
                  report.attachmentFileName,
                  report.attachmentFileType
                )
              }
              onPreview={
                ["application/pdf", "image/jpeg", "image/png"].includes(
                  report.attachmentFileType
                )
                  ? () =>
                      previewFile(
                        report.attachmentFile,
                        report.attachmentFileType
                      )
                  : undefined
              }
              background="white"
              className={`
                md:col-span-1 
                [&>div]:border-blue-400 
                [&>div]:border
                [&>div]:border-2
                [&>div]:hover:bg-blue-100
                [&>label]:font-bold
              `}
            />
          </div>
        ))}
      </form>
    );
  };

  const renderSemenReport = () => {
    const handleSemenChange = (index, e) => {
      const list = [...semenReport];
      list[index][e.target.name] = e.target.value;
      setSemenReport(list);
    };

    const addSemenReport = () => {
      const now = new Date();
      const currentDateTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);
      setSemenReport([
        ...semenReport,
        {
          donorId: donorId,
          stage: personalInfo.status || "Unknown", // Capture Stage
          dateAndTime: currentDateTime,
          media: "",
          volumne: "", // Preserving your original spelling
          spermConcentration: "",
          million: "",
          morphology: "",
          progressiveMotilityA: "",
          progressiveMotilityB: "",
          progressiveMotilityC: "",
          abnormality: "",
          attachmentFile: "",
          attachmentFileName: "",
          attachmentFileType: "",
        },
      ]);
    };

    const removeSemenReport = async (index, semenReportId) => {
      console.log("Removing semen report:", semenReportId);
      if (semenReportId) {
        try {
          await axiosInstance.delete(`deleteSemenReport/${semenReportId}`);
          toast.success("Report Deleted");
        } catch (error) {
          toast.error("Delete failed.");
          return; // Stop if API fails
        }
      }
      const list = [...semenReport];
      list.splice(index, 1);
      setSemenReport(list);
    };

    return (
      <form onSubmit={updateSemen} className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Semen Analysis Reports
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addSemenReport}
              className="text-sm bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
            >
              + Add Report
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Update Semen Reports
            </button>
          </div>
        </div>

        {semenReport.map((report, index) => (
          <div
            key={index}
            className="border p-4 rounded bg-gray-50 relative mb-6 shadow-sm"
          >
            {/* --- HEADER WITH STAGE BADGE --- */}
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <span className="font-bold text-gray-500">
                Semen Report #{index + 1}
              </span>
              <div className="flex items-center gap-3">
                {report.stage && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Stage: {report.stage}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    removeSemenReport(index, report.sampleReportId)
                  }
                  className="text-red-500 hover:text-red-700 text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Hidden ID Field */}
            <input
              type="hidden"
              name="semenReportId"
              value={report.semenReportId || ""}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Date & Time"
                name="dateAndTime"
                type="datetime-local"
                value={report.dateAndTime}
                onChange={(e) => handleSemenChange(index, e)}
              />
              <FormInput
                label="Color"
                name="media"
                value={report.media || ""}
                onChange={(e) => handleSemenChange(index, e)}
              />
              <FormInput
                label="Volume"
                name="volumne"
                value={report.volumne}
                onChange={(e) => handleSemenChange(index, e)}
                type="number"
              />
              <FormInput
                label="Concentration"
                name="spermConcentration"
                value={report.spermConcentration}
                onChange={(e) => handleSemenChange(index, e)}
              />
              <FormInput
                label="Million/ML"
                name="million"
                value={report.million}
                onChange={(e) => handleSemenChange(index, e)}
                type="number"
              />
              <FormInput
                label="Morphology"
                name="morphology"
                value={report.morphology}
                onChange={(e) => handleSemenChange(index, e)}
              />

              <FormInput
                label="MSC"
                name="msc"
                value={report.msc}
                onChange={(e) => handleSemenChange(index, e)}
              />

              <FormFileAttachment
                label="Attachment"
                name="attachment"
                fileName={report.attachmentFileName || ""}
                onChange={(e) => handleAttachmentUpload(e, index, "semen")}
                onRemove={() => handleRemoveAttachment(index, "semen")}
                background="white"
                className="md:col-span-1
                [&>div]:border-blue-400 
                [&>div]:border
                [&>div]:border-2
                [&>div]:hover:bg-blue-100
                [&>label]:font-bold"
                onDownload={() =>
                  downloadFile(
                    report.attachmentFile,
                    report.attachmentFileName,
                    report.attachmentFileType
                  )
                }
                onPreview={
                  ["application/pdf", "image/jpeg", "image/png"].includes(
                    report.attachmentFileType
                  )
                    ? () =>
                        previewFile(
                          report.attachmentFile,
                          report.attachmentFileType
                        )
                    : undefined
                }
              />

              <div className="md:col-span-3 border p-3 rounded bg-white">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progressive Motility (%)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <FormInput
                    label="A %"
                    name="progressiveMotilityA"
                    value={report.progressiveMotilityA}
                    onChange={(e) => handleSemenChange(index, e)}
                    type="number"
                  />
                  <FormInput
                    label="B %"
                    name="progressiveMotilityB"
                    value={report.progressiveMotilityB}
                    onChange={(e) => handleSemenChange(index, e)}
                    type="number"
                  />
                  <FormInput
                    label="C %"
                    name="progressiveMotilityC"
                    value={report.progressiveMotilityC}
                    onChange={(e) => handleSemenChange(index, e)}
                    type="number"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <FormTextarea
                  label="Abnormality"
                  name="abnormality"
                  value={report.abnormality}
                  onChange={(e) => handleSemenChange(index, e)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
      </form>
    );
  };

  const renderSampleReport = () => (
    <form onSubmit={updateSample} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Sample Storage Details
        </h3>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update Sample Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="Tank No"
          name="tankNo"
          value={sampleReport.tankNo}
          onChange={(e) => handleObjectChange(e, setSampleReport)}
        />
        <FormInput
          label="Cane No"
          name="caneNo"
          value={sampleReport.caneNo || ""}
          onChange={(e) => handleObjectChange(e, setSampleReport)}
        />
        <FormInput
          label="Canister No"
          name="canisterNo"
          value={sampleReport.canisterNo}
          onChange={(e) => handleObjectChange(e, setSampleReport)}
        />
        <FormInput
          label="No. of Vials"
          name="numberOfVials"
          type="number"
          value={sampleReport.numberOfVials}
          onChange={(e) => {
            const { value } = e.target;
            setSampleReport((prev) => ({
              ...prev,
              numberOfVials: value,
              balancedVials: value,
            }));
          }}
        />
        <FormInput
          label="Balanced Vials"
          name="balancedVials"
          type="number"
          value={sampleReport.balancedVials}
          onChange={(e) => handleObjectChange(e, setSampleReport)}
          disabled={true}
        />
        <div className="md:col-span-3">
          <FormTextarea
            label="Remarks"
            name="remarks"
            value={sampleReport.remarks}
            onChange={(e) => handleObjectChange(e, setSampleReport)}
            rows={3}
          />
        </div>
      </div>
    </form>
  );

  const renderLinkedFamilyList = () => (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Vial Allocation History
        </h3>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading history...</p>
        </div>
      ) : allocations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No donations have been made to any families yet.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Family UIN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Husbund Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wife Name
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {allocation.familyUin || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {allocation.husbandName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {allocation.wifeName || "N/A"}
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
    if (loading && Object.keys(personalInfo).length === 0)
      return <div className="p-4 text-center">Loading...</div>;

    switch (activeTab) {
      case "personal":
        return renderPersonalInformation();
      case "family":
        return renderFamilyInformation();
      case "blood":
        return renderBloodReports();
      case "semen":
        return renderSemenReport();
      case "sample":
        return renderSampleReport();
      case "linkedFamily":
        return renderLinkedFamilyList();
      default:
        return renderPersonalInformation();
    }
  };

  if (loading && !personalInfo.name) {
    return (
      <LayoutComponent>
        <EditDonorPageSkeleton />
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="">
          <div className="flex items-center gap-2 mb-2">
            {role === "ROLE_ADMIN" && (
              <button
                onClick={() => {
                  if (role === "ROLE_ADMIN") navigate("/Admin/donorList");
                  else if (role === "ROLE_EMPLOYEE")
                    navigate("/Employee/donorList");
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
                Back to Donor List
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Donor</h1>
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

        <div className="flex-1 overflow-y-auto h-[72vh] CRM-scroll-width-none mt-4">
          <div className="p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-wrap items-center gap-3 mt-1 py-1 px-4">
                <div>
                  <span className="text-lg font-semibold text-gray-700">
                    {personalInfo.name || "Unknown Name"}
                  </span>

                  <div className="text-sm text-gray-500 font-mono">
                    UIN: {personalInfo.uin || "Unknown UIN"}
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-base font-medium border bg-indigo-50 text-indigo-700 border-indigo-200 ml-auto">
                  {personalInfo.status || "New Donor"}
                </span>
              </div>
              <div className="border-b border-gray-200">
                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500">
                  {visibleTabs.map((tab) => (
                    <li key={tab.id} className="me-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-block p-4 rounded-t-lg transition-colors duration-200 ${
                          activeTab === tab.id
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
              <div className="p-6">{renderTabContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}

export default EditDonar;
