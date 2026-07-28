import { Modal, View, Text, StyleSheet, ViewStyle, TextStyle, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, DimensionValue, TouchableOpacity } from 'react-native';
import React, { ReactNode } from 'react';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode; // Made optional!
  
  // Customization Props
  backgroundColor?: string;
  height?: DimensionValue; 
  cardStyle?: ViewStyle;
  
  // NEW: Text & Content Props
  title?: string;
  titleStyle?: TextStyle;
  subtitle?: string;
  subtitleStyle?: TextStyle;
  
  // NEW: Button Props
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  primaryButtonStyle?: ViewStyle;
  primaryButtonTextStyle?: TextStyle;
  
  secondaryButtonText?: string;
  secondaryButtonStyle?: ViewStyle;
  secondaryButtonTextStyle?: TextStyle;
}

export default function CustomModal({
  visible,
  onClose,
  children,
  backgroundColor = '#FAF5EF', 
  height,
  cardStyle,
  title,
  titleStyle,
  subtitle,
  subtitleStyle,
  primaryButtonText,
  onPrimaryPress,
  primaryButtonStyle,
  primaryButtonTextStyle,
  secondaryButtonText,
  secondaryButtonStyle,
  secondaryButtonTextStyle,
}: CustomModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalCard, { backgroundColor }, height ? { height } : undefined, cardStyle]}>
                
                {/* 1. Renders Title if passed as a prop */}
                {title && <Text style={[styles.defaultTitle, titleStyle]}>{title}</Text>}
                
                {/* 2. Renders Subtitle if passed as a prop */}
                {subtitle && <Text style={[styles.defaultSubtitle, subtitleStyle]}>{subtitle}</Text>}

                {/* 3. Renders any custom elements (like your checkmarks) in the middle */}
                {children}

                {/* 4. Renders Primary Button if passed as a prop */}
                {primaryButtonText && (
                  <TouchableOpacity 
                    style={[styles.defaultPrimaryBtn, primaryButtonStyle]} 
                    onPress={onPrimaryPress}
                  >
                    <Text style={[styles.defaultPrimaryBtnText, primaryButtonTextStyle]}>
                      {primaryButtonText}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* 5. Renders Secondary Button if passed as a prop */}
                {secondaryButtonText && (
                  <TouchableOpacity 
                    style={[styles.defaultSecondaryBtn, secondaryButtonStyle]} 
                    onPress={onClose} // Usually closes the modal
                  >
                    <Text style={[styles.defaultSecondaryBtnText, secondaryButtonTextStyle]}>
                      {secondaryButtonText}
                    </Text>
                  </TouchableOpacity>
                )}

              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  // Default styles so you don't HAVE to pass styles every time!
  defaultTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 22,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  defaultSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  defaultPrimaryBtn: {
    backgroundColor: '#A67B5B',
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  defaultPrimaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  defaultSecondaryBtn: {
    paddingVertical: 8,
  },
  defaultSecondaryBtnText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#999',
  },
});