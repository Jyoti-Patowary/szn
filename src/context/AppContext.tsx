import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

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

  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        await AsyncStorage.removeItem('@trial_finished');
        await AsyncStorage.removeItem('@is_subscribed');
        setTimeLeft(60);
        setIsLocked(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

 const checkTrialStatus = async (user: any) => {
    setIsCheckingTrial(true);
    try {
      const isSubscribedLocal = await AsyncStorage.getItem('@is_subscribed');
      
      if (isSubscribedLocal === 'true') {
        setTimeLeft(0);
        setIsLocked(false);
        return; 
      }

      if (user) {
        const { data: subData, error } = await supabase
          .from('user_subscriptions')
          .select('status, current_period_end')
          .eq('user_id', user.id)
          .single();

        if (!error && subData) {
          const isSubActive = subData.status === 'active' && new Date(subData.current_period_end) > new Date();
          
          if (isSubActive) {
            await AsyncStorage.setItem('@is_subscribed', 'true');
            setTimeLeft(0);
            setIsLocked(false);
            return; 
          } else {
            await AsyncStorage.removeItem('@is_subscribed');
          }
        }
      }

      const hasFinishedTrial = await AsyncStorage.getItem('@trial_finished');
      if (hasFinishedTrial === 'true') {
        setTimeLeft(0);
        setIsLocked(true); 
      } else {
        setIsLocked(false); // Ensure they start unlocked if trial isn't finished
      }

    } catch (error) {
      console.error("Error reading trial status", error);
    } finally {
      setIsCheckingTrial(false);
    }
  };

  useEffect(() => {
    // Check initial session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
      checkTrialStatus(session?.user);
    });

    // Listen for auth changes (Logins and Logouts)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session?.user);
      
      if (event === 'SIGNED_OUT') {
        await AsyncStorage.removeItem('@trial_finished');
        await AsyncStorage.removeItem('@is_subscribed');
        setTimeLeft(60);
        setIsLocked(false);
      } else if (event === 'SIGNED_IN') {
        // 👇 3. Crucial! Re-verify the user when they successfully log in
        await checkTrialStatus(session?.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // RUN THE TRIAL TIMER
  useEffect(() => {
    if (isCheckingTrial || isLocked || timeLeft === 0 || !isAuthenticated) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          AsyncStorage.setItem('@trial_finished', 'true');
          setIsLocked(true); 
          return 0;
        }
        
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isCheckingTrial, isLocked, timeLeft, isAuthenticated]);

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