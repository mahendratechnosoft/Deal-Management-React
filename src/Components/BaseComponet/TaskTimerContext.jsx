import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axiosInstance from "./axiosInstance";

const TaskTimerContext = createContext();

export const TaskTimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);

  const fetchActiveTimer = async () => {
    try {
      console.log("Fetching active timer...");
      if (!localStorage.getItem("authToken")) return;
      const response = await axiosInstance.get("activeTimer");
      if (response.data && response.data.taskLogId) {
        console.log("Active timer found:", response.data);
        setActiveTimer(response.data);
      } else {
        setActiveTimer(null);
        setElapsedTime(0);
      }
    } catch (error) {
      console.error("Error fetching active timer:", error);
      setActiveTimer(null);
      setElapsedTime(0);
    }
  };

  useEffect(() => {
    if (activeTimer && activeTimer.startTime) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const updateTimer = () => {
        const start = new Date(activeTimer.startTime).getTime();
        const now = new Date().getTime();
        const diffInSeconds = Math.floor((now - start) / 1000);
        setElapsedTime(diffInSeconds > 0 ? diffInSeconds : 0);
      };
      updateTimer();
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsedTime(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTimer]);

  return (
    <TaskTimerContext.Provider
      value={{ activeTimer, elapsedTime, fetchActiveTimer }}
    >
      {children}
    </TaskTimerContext.Provider>
  );
};

export const useTimer = () => useContext(TaskTimerContext);
