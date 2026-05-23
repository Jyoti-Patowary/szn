import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useSavedItems } from '../context/SavedItemsContext';

export default function SaveButton({ itemId, type, style, size = 24 }: any) {
  const { savedProducts, savedLooks, setSavedProducts, setSavedLooks } = useSavedItems();

  const isSaved = type === 'product' ? savedProducts.includes(itemId) : savedLooks.includes(itemId);
  const tableName = type === 'product' ? 'user_saved_products' : 'user_saved_looks';
  const idColumn = type === 'product' ? 'product_id' : 'look_id';

  const toggleSave = async () => {
    const wasSaved = isSaved; 
    
    if (type === 'product') {
      if (wasSaved) setSavedProducts(savedProducts.filter((id: string) => id !== itemId));
      else setSavedProducts([...savedProducts, itemId]);
    } else {
      if (wasSaved) setSavedLooks(savedLooks.filter((id: string) => id !== itemId));
      else setSavedLooks([...savedLooks, itemId]);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired."); 

      if (wasSaved) {
        const { error } = await supabase.from(tableName).delete().eq('user_id', user.id).eq(idColumn, itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(tableName).insert({ user_id: user.id, [idColumn]: itemId });
        if (error && error.code !== '23505') throw error; 
      }
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Could not update your saved items. Please try again.");

      if (type === 'product') {
        if (wasSaved) setSavedProducts([...savedProducts, itemId]); 
        else setSavedProducts(savedProducts.filter((id: string) => id !== itemId));
      } else {
        if (wasSaved) setSavedLooks([...savedLooks, itemId]);
        else setSavedLooks(savedLooks.filter((id: string) => id !== itemId));
      }
    }
  };

  return (
    <TouchableOpacity style={style} onPress={toggleSave}>
      <Ionicons 
        name={isSaved ? "heart" : "heart-outline"} 
        size={size} 
        color={isSaved ? "#AA8368" : "#A67B5B"} 
      />
    </TouchableOpacity>
  );
}