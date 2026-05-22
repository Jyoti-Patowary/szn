import React, { useState, useRef } from 'react'; 
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  FlatList, Dimensions, Platform, DimensionValue
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowUpRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type LookItem = {
  id: string;
  name: string;
  isFullLook?: boolean; 
  image?: any; 
  compose?: {
    top?: DimensionValue;    
    bottom?: DimensionValue; 
    left?: DimensionValue;   
    right?: DimensionValue;  
    width: DimensionValue;   
    height: DimensionValue;  
    zIndex: number;
  };
  dot?: {
    top: DimensionValue;   
    left: DimensionValue; 
  };
};

const MOCK_ITEMS: LookItem[] = [
  {
    id: 'item-1',
    name: 'Floral Summer Midi',
    image: require('../../assets/looks/dress.png'),
    compose: { top: '15%', left: '15%', width: '70%', height: '75%', zIndex: 1,  },
    dot: { top: '23%', left: '62%' } 
  },
  {
    id: 'item-2',
    name: 'Classic Summer Hat',
    image: require('../../assets/looks/hat.png'),
    compose: { top: '-5%', right: '5%', width: '37%', height: '20%', zIndex: 2 },
    dot: { top: '50%', left: '50%' }
  },
  {
    id: 'item-3',
    name: 'Woven Straw Tote',
    image: require('../../assets/looks/bag.png'),
    compose: { top: '45%', right: '5%', width: '40%', height: '30%', zIndex: 4 },
    dot: { top: '40%', left: '40%' }
  },
  {
    id: 'item-4',
    name: 'Classic Round Shades',
    image: require('../../assets/looks/glass.png'),
    compose: { top: '40%', left: '5%', width: '35%', height: '15%', zIndex: 3 },
    dot: { top: '50%', left: '40%' }
  },
  {
    id: 'item-5',
    name: 'Leather Sandals',
    image: require('../../assets/looks/footwear.png'),
    compose: { bottom: '2%', left: '15%', width: '45%', height: '20%', zIndex: 5 },
    dot: { top: '60%', left: '50%' }
  }
];

const CAROUSEL_DATA: LookItem[] = [
  { id: 'full-look', name: 'Full Outfit', isFullLook: true },
  ...MOCK_ITEMS
];

export default function LookDetailScreen() {
  const navigation = useNavigation();

  const [activeItem, setActiveItem] = useState<any | null>(null); 

  const flatListRef = useRef<FlatList>(null);

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

  const renderCollage = (isInteractive: boolean = false) => (
    <View style={styles.collageContainer}>
      {MOCK_ITEMS.map(item => {
        const itemLayout = [
          styles.composedItem, 
          {
            top: item.compose?.top,
            bottom: item.compose?.bottom,
            left: item.compose?.left,
            right: item.compose?.right,
            width: item.compose?.width,
            height: item.compose?.height,
            zIndex: item.compose?.zIndex,
          }
        ];

        return (
          <TouchableOpacity
            key={item.id}
            style={itemLayout}
            activeOpacity={isInteractive ? 0.8 : 1}
            disabled={!isInteractive} 
            onPress={() => isInteractive && handleItemSelect(item)}
          >
            <Image source={item.image} style={styles.fullSize} resizeMode="contain" />
            
            {isInteractive && item.dot && (
              <View style={[styles.hotspotTouchArea, { top: item.dot.top, left: item.dot.left }]}>
                <View style={styles.hotspotOuterRing}>
                  <View style={styles.hotspotInnerDot} />
                </View>
              </View>
            )}
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

      <View style={styles.mainStage}>
        {activeItem ? (
          <Image source={activeItem.image} style={styles.singleFocusImage} resizeMode="contain" />
        ) : (
          renderCollage(true) 
        )}
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.bottomHeader}>
          <Text style={styles.sectionTitle}>Items in this Look</Text>
          <Text style={styles.itemCount}>{MOCK_ITEMS.length} Items</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={CAROUSEL_DATA}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          keyExtractor={(item) => item.id}
          getItemLayout={(data, index) => ({
            length: 136,
            offset: 136 * index,
            index,
          })}
          renderItem={({ item }) => {
            const isSelected = activeItem?.id === item.id || (!activeItem && item.isFullLook);

            return (
              <View style={styles.carouselItemWrapper}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                  onPress={() => {
                    if (isSelected && !item.isFullLook) {
                      handleItemSelect(CAROUSEL_DATA[0]); 
                    } else {
                      handleItemSelect(item);
                    }
                  }}
                >
                  {item.isFullLook ? (
                    renderCollage(false)
                  ) : (
                    <Image source={item.image} style={styles.fullSize} resizeMode="contain" />
                  )}
                </TouchableOpacity>
                
                <View style={styles.itemTextRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <ArrowUpRight size={14} color="#A67B5B" strokeWidth={2.5} />
                </View>

              </View>
            );
          }}
        />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F6F4EF' 
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
  },
  composedItem: {
    position: 'absolute',
  },
  fullSize: {
    width: '100%',
    height: '100%',
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
    width: 6,
    height: 6,
    borderRadius: 3,
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
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#333',
  },
  itemCount: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#888',
  },
  carouselContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  carouselItemWrapper: {
    width: 120,
    marginRight: 16,
  },
  itemCard: {
    width: 120,
    height: 140,
    backgroundColor: '#E5E1DB', 
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden', 
  },
  itemCardSelected: {
    borderColor: '#A67B5B', 
    backgroundColor: '#FFF', 
  },
  itemTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#555',
    marginRight: 8,
  },
});