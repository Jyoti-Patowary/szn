import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Linking 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Mail, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpSupportScreen() {
  const navigation = useNavigation();

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@yourszn.com?subject=Help & Support Request');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Need Help?</Text>
          <Text style={styles.heroTitle}>We're here for you.</Text>
          <Text style={styles.heroSubtitle}>
            Reach out to our support team and we'll get back to you soon.
          </Text>
        </View>

        <View style={styles.contactCard}>
          <View style={styles.iconCircle}>
            <Mail size={24} color="#A67B5B" strokeWidth={1.5} />
          </View>
          <Text style={styles.cardTitle}>Contact Support</Text>
          <Text style={styles.cardEmail}>support@yourszn.com</Text>
          
          <TouchableOpacity 
            style={styles.emailBtn} 
            activeOpacity={0.8}
            onPress={handleEmailPress}
          >
            <Text style={styles.emailBtnText}>Email us</Text>
          </TouchableOpacity>
        </View>

        {/* Other Resources */}
        <Text style={styles.sectionTitle}>OTHER RESOURCES</Text>

        <TouchableOpacity style={styles.resourceCard} activeOpacity={0.7}>
          <Text style={styles.resourceText}>Frequently Asked Questions</Text>
          <ChevronRight size={18} color="#666" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F6F2' },
  scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backBtn: { padding: 8, borderWidth: 1, borderColor: '#E8E5E0', borderRadius: 12, backgroundColor: '#FFFFFF', marginRight: 16 },
  headerTitle: { fontFamily: 'Inter_400Regular', fontSize: 20, color: '#1A1A1A' },

  heroSection: { marginBottom: 32 },
  heroTitle: { fontFamily: 'Inter_400Regular', fontSize: 26, color: '#1A1A1A', marginBottom: 4 },
  heroSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#666666', marginTop: 12, lineHeight: 22, paddingRight: 20 },

  contactCard: { backgroundColor: '#EFEAE3', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 32 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E4DDD4', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontFamily: 'Inter_500Medium', fontSize: 18, color: '#1A1A1A', marginBottom: 4 },
  cardEmail: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#A67B5B', marginBottom: 24 },
  emailBtn: { backgroundColor: '#A67B5B', width: '100%', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  emailBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' },

  sectionTitle: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#333333', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 0.5 },
  resourceCard: { backgroundColor: '#F2ECE5', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resourceText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#1A1A1A' },
});