import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Modal,
    Dimensions, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomRangeSlider from './CustomRangeSlider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterModalProps {
    isVisible: boolean;
    onClose: () => void;
    onReset: () => void;
    resultsCount?: number;
    sortOption: string;
    setSortOption: (val: string) => void;

    availableCategories?: string[];
    selectedCategory?: string;
    setSelectedCategory?: (val: string) => void;

    availableColors?: string[];
    selectedColor?: string;
    setSelectedColor?: (val: string) => void;

    maxCatalogPrice?: number;
    minPrice?: number;
    setMinPrice?: (val: number) => void;
    maxPrice?: number;
    setMaxPrice?: (val: number) => void;

    availableSeasons?: string[];
    selectedSeason?: string;
    setSelectedSeason?: (val: string) => void;

    availableTags?: string[];
    selectedTag?: string;
    setSelectedTag?: (val: string) => void;
}

export default function FilterModal({
    isVisible,
    onClose,
    onReset,
    resultsCount,
    sortOption,
    setSortOption,
    
    availableCategories = [],
    selectedCategory,
    setSelectedCategory,
    
    availableColors = [],
    selectedColor,
    setSelectedColor,
    
    maxCatalogPrice,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,

    availableSeasons = [],
    selectedSeason,
    setSelectedSeason,
    
    availableTags = [],
    selectedTag,
    setSelectedTag
}: FilterModalProps) {
    const [localSort, setLocalSort] = useState(sortOption);
    const [localCategory, setLocalCategory] = useState(selectedCategory || '');
    const [localColor, setLocalColor] = useState(selectedColor || '');
    const [localMin, setLocalMin] = useState(minPrice);
    const [localMax, setLocalMax] = useState(maxPrice);
    const [localSeason, setLocalSeason] = useState(selectedSeason || '');
    const [localTag, setLocalTag] = useState(selectedTag || '');

    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    useEffect(() => {
        if (isVisible) {
            setLocalSort(sortOption);
            setLocalCategory(selectedCategory || '');
            setLocalColor(selectedColor || '');
            setLocalMin(minPrice);
            setLocalMax(maxPrice);
            setLocalSeason(selectedSeason || '');
            setLocalTag(selectedTag || '');
        }
    }, [isVisible, sortOption, selectedCategory, selectedColor, minPrice, maxPrice, selectedSeason, selectedTag]);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleApply = () => {
        setSortOption(localSort);
        if (setSelectedCategory) setSelectedCategory(localCategory);
        if (setSelectedColor) setSelectedColor(localColor);
        if (setMinPrice && localMin !== undefined) setMinPrice(localMin);
        if (setMaxPrice && localMax !== undefined) setMaxPrice(localMax);
        if (setSelectedSeason) setSelectedSeason(localSeason);
        if (setSelectedTag) setSelectedTag(localTag);
        
        onClose();
    };

    const handleReset = () => {
        onReset();
        onClose();
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.bottomSheet}>
                    <View style={styles.sheetHandle} />

                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Filter & Sort</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                        {/* SORTING */}
                        <View style={styles.sortGroup}>
                            {[
                                { id: 'recent', label: 'Most recent' },
                                ...(maxCatalogPrice !== undefined ? [
                                    { id: 'price_asc', label: 'Price : Low to High' },
                                    { id: 'price_desc', label: 'Price : High to Low' }
                                ] : []),
                                { id: 'oldest', label: 'Oldest' },
                            ].map(opt => {
                                const isActive = localSort === opt.id;
                                return (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={styles.radioRow}
                                        onPress={() => setLocalSort(opt.id)}
                                    >
                                        <Text style={[styles.radioLabel, { color: isActive ? '#2E2E2E' : '#6B6B6B' }]}>
                                            {opt.label}
                                        </Text>

                                        <View style={[styles.radioCircle, isActive && styles.radioCircleActive]}>
                                            {isActive && <View style={styles.radioInner} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* CATEGORY */}
                        {availableCategories.length > 0 && setSelectedCategory && (
                            <View style={styles.filterGroup}>
                                <TouchableOpacity style={styles.expandableRow} onPress={() => toggleSection('CATEGORY')}>
                                    <Text style={styles.filterSectionTitle}>CATEGORY</Text>
                                    <Ionicons name={expandedSection === 'CATEGORY' ? "chevron-down" : "chevron-forward"} size={24} color="#bdb8b8" />
                                </TouchableOpacity>

                                {expandedSection === 'CATEGORY' && (
                                    <View style={styles.expandedContent}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                                            <TouchableOpacity
                                                style={[styles.pill, localCategory === '' && styles.pillActive]}
                                                onPress={() => setLocalCategory('')}
                                            >
                                                <Text style={[styles.pillText, localCategory === '' && styles.pillTextActive]}>All</Text>
                                            </TouchableOpacity>
                                            {availableCategories.map((cat: string) => (
                                                <TouchableOpacity
                                                    key={cat}
                                                    style={[styles.pill, localCategory === cat && styles.pillActive]}
                                                    onPress={() => setLocalCategory(localCategory === cat ? '' : cat)}
                                                >
                                                    <Text style={[styles.pillText, localCategory === cat && styles.pillTextActive]}>{cat}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* COLOR */}
                        {availableColors.length > 0 && setSelectedColor && (
                            <View style={styles.filterGroup}>
                                <TouchableOpacity style={styles.expandableRow} onPress={() => toggleSection('COLOR')}>
                                    <Text style={styles.filterSectionTitle}>COLOR</Text>
                                    <Ionicons name={expandedSection === 'COLOR' ? "chevron-down" : "chevron-forward"} size={24} color="#bdb8b8" />
                                </TouchableOpacity>

                                {expandedSection === 'COLOR' && (
                                    <View style={styles.expandedContent}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                                            <TouchableOpacity
                                                style={[styles.colorSwatchWrapper, localColor === '' && styles.colorSwatchWrapperActive]}
                                                onPress={() => setLocalColor('')}
                                            >
                                                <View style={[styles.colorSwatch, { backgroundColor: '#EBE5DE', justifyContent: 'center', alignItems: 'center' }]}>
                                                    <Text style={{ fontSize: 9, color: '#333', fontWeight: 'bold' }}>ALL</Text>
                                                </View>
                                            </TouchableOpacity>
                                            {availableColors.map((col: string) => (
                                                <TouchableOpacity
                                                    key={col}
                                                    style={[styles.colorSwatchWrapper, localColor === col && styles.colorSwatchWrapperActive]}
                                                    onPress={() => setLocalColor(localColor === col ? '' : col)}
                                                >
                                                    <View style={[styles.colorSwatch, { backgroundColor: col.toLowerCase() }]} />
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* SEASON */}
                        {availableSeasons.length > 0 && setSelectedSeason && (
                            <View style={styles.filterGroup}>
                                <TouchableOpacity style={styles.expandableRow} onPress={() => toggleSection('SEASON')}>
                                    <Text style={styles.filterSectionTitle}>SEASON</Text>
                                    <Ionicons name={expandedSection === 'SEASON' ? "chevron-down" : "chevron-forward"} size={24} color="#bdb8b8" />
                                </TouchableOpacity>

                                {expandedSection === 'SEASON' && (
                                    <View style={styles.expandedContent}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                                            <TouchableOpacity
                                                style={[styles.pill, localSeason === '' && styles.pillActive]}
                                                onPress={() => setLocalSeason('')}
                                            >
                                                <Text style={[styles.pillText, localSeason === '' && styles.pillTextActive]}>All</Text>
                                            </TouchableOpacity>
                                            {availableSeasons.map((season: string) => (
                                                <TouchableOpacity
                                                    key={season}
                                                    style={[styles.pill, localSeason === season && styles.pillActive]}
                                                    onPress={() => setLocalSeason(localSeason === season ? '' : season)}
                                                >
                                                    <Text style={[styles.pillText, localSeason === season && styles.pillTextActive]}>{season}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* TAGS */}
                        {availableTags.length > 0 && setSelectedTag && (
                            <View style={styles.filterGroup}>
                                <TouchableOpacity style={styles.expandableRow} onPress={() => toggleSection('TAG')}>
                                    <Text style={styles.filterSectionTitle}>TAGS</Text>
                                    <Ionicons name={expandedSection === 'TAG' ? "chevron-down" : "chevron-forward"} size={24} color="#bdb8b8" />
                                </TouchableOpacity>

                                {expandedSection === 'TAG' && (
                                    <View style={styles.expandedContent}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                                            <TouchableOpacity
                                                style={[styles.pill, localTag === '' && styles.pillActive]}
                                                onPress={() => setLocalTag('')}
                                            >
                                                <Text style={[styles.pillText, localTag === '' && styles.pillTextActive]}>All</Text>
                                            </TouchableOpacity>
                                            {availableTags.map((tag: string) => (
                                                <TouchableOpacity
                                                    key={tag}
                                                    style={[styles.pill, localTag === tag && styles.pillActive]}
                                                    onPress={() => setLocalTag(localTag === tag ? '' : tag)}
                                                >
                                                    <Text style={[styles.pillText, localTag === tag && styles.pillTextActive]}>{tag}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* PRICE RANGE */}
                        {maxCatalogPrice !== undefined && minPrice !== undefined && maxPrice !== undefined && setMinPrice && setMaxPrice && (
                            <View style={styles.filterGroup}>
                                <Text style={styles.filterSectionTitle}>PRICE RANGE</Text>
                                <CustomRangeSlider
                                    absoluteMax={maxCatalogPrice}
                                    currentMin={localMin !== undefined ? localMin : minPrice}
                                    currentMax={localMax !== undefined ? localMax : maxPrice}
                                    onMinChange={setLocalMin}
                                    onMaxChange={setLocalMax}
                                />
                                <View style={styles.priceLabels}>
                                    <Text style={styles.priceText}>${localMin !== undefined ? localMin : minPrice}</Text>
                                    <Text style={styles.priceText}>${localMax !== undefined ? localMax : maxPrice}</Text>
                                </View>
                            </View>
                        )}

                    </ScrollView>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                            <Text style={styles.resetBtnText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                            <Text style={styles.applyBtnText}>Apply Filter</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    bottomSheet: { backgroundColor: '#F6F4F0', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12, maxHeight: SCREEN_HEIGHT * 0.9 },
    sheetHandle: { width: 40, height: 4, backgroundColor: '#DCD6CE', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 22, fontWeight: '400', color: '#2E2E2E' },
    filterSectionTitle: { fontSize: 16, color: '#2E2E2E', fontWeight: '400', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },

    sortGroup: { marginBottom: 24 },
    radioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    radioLabel: { fontSize: 16, color: '#444' },
    radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#A67B5B', justifyContent: 'center', alignItems: 'center' },
    radioCircleActive: { borderColor: '#A67B5B' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#A67B5B' },

    filterGroup: { marginBottom: 30 },
    pillScroll: { flexDirection: 'row', marginHorizontal: -4 },
    pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DCD6CE', marginHorizontal: 4, backgroundColor: '#FFF' },
    pillActive: { backgroundColor: '#A67B5B', borderColor: '#A67B5B' },
    pillText: { fontSize: 13, color: '#666' },
    pillTextActive: { color: '#FFF', fontWeight: '500' },

    colorSwatchWrapper: { marginHorizontal: 4, padding: 2, borderRadius: 24, borderWidth: 2, borderColor: 'transparent' },
    colorSwatchWrapperActive: { borderColor: '#A67B5B' },
    colorSwatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },

    priceLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, marginRight: 13 },
    priceText: { fontSize: 14, color: '#A6A6A6', fontWeight: '400', },

    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    resetBtn: { flex: 1, borderWidth: 1, borderColor: '#A67B5B', borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginRight: 8 },
    resetBtnText: { color: '#A67B5B', fontSize: 15, fontWeight: '600' },
    applyBtn: { flex: 1, backgroundColor: '#A67B5B', borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginLeft: 8 },
    applyBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

    expandableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    expandedContent: { paddingTop: 16, paddingBottom: 8 },
});