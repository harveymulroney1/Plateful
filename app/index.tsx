import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Menu
import { Ionicons } from '@expo/vector-icons';
import Menu from "./menu";

const Recipes = [
    { id: "1", title: "Spiced duck breasts with sticky clementine sauce" },
    { id: "2", title: "Spicy peanut butter & corn ramen" },
    { id: "3", title: "Air fryer quesadillas" },
    { id: "4", title: "Butter bean saag" },
    { id: "5", title: "Tuscan sausage gnocchi" },
    { id: "6", title: "Easy paella" },
    { id: "7", title: "Peanut chickpea rice bowl" },
    { id: "8", title: "Quick & spicy chicken noodles" },
    { id: "9", title: "Burger bowl" },
    { id: "10", title: "Rib-eye with cacio e pepe butter" },
];

type ItemProps = { title: string; onPress: () => void };

const Item = ({ title, onPress }: ItemProps) => (
    <TouchableOpacity onPress={onPress} style={styles.item}>
        <ImageBackground
            source={require('../assets/images/food-image.png')}
            style={styles.foodImage}
            imageStyle={{ borderRadius: 12 }}
            >
            <View style={styles.textContainer}>
                <Text style={styles.recipeTitle}>{title}</Text>
                <View style={styles.labelsContainer}>
                <TouchableOpacity style={styles.label}>
                    <Text style={styles.labelText}>Quick</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.label}>
                    <Text style={styles.labelText}>Easy</Text>
                </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    </TouchableOpacity>
);

export default function Index() {
    const [search, setSearch] = useState("");
    const navigation = useNavigation();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = () => setIsMenuOpen(prev => !prev);
    const handleCloseMenu = () => setIsMenuOpen(false);

    useEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: "#FAFAFC" },
            headerTitle: "",
            headerLeft: () => (
                <TouchableOpacity onPress={handleMenuToggle} style={{ marginLeft: 20 }}>
                    <Ionicons name="menu" size={24} color="#333333" />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => router.push("/profile")} style={{ marginRight: 20 }}>
                    <Ionicons name="person-circle-outline" size={28} color="#333333" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleItemPress = (recipeTitle: string) => {
        router.push(`/recipe?title=${encodeURIComponent(recipeTitle)}`);
    };

    const menuItems = [
        { title: 'Enter Ingredients', onPress: () => router.push("/ingredientsInput") },
    ];

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>

                <Text style={styles.mainTitle}>Get cooking today!</Text>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search for recipes"
                        value={search}
                        onChangeText={(text) => setSearch(text)}
                        placeholderTextColor="#999"
                    />
                </View>

                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.filters}>
                    <TouchableOpacity style={[styles.filterButton, styles.selectedFilter]}>
                        <Text style={styles.filterTextSelected}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>Mains</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>Lunches</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Popular</Text>

                <Text style={styles.subText}>{Recipes.length} recipes</Text>

                {Recipes.map((item) => (
                    <Item key={item.id} title={item.title} onPress={() => handleItemPress(item.title)} />
                ))}

            </ScrollView>

            <Menu isOpen={isMenuOpen} onClose={handleCloseMenu} menuItems={menuItems} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFC",
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 20,
        color: "#333333",
        fontFamily: "System",
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#FAFAFC",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 20,
    },
    searchIcon: {
        marginLeft: 4,
        marginRight: 12,
    },
    searchBar: {
        flex: 1,
        height: 40,
        fontFamily: "System",
        color: "#333333",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 10,
        fontFamily: "System",
    },
    filters: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
    },
    filterButton: {
        backgroundColor: "#FAFAFC",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 4,
        marginRight: 15,
        marginBottom: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedFilter: {
        backgroundColor: "#FA6163",
    },
    filterText: {
        fontFamily: "System",
        fontSize: 14,
        color: "#333333",
    },
    filterTextSelected: {
        fontFamily: "System",
        fontSize: 14,
        color: "white",
    },
    subText: {
        fontSize: 14,
        color: "#999999",
        marginBottom: 20,
        fontFamily: "System",
    },
    item: {
        height: 150,
        marginBottom: 15,
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: "#FAFAFC",
    },
    foodImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    textContainer: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FAFAFC',
        marginBottom: 8,
    },
    labelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    label: {
        backgroundColor: "#FA6163",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginTop: 4,
    },
    labelText: {
        color: "white",
        fontSize: 10,
    },
});
