import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ArrowLeft, Calendar, X, TriangleAlert } from 'lucide-react-native';
import CustomModal from '../components/CustomModal'; 
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
// import {
//   initConnection,
//   requestPurchase,
//   purchaseUpdatedListener,
//   purchaseErrorListener,
//   finishTransaction,
//   Purchase,
//   PurchaseError,
//   ErrorCode
// } from 'react-native-iap';


const SKU_MONTHLY = Platform.OS === 'ios' ? 'yourszn_monthly' : 'yourszn_gp_monthly';
const SKU_SEMI_ANNUAL = Platform.OS === 'ios' ? 'yourszn_semi' : 'yourszn_gp_semi';
const SKU_ANNUAL = Platform.OS === 'ios' ? 'yourszn_annual' : 'yourszn_gp_annual';

export default function SubscriptionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setTimeLeft, setIsLocked } = useAppContext();

  const { currentTheme } = useTheme();
  const themeColor = currentTheme?.color || '#A67B5B';
  
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('semi-annual');
  const [isProcessing, setIsProcessing] = useState(false);

  // Listeners for Apple/Google Callbacks
  const purchaseUpdateSubscription = useRef<any>(null);
  const purchaseErrorSubscription = useRef<any>(null);

  // useEffect(() => {
  //   // Initialize connection to Apple/Google on screen load
  //   initConnection().catch(console.warn);

  //   // Listen for Successful Purchases
  //   purchaseUpdateSubscription.current = purchaseUpdatedListener(
  //     async (purchase: Purchase) => {
  //       try {
  //         // ✅ FIX: Use transactionId for v12 compatibility across iOS and Android
  //         if (purchase.transactionId) {
            
  //           // 1. Determine which tier they actually bought based on the SKU
  //           let tier = 'monthly';
  //           if (purchase.productId === SKU_SEMI_ANNUAL) tier = 'semi-annual';
  //           if (purchase.productId === SKU_ANNUAL) tier = 'annual';

  //           // 2. Save to Supabase
  //           const { data: { user } } = await supabase.auth.getUser();
  //           if (user) {
  //             const now = new Date();
  //             const endDate = new Date(now);
  //             if (tier === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
  //             else if (tier === 'semi-annual') endDate.setMonth(endDate.getMonth() + 6);
  //             else if (tier === 'annual') endDate.setFullYear(endDate.getFullYear() + 1);

  //             const providerName = Platform.OS === 'ios' ? 'apple' : 'google';

  //             const { error } = await supabase
  //               .from('user_subscriptions')
  //               .upsert({ 
  //                 user_id: user.id,
  //                 customer_email: user.email,
  //                 provider: providerName, 
  //                 tier: tier,  
  //                 status: 'active', 
  //                 current_period_start: now.toISOString(),
  //                 current_period_end: endDate.toISOString(),
  //                 cancel_at_period_end: false
  //               }, 
  //               { onConflict: 'user_id' } 
  //             );

  //             if (error) throw error;
  //           }

  //           // 3. Tell Apple/Google the transaction is complete
  //           await finishTransaction({ purchase, isConsumable: false });

  //           // 4. Unlock App UI
  //           await AsyncStorage.setItem('@is_subscribed', 'true');
  //           setTimeLeft(0);
  //           setIsLocked(false);
  //           setIsProcessing(false);

  //           Alert.alert(
  //             "Purchase Successful", 
  //             "Welcome to YourSZN Premium! Your app is now fully unlocked.",
  //             [{ text: "Awesome!", onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }) }]
  //           );
  //         }
  //       } catch (error: any) {
  //         console.error("Database update error:", error);
  //         setIsProcessing(false);
  //       }
  //     }
  //   );

  //   // Listen for Errors or User Cancellations
  //   purchaseErrorSubscription.current = purchaseErrorListener(
  //     (error: PurchaseError) => {
  //       setIsProcessing(false);
  //       // ✅ FIX: Added missing opening curly brace
  //       if (error.code !== ErrorCode.UserCancelled) {
  //         Alert.alert("Payment Failed", "There was an issue processing your subscription.");
  //       }
  //     }
  //   );

  //   return () => {
  //     if (purchaseUpdateSubscription.current) purchaseUpdateSubscription.current.remove();
  //     if (purchaseErrorSubscription.current) purchaseErrorSubscription.current.remove();
  //   };
  // }, []);

