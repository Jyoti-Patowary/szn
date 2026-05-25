import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const { height } = Dimensions.get('window');

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FeaturedLook'>;

export default function FeaturedLookScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  const route = useRoute<any>();
  const { lookId } = route.params || {};

  const [lookData, setLookData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLookAndProducts = async () => {
      try {
        setIsLoading(true);

        const { data: look, error: lookError } = await supabase
          .from('catalog_looks')
          .select('*')
          .eq('id', lookId)
          .single();

        if (lookError) throw lookError;
        setLookData(look);

        const { data: itemsData, error: itemsError } = await supabase
          .from('catalog_look_items')
          .select(`
            sort_order,
            product:catalog_products (*)
          `)
          .eq('look_id', lookId)
          .order('sort_order', { ascending: true });

        if (itemsError) throw itemsError;

        if (itemsData) {
          const mappedProducts = itemsData.map((item: any) => item.product);
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Error fetching featured look details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (lookId) {
      fetchLookAndProducts();
    }
  }, [lookId]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C5E33" />
        </View>
      ) : (
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <Image 
            source={{ uri: lookData?.render_image_url || FALLBACK_IMAGE }}
            style={styles.heroImage}
          />

          <View style={styles.contentContainer}>
            <Text style={styles.title}>{lookData?.name || 'Curated Style'}</Text>
            <Text style={styles.description}>
              {lookData?.description || 'Effortless layering with soft neutrals and timeless pieces. A silhouette designed for the transitioning seasons.'}
            </Text>

            <Text style={styles.sectionTitle}>Shop the Look</Text>

            {products.map((item) => {
              const imgUrl = item.listing_image_url || (item.image_urls && item.image_urls[0]) || FALLBACK_IMAGE;
              
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.shopItem} 
                  activeOpacity={0.7}
                  onPress={() => (navigation.navigate as any)('ProductDetail', { product: item })}
                >
                  <Image source={{ uri: imgUrl }} style={styles.itemImage} />
                  
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{item.price || 'TBA'}</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
                </TouchableOpacity>
              );
            })}

            {products.length === 0 && (
              <Text style={{ color: '#888', fontStyle: 'italic', marginTop: 10 }}>No products found for this look.</Text>
            )}
            
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      )}

      <SafeAreaView style={styles.floatingHeader} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EBE1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: height * 0.55, 
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: '#F5EBE1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32, 
    paddingHorizontal: 24,
    paddingTop: 32,
    minHeight: height * 0.5,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#EBEBEB',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10, 
  },
  itemName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#111',
    marginBottom: 6,
  },
  itemPrice: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#9C5E33',
  },
});