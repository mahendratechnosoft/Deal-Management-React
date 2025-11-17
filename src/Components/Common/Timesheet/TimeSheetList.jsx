import React, { useEffect, useState } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import Select from "react-select";


const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

// Colors (change easily if you want)
const COLORS = {
    noRecord: "#FEE2E2", // light red
    present: "#CBD5F5",  // light blue
    selected: "#FACC15", // yellow
};

function formatYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function addDays(date, diff) {
    const d = new Date(date);
    d.setDate(d.getDate() + diff);
    return d;
}

// Build list of dates between from & to (inclusive)
function buildDateList(fromStr, toStr) {
    if (!fromStr || !toStr) return [];
    const dates = [];
    let current = new Date(fromStr);
    const end = new Date(toStr);

    while (current <= end) {
        dates.push({
            key: formatYMD(current),
            date: new Date(current),
        });
        current = addDays(current, 1);
    }
    return dates;
}

// Calculate duration and first/last timestamps for a single day
function calculateDayStats(records = []) {
    if (!records || records.length === 0) {
        return {
            firstIn: null,
            lastOut: null,
            totalMs: 0,
        };
    }

    // Sort by timestamp ascending
    const sorted = [...records].sort(
        (a, b) => a.timeStamp - b.timeStamp
    );

    const firstIn = new Date(sorted[0].timeStamp);
    const lastOut = new Date(sorted[sorted.length - 1].timeStamp);

    // Pairwise duration (0-1, 2-3, ...)
    let totalMs = 0;
    for (let i = 0; i < sorted.length; i += 2) {
        const start = new Date(sorted[i].timeStamp);
        const end = sorted[i + 1]
            ? new Date(sorted[i + 1].timeStamp)
            : start; // if odd count, ignore or 0
        totalMs += Math.max(0, end - start);
    }

    return { firstIn, lastOut, totalMs };
}

// Format 0h 9m
function formatDuration(ms) {
    if (!ms || ms <= 0) return "0h 0m";
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}

// Format time like "11:52 am (GMT+5:30)"
function formatTime(date) {
    if (!date) return "-";
    const time = date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    });
    return `${time} (GMT+5:30)`;
}

// Format time without timezone
function formatTimeSimple(date) {
    if (!date) return "-";
    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    });
}

// Period label in header
function getPeriodLabel(viewType, currentDate) {
    const optionsMonth = { month: "long", year: "numeric" };
    const optionsDay = {
        weekday: "short",
        month: "short",
        day: "numeric",
    };

    if (viewType === "monthly") {
        return currentDate.toLocaleDateString("en-IN", optionsMonth);
    }

    if (viewType === "weekly") {
        const start = addDays(currentDate, -currentDate.getDay() + 1); // Monday
        const end = addDays(start, 6);
        const startStr = start.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
        });
        const endStr = end.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
        });
        return `${startStr} - ${endStr}`;
    }

    // daily
    return currentDate.toLocaleDateString("en-IN", optionsDay);
}


