import React, { useState, useEffect } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";

const ActivityLog = ({ moduleId, moduleType = "lead" }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `getModuleActivity/${moduleId}/${moduleType}`
      );
      setActivities(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [moduleId, moduleType]);

  const groupActivitiesByDate = (activities) => {
    const grouped = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    activities.forEach((activity) => {
      const activityDate = new Date(activity.createdDateTime).toDateString();
      let displayDate;

      if (activityDate === today) {
        displayDate = "Today";
      } else if (activityDate === yesterday) {
        displayDate = "Yesterday";
      } else {
        displayDate = new Date(activity.createdDateTime).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );
      }

      if (!grouped[displayDate]) {
        grouped[displayDate] = {
          actualDate: activity.createdDateTime,
          activities: [],
        };
      }
      grouped[displayDate].activities.push(activity);
    });

    return grouped;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupedActivities = groupActivitiesByDate(activities);

  if (loading) {
    return (
      <div className="p-3">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 font-medium text-sm mb-1">
            Failed to load activities
          </p>
          <button
            onClick={fetchActivities}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-sm">No activities found</div>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {Object.entries(groupedActivities).map(([displayDate, group]) => (
        <div key={displayDate} className="mb-6">
          {/* Date Header */}
          <div className="px-3 py-2 mb-3">
            <h4
              className="text-sm font-semibold text-gray-700 bg-white inline-block px-3 py-1 rounded-full border cursor-help"
              title={formatFullDate(group.actualDate)}
            >
              {displayDate}
            </h4>
          </div>

          {/* Connected Cards Container */}
          <div className="relative">
            {/* Main Vertical Timeline Line - Fixed */}
            <div
              className="absolute left-4 top-2 bottom-2 w-0.5 bg-blue-200"
              style={{
                top: "8px",
                bottom: "8px",
                height: `calc(100% - 16px)`,
              }}
            ></div>

            {/* Activities Cards */}
            <div className="space-y-1">
              {group.activities.map((activity, index, array) => (
                <div
                  key={activity.activityId || index}
                  className="relative flex items-start"
                >
                  {/* Timeline Dot Container */}
                  <div className="flex-shrink-0 w-8 flex justify-center relative">
                    {/* Connection Dot */}
                    <div
                      className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-sm z-10 cursor-help"
                      title={formatFullDate(activity.createdDateTime)}
                    ></div>

                    {/* Connecting line to next card - Fixed */}
                    {index < array.length - 1 && (
                      <div
                        className="absolute left-1/2 top-3 transform -translate-x-1/2 w-0.5 bg-blue-200 z-0"
                        style={{ height: "calc(100% + 8px)" }}
                      ></div>
                    )}
                  </div>

                  {/* Activity Card */}
                  <div
                    className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 mb-3 ml-2 cursor-help"
                    title={formatFullDate(activity.createdDateTime)}
                  >
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {activity.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3"
                            />
                          </svg>
                          <span>{formatTime(activity.createdDateTime)}</span>
                        </div>

                        {activity.createdBy && (
                          <>
                            <div className="w-px h-3 bg-gray-300"></div>
                            <div className="flex items-center space-x-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span>By {activity.createdBy}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLog;
