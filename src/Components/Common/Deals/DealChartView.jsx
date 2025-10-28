import React from "react";

function DealChartView() {
  const stageData = [
    { stage: "Qualification", amount: 251000, count: 1, color: "bg-gray-500" },
    { stage: "Needs Analysis", amount: 100000, count: 2, color: "bg-blue-500" },
    {
      stage: "Value Proposition",
      amount: 70000,
      count: 1,
      color: "bg-purple-500",
    },
    {
      stage: "Identify Decision Makers",
      amount: 125000,
      count: 2,
      color: "bg-indigo-500",
    },
    {
      stage: "Proposal/Price Quote",
      amount: 25000,
      count: 1,
      color: "bg-yellow-500",
    },
    {
      stage: "Negotiation/Review",
      amount: 70000,
      count: 1,
      color: "bg-orange-500",
    },
    { stage: "Closed Won", amount: 35000, count: 1, color: "bg-green-500" },
    { stage: "Closed Lost", amount: 45000, count: 1, color: "bg-red-500" },
  ];

  const totalAmount = stageData.reduce((sum, stage) => sum + stage.amount, 0);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Sales Pipeline Summary
          </h3>

          <div className="space-y-3">
            {stageData.map((stage, index) => (
              <div
                key={stage.stage}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded ${stage.color}`}></div>
                  <span className="text-xs font-medium text-gray-700 truncate max-w-[140px]">
                    {stage.stage}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    ${stage.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stage.count} deal{stage.count !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">
                  Total Pipeline
                </span>
                <span className="text-base font-bold text-blue-600">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Distribution Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Stage Distribution
          </h3>

          <div className="space-y-3">
            {stageData.map((stage) => {
              const percentage = ((stage.amount / totalAmount) * 100).toFixed(
                1
              );
              return (
                <div key={stage.stage} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                      {stage.stage}
                    </span>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${stage.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="truncate max-w-[80px]">
                      ${stage.amount.toLocaleString()}
                    </span>
                    <span className="whitespace-nowrap">
                      {stage.count} deal{stage.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Probability Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Deal Probability Analysis
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-600">0-20%</div>
              <div className="text-red-700 font-semibold text-sm">$90,000</div>
              <div className="text-xs text-red-600">2 deals</div>
            </div>

            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-lg font-bold text-orange-600">21-50%</div>
              <div className="text-orange-700 font-semibold text-sm">
                $125,000
              </div>
              <div className="text-xs text-orange-600">2 deals</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-lg font-bold text-yellow-600">51-80%</div>
              <div className="text-yellow-700 font-semibold text-sm">
                $95,000
              </div>
              <div className="text-xs text-yellow-600">2 deals</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-600">81-100%</div>
              <div className="text-green-700 font-semibold text-sm">
                $105,000
              </div>
              <div className="text-xs text-green-600">2 deals</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealChartView;
