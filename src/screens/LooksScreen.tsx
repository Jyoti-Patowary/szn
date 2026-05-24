  import React, { useState, useEffect, useMemo } from 'react';
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
  import SaveButton from '../components/SaveButton';
  import { useSavedItems } from '../context/SavedItemsContext';
  import FilterModal from '../components/FilterModal';

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';

  export default function LooksScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { savedLooks } = useSavedItems(); 
    
    const [allLooks, setAllLooks] = useState<any[]>([]);
    const [displayLooks, setDisplayLooks] = useState<any[]>([]);
    const [lookTypes, setLookTypes] = useState<string[]>(['ALL']);
    const [isLoading, setIsLoading] = useState(true);

    const [activeCategory, setActiveCategory] = useState('ALL');
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [sortOption, setSortOption] = useState('recent');
    const [selectedSeason, setSelectedSeason] = useState('');
    const [selectedTag, setSelectedTag] = useState('');

    useEffect(() => {
      const handler = setTimeout(() => setDebouncedSearch(searchInput), 300);
      return () => clearTimeout(handler);
    }, [searchInput]);

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const { data: typesData, error: typesError } = await supabase
            .from('catalog_look_types')
            .select('name')
            .order('name');
            
          if (!typesError && typesData) {
            setLookTypes(['ALL', ...typesData.map(t => t.name.toUpperCase())]);
          }

          const { data: looksData, error: looksError } = await supabase
            .from('catalog_looks')
            .select(`
              id,
              name,
              render_image_url,
              created_at,
              tags,
              seasons,
              look_type:catalog_look_types(name),
              catalog_look_items ( id )
            `)
            .order('created_at', { ascending: false });

          if (looksError) throw looksError;

          if (looksData) {
            const formattedLooks = looksData.map((look: any) => ({
              id: look.id,
              title: look.name || 'Curated Look',
              image: look.render_image_url || FALLBACK_IMAGE,
              itemsCount: look.catalog_look_items ? look.catalog_look_items.length : 0,
              lookTypeName: look.look_type?.name?.toUpperCase() || 'UNCATEGORIZED',
              tags: look.tags || [],
              seasons: look.seasons || [],
              created_at: look.created_at
            }));
            setAllLooks(formattedLooks);
          }
        } catch (err) {
          console.error("Error fetching looks data:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, []);

    const availableSeasons = useMemo(() => {
      const seasons = new Set<string>();
      allLooks.forEach(l => l.seasons.forEach((s: string) => seasons.add(s.toUpperCase())));
      return Array.from(seasons).sort();
    }, [allLooks]);

    const availableTags = useMemo(() => {
      const tags = new Set<string>();
      allLooks.forEach(l => l.tags.forEach((t: string) => tags.add(t.toUpperCase())));
      return Array.from(tags).sort();
    }, [allLooks]);

    useEffect(() => {
      if (allLooks.length === 0) return;

      let filtered = [...allLooks];

      if (activeCategory !== 'ALL') {
        filtered = filtered.filter(look => look.lookTypeName === activeCategory);
      }

      if (debouncedSearch) {
        filtered = filtered.filter(look => 
          look.title.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }

      if (selectedSeason) {
        filtered = filtered.filter(look => 
          look.seasons.some((s: string) => s.toUpperCase() === selectedSeason)
        );
      }

      if (selectedTag) {
        filtered = filtered.filter(look => 
          look.tags.some((t: string) => t.toUpperCase() === selectedTag)
        );
      }

      if (sortOption === 'recent') {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sortOption === 'oldest') {
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }

      setDisplayLooks(filtered);
    }, [allLooks, activeCategory, debouncedSearch, selectedSeason, selectedTag, sortOption]);

    const handleResetFilters = () => {
      setSortOption('recent');
      setSelectedSeason('');
      setSelectedTag('');
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
              placeholder="Search looks, styles, etc"
              placeholderTextColor="#888"
              value={searchInput}
              onChangeText={setSearchInput}
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setIsFilterVisible(true)}>
            <Ionicons name="options-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <FlatList 
          horizontal
          data={lookTypes}
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

  const renderLookCard = ({ item }: { item: any }) => (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8} 
        onPress={() => navigation.navigate('LookDetail', { lookId: item.id })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          
          <SaveButton 
            itemId={item.id} 
            type="look" 
            style={styles.heartBtn} 
            size={18}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.itemCount}>{item.itemsCount} Items</Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <SafeAreaView style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            {renderHeader()}
            <ActivityIndicator size="large" color="#A67B5B" style={{ marginTop: 40 }} />
          </View>
        ) : (
          <FlatList
            data={displayLooks}
            renderItem={renderLookCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            extraData={savedLooks}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.rowWrapper}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No looks match your filters.</Text>
              </View>
            )}
          />
        )}

      <FilterModal 
          isVisible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          onReset={handleResetFilters}
          resultsCount={displayLooks.length}

          sortOption={sortOption}
          setSortOption={setSortOption}

          availableSeasons={availableSeasons}
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}

          availableTags={availableTags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F4F0' },
    loadingContainer: { flex: 1 },
    headerContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: '400', color: '#2E2E2E', marginBottom: 4 },
    headerSubtitle: { fontSize: 16, fontWeight: '400', color: '#6B6B6B', marginBottom: 32 },
    searchRow: { flexDirection: 'row', marginBottom: 12 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F4F0', borderWidth: 1, borderColor: '#DCD6CE', borderRadius: 14, paddingHorizontal: 12, height: 50, marginRight: 12 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#333' },
    filterBtn: { width: 50, height: 50, backgroundColor: '#A67B5B', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    categoriesScroll: { marginBottom: 24, marginHorizontal: -20 },
    categoriesContainer: { paddingHorizontal: 20 },
    categoryPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#CDBBAA', marginRight: 10, backgroundColor: 'transparent' },
    categoryPillActive: { backgroundColor: '#A67B5B', borderColor: '#A67B5B' },
    categoryText: { fontSize: 12, color: '#CDBBAA', fontWeight: '500' },
    categoryTextActive: { color: '#FFF' },
    listContent: { paddingBottom: 120 }, 
    rowWrapper: { justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
    card: { width: '47%' },
    imageContainer: { width: '100%', height: 220, borderRadius: 16, backgroundColor: '#EBE5DE', overflow: 'hidden', position: 'relative' },
    cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    heartBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FFF', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
    cardInfo: { marginTop: 12 },
    cardTitle: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 2 },
    itemCount: { fontSize: 12, color: '#888' },
    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyText: { color: '#888', fontSize: 15, fontStyle: 'italic' }
  });