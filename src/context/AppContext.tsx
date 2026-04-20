import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define the types for your context
interface AppContextType {
  isLocked: boolean;
  setIsLocked: (value: boolean) => void;
  timeLeft: number;
  setTimeLeft: (value: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLocked, setIsLocked] = useState(false);
  
  // 2. Set the initial time to 60 seconds (1 minute) for testing
  const [timeLeft, setTimeLeft] = useState(60);

  // 3. The Countdown Engine
  useEffect(() => {
    // If the time hits 0, stop running the timer!
    if (timeLeft <= 0) return;

    // Create an interval that runs every 1000ms (1 second)
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup the interval if the component unmounts
    return () => clearInterval(timerId);
  }, [timeLeft]); // This re-runs the check every time the number changes

  return (
    <AppContext.Provider value={{ isLocked, setIsLocked, timeLeft, setTimeLeft }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context easily
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};