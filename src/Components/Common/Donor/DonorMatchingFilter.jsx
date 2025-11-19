import React, { useState, useEffect } from "react";
import { useLayout } from "../../Layout/useLayout";

// Filter component with checkboxes
const DonorFilters = ({ onFilterChange, activeFilters }) => {
    // Initialize with default empty object if activeFilters is null/undefined
    const safeActiveFilters = activeFilters || {};
    
    const [filters, setFilters] = useState({
        color: false,
        height: false,
        bloodGroup: false,
        skinColor: false,
        eyeColor: false,
        religion: false,
        education: false,
        district: false,
        country: false
    });

    // Initialize filters from props with safety check
    useEffect(() => {
        if (safeActiveFilters) {
            setFilters(prev => ({
                ...prev,
                ...safeActiveFilters
            }));
        }
    }, [safeActiveFilters]);

    const handleFilterToggle = (field) => {
        const newFilters = {
            ...filters,
            [field]: !filters[field]
        };
        setFilters(newFilters);
        onFilterChange && onFilterChange(newFilters);
    };

    const filterOptions = [
        { key: 'color', label: 'Color', color: 'bg-purple-100 text-purple-800' },
        { key: 'height', label: 'Height', color: 'bg-blue-100 text-blue-800' },
        { key: 'bloodGroup', label: 'Blood Group', color: 'bg-red-100 text-red-800' },
        { key: 'skinColor', label: 'Skin Color', color: 'bg-orange-100 text-orange-800' },
        { key: 'eyeColor', label: 'Eye Color', color: 'bg-green-100 text-green-800' },
        { key: 'religion', label: 'Religion', color: 'bg-indigo-100 text-indigo-800' },
        { key: 'education', label: 'Education', color: 'bg-teal-100 text-teal-800' },
        { key: 'district', label: 'District', color: 'bg-cyan-100 text-cyan-800' },
        { key: 'country', label: 'Country', color: 'bg-pink-100 text-pink-800' }
    ];

    // Safe calculation of active filter count
    const activeFilterCount = filters ? Object.values(filters).filter(Boolean).length : 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Filter Donors
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Select criteria to filter donors
                    </p>
                </div>
                
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    {activeFilterCount > 0 && (
                        <span className="text-sm text-gray-600">
                            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                        </span>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const allFalse = {
                                    color: false,
                                    height: false,
                                    bloodGroup: false,
                                    skinColor: false,
                                    eyeColor: false,
                                    religion: false,
                                    education: false,
                                    district: false,
                                    country: false
                                };
                                setFilters(allFalse);
                                onFilterChange && onFilterChange(allFalse);
                            }}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={() => {
                                const allTrue = {
                                    color: true,
                                    height: true,
                                    bloodGroup: true,
                                    skinColor: true,
                                    eyeColor: true,
                                    religion: true,
                                    education: true,
                                    district: true,
                                    country: true
                                };
                                setFilters(allTrue);
                                onFilterChange && onFilterChange(allTrue);
                            }}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm transition-colors"
                        >
                            Select All
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {filterOptions.map((option) => (
                    <label 
                        key={option.key}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            filters[option.key] 
                                ? `border-blue-500 bg-blue-50 ${option.color}` 
                                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={filters[option.key] || false}
                            onChange={() => handleFilterToggle(option.key)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={`text-sm font-medium ${
                            filters[option.key] ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600 mr-2">Active filters:</span>
                        {Object.entries(filters)
                            .filter(([_, isActive]) => isActive)
                            .map(([key]) => {
                                const option = filterOptions.find(opt => opt.key === key);
                                return (
                                    <span 
                                        key={key}
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${option?.color || 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {option?.label || key}
                                        <button
                                            onClick={() => handleFilterToggle(key)}
                                            className="ml-2 hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
};

// Donor List Component
const DonorList = ({ donors, activeFilters }) => {
    // Safe handling of donors array
    const safeDonors = donors || [];
    
    // Show all donors initially (no filters applied)
    const filteredDonors = safeDonors;

    if (safeDonors.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 text-lg mb-2">No donors available</p>
                    <p className="text-gray-500 text-sm">There are currently no donors in the system.</p>
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
                            Available Donors
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            All registered donors are shown below
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                            {filteredDonors.length} donors total
                        </span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Donor ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Blood Group
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Height
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Weight
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Skin Color
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Eye Color
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Religion
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Education
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                District
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDonors.map((donor, index) => (
                            <tr key={donor.id || index} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                    {donor.id || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                    {donor.name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {donor.height || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {donor.weight || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className="inline-flex items-center">
                                        <span className={`w-3 h-3 rounded-full mr-2 border border-gray-300 ${
                                            donor.skinColor === 'Fair' ? 'bg-yellow-200' :
                                            donor.skinColor === 'Wheatish' ? 'bg-yellow-300' :
                                            donor.skinColor === 'Dark' ? 'bg-yellow-600' :
                                            'bg-gray-200'
                                        }`}></span>
                                        {donor.skinColor || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className="inline-flex items-center">
                                        <span className={`w-3 h-3 rounded-full mr-2 border border-gray-300 ${
                                            donor.eyeColor === 'Brown' ? 'bg-amber-700' :
                                            donor.eyeColor === 'Black' ? 'bg-gray-900' :
                                            donor.eyeColor === 'Blue' ? 'bg-blue-400' :
                                            donor.eyeColor === 'Green' ? 'bg-green-400' :
                                            'bg-gray-200'
                                        }`}></span>
                                        {donor.eyeColor || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {donor.religion || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {donor.education || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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

// Main Component
function DonorMatchingFilter() {
    const { LayoutComponent } = useLayout();
    const [donors, setDonors] = useState([]);
    const [activeFilters, setActiveFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch donors data on component mount
    useEffect(() => {
        const fetchDonors = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate API call delay
                setTimeout(() => {
                    try {
                        const donorsData = getDonorsList();
                        setDonors(donorsData);
                        setLoading(false);
                    } catch (fetchError) {
                        setError('Failed to load donor data');
                        setLoading(false);
                    }
                }, 1000);
            } catch (error) {
                console.error("Error fetching donors:", error);
                setError('An error occurred while loading donors');
                setLoading(false);
            }
        };

        fetchDonors();
    }, []);

    const handleFilterChange = (filters) => {
        setActiveFilters(filters || {});
    };

    return (
        <LayoutComponent>
            <div className="p-6 overflow-x-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Donor Matching System
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Browse all available donors. Use filters to find specific matches.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                <DonorFilters 
                    onFilterChange={handleFilterChange} 
                    activeFilters={activeFilters}
                />

                {/* Loading State */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading donor list...</p>
                            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch all donors</p>
                        </div>
                    </div>
                ) : (
                    <DonorList donors={donors} activeFilters={activeFilters} />
                )}
            </div>
        </LayoutComponent>
    );
}

// Mock API function with comprehensive dummy data
const getDonorsList = () => {
    return [
        {
            id: "D001",
            name: "Rajesh Kumar",
            bloodGroup: "B+",
            height: "5'10\"",
            weight: "74kg",
            skinColor: "Fair",
            eyeColor: "Brown",
            religion: "Hindu",
            education: "Graduate",
            district: "Pune"
        },
        {
            id: "D002",
            name: "Amit Sharma",
            bloodGroup: "O+",
            height: "5'9\"",
            weight: "72kg",
            skinColor: "Wheatish",
            eyeColor: "Black",
            religion: "Hindu",
            education: "Post Graduate",
            district: "Mumbai"
        },
        {
            id: "D003",
            name: "Suresh Patel",
            bloodGroup: "B+",
            height: "5'11\"",
            weight: "76kg",
            skinColor: "Fair",
            eyeColor: "Brown",
            religion: "Hindu",
            education: "Graduate",
            district: "Pune"
        },
        {
            id: "D004",
            name: "Priya Singh",
            bloodGroup: "A+",
            height: "5'4\"",
            weight: "58kg",
            skinColor: "Fair",
            eyeColor: "Brown",
            religion: "Hindu",
            education: "Graduate",
            district: "Delhi"
        },
        {
            id: "D005",
            name: "Neha Gupta",
            bloodGroup: "O+",
            height: "5'5\"",
            weight: "60kg",
            skinColor: "Wheatish",
            eyeColor: "Black",
            religion: "Hindu",
            education: "Post Graduate",
            district: "Bangalore"
        },
        {
            id: "D006",
            name: "Rahul Verma",
            bloodGroup: "AB+",
            height: "5'8\"",
            weight: "70kg",
            skinColor: "Fair",
            eyeColor: "Blue",
            religion: "Hindu",
            education: "Graduate",
            district: "Hyderabad"
        },
        {
            id: "D007",
            name: "Sanjay Joshi",
            bloodGroup: "O+",
            height: "5'7\"",
            weight: "68kg",
            skinColor: "Wheatish",
            eyeColor: "Brown",
            religion: "Hindu",
            education: "Diploma",
            district: "Pune"
        },
        {
            id: "D008",
            name: "Anita Desai",
            bloodGroup: "A+",
            height: "5'3\"",
            weight: "55kg",
            skinColor: "Fair",
            eyeColor: "Black",
            religion: "Hindu",
            education: "Post Graduate",
            district: "Mumbai"
        },
        {
            id: "D009",
            name: "Vikram Malhotra",
            bloodGroup: "B+",
            height: "5'10\"",
            weight: "75kg",
            skinColor: "Wheatish",
            eyeColor: "Brown",
            religion: "Hindu",
            education: "Graduate",
            district: "Delhi"
        },
        {
            id: "D010",
            name: "Sunita Reddy",
            bloodGroup: "O+",
            height: "5'2\"",
            weight: "52kg",
            skinColor: "Fair",
            eyeColor: "Brown",
            religion: "Hindu",
            education: "Graduate",
            district: "Hyderabad"
        }
    ];
};

export default DonorMatchingFilter;