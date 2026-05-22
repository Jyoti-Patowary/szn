import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  Image, TouchableOpacity, TextInput, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const CATEGORIES = ['ALL', 'EVERYDAY WEAR', 'OFFICE WEAR', 'VACATION'];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';

export default function LooksScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [looks, setLooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [savedLookIds, setSavedLookIds] = useState<Set<string>>(new Set());

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const fetchLooks = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: looksData, error: looksError } = await supabase
          .from('catalog_looks')
          .select(`
            id,
            name,
            render_image_url,
            created_at,
            catalog_look_items ( id )
          `)
          .order('created_at', { ascending: false });

        if (looksError) throw looksError;

        if (user) {
          const { data: savedData } = await supabase
            .from('user_saved_looks')
            .select('look_id')
            .eq('user_id', user.id);
          
          if (savedData) {
            setSavedLookIds(new Set(savedData.map(item => item.look_id)));
          }
        }

        if (looksData) {
          const formattedLooks = looksData.map((look: any) => ({
            id: look.id,
            title: look.name || 'Curated Look',
            image: look.render_image_url || FALLBACK_IMAGE,
            itemsCount: look.catalog_look_items ? look.catalog_look_items.length : 0
          }));

          const filtered = formattedLooks.filter(look => 
            debouncedSearch === '' || 
            look.title.toLowerCase().includes(debouncedSearch.toLowerCase())
          );
          
          setLooks(filtered);
        }
      } catch (err) {
        console.error("Error fetching looks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLooks();
  }, [debouncedSearch, activeCategory]);

  const toggleWishlist = async (lookId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn("User not logged in. Cannot save look.");
        return; 
      }

      const isAlreadySaved = savedLookIds.has(lookId);

      if (isAlreadySaved) {
        const { error } = await supabase
          .from('user_saved_looks')
          .delete()
          .eq('user_id', user.id)
          .eq('look_id', lookId);
        
        if (!error) {
          setSavedLookIds(prev => {
            const next = new Set(prev);
            next.delete(lookId);
            return next;
          });
        }
      } else {
        const { error } = await supabase
          .from('user_saved_looks')
          .insert({ user_id: user.id, look_id: lookId });
        
        if (!error) {
          setSavedLookIds(prev => new Set(prev).add(lookId));
        }
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };


  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Looks</Text>
      <Text style={styles.headerSubtitle}>Discover curated outfits for every occasion</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dresses, skirts etc"
            placeholderTextColor="#888"
            value={searchInput}
            onChangeText={setSearchInput}
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Categories Row */}
      <FlatList 
        horizontal
        data={CATEGORIES}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isActive = activeCategory === item;
          return (
            <TouchableOpacity 
              style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              onPress={() => setActiveCategory(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

 const renderLookCard = ({ item }: { item: any }) => {
    const isSaved = savedLookIds.has(item.id);

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => navigation.navigate('LookDetail', { lookId: item.id })}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          
          {/* DYNAMIC HEART BUTTON */}
          <TouchableOpacity 
            style={styles.heartBtn}
            onPress={() => toggleWishlist(item.id)}
          >
            <Ionicons 
              name={isSaved ? "heart" : "heart-outline"} 
              size={18} 
              color={isSaved ? "#A67B5B" : "#888"} 
            />
          </TouchableOpacity>

        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.itemCount}>{item.itemsCount} Items</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <ActivityIndicator size="large" color="#A67B5B" style={{ marginTop: 40 }} />
        </View>
      ) : (
        <FlatList
          data={looks}
          renderItem={renderLookCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.rowWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No looks found.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F4F0' },
  loadingContainer: { flex: 1 },
  
  /* Header */
  headerContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '500', color: '#333', marginBottom: 4 },
  headerSubtitle: { fontSize: 15, color: '#666', marginBottom: 24 },

  /* Search & Filter Row */
  searchRow: { flexDirection: 'row', marginBottom: 20 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F4F0', borderWidth: 1, borderColor: '#DCD6CE', borderRadius: 14, paddingHorizontal: 12, height: 50, marginRight: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  filterBtn: { width: 50, height: 50, backgroundColor: '#A67B5B', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  /* Categories */
  categoriesScroll: { marginBottom: 20, marginHorizontal: -20 },
  categoriesContainer: { paddingHorizontal: 20 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#CDBBAA', marginRight: 10, backgroundColor: 'transparent' },
  categoryPillActive: { backgroundColor: '#A67B5B', borderColor: '#A67B5B' },
  categoryText: { fontSize: 12, color: '#CDBBAA', fontWeight: '500' },
  categoryTextActive: { color: '#FFF' },

  /* Grid Layout */
  listContent: { paddingBottom: 120 }, 
  rowWrapper: { justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  
  /* Look Card */
  card: { width: '47%' },
  imageContainer: { width: '100%', height: 220, borderRadius: 16, backgroundColor: '#EBE5DE', overflow: 'hidden', position: 'relative' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heartBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FFF', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  
  cardInfo: { marginTop: 12 },
  cardTitle: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 2 },
  itemCount: { fontSize: 12, color: '#888' },

  /* Empty State */
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#888', fontSize: 15, fontStyle: 'italic' }
});