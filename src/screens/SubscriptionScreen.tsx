import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAppContext } from '../context/AppContext';

export default function SubscriptionScreen() {
  const { unlockApp } = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your 30-minute demo has ended.</Text>
          <Text style={styles.subtitle}>Subscribe to continue enjoying premium access.</Text>
        </View>

        <View style={styles.plansContainer}>
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Basic Plan</Text>
            <Text style={styles.planPrice}>$9.99 / month</Text>
            <Text style={styles.planFeature}>• Access to all styles</Text>
            <Text style={styles.planFeature}>• Save up to 50 items</Text>
            <TouchableOpacity style={styles.subscribeButton} onPress={unlockApp}>
              <Text style={styles.subscribeButtonText}>Subscribe</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.planCard, styles.premiumPlanCard]}>
            <Text style={[styles.planTitle, styles.premiumText]}>Premium Plan</Text>
            <Text style={[styles.planPrice, styles.premiumText]}>$19.99 / month</Text>
            <Text style={[styles.planFeature, styles.premiumText]}>• Unlimited saved items</Text>
            <Text style={[styles.planFeature, styles.premiumText]}>• Exclusive styling advice</Text>
            <TouchableOpacity style={[styles.subscribeButton, styles.premiumSubscribeButton]} onPress={unlockApp}>
              <Text style={[styles.subscribeButtonText, styles.premiumSubscribeButtonText]}>Subscribe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  plansContainer: {
    gap: 20,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  premiumPlanCard: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  planTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 22,
    color: '#333',
    marginBottom: 8,
  },
  planPrice: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#A0785A',
    marginBottom: 16,
  },
  premiumText: {
    color: '#FFF',
  },
  planFeature: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: '#A0785A',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  premiumSubscribeButton: {
    backgroundColor: '#FFF',
  },
  subscribeButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFF',
    fontSize: 16,
  },
  premiumSubscribeButtonText: {
    color: '#333',
  },
});
