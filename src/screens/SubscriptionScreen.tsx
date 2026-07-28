import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAppContext } from '../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the plan data matching your design
const PLANS = [
  {
    id: 'monthly',
    title: 'MONTHLY',
    price: '$14.99',
    period: '/month',
    description: 'Flexible access to premium styling',
    badge: null,
  },
  {
    id: 'semi_annual',
    title: 'SEMI-ANNUAL',
    price: '$ 35.99',
    period: '/6 month',
    description: 'Save more with mid-term access',
    badge: { text: 'MOST POPULAR', color: '#A67B5B', textColor: '#FFF' },
  },
  {
    id: 'annual',
    title: 'ANNUAL',
    price: '$99.99',
    period: '/year',
    description: 'Maximum savings + full access',
    badge: { text: 'BEST VALUE', color: '#E5E5E5', textColor: '#333' },
  },
];

export default function SubscriptionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setIsLocked } = useAppContext();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);

    // SIMULATING NATIVE APP STORE DELAY (Like Plan(2).png)
    setTimeout(async () => {
      try {
        // 1. Save the subscription flag permanently to the phone
        await AsyncStorage.setItem('@is_subscribed', 'true');
        
        // 2. Unlock the app in the global context
        setIsLocked(false);
        
        // 3. Show success and navigate back to the unlocked Home Screen
        Alert.alert(
          'Purchase Successful!', 
          'Welcome to Premium. Your personalized style journey begins now.',
          [
            { 
              text: 'Start Styling', 
              onPress: () => navigation.navigate('Main') 
            }
          ]
        );
      } catch (error) {
        Alert.alert('Error', 'Something went wrong with your purchase.');
      } finally {
        setIsProcessing(false);
      }
    }, 1500); // 1.5 second simulated loading delay
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Choose your Plan</Text>
          <Text style={styles.headerSubtitle}>Unlock your personalized style journey</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- PLANS LIST --- */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            
            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.9}
                onPress={() => setSelectedPlan(plan.id)}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected
                ]}
              >
                {/* Badge Overlay */}
                {plan.badge && (
                  <View style={[styles.badge, { backgroundColor: plan.badge.color }]}>
                    <Text style={[styles.badgeText, { color: plan.badge.textColor }]}>
                      {plan.badge.text}
                    </Text>
                  </View>
                )}

                <View style={styles.planInfo}>
                  <Text style={[styles.planTitle, isSelected && styles.planTitleSelected]}>
                    {plan.title}
                  </Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                  
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>

                {/* Custom Radio Button */}
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* --- FOOTER --- */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueBtn, isProcessing && styles.continueBtnDisabled]}
          onPress={handlePurchase}
          disabled={!selectedPlan || isProcessing}
        >
          <Text style={styles.continueBtnText}>
            {isProcessing ? 'Processing...' : 'Continue'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerDisclaimer}>
          CANCEL ANYTIME • SECURE PAYMENT
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5EBE1', 
  },
  
  /* Header */
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 30,
  },
  backButton: {
    marginRight: 16,
    marginTop: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 24,
    color: '#333',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
  },

  /* Scroll Content */
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  plansContainer: {
    gap: 20, // Space between cards
  },

  /* Plan Cards */
  planCard: {
    backgroundColor: '#FAF5EF',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'transparent',
    // Shadow for cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  planCardSelected: {
    borderColor: '#A67B5B',
    backgroundColor: '#FAF5EF',
  },

  /* Card Badges */
  badge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },

  /* Card Text Content */
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#888',
    letterSpacing: 1,
    marginBottom: 8,
  },
  planTitleSelected: {
    color: '#A67B5B', // Text turns brown when selected
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 28,
    color: '#222',
  },
  planPeriod: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  planDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
  },

  /* Custom Radio Buttons */
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  radioOuterSelected: {
    borderColor: '#A67B5B',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A67B5B',
  },

  /* Footer Section */
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#F5EBE1',
  },
  continueBtn: {
    backgroundColor: '#A67B5B',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  footerDisclaimer: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});