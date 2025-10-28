import React, { useState } from "react";

function DealKanbanView() {
  const [deals, setDeals] = useState({
    qualification: [
      {
        id: 1,
        name: "Benton",
        amount: "$ 250,000.00",
        probability: 10,
        owner: "Aditya Lotuar",
        closingDate: "24/10/2025",
      },
    ],
    needsAnalysis: [
      {
        id: 2,
        name: "Truhlar And Truhlar",
        amount: "$ 45,000.00",
        probability: 20,
        owner: "Aditya Lotuar",
        closingDate: "28/10/2025",
      },
      {
        id: 6,
        name: "Chanay",
        amount: "$ 55,000.00",
        probability: 20,
        owner: "Aditya Lotuar",
        closingDate: "29/10/2025",
      },
    ],
    valueProposition: [
      {
        id: 7,
        name: "Chenel",
        amount: "$ 70,000.00",
        probability: 40,
        owner: "Aditya Lotuar",
        closingDate: "28/10/2025",
      },
    ],
    identifyDecisionMakers: [
      {
        id: 3,
        name: "King",
        amount: "$ 80,000.00",
        probability: 50,
        owner: "Aditya Lotuar",
        closingDate: "30/10/2025",
      },
      {
        id: 8,
        name: "Feltz Printing Service",
        amount: "$ 45,000.00",
        probability: 60,
        owner: "Aditya Lotuar",
        closingDate: "31/10/2025",
      },
    ],
    proposalPriceQuote: [
      {
        id: 9,
        name: "Printing Dimensions",
        amount: "$ 25,000.00",
        probability: 75,
        owner: "Aditya Lotuar",
        closingDate: "02/11/2025",
      },
    ],
    negotiationReview: [
      {
        id: 5,
        name: "Chapman",
        amount: "$ 70,000.00",
        probability: 90,
        owner: "Aditya Lotuar",
        closingDate: "28/10/2025",
      },
    ],
    closedWon: [
      {
        id: 4,
        name: "Mortong Associates",
        amount: "$ 35,000.00",
        probability: 100,
        owner: "Aditya Lotuar",
        closingDate: "30/10/2025",
      },
    ],
    closedLost: [
      {
        id: 10,
        name: "Commercial Press",
        amount: "$ 45,000.00",
        probability: 0,
        owner: "Aditya Lotuar",
        closingDate: "29/10/2025",
      },
    ],
  });

  const stages = {
    qualification: {
      title: "Qualification",
      amount: "$ 251,000.00",
      color: "bg-gray-500",
      count: 1,
    },
    needsAnalysis: {
      title: "Needs Analysis",
      amount: "$ 100,000.00",
      color: "bg-blue-500",
      count: 2,
    },
    valueProposition: {
      title: "Value Proposition",
      amount: "$ 70,000.00",
      color: "bg-purple-500",
      count: 1,
    },
    identifyDecisionMakers: {
      title: "Identify Decision Makers",
      amount: "$ 125,000.00",
      color: "bg-indigo-500",
      count: 2,
    },
    proposalPriceQuote: {
      title: "Proposal/Price Quote",
      amount: "$ 25,000.00",
      color: "bg-yellow-500",
      count: 1,
    },
    negotiationReview: {
      title: "Negotiation/Review",
      amount: "$ 70,000.00",
      color: "bg-orange-500",
      count: 1,
    },
    closedWon: {
      title: "Closed Won",
      amount: "$ 35,000.00",
      color: "bg-green-500",
      count: 1,
    },
    closedLost: {
      title: "Closed Lost",
      amount: "$ 45,000.00",
      color: "bg-red-500",
      count: 1,
    },
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 50) return "text-yellow-600";
    if (probability >= 20) return "text-orange-600";
    return "text-red-600";
  };

  const getProbabilityBgColor = (probability) => {
    if (probability >= 80) return "bg-green-500";
    if (probability >= 50) return "bg-yellow-500";
    if (probability >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="p-4 h-full">
      {/* Kanban Container - No horizontal scroll on main container */}
      <div className="flex space-x-4 overflow-x-auto pb-4 min-h-[600px]">
        {Object.entries(stages).map(([stageKey, stage]) => (
          <div key={stageKey} className="w-80 flex-shrink-0 flex flex-col">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full min-h-[500px]">
              {/* Stage Header - Fixed height */}
              <div
                className={`p-4 rounded-t-lg ${stage.color} text-white flex-shrink-0`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight">
                      {stage.title}
                    </h3>
                    <p className="text-white/90 text-lg font-bold mt-1">
                      {stage.amount}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-full px-2 py-1 text-xs font-semibold">
                    {stage.count}
                  </div>
                </div>
              </div>

              {/* Deal Cards - Internal scrolling only for cards */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[400px]">
                {deals[stageKey]?.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer flex-shrink-0"
                  >
                    {/* Deal Header */}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                        {deal.name}
                      </h4>
                      <span className="font-bold text-gray-900 text-sm whitespace-nowrap ml-2">
                        {deal.amount}
                      </span>
                    </div>

                    {/* Probability */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Probability</span>
                      <span
                        className={`text-xs font-bold ${getProbabilityColor(
                          deal.probability
                        )}`}
                      >
                        {deal.probability}%
                      </span>
                    </div>

                    {/* Probability Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${getProbabilityBgColor(
                            deal.probability
                          )}`}
                          style={{ width: `${deal.probability}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Deal Details */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Owner</span>
                        <span className="text-xs text-gray-700 font-medium truncate ml-2 max-w-[120px]">
                          {deal.owner}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Closes</span>
                        <span className="text-xs text-gray-700 font-medium">
                          {deal.closingDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty state */}
                {(!deals[stageKey] || deals[stageKey].length === 0) && (
                  <div className="text-center py-8 text-gray-400 text-sm flex-shrink-0">
                    No deals in this stage
                  </div>
                )}
              </div>

              {/* Add Deal Button - Fixed at bottom */}
              <div className="p-3 border-t border-gray-200 flex-shrink-0">
                <button className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1">
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
                  <span>Add deal</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="flex justify-center mt-2">
        <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
          ← Scroll horizontally to view all stages →
        </div>
      </div>
    </div>
  );
}

export default DealKanbanView;
