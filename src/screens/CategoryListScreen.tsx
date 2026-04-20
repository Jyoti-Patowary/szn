import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, SafeAreaView, Dimensions, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const { width } = Dimensions.get('window');

// --- MOCK DATABASE ---
// In a real app, you would fetch this from an API based on the categoryId
const CATEGORY_DATA: Record<string, any> = {
  'autumn_accessories': {
    title: 'Autumn Accessories',
    subtitle: 'Elevated accessories to complete your autumn style.',
    filters: ['ALL', 'SUNGLASSES', 'CHAIN BELTS', 'STATEMENT EARRINGS'],
    products: [
      { id: '1', name: 'Gold Circle Chain Belt', price: '$32.99', image: 'https://images.unsplash.com/photo-1599643477874-cefb3eeb7428?q=80&w=400&auto=format&fit=crop', category: 'CHAIN BELTS' },
      { id: '2', name: 'Vegan Chain Belt', price: '$79.50', image: 'https://images.unsplash.com/photo-1628149462157-19cb9eafaf90?q=80&w=400&auto=format&fit=crop', category: 'CHAIN BELTS' },
      { id: '3', name: 'LANA Metal Oval Sunglasses', price: '$20.00', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop', category: 'SUNGLASSES' },
      { id: '4', name: 'Statement Round Bangle', price: '$27.99', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop', category: 'STATEMENT EARRINGS' },
    ]
  },
  'summer_makeup': {
    title: 'Summer Makeup',
    subtitle: 'Glowy, lightweight essentials for the heat.',
    filters: ['ALL', 'LIPS', 'FACE', 'EYES'],
    products: [
      { id: '5', name: 'Dewy Finish Setting Spray', price: '$24.00', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop', category: 'FACE' },
      // Add more items here...
    ]
  }
};

type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'CategoryList'>;

export default function CategoryListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // 1. Get the categoryId passed from the Home Screen
  const route = useRoute<CategoryScreenRouteProp>();
  const { categoryId } = route.params;

  // 2. Load the specific data for that category
  const data = CATEGORY_DATA[categoryId] || CATEGORY_DATA['autumn_accessories']; // Fallback just in case

  // UI State
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Filter the products based on the selected pill
  const filteredProducts = data.products.filter((item: any) => {
    if (activeFilter === 'ALL') return true;
    return item.category === activeFilter;
  });

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {/* Heart Icon Button */}
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={18} color="#A67B5B" />
        </TouchableOpacity>
      </View>
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>{data.subtitle}</Text>
        </View>
      </View>

      {/* --- FILTERS (Horizontal Scroll) --- */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {data.filters.map((filter: string) => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterPill, activeFilter === filter && styles.activeFilterPill]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* --- SEARCH BAR --- */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* --- 2-COLUMN PRODUCT GRID --- */}
      <FlatList 
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.rowWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EBE1', // Matching theme
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
    marginTop: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter_600SemiBold', // Replace with Playfair if desired!
    fontSize: 24,
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4C7BA',
    marginRight: 10,
  },
  activeFilterPill: {
    backgroundColor: '#A67B5B', // Brown active state
    borderColor: '#A67B5B',
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#A67B5B',
  },
  activeFilterText: {
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#A67B5B',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#333',
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Room for bottom nav/scrolling
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  productCard: {
    width: (width - 48) / 2, // Half width minus padding
  },
  imageContainer: {
    backgroundColor: '#EBEBEB',
    borderRadius: 16,
    height: 180,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
  },
});