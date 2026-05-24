import React, { useState, useRef, useEffect } from 'react'; 
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, Linking,
  FlatList, Dimensions, Platform, DimensionValue, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ArrowUpRight } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';

type LookItem = {
  id: string;
  name: string;
  isFullLook?: boolean; 
  link_url?: string; 
  image?: any; 
  dot?: {
    top: DimensionValue;   
    left: DimensionValue; 
  };
};

export default function LookDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { lookId } = route.params || {};

  const [lookData, setLookData] = useState<any>(null);
  const [products, setProducts] = useState<LookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<any | null>(null); 

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!lookId) return;
      setIsLoading(true);

      try {
        const { data: look } = await supabase
          .from('catalog_looks')
          .select('*')
          .eq('id', lookId)
          .single();

        if (look) setLookData(look);

        const canvasLayers = look?.canvas_layers || [];

        const { data: itemsData, error } = await supabase
          .from('catalog_look_items')
          .select(`
            sort_order,
            product:catalog_products (*)
          `)
          .eq('look_id', lookId)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (itemsData) {
          const mappedProducts = itemsData.map((item: any) => {
            const p = item.product;
            const imgUrl = p.listing_image_url || (p.image_urls && p.image_urls[0]) || FALLBACK_IMAGE;

            const layerData = canvasLayers.find((layer: any) => layer.product_id === p.id);
            
            let dotCoords = undefined;
            if (layerData) {
              dotCoords = {
                left: `${layerData.x}%` as DimensionValue,
                top: `${layerData.y}%` as DimensionValue
              };
            }
            
            const firstImageUrl = (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : undefined;

            return {
              id: p.id,
              name: p.name || 'Product',
              image: { uri: imgUrl },
              link_url: p.source_url,
              dot: dotCoords,
            };
          });
          
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error("Error fetching look details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lookId]);

  const CAROUSEL_DATA: LookItem[] = [
    { 
      id: 'full-look', 
      name: lookData?.name || 'Full Outfit', 
      isFullLook: true,
      image: { uri: lookData?.render_image_url || FALLBACK_IMAGE }
    },
    ...products
  ];

  const handleItemSelect = (item: any) => {
    if (item.isFullLook) {
      setActiveItem(null);
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      return;
    }

    setActiveItem(item);

    const scrollIndex = CAROUSEL_DATA.findIndex(data => data.id === item.id);
    
    if (scrollIndex !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ 
        index: scrollIndex, 
        animated: true,
        viewPosition: 0.5 
      });
    }
  };

  const openLink = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  const renderLookWithHotspots = () => (
    <View style={styles.collageContainer}>
      
      <Image 
        source={{ uri: lookData?.render_image_url || FALLBACK_IMAGE }} 
        style={styles.fullSize} 
        resizeMode="cover" 
      />
      
      {products.map((lookProduct) => {
        if (!lookProduct.dot) return null;

        return (
          <TouchableOpacity
            key={lookProduct.id}
            style={[
              styles.hotspotTouchArea, 
              { top: lookProduct.dot.top, left: lookProduct.dot.left }
            ]}
            activeOpacity={0.8}
            onPress={() => handleItemSelect(lookProduct)}
          >
            <View style={styles.hotspotOuterRing}>
              <View style={styles.hotspotInnerDot} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#A67B5B" />
        </View>
      ) : (
        <>
          <View style={styles.mainStage}>
            {activeItem && !activeItem.isFullLook ? (
              <Image source={activeItem.image} style={styles.singleFocusImage} resizeMode="contain" />
            ) : (
              renderLookWithHotspots() 
            )}
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.bottomHeader}>
              <Text style={styles.sectionTitle}>Items in this Look</Text>
              <Text style={styles.itemCount}>{products.length} Items</Text>
            </View>

            <FlatList
              ref={flatListRef}
              data={CAROUSEL_DATA}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              keyExtractor={(item) => item.id}
              getItemLayout={(data, index) => ({
                length: 174,
                offset: 174 * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
              renderItem={({ item }) => {
                const isSelected = activeItem?.id === item.id || (!activeItem && item.isFullLook);

                return (
                  <View style={styles.carouselItemWrapper}>
                    <View style={[styles.itemCard, isSelected && styles.itemCardSelected]}>
                      
                      <TouchableOpacity 
                        activeOpacity={0.8}
                        style={styles.cardImageContainer}
                        onPress={() => {
                          if (isSelected && !item.isFullLook) {
                            handleItemSelect(CAROUSEL_DATA[0]); 
                          } else {
                            handleItemSelect(item);
                          }
                        }}
                      >
                        {item.isFullLook ? (
                          <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                        ) : (
                          <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                        )}
                      </TouchableOpacity>
                      
                      {item.link_url && !item.isFullLook ? (
                        <TouchableOpacity 
                          style={styles.cardTextContainer} 
                          activeOpacity={0.6}
                          onPress={() => openLink(item.link_url)}
                        >
                          <Text style={styles.itemNameLink} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <ArrowUpRight size={14} color="#A67B5B" strokeWidth={2.5} />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.cardTextContainer}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>
                      )}

                    </View>
                  </View>
                );
              }}
            />
          </View>
        </>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F3EE' 
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4CDC4',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainStage: {
    flex: 1,
    width: '100%',
    padding: 20, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleFocusImage: {
    width: '100%',
    height: '100%',
  },
  collageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden', 
  },
  fullSize: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  hotspotTouchArea: {
    position: 'absolute',
    transform: [{ translateX: -12 }, { translateY: -12 }], 
    width: 34, 
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  hotspotOuterRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  hotspotInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  bottomSection: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 30, 
  },
  bottomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#2E2E2E',
  },
  itemCount: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  carouselContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  carouselItemWrapper: {
    width: 158,
    marginRight: 16,
  },
  
  itemCard: {
    width: 158,
    height: 182,
    backgroundColor: '#FFF', 
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden', 
    resizeMode: 'cover',
  },
  itemCardSelected: {
    borderColor: '#A67B5B', 
    backgroundColor: '#FFF', 
  },
  cardImageContainer: {
    flex: 1,
    width: 158,
    height: 150,
    padding: 8,
    paddingBottom: 0, 
    alignItems: 'center',
  },
  cardImage: {
    width: 142,
    height: 142,
    borderRadius: 8,
    paddingBottom: 4
  },
  cardTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#6B6B6B',
    marginRight: 8,
  },
  itemNameLink: {
    flex: 1,
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '400',
    marginRight: 8,
  },
});