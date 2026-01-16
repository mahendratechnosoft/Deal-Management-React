// components/expenses/FinancialsTaxSection.jsx
import React, { useState } from "react";
import {
  GlobalInputField,
  GlobalSelectField,
} from "../../BaseComponet/CustomerFormInputs";

const currencyOptions = [
  { value: "INR", label: "INR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

function FinancialsTaxSection({
  formData,
  errors,
  isTaxInclusive,
  setIsTaxInclusive,
  tdsApplicable,
  setTdsApplicable,
  taxableAmountWithoutTax,
  taxAmount,
  totalAmount,
  tdsAmount,
  payableAmount,
  dueAmount,
  taxOptions,
  handleNumberChange,
  handleChange,
  formatCurrency,
  setErrorFieldRef,
}) {
  const [expandedSection, setExpandedSection] = useState(null);

  const getTaxBreakdown = () => {
    if (
      !isTaxInclusive ||
      formData.taxType === "No Tax" ||
      !formData.taxableAmount ||
      formData.taxableAmount <= 0
    ) {
      return null;
    }

    let taxRate = 0;
    let breakdownText = "";

    switch (formData.taxType) {
      case "SGST":
        taxRate = Number(formData.sgstPercentage) || 0;
        breakdownText = `SGST @ ${taxRate}%`;
        break;
      case "CGST":
        taxRate = Number(formData.cgstPercentage) || 0;
        breakdownText = `CGST @ ${taxRate}%`;
        break;
      case "CGST_SGST":
        const cgstRate = Number(formData.cgstPercentage) || 0;
        const sgstRate = Number(formData.sgstPercentage) || 0;
        taxRate = Number(formData.taxPercentage) || 0;
        breakdownText = `CGST @ ${cgstRate}% + SGST @ ${sgstRate}%`;
        break;
      case "GST":
      case "IGST":
      case "Custom":
        taxRate = Number(formData.taxPercentage) || 0;
        breakdownText = `${formData.taxType} @ ${taxRate}%`;
        break;
      default:
        return null;
    }

    if (taxRate === 0) return null;

    const baseAmount = taxableAmountWithoutTax;
    const taxAmountCalculated = taxAmount;

    return {
      baseAmount,
      taxAmount: taxAmountCalculated,
      taxRate,
      total: totalAmount,
      breakdownText,
    };
  };

  const getCurrencySymbol = () => {
    switch (formData.currency) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return "$";
    }
  };

  const handleCgstChange = (value) => {
    const cgstValue = Number(value) || 0;
    const sgstValue = Number(formData.sgstPercentage) || 0;
    handleNumberChange("cgstPercentage", cgstValue);
    handleNumberChange("taxPercentage", cgstValue + sgstValue);
  };

  const handleSgstChange = (value) => {
    const sgstValue = Number(value) || 0;
    const cgstValue = Number(formData.cgstPercentage) || 0;
    handleNumberChange("sgstPercentage", sgstValue);
    handleNumberChange("taxPercentage", cgstValue + sgstValue);
  };

  const renderTaxPercentageInput = () => {
    switch (formData.taxType) {
      case "No Tax":
        return (
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
            <p className="text-sm text-gray-500 italic">No tax applicable</p>
          </div>
        );
      case "SGST":
        return (
          <GlobalInputField
            label="SGST Rate"
            name="sgstPercentage"
            type="number"
            value={formData.sgstPercentage}
            onChange={(e) =>
              handleNumberChange("sgstPercentage", e.target.value)
            }
            error={errors.sgstPercentage}
            min="0"
            max="100"
            step="0.01"
            suffix="%"
            className="text-sm"
            ref={(el) => setErrorFieldRef?.("sgstPercentage", el)}
          />
        );
      case "CGST":
        return (
          <GlobalInputField
            label="CGST Rate"
            name="cgstPercentage"
            type="number"
            value={formData.cgstPercentage}
            onChange={(e) =>
              handleNumberChange("cgstPercentage", e.target.value)
            }
            error={errors.cgstPercentage}
            min="0"
            max="100"
            step="0.01"
            suffix="%"
            className="text-sm"
            ref={(el) => setErrorFieldRef?.("cgstPercentage", el)}
          />
        );
      case "CGST_SGST":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  CGST Rate
                </label>
                <input
                  type="number"
                  name="cgstPercentage"
                  value={formData.cgstPercentage}
                  onChange={(e) => handleCgstChange(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  SGST Rate
                </label>
                <input
                  type="number"
                  name="sgstPercentage"
                  value={formData.sgstPercentage}
                  onChange={(e) => handleSgstChange(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded">
              <p className="text-xs text-blue-700">
                <span className="font-medium">Total GST Rate:</span>{" "}
                {formData.taxPercentage}%
              </p>
            </div>
          </div>
        );
      case "GST":
      case "IGST":
      case "Custom":
        return (
          <GlobalInputField
            label={`${formData.taxType} Rate`}
            name="taxPercentage"
            type="number"
            value={formData.taxPercentage}
            onChange={(e) =>
              handleNumberChange("taxPercentage", e.target.value)
            }
            error={errors.taxPercentage}
            min="0"
            max="100"
            step="0.01"
            suffix="%"
            className="text-sm"
            ref={(el) => setErrorFieldRef?.("taxPercentage", el)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Financials & Tax Calculation
            </h3>
            <p className="text-sm text-gray-500">
              Configure tax settings and calculate final payable amount
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Currency
              </label>
              <GlobalSelectField
                name="currency"
                value={formData.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                options={currencyOptions}
                className="text-sm"
                hideLabel={true}
                error={errors.currency}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-700">
                Tax Calculation Method
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsTaxInclusive(false)}
                  className={`p-4 rounded-lg border transition-all ${
                    !isTaxInclusive
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border mr-2 ${
                        !isTaxInclusive
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        !isTaxInclusive ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      Tax Exclusive
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaxInclusive(true)}
                  className={`p-4 rounded-lg border transition-all ${
                    isTaxInclusive
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border mr-2 ${
                        isTaxInclusive
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isTaxInclusive ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      Tax Inclusive
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-700">
                Amount Details
              </h4>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isTaxInclusive
                    ? "Total Amount (Incl. Tax)"
                    : "Taxable Amount"}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <GlobalInputField
                    name="taxableAmount"
                    type="number"
                    value={formData.taxableAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (!isNaN(value) && Number(value) >= 0)
                      ) {
                        handleNumberChange("taxableAmount", value);
                      }
                    }}
                    error={errors.taxableAmount}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="pl-10 text-sm"
                    prefix={
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                        <span className="text-gray-700 font-medium">
                          {getCurrencySymbol()}
                        </span>
                      </div>
                    }
                    ref={(el) => setErrorFieldRef?.("taxableAmount", el)}
                    hideLabel={true}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isTaxInclusive
                    ? "Enter amount including all taxes"
                    : "Enter amount before tax calculation"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Type <span className="text-red-500">*</span>
            </label>
            <GlobalSelectField
              name="taxType"
              value={formData.taxType}
              onChange={(e) => handleChange("taxType", e.target.value)}
              options={taxOptions}
              className="text-sm"
              error={errors.taxType}
              hideLabel={true}
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-700">
                Tax Rate Configuration
              </h4>
            </div>
            <div className="p-4">
              <div className="space-y-4">{renderTaxPercentageInput()}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                  TDS (Tax Deducted at Source)
                </h4>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={tdsApplicable}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setTdsApplicable(checked);
                      if (!checked) {
                        handleNumberChange("tdsPercentage", 0);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-10 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-700">
                    {tdsApplicable ? "Enabled" : "Disabled"}
                  </span>
                </label>
              </div>
            </div>
            {tdsApplicable && (
              <div className="p-4 space-y-4">
                <GlobalInputField
                  label="TDS Rate (%)"
                  name="tdsPercentage"
                  type="number"
                  value={formData.tdsPercentage}
                  onChange={(e) =>
                    handleNumberChange("tdsPercentage", e.target.value)
                  }
                  min="0"
                  max="100"
                  step="0.01"
                  suffix="%"
                  className="text-sm"
                  error={errors.tdsPercentage}
                  size="small"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">TDS Base Amount</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatCurrency(taxableAmountWithoutTax)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">TDS Amount</p>
                    <p className="text-base font-semibold text-red-600">
                      {formatCurrency(tdsAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-700">
                Financial Summary
              </h4>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs text-gray-500">Currency:</span>
                <span className="text-xs font-medium text-gray-700">
                  {formData.currency}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-xs text-gray-500">Symbol:</span>
                <span className="text-xs font-medium text-gray-700">
                  {getCurrencySymbol()}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Taxable Amount</span>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">
                      {getCurrencySymbol()}
                    </span>
                    <span className="text-base font-medium text-gray-900">
                      {formatCurrency(taxableAmountWithoutTax)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Tax Amount</span>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">
                      {getCurrencySymbol()}
                    </span>
                    <span className="text-base font-medium text-green-600">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">
                      {getCurrencySymbol()}
                    </span>
                    <span className="text-base font-semibold text-blue-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
                {tdsApplicable && (
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">TDS Deduction</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-1">
                        {getCurrencySymbol()}
                      </span>
                      <span className="text-base font-medium text-red-600">
                        - {formatCurrency(tdsAmount)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 border-t border-gray-200 bg-gray-50 -mx-4 px-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      Net Payable Amount
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {tdsApplicable
                        ? "After TDS deduction"
                        : "Total payable amount"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 mr-2">
                      {getCurrencySymbol()}
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(payableAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() =>
            setExpandedSection(
              expandedSection === "breakdown" ? null : "breakdown"
            )
          }
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <div className="flex items-center">
            <svg
              className={`w-5 h-5 text-gray-500 mr-2 transition-transform ${
                expandedSection === "breakdown" ? "rotate-90" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <h4 className="text-sm font-semibold text-gray-700">
              Detailed Calculation Breakdown
            </h4>
          </div>
          <span className="text-xs text-blue-600 font-medium">
            {expandedSection === "breakdown" ? "Hide Details" : "Show Details"}
          </span>
        </button>

        {expandedSection === "breakdown" && (
          <div className="px-4 pb-4 border-t border-gray-200">
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">
                  Calculation Method
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Tax Calculation:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {isTaxInclusive ? "Tax Inclusive" : "Tax Exclusive"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Currency:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.currency} ({getCurrencySymbol()})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Base Amount:</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-1">
                        {getCurrencySymbol()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(taxableAmountWithoutTax)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">
                  Tax Details
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax Rate:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.taxType === "CGST_SGST"
                        ? `CGST ${formData.cgstPercentage}% + SGST ${formData.sgstPercentage}%`
                        : `${
                            formData.taxPercentage ||
                            formData.cgstPercentage ||
                            formData.sgstPercentage ||
                            0
                          }%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax Amount:</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-1">
                        {getCurrencySymbol()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(taxAmount)}
                      </span>
                    </div>
                  </div>
                  {tdsApplicable && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        TDS Applied:
                      </span>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1">
                          {getCurrencySymbol()}
                        </span>
                        <span className="text-sm font-medium text-red-600">
                          {formData.tdsPercentage}% ({formatCurrency(tdsAmount)}
                          )
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Calculation Formula
              </h5>
              <div className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-600 font-mono">
                  {isTaxInclusive ? (
                    <>
                      Base Amount = Total / (1 + Tax Rate)
                      <br />
                      Tax Amount = Total - Base Amount
                    </>
                  ) : (
                    <>
                      Tax Amount = Base Amount × Tax Rate
                      <br />
                      Total Amount = Base Amount + Tax Amount
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialsTaxSection;