// Trigger Real Apple/Google Pay Sheet
  const handlePlanClick = async (planId: string, sku: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);
    
    // try {
    //   // ✅ FIX: react-native-iap v14 requires the new "request" and "type" structure!
    //   await requestPurchase({
    //     request: Platform.OS === 'ios' 
    //       ? { apple: { sku } } 
    //       : { android: { skus: [sku] } },
    //     type: 'subs' // Tells the library we are purchasing a subscription
    //   });
    // } catch (err: any) {
    //   console.warn(err);
    //   setIsProcessing(false);
    // }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents={isProcessing ? 'none' : 'auto'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manage subscription</Text>
          </View>

          <Text style={styles.sectionTitle}>CURRENT PLAN</Text>
          <View style={styles.currentPlanCard}>
            <View style={[styles.activeBadge, { backgroundColor: themeColor }]}><Text style={styles.activeBadgeText}>ACTIVE</Text></View>
            <Text style={styles.planTitle}>Autumn Plan 🍂</Text>
            <Text style={styles.planSubtitle}>Semi-Annual • $35.99 / 6 months</Text>
            <View style={styles.dateRow}>
              <Calendar size={14} color={themeColor} strokeWidth={2} />
              <Text style={[styles.dateText, { color: themeColor }]}>Renews on: 12 Dec 2026</Text>
            </View>
            <View style={styles.currentPlanBtn}>
              <Text style={styles.currentPlanBtnText}>Current Plan</Text>
            </View>
          </View>

          <View style={styles.planHeaderRow}>
            <Text style={styles.choosePlanText}>CHOOSE A PLAN</Text>
            {isProcessing && <ActivityIndicator size="small" color={themeColor} />}
          </View>

          <TouchableOpacity 
            style={[styles.planOptionCard, selectedPlan === 'monthly' && styles.selectedPlanCard,
              selectedPlan === 'monthly' && { borderColor: themeColor }
            ]} 
            activeOpacity={0.7}
            onPress={() => handlePlanClick('monthly', SKU_MONTHLY)}
          >
            <View style={styles.planOptionHeader}>
              <Text style={[styles.planOptionLabel, selectedPlan === 'monthly' && { color: themeColor }]}>MONTHLY</Text>
              <Text style={[selectedPlan === 'monthly' ? styles.currentText : styles.switchText, { color: selectedPlan === 'monthly' ? themeColor : 'rgba(170, 131, 104, 1)' }]}>
                {selectedPlan === 'monthly' ? 'CURRENT' : 'SWITCH'}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>$14.99</Text>
              <Text style={styles.durationText}>/month</Text>
            </View>
            <Text style={styles.planDescription}>Flexible access to premium styling</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.planOptionCard, selectedPlan === 'semi-annual' && styles.selectedPlanCard,
              selectedPlan === 'semi-annual' && { borderColor: themeColor }
            ]} 
            activeOpacity={0.7}
            onPress={() => handlePlanClick('semi-annual', SKU_SEMI_ANNUAL)}
          >
            <View style={[styles.mostPopularBadge, { backgroundColor: themeColor }]}><Text style={styles.mostPopularText}>MOST POPULAR</Text></View>
            <View style={styles.planOptionHeader}>
              <Text style={[styles.planOptionLabel, selectedPlan === 'semi-annual' && { color: themeColor }]}>SEMI-ANNUAL</Text>
              <Text style={[selectedPlan === 'semi-annual' ? styles.currentText : styles.switchText, { color: selectedPlan === 'semi-annual' ? themeColor : 'rgba(170, 131, 104, 1)' }]}>
                {selectedPlan === 'semi-annual' ? 'CURRENT' : 'SWITCH'}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>$35.99</Text>
              <Text style={styles.durationText}>/6 month</Text>
            </View>
            <Text style={styles.planDescription}>Save more with mid-term access</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.planOptionCard, selectedPlan === 'annual' && styles.selectedPlanCard,
              selectedPlan === 'annual' && { borderColor: themeColor }
            ]} 
            activeOpacity={0.7}
            onPress={() => handlePlanClick('annual', SKU_ANNUAL)}
          >
            <View style={styles.bestValueBadge}><Text style={styles.bestValueText}>BEST VALUE</Text></View>
            <View style={styles.planOptionHeader}>
              <Text style={[styles.planOptionLabel, selectedPlan === 'annual' && { color: themeColor }]}>ANNUAL</Text>
              <Text style={[selectedPlan === 'annual' ? styles.currentText : styles.upgradeText, { color: selectedPlan === 'annual' ? themeColor : 'rgba(170, 131, 104, 1)' }]  }>
                {selectedPlan === 'annual' ? 'CURRENT' : 'UPGRADE'}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>$99.99</Text>
              <Text style={styles.durationText}>/year</Text>
            </View>
            <Text style={styles.planDescription}>Maximum savings + full access</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={() => setCancelModalVisible(true)}>
            <Text style={styles.cancelBtnText}>CANCEL SUBSCRIPTION</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <CustomModal visible={isCancelModalVisible} onClose={() => setCancelModalVisible(false)} backgroundColor="#FFFFFF">
        <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setCancelModalVisible(false)}>
          <X size={20} color="#666" />
        </TouchableOpacity>
        <View style={styles.warningIconContainer}>
          <TriangleAlert size={28} color="#D32F2F" strokeWidth={1.5} />
        </View>
        <Text style={styles.modalTitle}>Cancel Subscription?</Text>
        <Text style={styles.modalBody}>
          You will lose your curated seasonal styling access and exclusive benefits after{' '}
          <Text style={styles.modalBodyBold}>12 Dec 2026</Text>.
        </Text>
        <TouchableOpacity style={styles.keepPlanBtn} activeOpacity={0.8} onPress={() => setCancelModalVisible(false)}>
          <Text style={styles.keepPlanBtnText}>Keep Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmCancelBtn} activeOpacity={0.7} onPress={() => setCancelModalVisible(false)}>
          <Text style={styles.confirmCancelBtnText}>CANCEL SUBSCRIPTION</Text>
        </TouchableOpacity>
      </CustomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F6F2' },
  scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backBtn: { padding: 8, borderWidth: 1, borderColor: 'rgba(166, 166, 166, 1)', borderRadius: 12, backgroundColor: '#FFFFFF', marginRight: 16 },
  headerTitle: { fontFamily: 'Almarai_400Regular', fontSize: 22, color: '#1A1A1A' },
  sectionTitle: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#6B6B6B', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  planHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  choosePlanText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: 'rgba(46, 46, 46, 1)' },
  currentPlanCard: { backgroundColor: 'rgba(216, 194, 186, 0.15)', borderRadius: 24, padding: 24, marginBottom: 32, position: 'relative' },
  activeBadge: { position: 'absolute', top: 20, right: 20, backgroundColor: '#A67B5B', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  activeBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#FFFFFF', letterSpacing: 0.5 },
  planTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#1A1A1A', marginBottom: 8 },
  planSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#6B6B6B', marginBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dateText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#A67B5B', marginLeft: 6 },
  currentPlanBtn: { backgroundColor: 'rgba(230, 226, 222, 1)', paddingVertical: 14, borderRadius: 20, alignItems: 'center' },
  currentPlanBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#555555' },
  planOptionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 20, paddingHorizontal: 16, marginBottom: 24, position: 'relative', borderWidth: 1.5, borderColor: '#FFFFFF' },
  selectedPlanCard: { borderColor: '#AA8368' },
  planOptionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planOptionLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(107, 107, 107, 1)', letterSpacing: 0.5 },
  switchText: { fontFamily: 'Almarai_400Regular', fontSize: 10, color: 'rgba(170, 131, 104, 1)', letterSpacing: 0.5 },
  currentText: { fontFamily: 'Almarai_400Regular', fontSize: 10, color: 'rgba(107, 107, 107, 1)', letterSpacing: 0.5 },
  upgradeText: { fontFamily: 'Almarai_400Regular', fontSize: 10, color: 'rgba(170, 131, 104, 1)', letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  priceText: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#1A1A1A' },
  durationText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(107, 107, 107, 1)', marginLeft: 2 },
  planDescription: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(107, 107, 107, 1)' },
  mostPopularBadge: { position: 'absolute', top: -10, right: 20, backgroundColor: '#AA8368', paddingVertical: 2, paddingHorizontal: 12, borderRadius: 12, zIndex: 1 },
  mostPopularText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#FFFFFF', letterSpacing: 0.5 },
  bestValueBadge: { position: 'absolute', top: -10, right: 20, backgroundColor: '#E6E2DE', paddingVertical: 2, paddingHorizontal: 12, borderRadius: 12, zIndex: 1 },
  bestValueText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#1C1C19', letterSpacing: 0.5 },
  cancelBtn: { alignItems: 'center', marginTop: 24, marginBottom: 20 },
  cancelBtnText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#D64545' },
  modalCloseBtn: { position: 'absolute', top: 16, right: 16, padding: 8, zIndex: 10 },
  warningIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(214, 69, 69, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24, marginTop: 16 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#1A1A1A', marginBottom: 12, textAlign: 'center' },
  modalBody: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#555555', textAlign: 'center', marginBottom: 32, paddingHorizontal: 10, lineHeight: 22 },
  modalBodyBold: { fontFamily: 'Inter_700Bold', color: '#1A1A1A' },
  keepPlanBtn: { backgroundColor: '#9B7359', width: '100%', paddingVertical: 14, borderRadius: 28, alignItems: 'center', marginBottom: 16 },
  keepPlanBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFFFFF' },
  confirmCancelBtn: { paddingVertical: 8 },
  confirmCancelBtnText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#D64545' },
});