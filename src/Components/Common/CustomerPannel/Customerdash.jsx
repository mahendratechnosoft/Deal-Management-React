import React from "react";
import { useLayout } from "../../Layout/useLayout";

function Customerdash() {
  const { LayoutComponent, role } = useLayout();

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="max-w-4xl mx-auto">
          {/* Main Welcome Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-200 mt-10 md:mt-16">
            {/* Welcome Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Welcome to Customer Panel
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
            </div>

            {/* Welcome Message */}
            <div className="text-center">
              <p className="text-xl md:text-2xl text-gray-700 font-medium mb-6">
                Your dedicated space for managing services
              </p>

              {/* Status Indicator */}
              <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">
                  Account Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}

export default Customerdash;
