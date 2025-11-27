import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import { useLayout } from "../../Layout/useLayout";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Select from "react-select";
import { City, Country, State } from "country-state-city";
import {
  FormInput,
  FormInputWithPrefix,
  FormPhoneInputFloating,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";
import CustomeImageUploader from "../../BaseComponet/CustomeImageUploader";
import { hasPermission } from "../../BaseComponet/permissions";
import { showConfirmDialog } from "../../BaseComponet/alertUtils";
const SkeletonBlock = ({ className }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

function FormSkeleton() {
  return (
    <div className="h-[72vh] overflow-hidden ">
      <div className="mt-4 h-full overflow-y-auto no-scrollbar">
        <div className="bg-white p-6 rounded-lg space-y-8 shadow-sm border border-gray-200">
          {/* Section 1: Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
            {/* Column 1 */}
            <div className="space-y-6">
              <SkeletonBlock className="h-6 w-1/3" /> {/* Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <SkeletonBlock className="h-4 w-1/4 mb-2" /> {/* Label */}
                    <SkeletonBlock className="h-10 w-full" /> {/* Input */}
                  </div>
                ))}
              </div>
            </div>
            {/* Column 2 */}
            <div className="space-y-6 mt-8 lg:mt-0 lg:border-l lg:border-gray-200 lg:pl-8">
              <SkeletonBlock className="h-6 w-1/3" /> {/* Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <SkeletonBlock className="h-4 w-1/4 mb-2" /> {/* Label */}
                    <SkeletonBlock className="h-10 w-full" /> {/* Input */}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Items Table */}
          <div className="pt-8 border-t border-gray-200">
            <div className="mb-4 flex items-start justify-between gap-4">
              <SkeletonBlock className="h-6 w-1/4" /> {/* Title */}
              <SkeletonBlock className="h-10 w-48" /> {/* Currency */}
            </div>
            <SkeletonBlock className="h-12 w-full rounded-t-lg" />{" "}
            {/* Table Head */}
            <SkeletonBlock className="h-16 w-full mt-2 rounded" />{" "}
            {/* Table Row */}
            <SkeletonBlock className="h-16 w-full mt-2 rounded" />{" "}
            {/* Table Row */}
          </div>

          {/* Section 3: Summary */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              {/* Notes & Terms */}
              <div className="w-full md:w-1/2 lg:flex-1 space-y-4">
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-32 w-full" />
              </div>
              {/* Summary Box */}
              <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 bg-gray-50 p-4 rounded-lg">
                <SkeletonBlock className="h-6 w-1/3 mb-4" />
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-8 w-full mt-4" />
              </div>
            </div>
          </div>
        </div>
        <div className="h-6" />
      </div>
    </div>
  );
}
const formatProposalNumber = (number) => {
  const numberString = String(number || 0);
  return `${numberString.padStart(6, "0")}`;
};
function EditProposal() {
  const navigate = useNavigate();
  const { proposalId } = useParams();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { LayoutComponent, role } = useLayout();
  const [errors, setErrors] = useState({});
  const [deletedContentIds, setDeletedContentIds] = useState([]);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [stampUrl, setStampUrl] = useState(null);

  const canEdit = hasPermission("proposal", "Edit");
  const canDelete = hasPermission("proposal", "Delete");
  // Same state structure as CreateProposal
  const [proposalInfo, setProposalInfo] = useState({
    employeeId: "",
    assignTo: "",
    proposalNumber: "",
    currencyType: "INR",
    discount: 0,
    taxType: "",
    taxPercentage: 0,
    dueDate: "",
    proposalDate: new Date().toISOString().split("T")[0],
    totalAmmount: 0,
    status: "Draft",
    subject: "",
    relatedTo: "",
    relatedId: "",
    companyName: "",
    mobileNumber: "",
    email: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    notes: "",
    termsAndConditions: "",
    companySignature: null,
    companyStamp: null,
  });

  const [proposalContent, setProposalContent] = useState([
    { item: "", description: "", quantity: 1, rate: 0 },
  ]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [taxRateInput, setTaxRateInput] = useState("18");
  const [assignToOptions, setAssignToOptions] = useState([]);
  const [isAssignToLoading, setIsAssignToLoading] = useState(false);
  const [relatedIdOptions, setRelatedIdOptions] = useState([]);
  const [isRelatedIdLoading, setIsRelatedIdLoading] = useState(false);
  const [isRecipientLoading, setIsRecipientLoading] = useState(false);

  const relatedOptions = [
    { value: "lead", label: "Lead" },
    { value: "customer", label: "Customer" },
  ];
  const taxOptions = [
    { value: "No Tax", label: "No Tax", defaultRate: 0 },
    { value: "SGST", label: "SGST", defaultRate: 9 },
    { value: "CGST", label: "CGST", defaultRate: 9 },
    { value: "GST", label: "GST", defaultRate: 18 },
    { value: "IGST", label: "IGST", defaultRate: 18 },
    { value: "Custom", label: "Custom", defaultRate: "" },
  ];
  const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Sent", label: "Sent" },
    { value: "Open", label: "Open" },
    { value: "Revised", label: "Revised" },
    { value: "Accepted", label: "Accepted" },
    { value: "Declined", label: "Declined" },
  ];
  const currencyOptions = [
    { value: "INR", label: "INR" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ];

  useEffect(() => {
    const fetchProposalData = async () => {
      if (!proposalId) {
        toast.error("No proposal ID found.");
        setPageLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(
          `getProposalById/${proposalId}`
        );
        const { proposalInfo: fetchedInfo, proposalContent: fetchedContent } =
          response.data;

        if (
          fetchedInfo.taxPercentage !== null &&
          fetchedInfo.taxPercentage !== undefined
        ) {
          setTaxRateInput(fetchedInfo.taxPercentage.toString());
        } else if (
          fetchedInfo.taxRate !== null &&
          fetchedInfo.taxRate !== undefined
        ) {
          setTaxRateInput(fetchedInfo.taxRate.toString());
          fetchedInfo.taxPercentage = Number(fetchedInfo.taxRate);
        } else {
          const matchingTax = taxOptions.find(
            (o) => o.value === fetchedInfo.taxType
          );
          const defaultRate = matchingTax
            ? matchingTax.defaultRate.toString()
            : "0";
          setTaxRateInput(defaultRate);
          fetchedInfo.taxPercentage = Number(defaultRate);
        }
        if (fetchedInfo.employeeId && fetchedInfo.assignTo) {
          setAssignToOptions([
            { value: fetchedInfo.employeeId, label: fetchedInfo.assignTo },
          ]);
        }
        if (fetchedInfo.relatedTo) {
          let endpoint = "";
          let mappingFunc;

          if (fetchedInfo.relatedTo === "lead") {
            endpoint = "getLeadNameAndId";
            mappingFunc = (lead) => ({
              label: lead.clientName,
              value: lead.leadId,
            });
          } else if (fetchedInfo.relatedTo === "customer") {
            endpoint = "getCustomerListWithNameAndId";
            mappingFunc = (customer) => ({
              label: customer.companyName,
              value: customer.id,
            });
          }

          if (endpoint) {
            try {
              setIsRelatedIdLoading(true);
              const relatedResponse = await axiosInstance.get(endpoint);
              setRelatedIdOptions(relatedResponse.data.map(mappingFunc));
            } catch (e) {
              console.error("Failed to pre-load related options", e);
              toast.error(`Failed to load ${fetchedInfo.relatedTo} list.`);
            } finally {
              setIsRelatedIdLoading(false);
            }
          }
        }

        if (fetchedInfo.companySignature) {
          setSignatureUrl(`data:;base64,${fetchedInfo.companySignature}`);
        }

        if (fetchedInfo.companyStamp) {
          setStampUrl(`data:;base64,${fetchedInfo.companyStamp}`);
        }

        // 5. Handle Country/State/City
        const allCountries = Country.getAllCountries().map((c) => ({
          value: c.isoCode,
          label: c.name,
          ...c,
        }));
        const countryObj = allCountries.find(
          (c) => c.label === fetchedInfo.country
        );

        setCountries(allCountries); // This must be set first
        setSelectedCountry(countryObj);

        if (countryObj) {
          const allStates = State.getStatesOfCountry(countryObj.value).map(
            (s) => ({
              value: s.isoCode,
              label: s.name,
              ...s,
            })
          );
          const stateObj = allStates.find((s) => s.label === fetchedInfo.state);

          setStates(allStates); // Set state options
          setSelectedState(stateObj);

          if (stateObj) {
            const allCities = City.getCitiesOfState(
              countryObj.value,
              stateObj.value
            ).map((c) => ({
              value: c.name,
              label: c.name,
              ...c,
            }));
            const cityObj = allCities.find((c) => c.label === fetchedInfo.city);

            setCities(allCities); // Set city options
            setSelectedCity(cityObj);
          }
        }

        // 6. Format dates (API might return null)
        fetchedInfo.proposalDate = fetchedInfo.proposalDate
          ? fetchedInfo.proposalDate.split("T")[0]
          : "";
        fetchedInfo.dueDate = fetchedInfo.dueDate
          ? fetchedInfo.dueDate.split("T")[0]
          : "";

        fetchedInfo.proposalNumber = formatProposalNumber(
          fetchedInfo.proposalNumber
        );

        // 7. Set main states
        setProposalInfo(fetchedInfo);
        setProposalContent(fetchedContent);
      } catch (error) {
        console.error("Failed to fetch proposal:", error);
        toast.error(
          error.response?.data?.message || "Failed to load proposal data."
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchProposalData();
  }, [proposalId]);

  const fetchAndPopulateData = async (relatedTo, relatedId) => {
    if (!relatedId || !relatedTo || countries.length === 0) {
      return;
    }

    setIsRecipientLoading(true);
    let endpoint = "";
    let recipientData = {};

    try {
      if (relatedTo === "lead") {
        endpoint = `getLeadById/${relatedId}`;
        const response = await axiosInstance.get(endpoint);
        const { lead } = response.data;

        recipientData = {
          companyName: lead.companyName,
          email: lead.email,
          mobile: lead.mobileNumber,
          street: lead.street,
          cityStr: lead.city,
          stateStr: lead.state,
          countryStr: lead.country,
          zipCode: lead.zipCode,
        };
      } else if (relatedTo === "customer") {
        endpoint = `getCustomerById/${relatedId}`;
        const response = await axiosInstance.get(endpoint);
        const customer = response.data;

        recipientData = {
          companyName: customer.companyName,
          email: customer.email || "",
          mobile: customer.mobile,
          street: customer.billingStreet,
          cityStr: customer.billingCity,
          stateStr: customer.billingState,
          countryStr: customer.billingCountry,
          zipCode: customer.billingZipCode,
        };
      }

      setProposalInfo((prev) => ({
        ...prev,
        companyName: recipientData.companyName || "",
        email: recipientData.email || "",
        mobileNumber: recipientData.mobile || "",
        street: recipientData.street || "",
        zipCode: recipientData.zipCode || "",
        city: "",
        state: "",
        country: "",
      }));

      // 2. Handle Country
      const countryObj = countries.find(
        (c) => c.label === recipientData.countryStr
      );

      if (!countryObj) {
        setSelectedCountry(null);
        setSelectedState(null);
        setSelectedCity(null);
        setStates([]);
        setCities([]);
        setIsRecipientLoading(false);
        return;
      }

      setSelectedCountry(countryObj);
      setProposalInfo((prev) => ({ ...prev, country: countryObj.label }));

      // 3. Handle State
      const newStates = State.getStatesOfCountry(countryObj.value).map((s) => ({
        value: s.isoCode,
        label: s.name,
        ...s,
      }));
      setStates(newStates);

      const stateObj = newStates.find(
        (s) => s.label === recipientData.stateStr
      );

      if (!stateObj) {
        setSelectedState(null);
        setSelectedCity(null);
        setCities([]);
        setIsRecipientLoading(false);
        return;
      }

      setSelectedState(stateObj);
      setProposalInfo((prev) => ({ ...prev, state: stateObj.label }));

      // 4. Handle City
      const newCities = City.getCitiesOfState(
        countryObj.value,
        stateObj.value
      ).map((c) => ({
        value: c.name,
        label: c.name,
        ...c,
      }));
      setCities(newCities);

      const cityObj = newCities.find((c) => c.label === recipientData.cityStr);

      if (cityObj) {
        setSelectedCity(cityObj);
        setProposalInfo((prev) => ({ ...prev, city: cityObj.label }));
      } else {
        setSelectedCity(null);
        setProposalInfo((prev) => ({ ...prev, city: "" }));
      }
    } catch (error) {
      console.error("Failed to load recipient data:", error);
      toast.error("Could not load recipient details.");
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedCity(null);
      setStates([]);
      setCities([]);
    } finally {
      setIsRecipientLoading(false);
    }
  };

  const handleCancel = async () => {
    const result = await showConfirmDialog(
      "Are you sure you want to cancel? Any unsaved changes will be lost."
    );
    if (result.isConfirmed) {
      if (role === "ROLE_ADMIN") {
        navigate("/Proposal");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/Proposal");
      } else {
        navigate("/login");
      }
    }
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setProposalInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (fieldName, phone) => {
    setProposalInfo((prev) => ({
      ...prev,
      [fieldName]: phone,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    if (name === "assignTo") {
      setProposalInfo((prev) => ({
        ...prev,
        assignTo: selectedOption ? selectedOption.label : "",
        employeeId: selectedOption ? selectedOption.value : "",
      }));

      if (errors.assignTo) {
        setErrors((prev) => ({ ...prev, assignTo: "" }));
      }
    } else if (name === "relatedTo") {
      setProposalInfo((prev) => ({
        ...prev,
        relatedTo: selectedOption ? selectedOption.value : "",
        relatedId: "",
        companyName: "",
        mobileNumber: "",
        email: "",
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      }));
      setRelatedIdOptions([]);
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedCity(null);
      setStates([]);
      setCities([]);

      if (errors.relatedTo) setErrors((prev) => ({ ...prev, relatedTo: "" }));
      if (errors.relatedId) setErrors((prev) => ({ ...prev, relatedId: "" }));
    } else {
      const newValue = selectedOption ? selectedOption.value : "";
      setProposalInfo((prev) => ({
        ...prev,
        [name]: newValue,
      }));
      if (name === "relatedId") {
        setProposalInfo((prev) => ({
          ...prev,
          companyName: "",
          mobileNumber: "",
          email: "",
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        }));
        setSelectedCountry(null);
        setSelectedState(null);
        setSelectedCity(null);
        setStates([]);
        setCities([]);

        const currentRelatedTo = proposalInfo.relatedTo;
        if (newValue && currentRelatedTo) {
          fetchAndPopulateData(currentRelatedTo, newValue);
        }
      }

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...proposalContent];
    list[index][name] = value;
    setProposalContent(list);
  };

  const handleAddItem = () => {
    setProposalContent([
      ...proposalContent,
      { item: "", description: "", quantity: 1, rate: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    const list = [...proposalContent];
    const itemToRemove = list[index];

    if (itemToRemove.proposalContentId) {
      setDeletedContentIds((prevIds) => [
        ...prevIds,
        itemToRemove.proposalContentId,
      ]);
    }

    list.splice(index, 1);
    setProposalContent(list);
  };

  const handleImageUpload = (file, fieldName) => {
    if (!file) {
      setProposalInfo((prev) => ({ ...prev, [fieldName]: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];

      setProposalInfo((prev) => ({
        ...prev,
        [fieldName]: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = proposalContent.reduce(
      (acc, item) =>
        acc + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );

    const discountAmount = (sub * (Number(proposalInfo.discount) || 0)) / 100;
    const taxableAmount = sub - discountAmount;
    const taxRate = (Number(taxRateInput) || 0) / 100;

    const tax = taxableAmount * taxRate;
    const grandTotal = taxableAmount + tax;

    return { subtotal: sub, taxAmount: tax, total: grandTotal };
  }, [proposalContent, proposalInfo.discount, taxRateInput]);

  const currencySymbol = useMemo(() => {
    switch (proposalInfo.currencyType) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return "";
    }
  }, [proposalInfo.currencyType]);

  useEffect(() => {
    setProposalInfo((prev) => ({ ...prev, totalAmmount: total }));
  }, [total]);

  const loadAssignToOptions = async () => {
    if (assignToOptions.length > 1 || isAssignToLoading) {
      return;
    }
    setIsAssignToLoading(true);
    try {
      const response = await axiosInstance.get("getEmployeeNameAndId");
      const mappedOptions = response.data.map((emp) => ({
        label: emp.name,
        value: emp.employeeId,
      }));

      // Preserve the initially loaded option if it's not in the full list
      const initialOption = assignToOptions[0];
      if (
        initialOption &&
        !mappedOptions.some((opt) => opt.value === initialOption.value)
      ) {
        setAssignToOptions([initialOption, ...mappedOptions]);
      } else {
        setAssignToOptions(mappedOptions);
      }
    } catch (error) {
      console.error("Failed to load employee options:", error);
      toast.error("Failed to load employee options.");
    } finally {
      setIsAssignToLoading(false);
    }
  };

  const loadRelatedIdOptions = async () => {
    if (
      (relatedIdOptions.length > 0 && !isRelatedIdLoading) ||
      !proposalInfo.relatedTo
    ) {
      return;
    }

    setIsRelatedIdLoading(true);
    let endpoint = "";
    let mappedOptions = [];

    try {
      if (proposalInfo.relatedTo === "lead") {
        endpoint = "getLeadNameAndId";
        const response = await axiosInstance.get(endpoint);
        mappedOptions = response.data.map((lead) => ({
          label: lead.clientName,
          value: lead.leadId,
        }));
      } else if (proposalInfo.relatedTo === "customer") {
        endpoint = "getCustomerListWithNameAndId";
        const response = await axiosInstance.get(endpoint);
        mappedOptions = response.data.map((customer) => ({
          label: customer.companyName,
          value: customer.id,
        }));
      }

      setRelatedIdOptions(mappedOptions);
    } catch (error) {
      console.error(`Failed to load ${proposalInfo.relatedTo} list:`, error);
      toast.error(`Failed to load ${proposalInfo.relatedTo} list.`);
    } finally {
      setIsRelatedIdLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!proposalInfo.proposalNumber)
      newErrors.proposalNumber = "Proposal Number is required";
    if (!proposalInfo.subject.trim()) newErrors.subject = "Subject is required";

    if (!proposalInfo.proposalDate)
      newErrors.proposalDate = "Proposal Date is required";
    if (!proposalInfo.status) newErrors.status = "Status is required";

    if (!proposalInfo.companyName.trim())
      newErrors.companyName = "Company Name is required";
    if (!proposalInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(proposalInfo.email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!proposalInfo.street.trim())
      newErrors.street = "Street Address is required";
    if (!selectedCountry) newErrors.country = "Country is required";
    if (!selectedState) newErrors.state = "State is required";
    if (!selectedCity) newErrors.city = "City is required";
    if (!proposalInfo.zipCode.trim())
      newErrors.zipCode = "Zip Code is required";

    if (!proposalInfo.currencyType)
      newErrors.currencyType = "Currency is required";

    if (
      !proposalInfo.mobileNumber ||
      proposalInfo.mobileNumber.toString().length < 5
    ) {
      newErrors.mobileNumber = "Mobile Number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    setErrors({});
    setLoading(true);

    const payload = {
      proposalInfo: {
        ...proposalInfo,
        proposalId: proposalId,
        proposalNumber: parseInt(proposalInfo.proposalNumber),
        discount: Number(proposalInfo.discount),
        totalAmmount: Number(proposalInfo.totalAmmount),
      },
      proposalContent: proposalContent.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
    };

    try {
      await axiosInstance.put("updateProposal", payload);
      console.log("Form Updated:", payload);

      if (deletedContentIds.length > 0) {
        console.log("Deleting content IDs:", deletedContentIds);
        try {
          await axiosInstance.delete("deleteProposalContent", {
            data: deletedContentIds,
          });
          console.log("Successfully deleted removed items.");
        } catch (deleteError) {
          console.error("Failed to delete proposal content:", deleteError);
          toast.error("Proposal updated, but failed to remove old items.");
        }
      }

      toast.success("Proposal updated successfully!");
      setLoading(false);

      if (role === "ROLE_ADMIN") {
        navigate("/Proposal");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/Proposal");
      }
    } catch (error) {
      console.error("Failed to update proposal:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update proposal. Please check the form."
      );
      setLoading(false);
    }
  };

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 h-[90vh] overflow-y-auto">
        <div className="p-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                if (role === "ROLE_ADMIN") {
                  navigate("/Proposal");
                } else if (role === "ROLE_EMPLOYEE") {
                  navigate("/Employee/Proposal");
                }
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
              Back to Proposal
            </button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Proposal</h1>
              <p className="text-gray-600 text-sm">
                Update the details for this proposal
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              {hasPermission("proposal", "Edit") && (
                <button
                  type="submit"
                  form="editProposalForm"
                  disabled={loading || isRecipientLoading} // <-- MODIFIED
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isRecipientLoading ? ( // <-- MODIFIED
                    "Loading..."
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Update Proposal
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        {pageLoading ? (
          <FormSkeleton />
        ) : (
          <div
            className={`h-[72vh] overflow-hidden ${
              !canEdit ? "disabled-form" : ""
            }`}
          >
            <form
              onSubmit={handleSubmit}
              id="editProposalForm"
              className="mt-4 h-full overflow-y-auto no-scrollbar"
            >
              <div className="bg-white p-6 rounded-lg space-y-8 shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Proposal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInputWithPrefix
                        label="Proposal Number"
                        name="proposalNumber"
                        prefix="PROP-"
                        value={proposalInfo.proposalNumber}
                        onChange={handleInfoChange}
                        required
                        error={errors.proposalNumber}
                        disabled={true}
                        className="md:col-span-1"
                      />
                      <FormInput
                        label="Subject"
                        name="subject"
                        value={proposalInfo.subject}
                        onChange={handleInfoChange}
                        required
                        error={errors.subject}
                        className="md:col-span-1"
                      />
                      <FormSelect
                        label="Related To"
                        name="relatedTo"
                        value={relatedOptions.find(
                          (o) => o.value === proposalInfo.relatedTo
                        )}
                        onChange={(opt) => handleSelectChange("relatedTo", opt)}
                        options={relatedOptions}
                        error={errors.relatedTo}
                      />
                      <FormSelect
                        label="Related Lead/Customer"
                        name="relatedId"
                        value={relatedIdOptions.find(
                          (o) => o.value === proposalInfo.relatedId
                        )}
                        onChange={(opt) => handleSelectChange("relatedId", opt)}
                        options={relatedIdOptions}
                        error={errors.relatedId}
                        onMenuOpen={loadRelatedIdOptions}
                        isLoading={isRelatedIdLoading || isRecipientLoading} // <-- MODIFIED
                        isDisabled={!proposalInfo.relatedTo}
                      />
                      <FormSelect
                        label="Assign To"
                        name="assignTo"
                        value={assignToOptions.find(
                          (o) => o.value === proposalInfo.employeeId
                        )}
                        onChange={(opt) => handleSelectChange("assignTo", opt)}
                        options={assignToOptions}
                        error={errors.assignTo}
                        onMenuOpen={loadAssignToOptions}
                        isLoading={isAssignToLoading}
                      />
                      <FormInput
                        label="Proposal Date"
                        name="proposalDate"
                        value={proposalInfo.proposalDate}
                        onChange={handleInfoChange}
                        type="date"
                        required
                        error={errors.proposalDate}
                      />
                      <FormInput
                        label="Due Date"
                        name="dueDate"
                        value={proposalInfo.dueDate}
                        onChange={handleInfoChange}
                        type="date"
                        error={errors.dueDate}
                      />
                      <FormSelect
                        label="Status"
                        name="status"
                        value={statusOptions.find(
                          (o) => o.value === proposalInfo.status
                        )}
                        onChange={(opt) => handleSelectChange("status", opt)}
                        options={statusOptions}
                        required
                        error={errors.status}
                      />
                    </div>
                  </div>

                  {/* --- Column 2: Recipient Info --- */}
                  <div className="space-y-6 mt-8 lg:mt-0 lg:border-l lg:border-gray-200 lg:pl-8">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Recipient Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="Company Name"
                        name="companyName"
                        value={proposalInfo.companyName}
                        onChange={handleInfoChange}
                        required
                        error={errors.companyName}
                        disabled={isRecipientLoading} // <-- MODIFIED
                      />
                      <FormInput
                        label="Email"
                        name="email"
                        value={proposalInfo.email}
                        onChange={handleInfoChange}
                        type="email"
                        required
                        error={errors.email}
                        disabled={isRecipientLoading} // <-- MODIFIED
                      />
                      <FormPhoneInputFloating
                        label="Mobile Number"
                        name="mobileNumber"
                        value={proposalInfo.mobileNumber}
                        onChange={(phone) =>
                          handlePhoneChange("mobileNumber", phone)
                        }
                        error={errors.mobileNumber}
                        background="white"
                      />
                      <FormInput
                        label="Street Address"
                        name="street"
                        value={proposalInfo.street}
                        onChange={handleInfoChange}
                        required
                        error={errors.street}
                        disabled={isRecipientLoading} // <-- MODIFIED
                      />

                      {/* --- 7. MODIFIED ONCHANGE --- */}
                      <FormSelect
                        label="Country"
                        name="country"
                        value={selectedCountry}
                        onChange={(opt) => {
                          setSelectedCountry(opt);
                          if (opt) {
                            const newStates = State.getStatesOfCountry(
                              opt.value
                            ).map((s) => ({
                              value: s.isoCode,
                              label: s.name,
                              ...s,
                            }));
                            setStates(newStates);
                            setProposalInfo((prev) => ({
                              ...prev,
                              country: opt.label,
                              state: "",
                              city: "",
                            }));
                          } else {
                            setStates([]);
                            setProposalInfo((prev) => ({
                              ...prev,
                              country: "",
                              state: "",
                              city: "",
                            }));
                          }
                          setSelectedState(null);
                          setCities([]);
                          setSelectedCity(null);
                          if (errors.country)
                            setErrors((prev) => ({
                              ...prev,
                              country: "",
                              state: "",
                              city: "",
                            }));
                        }}
                        options={countries}
                        required
                        error={errors.country}
                        disabled={isRecipientLoading} // <-- MODIFIED
                      />

                      {/* --- 8. MODIFIED ONCHANGE --- */}
                      <FormSelect
                        label="State"
                        name="state"
                        value={selectedState}
                        onChange={(opt) => {
                          setSelectedState(opt);
                          if (opt) {
                            const newCities = City.getCitiesOfState(
                              selectedCountry.value,
                              opt.value
                            ).map((c) => ({
                              value: c.name,
                              label: c.name,
                              ...c,
                            }));
                            setCities(newCities);
                            setProposalInfo((prev) => ({
                              ...prev,
                              state: opt.label,
                              city: "",
                            }));
                          } else {
                            setCities([]);
                            setProposalInfo((prev) => ({
                              ...prev,
                              state: "",
                              city: "",
                            }));
                          }
                          setSelectedCity(null);
                          if (errors.state)
                            setErrors((prev) => ({
                              ...prev,
                              state: "",
                              city: "",
                            }));
                        }}
                        options={states}
                        required
                        isDisabled={!selectedCountry || isRecipientLoading} // <-- MODIFIED
                        error={errors.state}
                      />
                      <FormSelect
                        label="City"
                        name="city"
                        value={selectedCity}
                        onChange={(opt) => {
                          setSelectedCity(opt);
                          setProposalInfo((prev) => ({
                            ...prev,
                            city: opt ? opt.value : "",
                          }));
                          if (errors.city)
                            setErrors((prev) => ({ ...prev, city: "" }));
                        }}
                        options={cities}
                        required
                        isDisabled={!selectedState || isRecipientLoading} // <-- MODIFIED
                        error={errors.city}
                      />
                      <FormInput
                        label="Zip Code"
                        name="zipCode"
                        value={proposalInfo.zipCode}
                        onChange={handleInfoChange}
                        required
                        error={errors.zipCode}
                        disabled={isRecipientLoading} // <-- MODIFIED
                      />
                    </div>
                  </div>
                </div>

                {/* --- Section 2: Proposal Items --- */}
                <div className="pt-8 border-t border-gray-200">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Proposal Items
                    </h2>
                    <FormSelect
                      label="Currency"
                      name="currencyType"
                      value={currencyOptions.find(
                        (o) => o.value === proposalInfo.currencyType
                      )}
                      onChange={(opt) =>
                        handleSelectChange("currencyType", opt)
                      }
                      options={currencyOptions}
                      required
                      error={errors.currencyType}
                      className="w-48"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-2/5">
                            Item
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-2/5">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Rate ({currencySymbol})
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-50 divide-y divide-gray-200">
                        {proposalContent.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {/* ITEM FIELD */}
                            <td className="px-2 py-2 align-top">
                              <textarea
                                type="text"
                                name="item"
                                value={item.item}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-full border border-gray-300 rounded-md 
                                         sm:text-sm px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 
                                         focus:ring-blue-500 transition-colors min-h-[40px]"
                                placeholder="Item Name"
                              />
                            </td>

                            {/* DESCRIPTION FIELD */}
                            <td className="px-2 py-2 align-top">
                              <textarea
                                type="text"
                                name="description"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-full border border-gray-300 rounded-lg shadow-sm sm:text-sm
                                         px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 
                                         focus:ring-blue-500 transition-colors min-h-[40px]"
                                placeholder="Description"
                              />
                            </td>

                            {/* QUANTITY FIELD */}
                            <td className="px-2 py-2 align-top">
                              <input
                                type="number"
                                name="quantity"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-20 border border-gray-300 rounded-lg shadow-sm sm:text-sm px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                min="1"
                              />
                            </td>

                            {/* RATE FIELD */}
                            <td className="px-2 py-2 align-top">
                              <input
                                type="number"
                                name="rate"
                                value={item.rate}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-32 border border-gray-300 rounded-lg shadow-sm sm:text-sm px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                min="0"
                                step="0.01"
                              />
                            </td>

                            {/* TOTAL DISPLAY */}
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 font-medium align-top">
                              {currencySymbol}
                              {(item.quantity * item.rate).toFixed(2)}
                            </td>

                            {/* ACTION */}
                            <td className="px-4 py-2 whitespace-nowrap text-center align-top">
                              <button
                                className={`${
                                  canDelete ? "allow-click" : ""
                                } text-red-600 hover:text-red-900 font-medium transition-colors 
      duration-200 flex items-center gap-1 text-xs
      ${
        proposalContent.length === 1 || !canDelete
          ? "pointer-events-none opacity-50"
          : ""
      }`}
                                onClick={() => handleRemoveItem(index)}
                                title="Remove Item"
                                type="button"
                                disabled={proposalContent.length === 1}
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
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  ></path>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add New Item
                  </button>
                </div>

                {/* --- Section 3: Summary --- */}
                <div className="pt-8 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="w-full md:w-1/2 lg:flex-1 space-y-4">
                      <FormTextarea
                        label="Notes"
                        name="notes"
                        value={proposalInfo.notes}
                        onChange={handleInfoChange}
                        rows={5}
                      />
                      <FormTextarea
                        label="Terms & Conditions"
                        name="termsAndConditions"
                        value={proposalInfo.termsAndConditions}
                        onChange={handleInfoChange}
                        rows={8}
                      />
                    </div>
                    <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                        Summary
                      </h2>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium text-gray-800">
                          {currencySymbol}
                          {subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="discount" className="text-gray-600">
                          Discount (%):
                        </label>
                        <input
                          type="number"
                          name="discount"
                          id="discount"
                          value={proposalInfo.discount}
                          onChange={(e) => {
                            let value = parseFloat(e.target.value);
                            if (value > 100) e.target.value = "100";
                            if (value < 0) e.target.value = "0";
                            handleInfoChange(e);
                          }}
                          className="w-20 border border-gray-300 rounded-lg shadow-sm sm:text-sm 
                                        px-1 py-1 outline-none focus:border-blue-500 focus:ring-1 
                                        focus:ring-blue-500 transition-colors"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <Select
                          id="taxType"
                          name="taxType"
                          value={taxOptions.find(
                            (o) => o.value === proposalInfo.taxType
                          )}
                          onChange={(opt) => {
                            if (opt) {
                              handleSelectChange("taxType", opt);
                              setTaxRateInput(opt.defaultRate);
                              setProposalInfo((prev) => ({
                                ...prev,
                                taxPercentage: Number(opt.defaultRate) || 0,
                              }));
                            } else {
                              handleSelectChange("taxType", null);
                              setTaxRateInput("");
                              setProposalInfo((prev) => ({
                                ...prev,
                                taxPercentage: 0,
                              }));
                            }
                          }}
                          options={taxOptions}
                          className="w-full"
                          classNamePrefix="select"
                          menuPlacement="auto"
                        />
                        <FormInput
                          label="Tax %"
                          name="taxRateInput"
                          type="number"
                          value={taxRateInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTaxRateInput(value);
                            setProposalInfo((prev) => ({
                              ...prev,
                              taxPercentage: Number(value) || 0,
                            }));
                          }}
                          disabled={proposalInfo.taxType === "No Tax"}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax Amount:</span>
                        <span className="font-medium text-gray-800">
                          {currencySymbol}
                          {taxAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Grand Total:</span>
                          <span>
                            {currencySymbol}
                            {total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      Signature & Stamp
                    </h2>

                    {/* Loading State Wrapper */}
                    {pageLoading ? (
                      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <span className="text-gray-500">
                          Loading Company Media...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-8">
                        {/* Signature Uploader */}
                        <div className="w-full md:w-1/4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Authorized Signature
                          </label>
                          <CustomeImageUploader
                            initialBase64={proposalInfo.companySignature}
                            onFileChange={(file) =>
                              handleImageUpload(file, "companySignature")
                            }
                          />
                        </div>

                        {/* Stamp Uploader */}
                        <div className="w-full md:w-1/4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Stamp
                          </label>
                          <CustomeImageUploader
                            initialBase64={proposalInfo.companyStamp}
                            onFileChange={(file) =>
                              handleImageUpload(file, "companyStamp")
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-6" />
            </form>
          </div>
        )}
      </div>
    </LayoutComponent>
  );
}

export default EditProposal;
