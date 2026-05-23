import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SavedItemsContext = createContext<any>({
  savedProducts: [],
  savedLooks: [],
  setSavedProducts: () => {},
  setSavedLooks: () => {},
  fetchSavedItems: async () => {}
});

export const SavedItemsProvider = ({ children }: { children: React.ReactNode }) => {
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [savedLooks, setSavedLooks] = useState<string[]>([]);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [products, looks] = await Promise.all([
      supabase.from('user_saved_products').select('product_id').eq('user_id', user.id),
      supabase.from('user_saved_looks').select('look_id').eq('user_id', user.id)
    ]);

    if (products.data) setSavedProducts(products.data.map(p => p.product_id));
    if (looks.data) setSavedLooks(looks.data.map(l => l.look_id));
  };

  return (
    <SavedItemsContext.Provider value={{ savedProducts, savedLooks, setSavedProducts, setSavedLooks, fetchSavedItems }}>
      {children}
    </SavedItemsContext.Provider>
  );
};

export const useSavedItems = () => useContext(SavedItemsContext);