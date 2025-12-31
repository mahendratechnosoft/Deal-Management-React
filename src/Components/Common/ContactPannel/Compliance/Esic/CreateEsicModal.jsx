import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
} from "../../../../BaseComponet/CustomerFormInputs";
import axiosInstance from "../../../../BaseComponet/axiosInstance";

function CreateEsicModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [tabErrors, setTabErrors] = useState({});
  const [familyMembers, setFamilyMembers] = useState([]);
  const fileInputRefs = useRef({});

  // Refs for focusing on error fields
  const errorFieldRefs = useRef({});

  const [formData, setFormData] = useState({
    name: "",
    dateOfJoining: "",
    esicNumber: "",
    dateOfBirth: "",
    fatherName: "",
    phone: "",
    gender: "Male",
    isMarried: false,
    aadhaarNumber: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    presentAddress: "",
    permantAddress: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineeAdhaar: "",
    aadhaarPhoto: null,
    passportPhoto: null,

    aadhaarPhotoBack: null, // NEW: Aadhaar back side
    panPhoto: null,         // NEW: PAN/License

    grossSalary: "",

  });

  const [errors, setErrors] = useState({});

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const relationOptions = [
    { value: "Wife", label: "Wife" },
    { value: "Husband", label: "Husband" },
    { value: "Son", label: "Son" },
    { value: "Daughter", label: "Daughter" },
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Brother", label: "Brother" },
    { value: "Sister", label: "Sister" },
    { value: "Grandfather", label: "Grandfather" },
    { value: "Grandmother", label: "Grandmother" },
  ];

  // Tabs configuration
  const tabs = [
    {
      id: "basic",
      label: "Basic Information",
      fields: [
        "name",
        "fatherName",
        "dateOfJoining",
        "dateOfBirth",
        "esicNumber",
        "grossSalary", // NEW: Add gross salary to basic tab
      ],
    },
    {
      id: "personal",
      label: "Personal Details",
      fields: ["phone", "gender", "isMarried", "aadhaarNumber"],
    },
    {
      id: "address",
      label: "Address Details",
      fields: ["presentAddress", "permantAddress"],
    },
    {
      id: "nominee",
      label: "Nominee Details",
      fields: ["nomineeName", "nomineeRelation", "nomineeAdhaar"],
    },
    {
      id: "bank",
      label: "Bank Details",
      fields: ["accountHolderName", "bankName", "accountNumber", "ifsc"],
    },
    {
      id: "documents",
      label: "Documents",
      fields: [
        "aadhaarPhoto",
        "aadhaarPhotoBack", // NEW: Aadhaar back side
        "panPhoto",         // NEW: PAN/License
        "passportPhoto"
      ],
    },
    {
      id: "family",
      label: "Family Members",
      fields: ["familyMembers"],
    },
  ];

  // Update tab errors when errors change
  useEffect(() => {
    const newTabErrors = {};

    tabs.forEach((tab) => {
      const hasError = tab.fields.some((field) => {
        return errors[field];
      });

      newTabErrors[tab.id] = hasError;
    });

    setTabErrors(newTabErrors);
  }, [errors]);

  // Focus on the first error field
  const focusOnFirstError = (newErrors) => {
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      let errorTab = "basic";

      // Determine which tab contains the error
      if (
        [
          "name",
          "fatherName",
          "dateOfJoining",
          "dateOfBirth",
          "esicNumber",
          "grossSalary", // NEW: Add gross salary
        ].includes(firstErrorKey)
      ) {
        errorTab = "basic";
      } else if (
        ["phone", "gender", "isMarried", "aadhaarNumber"].includes(
          firstErrorKey
        )
      ) {
        errorTab = "personal";
      } else if (
        ["presentAddress", "permantAddress"].includes(firstErrorKey)
      ) {
        errorTab = "address";
      } else if (
        ["nomineeName", "nomineeRelation", "nomineeAdhaar"].includes(
          firstErrorKey
        )
      ) {
        errorTab = "nominee";
      } else if (
        ["accountHolderName", "bankName", "accountNumber", "ifsc"].includes(
          firstErrorKey
        )
      ) {
        errorTab = "bank";
      } else if (
        ["aadhaarPhoto", "aadhaarPhotoBack", "panPhoto", "passportPhoto"].includes(firstErrorKey) // UPDATED
      ) {
        errorTab = "documents";
      } else if (firstErrorKey.startsWith("familyMember_")) {
        errorTab = "family";
      }

      setActiveTab(errorTab);

      setTimeout(() => {
        const fieldRef = errorFieldRefs.current[firstErrorKey];
        if (fieldRef && fieldRef.focus) {
          fieldRef.focus();
          fieldRef.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file attachment for main documents
  const handleFileChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (!file) return;

     const maxSize = 200 * 1024; // 200KB
  if (file.size > maxSize) {
    toast.error("File size exceeds 200KB limit");
    return;
  }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image file.");
      return;
    }

    const newAttachment = {
      id: Date.now(),
      file: file,
      fileName: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
    };

    setFormData((prev) => ({
      ...prev,
      [fieldName]: newAttachment,
    }));

    // Clear any previous error
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    toast.success(
      `${fieldName === "aadhaarPhoto" ? "Aadhaar" : "Passport"
      } photo uploaded successfully`
    );

    // Reset file input
    if (fileInputRefs.current[fieldName]) {
      fileInputRefs.current[fieldName].value = "";
    }
  };

  // Handle file attachment for family members
  // Update the handleFamilyFileChange function to support aadhaarPhotoBack:
  const handleFamilyFileChange = (index, fieldName, e) => {
    const file = e.target.files[0];
    if (!file) return;

const maxSize = 200 * 1024; // 200KB
  if (file.size > maxSize) {
    toast.error("File size exceeds 200KB limit");
    return;
  }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image file.");
      return;
    }

    const newAttachment = {
      id: Date.now(),
      file: file,
      fileName: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
    };

    setFamilyMembers((prev) =>
      prev.map((member, i) =>
        i === index ? { ...member, [fieldName]: newAttachment } : member
      )
    );

    // Update success message based on field type
    let fieldDisplayName = "";
    if (fieldName === "aadhaarPhoto") fieldDisplayName = "Aadhaar front";
    else if (fieldName === "aadhaarPhotoBack") fieldDisplayName = "Aadhaar back";
    else if (fieldName === "passportPhoto") fieldDisplayName = "Passport";

    toast.success(`Family member ${fieldDisplayName} photo uploaded successfully`);

    // Reset file input
    if (fileInputRefs.current[`family_${index}_${fieldName}`]) {
      fileInputRefs.current[`family_${index}_${fieldName}`].value = "";
    }
  };

  // Preview attachment
  const handlePreviewAttachment = (attachment) => {
    if (!attachment) return;
    try {
      const blobUrl = URL.createObjectURL(attachment.file);
      const newWindow = window.open(blobUrl, "_blank");
      if (newWindow) {
        newWindow.focus();
        newWindow.onload = () => {
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 1000);
        };
        setTimeout(() => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (e) { }
        }, 5000);
      } else {
        toast.error("Popup blocked. Please allow popups to preview image.");
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
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
          modal.onclick = () => document.body.removeChild(modal);
          document.body.appendChild(modal);
        };
        reader.readAsDataURL(attachment.file);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      }
    } catch (error) {
      console.error("Error previewing attachment:", error);
      toast.error("Failed to preview image");
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (fieldName) => {
    const attachment = formData[fieldName];
    if (attachment) {
      if (attachment.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      setFormData((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
      toast.success(
        `${fieldName === "aadhaarPhoto" ? "Aadhaar" : "Passport"} photo removed`
      );
    }
  };

  // Remove family member attachment
  // Add support for aadhaarPhotoBack in handleRemoveFamilyAttachment:
  const handleRemoveFamilyAttachment = (index, fieldName) => {
    setFamilyMembers((prev) =>
      prev.map((member, i) => {
        if (i === index && member[fieldName]) {
          if (member[fieldName].preview) {
            URL.revokeObjectURL(member[fieldName].preview);
          }
          return { ...member, [fieldName]: null };
        }
        return member;
      })
    );

    let fieldDisplayName = "";
    if (fieldName === "aadhaarPhoto") fieldDisplayName = "Aadhaar front";
    else if (fieldName === "aadhaarPhotoBack") fieldDisplayName = "Aadhaar back";
    else if (fieldName === "passportPhoto") fieldDisplayName = "Passport";

    toast.success(`Family member ${fieldDisplayName} removed`);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up main document URLs
      if (formData.aadhaarPhoto?.preview) {
        URL.revokeObjectURL(formData.aadhaarPhoto.preview);
      }
      if (formData.aadhaarPhotoBack?.preview) { // NEW
        URL.revokeObjectURL(formData.aadhaarPhotoBack.preview);
      }
      if (formData.panPhoto?.preview) { // NEW
        URL.revokeObjectURL(formData.panPhoto.preview);
      }
      if (formData.passportPhoto?.preview) {
        URL.revokeObjectURL(formData.passportPhoto.preview);
      }

      // Clean up family member URLs
      familyMembers.forEach((member) => {
        if (member.aadhaarPhoto?.preview) {
          URL.revokeObjectURL(member.aadhaarPhoto.preview);
        }
        if (member.aadhaarPhotoBack?.preview) { // Add this
          URL.revokeObjectURL(member.aadhaarPhotoBack.preview);
        }

        if (member.passportPhoto?.preview) {
          URL.revokeObjectURL(member.passportPhoto.preview);
        }
      });
    };
  }, [formData, familyMembers]);

  // Convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    switch (name) {
      case "name":
      case "fatherName":
      case "accountHolderName":
      case "bankName":
      case "nomineeName":
        if (/^[a-zA-Z\s]*$/.test(value) || value === "") {
          if (value.length <= 100) {
            processedValue = value;
          }
        }
        break;
      case "esicNumber":
        if (/^\d{0,17}$/.test(value)) {
          processedValue = value;
        }
        break;
      case "phone":
        // For phone input field with country code, we'll handle separately
        processedValue = value;
        break;
      case "aadhaarNumber":
      case "nomineeAdhaar":
        if (/^\d{0,12}$/.test(value)) {
          processedValue = value;
        }
        break;
      case "accountNumber":
        if (/^\d{0,20}$/.test(value)) {
          processedValue = value;
        }
        break;
      case "ifsc":
        if (/^[A-Z0-9]{0,11}$/.test(value.toUpperCase())) {
          processedValue = value.toUpperCase();
        }
        break;
      case "presentAddress":
      case "permantAddress":
        if (value.length <= 500) {
          processedValue = value;
        }
        break;
      case "grossSalary": // NEW: Add gross salary validation
        if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
          processedValue = value;
        }
        break;
      default:
        processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle phone number change with country code
  const handlePhoneChange = (phoneNumber) => {
    setFormData((prev) => ({
      ...prev,
      phone: phoneNumber,
    }));

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

  const addFamilyMember = () => {
    setFamilyMembers((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: "",
        relation: "",
        aadhaarPhoto: null,
        aadhaarPhotoBack: null, // Add this line for back side
        passportPhoto: null,
      },
    ]);
  };

  // Remove family member
  const removeFamilyMember = (index) => {
    const member = familyMembers[index];
    if (member.aadhaarPhoto?.preview) {
      URL.revokeObjectURL(member.aadhaarPhoto.preview);
    }
    if (member.passportPhoto?.preview) {
      URL.revokeObjectURL(member.passportPhoto.preview);
    }
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle family member field change
  const handleFamilyMemberChange = (index, fieldName, value) => {
    setFamilyMembers((prev) =>
      prev.map((member, i) =>
        i === index ? { ...member, [fieldName]: value } : member
      )
    );

    // Clear error for this field if it exists
    const errorKey = `familyMember_${index}_${fieldName}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (name.length > 100) return "Name cannot exceed 100 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return "Name can only contain letters and spaces";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return "Phone number is required";
    if (!phone.startsWith("+"))
      return "Please enter a valid phone number with country code";
    if (phone.replace(/\D/g, "").length < 10)
      return "Phone number must be at least 10 digits";
    return "";
  };

  const validateAadhaar = (aadhaar, fieldName = "Aadhaar") => {
    if (!aadhaar.trim()) return `${fieldName} number is required`;
    if (!/^\d{12}$/.test(aadhaar))
      return `${fieldName} number must be 12 digits`;
    return "";
  };

  const validateESICNumber = (esicNumber) => {
    // If empty, it's okay (not required)
    if (!esicNumber || esicNumber.trim() === "") {
      return "";
    }

    // If provided, validate format
    if (!/^\d{17}$/.test(esicNumber)) {
      return "ESIC number must be 17 digits if provided";
    }
    return "";
  };

  const validateBankAccount = (account) => {
    if (!account.trim()) return "Account number is required";
    if (!/^\d{9,20}$/.test(account))
      return "Account number must be 9-20 digits";
    return "";
  };

  const validateIFSC = (ifsc) => {
    if (!ifsc.trim()) return "IFSC code is required";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc))
      return "Invalid IFSC format (e.g., SBIN0000456)";
    return "";
  };

  const validateRequired = (fieldName, value, displayName) => {
    if (!value.trim()) return `${displayName} is required`;
    return "";
  };

  const validateDate = (fieldName, value, displayName) => {
    if (!value) return `${displayName} is required`;
    const date = new Date(value);
    const today = new Date();

    if (fieldName === "dateOfBirth") {
      const minAgeDate = new Date();
      minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
      if (date > minAgeDate) return "Employee must be at least 18 years old";
    }

    if (fieldName === "dateOfJoining") {
      if (date > today) return "Date of joining cannot be in the future";
    }

    return "";
  };

  const validateAddress = (address, fieldName) => {
    if (!address.trim()) return `${fieldName} is required`;

    if (address.length > 500)
      return `${fieldName} cannot exceed 500 characters`;
    return "";
  };

  // Main validation function
  const validateForm = () => {
    const newErrors = {};

    // Basic information
    newErrors.name = validateName(formData.name);

    if (formData.fatherName && formData.fatherName.trim() !== "") {
      if (formData.fatherName.length > 100) {
        newErrors.fatherName = "Father's name cannot exceed 100 characters";
      } else if (!/^[a-zA-Z\s]*$/.test(formData.fatherName.trim())) {
        newErrors.fatherName = "Father's name can only contain letters and spaces";
      }
    }

    newErrors.dateOfJoining = validateDate(
      "dateOfJoining",
      formData.dateOfJoining,
      "Date of joining"
    );
    newErrors.dateOfBirth = validateDate(
      "dateOfBirth",
      formData.dateOfBirth,
      "Date of birth"
    );

    if (formData.esicNumber && formData.esicNumber.trim() !== "") {
      newErrors.esicNumber = validateESICNumber(formData.esicNumber);
    }

    // NEW: Gross Salary validation
    newErrors.grossSalary = validateRequired(
      "grossSalary",
      formData.grossSalary,
      "Gross salary"
    );

    // Optional: Add numeric validation
    if (formData.grossSalary && !/^\d+(\.\d{1,2})?$/.test(formData.grossSalary)) {
      newErrors.grossSalary = "Please enter a valid salary amount (e.g., 50000 or 50000.50)";
    }

    // Personal details
    newErrors.phone = validatePhone(formData.phone);
    newErrors.aadhaarNumber = validateAadhaar(formData.aadhaarNumber);

    // Address details
    newErrors.presentAddress = validateAddress(
      formData.presentAddress,
      "Present address"
    );
    newErrors.permantAddress = validateAddress(
      formData.permantAddress,
      "Permanent address"
    );

    // Nominee details
    newErrors.nomineeName = validateRequired(
      "nomineeName",
      formData.nomineeName,
      "Nominee name"
    );
    newErrors.nomineeRelation = validateRequired(
      "nomineeRelation",
      formData.nomineeRelation,
      "Nominee relation"
    );
    newErrors.nomineeAdhaar = validateAadhaar(
      formData.nomineeAdhaar,
      "Nominee Aadhaar"
    );

    // Bank information
    newErrors.accountHolderName = validateRequired(
      "accountHolderName",
      formData.accountHolderName,
      "Account holder name"
    );
    newErrors.bankName = validateRequired(
      "bankName",
      formData.bankName,
      "Bank name"
    );
    newErrors.accountNumber = validateBankAccount(formData.accountNumber);
    newErrors.ifsc = validateIFSC(formData.ifsc);

    // Validate date order
    if (formData.dateOfJoining && formData.dateOfBirth) {
      const joinDate = new Date(formData.dateOfJoining);
      const birthDate = new Date(formData.dateOfBirth);
      if (joinDate < birthDate) {
        newErrors.dateOfJoining =
          "Date of joining cannot be before date of birth";
      }
    }

    // Document validation - UPDATED
    if (!formData.aadhaarPhoto) {
      newErrors.aadhaarPhoto = "Aadhaar front photo is required";
    }
    if (!formData.aadhaarPhotoBack) {
      newErrors.aadhaarPhotoBack = "Aadhaar back side is required";
    }
    if (!formData.panPhoto) {
      newErrors.panPhoto = "PAN Card or License is required";
    }
    if (!formData.passportPhoto) {
      newErrors.passportPhoto = "Passport photo is required";
    }

    // Validate family members
    // In the validateForm function, update family member validation:
    familyMembers.forEach((member, index) => {
      if (!member.name.trim()) {
        newErrors[`familyMember_${index}_name`] =
          "Family member name is required";
      }
      if (!member.relation) {
        newErrors[`familyMember_${index}_relation`] = "Relation is required";
      }
      if (!member.aadhaarPhoto) {
        newErrors[`familyMember_${index}_aadhaarPhoto`] =
          "Aadhaar front photo is required";
      }
      if (!member.aadhaarPhotoBack) {
        newErrors[`familyMember_${index}_aadhaarPhotoBack`] =
          "Aadhaar back side is required";
      }
      if (!member.passportPhoto) {
        newErrors[`familyMember_${index}_passportPhoto`] =
          "Passport photo is required";
      }
    });

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors(filteredErrors);

    // Focus on first error if any
    if (Object.keys(filteredErrors).length > 0) {
      focusOnFirstError(filteredErrors);
    }

    return Object.keys(filteredErrors).length === 0;
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all form errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      // Convert main documents to base64
      const aadhaarPhotoBase64 = formData.aadhaarPhoto
        ? await convertFileToBase64(formData.aadhaarPhoto.file)
        : null;
      const aadhaarPhotoBackBase64 = formData.aadhaarPhotoBack // NEW
        ? await convertFileToBase64(formData.aadhaarPhotoBack.file)
        : null;
      const panPhotoBase64 = formData.panPhoto // NEW
        ? await convertFileToBase64(formData.panPhoto.file)
        : null;
      const passportPhotoBase64 = formData.passportPhoto
        ? await convertFileToBase64(formData.passportPhoto.file)
        : null;

      // Convert family member documents to base64
      // In handleSubmit function, update the family member payload:
      const esicContents = await Promise.all(
        familyMembers.map(async (member) => {
          const aadhaarBase64 = member.aadhaarPhoto
            ? await convertFileToBase64(member.aadhaarPhoto.file)
            : null;
          const aadhaarBackBase64 = member.aadhaarPhotoBack // Add this
            ? await convertFileToBase64(member.aadhaarPhotoBack.file)
            : null;
          const passportBase64 = member.passportPhoto
            ? await convertFileToBase64(member.passportPhoto.file)
            : null;

          return {
            name: member.name.trim(),
            relation: member.relation,
            aadhaarPhoto: aadhaarBase64,
            aadhaarPhotoBack: aadhaarBackBase64, // Add this
            passportPhoto: passportBase64,
          };
        })
      );

      const payload = {
        esic: {
          name: formData.name.trim(),
          dateOfJoining: formData.dateOfJoining,
          esicNumber: formData.esicNumber,
          dateOfBirth: formData.dateOfBirth,
          fatherName: formData.fatherName.trim(),
          phone: formData.phone,
          gender: formData.gender,
          isMarried: formData.isMarried,
          aadhaarNumber: formData.aadhaarNumber,
          accountHolderName: formData.accountHolderName.trim(),
          bankName: formData.bankName.trim(),
          accountNumber: formData.accountNumber,
          ifsc: formData.ifsc,
          presentAddress: formData.presentAddress.trim(),
          permantAddress: formData.permantAddress.trim(),
          nomineeName: formData.nomineeName.trim(),
          nomineeRelation: formData.nomineeRelation,
          nomineeAdhaar: formData.nomineeAdhaar,
          grossSalary: formData.grossSalary, // NEW
          aadhaarPhoto: aadhaarPhotoBase64,
          aadhaarPhotoBack: aadhaarPhotoBackBase64, // NEW
          panPhoto: panPhotoBase64, // NEW
          passportPhoto: passportPhotoBase64,
        },
        esicContents: esicContents,
      };

      const response = await axiosInstance.post("createEsic", payload);

      if (response.data) {
        toast.success("ESIC record created successfully!");
        onSuccess(response.data);
        onClose();
      } else {
        throw new Error("No response data received");
      }
    } catch (error) {
      console.error("Error creating ESIC record:", error);
      if (error.response) {
        if (error.response.status === 500) {
          toast.error(
            "Server error: " +
            (error.response.data?.message || "Check console for details")
          );
        } else if (error.response.status === 400) {
          toast.error(
            "Validation error: " +
            (error.response.data?.message || "Please check all fields")
          );
        } else {
          toast.error(
            "Failed to create ESIC record: " +
            (error.response.data?.message || "Unknown error")
          );
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to create ESIC record. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  // Get today's date for date restrictions
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Calculate max date for date of birth (18 years ago)
  const getMaxBirthDate = () => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return maxDate.toISOString().split("T")[0];
  };

  // Handle next button click
  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  // Check if current tab is last tab
  const isLastTab = () => {
    return activeTab === tabs[tabs.length - 1].id;
  };

  // Check if current tab is first tab
  const isFirstTab = () => {
    return activeTab === tabs[0].id;
  };

  const renderBasicTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Employee Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required={true}
          error={errors.name}
          placeholder="Enter full name"
          maxLength={100}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.name = el)}
        />
        <GlobalInputField
          label="Father's Name"
          name="fatherName"
          value={formData.fatherName}
          onChange={handleChange}
          error={errors.fatherName}
          placeholder="Enter father's name"
          maxLength={100}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.fatherName = el)}
        />
        <GlobalInputField
          label="Date of Joining"
          name="dateOfJoining"
          type="date"
          value={formData.dateOfJoining}
          onChange={handleChange}
          required={true}
          error={errors.dateOfJoining}
          max={getTodayDate()}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.dateOfJoining = el)}
        />
        <GlobalInputField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required={true}
          error={errors.dateOfBirth}
          max={getMaxBirthDate()}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.dateOfBirth = el)}
        />
        <GlobalInputField
          label="Gross Salary (₹)"
          name="grossSalary"
          value={formData.grossSalary}
          onChange={handleChange}
          required={true}
          error={errors.grossSalary}
          placeholder="e.g., 50000.00"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.grossSalary = el)}
        />
        <GlobalInputField
          label="ESIC Number"
          name="esicNumber"
          value={formData.esicNumber}
          onChange={handleChange}
          required={false}
          error={errors.esicNumber}
          placeholder="17 digit ESIC number (Optional)"
          maxLength={17}
          pattern="\d{17}"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.esicNumber = el)}
        />
      </div>
    </div>
  );
  // Render Personal Details Tab
  const renderPersonalTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span>Phone Number</span>
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div
            className={`phone-input-wrapper ${errors.phone ? "border-red-500 rounded-lg" : ""
              }`}
          >
            <PhoneInput
              country={"in"}
              value={formData.phone || ""}
              onChange={(value, country, e, formattedValue) => {
                const completeNumber = value.startsWith("+")
                  ? value
                  : `+${value}`;
                handlePhoneChange(completeNumber);
              }}
              enableSearch={true}
              placeholder="Enter phone number"
              inputClass="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              buttonClass="!border-r-0 !rounded-l"
              inputStyle={{
                width: "100%",
                height: "40px",
                borderLeft: "none",
                borderTopLeftRadius: "0",
                borderBottomLeftRadius: "0",
              }}
              buttonStyle={{
                borderRight: "none",
                borderTopRightRadius: "0",
                borderBottomRightRadius: "0",
                height: "40px",
              }}
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.phone}
            </p>
          )}
        </div>

        <GlobalSelectField
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={genderOptions}
          className="text-sm"
        />

        <GlobalInputField
          label="Aadhaar Number"
          name="aadhaarNumber"
          value={formData.aadhaarNumber}
          onChange={handleChange}
          required={true}
          error={errors.aadhaarNumber}
          placeholder="12 digit Aadhaar"
          maxLength={12}
          pattern="\d{12}"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.aadhaarNumber = el)}
        />

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Marital Status
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                name="isMarried"
                checked={formData.isMarried}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Married</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Address Tab
  const renderAddressTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <GlobalTextAreaField
          label="Present Address"
          name="presentAddress"
          value={formData.presentAddress}
          onChange={handleChange}
          required={true}
          error={errors.presentAddress}
          placeholder="Enter complete present address"
          rows={4}
          maxLength={500}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.presentAddress = el)}
        />
        <GlobalTextAreaField
          label="Permanent Address"
          name="permantAddress"
          value={formData.permantAddress}
          onChange={handleChange}
          required={true}
          error={errors.permantAddress}
          placeholder="Enter complete permanent address"
          rows={4}
          maxLength={500}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.permantAddress = el)}
        />
      </div>
    </div>
  );

  // Render Nominee Tab
  const renderNomineeTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Nominee Name"
          name="nomineeName"
          value={formData.nomineeName}
          onChange={handleChange}
          required={true}
          error={errors.nomineeName}
          placeholder="Enter nominee name"
          maxLength={100}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.nomineeName = el)}
        />
        <GlobalSelectField
          label="Nominee Relation"
          name="nomineeRelation"
          value={formData.nomineeRelation}
          onChange={handleChange}
          options={relationOptions}
          required={true}
          error={errors.nomineeRelation}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.nomineeRelation = el)}
        />
        <GlobalInputField
          label="Nominee Aadhaar Number"
          name="nomineeAdhaar"
          value={formData.nomineeAdhaar}
          onChange={handleChange}
          required={true}
          error={errors.nomineeAdhaar}
          placeholder="12 digit Aadhaar"
          maxLength={12}
          pattern="\d{12}"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.nomineeAdhaar = el)}
        />
      </div>
    </div>
  );

  // Render Bank Tab
  const renderBankTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Account Holder Name"
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleChange}
          required={true}
          error={errors.accountHolderName}
          placeholder="Name as per bank record"
          maxLength={100}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.accountHolderName = el)}
        />
        <GlobalInputField
          label="Bank Name"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          required={true}
          error={errors.bankName}
          placeholder="Bank name"
          maxLength={100}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.bankName = el)}
        />
        <GlobalInputField
          label="Account Number"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          required={true}
          error={errors.accountNumber}
          placeholder="9-20 digit account number"
          maxLength={20}
          pattern="\d{9,20}"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.accountNumber = el)}
        />
        <GlobalInputField
          label="IFSC Code"
          name="ifsc"
          value={formData.ifsc}
          onChange={handleChange}
          required={true}
          error={errors.ifsc}
          placeholder="SBIN0000456"
          maxLength={11}
          pattern="[A-Z]{4}0[A-Z0-9]{6}"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.ifsc = el)}
        />
      </div>
    </div>
  );

  // Render Documents Tab
  const renderDocumentsTab = () => (
    <div className="space-y-6">
      {/* Aadhaar Front Photo Upload */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Aadhaar Front Photo
        </h3>
        <div className="relative">
          <input
            ref={(el) => (fileInputRefs.current.aadhaarPhoto = el)}
            type="file"
            onChange={(e) => handleFileChange("aadhaarPhoto", e)}
            className="hidden"
            id="aadhaar-upload"
            accept="image/*"
          />
          <label
            htmlFor="aadhaar-upload"
            className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formData.aadhaarPhoto
              ? "bg-green-50 border-green-300 hover:border-green-400"
              : errors.aadhaarPhoto
                ? "bg-red-50 border-red-300 hover:border-red-400"
                : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
              }`}
          >
            <div className="text-center">
              <svg
                className={`w-8 h-8 mx-auto mb-2 ${formData.aadhaarPhoto
                  ? "text-green-500"
                  : errors.aadhaarPhoto
                    ? "text-red-500"
                    : "text-gray-400"
                  }`}
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
              <p
                className={`text-sm ${formData.aadhaarPhoto
                  ? "text-green-700"
                  : errors.aadhaarPhoto
                    ? "text-red-700"
                    : "text-gray-600"
                  }`}
              >
                {formData.aadhaarPhoto
                  ? "Aadhaar front photo uploaded ✓"
                  : "Click to upload Aadhaar front photo"}
              </p>
            <p className="text-xs text-gray-500 mt-1">
  JPEG, PNG, GIF, WebP, BMP (Max 200KB)
</p>
            </div>
          </label>
        </div>
        {errors.aadhaarPhoto && (
          <p className="mt-2 text-xs text-red-600">{errors.aadhaarPhoto}</p>
        )}

        {formData.aadhaarPhoto && (
          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded border border-gray-200 overflow-hidden">
                  <img
                    src={formData.aadhaarPhoto.preview}
                    alt="Aadhaar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    {formData.aadhaarPhoto.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(formData.aadhaarPhoto.size)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePreviewAttachment(formData.aadhaarPhoto)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                  title="Preview"
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
                  onClick={() => handleRemoveAttachment("aadhaarPhoto")}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                  title="Remove"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Aadhaar Back Photo Upload */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Aadhaar Back Photo
        </h3>
        <div className="relative">
          <input
            ref={(el) => (fileInputRefs.current.aadhaarPhotoBack = el)}
            type="file"
            onChange={(e) => handleFileChange("aadhaarPhotoBack", e)}
            className="hidden"
            id="aadhaar-back-upload"
            accept="image/*"
          />
          <label
            htmlFor="aadhaar-back-upload"
            className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formData.aadhaarPhotoBack
              ? "bg-green-50 border-green-300 hover:border-green-400"
              : errors.aadhaarPhotoBack
                ? "bg-red-50 border-red-300 hover:border-red-400"
                : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
              }`}
          >
            <div className="text-center">
              <svg
                className={`w-8 h-8 mx-auto mb-2 ${formData.aadhaarPhotoBack
                  ? "text-green-500"
                  : errors.aadhaarPhotoBack
                    ? "text-red-500"
                    : "text-gray-400"
                  }`}
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
              <p
                className={`text-sm ${formData.aadhaarPhotoBack
                  ? "text-green-700"
                  : errors.aadhaarPhotoBack
                    ? "text-red-700"
                    : "text-gray-600"
                  }`}
              >
                {formData.aadhaarPhotoBack
                  ? "Aadhaar back photo uploaded ✓"
                  : "Click to upload Aadhaar back photo"}
              </p>
           <p className="text-xs text-gray-500 mt-1">
  JPEG, PNG, GIF, WebP, BMP (Max 200KB)
</p>
            </div>
          </label>
        </div>
        {errors.aadhaarPhotoBack && (
          <p className="mt-2 text-xs text-red-600">{errors.aadhaarPhotoBack}</p>
        )}

        {formData.aadhaarPhotoBack && (
          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded border border-gray-200 overflow-hidden">
                  <img
                    src={formData.aadhaarPhotoBack.preview}
                    alt="Aadhaar back preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    {formData.aadhaarPhotoBack.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(formData.aadhaarPhotoBack.size)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePreviewAttachment(formData.aadhaarPhotoBack)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                  title="Preview"
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
                  onClick={() => handleRemoveAttachment("aadhaarPhotoBack")}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                  title="Remove"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PAN/License Photo Upload */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          PAN Card or License
        </h3>
        <div className="relative">
          <input
            ref={(el) => (fileInputRefs.current.panPhoto = el)}
            type="file"
            onChange={(e) => handleFileChange("panPhoto", e)}
            className="hidden"
            id="pan-upload"
            accept="image/*"
          />
          <label
            htmlFor="pan-upload"
            className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formData.panPhoto
              ? "bg-green-50 border-green-300 hover:border-green-400"
              : errors.panPhoto
                ? "bg-red-50 border-red-300 hover:border-red-400"
                : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
              }`}
          >
            <div className="text-center">
              <svg
                className={`w-8 h-8 mx-auto mb-2 ${formData.panPhoto
                  ? "text-green-500"
                  : errors.panPhoto
                    ? "text-red-500"
                    : "text-gray-400"
                  }`}
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
              <p
                className={`text-sm ${formData.panPhoto
                  ? "text-green-700"
                  : errors.panPhoto
                    ? "text-red-700"
                    : "text-gray-600"
                  }`}
              >
                {formData.panPhoto
                  ? "PAN/License uploaded ✓"
                  : "Click to upload PAN Card or License"}
              </p>
             <p className="text-xs text-gray-500 mt-1">
  JPEG, PNG, GIF, WebP, BMP (Max 200KB)
</p>
            </div>
          </label>
        </div>
        {errors.panPhoto && (
          <p className="mt-2 text-xs text-red-600">{errors.panPhoto}</p>
        )}

        {formData.panPhoto && (
          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded border border-gray-200 overflow-hidden">
                  <img
                    src={formData.panPhoto.preview}
                    alt="PAN/License preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    {formData.panPhoto.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(formData.panPhoto.size)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePreviewAttachment(formData.panPhoto)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                  title="Preview"
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
                  onClick={() => handleRemoveAttachment("panPhoto")}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                  title="Remove"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Passport Photo Upload - Keep existing */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Passport Photo
        </h3>
        <div className="relative">
          <input
            ref={(el) => (fileInputRefs.current.passportPhoto = el)}
            type="file"
            onChange={(e) => handleFileChange("passportPhoto", e)}
            className="hidden"
            id="passport-upload"
            accept="image/*"
          />
          <label
            htmlFor="passport-upload"
            className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formData.passportPhoto
              ? "bg-green-50 border-green-300 hover:border-green-400"
              : errors.passportPhoto
                ? "bg-red-50 border-red-300 hover:border-red-400"
                : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
              }`}
          >
            <div className="text-center">
              <svg
                className={`w-8 h-8 mx-auto mb-2 ${formData.passportPhoto
                  ? "text-green-500"
                  : errors.passportPhoto
                    ? "text-red-500"
                    : "text-gray-400"
                  }`}
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
              <p
                className={`text-sm ${formData.passportPhoto
                  ? "text-green-700"
                  : errors.passportPhoto
                    ? "text-red-700"
                    : "text-gray-600"
                  }`}
              >
                {formData.passportPhoto
                  ? "Passport photo uploaded ✓"
                  : "Click to upload Passport photo"}
              </p>
          <p className="text-xs text-gray-500 mt-1">
  JPEG, PNG, GIF, WebP, BMP (Max 200KB)
</p>
            </div>
          </label>
        </div>
        {errors.passportPhoto && (
          <p className="mt-2 text-xs text-red-600">{errors.passportPhoto}</p>
        )}

        {formData.passportPhoto && (
          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded border border-gray-200 overflow-hidden">
                  <img
                    src={formData.passportPhoto.preview}
                    alt="Passport preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    {formData.passportPhoto.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(formData.passportPhoto.size)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handlePreviewAttachment(formData.passportPhoto)
                  }
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                  title="Preview"
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
                  onClick={() => handleRemoveAttachment("passportPhoto")}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                  title="Remove"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  // Render Family Members Tab
  const renderFamilyTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">
          Family Members
        </h3>
        <button
          type="button"
          onClick={addFamilyMember}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Family Member
        </button>
      </div>

      {familyMembers.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <svg
            className="w-12 h-12 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-5.197v1a6 6 0 01-9 5.197"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            No family members added yet
          </p>
          <p className="text-xs text-gray-500">
            Add family members who will be covered under ESIC
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {familyMembers.map((member, index) => (
            <div
              key={member.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Family Member #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeFamilyMember(index)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      handleFamilyMemberChange(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter family member name"
                    ref={(el) =>
                    (errorFieldRefs.current[`familyMember_${index}_name`] =
                      el)
                    }
                  />
                  {errors[`familyMember_${index}_name`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`familyMember_${index}_name`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Relation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={member.relation}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "relation",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ref={(el) =>
                    (errorFieldRefs.current[
                      `familyMember_${index}_relation`
                    ] = el)
                    }
                  >
                    <option value="">Select Relation</option>
                    {relationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors[`familyMember_${index}_relation`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`familyMember_${index}_relation`]}
                    </p>
                  )}
                </div>
              </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      Aadhaar Front <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <input
        ref={(el) =>
          (fileInputRefs.current[`family_${index}_aadhaarPhoto`] = el)
        }
        type="file"
        onChange={(e) =>
          handleFamilyFileChange(index, "aadhaarPhoto", e)
        }
        className="hidden"
        id={`family-aadhaar-front-${index}`}
        accept="image/*"
      />
      <label
        htmlFor={`family-aadhaar-front-${index}`}
        className={`flex items-center justify-center p-3 border border-dashed rounded-lg cursor-pointer transition-colors ${
          member.aadhaarPhoto
            ? "bg-green-50 border-green-300"
            : errors[`familyMember_${index}_aadhaarPhoto`]
            ? "bg-red-50 border-red-300"
            : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
        }`}
      >
        <div className="text-center">
          <svg
            className={`w-6 h-6 mx-auto mb-1 ${
              member.aadhaarPhoto
                ? "text-green-500"
                : errors[`familyMember_${index}_aadhaarPhoto`]
                ? "text-red-500"
                : "text-gray-400"
            }`}
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
          <p
            className={`text-xs ${
              member.aadhaarPhoto ? "text-green-700" : "text-gray-600"
            }`}
          >
            {member.aadhaarPhoto ? "Uploaded ✓" : "Upload Front"}
          </p>
        </div>
      </label>
    </div>
    {errors[`familyMember_${index}_aadhaarPhoto`] && (
      <p className="mt-1 text-xs text-red-600">
        {errors[`familyMember_${index}_aadhaarPhoto`]}
      </p>
    )}

    {member.aadhaarPhoto && (
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded border border-gray-200 overflow-hidden">
            <img
              src={member.aadhaarPhoto.preview}
              alt="Aadhaar front preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-900 truncate max-w-[100px]">
              {member.aadhaarPhoto.fileName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              handlePreviewAttachment(member.aadhaarPhoto)
            }
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Preview"
          >
            <svg
              className="w-3 h-3"
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
            onClick={() =>
              handleRemoveFamilyAttachment(index, "aadhaarPhoto")
            }
            className="p-1 text-gray-400 hover:text-red-600"
            title="Remove"
          >
            <svg
              className="w-3 h-3"
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
        </div>
      </div>
    )}
  </div>

  {/* Aadhaar Back Photo - Keep existing code for back side */}
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      Aadhaar Back <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <input
        ref={(el) =>
          (fileInputRefs.current[`family_${index}_aadhaarPhotoBack`] = el)
        }
        type="file"
        onChange={(e) =>
          handleFamilyFileChange(index, "aadhaarPhotoBack", e)
        }
        className="hidden"
        id={`family-aadhaar-back-${index}`}
        accept="image/*"
      />
      <label
        htmlFor={`family-aadhaar-back-${index}`}
        className={`flex items-center justify-center p-3 border border-dashed rounded-lg cursor-pointer transition-colors ${
          member.aadhaarPhotoBack
            ? "bg-green-50 border-green-300"
            : errors[`familyMember_${index}_aadhaarPhotoBack`]
            ? "bg-red-50 border-red-300"
            : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
        }`}
      >
        <div className="text-center">
          <svg
            className={`w-6 h-6 mx-auto mb-1 ${
              member.aadhaarPhotoBack
                ? "text-green-500"
                : errors[`familyMember_${index}_aadhaarPhotoBack`]
                ? "text-red-500"
                : "text-gray-400"
            }`}
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
          <p
            className={`text-xs ${
              member.aadhaarPhotoBack ? "text-green-700" : "text-gray-600"
            }`}
          >
            {member.aadhaarPhotoBack ? "Uploaded ✓" : "Upload Back"}
          </p>
        </div>
      </label>
    </div>
    {errors[`familyMember_${index}_aadhaarPhotoBack`] && (
      <p className="mt-1 text-xs text-red-600">
        {errors[`familyMember_${index}_aadhaarPhotoBack`]}
      </p>
    )}

    {member.aadhaarPhotoBack && (
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded border border-gray-200 overflow-hidden">
            <img
              src={member.aadhaarPhotoBack.preview}
              alt="Aadhaar back preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-900 truncate max-w-[100px]">
              {member.aadhaarPhotoBack.fileName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              handlePreviewAttachment(member.aadhaarPhotoBack)
            }
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Preview"
          >
            <svg
              className="w-3 h-3"
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
            onClick={() =>
              handleRemoveFamilyAttachment(index, "aadhaarPhotoBack")
            }
            className="p-1 text-gray-400 hover:text-red-600"
            title="Remove"
          >
            <svg
              className="w-3 h-3"
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
        </div>
      </div>
    )}
  </div>

                {/* Family Member Passport Photo */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Passport Photo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={(el) =>
                      (fileInputRefs.current[
                        `family_${index}_passportPhoto`
                      ] = el)
                      }
                      type="file"
                      onChange={(e) =>
                        handleFamilyFileChange(index, "passportPhoto", e)
                      }
                      className="hidden"
                      id={`family-passport-${index}`}
                      accept="image/*"
                    />
                    <label
                      htmlFor={`family-passport-${index}`}
                      className={`flex items-center justify-center p-3 border border-dashed rounded-lg cursor-pointer transition-colors ${member.passportPhoto
                        ? "bg-green-50 border-green-300"
                        : errors[`familyMember_${index}_passportPhoto`]
                          ? "bg-red-50 border-red-300"
                          : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                        }`}
                    >
                      <div className="text-center">
                        <svg
                          className={`w-6 h-6 mx-auto mb-1 ${member.passportPhoto
                            ? "text-green-500"
                            : errors[`familyMember_${index}_passportPhoto`]
                              ? "text-red-500"
                              : "text-gray-400"
                            }`}
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
                        <p
                          className={`text-xs ${member.passportPhoto
                            ? "text-green-700"
                            : "text-gray-600"
                            }`}
                        >
                          {member.passportPhoto
                            ? "Uploaded ✓"
                            : "Upload Passport"}
                        </p>
                      </div>
                    </label>
                  </div>
                  {errors[`familyMember_${index}_passportPhoto`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`familyMember_${index}_passportPhoto`]}
                    </p>
                  )}

                  {member.passportPhoto && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded border border-gray-200 overflow-hidden">
                          <img
                            src={member.passportPhoto.preview}
                            alt="Passport preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900 truncate max-w-[100px]">
                            {member.passportPhoto.fileName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handlePreviewAttachment(member.passportPhoto)
                          }
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Preview"
                        >
                          <svg
                            className="w-3 h-3"
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
                          onClick={() =>
                            handleRemoveFamilyAttachment(index, "passportPhoto")
                          }
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Remove"
                        >
                          <svg
                            className="w-3 h-3"
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
                      </div>
                    </div>
                  )}
                </div>
              </div>


            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-3">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Create ESIC Record</h2>
                <p className="text-blue-100 text-xs">
                  Fill in the employee ESIC information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  } ${tabErrors[tab.id] ? "pr-8" : ""}`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                {tabErrors[tab.id] && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit}>
            {activeTab === "basic" && renderBasicTab()}
            {activeTab === "personal" && renderPersonalTab()}
            {activeTab === "address" && renderAddressTab()}
            {activeTab === "nominee" && renderNomineeTab()}
            {activeTab === "bank" && renderBankTab()}
            {activeTab === "documents" && renderDocumentsTab()}
            {activeTab === "family" && renderFamilyTab()}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>

            {!isFirstTab() && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
              >
                Previous
              </button>
            )}

            {!isLastTab() ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Create ESIC Record
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEsicModal;
