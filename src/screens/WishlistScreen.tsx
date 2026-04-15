import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DUMMY_CATALOGUE_ITEMS = [
  { id: '1', title: 'Solid Sleeveless Maxi', price: '$24.00', image: 'https://images.unsplash.com/photo-1566162200408-a25e1df1e1fe?q=80&w=1974&auto=format&fit=crop' },
  { id: '2', title: 'Solid Sleeveless Maxi', price: '$24.00', image: 'https://images.unsplash.com/photo-1572804013309-82a89b43af17?q=80&w=1974&auto=format&fit=crop' },
  { id: '3', title: 'Solid Sleeveless Maxi', price: '$24.00', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop' },
  { id: '4', title: 'Solid Sleeveless Maxi', price: '$24.00', image: 'https://images.unsplash.com/photo-1515347619362-75fe20625345?q=80&w=2070&auto=format&fit=crop' },
];

const DUMMY_SAVED_LOOKS = [
  { id: '1', title: 'Classic Feminine Look', items: 4, image: 'https://images.unsplash.com/photo-1434389678369-184bf388ef09?q=80&w=1964&auto=format&fit=crop' },
  { id: '2', title: 'Vacation Day Outfit', items: 5, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop' },
  { id: '3', title: 'Coastal Summer Style', items: 4, image: 'https://images.unsplash.com/photo-1485230895905-31f0a1b4d8e5?q=80&w=2070&auto=format&fit=crop' },
  { id: '4', title: 'Cozy Fall Style', items: 4, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop' },
];

export default function WishlistScreen() {
  const [activeTab, setActiveTab] = useState<'Catalogue' | 'Saved Looks'>('Catalogue');

  const renderCatalogueItem = ({ item }: { item: typeof DUMMY_CATALOGUE_ITEMS[0] }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <TouchableOpacity style={styles.heartButton}>
        <Ionicons name="heart" size={20} color="#A0785A" />
      </TouchableOpacity>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardPrice}>{item.price}</Text>
      </View>
    </View>
  );

  const renderSavedLook = ({ item }: { item: typeof DUMMY_SAVED_LOOKS[0] }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <TouchableOpacity style={styles.heartButton}>
        <Ionicons name="heart" size={20} color="#A0785A" />
      </TouchableOpacity>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemCount}>{item.items} Items</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <Text style={styles.headerSubtitle}>Your saved styles and picks</Text>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, activeTab === 'Catalogue' && styles.toggleButtonActive]}
          onPress={() => setActiveTab('Catalogue')}
        >
          <Text style={[styles.toggleButtonText, activeTab === 'Catalogue' && styles.toggleButtonTextActive]}>
            Catalogue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, activeTab === 'Saved Looks' && styles.toggleButtonActive]}
          onPress={() => setActiveTab('Saved Looks')}
        >
          <Text style={[styles.toggleButtonText, activeTab === 'Saved Looks' && styles.toggleButtonTextActive]}>
            Saved Looks
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Catalogue' ? (
        <FlatList
          key="catalogue-list"
          data={DUMMY_CATALOGUE_ITEMS}
          renderItem={renderCatalogueItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <FlatList
          key="saved-looks-list"
          data={DUMMY_SAVED_LOOKS}
          renderItem={renderSavedLook}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
        />
      )}
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
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 32,
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#A0785A',
  },
  toggleButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#A0785A',
  },
  toggleButtonTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for bottom nav
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
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
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#EAEAEA',
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
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  cardPrice: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#666',
  },
  itemCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#999',
  },
});
