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
import { showConfirmDialog, showDeleteConfirmation } from "../../../../BaseComponet/alertUtils";

function EditEsicModal({ esicId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [tabErrors, setTabErrors] = useState({});
  const [familyMembers, setFamilyMembers] = useState([]);
  const fileInputRefs = useRef({});

  // Refs for focusing on error fields
  const errorFieldRefs = useRef({});

  const [formData, setFormData] = useState({
    esicId: "",
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
    permanentAddress: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineeAdhaar: "",
    aadhaarPhoto: null,
    passportPhoto: null,
  });

  const [originalData, setOriginalData] = useState(null);
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
      fields: ["presentAddress", "permanentAddress"],
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
      fields: ["aadhaarPhoto", "passportPhoto"],
    },
    {
      id: "family",
      label: "Family Members",
      fields: ["familyMembers"],
    },
  ];

  // Fetch ESIC data by ID
  useEffect(() => {
    if (esicId) {
      fetchEsicData();
    }
  }, [esicId]);

  const fetchEsicData = async () => {
    setFetching(true);
    try {
      const response = await axiosInstance.get(`getEsicById/${esicId}`);

      if (response.data && response.data.esic) {
        const esicData = response.data.esic;
        const esicContents = response.data.esicContents || [];

        // Set original data for comparison
        setOriginalData({
          esic: esicData,
          esicContents: esicContents,
        });

        // Map API response to form data
        setFormData({
          esicId: esicData.esicId,
          name: esicData.name || "",
          dateOfJoining: esicData.dateOfJoining
            ? esicData.dateOfJoining.split("T")[0]
            : "",
          esicNumber: esicData.esicNumber || "",
          dateOfBirth: esicData.dateOfBirth
            ? esicData.dateOfBirth.split("T")[0]
            : "",
          fatherName: esicData.fatherName || "",
          phone: esicData.phone || "",
          gender: esicData.gender || "Male",
          isMarried: esicData.married || esicData.isMarried || false,
          aadhaarNumber: esicData.aadhaarNumber || "",
          accountHolderName: esicData.accountHolderName || "",
          bankName: esicData.bankName || "",
          accountNumber: esicData.accountNumber || "",
          ifsc: esicData.ifsc || "",
          presentAddress: esicData.presentAddress || "",
          permanentAddress:
            esicData.permantAddress || esicData.permanentAddress || "",
          nomineeName: esicData.nomineeName || "",
          nomineeRelation: esicData.nomineeRelation || "",
          nomineeAdhaar: esicData.nomineeAdhaar || "",
          aadhaarPhoto: esicData.aadhaarPhoto
            ? {
                id: "existing_aadhaar",
                isBase64: true,
                base64: esicData.aadhaarPhoto,
                fileName: "Aadhaar_Card.jpg",
                preview: `data:image/jpeg;base64,${esicData.aadhaarPhoto}`,
              }
            : null,
          passportPhoto: esicData.passportPhoto
            ? {
                id: "existing_passport",
                isBase64: true,
                base64: esicData.passportPhoto,
                fileName: "Passport_Photo.jpg",
                preview: `data:image/jpeg;base64,${esicData.passportPhoto}`,
              }
            : null,
        });

        // Map family members
        const mappedFamilyMembers = esicContents.map((content, index) => ({
          id: content.esicContentId || `temp_${index}`,
          esicContentId: content.esicContentId,
          name: content.name || "",
          relation: content.relation || "",
          aadhaarPhoto: content.aadhaarPhoto
            ? {
                id: `family_aadhaar_${index}`,
                isBase64: true,
                base64: content.aadhaarPhoto,
                fileName: `Family_Aadhaar_${index + 1}.jpg`,
                preview: `data:image/jpeg;base64,${content.aadhaarPhoto}`,
              }
            : null,
          passportPhoto: content.passportPhoto
            ? {
                id: `family_passport_${index}`,
                isBase64: true,
                base64: content.passportPhoto,
                fileName: `Family_Passport_${index + 1}.jpg`,
                preview: `data:image/jpeg;base64,${content.passportPhoto}`,
              }
            : null,
        }));

        setFamilyMembers(mappedFamilyMembers);
      }
    } catch (error) {
      console.error("Error fetching ESIC data:", error);
      toast.error("Failed to load ESIC record. Please try again.");
      onClose();
    } finally {
      setFetching(false);
    }
  };

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
        ["presentAddress", "permanentAddress"].includes(firstErrorKey)
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
      } else if (["aadhaarPhoto", "passportPhoto"].includes(firstErrorKey)) {
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

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
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
      isBase64: false,
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
      `${
        fieldName === "aadhaarPhoto" ? "Aadhaar" : "Passport"
      } photo updated successfully`
    );

    // Reset file input
    if (fileInputRefs.current[fieldName]) {
      fileInputRefs.current[fieldName].value = "";
    }
  };

  // Handle file attachment for family members
  const handleFamilyFileChange = (index, fieldName, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
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
      isBase64: false,
    };

    setFamilyMembers((prev) =>
      prev.map((member, i) =>
        i === index ? { ...member, [fieldName]: newAttachment } : member
      )
    );

    toast.success(`Family member ${fieldName} updated successfully`);

    // Reset file input
    if (fileInputRefs.current[`family_${index}_${fieldName}`]) {
      fileInputRefs.current[`family_${index}_${fieldName}`].value = "";
    }
  };

  // Preview attachment
  const handlePreviewAttachment = (attachment) => {
    if (!attachment) return;

    if (attachment.isBase64) {
      // For base64 images from API
      const img = document.createElement("img");
      img.src = attachment.preview;
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
    } else {
      // For newly uploaded files
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
            } catch (e) {}
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
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (fieldName) => {
    const attachment = formData[fieldName];
    if (attachment) {
      if (attachment.preview && !attachment.isBase64) {
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
  const handleRemoveFamilyAttachment = (index, fieldName) => {
    setFamilyMembers((prev) =>
      prev.map((member, i) => {
        if (i === index && member[fieldName]) {
          if (member[fieldName].preview && !member[fieldName].isBase64) {
            URL.revokeObjectURL(member[fieldName].preview);
          }
          return { ...member, [fieldName]: null };
        }
        return member;
      })
    );
    toast.success("Family member document removed");
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up main document URLs
      if (formData.aadhaarPhoto?.preview && !formData.aadhaarPhoto.isBase64) {
        URL.revokeObjectURL(formData.aadhaarPhoto.preview);
      }
      if (formData.passportPhoto?.preview && !formData.passportPhoto.isBase64) {
        URL.revokeObjectURL(formData.passportPhoto.preview);
      }

      // Clean up family member URLs
      familyMembers.forEach((member) => {
        if (member.aadhaarPhoto?.preview && !member.aadhaarPhoto.isBase64) {
          URL.revokeObjectURL(member.aadhaarPhoto.preview);
        }
        if (member.passportPhoto?.preview && !member.passportPhoto.isBase64) {
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

  // Get base64 from existing data or convert new file
  const getBase64Data = async (attachment) => {
    if (!attachment) return null;

    if (attachment.isBase64) {
      // If it's already base64 from API, return it
      return attachment.base64;
    } else if (attachment.file) {
      // If it's a new file, convert it
      return await convertFileToBase64(attachment.file);
    }

    return null;
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
      case "permanentAddress":
        if (value.length <= 500) {
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

  // Add family member
  const addFamilyMember = () => {
    setFamilyMembers((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        esicContentId: null,
        name: "",
        relation: "",
        aadhaarPhoto: null,
        passportPhoto: null,
      },
    ]);
  };
  // Remove family member
  const removeFamilyMember = async (index) => {
    const member = familyMembers[index];

    // If family member has an esicContentId, delete from backend
    if (member.esicContentId) {
      const result = await showDeleteConfirmation(
        "Are you sure you want to delete this family member? This action cannot be undone.",
        "Delete Family Member"
      );

      // ✅ Correct check
      if (!result.isConfirmed) {
        return;
      }

      try {
        await axiosInstance.delete(
          `deleteEsicContentById/${member.esicContentId}`
        );
        toast.success("Family member deleted successfully");
      } catch (error) {
        toast.error("Failed to delete family member. Please try again.");
        return;
      }
    }

    // Clean up URLs
    if (member.aadhaarPhoto?.preview && !member.aadhaarPhoto.isBase64) {
      URL.revokeObjectURL(member.aadhaarPhoto.preview);
    }
    if (member.passportPhoto?.preview && !member.passportPhoto.isBase64) {
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

  // Validation functions (same as CreateEsicModal)
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
    if (!esicNumber.trim()) return "ESIC number is required";
    if (!/^\d{17}$/.test(esicNumber)) return "ESIC number must be 17 digits";
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
    if (address.length < 10)
      return `${fieldName} must be at least 10 characters`;
    if (address.length > 500)
      return `${fieldName} cannot exceed 500 characters`;
    return "";
  };

  // Main validation function
  const validateForm = () => {
    const newErrors = {};

    // Basic information
    newErrors.name = validateName(formData.name);
    newErrors.fatherName = validateRequired(
      "fatherName",
      formData.fatherName,
      "Father's name"
    );
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
    newErrors.esicNumber = validateESICNumber(formData.esicNumber);

    // Personal details
    newErrors.phone = validatePhone(formData.phone);
    newErrors.aadhaarNumber = validateAadhaar(formData.aadhaarNumber);

    // Address details
    newErrors.presentAddress = validateAddress(
      formData.presentAddress,
      "Present address"
    );
    newErrors.permanentAddress = validateAddress(
      formData.permanentAddress,
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

    // Document validation (optional for edit)
    // Note: Documents are optional in edit mode
    // if (!formData.aadhaarPhoto) {
    //   newErrors.aadhaarPhoto = "Aadhaar photo is required";
    // }
    // if (!formData.passportPhoto) {
    //   newErrors.passportPhoto = "Passport photo is required";
    // }

    // Validate family members
    familyMembers.forEach((member, index) => {
      if (!member.name.trim()) {
        newErrors[`familyMember_${index}_name`] =
          "Family member name is required";
      }
      if (!member.relation) {
        newErrors[`familyMember_${index}_relation`] = "Relation is required";
      }
      // Note: Documents are optional for family members in edit mode
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

  // Handle form submission for update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all form errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      // Convert main documents to base64 if changed
      const aadhaarPhotoBase64 = await getBase64Data(formData.aadhaarPhoto);
      const passportPhotoBase64 = await getBase64Data(formData.passportPhoto);

      // Convert family member documents to base64
      const esicContents = await Promise.all(
        familyMembers.map(async (member) => {
          const aadhaarBase64 = await getBase64Data(member.aadhaarPhoto);
          const passportBase64 = await getBase64Data(member.passportPhoto);

          return {
            esicContentId: member.esicContentId,
            name: member.name.trim(),
            relation: member.relation,
            aadhaarPhoto: aadhaarBase64,
            passportPhoto: passportBase64,
          };
        })
      );

      const payload = {
        esic: {
          esicId: formData.esicId,
          name: formData.name.trim(),
          dateOfJoining: formData.dateOfJoining,
          esicNumber: formData.esicNumber,
          dateOfBirth: formData.dateOfBirth,
          fatherName: formData.fatherName.trim(),
          phone: formData.phone,
          gender: formData.gender,
          married: formData.isMarried,
          aadhaarNumber: formData.aadhaarNumber,
          accountHolderName: formData.accountHolderName.trim(),
          bankName: formData.bankName.trim(),
          accountNumber: formData.accountNumber,
          ifsc: formData.ifsc,
          presentAddress: formData.presentAddress.trim(),
          permantAddress: formData.permanentAddress.trim(),
          nomineeName: formData.nomineeName.trim(),
          nomineeRelation: formData.nomineeRelation,
          nomineeAdhaar: formData.nomineeAdhaar,
          aadhaarPhoto: aadhaarPhotoBase64,
          passportPhoto: passportPhotoBase64,
        },
        esicContents: esicContents,
      };

      const response = await axiosInstance.put("updateEsic", payload);

      if (response.data) {
        toast.success("ESIC record updated successfully!");
        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      } else {
        throw new Error("No response data received");
      }
    } catch (error) {
      console.error("Error updating ESIC record:", error);
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
            "Failed to update ESIC record: " +
              (error.response.data?.message || "Unknown error")
          );
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to update ESIC record. Please try again.");
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

  // Render loading state
  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200 flex flex-col">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading ESIC record...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Basic Tab
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
          required={true}
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
          label="ESIC Number"
          name="esicNumber"
          value={formData.esicNumber}
          onChange={handleChange}
          required={true}
          error={errors.esicNumber}
          placeholder="17 digit ESIC number"
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
            className={`phone-input-wrapper ${
              errors.phone ? "border-red-500 rounded-lg" : ""
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
          name="permanentAddress"
          value={formData.permanentAddress}
          onChange={handleChange}
          required={true}
          error={errors.permanentAddress}
          placeholder="Enter complete permanent address"
          rows={4}
          maxLength={500}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.permanentAddress = el)}
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
      {/* Aadhaar Photo Upload */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Aadhaar Photo {formData.aadhaarPhoto ? "(Uploaded)" : ""}
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
            className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              formData.aadhaarPhoto
                ? "bg-blue-50 border-blue-300 hover:border-blue-400"
                : errors.aadhaarPhoto
                ? "bg-red-50 border-red-300 hover:border-red-400"
                : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <div className="text-center">
              <svg
                className={`w-8 h-8 mx-auto mb-2 ${
                  formData.aadhaarPhoto
                    ? "text-blue-500"
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
                className={`text-sm ${
                  formData.aadhaarPhoto
                    ? "text-blue-700"
                    : errors.aadhaarPhoto
                    ? "text-red-700"
                    : "text-gray-600"
                }`}
              >
                {formData.aadhaarPhoto
                  ? "Click to update Aadhaar photo"
                  : "Click to upload Aadhaar photo"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, GIF, WebP, BMP (Max 5MB)
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
                  {formData.aadhaarPhoto.size && (
                    <div className="text-xs text-gray-500">
                      {formatFileSize(formData.aadhaarPhoto.size)}
                    </div>
                  )}
                  {formData.aadhaarPhoto.isBase64 && (
                    <div className="text-xs text-blue-500">
                      Previously uploaded
                    </div>
                  )}
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

      {/* Passport Photo Upload */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Passport Photo {formData.passportPhoto ? "(Uploaded)" : ""}
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
            className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              formData.passportPhoto
                ? "bg-blue-50 border-blue-300 hover:border-blue-400"
                : errors.passportPhoto
                ? "bg-red-50 border-red-300 hover:border-red-400"
                : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <div className="text-center">
              <svg
                className={`w-8 h-8 mx-auto mb-2 ${
                  formData.passportPhoto
                    ? "text-blue-500"
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
                className={`text-sm ${
                  formData.passportPhoto
                    ? "text-blue-700"
                    : errors.passportPhoto
                    ? "text-red-700"
                    : "text-gray-600"
                }`}
              >
                {formData.passportPhoto
                  ? "Click to update Passport photo"
                  : "Click to upload Passport photo"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, GIF, WebP, BMP (Max 5MB)
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
                  {formData.passportPhoto.size && (
                    <div className="text-xs text-gray-500">
                      {formatFileSize(formData.passportPhoto.size)}
                    </div>
                  )}
                  {formData.passportPhoto.isBase64 && (
                    <div className="text-xs text-blue-500">
                      Previously uploaded
                    </div>
                  )}
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
          Family Members (ESIC Contents)
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
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Family Member #{index + 1}
                  </h4>
                  {member.esicContentId && (
                    <span className="text-xs text-blue-600">
                      Existing Record
                    </span>
                  )}
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Family Member Aadhaar Photo */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Aadhaar Photo {member.aadhaarPhoto ? "(Uploaded)" : ""}
                  </label>
                  <div className="relative">
                    <input
                      ref={(el) =>
                        (fileInputRefs.current[`family_${index}_aadhaarPhoto`] =
                          el)
                      }
                      type="file"
                      onChange={(e) =>
                        handleFamilyFileChange(index, "aadhaarPhoto", e)
                      }
                      className="hidden"
                      id={`family-aadhaar-${index}`}
                      accept="image/*"
                    />
                    <label
                      htmlFor={`family-aadhaar-${index}`}
                      className={`flex items-center justify-center p-3 border border-dashed rounded-lg cursor-pointer transition-colors ${
                        member.aadhaarPhoto
                          ? "bg-blue-50 border-blue-300"
                          : errors[`familyMember_${index}_aadhaarPhoto`]
                          ? "bg-red-50 border-red-300"
                          : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      <div className="text-center">
                        <svg
                          className={`w-6 h-6 mx-auto mb-1 ${
                            member.aadhaarPhoto
                              ? "text-blue-500"
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
                            member.aadhaarPhoto
                              ? "text-blue-700"
                              : "text-gray-600"
                          }`}
                        >
                          {member.aadhaarPhoto
                            ? "Click to update"
                            : "Upload Aadhaar"}
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
                            alt="Aadhaar preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900 truncate max-w-[100px]">
                            {member.aadhaarPhoto.fileName}
                          </div>
                          {member.aadhaarPhoto.isBase64 && (
                            <div className="text-xs text-blue-500">
                              Existing
                            </div>
                          )}
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

                {/* Family Member Passport Photo */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Passport Photo {member.passportPhoto ? "(Uploaded)" : ""}
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
                      className={`flex items-center justify-center p-3 border border-dashed rounded-lg cursor-pointer transition-colors ${
                        member.passportPhoto
                          ? "bg-blue-50 border-blue-300"
                          : errors[`familyMember_${index}_passportPhoto`]
                          ? "bg-red-50 border-red-300"
                          : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      <div className="text-center">
                        <svg
                          className={`w-6 h-6 mx-auto mb-1 ${
                            member.passportPhoto
                              ? "text-blue-500"
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
                          className={`text-xs ${
                            member.passportPhoto
                              ? "text-blue-700"
                              : "text-gray-600"
                          }`}
                        >
                          {member.passportPhoto
                            ? "Click to update"
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
                          {member.passportPhoto.isBase64 && (
                            <div className="text-xs text-blue-500">
                              Existing
                            </div>
                          )}
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Edit ESIC Record</h2>
                <p className="text-blue-100 text-xs">
                  Update employee ESIC information - ID:{" "}
                  {esicId?.substring(0, 8)}...
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
                className={`relative flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
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
                    Updating...
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Update ESIC Record
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

export default EditEsicModal;
