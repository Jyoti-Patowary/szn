import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  FlatList, Image, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';

export default function WishlistScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'Catalogue' | 'Saved Looks'>('Catalogue');
  
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [savedLooks, setSavedLooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (activeTab === 'Catalogue') {
          const { data, error } = await supabase
            .from('user_saved_products') 
            .select(`
              id,
              catalog_products (*)
            `)
            .eq('user_id', user.id);

          if (error) throw error;

          if (data) {
            const formatted = data.map((item: any) => {
              const prod = item.catalog_products; 
              
              const bestImage = prod.listing_image_url || (prod.image_urls && prod.image_urls[0]) || FALLBACK_IMAGE;
              
              return {
                saveId: item.id, 
                productId: prod.id,
                title: prod.name || 'Untitled Product',
                price: prod.price || '$0.00',
                image: bestImage,
                fullProductObject: prod // Passed to detail screen
              };
            });
            setSavedProducts(formatted);
          }
        } else {
          const { data, error } = await supabase
            .from('user_saved_looks')
            .select(`
              id,
              catalog_looks (
                id,
                name,
                render_image_url, 
                catalog_look_items ( id )
              )
            `)
            .eq('user_id', user.id);

          if (error) throw error;

          if (data) {
            const formatted = data.map((item: any) => {
              const look = item.catalog_looks;
              return {
                saveId: item.id,
                lookId: look.id,
                title: look.name || 'Curated Look',
                itemsCount: look.catalog_look_items ? look.catalog_look_items.length : 0,
                image: look.render_image_url || FALLBACK_IMAGE 
              };
            });
            setSavedLooks(formatted);
          }
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [activeTab]);

  const handleRemove = async (saveId: string, type: 'product' | 'look') => {
    try {
      const tableName = type === 'product' ? 'user_saved_products' : 'user_saved_looks';
      const { error } = await supabase.from(tableName).delete().eq('id', saveId);
      
      if (error) throw error;

      if (type === 'product') {
        setSavedProducts(prev => prev.filter(p => p.saveId !== saveId));
      } else {
        setSavedLooks(prev => prev.filter(l => l.saveId !== saveId));
      }
    } catch (err) {
      Alert.alert('Error', 'Could not remove item from wishlist.');
      console.error(err);
    }
  };

  const renderCatalogueItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      activeOpacity={0.8}
      onPress={() => item.fullProductObject && navigation.navigate('ProductDetail', { product: item.fullProductObject })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <TouchableOpacity 
          style={styles.heartButton}
          onPress={() => handleRemove(item.saveId, 'product')}
        >
          <Ionicons name="heart" size={18} color="#AA8368" />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSavedLook = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productCard}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <TouchableOpacity 
          style={styles.heartButton}
          onPress={() => handleRemove(item.saveId, 'look')}
        >
          <Ionicons name="heart" size={18} color="#AA8368" />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.itemsCount} Items</Text>
      </View>
    </TouchableOpacity>
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

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A0785A" />
        </View>
      ) : activeTab === 'Catalogue' ? (
        <FlatList
          key="catalogue-list"
          data={savedProducts}
          renderItem={renderCatalogueItem}
          keyExtractor={(item) => item.saveId}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.rowWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No saved products yet.</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          key="saved-looks-list"
          data={savedLooks}
          renderItem={renderSavedLook}
          keyExtractor={(item) => item.saveId}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.rowWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No saved looks yet.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EE',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#888',
  },
  header: {
    padding: 20,
  },
  headerTitle: {
     fontSize: 24, fontWeight: '500', color: '#333333', marginBottom: 4 
  },
  headerSubtitle: {
    fontSize: 16, color: '#6B6B6B', marginBottom: 32 
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 32,
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
    paddingBottom: 120,
  },
  rowWrapper: { 
    justifyContent: 'space-between', 
    marginBottom: 24 
  },
  productCard: { 
    width: '47%' 
  },
  imageContainer: { 
    width: '100%', 
    height: 220, 
    borderRadius: 12, 
    backgroundColor: '#EBE5DE', 
    overflow: 'hidden', 
    position: 'relative' 
  },
  productImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
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
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 2 } 
  },
  productInfo: { 
    marginTop: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  productTitle: { 
    flex: 1, 
    fontSize: 11, 
    color: '#333', 
    fontWeight: '500', 
    textTransform: 'uppercase', 
    marginRight: 8 
  },
  productPrice: { 
    fontSize: 12, 
    color: '#666', 
    fontWeight: '400' 
  },
});