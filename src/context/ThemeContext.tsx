import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SeasonTheme = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

export const SEASONS: Record<string, SeasonTheme> = {
  autumn: { id: 'autumn', name: 'Autumn', emoji: '🍂', color: '#AA8368' },
  winter: { id: 'winter', name: 'Winter', emoji: '❄️', color: '#3E3F41' },
  spring: { id: 'spring', name: 'Spring', emoji: '🌸', color: '#B69EDD' },
  summer: { id: 'summer', name: 'Summer', emoji: '☀️', color: '#75B1F9' },
  all: { id: 'all', name: 'All Seasons', emoji: '🌍', color: '#333333' },
};

type ThemeContextType = {
  currentTheme: SeasonTheme;
  changeTheme: (seasonId: string) => Promise<void>;
  isLoadingTheme: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: SEASONS.autumn,
  changeTheme: async () => {},
  isLoadingTheme: true,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<SeasonTheme>(SEASONS.autumn);
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeId = await AsyncStorage.getItem('@app_theme');
        if (savedThemeId && SEASONS[savedThemeId]) {
          setCurrentTheme(SEASONS[savedThemeId]);
        }
      } catch (error) {
        console.error('Failed to load theme', error);
      } finally {
        setIsLoadingTheme(false);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (seasonId: string) => {
    if (SEASONS[seasonId]) {
      setCurrentTheme(SEASONS[seasonId]);
      await AsyncStorage.setItem('@app_theme', seasonId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, isLoadingTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);