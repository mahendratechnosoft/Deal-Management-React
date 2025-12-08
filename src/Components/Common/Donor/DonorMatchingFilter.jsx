import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../../Layout/useLayout";
import {
  FormInput,
  FormSelect,
} from "../../BaseComponet/CustomeFormComponents";
import axiosInstance from "../../BaseComponet/axiosInstance";
import Pagination from "../pagination";
import { toast } from "react-hot-toast";

// ==============================
// 1. Filter Component (Compact & Merged Header)
// ==============================
const DonorFilters = ({
  onFilterChange,
  activeFilters,
  familyOptions,
  onFamilyDetailsLoaded,
}) => {
  const [filters, setFilters] = useState({
    familyInfoId: "",
    bloodGroup: "",
    minHeight: "",
    maxHeight: "",
    minWeight: "",
    maxWeight: "",
    skinColor: "",
    eyeColor: "",
    religion: "",
    education: "",
    city: "",
    profession: "",
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [familyDetails, setFamilyDetails] = useState(null);

  // Check if UIN is selected to enable/disable radios
  const isUinSelected = Boolean(
    filters.familyInfoId && filters.familyInfoId !== ""
  );

  const createOptions = (arr) => [
    { value: "", label: "Select" },
    ...arr.map((item) => ({ value: item, label: item })),
  ];

  const optionsMap = {
    bloodGroup: createOptions([
      "O+",
      "O-",
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
    ]),
    skinColor: createOptions(["Fair", "Wheatish", "Dark"]),
    eyeColor: createOptions([
      "Brown",
      "Black",
      "Gray",
      "Blue",
      "Green",
      "Hazel",
      "Amber",
    ]),
    education: [
      { value: "below_10th", label: "Below 10th" },
      { value: "ssc_10th", label: "10th Pass (SSC)" },
      { value: "hsc_12th", label: "12th Pass (HSC)" },
      { value: "diploma", label: "Diploma" },
      { value: "iti_vocational", label: "ITI / Vocational Training" },
      { value: "ug_pursuing", label: "Undergraduate (UG) - Pursuing" },
      {
        value: "bachelor_completed",
        label: "Undergraduate (Bachelor’s Degree)",
      },
      { value: "pg_pursuing", label: "Postgraduate (PG) - Pursuing" },
      { value: "masters_completed", label: "Postgraduate (Master’s Degree)" },
      { value: "doctorate", label: "Doctorate (PhD)" },
      {
        value: "professional_course",
        label: "Professional Course (CA / CS / CMA)",
      },
      { value: "other", label: "Other" },
    ],
  };

  useEffect(() => {
    if (activeFilters) {
      setFilters((prev) => ({ ...prev, ...activeFilters }));
    }
  }, [activeFilters]);

  const parseNum = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const applyMemberFilters = (memberType, data) => {
    if (!data) return;
    let newFilters = { ...filters };
    const setRange = (val) => {
      const num = parseNum(val);
      return num > 0 ? num : "";
    };

    if (memberType === "husband") {
      newFilters.minHeight = setRange(data.husbandHeight);
      newFilters.maxHeight = setRange(data.husbandHeight);
      newFilters.minWeight = setRange(data.husbandWeight);
      newFilters.maxWeight = setRange(data.husbandWeight);
      newFilters.bloodGroup = data.husbandBloodGroup || "";
      newFilters.skinColor = data.husbandSkinColor || "";
      newFilters.eyeColor = data.husbandEyeColor || "";
      newFilters.religion = data.husbandReligion || "";
      newFilters.education = data.husbandEducation || "";
      newFilters.city = data.husbandDistrict || "";
    } else if (memberType === "wife") {
      newFilters.minHeight = setRange(data.wifeHeight);
      newFilters.maxHeight = setRange(data.wifeHeight);
      newFilters.minWeight = setRange(data.wifeWeight);
      newFilters.maxWeight = setRange(data.wifeWeight);
      newFilters.bloodGroup = data.wifeBloodGroup || "";
      newFilters.skinColor = data.wifeSkinColor || "";
      newFilters.eyeColor = data.wifeEyeColor || "";
      newFilters.religion = data.wifeReligion || "";
      newFilters.education = data.wifeEducation || "";
      newFilters.city = data.wifeDistrict || "";
    } else if (memberType === "both") {
      const hHeight = parseNum(data.husbandHeight);
      const wHeight = parseNum(data.wifeHeight);
      const avgHeight = (hHeight + wHeight) / 2;

      const hWeight = parseNum(data.husbandWeight);
      const wWeight = parseNum(data.wifeWeight);
      const avgWeight = (hWeight + wWeight) / 2;

      newFilters.minHeight = avgHeight > 0 ? avgHeight : "";
      newFilters.maxHeight = avgHeight > 0 ? avgHeight : "";
      newFilters.minWeight = avgWeight > 0 ? avgWeight : "";
      newFilters.maxWeight = avgWeight > 0 ? avgWeight : "";

      newFilters.bloodGroup = "";
      newFilters.skinColor = "";
      newFilters.eyeColor = "";
      newFilters.religion = "";
      newFilters.education = "";
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsExpanded(true);
  };

  const handleMemberChange = (e) => {
    const member = e.target.value;
    setSelectedMember(member);

    if (familyDetails) {
      applyMemberFilters(member, familyDetails);
    }
  };

  const handleUINChange = async (selectedOption) => {
    const id = selectedOption ? selectedOption.value : "";
    const updatedFilters = { ...filters, familyInfoId: id };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);

    // Reset radio and details when UIN changes
    setSelectedMember("");
    setFamilyDetails(null);

    if (!id && onFamilyDetailsLoaded) {
      onFamilyDetailsLoaded(null);
    }

    if (id) {
      try {
        const response = await axiosInstance.get(`getFamilyById/${id}`);
        if (response.data) {
          setFamilyDetails(response.data);
          if (onFamilyDetailsLoaded) {
            onFamilyDetailsLoaded(response.data);
          }
          toast.success("Family loaded.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSelectChange = (selectedOption, name) => {
    const value = selectedOption ? selectedOption.value : "";
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    const allEmpty = Object.keys(filters).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});
    setFilters(allEmpty);
    setSelectedMember("");
    onFilterChange(allEmpty);
    setIsExpanded(false);
  };

  const filterFields = [
    { key: "bloodGroup", label: "Blood Group", type: "select" },
    { key: "city", label: "City", type: "text" },
    { key: "religion", label: "Religion", type: "text" },
    { key: "minHeight", label: "Min Height (cm)", type: "number" },
    { key: "maxHeight", label: "Max Height (cm)", type: "number" },
    { key: "skinColor", label: "Skin Color", type: "select" },
    { key: "eyeColor", label: "Eye Color", type: "select" },
    { key: "education", label: "Education", type: "select" },
    { key: "minWeight", label: "Min Weight (kg)", type: "number" },
    { key: "maxWeight", label: "Max Weight (kg)", type: "number" },
    { key: "profession", label: "Profession", type: "text" },
  ];

  const activeDetailFilters = Object.entries(filters).filter(
    ([key, val]) => key !== "familyInfoId" && val && String(val).trim() !== ""
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3 flex-shrink-0 transition-all duration-300">
      {/* --- HEADER + CONTROLS (Merged Row) --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-3 pb-3 border-b border-gray-100">
        {/* 1. Main Title Inside Box */}
        <div className="flex-shrink-0">
          <h1 className="text-lg font-bold text-gray-800 leading-tight">
            Donor Matching System
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Filter matching donors by UIN or specific criteria
          </p>
        </div>

        {/* 2. Control Buttons */}
        <div className="flex items-center gap-2 self-end">
          {activeDetailFilters > 0 && !isExpanded && (
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-full">
              {activeDetailFilters} Active
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 focus:outline-none px-2 py-1 rounded hover:bg-blue-50"
          >
            {isExpanded ? "Collapse Filters" : "Expand Filters"}
            <svg
              className={`w-3 h-3 transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleClearAll}
            className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-xs font-semibold transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* --- PRIMARY FILTERS (UIN & RADIO) --- */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
        {/* UIN Dropdown */}
        <div className="flex-grow lg:w-1/3">
          <FormSelect
            label="Select Family UIN"
            name="familyInfoId"
            value={familyOptions.find((o) => o.value === filters.familyInfoId)}
            options={[{ value: "", label: "Select" }, ...familyOptions]}
            onChange={handleUINChange}
            placeholder="Search UIN..."
            className="text-sm"
          />
        </div>

        {/* Member Radio Buttons */}
        <div className="lg:w-2/3 pb-1">
          <label
            className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${
              !isUinSelected ? "text-gray-300" : "text-gray-500"
            }`}
          >
            Auto-Fill Criteria:
          </label>

          <div className="flex flex-wrap items-center gap-3">
            {["husband", "wife", "both"].map((type) => (
              <label
                key={type}
                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded border transition-all select-none
                                    ${
                                      !isUinSelected
                                        ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" // Disabled Style
                                        : selectedMember === type
                                        ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200 text-blue-700 cursor-pointer" // Active Style
                                        : "border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer" // Default Style
                                    }
                                `}
              >
                <input
                  type="radio"
                  name="memberSelect"
                  value={type}
                  checked={selectedMember === type}
                  onChange={handleMemberChange}
                  disabled={!isUinSelected} // DISABLE LOGIC
                  className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:bg-gray-100"
                />
                <span className="text-xs font-medium capitalize">
                  {type === "both" ? "Both (Avg)" : type}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* --- ADVANCED FILTERS (COLLAPSIBLE) --- */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {filterFields.map((field) => (
              <div key={field.key}>
                {field.type === "select" ? (
                  <FormSelect
                    label={field.label}
                    name={field.key}
                    value={
                      optionsMap[field.key]?.find(
                        (o) => o.value === filters[field.key]
                      ) || { value: "", label: "Select" }
                    }
                    options={optionsMap[field.key]}
                    onChange={(option) => handleSelectChange(option, field.key)}
                    placeholder="Select"
                  />
                ) : (
                  <FormInput
                    label={field.label}
                    name={field.key}
                    value={filters[field.key]}
                    onChange={handleTextChange}
                    placeholder={field.type === "number" ? "0" : "Search..."}
                    type={field.type}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==============================
// 2. Donor List Component
// ==============================
const DonorList = ({ donors, onEdit, selectedFamilyId, onAssignClick }) => {
  if (!donors || donors.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-white rounded-xl border border-gray-200 p-12">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No matching donors found</p>
          <p className="text-gray-500 text-sm">
            Try selecting a UIN or adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-grow overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Images
              </th>
              <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID & Name
              </th>
              <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Blood
              </th>
              <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stats
              </th>
              <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Details
              </th>
              <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Balanced Vials
              </th>
              <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donors.map((donor, index) => (
              <tr
                key={donor.donorId || index}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex -space-x-2 overflow-hidden">
                    {donor.selfeImage ? (
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src={`data:image/jpeg;base64,${donor.selfeImage}`}
                        alt="Selfie"
                      />
                    ) : (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                        No
                      </div>
                    )}
                    {donor.fullLengthImage && (
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src={`data:image/jpeg;base64,${donor.fullLengthImage}`}
                        alt="Full"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div
                    className="text-xs font-medium text-blue-600 truncate"
                    title={donor.uin}
                  >
                    {donor.uin || "N/A"}
                  </div>
                  <div className="text-sm font-bold text-gray-900 truncate">
                    {donor.name}
                  </div>
                  <div className="text-xs text-gray-500">Age: {donor.age}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      donor.bloodGroup === "O+"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {donor.bloodGroup || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  <div>H: {donor.height}</div>
                  <div>W: {donor.weight}</div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  <div className="truncate">Skin: {donor.skinColor}</div>
                  <div className="truncate">Eye: {donor.eyeColor}</div>
                  <div className="truncate text-xs text-gray-400">
                    {donor.city}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {donor.balancedVials || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onEdit(donor.donorId)}
                      className="text-blue-600 hover:text-blue-900 text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onAssignClick(donor)}
                      disabled={!selectedFamilyId} // Disable if no family selected
                      className={`text-xs px-3 py-1 rounded border w-full transition-colors ${
                        selectedFamilyId
                          ? "text-green-600 border-green-200 hover:bg-green-50 cursor-pointer"
                          : "text-gray-300 border-gray-100 cursor-not-allowed bg-gray-50"
                      }`}
                      title={
                        !selectedFamilyId
                          ? "Select a Family UIN first"
                          : "Assign Vials"
                      }
                    >
                      Assign
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AssignVialsModal = ({
  isOpen,
  onClose,
  donor,
  familyDetails,
  onSuccess,
}) => {
  const [vials, setVials] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const maxVials = donor ? parseInt(donor.balancedVials, 10) || 0 : 0;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setVials("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !donor) return null;

  // --- Validation Logic ---
  const validateInput = (value) => {
    if (!value || value.trim() === "") {
      return "Number of vials is required.";
    }
    const num = parseInt(value, 10);

    if (isNaN(num)) {
      return "Please enter a valid number.";
    }
    if (num <= 0) {
      return "Vials must be greater than 0.";
    }
    if (num > maxVials) {
      return `Cannot assign more than available balance (${maxVials}).`;
    }
    return ""; // No error
  };

  // --- Handlers ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    setVials(val);
    // Real-time validation on change
    const validationMsg = validateInput(val);
    setError(validationMsg);
  };

  const handleSubmit = async () => {
    // 1. Final Validation check before submit
    const validationMsg = validateInput(vials);

    if (validationMsg) {
      setError(validationMsg);
      return; // STOP: Do not proceed to API
    }

    setLoading(true);
    try {
      const payload = {
        familyInfoId: familyDetails?.familyInfoId,
        donorId: donor.donorId,
        vialsAssignedCount: String(vials),
        donarName: donor.name,
        donarUin: donor.uin || "",
        familyUin: familyDetails?.uin || "",
        husbandName: familyDetails?.husbandName || "",
        wifeName: familyDetails?.wifeName || "",
      };

      // 2. API Call (Only happens if validation passes)
      await axiosInstance.post("assignVialsToFamily", payload);

      toast.success("Vials assigned successfully");
      onSuccess(); // Refresh parent list
      onClose(); // Close modal
    } catch (err) {
      console.error("Assign error:", err);
      toast.error("Failed to assign vials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Assign Vials</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {familyDetails && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-sm text-purple-900 space-y-1 mb-2">
              <h4 className="font-bold text-purple-800 border-b border-purple-200 pb-1 mb-1">
                Target Family
              </h4>
              <div className="flex justify-between">
                <span className="font-semibold">Family UIN:</span>
                <span>{familyDetails.uin}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Husband:</span>
                <span>{familyDetails.husbandName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Wife:</span>
                <span>{familyDetails.wifeName}</span>
              </div>
            </div>
          )}
          {/* Info Card */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-900 space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-blue-700">Donor UIN:</span>
              <span>{donor.uin || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-blue-700">Donor Name:</span>
              <span>{donor.name}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 mt-2 pt-2">
              <span className="font-bold text-blue-800">
                Available Balance:
              </span>
              <span className="font-bold text-blue-800">{maxVials} Vials</span>
            </div>
          </div>

          {/* Form Input with Error Prop */}
          <FormInput
            label="Number of Vials to Assign"
            name="vialsAssignedCount"
            type="number"
            value={vials}
            onChange={handleInputChange}
            error={error} // Pass the error state here
            placeholder="e.g. 2"
            min="1"
            max={maxVials}
            required={true}
          />
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !!error || !vials} // Optional: Visually disable if error exists
            className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center gap-2 transition-all
              ${
                loading || !!error || !vials
                  ? "bg-blue-400 cursor-not-allowed opacity-70"
                  : "bg-blue-600 hover:bg-blue-700 shadow-sm"
              }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Assigning...
              </>
            ) : (
              "Assign Vials"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==============================
// 3. Main Container
// ==============================
function DonorMatchingFilter() {
  const { LayoutComponent, role } = useLayout();
  const navigate = useNavigate();

  // State
  const [donors, setDonors] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [familyOptions, setFamilyOptions] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDonorForAssign, setSelectedDonorForAssign] = useState(null);
  const [selectedFamilyDetails, setSelectedFamilyDetails] = useState(null);

  const handleOpenAssignModal = (donor) => {
    setSelectedDonorForAssign(donor);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedDonorForAssign(null);
  };

  const handleAssignSuccess = () => {
    // Refresh the list with current filters and page
    fetchDonors(currentPage, activeFilters);
  };

  // --- 1. Fetch Family List for Dropdown ---
  useEffect(() => {
    const fetchFamilyList = async () => {
      try {
        const response = await axiosInstance.get("getFamilyList");
        if (response.data) {
          const options = response.data
            .filter((item) => item.uin !== null && item.uin !== "")
            .map((item) => {
              // Extract only the first word (First Name)
              const hFirstName = item.husbandName
                ? item.husbandName.split(" ")[0]
                : "";
              const wFirstName = item.wifeName
                ? item.wifeName.split(" ")[0]
                : "";

              return {
                value: item.familyInfoId,
                // Label format: UIN - HusbandFirst & WifeFirst
                label: `${item.uin} - ${hFirstName} & ${wFirstName}`,
              };
            });
          setFamilyOptions(options);
        }
      } catch (error) {
        console.error("Error fetching family list:", error);
        toast.error("Could not load UIN list");
      }
    };
    fetchFamilyList();
  }, []);

  // --- 2. Fetch Donors ---
  const fetchDonors = useCallback(
    async (page = 0, currentFilters = activeFilters) => {
      setLoading(true);
      try {
        const queryParams = {};
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value === null || value === undefined) return;
          if (typeof value === "string") {
            const cleanValue = value.trim();
            if (cleanValue === "") return;
            if (key === "height" || key === "weight") {
              const numVal = Number(cleanValue);
              if (!isNaN(numVal) && numVal > 0) queryParams[key] = numVal;
            } else {
              queryParams[key] = cleanValue;
            }
          } else if (typeof value === "number") {
            if (key === "height" || key === "weight") {
              if (value > 0) queryParams[key] = value;
            } else {
              queryParams[key] = value;
            }
          }
        });

        const response = await axiosInstance.get(
          `getAllMatchingDonorList/${page}/${pageSize}`,
          { params: queryParams }
        );

        const data = response.data;
        setDonors(data.donarList || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 0);
        setTotalElements(data.totalElements || 0);
      } catch (error) {
        console.error("Error fetching donors:", error);
        if (error.response?.status === 400 || error.response?.status === 500) {
          toast.error("Invalid criteria.");
        } else {
          toast.error("Failed to load matching donors.");
        }
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDonors(0, activeFilters);
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [activeFilters, fetchDonors]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchDonors(newPage, activeFilters);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
  };

  const handleEdit = (donorId) => {
    if (role === "ROLE_ADMIN") {
      navigate(`/Admin/DonorEdit/${donorId}`);
    } else {
      navigate(`/Employee/DonorEdit/${donorId}`);
    }
  };

  const TableSkeleton = () => (
    <div className="bg-white rounded-xl p-6 animate-pulse space-y-4 flex-grow">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
      ))}
    </div>
  );

  return (
    <LayoutComponent>
      <div className="p-4 pb-0 h-[90vh] flex flex-col bg-gray-50">
        {/* Header is now inside DonorFilters, main text removed from here */}

        <DonorFilters
          onFilterChange={handleFilterChange}
          activeFilters={activeFilters}
          familyOptions={familyOptions}
          onFamilyDetailsLoaded={setSelectedFamilyDetails}
        />

        {loading ? (
          <TableSkeleton />
        ) : (
          <DonorList
            donors={donors}
            onEdit={handleEdit}
            selectedFamilyId={activeFilters.familyInfoId}
            onAssignClick={handleOpenAssignModal}
          />
        )}

        {!loading && donors.length > 0 && (
          <div className="bg-white border-t border-gray-200 mt-auto flex-shrink-0 rounded-b-xl">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              itemsName="donors"
              showPageSize={true}
            />
          </div>
        )}

        <AssignVialsModal
          isOpen={isAssignModalOpen}
          onClose={handleCloseAssignModal}
          donor={selectedDonorForAssign}
          familyDetails={selectedFamilyDetails}
          onSuccess={handleAssignSuccess}
        />
      </div>
    </LayoutComponent>
  );
}

export default DonorMatchingFilter;
