import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DUMMY_PRODUCTS = [
  { id: '1', title: 'Elegant Red Gown', price: '$120.00', image: 'https://images.unsplash.com/photo-1566162200408-a25e1df1e1fe?q=80&w=1974&auto=format&fit=crop' },
  { id: '2', title: 'Summer Floral Dress', price: '$85.00', image: 'https://images.unsplash.com/photo-1572804013309-82a89b43af17?q=80&w=1974&auto=format&fit=crop' },
  { id: '3', title: 'Classic Blue Maxi', price: '$110.00', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop' },
  { id: '4', title: 'Casual White Dress', price: '$65.00', image: 'https://images.unsplash.com/photo-1515347619362-75fe20625345?q=80&w=2070&auto=format&fit=crop' },
  { id: '5', title: 'Evening Black Dress', price: '$140.00', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1974&auto=format&fit=crop' },
  { id: '6', title: 'Boho Chic Skirt', price: '$55.00', image: 'https://images.unsplash.com/photo-1583496661160-c588c25a9002?q=80&w=1974&auto=format&fit=crop' },
];

export default function CatalogueScreen() {
  const renderItem = ({ item }: { item: typeof DUMMY_PRODUCTS[0] }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <TouchableOpacity style={styles.heartButton}>
        <Ionicons name="heart-outline" size={20} color="#A0785A" />
      </TouchableOpacity>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catalogue</Text>
      </View>
      <FlatList
        data={DUMMY_PRODUCTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    color: '#333',
  },
  listContent: {
    padding: 16,
    paddingBottom: 120, // Extra padding for bottom nav
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#A0785A',
  },
});
