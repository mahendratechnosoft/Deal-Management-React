import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../../BaseComponet/axiosInstance";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function PublicEsicForm() {
  const { contactId, formId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const fileInputRefs = useRef({});

  // Family members state - using same structure as modal
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: Date.now(),
      name: "",
      relation: "",
      aadhaarPhoto: null,
      passportPhoto: null,
    },
  ]);

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
  });

  const [errors, setErrors] = useState({});
  const [familyMemberErrors, setFamilyMemberErrors] = useState([{}]);

  useEffect(() => {
    if (contactId) {
      console.log("Contact ID from URL:", contactId);
      console.log("Form ID from URL:", formId);
    }
  }, [contactId, formId]);

  // ========== FAMILY MEMBER FUNCTIONS ==========

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
    };

    setFamilyMembers((prev) =>
      prev.map((member, i) =>
        i === index ? { ...member, [fieldName]: newAttachment } : member
      )
    );

    // Clear error for this field if it exists
    const errorKey = `familyMember_${index}_${fieldName}`;
    if (familyMemberErrors[index]?.[fieldName]) {
      setFamilyMemberErrors((prev) => {
        const newErrors = [...prev];
        if (newErrors[index]) {
          delete newErrors[index][fieldName];
        }
        return newErrors;
      });
    }

    toast.success(`Family member ${fieldName} uploaded successfully`);

    // Reset file input
    const inputRefKey = `family_${index}_${fieldName}`;
    if (fileInputRefs.current[inputRefKey]) {
      fileInputRefs.current[inputRefKey].value = "";
    }
  };

  // Remove family member attachment
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
    toast.success("Family member document removed");
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
  };

  // Add family member
  const addFamilyMember = () => {
    if (familyMembers.length < 10) {
      setFamilyMembers((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          name: "",
          relation: "",
          aadhaarPhoto: null,
          passportPhoto: null,
        },
      ]);
      setFamilyMemberErrors((prev) => [...prev, {}]);
    } else {
      toast.error("Maximum 10 family members allowed");
    }
  };

  // Remove family member
  const removeFamilyMember = (index) => {
    if (familyMembers.length > 1) {
      const member = familyMembers[index];
      if (member.aadhaarPhoto?.preview) {
        URL.revokeObjectURL(member.aadhaarPhoto.preview);
      }
      if (member.passportPhoto?.preview) {
        URL.revokeObjectURL(member.passportPhoto.preview);
      }

      setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
      setFamilyMemberErrors((prev) => prev.filter((_, i) => i !== index));
    } else {
      toast.error("At least one family member is required");
    }
  };

  // Handle family member field change
  const handleFamilyMemberChange = (index, fieldName, value) => {
    setFamilyMembers((prev) =>
      prev.map((member, i) =>
        i === index ? { ...member, [fieldName]: value } : member
      )
    );

    // Clear error for this field if it exists
    if (familyMemberErrors[index]?.[fieldName]) {
      setFamilyMemberErrors((prev) => {
        const newErrors = [...prev];
        if (newErrors[index]) {
          delete newErrors[index][fieldName];
        }
        return newErrors;
      });
    }
  };

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

  // Relation options for family members
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

  // ========== VALIDATION FUNCTIONS ==========
  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (name.length > 100) return "Name cannot exceed 100 characters";
    if (!/^[a-zA-Z\s.]+$/.test(name.trim()))
      return "Name can only contain letters, spaces and dots";
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

  const validateAadhaar = (aadhaar) => {
    if (!aadhaar.trim()) return "Aadhaar number is required";
    if (!/^\d{12}$/.test(aadhaar)) return "Aadhaar number must be 12 digits";
    return "";
  };

  const validateESICNumber = (esic) => {
    if (!esic.trim()) return "ESIC number is required";
    if (!/^\d{17}$/.test(esic)) return "ESIC number must be 17 digits";
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
      minAgeDate.setFullYear(minAgeDate.getFullYear() - 14);
      if (date > minAgeDate) return "Employee must be at least 14 years old";
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

    // Contact information
    newErrors.phone = validatePhone(formData.phone);
    newErrors.aadhaarNumber = validateAadhaar(formData.aadhaarNumber);

    // Address information
    newErrors.presentAddress = validateAddress(
      formData.presentAddress,
      "Present address"
    );
    newErrors.permantAddress = validateAddress(
      formData.permantAddress,
      "Permanent address"
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

    // Primary nominee
    newErrors.nomineeName = validateRequired(
      "nomineeName",
      formData.nomineeName,
      "Primary nominee name"
    );
    newErrors.nomineeRelation = validateRequired(
      "nomineeRelation",
      formData.nomineeRelation,
      "Nominee relation"
    );
    newErrors.nomineeAdhaar = validateAadhaar(formData.nomineeAdhaar || "");

    // Validate date order
    if (formData.dateOfJoining && formData.dateOfBirth) {
      const joinDate = new Date(formData.dateOfJoining);
      const birthDate = new Date(formData.dateOfBirth);
      if (joinDate < birthDate) {
        newErrors.dateOfJoining =
          "Date of joining cannot be before date of birth";
      }
    }

    // Validate family members
    const newFamilyErrors = familyMembers.map((member, index) => {
      const memberErrors = {};
      if (!member.name.trim()) {
        memberErrors.name = "Family member name is required";
      } else if (member.name.length > 100) {
        memberErrors.name = "Name cannot exceed 100 characters";
      } else if (!/^[a-zA-Z\s.]+$/.test(member.name.trim())) {
        memberErrors.name = "Name can only contain letters, spaces and dots";
      }

      if (!member.relation.trim()) {
        memberErrors.relation = "Relation is required";
      }

      if (!member.aadhaarPhoto) {
        memberErrors.aadhaarPhoto = "Aadhaar photo is required";
      }

      if (!member.passportPhoto) {
        memberErrors.passportPhoto = "Passport photo is required";
      }

      return memberErrors;
    });

    setFamilyMemberErrors(newFamilyErrors);

    // Check if any family member has errors
    const hasFamilyErrors = newFamilyErrors.some(
      (err) => Object.keys(err).length > 0
    );

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0 && !hasFamilyErrors;
  };

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

    // Input formatting
switch (name) {
  case "name":
  case "fatherName":
  case "accountHolderName":
  case "bankName":
  case "nomineeName":
    if (/^[a-zA-Z\s.,-]*$/.test(value) || value === "") {
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

  case "presentAddress":
  case "permantAddress":
    if (/^[a-zA-Z0-9\s.,-]*$/.test(value) || value === "") {
      if (value.length <= 500) {
        processedValue = value;
      }
    }
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

  const handlePhoneChange = (value, country, e, formattedValue) => {
    const completeNumber = value.startsWith("+") ? value : `+${value}`;
    setPhone(value);
    setFormData((prev) => ({
      ...prev,
      phone: completeNumber,
    }));

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

  // Handle file change for main documents
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
    };

    setFormData((prev) => ({
      ...prev,
      [fieldName]: newAttachment,
    }));

    toast.success(
      `${
        fieldName === "aadhaarPhoto" ? "Aadhaar" : "Passport"
      } photo uploaded successfully`
    );
  };

  // Get today's date for date restrictions
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all form errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert main documents to base64
      const aadhaarPhotoBase64 = formData.aadhaarPhoto
        ? await convertFileToBase64(formData.aadhaarPhoto.file)
        : null;
      const passportPhotoBase64 = formData.passportPhoto
        ? await convertFileToBase64(formData.passportPhoto.file)
        : null;

      // Convert family member documents to base64
      const esicContents = await Promise.all(
        familyMembers.map(async (member) => {
          const aadhaarBase64 = member.aadhaarPhoto
            ? await convertFileToBase64(member.aadhaarPhoto.file)
            : null;
          const passportBase64 = member.passportPhoto
            ? await convertFileToBase64(member.passportPhoto.file)
            : null;

          return {
            name: member.name.trim(),
            relation: member.relation,
            aadhaarPhoto: aadhaarBase64,
            passportPhoto: passportBase64,
          };
        })
      );

      const submitData = {
        esic: {
          contactId: contactId,
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
          nomineeRelation: formData.nomineeRelation.trim(),
          nomineeAdhaar: formData.nomineeAdhaar,
          aadhaarPhoto: aadhaarPhotoBase64,
          passportPhoto: passportPhotoBase64,
        },
        esicContents: esicContents,
      };

      const response = await axiosInstance.post("/submitEsicForm", submitData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      await Swal.fire({
        title: "Success!",
        text: "ESIC form submitted successfully!",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        customClass: {
          popup: "rounded-lg",
          confirmButton: "px-4 py-2 rounded-lg",
        },
      });

      // Reset form
      setFormData({
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
      });
      setPhone("");
      setFamilyMembers([
        {
          id: Date.now(),
          name: "",
          relation: "",
          aadhaarPhoto: null,
          passportPhoto: null,
        },
      ]);
      setFamilyMemberErrors([{}]);

      // Clean up object URLs
      if (formData.aadhaarPhoto?.preview) {
        URL.revokeObjectURL(formData.aadhaarPhoto.preview);
      }
      if (formData.passportPhoto?.preview) {
        URL.revokeObjectURL(formData.passportPhoto.preview);
      }
      familyMembers.forEach((member) => {
        if (member.aadhaarPhoto?.preview) {
          URL.revokeObjectURL(member.aadhaarPhoto.preview);
        }
        if (member.passportPhoto?.preview) {
          URL.revokeObjectURL(member.passportPhoto.preview);
        }
      });
    } catch (error) {
      console.error("Error submitting form:", error);

      let errorMessage = "Error submitting form. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      await Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
        customClass: {
          popup: "rounded-lg",
          confirmButton: "px-4 py-2 rounded-lg",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.aadhaarPhoto?.preview) {
        URL.revokeObjectURL(formData.aadhaarPhoto.preview);
      }
      if (formData.passportPhoto?.preview) {
        URL.revokeObjectURL(formData.passportPhoto.preview);
      }
      familyMembers.forEach((member) => {
        if (member.aadhaarPhoto?.preview) {
          URL.revokeObjectURL(member.aadhaarPhoto.preview);
        }
        if (member.passportPhoto?.preview) {
          URL.revokeObjectURL(member.passportPhoto.preview);
        }
      });
    };
  }, [formData, familyMembers]);

  // ========== RENDER FAMILY MEMBER SECTION ==========
  const renderFamilyMembersSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          Family Members
        </h3>
        <button
          type="button"
          onClick={addFamilyMember}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
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
                {index > 0 && (
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
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      handleFamilyMemberChange(index, "name", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      familyMemberErrors[index]?.name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter family member name"
                  />
                  {familyMemberErrors[index]?.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {familyMemberErrors[index].name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      familyMemberErrors[index]?.relation
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Relation</option>
                    {relationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {familyMemberErrors[index]?.relation && (
                    <p className="mt-1 text-xs text-red-600">
                      {familyMemberErrors[index].relation}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Family Member Aadhaar Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar Photo <span className="text-red-500">*</span>
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
                          ? "bg-green-50 border-green-300"
                          : familyMemberErrors[index]?.aadhaarPhoto
                          ? "bg-red-50 border-red-300"
                          : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                      }`}
                    >
                      <div className="text-center">
                        <svg
                          className={`w-6 h-6 mx-auto mb-1 ${
                            member.aadhaarPhoto
                              ? "text-green-500"
                              : familyMemberErrors[index]?.aadhaarPhoto
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
                              ? "text-green-700"
                              : "text-gray-600"
                          }`}
                        >
                          {member.aadhaarPhoto
                            ? "Uploaded ✓"
                            : "Upload Aadhaar"}
                        </p>
                      </div>
                    </label>
                  </div>
                  {familyMemberErrors[index]?.aadhaarPhoto && (
                    <p className="mt-1 text-xs text-red-600">
                      {familyMemberErrors[index].aadhaarPhoto}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className={`flex items-center justify-center p-3 border border-dashed rounded-lg cursor-pointer transition-colors ${
                        member.passportPhoto
                          ? "bg-green-50 border-green-300"
                          : familyMemberErrors[index]?.passportPhoto
                          ? "bg-red-50 border-red-300"
                          : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                      }`}
                    >
                      <div className="text-center">
                        <svg
                          className={`w-6 h-6 mx-auto mb-1 ${
                            member.passportPhoto
                              ? "text-green-500"
                              : familyMemberErrors[index]?.passportPhoto
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
                  {familyMemberErrors[index]?.passportPhoto && (
                    <p className="mt-1 text-xs text-red-600">
                      {familyMemberErrors[index].passportPhoto}
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Employee ESIC Registration
            </h1>
            <p className="text-gray-600 mb-4">
              Fill in your details for Employee State Insurance Corporation
              registration
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">
                Secure & Encrypted Submission
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">
              ESIC Details Form
            </h2>
            <p className="text-green-100 text-center mt-1">
              Including family members for insurance benefits
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Date of Joining */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.dateOfJoining
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    max={getTodayDate()}
                  />
                  {errors.dateOfJoining && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dateOfJoining}
                    </p>
                  )}
                </div>

                {/* ESIC Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ESIC Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="esicNumber"
                    value={formData.esicNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.esicNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="17-digit ESIC number"
                    maxLength={17}
                  />
                  {errors.esicNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.esicNumber}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
             {/* Date of Birth */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Date of Birth <span className="text-red-500">*</span>
  </label>
  <input
    type="date"
    name="dateOfBirth"
    value={formData.dateOfBirth}
    onChange={handleChange}
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
      errors.dateOfBirth ? "border-red-500" : "border-gray-300"
    }`}
    // Remove max attribute to allow calendar to show today's date
    // max={getMaxBirthDate()}
  />
  {errors.dateOfBirth && (
    <p className="text-red-500 text-xs mt-1">
      {errors.dateOfBirth}
    </p>
  )}
</div>

                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.fatherName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter father's name"
                    maxLength={100}
                  />
                  {errors.fatherName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fatherName}
                    </p>
                  )}
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`phone-input-wrapper ${
                      errors.phone ? "border-red-500 rounded-lg" : ""
                    }`}
                  >
                    <PhoneInput
                      country={"in"}
                      value={phone}
                      onChange={handlePhoneChange}
                      enableSearch={true}
                      placeholder="Enter phone number"
                      inputClass="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Marital Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isMarried"
                    name="isMarried"
                    checked={formData.isMarried}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isMarried"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Married
                  </label>
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.aadhaarNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="12-digit Aadhaar number"
                    maxLength={12}
                  />
                  {errors.aadhaarNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.aadhaarNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Address Information
              </h3>

              <div className="grid grid-cols-1 gap-6">
                {/* Present Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Present Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="presentAddress"
                    value={formData.presentAddress}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.presentAddress
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Flat/House no, Street, City, State, Pincode"
                    maxLength={500}
                  />
                  {errors.presentAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.presentAddress}
                    </p>
                  )}
                </div>

                {/* Permanent Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permanent Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="permantAddress"
                    value={formData.permantAddress}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.permantAddress
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="House no, Street, City, State, Pincode"
                    maxLength={500}
                  />
                  {errors.permantAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.permantAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Bank Account Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Holder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.accountHolderName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="As per bank records"
                    maxLength={100}
                  />
                  {errors.accountHolderName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.accountHolderName}
                    </p>
                  )}
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.bankName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Bank name"
                    maxLength={100}
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bankName}
                    </p>
                  )}
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.accountNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Bank account number"
                    maxLength={20}
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.accountNumber}
                    </p>
                  )}
                </div>

                {/* IFSC Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 uppercase ${
                      errors.ifsc ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="SBIN0001234"
                    maxLength={11}
                  />
                  {errors.ifsc && (
                    <p className="text-red-500 text-xs mt-1">{errors.ifsc}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Nominee Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Primary Nominee Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nominee Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nominee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nomineeName"
                    value={formData.nomineeName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.nomineeName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nominee full name"
                    maxLength={100}
                  />
                  {errors.nomineeName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.nomineeName}
                    </p>
                  )}
                </div>

                {/* Nominee Relation */}
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Relation <span className="text-red-500">*</span>
  </label>
  <select
    name="nomineeRelation"
    value={formData.nomineeRelation}
    onChange={handleChange}
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
      errors.nomineeRelation ? "border-red-500" : "border-gray-300"
    }`}
  >
    <option value="">Select Relation</option>
    {relationOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
  {errors.nomineeRelation && (
    <p className="text-red-500 text-xs mt-1">
      {errors.nomineeRelation}
    </p>
  )}
</div>


                {/* Nominee Aadhaar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nominee Aadhaar Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nomineeAdhaar"
                    value={formData.nomineeAdhaar}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.nomineeAdhaar
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="12-digit Aadhaar number"
                    maxLength={12}
                  />
                  {errors.nomineeAdhaar && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.nomineeAdhaar}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Family Members Section */}
            {renderFamilyMembersSection()}

            {/* Document Upload Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Employee Documents Upload
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Aadhaar Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Aadhaar Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("aadhaarPhoto", e)}
                    className="hidden"
                    id="aadhaarPhoto"
                  />
                  <label
                    htmlFor="aadhaarPhoto"
                    className="flex items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-green-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </label>
                  {formData.aadhaarPhoto && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded border border-gray-200 overflow-hidden">
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
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Employee Passport Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Passport Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("passportPhoto", e)}
                    className="hidden"
                    id="passportPhoto"
                  />
                  <label
                    htmlFor="passportPhoto"
                    className="flex items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-green-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </label>
                  {formData.passportPhoto && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded border border-gray-200 overflow-hidden">
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
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 duration-300 shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting ESIC Details...
                  </div>
                ) : (
                  "Submit ESIC Details"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            All information provided will be kept confidential and used only for
            ESIC registration purposes as per ESIC Act, 1948.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PublicEsicForm;
