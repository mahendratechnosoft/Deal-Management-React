import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";

const CheckInOutButton = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const runningCheckInRef = useRef(null); // stores last check-in timestamp if active

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  useEffect(() => {
    let timer;
    timer = setInterval(() => {
      if (isCheckedIn && runningCheckInRef.current) {
        const now = Date.now();
        const liveSeconds = Math.floor((now - runningCheckInRef.current) / 1000);
        setTotalSeconds(pastSecondsRef.current + liveSeconds);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isCheckedIn]);

  const pastSecondsRef = useRef(0); // Stores total completed session duration

  const formatTime = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const toggleCheck = async () => {
    const nextState = !isCheckedIn;

    await axiosInstance.post(`addAttendance/${nextState}`);
    setIsCheckedIn(nextState);

    if (nextState === false) {
      // checkout → finalize running time
      const now = Date.now();
      const liveSeconds = Math.floor((now - runningCheckInRef.current) / 1000);
      const updatedPast = pastSecondsRef.current + liveSeconds;

      pastSecondsRef.current = updatedPast;
      setTotalSeconds(updatedPast);
      
      runningCheckInRef.current = null;
    } else {
      // check-in
      runningCheckInRef.current = Date.now();
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

      const todayRecords = Object.values(data.attendance)[0];
      if (!todayRecords?.length) return;

      todayRecords.sort((a, b) => a.timeStamp - b.timeStamp);

      let pastSeconds = 0;
      let lastCheckIn = null;

      // Calculate all completed check-in/out time
      todayRecords.forEach((record) => {
        if (record.status === true) {
          lastCheckIn = record.timeStamp;
        } else {
          if (lastCheckIn) {
            pastSeconds += Math.floor((record.timeStamp - lastCheckIn) / 1000);
            lastCheckIn = null;
          }
        }
      });

      pastSecondsRef.current = pastSeconds;

      // Case: still checked in (no checkout for last check-in)
      if (lastCheckIn !== null) {
        setIsCheckedIn(true);
        runningCheckInRef.current = lastCheckIn;

        const now = Date.now();
        const liveSeconds = Math.floor((now - lastCheckIn) / 1000);

        setTotalSeconds(pastSeconds + liveSeconds);
      } else {
        // all sessions completed
        setIsCheckedIn(false);
        setTotalSeconds(pastSeconds);
      }

    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center space-x-6">
      <div className="text-xl font-mono text-gray-700">
        {formatTime(totalSeconds)}
      </div>

      <button
        onClick={toggleCheck}
        className={`flex items-center justify-center w-36 h-12 rounded-full font-semibold text-white shadow-md transition-all duration-300 
        ${isCheckedIn ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
      >
        {isCheckedIn ? "Check Out" : "Check In"}
      </button>
    </div>
  );
};

export default CheckInOutButton;
