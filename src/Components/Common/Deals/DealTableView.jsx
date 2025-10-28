import React from "react";

function DealTableView() {
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
  ];

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return "bg-green-100 text-green-800";
    if (probability >= 50) return "bg-yellow-100 text-yellow-800";
    if (probability >= 20) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getStageColor = (stage) => {
    const stageColors = {
      "Identify Decision Makers": "bg-purple-100 text-purple-800",
      "Needs Analysis": "bg-blue-100 text-blue-800",
      "Negotiation/Review": "bg-yellow-100 text-yellow-800",
      "Closed Won": "bg-green-100 text-green-800",
      "Closed Lost": "bg-red-100 text-red-800",
    };
    return stageColors[stage] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closing Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dealsData.map((deal) => (
                <tr
                  key={deal.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {deal.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {deal.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(
                        deal.stage
                      )}`}
                    >
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.closingDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.accountName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getProbabilityColor(deal.probability)
                              .replace("text-", "bg-")
                              .split(" ")[0]
                          }`}
                          style={{ width: `${deal.probability}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${getProbabilityColor(
                          deal.probability
                        )} px-2 py-1 rounded-full`}
                      >
                        {deal.probability}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.owner}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DealTableView;
