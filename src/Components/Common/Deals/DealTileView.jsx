import React from "react";

function DealTileView() {
  const dealsData = [
    {
      id: 1,
      name: "King",
      amount: "$ 80,000.00",
      stage: "Identify Decision Makers",
      closingDate: "30/10/2025",
      accountName: "King (Sample)",
      probability: 50,
      owner: "Aditya Lotuar",
    },
    {
      id: 2,
      name: "Truhlar And Truhlar",
      amount: "$ 45,000.00",
      stage: "Needs Analysis",
      closingDate: "28/10/2025",
      accountName: "Truhlar And Truhlar (Sample)",
      probability: 20,
      owner: "Aditya Lotuar",
    },
    {
      id: 3,
      name: "Commercial Press",
      amount: "$ 45,000.00",
      stage: "Closed Lost",
      closingDate: "29/10/2025",
      accountName: "Commercial Press (Sample)",
      probability: 0,
      owner: "Aditya Lotuar",
    },
    {
      id: 4,
      name: "Mortong Associates",
      amount: "$ 35,000.00",
      stage: "Closed Won",
      closingDate: "30/10/2025",
      accountName: "Mortong Associates (Sample)",
      probability: 100,
      owner: "Aditya Lotuar",
    },
    {
      id: 5,
      name: "Chapman",
      amount: "$ 70,000.00",
      stage: "Negotiation/Review",
      closingDate: "28/10/2025",
      accountName: "Chapman (Sample)",
      probability: 90,
      owner: "Aditya Lotuar",
    },
    {
      id: 6,
      name: "Printing Dimensions",
      amount: "$ 25,000.00",
      stage: "Proposal/Price Quote",
      closingDate: "02/11/2025",
      accountName: "Printing Dimensions (Sample)",
      probability: 75,
      owner: "Aditya Lotuar",
    },
  ];

  const getProbabilityColor = (probability) => {
    if (probability >= 80)
      return "bg-green-100 text-green-800 border-green-200";
    if (probability >= 50)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (probability >= 20)
      return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dealsData.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-base font-bold text-gray-900 truncate max-w-[120px]">
                {deal.name}
              </h3>
              <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                {deal.amount}
              </span>
            </div>

            {/* Stage */}
            <div className="mb-3">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
                {deal.stage}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Closing Date</span>
                <span className="text-xs font-medium text-gray-900">
                  {deal.closingDate}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Account</span>
                <span className="text-xs font-medium text-gray-900 truncate ml-1 max-w-[100px]">
                  {deal.accountName}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Probability</span>
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${getProbabilityColor(
                    deal.probability
                  )}`}
                >
                  {deal.probability}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Owner</span>
                <span className="text-xs font-medium text-gray-900 truncate max-w-[80px]">
                  {deal.owner}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    deal.probability >= 80
                      ? "bg-green-500"
                      : deal.probability >= 50
                      ? "bg-yellow-500"
                      : deal.probability >= 20
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${deal.probability}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DealTileView;
