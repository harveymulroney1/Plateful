import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

type MealProps = {
    mealName: string;
    calories: number;
    mealType: string;
    protein: number;
    onPress?: () => void;
};

export function MealCard({ mealName, calories, mealType, protein, onPress }: MealProps) {
    const roundedCalories = Math.round(Number(calories));
    const roundedProtein = Math.round(Number(protein));

    return (
        <Pressable
            onPress={onPress}
            android_ripple={{ color: 'rgba(79, 142, 247, 0.12)' }}
            style={({ pressed }) => [
                styles.card,
                pressed && onPress ? styles.cardPressed : undefined,
            ]}
        >
            <View style={styles.badgeWrapper}>
                <Text style={styles.badgeText}>{mealType}</Text>
            </View>

            <Text style={styles.mealName}>{mealName}</Text>

            <View style={styles.macrosRow}>
                <View style={[styles.chip, styles.chipSpacing]}>
                    <Text style={styles.chipText}>{roundedCalories} kcal</Text>
                </View>
                <View style={styles.chip}>
                    <Text style={styles.chipText}>{roundedProtein}g protein</Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        paddingVertical: 18,
        paddingHorizontal: 20,
        shadowColor: '#0A1F44',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    badgeWrapper: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: '#EEF2FF',
        borderRadius: 999,
        marginBottom: 12,
    },
    badgeText: {
        color: '#4338CA',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    mealName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    macrosRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chip: {
        backgroundColor: '#F3F4F6',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    chipSpacing: {
        marginRight: 12,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
    },
});
