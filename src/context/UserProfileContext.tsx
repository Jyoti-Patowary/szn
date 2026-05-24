import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

type UserProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
};

type UserProfileContextType = {
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  refreshProfile: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  isLoadingProfile: true,
  refreshProfile: async () => {},
});

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const fetchProfile = async (userId: string) => {
    setIsLoadingProfile(true);
    try {

      const { data, error } = await supabase
        .from('app_users')
        .select('id, display_name, avatar_url')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const refreshProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {

      setProfile(prev => prev ? { ...prev, email: user.email } : null);
      await fetchProfile(user.id);
    } else {
      setProfile(null);
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {

    refreshProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, isLoadingProfile, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);