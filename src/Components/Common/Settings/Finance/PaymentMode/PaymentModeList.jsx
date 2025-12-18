import React, { useState, useEffect } from "react";
import CreatePaymentProfileModal from "./CreatePaymentProfileModal";
import UpdatePaymentProfileModal from "./UpdatePaymentProfileModal";
import axiosInstance from "../../../../BaseComponet/axiosInstance";
import { showDeleteConfirmation } from "../../../../BaseComponet/alertUtils";
import toast from "react-hot-toast";
import { act } from "react";

const PaymentModeList = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  // Fetch Data
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("getAllPaymentProfile");
      setProfiles(response.data);
    } catch (error) {
      console.error("Error fetching payment profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = async (id, name) => {
    const result = await showDeleteConfirmation(name || "this task");
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`deletePaymentProfile/${id}`);
        setProfiles((prev) =>
          prev.filter((profile) => profile.paymentProfileId !== id)
        );
        toast.success("Profile deleted successfully!");
      } catch (error) {
        console.error("Error deleting profile:", error);
        toast.error("Failed to delete profile");
      }
    }
  };

  // Open Update Modal
  const handleEditClick = (id) => {
    setSelectedProfileId(id);
    setIsUpdateModalOpen(true);
  };

  const handleCloseCreate = () => setIsCreateModalOpen(false);
  const handleCloseUpdate = () => {
    setIsUpdateModalOpen(false);
    setSelectedProfileId(null);
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      await axiosInstance.put(
        `updatePaymentProfileStatus/${id}?active=${newStatus}`
      );

      setProfiles((prevProfiles) =>
        prevProfiles.map((profile) =>
          profile.paymentProfileId === id
            ? { ...profile, active: newStatus }
            : profile
        )
      );

      toast.success(
        `Profile ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredProfiles = profiles.filter((profile) =>
    profile.profileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Payment Modes
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage available payment methods
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search payment modes..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
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
              Add Payment Mode
            </button>
          </div>
        </div>
      </div>

      {/* --- Table Section (Scrollable) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[60vh] overflow-y-auto CRM-scroll-width-none">
        <div className="min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "35%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>

            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Profile Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading payment profiles...
                  </td>
                </tr>
              ) : filteredProfiles.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No payment profiles found.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile, index) => (
                  <tr
                    key={profile.paymentProfileId}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {profile.profileName}
                      </div>
                      {profile.isDefault && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          profile.type === "BANK"
                            ? "bg-blue-100 text-blue-700"
                            : profile.type === "UPI"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {profile.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {profile.type === "BANK" && (
                        <div className="flex flex-col text-xs">
                          <span>{profile.bankName}</span>
                          <span>{profile.accountNumber}</span>
                        </div>
                      )}
                      {profile.type === "UPI" && (
                        <div className="text-xs">{profile.upiId}</div>
                      )}
                      {profile.type === "CASH" && (
                        <span className="text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={profile.active}
                          onChange={() =>
                            handleStatusToggle(
                              profile.paymentProfileId,
                              profile.active
                            )
                          }
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleEditClick(profile.paymentProfileId)
                          }
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              profile.paymentProfileId,
                              profile.profileName
                            )
                          }
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreatePaymentProfileModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        onSuccess={fetchProfiles}
      />

      <UpdatePaymentProfileModal
        isOpen={isUpdateModalOpen}
        profileId={selectedProfileId}
        onClose={handleCloseUpdate}
        onSuccess={fetchProfiles}
      />
    </>
  );
};

export default PaymentModeList;
