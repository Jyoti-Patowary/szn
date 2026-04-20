import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.bodyText, { marginTop: 10 }]}>
          We value your privacy and are committed to protecting your personal data. This policy outlines how we handle the information shared within the YourSZN ecosystem.
        </Text>

        <Text style={styles.sectionTitle}>Information we collect</Text>
        <BulletPoint>Name</BulletPoint>
        <BulletPoint>Email</BulletPoint>
        <BulletPoint>Phone number</BulletPoint>
        <BulletPoint>Usage data</BulletPoint>

        <Text style={styles.sectionTitle}>How we use your information</Text>
        <BulletPoint>Personalize your styling experience</BulletPoint>
        <BulletPoint>Improve recommendations</BulletPoint>
        <BulletPoint>Communicate updates</BulletPoint>

        <Text style={[styles.bodyText, { marginTop: 16 }]}>
          We value your privacy and are committed to protecting your personal data. This policy outlines how we handle the information shared within the YourSZN ecosystem.
        </Text>

        <View style={styles.highlightBox}>
          {/* Watermark Lock Icon */}
          <Ionicons name="lock-closed-outline" size={90} color="#DCD3C9" style={styles.watermarkIcon} />
          
          <Text style={styles.highlightBoxTitle}>Data Security</Text>
          <Text style={styles.highlightText}>
            We implement appropriate security measures to protect your data from unauthorized access, alteration, or disclosure. Your information is stored on encrypted servers with restricted access.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Contact Us</Text>
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
    backgroundColor: colors.background,
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
    fontSize: 18,
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
    marginBottom: 6,
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
    marginTop: 24,
    overflow: 'hidden',
  },
  watermarkIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    opacity: 0.4,
  },
  highlightBoxTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#111',
    marginBottom: 12,
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