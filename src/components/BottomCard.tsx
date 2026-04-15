import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme/colors';

interface BottomCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function BottomCard({ children, style }: BottomCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
 card: {
    backgroundColor: colors.background,
    borderRadius: 40,
    paddingVertical: 17,
    marginHorizontal: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',   
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
});
