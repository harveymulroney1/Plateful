import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MealCard } from './MealCard';

type Meal = {
    mealName: string;
    calories: number;
    mealType: string;
    protein: number;
};

type DayPlanProps = {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks?: Meal;
    dayIndex: number;
};

export function DayPlan({ breakfast, lunch, dinner, snacks,dayIndex }: DayPlanProps) {
    const dayMeals = [
        { key: 'breakfast', label: 'Breakfast', meal: breakfast },
        { key: 'lunch', label: 'Lunch', meal: lunch },
        snacks ? { key: 'snacks', label: 'Snacks', meal: snacks } : null,
        { key: 'dinner', label: 'Dinner', meal: dinner },
    ].filter(Boolean) as Array<{ key: string; label: string; meal: Meal }>;

    const totalCalories = dayMeals.reduce(
        (sum, { meal }) => sum + Number(meal.calories ?? 0),
        0
    );
    const totalProtein = dayMeals.reduce(
        (sum, { meal }) => sum + Number(meal.protein ?? 0),
        0
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Day {dayIndex}</Text>
                    <Text style={styles.subtitle}>
                        {dayMeals.length} {dayMeals.length === 1 ? 'meal' : 'meals'} planned
                    </Text>
                </View>

                <View style={styles.summaryPill}>
                    <Text style={styles.summaryText}>
                        {Math.round(totalCalories)} kcal ? {Math.round(totalProtein)}g protein
                    </Text>
                </View>
            </View>

            <View style={styles.timeline}>
                {dayMeals.map(({ key, label, meal }, index) => (
                    <View
                        key={key}
                        style={[
                            styles.timelineRow,
                            index !== 0 && styles.timelineRowSpacing,
                        ]}
                    >
                        <View style={styles.markerColumn}>
                            <View style={styles.marker} />
                        </View>
                        <View style={styles.mealColumn}>
                            <Text style={styles.mealLabel}>{label}</Text>
                            <MealCard
                                mealName={meal.mealName}
                                calories={meal.calories}
                                mealType={meal.mealType}
                                protein={meal.protein}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: '#F4F7FB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1B2430',
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: '#64748B',
    },
    summaryPill: {
        backgroundColor: '#E3F2FD',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 999,
    },
    summaryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1565C0',
    },
    timeline: {
        marginTop: 4,
    },
    timelineRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timelineRowSpacing: {
        marginTop: 24,
    },
    markerColumn: {
        width: 24,
        alignItems: 'center',
        paddingTop: 6,
    },
    marker: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4F8EF7',
    },
    mealColumn: {
        flex: 1,
        paddingLeft: 12,
    },
    mealLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
    },
});
