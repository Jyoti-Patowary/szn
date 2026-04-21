import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DUMMY_LOOKS = [
  { id: '1', title: 'Weekend Getaway', items: 3, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop' },
  { id: '2', title: 'Office Chic', items: 4, image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1995&auto=format&fit=crop' },
  { id: '3', title: 'Evening Elegance', items: 2, image: 'https://images.unsplash.com/photo-1502716115624-bbfc33f4a047?q=80&w=1964&auto=format&fit=crop' },
  { id: '4', title: 'Casual Sunday', items: 5, image: 'https://images.unsplash.com/photo-1434389678369-184bf388ef09?q=80&w=1964&auto=format&fit=crop' },
];

export default function LooksScreen() {
  const renderLook = ({ item }: { item: typeof DUMMY_LOOKS[0] }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.itemCount}>{item.items} Items</Text>
      </View>
      <TouchableOpacity style={styles.saveButton}>
        <Ionicons name="bookmark-outline" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Curated Looks</Text>
        <Text style={styles.headerSubtitle}>Discover complete outfits</Text>
      </View>

      <FlatList
        data={DUMMY_LOOKS}
        renderItem={renderLook}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 20,
    paddingBottom: 120, // space for bottom nav
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    height: 250,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    color: '#FFF',
    marginBottom: 4,
  },
  itemCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#E0E0E0',
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
});
