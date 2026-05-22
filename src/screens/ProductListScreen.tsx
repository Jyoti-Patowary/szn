import React, { useState, useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { 
  View, Text, StyleSheet, FlatList, Image, SafeAreaView, 
  TouchableOpacity, TextInput, ActivityIndicator, Modal, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';

export default function ProductListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  
  // Get the product_type passed from the previous screen (e.g., 'Dresses')
  const { type = 'Dresses', title = 'Dresses' } = route.params || {};

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortOption, setSortOption] = useState('recent'); // recent, price_asc, price_desc, oldest

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('catalog_products')
          .select('*')
          .eq('product_type', type); // Only fetch items for this specific category

        if (error) throw error;

        if (data) {
          let formattedData = data.map(item => {
            let bestImage = item.listing_image_url;
            if (!bestImage && item.image_urls && item.image_urls.length > 0) {
              bestImage = item.image_urls[0];
            }
            return {
              ...item,
              displayImage: bestImage || FALLBACK_IMAGE,
              // Clean the price string (e.g., "$24.00" -> 24) for accurate sorting
              rawPrice: parseFloat((item.price || '0').replace(/[^0-9.-]+/g, ""))
            };
          });

          // Apply Client-Side Sorting
          if (sortOption === 'price_asc') {
            formattedData.sort((a, b) => a.rawPrice - b.rawPrice);
          } else if (sortOption === 'price_desc') {
            formattedData.sort((a, b) => b.rawPrice - a.rawPrice);
          } else if (sortOption === 'oldest') {
            formattedData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          } else { // 'recent'
            formattedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          }

          // Apply Search Filter
          if (searchInput) {
            formattedData = formattedData.filter(item => 
              item.name?.toLowerCase().includes(searchInput.toLowerCase())
            );
          }

          setProducts(formattedData);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search slightly
    const handler = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(handler);
  }, [type, sortOption, searchInput]);

  // --- RENDER PRODUCT CARD ---
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
        <Text style={styles.productPrice}>{item.price || '$24.00'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>Elegant silhouettes curated for your season.</Text>
        </View>
      </View>

      {/* Search & Filter Bar */}
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

      {/* Product Grid */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A67B5B" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.rowWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          )}
        />
      )}

      {/* BOTTOM SHEET FILTER MODAL */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />
            
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Sort Options */}
            <View style={styles.sortGroup}>
              {[
                { id: 'recent', label: 'Most recent' },
                { id: 'price_asc', label: 'Price : Low to High' },
                { id: 'price_desc', label: 'Price : High to Low' },
                { id: 'oldest', label: 'Oldest' },
              ].map(opt => (
                <TouchableOpacity 
                  key={opt.id} 
                  style={styles.radioRow} 
                  onPress={() => setSortOption(opt.id)}
                >
                  <Text style={styles.radioLabel}>{opt.label}</Text>
                  <View style={[styles.radioCircle, sortOption === opt.id && styles.radioCircleActive]}>
                    {sortOption === opt.id && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filter Categories */}
            <View style={styles.filterOptionsGroup}>
              {['COLOR', 'CATEGORY', 'SIZE'].map(filter => (
                <TouchableOpacity key={filter} style={styles.filterRow}>
                  <Text style={styles.filterRowLabel}>{filter}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Mock Price Range */}
            <View style={styles.priceRangeContainer}>
              <Text style={styles.filterRowLabel}>PRICE RANGE</Text>
              <View style={styles.mockSliderTrack}>
                <View style={styles.mockSliderFill} />
                <View style={[styles.mockSliderThumb, { left: '10%' }]} />
                <View style={[styles.mockSliderThumb, { left: '60%' }]} />
              </View>
              <View style={styles.priceLabels}>
                <Text style={styles.priceText}>$10</Text>
                <Text style={styles.priceText}>Up to $200</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.resetBtn} 
                onPress={() => {
                  setSortOption('recent');
                  setSearchInput('');
                }}
              >
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyBtn}
                onPress={() => setIsFilterVisible(false)}
              >
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'rgba(247, 243, 238, 1)' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { color: '#888', fontSize: 15 },
  
  /* Header */
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  backBtn: { marginRight: 16, marginTop: 4 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '500', color: '#333' },
  headerSubtitle: { fontSize: 13, color: '#666', marginTop: 4 },

  /* Search Bar & Filter Button */
  searchRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F4F0', borderWidth: 1, borderColor: '#DCD6CE', borderRadius: 14, paddingHorizontal: 12, height: 50, marginRight: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  filterBtn: { width: 50, height: 50, backgroundColor: '#A67B5B', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  /* Grid Layout */
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  rowWrapper: { justifyContent: 'space-between', marginBottom: 24 },
  
  /* Product Card */
  productCard: { width: '47%' },
  imageContainer: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#EBE5DE', overflow: 'hidden', position: 'relative' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heartButton: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FFF', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  productInfo: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productTitle: { flex: 1, fontSize: 11, color: '#333', fontWeight: '500', textTransform: 'uppercase', marginRight: 8 },
  productPrice: { fontSize: 12, color: '#666', fontWeight: '400' },

  /* --- BOTTOM SHEET MODAL STYLES --- */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#F6F4F0', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12, maxHeight: SCREEN_HEIGHT * 0.9 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#DCD6CE', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  sheetTitle: { fontSize: 20, fontWeight: '500', color: '#333' },
  
  /* Radio Buttons */
  sortGroup: { marginBottom: 30 },
  radioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  radioLabel: { fontSize: 15, color: '#666' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#A67B5B', justifyContent: 'center', alignItems: 'center' },
  radioCircleActive: { borderColor: '#A67B5B' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#A67B5B' },

  /* Filter Categories */
  filterOptionsGroup: { marginBottom: 30 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  filterRowLabel: { fontSize: 13, color: '#333', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },

  /* Mock Slider */
  priceRangeContainer: { marginBottom: 40 },
  mockSliderTrack: { height: 4, backgroundColor: '#E0DCD3', borderRadius: 2, marginTop: 20, marginBottom: 12, position: 'relative' },
  mockSliderFill: { position: 'absolute', left: '10%', right: '40%', top: 0, bottom: 0, backgroundColor: '#A67B5B', borderRadius: 2 },
  mockSliderThumb: { position: 'absolute', top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: '#A67B5B' },
  priceLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  priceText: { fontSize: 12, color: '#999' },

  /* Action Buttons */
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resetBtn: { flex: 1, borderWidth: 1, borderColor: '#A67B5B', borderRadius: 25, paddingVertical: 16, alignItems: 'center', marginRight: 10 },
  resetBtnText: { color: '#A67B5B', fontSize: 16, fontWeight: '600' },
  applyBtn: { flex: 1, backgroundColor: '#A67B5B', borderRadius: 25, paddingVertical: 16, alignItems: 'center', marginLeft: 10 },
  applyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});