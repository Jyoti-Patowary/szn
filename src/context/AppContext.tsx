import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Season = 'Spring' | 'Summer' | 'Winter';

interface AppContextType {
  season: Season;
  setSeason: (season: Season) => void;
  isLocked: boolean;
  timeLeft: number;
  unlockApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEMO_DURATION = 30 * 60; // 30 minutes in seconds
const ASYNC_STORAGE_START_TIME_KEY = '@demo_start_time';
const ASYNC_STORAGE_UNLOCKED_KEY = '@app_unlocked';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [season, setSeason] = useState<Season>('Spring');
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEMO_DURATION);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkTimer = async () => {
      try {
        const unlockedStatus = await AsyncStorage.getItem(ASYNC_STORAGE_UNLOCKED_KEY);
        if (unlockedStatus === 'true') {
          setIsLocked(false);
          return;
        }

        const storedStartTime = await AsyncStorage.getItem(ASYNC_STORAGE_START_TIME_KEY);
        let startTime = storedStartTime ? parseInt(storedStartTime, 10) : null;

        if (!startTime) {
          startTime = Date.now();
          await AsyncStorage.setItem(ASYNC_STORAGE_START_TIME_KEY, startTime.toString());
        }

        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const remainingSeconds = DEMO_DURATION - elapsedSeconds;

        if (remainingSeconds <= 0) {
          setTimeLeft(0);
          setIsLocked(true);
        } else {
          setTimeLeft(remainingSeconds);
          setIsLocked(false);

          interval = setInterval(async () => {
             const now = Date.now();
             const updatedElapsed = Math.floor((now - startTime!) / 1000);
             const updatedRemaining = DEMO_DURATION - updatedElapsed;

             if (updatedRemaining <= 0) {
                 setTimeLeft(0);
                 setIsLocked(true);
                 clearInterval(interval);
             } else {
                 setTimeLeft(updatedRemaining);
             }
          }, 1000);
        }
      } catch (e) {
        console.error('Error checking timer in AsyncStorage', e);
      }
    };

    checkTimer();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const unlockApp = async () => {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_UNLOCKED_KEY, 'true');
      setIsLocked(false);
    } catch (e) {
      console.error('Error saving unlock state', e);
    }
  };

  return (
    <AppContext.Provider value={{ season, setSeason, isLocked, timeLeft, unlockApp }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
