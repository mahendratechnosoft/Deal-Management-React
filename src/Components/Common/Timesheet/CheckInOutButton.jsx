import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";

const CheckInOutButton = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const runningCheckInRef = useRef(null);
  const pastSecondsRef = useRef(0);

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isCheckedIn && runningCheckInRef.current) {
        const now = Date.now();
        const liveSeconds = Math.floor((now - runningCheckInRef.current) / 1000);
        setTotalSeconds(pastSecondsRef.current + liveSeconds);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isCheckedIn]);

  const formatTime = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const toggleCheck = async () => {
    setIsLoading(true);
    const nextState = !isCheckedIn;

    try {
      await axiosInstance.post(`addAttendance/${nextState}`);
      setIsCheckedIn(nextState);

      if (!nextState) {
        const now = Date.now();
        const liveSeconds = Math.floor((now - runningCheckInRef.current) / 1000);
        const updatedPast = pastSecondsRef.current + liveSeconds;

        pastSecondsRef.current = updatedPast;
        setTotalSeconds(updatedPast);
        runningCheckInRef.current = null;
      } else {
        runningCheckInRef.current = Date.now();
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axiosInstance.get(
        `getAttendanceBetweenForParticalurEmployee?fromDate=${today}&toDate=${today}`
      );

      const data = response.data;
      if (!data.attendance) return;

      const todayRecords = Object.values(data.attendance)[0] || [];
      if (!todayRecords.length) return;

      todayRecords.sort((a, b) => a.timeStamp - b.timeStamp);

      let past = 0;
      let lastIn = null;

      todayRecords.forEach((rec) => {
        if (rec.status === true) lastIn = rec.timeStamp;
        else if (lastIn) {
          past += Math.floor((rec.timeStamp - lastIn) / 1000);
          lastIn = null;
        }
      });

      pastSecondsRef.current = past;

      if (lastIn !== null) {
        setIsCheckedIn(true);
        runningCheckInRef.current = lastIn;
        const now = Date.now();
        const live = Math.floor((now - lastIn) / 1000);
        setTotalSeconds(past + live);
      } else {
        setIsCheckedIn(false);
        setTotalSeconds(past);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* SIMPLIFIED TIMER BLOCK - No Title, Only Time */}
      <div className="
        flex items-center justify-center
        px-4
        bg-white/10
        backdrop-blur-2xl 
        rounded-xl
        border border-white/20
        shadow-[0px_4px_20px_rgba(0,0,0,0.15)]
        transition-all duration-300
        hover:bg-white/15
        h-8  /* Reduced height to match profile */
      ">
        {/* Time Display Only - No Status Text */}
        <div className="text-lg font-mono font-bold tracking-wider text-white drop-shadow-lg">
          {formatTime(totalSeconds)}
        </div>
      </div>

      {/* ICON-ONLY CHECK IN / OUT BUTTON - Height adjusted to match profile */}
      <div className="relative">
        <button
          onClick={toggleCheck}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={isLoading}
          className={`
            relative
            flex items-center justify-center
            w-8 h-8  /* Reduced to match profile height */
            rounded-xl
            font-semibold 
            text-white 
            shadow-[0_4px_20px_rgba(0,0,0,0.25)]
            transform transition-all duration-300 
            hover:scale-[1.05]
            active:scale-[0.95]
            border border-white/30
            backdrop-blur-xl
            overflow-hidden
            group
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
            ${
              isCheckedIn
                ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            }
          `}
        >
          {/* Animated Background Shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Animated Play/Pause Icons - Adjusted size */}
          <div className="relative z-10 transform transition-all duration-300 group-hover:scale-110">
            {isCheckedIn ? (
              // Pause Icon (Check Out)
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="transform transition-transform duration-300 group-hover:scale-110"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" className="transform origin-center transition-all duration-300 group-hover:scale-y-110" />
                <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" className="transform origin-center transition-all duration-300 group-hover:scale-y-110" />
              </svg>
            ) : (
              // Play Icon (Check In)
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="transform transition-transform duration-300 group-hover:scale-110 ml-0.5"
              >
                <path 
                  d="M8 5V19L19 12L8 5Z" 
                  fill="currentColor" 
                  className="transform origin-center transition-all duration-300 group-hover:scale-110"
                />
              </svg>
            )}
          </div>

          {/* Status Indicator Dot - Adjusted size and position */}
          <div className={`
            absolute -top-0.5 -right-0.5
            w-2 h-2 
            rounded-full 
            border border-white
            transition-all duration-300
            ${isCheckedIn ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}
            ${isLoading ? 'opacity-50' : ''}
          `} />
        </button>

        {/* Tooltip */}
        {showTooltip && !isLoading && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
            {isCheckedIn ? "Check Out" : "Check In"}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInOutButton;