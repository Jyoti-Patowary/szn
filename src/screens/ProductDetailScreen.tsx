import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image,
  TouchableOpacity, TextInput, Dimensions, Linking, PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SaveButton from '../components/SaveButton';
import { useTheme } from '../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const { currentTheme } = useTheme();
  const themeColor = currentTheme?.color || '#A67B5B';

  const { product } = route.params || {};

  const images = (product?.image_urls && product.image_urls.length > 0)
    ? product.image_urls
    : [product?.listing_image_url || FALLBACK_IMAGE];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isShareVisible, setIsShareVisible] = useState(false);

  const brandName = product?.retailer || 'BRAND';
  const productTitle = product?.name || 'Elegant Dress';
  const productPrice = product?.price || '$0.00';

  const mainPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy < -20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          setIsDetailsVisible(true);
        }
      },
    })
  ).current;

  const detailsPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) { 
          setIsDetailsVisible(false);
        }
      },
    })
  ).current;

  const sharePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) { 
          setIsShareVisible(false);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...mainPanResponder.panHandlers}>

      <Image source={{ uri: images[activeImageIndex] }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      <SafeAreaView style={styles.topNavContainer}>
        <View style={styles.topNavRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsShareVisible(true)}>
            <Ionicons name="share-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {images.length > 1 && (
        <View style={styles.thumbnailsContainer}>
          {images.slice(0, 4).map((img: string, index: number) => {
            const isActive = index === activeImageIndex;
            return (
              <TouchableOpacity key={index} style={[styles.thumbnailWrapper, isActive && styles.thumbnailActive]}
               onPress={() => setActiveImageIndex(index)}>
                <Image source={{ uri: img }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.swipeUpArea} activeOpacity={0.8} onPress={() => setIsDetailsVisible(true)}>
        <Ionicons name="chevron-up" size={24} color="#FFF" />
        <Text style={styles.swipeUpText}>Swipe up for details</Text>
      </TouchableOpacity>

      {isDetailsVisible && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, elevation: 100 }]}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalDismissArea} onPress={() => setIsDetailsVisible(false)} />
            <View style={styles.bottomSheet} {...detailsPanResponder.panHandlers}>
              <View style={styles.sheetHandle} />

              <View style={styles.detailHeaderRow}>
                <View style={styles.detailTextCol}>
                  <Text style={styles.brandText}>{brandName.toUpperCase()}</Text>
                  <Text style={styles.titleText}>{productTitle}</Text>
                  <Text style={[styles.priceText, { color: themeColor }]}>{productPrice}</Text>
                </View>
                <SaveButton 
                  itemId={product.id} 
                  type="product" 
                  style={styles.heartBtn} 
                  size={24}
                />
              </View>

              <View style={styles.sizeSection}>
                <View style={styles.sizeHeaderRow}>
                  <Text style={styles.sectionLabel}>Select Size</Text>
                  <Text style={[styles.sizeGuideText, { color: themeColor }]}>Size Guide</Text>
                </View>
                <View style={styles.sizeOptionsRow}>
                  {['XS', 'S', 'M', 'L', 'XL'].map(size => {
                    const isSelected = selectedSize === size;
                    return (
                      <TouchableOpacity key={size} style={[styles.sizeCircle, isSelected && styles.sizeCircleActive, 
                          { backgroundColor: isSelected ? themeColor : '#EBE5DE' }
                      ]} onPress={() => setSelectedSize(size)}>
                        <Text style={[styles.sizeText, isSelected && styles.sizeTextActive]}>{size}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity style={styles.shopNowBtn} onPress={() => product?.source_url && Linking.openURL(product.source_url)}>
                <Text style={[styles.shopNowText, { color: themeColor }]}>Shop Now</Text>
                <Ionicons name="arrow-forward-outline" size={20} color={themeColor} style={{ transform: [{ rotate: '-45deg' }] }} />
              </TouchableOpacity>

            </View>
          </View>
        </View>
      )}

      {isShareVisible && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, elevation: 100 }]}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalDismissArea} onPress={() => setIsShareVisible(false)} />

            <View style={styles.bottomSheet} {...sharePanResponder.panHandlers}>
              <View style={styles.sheetHandle} />

              <View style={styles.shareHeader}>
                <Text style={styles.shareTitle}>Share Look</Text>
                <Text style={styles.shareSubtitle}>Send this style to someone ✨</Text>
              </View>

              <View style={styles.shareProductCard}>
                <Image source={{ uri: images[0] }} style={styles.shareProductImg} />
                <View style={styles.shareProductInfo}>
                  <Text style={styles.brandText}>{brandName.toUpperCase()}</Text>
                  <Text style={styles.titleText} numberOfLines={1}>{productTitle}</Text>
                  <Text style={styles.sharePriceText}>{productPrice}</Text>
                </View>
              </View>

              <View style={styles.socialIconsRow}>
                {[
                  { name: 'logo-whatsapp', label: 'WhatsApp' },
                  { name: 'logo-instagram', label: 'Instagram' },
                  { name: 'link-outline', label: 'Copy Link' },
                  { name: 'ellipsis-horizontal', label: 'More' }
                ].map(social => (
                  <View key={social.label} style={styles.socialItem}>
                    <TouchableOpacity style={styles.socialCircle}>
                      <Ionicons name={social.name as any} size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.socialLabel}>{social.label}</Text>
                  </View>
                ))}
              </View>

              <TextInput style={styles.shareInput} placeholder="Add a message (Optional)" placeholderTextColor="#999" />

              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: themeColor }]} onPress={() => setIsShareVisible(false)}>
                <Text style={styles.sendBtnText}>Send</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(247, 243, 238, 1)' },
  topNavContainer: { position: 'absolute', top: 0, width: '100%', zIndex: 10 },
  topNavRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center',
    // shadowColor: "#000000",
    // shadowOffset: { width: 0, height: 3 },
    // shadowOpacity: 0.17, shadowRadius: 3.05, elevation: 4
  },
  thumbnailsContainer: { position: 'absolute', right: 20, top: SCREEN_HEIGHT * 0.35, backgroundColor: 'rgba(255,255,255,0.5)', padding: 6, borderRadius: 12 },
  thumbnailWrapper: { width: 48, height: 64, borderRadius: 8, marginBottom: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbnailActive: { borderColor: '#FFF' },
  thumbnailImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  swipeUpArea: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' },
  swipeUpText: { color: '#FFF', fontSize: 13, marginTop: 4, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalDismissArea: { flex: 1 },
  bottomSheet: { backgroundColor: '#F6F4F0', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#DCD6CE', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  detailHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  detailTextCol: { flex: 1, paddingRight: 16 },
  brandText: { fontSize: 11, color: '#888', letterSpacing: 0.5, marginBottom: 4 },
  titleText: { fontSize: 20, color: '#333', fontWeight: '400', marginBottom: 8 },
  priceText: { fontSize: 18, color: '#A67B5B', fontWeight: '500' },
  heartBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  sizeSection: { marginBottom: 24 },
  sizeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { fontSize: 13, color: '#333' },
  sizeGuideText: { fontSize: 12, color: '#A67B5B', textDecorationLine: 'underline' },
  sizeOptionsRow: { flexDirection: 'row', gap: 12 },
  sizeCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBE5DE', justifyContent: 'center', alignItems: 'center' },
  sizeCircleActive: { backgroundColor: '#A67B5B' },
  sizeText: { fontSize: 14, color: '#666' },
  sizeTextActive: { color: '#FFF', fontWeight: '600' },
  shopNowBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EBE5DE', paddingTop: 20 },
  shopNowText: { fontSize: 16, color: '#A67B5B', fontWeight: '500' },
  shareHeader: { alignItems: 'center', marginBottom: 24 },
  shareTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 4 },
  shareSubtitle: { fontSize: 14, color: '#666' },
  shareProductCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#EBE5DE', marginBottom: 24 },
  shareProductImg: { width: 60, height: 80, borderRadius: 8, marginRight: 16 },
  shareProductInfo: { flex: 1, justifyContent: 'center' },
  sharePriceText: { fontSize: 14, color: '#666', marginTop: 4 },
  socialIconsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 10 },
  socialItem: { alignItems: 'center' },
  socialCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EBE5DE', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  socialLabel: { fontSize: 11, color: '#666' },
  shareInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EBE5DE', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 14, marginBottom: 24 },
  sendBtn: { backgroundColor: '#A67B5B', borderRadius: 25, height: 54, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});