function TimeSheetList() {
    const { LayoutComponent } = useLayout();

    const [viewType, setViewType] = useState("monthly"); // monthly | weekly | daily
    const [currentDate, setCurrentDate] = useState(new Date());

    const [range, setRange] = useState({ from: "", to: "" });
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);

    const [clickPopup, setClickPopup] = useState(null);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState({ value: "all", label: "All Employees" });

    // ------------------------------------------------
    // Calculate date range when viewType or currentDate changes
    // ------------------------------------------------
    useEffect(() => {
        const now = new Date(currentDate);

        if (viewType === "monthly") {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setRange({
                from: formatYMD(start),
                to: formatYMD(end),
            });
        } else if (viewType === "weekly") {
            // Week Monday -> Sunday
            const day = now.getDay();
            const monday = addDays(now, day === 0 ? -6 : 1 - day);
            const sunday = addDays(monday, 6);
            setRange({
                from: formatYMD(monday),
                to: formatYMD(sunday),
            });
        } else {
            // daily
            const d = formatYMD(now);
            setRange({ from: d, to: d });
        }
    }, [viewType, currentDate]);

    // ------------------------------------------------
    // Fetch attendance for range
    // ------------------------------------------------
    function normalize(dateStr) {
        if (!dateStr) return dateStr;

        // Convert 2025-11-15T00:00:00 to 2025-11-15
        return dateStr.split("T")[0];
    }


    useEffect(() => {
        axiosInstance.get("getEmployeeNameAndId")   // <-- Change to your API endpoint
            .then(res => {
                const options = [
                    { value: "all", label: "All Employees" },
                    ...res.data.map(emp => ({
                        value: emp.employeeId,
                        label: emp.name
                    }))
                ];
                setEmployeeOptions(options);
            })
            .catch(err => console.error(err));
    }, []);


    useEffect(() => {
        if (!range.from || !range.to) return;

        setLoading(true);

        const empQuery = selectedEmployee.value !== "all"
            ? `employeeId=${selectedEmployee.value}&`
            : "";

        axiosInstance
            .get(`getAttendanceBetween?${empQuery}fromDate=${range.from}&toDate=${range.to}`)
            .then((res) => {

                // CASE 1: Backend returned a string message (NO DATA)
                if (typeof res.data === "string") {
                    setAttendance({});
                    return;
                }

                // CASE 2: Valid attendance object
                const cleaned = {};
                Object.keys(res.data || {}).forEach(emp => {
                    cleaned[emp] = {};
                    Object.keys(res.data[emp]).forEach(dateKey => {
                        cleaned[emp][dateKey.split("T")[0]] = res.data[emp][dateKey];
                    });
                });

                setAttendance(cleaned);
            })
            .catch(() => {
                toast.error("Failed to load attendance");
                setAttendance({});
            })
            .finally(() => setLoading(false));
    }, [range, selectedEmployee]);


    const dateList = buildDateList(range.from, range.to);

    // Filter employees based on search query
    const employeeNames = Object.keys(attendance || {});

    const noData = employeeNames.length === 0;

    // Navigation buttons (prev / next)
    const handlePrev = () => {
        if (viewType === "monthly") {
            setCurrentDate(
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                )
            );
        } else if (viewType === "weekly") {
            setCurrentDate(addDays(currentDate, -7));
        } else {
            setCurrentDate(addDays(currentDate, -1));
        }
    };

    const handleNext = () => {
        if (viewType === "monthly") {
            setCurrentDate(
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                )
            );
        } else if (viewType === "weekly") {
            setCurrentDate(addDays(currentDate, 7));
        } else {
            setCurrentDate(addDays(currentDate, 1));
        }
    };

    // Advanced popup positioning function
    const calculatePopupPosition = (triggerRect, popupWidth = 280, popupHeight = 200) => {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollX: window.scrollX,
            scrollY: window.scrollY
        };

        const positions = {
            top: {
                x: triggerRect.left + triggerRect.width / 2 - popupWidth / 2,
                y: triggerRect.top - popupHeight - 10,
                placement: 'top'
            },
            bottom: {
                x: triggerRect.left + triggerRect.width / 2 - popupWidth / 2,
                y: triggerRect.bottom + 10,
                placement: 'bottom'
            },
            left: {
                x: triggerRect.left - popupWidth - 10,
                y: triggerRect.top + triggerRect.height / 2 - popupHeight / 2,
                placement: 'left'
            },
            right: {
                x: triggerRect.right + 10,
                y: triggerRect.top + triggerRect.height / 2 - popupHeight / 2,
                placement: 'right'
            }
        };

        // Check which positions are valid
        const validPositions = Object.entries(positions).filter(([key, pos]) => {
            const fitsHorizontally = pos.x >= 10 && pos.x + popupWidth <= viewport.width - 10;
            const fitsVertically = pos.y >= viewport.scrollY + 10 &&
                pos.y + popupHeight <= viewport.scrollY + viewport.height - 10;

            return fitsHorizontally && fitsVertically;
        });

        // Return the first valid position, or default to bottom with adjustments
        if (validPositions.length > 0) {
            const [placement, position] = validPositions[0];
            return {
                ...position,
                placement,
                adjusted: false
            };
        }

        // If no perfect fit, use bottom position with boundary adjustments
        let x = Math.max(10, Math.min(triggerRect.left, viewport.width - popupWidth - 10));
        let y = Math.max(
            viewport.scrollY + 10,
            Math.min(triggerRect.bottom + 10, viewport.scrollY + viewport.height - popupHeight - 10)
        );

        return {
            x,
            y,
            placement: 'bottom',
            adjusted: true
        };
    };



    const onDayBoxClick = (employeeName, dateKey, records) => {
        if (!records || records.length === 0) return;

        setClickPopup({
            employeeName,
            dateKey,
            records,
        });
    };

    const closePopup = () => {
        setClickPopup(null);
    };

    // Get color for a day cell
    const getDayColor = (dateKey, employeeName, selected) => {
        const records =
            attendance[employeeName] && attendance[employeeName][dateKey];

        if (selected) return COLORS.selected;
        if (!records || records.length === 0) return COLORS.noRecord;
        return COLORS.present;
    };

    // For monthly/weekly total per employee
    const getEmployeeTotalDuration = (employeeName) => {
        const empData = attendance[employeeName] || {};
        let totalMs = 0;

        dateList.forEach(({ key }) => {
            const records = empData[key] || [];
            const { totalMs: dayMs } = calculateDayStats(records);
            totalMs += dayMs;
        });

        return totalMs;
    };

    const periodLabel = getPeriodLabel(viewType, currentDate);


    // ------------------------------------------------
    // RENDER
    // ------------------------------------------------


    function buildTimePairs(records) {
        if (!records || records.length === 0) return [];

        const sorted = [...records].sort((a, b) => a.timeStamp - b.timeStamp);

        const pairs = [];
        let lastIn = null;

        sorted.forEach(rec => {

            if (rec.status) {
                // TRUE = CHECK-IN
                if (!lastIn) {
                    lastIn = rec; // first IN
                }
            } else {
                // FALSE = CHECK-OUT
                if (lastIn) {
                    pairs.push({
                        in: lastIn,
                        out: rec,
                    });
                    lastIn = null;
                }
            }
        });

        // if the last record is IN without OUT
        if (lastIn) {
            pairs.push({ in: lastIn, out: null });
        }

        return pairs;
    }


    function getTotalTimeFromPairs(pairs) {
        let total = 0;

        pairs.forEach(p => {
            if (p.out) {
                total += (new Date(p.out.timeStamp) - new Date(p.in.timeStamp));
            }
        });

        return total;
    }

    function getDailyTotal(records) {
        const pairs = buildTimePairs(records);
        return getTotalTimeFromPairs(pairs);
    }



    return (
        <LayoutComponent>
            <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">

           <div className="flex flex-col gap-4 mb-2">
    {/* For screens larger than 768px (md and above) */}
    <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
            <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
                </div>
            </div>
        </div>

        {/* RIGHT SECTION - All Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 ml-auto">
            {/* View Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* View dropdown */}
                <div className="relative">
                    <select
                        className="border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none pr-10"
                        value={viewType}
                        onChange={(e) => setViewType(e.target.value)}
                    >
                        <option value="monthly">Monthly View</option>
                        <option value="weekly">Weekly View</option>
                        <option value="daily">Daily View</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={handlePrev}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[140px] text-center">
                        {periodLabel}
                    </div>
                    <button
                        onClick={handleNext}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-64">
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        options={employeeOptions}
                        value={selectedEmployee}
                        onChange={setSelectedEmployee}
                        placeholder="Select Employee"
                    />
                </div>
            </div>
        </div>
    </div>

    {/* For screens 768px and below (mobile) */}
    <div className="md:hidden flex flex-col gap-4">
        {/* First Row: Title + View Dropdown */}
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
                </div>
            </div>
            
            {/* View Dropdown on right side */}
            <div className="relative">
                <select
                    className="border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none pr-10"
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value)}
                >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>

        {/* Second Row: Navigation buttons (left) + Employee dropdown (right) */}
        <div className="flex items-center justify-between gap-4">
            {/* Navigation buttons on left */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button
                    onClick={handlePrev}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[120px] text-center">
                    {periodLabel}
                </div>
                <button
                    onClick={handleNext}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Employee dropdown on right */}
            <div className="w-48">
                <Select
                    className="basic-single"
                    classNamePrefix="select"
                    options={employeeOptions}
                    value={selectedEmployee}
                    onChange={setSelectedEmployee}
                    placeholder="Select Employee"
                />
            </div>
        </div>
    </div>
