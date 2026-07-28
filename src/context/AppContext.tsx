import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
  isLocked: boolean;
  setIsLocked: (value: boolean) => void;
  timeLeft: number;
  setTimeLeft: (value: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isCheckingTrial, setIsCheckingTrial] = useState(true);

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        // FIRST: Check if they are a paying subscriber
        const isSubscribed = await AsyncStorage.getItem('@is_subscribed');
        
        if (isSubscribed === 'true') {
          setTimeLeft(0);
          setIsLocked(false); // Premium user! Make sure it stays unlocked
          return; // Stop checking, we don't care about trial status
        }

        // SECOND: If not subscribed, check if their free trial ended previously
        const hasFinishedTrial = await AsyncStorage.getItem('@trial_finished');
        if (hasFinishedTrial === 'true') {
          setTimeLeft(0);
          setIsLocked(true); // Lock them out
        }
      } catch (error) {
        console.error("Error reading trial status", error);
      } finally {
        setIsCheckingTrial(false);
      }
    };

    checkTrialStatus();
  }, []);

  useEffect(() => {
    // If checking storage, or if time is already 0, stop running the timer!
    if (isCheckingTrial || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        
        if (newTime <= 0) {
          clearInterval(timerId);
          AsyncStorage.setItem('@trial_finished', 'true');
          setIsLocked(true); 
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isCheckingTrial, timeLeft]);

  return (
    <AppContext.Provider value={{ isLocked, setIsLocked, timeLeft, setTimeLeft }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};