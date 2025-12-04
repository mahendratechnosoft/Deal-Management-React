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
  const { familyInfoId } = useParams(); // Using ID from URL
  const { LayoutComponent, role } = useLayout();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("family");
  const [errors, setErrors] = useState({});

  // --- State Management ---

  // 1. Family Info State
  const [familyInfo, setFamilyInfo] = useState({
    familyInfoId: "", // Hidden but needed for update
    adminId: "", // Hidden
    employeeId: "", // Hidden
    uin: "", // Read-only / Display
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

  // 2. Linked Donors List State (Mock or Fetch later)
  const [donorsList, setDonorsList] = useState([]);

  const tabs = [
    { id: "family", label: "Family Information" },
    // { id: "donorList", label: "Linked Donors" },
  ];

  // --- Data Fetching ---
  useEffect(() => {
    const fetchFamilyData = async () => {
      setLoading(true);
      try {
        // Fetch Family Details
        if (activeTab === "family") {
          const res = await axiosInstance.get(`getFamilyById/${familyInfoId}`);
          setFamilyInfo(res.data);
        }
        // Fetch Linked Donors (Example API call)
        else if (activeTab === "donorList") {
          // const res = await axiosInstance.get(`getDonorsByFamilyId/${familyInfoId}`);
          // setDonorsList(res.data);

          // Mock Data for now
          setDonorsList([
            {
              id: 101,
              name: "Rahul Kumar",
              age: 28,
              gender: "Male",
              sampleReceivedDate: "2023-10-15",
              status: "Processed",
            },
            {
              id: 102,
              name: "Amit Sharma",
              age: 30,
              gender: "Male",
              sampleReceivedDate: "2023-11-01",
              status: "Rejected",
            },
          ]);
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

  // --- Handlers ---

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
    setFamilyInfo({ ...familyInfo, [name]: value });

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

    validateMobile("referDoctorContactNumber", "Doctor Contact");
    validateMobile("husbandMobile", "Husband Mobile");
    validateMobile("wifeMobile", "Wife Mobile");

    setErrors(tempErrors);
    return isValid;
  };

  // --- Submit Handler (Family Update) ---
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

  const handleSelectChange = (option, name, stateSetter) => {
    stateSetter((prev) => ({
      ...prev,
      [name]: option ? option.value : "",
    }));
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
            label="Height"
            name="husbandHeight"
            value={familyInfo.husbandHeight}
            onChange={handleChange}
          />
          <FormInput
            label="Weight"
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
            />
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
            />
          </div>
        </div>
      </div>
    </form>
  );

  const renderDonorList = () => (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Linked Donors</h3>
        <button
          type="button"
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium"
          onClick={() => console.log("Add new donor logic")}
        >
          + Link New Donor
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donorsList.length > 0 ? (
              donorsList.map((donor) => (
                <tr
                  key={donor.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    #{donor.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {donor.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {donor.age} / {donor.gender}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {donor.sampleReceivedDate}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${
                                              donor.status === "Processed"
                                                ? "bg-green-100 text-green-800"
                                                : donor.status === "Rejected"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}
                    >
                      {donor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-600 cursor-pointer hover:underline">
                    View
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No linked donors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
