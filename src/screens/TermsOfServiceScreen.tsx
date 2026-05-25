import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();

  const BulletPoint = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bodyText}>{children}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.bodyText}>
          Welcome to YourSZN. By using our app, you agree to the following terms and conditions. These terms govern your access to and use of our services.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of the app</Text>
        <BulletPoint>You must be at least 18 years old to create an account and use our platform.</BulletPoint>
        <BulletPoint>You agree to use the app responsibly and in compliance with all local laws.</BulletPoint>
        <BulletPoint>You will not misuse the platform, including attempting to breach security or disrupt services.</BulletPoint>

        <Text style={styles.sectionTitle}>3. Account Responsibility</Text>
        <BulletPoint>You are solely responsible for all activity that occurs under your account credentials.</BulletPoint>
        <BulletPoint>Keep your login details secure and notify us immediately of any unauthorized access.</BulletPoint>

        <Text style={styles.sectionTitle}>4. Subscription & Billing</Text>
        <Text style={[styles.bodyText, { marginBottom: 12 }]}>
          Subscription plans are billed periodically based on the cycle selected at checkout.
        </Text>
        <Text style={[styles.bodyText, { marginBottom: 12 }]}>
          Payments are non-refundable unless explicitly stated otherwise in our refund policy.
        </Text>
        <Text style={styles.bodyText}>
          You can cancel your subscription at any time through your account settings.
        </Text>

        <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
        <View style={styles.highlightBox}>
    <Image 
            source={require('../../assets/Container.png')} 
            style={styles.watermarkImage} 
          />
          <Text style={styles.highlightText}>
            "All content and designs within the app are owned by <Text style={{ fontFamily: 'Inter_700Bold' }}>YourSZN</Text> and may not be reused, reproduced, or distributed without express written permission."
          </Text>
        </View>

        <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={styles.bodyText}>
          We are not liable for any indirect, incidental, or any of the consequential damages resulting from the use or inability to use the app. Your use of our service is at your own risk.
        </Text>

        <Text style={styles.sectionTitle}>7. Change of Terms</Text>
        <Text style={styles.bodyText}>
          We may update these terms from time to time. Continued use of the platform after updates are posted constitutes your formal acceptance of the revised terms.
        </Text>

        <Text style={styles.sectionTitle}>8. Contact Us</Text>
        <Text style={styles.bodyText}>
          For any questions or concerns regarding this policy, please reach out to our privacy team.
        </Text>

        <View style={styles.contactRow}>
          <Ionicons name="mail-outline" size={20} color="#A67B5B" />
          <Text style={styles.contactEmail}>support@yourszn.com</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(247, 243, 238, 1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCD3C9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 22,
    color: '#333',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  bodyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    lineHeight: 22,
  },
  highlightBox: {
    backgroundColor: 'rgba(138, 75, 47, 0.06)',
    borderRadius: 16,
    padding: 24,
    overflow: 'hidden',
  },
watermarkImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,     
    height: 50,    
    opacity: 0.4,    
    resizeMode: 'contain',
  },
  highlightText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  contactEmail: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#A67B5B',
    marginLeft: 8,
  },
});