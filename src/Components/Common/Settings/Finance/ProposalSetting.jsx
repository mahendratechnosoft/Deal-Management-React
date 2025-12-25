import {
  FormInput,
  FormTextarea,
} from "../../../BaseComponet/CustomeFormComponents";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../BaseComponet/axiosInstance";

const ProposalSetting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [financeSettings, setFinanceSettings] = useState({
    financeSettingId: null,
    prefix: "",
    type: "PROPOSAL",
    dueDays: 0,
    notes: "",
    termsAndConditions: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchFinanceSettings = async () => {
      try {
        const response = await axiosInstance.get(
          "getFinanceSettingByType/PROPOSAL"
        );
        const data = response.data;
        setFinanceSettings({ ...data, type: "PROPOSAL" });
      } catch (error) {
        toast.error("Failed to fetch finance settings.");
      }
    };
    fetchFinanceSettings();
  }, []);

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setFinanceSettings((prev) => {
      const newState = { ...prev, [name]: value };
      return newState;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(
        "updateFinanceSetting",
        financeSettings
      );
      setFinanceSettings(response.data);
    } catch (err) {
      toast.error("Failed to update profile. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Proposal</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage your proposal settings
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                Saving...
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
      <hr />
      <div className="p-4 h-[70vh] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormInput
            label="Proposal Prifix"
            name="prefix"
            value={financeSettings.prefix}
            onChange={handleInfoChange}
            type="text"
            error={errors.prefix}
          />
          <FormInput
            label="Proposal Due After (days)"
            name="dueDays"
            value={financeSettings.dueDays}
            onChange={handleInfoChange}
            type="number"
            error={errors.prefix}
          />
          <div className="flex flex-col gap-2 mb-2">
            <label className="text-sm font-medium text-gray-700">
              Number Format
            </label>
            <div className="flex flex-wrap gap-6">
              {/* Option 1: Number Based */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="numberFormat"
                  value="NUMBER"
                  checked={financeSettings.numberFormat === "NUMBER"}
                  onChange={handleInfoChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Number Based (000001)
                </span>
              </label>

              {/* Option 2: Year Based */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="numberFormat"
                  value="YEAR"
                  checked={financeSettings.numberFormat === "YEAR"}
                  onChange={handleInfoChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Year Based (YYYY/000001)
                </span>
              </label>
            </div>
          </div>

          <FormTextarea
            label="Predefined Notes"
            name="notes"
            value={financeSettings.notes}
            onChange={handleInfoChange}
            rows={5}
          />
          <FormTextarea
            label="Predefined Terms & Conditions"
            name="termsAndConditions"
            value={financeSettings.termsAndConditions}
            onChange={handleInfoChange}
            rows={5}
          />
        </div>
      </div>
    </>
  );
};

export default ProposalSetting;