</div>


                {/* MAIN CARD */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 flex-1 overflow-y-auto h-[72vh] overflow-y-auto CRM-scroll-width-none">
                    {/* CONTENT SECTION */}
                    <div className="p-1">
                        {loading && (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {/* MAIN CONTENT */}
                        <div className="relative overflow-x-auto">
                            {viewType === "daily" ? (
                                /* ---------------------- DAILY VIEW ---------------------- */
                                <div>
                                    {/* Desktop View (md and above) */}
                                    <div className="hidden md:block">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="text-left px-6 py-4 w-60 font-semibold text-gray-900">Member</th>
                                                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Start Time</th>
                                                    <th className="text-left px-6 py-4 font-semibold text-gray-900">End Time</th>
                                                    <th className="text-left px-6 py-4 font-semibold text-gray-900">All Check-ins/outs</th>
                                                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {/* ---- NO DATA MESSAGE ---- */}
                                                {noData && (
                                                    <tr>
                                                        <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                                                            No attendance records found
                                                        </td>
                                                    </tr>
                                                )}

                                                {/* ---- EMPLOYEE ROWS ---- */}
                                                {!noData &&
                                                    employeeNames.map((emp) => {
                                                        const empData = attendance[emp] || {};
                                                        const records = empData[range.from] || [];

                                                        const pairs = buildTimePairs(records);
                                                        const totalMs = getTotalTimeFromPairs(pairs);

                                                        const firstIn =
                                                            pairs.length > 0 ? new Date(pairs[0].in.timeStamp) : null;

                                                        const lastPair = pairs[pairs.length - 1];
                                                        const lastOut = lastPair?.out
                                                            ? new Date(lastPair.out.timeStamp)
                                                            : null;

                                                        return (
                                                            <tr
                                                                key={emp}
                                                                className="hover:bg-gray-50 transition-colors duration-150"
                                                            >
                                                                <td className="px-6 py-4 flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                                                                        {emp?.trim()?.charAt(0)?.toUpperCase() || "?"}
                                                                    </div>
                                                                    <span className="font-medium text-gray-900 break-words whitespace-normal line-clamp-2 min-w-0">
                                                                        {emp}
                                                                    </span>
                                                                </td>

                                                                <td className="px-6 py-4 text-gray-700">
                                                                    {firstIn ? formatTime(firstIn) : "-"}
                                                                </td>

                                                                <td className="px-6 py-4 text-gray-700">
                                                                    {lastOut ? formatTime(lastOut) : "-"}
                                                                </td>

                                                                <td className="px-6 py-4">
                                                                    {records.length > 0 ? (
                                                                        <button
                                                                            onClick={() => onDayBoxClick(emp, range.from, records)}
                                                                            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                                                        >
                                                                            View Logs
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-xs">No logs</span>
                                                                    )}
                                                                </td>

                                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                                    {formatDuration(totalMs)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile View (below md) */}
                                    <div className="md:hidden">
                                        {/* Mobile Header */}
                                        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                                            <div className="text-sm font-semibold text-gray-900">Daily View</div>
                                            <div className="text-xs text-gray-600 text-right">
                                                {new Date(range.from).toLocaleDateString("en-IN", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </div>
                                        </div>

                                        {/* Mobile Employee Cards */}
                                        <div className="divide-y divide-gray-200">
                                            {noData ? (
                                                <div className="text-center py-8 text-gray-500 text-sm">
                                                    No attendance records found
                                                </div>
                                            ) : (
                                                employeeNames.map((emp) => {
                                                    const empData = attendance[emp] || {};
                                                    const records = empData[range.from] || [];

                                                    const pairs = buildTimePairs(records);
                                                    const totalMs = getTotalTimeFromPairs(pairs);

                                                    const firstIn = pairs.length > 0 ? new Date(pairs[0].in.timeStamp) : null;
                                                    const lastPair = pairs[pairs.length - 1];
                                                    const lastOut = lastPair?.out ? new Date(lastPair.out.timeStamp) : null;

                                                    return (
                                                        <div key={emp} className="p-4 hover:bg-gray-50">
                                                            {/* Employee Header */}
                                                            <div className="flex items-start gap-3 mb-4">
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                                                                    {emp?.trim()?.charAt(0)?.toUpperCase() || "?"}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="text-sm font-medium text-gray-900 break-words whitespace-normal line-clamp-2">
                                                                        {emp}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        Total: <span className="font-semibold">{formatDuration(totalMs)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Time Information */}
                                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                                <div className="bg-gray-50 rounded-lg p-3">
                                                                    <div className="text-xs text-gray-500 mb-1">Start Time</div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {firstIn ? formatTimeSimple(firstIn) : "-"}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-gray-50 rounded-lg p-3">
                                                                    <div className="text-xs text-gray-500 mb-1">End Time</div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {lastOut ? formatTimeSimple(lastOut) : "-"}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex justify-between items-center">
                                                                <div className="text-xs text-gray-500">
                                                                    {records.length} record{records.length !== 1 ? 's' : ''}
                                                                </div>
                                                                {records.length > 0 ? (
                                                                    <button
                                                                        onClick={() => onDayBoxClick(emp, range.from, records)}
                                                                        className="px-3 py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                                                                    >
                                                                        View All Logs
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs">No logs available</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* ---- NO DATA MESSAGE FOR WEEKLY / MONTHLY ---- */}
                                    {noData && (
                                        <div className="py-8 text-center text-gray-500 text-sm">
                                            No attendance records found
                                        </div>
                                    )}

                                    {/* ---------------------- MONTHLY VIEW ---------------------- */}
                                    {/* ---------------------- MONTHLY VIEW ---------------------- */}
                                    {viewType === "monthly" && !noData && (
                                        <div className="w-full">
                                            {/* Desktop View (md and above) */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <div className="flex border-b border-gray-200 bg-gray-50 min-w-max">
                                                    <div className="px-6 py-4 w-60 text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                                                        Member
                                                    </div>

                                                    <div className="flex flex-1">
                                                        {dateList.map(({ key, date }) => (
                                                            <div key={key} className="text-center py-2 min-w-[30px] flex-1">
                                                                <div className="text-gray-500 text-xs font-medium mb-1">
                                                                    {DAY_LETTERS[date.getDay()]}
                                                                </div>
                                                                <div className="font-semibold text-gray-900 text-sm">
                                                                    {date.getDate()}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="px-6 py-4 w-24 text-right text-sm font-semibold text-gray-900 sticky right-0 bg-gray-50">
                                                        Total
                                                    </div>
                                                </div>

                                                {/* Employee rows - Desktop */}
                                                {employeeNames.map((emp) => {
                                                    const empData = attendance[emp] || {};
                                                    let totalMs = 0;

                                                    dateList.forEach(({ key }) => {
                                                        const records = empData[key] || [];
                                                        totalMs += getTotalTimeFromPairs(buildTimePairs(records));
                                                    });

                                                    return (
                                                        <div
                                                            key={emp}
                                                            className="flex items-stretch border-b border-gray-200 hover:bg-gray-50 min-w-max"
                                                        >
                                                            {/* Updated Employee Name Section */}
                                                            <div className="px-6 py-4 w-60 flex items-start gap-3 sticky left-0 bg-white z-10">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0 mt-1">
                                                                    {emp?.trim()?.charAt(0)?.toUpperCase() || "?"}
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-900 break-words whitespace-normal line-clamp-2 min-w-0 flex-1">
                                                                    {emp}
                                                                </span>
                                                            </div>

                                                            <div className="flex flex-1 py-4">
                                                                {dateList.map(({ key }) => {
                                                                    const records = empData[key] || [];
                                                                    const color = getDayColor(key, emp, false);

                                                                    return (
                                                                        <div
                                                                            key={key}
                                                                            className="flex justify-center items-center min-w-[30px] flex-1"
                                                                        >
                                                                            <div
                                                                                className="w-5 h-5 rounded-lg cursor-pointer border-2 border-gray-100 hover:border-gray-300 transition-all duration-200 hover:scale-110"
                                                                                style={{ backgroundColor: color }}
                                                                                onClick={() => onDayBoxClick(emp, key, records)}
                                                                            />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            <div className="px-6 py-4 w-24 text-right text-sm font-semibold text-gray-900 sticky right-0 bg-white">
                                                                {formatDuration(totalMs)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Mobile View (below md) */}
                                            <div className="md:hidden">
                                                {/* Mobile Header */}
                                                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                                                    <div className="text-sm font-semibold text-gray-900">Monthly View</div>
                                                    <div className="text-xs text-gray-600 text-right">
                                                        {periodLabel}
                                                    </div>
                                                </div>

                                                {/* Mobile Employee Cards */}
                                                <div className="divide-y divide-gray-200">
                                                    {employeeNames.map((emp) => {
                                                        const empData = attendance[emp] || {};
                                                        let totalMs = 0;
                                                        let presentDays = 0;
                                                        let absentDays = 0;

                                                        dateList.forEach(({ key }) => {
                                                            const records = empData[key] || [];
                                                            totalMs += getTotalTimeFromPairs(buildTimePairs(records));
                                                            if (records.length > 0) {
                                                                presentDays++;
                                                            } else {
                                                                absentDays++;
                                                            }
                                                        });

                                                        return (
                                                            <div key={emp} className="p-4 hover:bg-gray-50">
                                                                {/* Updated Employee Header Mobile */}
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0 mt-1">
                                                                            {emp?.trim()?.charAt(0)?.toUpperCase() || "?"}
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="text-sm font-medium text-gray-900 break-words whitespace-normal line-clamp-3">
                                                                                {emp}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                Total: {formatDuration(totalMs)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Rest of mobile content remains same */}
                                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                                    <div className="text-center p-2 bg-green-50 rounded-lg">
                                                                        <div className="text-green-700 font-semibold text-sm">{presentDays}</div>
                                                                        <div className="text-green-600 text-xs">Present</div>
                                                                    </div>
                                                                    <div className="text-center p-2 bg-red-50 rounded-lg">
                                                                        <div className="text-red-700 font-semibold text-sm">{absentDays}</div>
                                                                        <div className="text-red-600 text-xs">Absent</div>
                                                                    </div>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                                                            <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
                                                                                {day}
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    <div className="grid grid-cols-7 gap-1">
                                                                        {dateList.map(({ key, date }) => {
                                                                            const records = empData[key] || [];
                                                                            const color = getDayColor(key, emp, false);

                                                                            return (
                                                                                <div
                                                                                    key={key}
                                                                                    className="aspect-square flex items-center justify-center relative"
                                                                                    onClick={() => onDayBoxClick(emp, key, records)}
                                                                                >
                                                                                    <div
                                                                                        className="w-6 h-6 rounded-md cursor-pointer border border-gray-200 flex items-center justify-center text-xs font-medium"
                                                                                        style={{ backgroundColor: color }}
                                                                                    >
                                                                                        {date.getDate()}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-center gap-4 text-xs">
                                                                    <div className="flex items-center gap-1">
                                                                        <div className="w-3 h-3 rounded bg-red-200"></div>
                                                                        <span className="text-gray-600">Absent</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <div className="w-3 h-3 rounded bg-blue-200"></div>
                                                                        <span className="text-gray-600">Present</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* ---------------------- WEEKLY VIEW ---------------------- */}
                                    {viewType === "weekly" && !noData && (
                                        <div className="w-full">
                                            {/* Desktop View (md and above) */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <div className="flex border-b border-gray-200 bg-gray-50 min-w-max">
                                                    <div className="px-6 py-4 w-60 text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                                                        Member
                                                    </div>

                                                    <div className="flex flex-1">
                                                        {dateList.map(({ key, date }) => (
                                                            <div
                                                                key={key}
                                                                className="text-center py-2 min-w-[100px] flex-1"
                                                            >
                                                                <div className="text-gray-500 text-xs font-medium">
                                                                    {DAY_LETTERS[date.getDay()]}
                                                                </div>
                                                                <div className="font-semibold text-gray-900 text-sm">
                                                                    {date.getDate()}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="px-6 py-4 w-24 text-right text-sm font-semibold text-gray-900 sticky right-0 bg-gray-50">
                                                        Total
                                                    </div>
                                                </div>

                                                {/* Employee Rows - Desktop */}
                                                {employeeNames.map((emp) => {
                                                    const empData = attendance[emp] || {};
                                                    let totalMs = 0;

                                                    dateList.forEach(({ key }) => {
                                                        const records = empData[key] || [];
                                                        totalMs += getTotalTimeFromPairs(buildTimePairs(records));
                                                    });

                                                    return (
                                                        <div
                                                            key={emp}
                                                            className="flex border-b border-gray-200 hover:bg-gray-50 min-w-max"
                                                        >
                                                            {/* Employee Profile - Desktop */}
                                                            {/* Monthly View - Employee Name Section */}
                                                            <div className="px-6 py-4 w-60 flex items-center gap-3 sticky left-0 bg-white z-10">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                                                                    {emp?.trim()?.charAt(0)?.toUpperCase() || "?"}
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-900 break-words whitespace-normal line-clamp-2 min-w-0">
                                                                    {emp}
                                                                </span>
                                                            </div>

                                                            {/* Days Grid - Desktop */}
                                                            <div className="flex flex-1">
                                                                {dateList.map(({ key }) => {
                                                                    const records = empData[key] || [];
                                                                    const pairs = buildTimePairs(records);
                                                                    const { firstIn, lastOut } = calculateDayStats(records);
                                                                    const color = getDayColor(key, emp, false);

                                                                    return (
                                                                        <div
                                                                            key={key}
                                                                            className="border border-gray-200 rounded-md flex flex-col items-center justify-center text-center p-1 min-w-[100px] flex-1 mx-1 my-2"
                                                                            style={{
                                                                                backgroundColor: color,
                                                                                minHeight: "60px"
                                                                            }}
                                                                            onClick={() => onDayBoxClick(emp, key, records)}
                                                                        >
                                                                            {records.length > 0 ? (
                                                                                <div className="space-y-1">
                                                                                    <div className="text-[10px] text-gray-800 font-medium">
                                                                                        {firstIn ? formatTimeSimple(firstIn) : "-"}
                                                                                    </div>
                                                                                    <div className="text-[10px] text-gray-600">
                                                                                        {lastOut ? formatTimeSimple(lastOut) : "-"}
                                                                                    </div>
                                                                                    <div className="text-[9px] text-gray-500 font-medium">
                                                                                        {formatDuration(getTotalTimeFromPairs(pairs))}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-[10px] text-gray-400">—</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Total - Desktop */}
                                                            <div className="px-6 py-4 w-24 text-right text-sm font-semibold text-gray-900 sticky right-0 bg-white">
                                                                {formatDuration(totalMs)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Mobile View (below md) */}
                                            <div className="md:hidden">
                                                {/* Mobile Header */}
                                                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                                                    <div className="text-sm font-semibold text-gray-900">Weekly View</div>
                                                    <div className="text-xs text-gray-600 text-right">
                                                        {periodLabel}
                                                    </div>
                                                </div>

                                                {/* Mobile Employee Cards */}
                                                <div className="divide-y divide-gray-200">
                                                    {employeeNames.map((emp) => {
                                                        const empData = attendance[emp] || {};
                                                        let totalMs = 0;

                                                        dateList.forEach(({ key }) => {
                                                            const records = empData[key] || [];
                                                            totalMs += getTotalTimeFromPairs(buildTimePairs(records));
                                                        });

                                                        return (
                                                            <div key={emp} className="p-4 hover:bg-gray-50">
                                                                {/* Employee Header Mobile */}
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                                                                            {emp?.trim()?.charAt(0)?.toUpperCase() || "?"}
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                                                {emp}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                Total: {formatDuration(totalMs)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Weekly Days Grid Mobile */}
                                                                <div className="grid grid-cols-7 gap-2">
                                                                    {dateList.map(({ key, date }) => {
                                                                        const records = empData[key] || [];
                                                                        const pairs = buildTimePairs(records);
                                                                        const { firstIn, lastOut } = calculateDayStats(records);
                                                                        const color = getDayColor(key, emp, false);

                                                                        return (
                                                                            <div
                                                                                key={key}
                                                                                className="flex flex-col items-center p-2 rounded-md border border-gray-200 min-h-[70px] justify-center"
                                                                                style={{ backgroundColor: color }}
                                                                                onClick={() => onDayBoxClick(emp, key, records)}
                                                                            >
                                                                                {/* Day Header */}
                                                                                <div className="text-[10px] font-medium text-gray-500">
                                                                                    {DAY_LETTERS[date.getDay()]}
                                                                                </div>
                                                                                <div className="text-xs font-semibold text-gray-900 mb-1">
                                                                                    {date.getDate()}
                                                                                </div>

                                                                                {/* Times */}
                                                                                {records.length > 0 ? (
                                                                                    <div className="text-center space-y-0.5">
                                                                                        <div className="text-[9px] text-gray-800 leading-tight font-medium">
                                                                                            {firstIn ? formatTimeSimple(firstIn) : "-"}
                                                                                        </div>
                                                                                        <div className="text-[9px] text-gray-600 leading-tight">
                                                                                            {lastOut ? formatTimeSimple(lastOut) : "-"}
                                                                                        </div>
                                                                                        <div className="text-[8px] text-gray-500 font-medium">
                                                                                            {formatDuration(getTotalTimeFromPairs(pairs))}
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-[9px] text-gray-400 mt-1">—</div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}


                         {/* ADVANCED HOVER POPUP WITH SMART UI */}
{clickPopup && (() => {
    const pairs = buildTimePairs(clickPopup.records);
    const totalMs = getTotalTimeFromPairs(pairs);
    const totalText = formatDuration(totalMs);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header with close button and total time */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                                {clickPopup.employeeName}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <span>{clickPopup.dateKey}</span>
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium text-gray-900">{totalText}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={closePopup}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-96 overflow-y-auto">
                    {pairs.length > 0 ? (
                        <div className="space-y-3">
                            {pairs.map((p, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="flex flex-col items-center pt-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <div className="w-px h-5 bg-gray-300"></div>
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <div className="text-gray-800">
                                            <span className="font-medium">Start:</span>{" "}
                                            {formatTimeSimple(new Date(p.in.timeStamp))}
                                        </div>
                                        <div className="text-gray-800">
                                            <span className="font-medium">End:</span>{" "}
                                            {p.out
                                                ? formatTimeSimple(new Date(p.out.timeStamp))
                                                : "—"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-red-500 text-sm py-4 text-center">
                            No check-in / check-out records
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
})()}



                        </div>
                    </div>
                </div>
            </div>
        </LayoutComponent>
    );
}

export default TimeSheetList;