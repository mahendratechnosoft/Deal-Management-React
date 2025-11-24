import React, { useState, useEffect, useMemo } from "react";
import { useLayout } from "../../Layout/useLayout";

// ==============================
// 1. Filter Component with Input Fields
// ==============================
const DonorFilters = ({ onFilterChange, activeFilters }) => {
    // Initialize with default empty object
    const safeActiveFilters = activeFilters || {};

    // State now holds string values for inputs, not booleans
    // Keys match the data structure in getDonorsList
    const [filters, setFilters] = useState({
        name: '',
        bloodGroup: '',
        height: '',
        weight: '',
        skinColor: '',
        eyeColor: '',
        religion: '',
        education: '',
        district: ''
    });

    // Sync local state with props if they change externally
    useEffect(() => {
        if (safeActiveFilters && Object.keys(safeActiveFilters).length > 0) {
            setFilters(prev => ({
                ...prev,
                ...safeActiveFilters
            }));
        }
    }, [safeActiveFilters]);

    // Handle text changes in input fields
    const handleInputChange = (field, value) => {
        const newFilters = {
            ...filters,
            [field]: value
        };
        setFilters(newFilters);
        // Debounce could be added here in a real app for performance
        onFilterChange && onFilterChange(newFilters);
    };

    // Clear all inputs
    const handleClearAll = () => {
        // Reset all keys to empty strings
        const allEmpty = Object.keys(filters).reduce((acc, key) => {
            acc[key] = '';
            return acc;
        }, {});
        setFilters(allEmpty);
        onFilterChange && onFilterChange(allEmpty);
    };

    // Configuration for filter fields corresponding to data keys
    const filterFields = [
        { key: 'name', label: 'Name' },
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'district', label: 'District' },
        { key: 'height', label: 'Height' },
        { key: 'weight', label: 'Weight' },
        { key: 'skinColor', label: 'Skin Color' },
        { key: 'eyeColor', label: 'Eye Color' },
        { key: 'religion', label: 'Religion' },
        { key: 'education', label: 'Education' },
        { key: 'profession', label: 'Profession' },
    ];

    // Count how many inputs have text in them
    const activeFilterCount = Object.values(filters).filter(val => val && val.trim() !== '').length;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Filter Donors
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Type in fields to refine search criteria
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    {activeFilterCount > 0 && (
                        <span className="text-sm text-gray-600">
                            {activeFilterCount} field{activeFilterCount !== 1 ? 's' : ''} active
                        </span>
                    )}
                    <button
                        onClick={handleClearAll}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                        type="button"
                    >
                        Clear Filters
                    </button>
                    {/* "Select All" removed as it doesn't apply to text inputs */}
                </div>
            </div>

            {/* Input Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterFields.map((field) => (
                    <div key={field.key} className="flex flex-col">
                        <label htmlFor={`filter-${field.key}`} className="text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                        </label>
                        <input
                            type="text"
                            id={`filter-${field.key}`}
                            value={filters[field.key] || ''}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            placeholder={`Search ${field.label}...`}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                            autoComplete="off"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==============================
// 2. Donor List Component
// ==============================
// This component now receives an already-filtered list
const DonorList = ({ donors }) => {
    const safeDonors = donors || [];

    if (safeDonors.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-600 text-lg mb-2">No matching donors found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your filter criteria.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {/* Header with count */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Search Results
                        </h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            {safeDonors.length} matching donors
                        </span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID & Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Physical Stats</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {safeDonors.map((donor, index) => (
                            <tr key={donor.id || index} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-6 py-4 whitespace-nowrapData">
                                    <div className="text-sm font-medium text-blue-600">{donor.id || 'N/A'}</div>
                                    <div className="text-sm font-semibold text-gray-900">{donor.name || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        donor.bloodGroup === 'O+' ? 'bg-red-100 text-red-800' :
                                        donor.bloodGroup === 'A+' ? 'bg-blue-100 text-blue-800' :
                                        donor.bloodGroup === 'B+' ? 'bg-green-100 text-green-800' :
                                        donor.bloodGroup === 'AB+' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {donor.bloodGroup || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col gap-1">
                                        <div>H: <span className="text-gray-900">{donor.height}</span></div>
                                        <div>W: <span className="text-gray-900">{donor.weight}</span></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     <div className="flex flex-col gap-1">
                                        <div className="flex items-center">
                                            Skin: 
                                            <span className={`w-2 h-2 rounded-full mx-1 border border-gray-300 ${
                                                donor.skinColor === 'Fair' ? 'bg-amber-100' : donor.skinColor === 'Dark' ? 'bg-amber-800' : 'bg-amber-400'
                                            }`}></span>
                                            <span className="text-gray-900">{donor.skinColor}</span>
                                        </div>
                                        <div className="flex items-center">
                                            Eye: 
                                             <span className={`w-2 h-2 rounded-full mx-1 border border-gray-300 ${
                                                 donor.eyeColor === 'Blue' ? 'bg-blue-400' : donor.eyeColor === 'Green' ? 'bg-green-500' : 'bg-amber-900'
                                             }`}></span>
                                            <span className="text-gray-900">{donor.eyeColor}</span>
                                        </div>
                                        <div>Rel: <span className="text-gray-900">{donor.religion}</span></div>
                                        <div>Edu: <span className="text-gray-900">{donor.education}</span></div>
                                         <div>Prof: <span className="text-gray-900">{donor.profession}</span></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {donor.district || 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ==============================
// 3. Main Component (Parent)
// ==============================
function DonorMatchingFilter() {
    const { LayoutComponent } = useLayout();
    const [rawDonors, setRawDonors] = useState([]); // Renamed to indicate raw data
    const [activeFilters, setActiveFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch donors data on component mount
    useEffect(() => {
        const fetchDonors = async () => {
            setLoading(true);
            // ... (Simulated API call remains the same)
            setTimeout(() => {
                 try {
                     setRawDonors(getDonorsList());
                     setLoading(false);
                 } catch (e) { setError('Failed'); setLoading(false);}
            }, 1000);
        };
        fetchDonors();
    }, []);

    // Handler for filter updates from child component
    const handleFilterChange = (newFilters) => {
        setActiveFilters(newFilters);
    };

    // ==============================
    // ACTUAL FILTERING LOGIC HERE
    // ==============================
    const filteredDonors = useMemo(() => {
        if (loading || rawDonors.length === 0) return [];

        // Check if any filters actually have text in them
        const hasActiveFilters = Object.values(activeFilters).some(value => value && value.trim() !== '');
        
        if (!hasActiveFilters) {
            return rawDonors; // Return all if no filters are active
        }

        return rawDonors.filter(donor => {
            // We use every() to ensure ALL active filters match (AND logic)
            return Object.entries(activeFilters).every(([key, filterValue]) => {
                // Skip empty filter fields
                if (!filterValue || filterValue.trim() === '') return true;

                const donorValue = donor[key];
                
                // Perform case-insensitive "includes" check
                // Convert donorValue to string to safely handle numbers if necessary
                return donorValue && 
                       donorValue.toString().toLowerCase().includes(filterValue.toLowerCase().trim());
            });
        });
    }, [rawDonors, activeFilters, loading]);


    return (
        <LayoutComponent>
            <div className="p-6 overflow-x-auto bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="mb-6">
                     <h1 className="text-2xl font-bold text-gray-900">Donor Matching System</h1>
                     <p className="text-sm text-gray-600 mt-1">Use inputs below to filter the donor list.</p>
                </div>

                {error && <div className="text-red-500 mb-4">{error}</div>}

                {/* Filters Section (Inputs) */}
                <DonorFilters
                    onFilterChange={handleFilterChange}
                    activeFilters={activeFilters}
                />

                {/* Loading State or Results List */}
                {loading ? (
                    <div className="text-center p-12 bg-white rounded-lg border">Loading donors...</div>
                ) : (
                    // Pass the filtered list down
                    <DonorList donors={filteredDonors} />
                )}
            </div>
        </LayoutComponent>
    );
}

// Mock API function (Unchanged data)
const getDonorsList = () => {
    return [
        { id: "D001", name: "Rajesh Kumar", bloodGroup: "B+", height: "5'10\"", weight: "74kg", skinColor: "Fair", eyeColor: "Brown", religion: "Hindu", education: "Graduate",profession: "CA", district: "Pune" },
        { id: "D002", name: "Amit Sharma", bloodGroup: "O+", height: "5'9\"", weight: "72kg", skinColor: "Wheatish", eyeColor: "Black", religion: "Hindu", education: "Post Graduate",profession: "CA", district: "Mumbai" },
        { id: "D003", name: "Suresh Patel", bloodGroup: "B+", height: "5'11\"", weight: "76kg", skinColor: "Fair", eyeColor: "Brown", religion: "Hindu", education: "Graduate",profession: "CA", district: "Pune" },
        { id: "D004", name: "Priya Singh", bloodGroup: "A+", height: "5'4\"", weight: "58kg", skinColor: "Fair", eyeColor: "Brown", religion: "Hindu", education: "Graduate",profession: "CA", district: "Delhi" },
        { id: "D005", name: "Neha Gupta", bloodGroup: "O+", height: "5'5\"", weight: "60kg", skinColor: "Wheatish", eyeColor: "Black", religion: "Hindu", education: "Post Graduate",profession: "CA", district: "Bangalore" },
        { id: "D006", name: "Rahul Verma", bloodGroup: "AB+", height: "5'8\"", weight: "70kg", skinColor: "Fair", eyeColor: "Blue", religion: "Hindu", education: "Graduate",profession: "CA", district: "Hyderabad" },
        { id: "D007", name: "Sanjay Joshi", bloodGroup: "O+", height: "5'7\"", weight: "68kg", skinColor: "Wheatish", eyeColor: "Brown", religion: "Hindu", education: "Diploma",profession: "CA", district: "Pune" },
        { id: "D008", name: "Anita Desai", bloodGroup: "A+", height: "5'3\"", weight: "55kg", skinColor: "Fair", eyeColor: "Black", religion: "Hindu", education: "Post Graduate",profession: "CA", district: "Mumbai" },
        { id: "D009", name: "Vikram Malhotra", bloodGroup: "B+", height: "5'10\"", weight: "75kg", skinColor: "Wheatish", eyeColor: "Brown", religion: "Hindu", education: "Graduate",profession: "CA", district: "Delhi" },
        { id: "D010", name: "Sunita Reddy", bloodGroup: "O+", height: "5'2\"", weight: "52kg", skinColor: "Fair", eyeColor: "Brown", religion: "Hindu", education: "Graduate",profession: "CA", district: "Hyderabad" }
    ];
};

export default DonorMatchingFilter;