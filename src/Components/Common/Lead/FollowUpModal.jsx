import React from "react";

const FollowUpModal = ({
    isOpen,
    onClose,
    followUpLeads = [],
    getInitials,
    getStatusColor,
    isFetchingFollowUps = false,
    title = "Follow-ups",
}) => {
    // Don't show modal if there are no follow-ups
    if (!isOpen || followUpLeads.length === 0) return null;

    const handleClose = () => {
        localStorage.setItem('followUpModalClosedManually', 'true');
        onClose();
    };

    /* ✅ LOADING STATE */
    if (isFetchingFollowUps) {
        return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                        <p className="text-sm font-medium text-gray-700">
                            Loading...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[45] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[70vh] overflow-hidden">
                {/* HEADER - Only one count display */}
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="font-semibold text-gray-800">{title}</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                        title="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* LEADS LIST - Compact */}
                <div className="overflow-y-auto max-h-[calc(70vh-100px)]">
                    {followUpLeads.map((lead, index) => {
                        const clientName = lead.clientName || lead.name || lead.fullName || "Unnamed";
                        const companyName = lead.companyName || lead.company || lead.businessName || "";
                        const status = lead.status || lead.leadStatus || "Pending";
                        const leadId = lead.id || lead.leadId || index;

                        const initials = getInitials
                            ? getInitials(clientName)
                            : clientName
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()
                                .substring(0, 2) || "NA";

                        const statusColor = getStatusColor
                            ? getStatusColor(status)
                            : status === 'Contacted' ? 'text-green-600' :
                              status === 'New Lead' ? 'text-red-600' :
                              'text-gray-600';

                        return (
                            <div
                                key={leadId}
                                className="px-4 py-3 border-b hover:bg-gray-50 transition-colors duration-150"
                            >
                                <div className="flex items-start gap-3">
                                    {/* AVATAR */}
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                            {initials}
                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {clientName}
                                                    </p>
                                                    <span className={`text-xs ${statusColor} font-medium`}>
                                                        {status}
                                                    </span>
                                                </div>
                                                
                                                {companyName && (
                                                    <p className="text-xs text-gray-600">
                                                        {companyName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* PHONE - Only show if available */}
                                        {lead.phone && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span>{lead.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FollowUpModal;