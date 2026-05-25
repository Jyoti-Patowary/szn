import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Dimensions, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useSavedItems } from '../context/SavedItemsContext'; 

const { width } = Dimensions.get('window');
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';
const PAGE_SIZE = 20; 

type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'CategoryList'>;

export default function CategoryListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<CategoryScreenRouteProp>();
  const { categoryId } = route.params;
  const { currentTheme } = useTheme();

  const { savedProducts, setSavedProducts } = useSavedItems(); 

  const [products, setProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState<string[]>(['ALL']);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSubtitle, setPageSubtitle] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleSave = async (productId: string) => {
    const isSaved = savedProducts?.includes(productId);

    if (isSaved) {
      setSavedProducts((prev: string[]) => prev.filter(id => id !== productId));
    } else {
      setSavedProducts((prev: string[]) => [...prev, productId]);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isSaved) {
        await supabase
          .from('user_saved_products')
          .delete()
          .match({ user_id: user.id, product_id: productId });
      } else {
        await supabase
          .from('user_saved_products')
          .insert({ user_id: user.id, product_id: productId });
      }
    } catch (error) {
      console.error("Error updating saved status:", error);
    }
  };

  const fetchProducts = async (pageNum: number) => {
    if (pageNum === 0) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const currentSeasonName = currentTheme?.id?.toLowerCase() || 'autumn';
      
      let productQuery = supabase.from('catalog_products').select('*', { count: 'exact' });
      let titleToSet = '';

     if (categoryId.startsWith('seasonal_')) {
        titleToSet = 'Seasonal Picks';
        setPageSubtitle(`All top picks for ${currentTheme?.name || 'Autumn'}`);
        productQuery = productQuery.contains('seasons', [currentSeasonName]);
        
      } else if (categoryId.startsWith('coord_tag_')) {
        const tag = categoryId.replace('coord_tag_', '');
        titleToSet = `${tag} Sets`;
        setPageSubtitle(`Matching ${tag.toLowerCase()} sets.`);
  
        productQuery = productQuery
          .or('product_type.ilike.%co-ord%,product_type.ilike.%set%,name.ilike.%co-ord%,name.ilike.%set%')
          .filter('product_tags', 'cs', JSON.stringify([tag]));
          
      } else if (categoryId === 'weekly_picks' || categoryId === 'co-ords') {
        titleToSet = 'CO-ORD Sets';
        setPageSubtitle('Effortless matching sets.');
        productQuery = productQuery.or('product_type.ilike.%co-ord%,product_type.ilike.%set%,name.ilike.%co-ord%,name.ilike.%set%');
        
      } else {
        titleToSet = `${currentTheme?.name || 'Autumn'} ${categoryId}`;
        setPageSubtitle(`Perfect ${categoryId.toLowerCase()} for the season.`);
        productQuery = productQuery
          .eq('product_type', categoryId)
          .contains('seasons', [currentSeasonName]);
      }

      setPageTitle(titleToSet);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, count, error } = await productQuery.range(from, to);

      if (error) throw error;

      if (data) {
        const formattedProducts = data.map((p: any) => {
          const imgUrl = p.listing_image_url || (p.image_urls && p.image_urls[0]) || FALLBACK_IMAGE;
          const productCategory = p.product_sub_category ? p.product_sub_category.toUpperCase() : 'ALL'; 

          return {
            ...p, 
            id: p.id,
            name: p.name || 'Product',
            price: p.price ? p.price : 'TBA', 
            image: imgUrl,
            category: productCategory,
          };
        });

        let updatedProducts = [];
        if (pageNum === 0) {
          updatedProducts = formattedProducts;
          setProducts(formattedProducts);
        } else {
          updatedProducts = [...products, ...formattedProducts];
          setProducts(updatedProducts);
        }

        const uniqueCategories = Array.from(new Set(updatedProducts.map(item => item.category)));
        const finalFilters = ['ALL', ...uniqueCategories.filter(c => c !== 'ALL')];
        setFilters(finalFilters);

        if (count !== null && updatedProducts.length >= count) {
          setHasMore(false);
        } else if (formattedProducts.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setProducts([]);
    fetchProducts(0);
  }, [categoryId, currentTheme]);

  const handleLoadMore = () => {
    if (!hasMore || isFetchingMore || isLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  const filteredProducts = products.filter((item: any) => {
    const matchesFilter = activeFilter === 'ALL' || item.category === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderProduct = ({ item }: { item: any }) => {
    const isSaved = savedProducts?.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        activeOpacity={0.9}
        onPress={() => (navigation.navigate as any)('ProductDetail', { product: item })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          
          <TouchableOpacity 
            style={styles.heartButton} 
            activeOpacity={0.7}
            onPress={() => handleToggleSave(item.id)} 
          >
            <Ionicons 
              name={isSaved ? "heart" : "heart-outline"} 
              size={18} 
              color={currentTheme?.color || "#A67B5B"} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfoRow}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productPrice}>{item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{pageTitle}</Text>
          <Text style={styles.subtitle}>{pageSubtitle}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={currentTheme?.color || "#A67B5B"} />
        </View>
      ) : (
        <>
          {filters.length > 1 && (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {filters.map((filter: string) => (
                  <TouchableOpacity 
                    key={filter} 
                    style={[
                      styles.filterPill, 
                      activeFilter === filter && { backgroundColor: currentTheme?.color || '#A67B5B', borderColor: currentTheme?.color || '#A67B5B' }
                    ]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text style={[
                      styles.filterText, 
                      { color: currentTheme?.color || '#A67B5B' },
                      activeFilter === filter && styles.activeFilterText
                    ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={[styles.searchContainer, { borderColor: currentTheme?.color || '#A67B5B' }]}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search by name"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList 
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.rowWrapper}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => 
              isFetchingMore ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator size="small" color={currentTheme?.color || "#A67B5B"} />
                </View>
              ) : null
            }
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#888', fontStyle: 'italic' }}>No products found for this category.</Text>
              </View>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5EBE1' },
  header: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, marginBottom: 20 },
  backButton: { marginRight: 16, marginTop: 4 },
  headerTextContainer: { flex: 1 },
  title: { fontFamily: 'Inter_400Regular', fontSize: 22, color: '#2E2E2E', marginBottom: 4, textTransform: 'capitalize' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#6B6B6B' },
  filterScroll: { paddingHorizontal: 20, paddingBottom: 16 },
  filterPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#D4C7BA', marginRight: 10 },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  activeFilterText: { color: '#FFF' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', borderWidth: 1, borderRadius: 12, marginHorizontal: 20, paddingHorizontal: 16, height: 48, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#333' },
  gridContainer: { paddingHorizontal: 16, paddingBottom: 100 },
  rowWrapper: { justifyContent: 'space-between', marginBottom: 20 },
  productCard: { width: (width - 48) / 2 },
  imageContainer: { backgroundColor: '#EBEBEB', borderRadius: 16, height: 200, marginBottom: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heartButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255, 255, 255, 0.85)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  productName: { 
    flex: 1, 
    fontFamily: 'Inter_400Regular', 
    fontSize: 12, 
    color: '#2E2E2E',
    marginRight: 8, 
  },
  productPrice: { 
    fontFamily: 'Inter_400Regular',
    fontSize: 12, 
    color: '#6B6B6B' 
  },
});