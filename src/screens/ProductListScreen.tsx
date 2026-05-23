import React, { useState, useEffect, useMemo } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, TextInput, ActivityIndicator, Modal, Dimensions, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomRangeSlider from '../components/CustomRangeSlider';
import FilterModal from '../components/FilterModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';
const PAGE_SIZE = 20;

export default function ProductListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();

  const { type = 'Dresses', title = 'Dresses', season } = route.params || {};

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredMasterList, setFilteredMasterList] = useState<any[]>([]);
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [sortOption, setSortOption] = useState('recent');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('catalog_products')
          .select('*')
          .eq('product_type', type);

        if (season) query = query.contains('seasons', [season.toLowerCase()]);

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          const cleanedData = data.map(item => {
            let bestImage = item.listing_image_url;
            if (!bestImage && item.image_urls && item.image_urls.length > 0) {
              bestImage = item.image_urls[0];
            }
            return {
              ...item,
              displayImage: bestImage || FALLBACK_IMAGE,
              rawPrice: parseFloat((item.price || '0').replace(/[^0-9.-]+/g, ""))
            };
          });
          setAllProducts(cleanedData);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [type, season]);

  const maxCatalogPrice = useMemo(() => {
    if (allProducts.length === 0) return 200;
    const validPrices = allProducts
      .map(p => p.rawPrice)
      .filter(p => !isNaN(p) && p > 0);

    return validPrices.length > 0 ? Math.max(...validPrices) : 200;
  }, [allProducts]);

  useEffect(() => {
    setMinPrice(0);
    setMaxPrice(maxCatalogPrice);
  }, [maxCatalogPrice]);

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    allProducts.forEach(p => {
      if (p.colors && Array.isArray(p.colors)) p.colors.forEach((c: string) => colors.add(c));
    });
    return Array.from(colors).sort();
  }, [allProducts]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    allProducts.forEach(p => {
      if (p.categories && Array.isArray(p.categories)) p.categories.forEach((c: string) => cats.add(c));
    });
    return Array.from(cats).sort();
  }, [allProducts]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (allProducts.length === 0) {
      setFilteredMasterList([]);
      setDisplayProducts([]);
      return;
    }

    let filtered = [...allProducts];

    if (debouncedSearch) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (selectedColor) {
      filtered = filtered.filter(item =>
        item.colors &&
        Array.isArray(item.colors) &&
        item.colors.some((col: string) => col.trim().toLowerCase() === selectedColor.trim().toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item =>
        item.categories &&
        Array.isArray(item.categories) &&
        item.categories.some((cat: string) => cat.trim().toLowerCase() === selectedCategory.trim().toLowerCase())
      );
    }

    filtered = filtered.filter(item => item.rawPrice >= minPrice && item.rawPrice <= maxPrice);

    if (sortOption === 'price_asc') {
      filtered.sort((a, b) => a.rawPrice - b.rawPrice);
    } else if (sortOption === 'price_desc') {
      filtered.sort((a, b) => b.rawPrice - a.rawPrice);
    } else if (sortOption === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredMasterList(filtered);
    setPage(1);
    setDisplayProducts(filtered.slice(0, PAGE_SIZE));
  }, [allProducts, debouncedSearch, sortOption, selectedColor, selectedCategory, minPrice, maxPrice]);

  const handleLoadMore = () => {
    if (displayProducts.length >= filteredMasterList.length) return;
    const nextPage = page + 1;
    const startIndex = page * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const nextItems = filteredMasterList.slice(startIndex, endIndex);

    setDisplayProducts(prev => [...prev, ...nextItems]);
    setPage(nextPage);
  };

  const handleResetFilters = () => {
    setSortOption('recent');
    setSearchInput('');
    setSelectedColor('');
    setSelectedCategory('');
    setMinPrice(0);
    setMaxPrice(maxCatalogPrice);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.displayImage }} style={styles.productImage} />
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={18} color="#A67B5B" />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.name || 'Solid Sleeveless Maxi'}
        </Text>
        <Text style={styles.productPrice}>{item.price || '$0.00'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>Elegant silhouettes curated for your season.</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Brand, dresses, skirts etc"
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

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A67B5B" />
        </View>
      ) : (
        <FlatList
          data={displayProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.rowWrapper}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            displayProducts.length < filteredMasterList.length ? (
              <ActivityIndicator size="small" color="#A67B5B" style={{ marginVertical: 20 }} />
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          )}
        />
      )}

      <FilterModal
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onReset={handleResetFilters}
        resultsCount={displayProducts.length}

        sortOption={sortOption}
        setSortOption={setSortOption}

        availableCategories={availableCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}

        availableColors={availableColors}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}

        maxCatalogPrice={maxCatalogPrice}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'rgba(247, 243, 238, 1)' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { color: '#888', fontSize: 15 },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  backBtn: { marginRight: 16, marginTop: 4 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '500', color: '#333' },
  headerSubtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F4F0', borderWidth: 1, borderColor: '#DCD6CE', borderRadius: 14, paddingHorizontal: 12, height: 50, marginRight: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  filterBtn: { width: 50, height: 50, backgroundColor: '#A67B5B', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  rowWrapper: { justifyContent: 'space-between', marginBottom: 24 },
  productCard: { width: '47%' },
  imageContainer: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#EBE5DE', overflow: 'hidden', position: 'relative' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heartButton: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FFF', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  productInfo: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productTitle: { flex: 1, fontSize: 11, color: '#333', fontWeight: '500', textTransform: 'uppercase', marginRight: 8 },
  productPrice: { fontSize: 12, color: '#666', fontWeight: '400' },
});