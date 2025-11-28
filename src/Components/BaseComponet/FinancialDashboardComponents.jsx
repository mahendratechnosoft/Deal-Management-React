import React from "react";

// --- Utilities (Internal to this file) ---
const formatNumber = (amount) => {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    return value.toFixed(2);
  }
};

// ---------------------------------------------------------
// SKELETON LOADER COMPONENT
// ---------------------------------------------------------
const DashboardSkeleton = () => {
  return (
    <div className="animate-pulse space-y-3">
      {/* Row 1: Money Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={`money-skel-${i}`}
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
          >
            <div className="flex-1 mr-2">
              <div className="h-2 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="w-9 h-9 bg-gray-200 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Row 2: Progress Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={`prog-skel-${i}`}
            className="bg-white rounded-lg border border-gray-200 p-3"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 w-full">
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="h-2 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded w-8"></div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div className="bg-gray-200 h-1.5 rounded-full w-2/3"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-2 bg-gray-200 rounded w-16"></div>
              <div className="h-2 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 1. DASHBOARD WRAPPER (Handles Animation & Date Picker)
// ---------------------------------------------------------
export const DashboardWrapper = ({
  isOpen,
  children,
  title = "Overview",
  dateRange,
  setDateRange,
  isLoading,
}) => {
  // Validation Logic inside the wrapper so you don't repeat it
  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    if (dateRange.endDate && newStart > dateRange.endDate) {
      setDateRange({ startDate: newStart, endDate: newStart });
    } else {
      setDateRange({ ...dateRange, startDate: newStart });
    }
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value;
    if (dateRange.startDate && newEnd < dateRange.startDate) {
      setDateRange({ startDate: newEnd, endDate: newEnd });
    } else {
      setDateRange({ ...dateRange, endDate: newEnd });
    }
  };

  return (
    <div
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isOpen ? "max-h-[800px] opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
      }`}
    >
      <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {title}
          </h2>

          <div className="flex items-center bg-white rounded-md border border-gray-300 px-2 py-1 gap-2">
            <span className="text-[10px] text-gray-400 font-medium uppercase">
              Range:
            </span>
            <input
              type="date"
              value={dateRange.startDate}
              max={dateRange.endDate}
              onChange={handleStartDateChange}
              className="border-none p-0 text-xs text-gray-600 focus:ring-0 cursor-pointer bg-transparent w-24"
            />
            <span className="text-gray-300 text-xs">-</span>
            <input
              type="date"
              value={dateRange.endDate}
              min={dateRange.startDate}
              onChange={handleEndDateChange}
              className="border-none p-0 text-xs text-gray-600 focus:ring-0 cursor-pointer bg-transparent w-24"
            />
          </div>
        </div>

        {/* Content Area - Now uses DashboardSkeleton */}
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-3">{children}</div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 2. MONEY CARD (Top Row - Amount Display)
// ---------------------------------------------------------
export const MoneyCard = ({ title, amount, iconColorClass, icon }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:border-blue-300 transition-colors duration-200">
    <div className="overflow-hidden mr-2">
      <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-0.5 truncate">
        {title}
      </p>
      <h3
        className="text-lg font-bold text-gray-900 truncate"
        title={formatNumber(amount)}
      >
        {formatNumber(amount)}
      </h3>
    </div>
    <div
      className={`flex-shrink-0 p-2 rounded-md border ${iconColorClass} bg-opacity-0`}
    >
      {icon}
    </div>
  </div>
);

// ---------------------------------------------------------
// 3. PROGRESS CARD (Bottom Row - Counts & % Bars)
// ---------------------------------------------------------
export const ProgressCard = ({ label, count, total, barColorClass }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${barColorClass}`}></span>
          <span className="text-xs font-semibold text-gray-700">{label}</span>
        </div>
        <span className="text-xs font-bold text-gray-900">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center text-[10px] text-gray-400">
        <span>
          Count: <span className="text-gray-600 font-medium">{count}</span>
        </span>
        <span>Total: {total}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 4. OVERDUE/ALERT CARD (Special Style)
// ---------------------------------------------------------
export const AlertCard = ({
  label = "Overdue",
  count,
  subtext = "Invoices",
}) => (
  <div className="bg-white rounded-lg border border-red-200 p-3 flex items-center justify-between">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        <span className="text-xs font-bold text-red-700 uppercase">
          {label}
        </span>
      </div>
      <div className="text-xs text-red-500">
        <span className="font-bold text-lg text-red-700 mr-1">{count}</span>
        {subtext}
      </div>
    </div>
    <div className="p-2 bg-red-50 rounded-md">
      <svg
        className="w-4 h-4 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
  </div>
);
