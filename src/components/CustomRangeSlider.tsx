import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CustomRangeSliderProps {
    absoluteMax: number;
    currentMin: number;
    currentMax: number;
    onMinChange: (value: number) => void;
    onMaxChange: (value: number) => void;
}

export default function CustomRangeSlider({
    absoluteMax,
    currentMin,
    currentMax,
    onMinChange,
    onMaxChange,
}: CustomRangeSliderProps) {
    const [trackWidth, setTrackWidth] = useState(1);

    const { currentTheme } = useTheme();
    const themeColor = currentTheme?.color || '#A67B5B';

    const updateValues = (x: number) => {
        if (trackWidth === 0) return;

        const percent = Math.max(0, Math.min(x / trackWidth, 1));
        const val = Math.round(percent * absoluteMax);

        const distToMin = Math.abs(val - currentMin);
        const distToMax = Math.abs(val - currentMax);

        if (distToMin < distToMax) {
            onMinChange(Math.min(val, currentMax));
        } else if (distToMax < distToMin) {
            onMaxChange(Math.max(val, currentMin));
        } else {
            if (val < currentMin) onMinChange(val);
            else onMaxChange(val);
        }
    };

    const safeMax = absoluteMax > 0 ? absoluteMax : 1;
    const minPercent = (currentMin / safeMax) * 100;
    const maxPercent = (currentMax / safeMax) * 100;

    return (
        <View
            style={styles.sliderContainer}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => updateValues(e.nativeEvent.locationX)}
            onResponderMove={(e) => updateValues(e.nativeEvent.locationX)}
        >
            <View style={styles.sliderBackground} />
            <View style={[styles.sliderActiveTrack, { backgroundColor: themeColor }, { left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }]} />
            <View style={[styles.sliderThumb, { backgroundColor: themeColor, borderColor: themeColor },{ left: `${minPercent}%` }]} />
            <View style={[styles.sliderThumb, { backgroundColor: themeColor, borderColor: themeColor }, { left: `${maxPercent}%` }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    sliderContainer: {
        height: 20,
        justifyContent: 'center',
        marginHorizontal: 12,
    },
    sliderBackground: {
        height: 2,
        backgroundColor: '#E0DCD3',
        borderRadius: 2,
    },
    sliderActiveTrack: {
        position: 'absolute',
        height: 2,
        pointerEvents: 'none'
    },
    sliderThumb: {
        position: 'absolute',
        marginLeft: -12,
        width: 12,
        height: 12,
        borderRadius: 12,
        borderWidth: 2,
        pointerEvents: 'none',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4
    },
});