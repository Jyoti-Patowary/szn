import React, { useState, useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { 
  View, Text, StyleSheet, FlatList, Image,  
  TouchableOpacity, TextInput, ScrollView, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Local UI mapping for seasons
const SEASONS = [
  { id: 'winter', label: 'Winter', image: require('../../assets/winter-icon.png'), bgColor: '#4A5568' },
  { id: 'autumn', label: 'Autumn', image: require('../../assets/autumn-icon.png'), bgColor: '#C28E6B' },
  { id: 'summer', label: 'Summer', image: require('../../assets/summer-icon.png'), bgColor: '#63B3ED' },
  { id: 'spring', label: 'Spring', image: require('../../assets/spring-icon.png'), bgColor: '#B794F4' },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';

export default function CatalogueScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [activeSeason, setActiveSeason] = useState('autumn');
  const [activeCategory, setActiveCategory] = useState('ALL'); 
  
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [dynamicCategories, setDynamicCategories] = useState<string[]>(['ALL']);
  const [groupedProducts, setGroupedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  console.log(`Downloaded ${allProducts.length} items. First item:`, allProducts[0]);

 // 1. FETCH ALL: Loop through pages with stable sorting
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoading(true);
      try {
        let allFetched: any[] = [];
        let keepFetching = true;
        let page = 0;
        const PAGE_SIZE = 1000;

        while (keepFetching) {
          const from = page * PAGE_SIZE;
          const to = from + PAGE_SIZE - 1;

          const { data, error } = await supabase
            .from('catalog_products')
            .select('id, name, product_type, listing_image_url, image_urls, categories, seasons')
            .range(from, to)
            .order('created_at', { ascending: false })
            .order('id', { ascending: true }); // 👈 FIX 1: Guarantees stable pagination order!

          if (error) throw error;

          if (data && data.length > 0) {
            allFetched = [...allFetched, ...data];
            
            if (data.length < PAGE_SIZE) {
              keepFetching = false;
            } else {
              page++; 
            }
          } else {
            keepFetching = false;
          }
        }

        // 👈 FIX 2: Strip out any accidental duplicates just to be mathematically certain
        const uniqueProducts = Array.from(new Map(allFetched.map(item => [item.id, item])).values());
        
        console.log(`✅ TOTAL CATALOG LOADED: ${uniqueProducts.length} items`);
        setAllProducts(uniqueProducts);
        
      } catch (err) {
        console.error("Error fetching catalog chunk:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // 2. FETCH TAXONOMY ONCE: Get dynamic categories
  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const { data, error } = await supabase
          .from('catalog_product_taxonomy')
          .select('type_name');
          
        if (error) throw error;

        if (data) {
          const uniqueCategories = new Set<string>();
          data.forEach((row) => {
            if (row.type_name) uniqueCategories.add(row.type_name.toUpperCase());
          });
          setDynamicCategories(['ALL', ...Array.from(uniqueCategories).sort()]);
        }
      } catch (err) {
        console.error("Error fetching taxonomy:", err);
      }
    };
    fetchTaxonomy();
  }, []);

  // 3. DEBOUNCE SEARCH INPUT
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // 4. DYNAMIC FILTER & COUNT: Runs instantly when UI changes
  useEffect(() => {
    if (allProducts.length === 0) return;

    const filtered = allProducts.filter((item) => {
       const categoryStr = JSON.stringify(item.categories || []).toLowerCase();
       const typeStr = (item.product_type || '').toLowerCase();
       const hasCategory = activeCategory === 'ALL' || 
                           categoryStr.includes(activeCategory.toLowerCase()) ||
                           typeStr === activeCategory.toLowerCase();
       
       const hasSeason = item.seasons && item.seasons.some((s: string) => 
         s.toLowerCase() === activeSeason.toLowerCase()
       );
       
       const hasSearch = debouncedSearch === '' || 
                         (item.name && item.name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
                         (item.product_type && item.product_type.toLowerCase().includes(debouncedSearch.toLowerCase()));

       return hasCategory && hasSeason && hasSearch;
    });

    const groups: Record<string, any> = {};
    filtered.forEach((item) => {
      const type = item.product_type || 'Uncategorized';
      
      if (!groups[type]) {
        let bestImage = item.listing_image_url;
        if (!bestImage && item.image_urls && item.image_urls.length > 0) {
          bestImage = item.image_urls[0];
        }

        groups[type] = {
          id: type,
          title: type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          count: 0,
          image: bestImage || FALLBACK_IMAGE 
        };
      }
      groups[type].count += 1;
    });

    setGroupedProducts(Object.values(groups).sort((a, b) => a.title.localeCompare(b.title)));
    
  }, [allProducts, activeSeason, activeCategory, debouncedSearch]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.mainTitle}>Catalogue</Text>
      <Text style={styles.subTitle}>Discover curated fashion pieces</Text>

      <View style={styles.seasonsRow}>
        {SEASONS.map((season) => {
          const isActive = activeSeason === season.id;
          return (
            <TouchableOpacity 
              key={season.id} 
              style={styles.seasonItem}
              onPress={() => setActiveSeason(season.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.seasonIconOuterRing, isActive && styles.seasonIconOuterRingActive]}>
                <View style={[styles.seasonIconInner, { backgroundColor: season.bgColor }]}>
                  <Image 
                    source={season.image} 
                    style={{ width: 52, height: 52, resizeMode: 'contain' }} 
                  />
                </View>
              </View>
              <Text style={[styles.seasonLabel, isActive && styles.seasonLabelActive]}>
                {season.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContainer}>
        {dynamicCategories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <TouchableOpacity 
              key={category} 
              style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              onPress={() => setActiveCategory(category)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{category}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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

      <Text style={styles.listTitle}>Product list</Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.productRow} activeOpacity={0.7} onPress={() => navigation.navigate('ProductList', { 
        type: item.id,
        title: item.title, 
        season: activeSeason
      })}
      >
      <View style={styles.imageWrapper}>
        <View style={styles.imageBackdrop} />
        <Image source={{ uri: item.image }} style={styles.productImage} />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.itemCount}>{item.count} ITEM{item.count !== 1 ? 'S' : ''}</Text>
        <Text style={styles.productTitle}>{item.title}</Text>
      </View>
      <View style={styles.chevronButton}>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={groupedProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader()}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#B88A60" />
            ) : (
              <Text style={styles.emptyText}>No products found.</Text>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F4F0' },
  flatListContent: { paddingBottom: 120 },
  headerContainer: { paddingHorizontal: 20, paddingTop: 20 },
  mainTitle: { fontSize: 24, fontWeight: '500', color: '#333333', marginBottom: 4 },
  subTitle: { fontSize: 16, color: '#888888', marginBottom: 32 },
  seasonsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 1, marginBottom: 32 },
  seasonItem: { alignItems: 'center' },
  seasonIconOuterRing: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: 'transparent', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  seasonIconOuterRingActive: { borderColor: '#B88A60' },
  seasonIconInner: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  seasonLabel: { fontSize: 14, color: '#666666' },
  seasonLabelActive: { color: '#A67B5B', fontWeight: '600' },
  categoriesScroll: { marginBottom: 24, marginHorizontal: -20 },
  categoriesContainer: { paddingHorizontal: 20 },
  categoryPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#CDBBAA', marginRight: 12 },
  categoryPillActive: { backgroundColor: '#A67B5B', borderColor: '#A67B5B' },
  categoryText: { fontSize: 12, color: '#CDBBAA', fontWeight: '500' },
  categoryTextActive: { color: '#FFFFFF' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E5E0', borderRadius: 14, paddingHorizontal: 16, height: 50, marginBottom: 32 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  listTitle: { fontSize: 20, fontWeight: '500', color: '#333333', marginBottom: 16 },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  imageWrapper: { width: 80, height: 80, marginRight: 20, position: 'relative' },
  imageBackdrop: { position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: '#DCD6CE', borderRadius: 16, transform: [{ rotate: '5deg' }] },
  productImage: { width: '100%', height: '100%', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  productInfo: { flex: 1, justifyContent: 'center' },
  itemCount: { fontSize: 11, color: '#A67B5B', fontWeight: '600', marginBottom: 4 },
  productTitle: { fontSize: 16, color: '#333333', fontWeight: '500' },
  chevronButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#E0DCD3', justifyContent: 'center', alignItems: 'center' },
  separator: { height: 1, backgroundColor: '#EBE5DE', marginHorizontal: 20 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 15, fontStyle: 'italic' }
});