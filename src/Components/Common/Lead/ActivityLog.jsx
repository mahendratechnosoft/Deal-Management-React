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
            month: "long",
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

  const formatFullDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const groupedActivities = groupActivitiesByDate(activities);

  if (loading) {
    return (
      <div className="p-2">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-2">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 text-center">
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <svg
            className="w-5 h-5 text-red-400 mx-auto mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-800 font-medium text-sm mb-1">
            Error loading activity log
          </p>
          <p className="text-red-600 text-xs mb-2">{error}</p>
          <button
            onClick={fetchActivities}
            className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-3 text-center">
        <div className="bg-gray-50 rounded-lg p-4">
          <svg
            className="w-10 h-10 text-gray-400 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            No Activity Logs
          </h3>
          <p className="text-gray-600 text-xs">
            No activities recorded for this lead yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {Object.entries(groupedActivities).map(([displayDate, group]) => (
        <div key={displayDate} className="mb-4 last:mb-0">
          {/* Date Header */}
          <div className="sticky top-0 bg-white z-10 px-2 py-1 border-b border-gray-200 mb-2">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
              <h4
                className="text-xs font-semibold text-gray-700 cursor-help"
                title={formatFullDateTime(group.actualDate)}
              >
                {displayDate}
              </h4>
            </div>
          </div>

          {/* Activities List */}
          <div className="space-y-2 px-2">
            {group.activities.map((activity, index) => (
              <div
                key={activity.activityId || index}
                className="flex items-start space-x-2 p-2 rounded border border-gray-200 hover:border-gray-300 bg-white"
              >
                {/* Activity Icon */}
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800 leading-relaxed">
                    {activity.description}
                  </p>

                  {/* Activity Meta */}
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <svg
                        className="w-2.5 h-2.5"
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
                      <span
                        className="cursor-help text-xs"
                        title={formatFullDateTime(activity.createdDateTime)}
                      >
                        {formatTime(activity.createdDateTime)}
                      </span>
                    </div>

                    {activity.createdBy && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <svg
                          className="w-2.5 h-2.5"
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
                        <span className="text-xs">By {activity.createdBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLog;
