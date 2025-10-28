import React, { useState } from "react";
import TopBar from "../TopBar";
import Sidebar from "../Sidebar";
import DealTableView from "./DealTableView";
import DealKanbanView from "./DealKanbanView";
import DealTileView from "./DealTileView";
import DealChartView from "./DealChartView";

function DealList() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("kanban");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const viewOptions = [
    { id: "table", name: "Table View", icon: "📊" },
    { id: "kanban", name: "Kanban View", icon: "📋" },
    { id: "tile", name: "Tile View", icon: "🧩" },
    { id: "chart", name: "Chart View", icon: "📈" },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case "table":
        return <DealTableView />;
      case "kanban":
        return <DealKanbanView />;
      case "tile":
        return <DealTileView />;
      case "chart":
        return <DealChartView />;
      default:
        return <DealKanbanView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Top Bar */}
      <TopBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 overflow-x-auto ${
            sidebarOpen ? "ml-0 lg:ml-5" : "ml-0"
          }`}
        >
          {/* View Header */}
          <div className="bg-white border-b border-gray-200 flex-shrink-0">
            <div className="px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
                  <p className="text-gray-600 mt-1">
                    Manage your sales pipeline
                  </p>
                </div>

                {/* View Toggle Buttons */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  {viewOptions.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                        activeView === view.id
                          ? "bg-white shadow-sm text-blue-600 font-semibold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <span>{view.icon}</span>
                      <span className="hidden sm:block">{view.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* View Content - Fixed height container */}
          <div className="flex-1 min-h-0">{renderActiveView()}</div>
        </div>
      </div>
    </div>
  );
}

export default DealList;
