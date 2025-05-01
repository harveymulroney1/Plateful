import { Image, Text, TextInput, View, Button, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import DropdownMenu from "./dropdownMenu";

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
        <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
);

export default function Homepage() {
    const navigation = useNavigation();
    const router = useRouter();
    const [filter, setFilter] = useState("All");
    const [resultsCount, setResultsCount] = useState(9);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = () => {
        setIsMenuOpen(prev => !prev); // Toggle the menu visibility
    };

    const handleCloseMenu = () => {
        setIsMenuOpen(false); // Close the menu when clicking outside
    };

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Image 
                    source={require("../assets/images/logo.png")}
                    style={{ width: 60, height: 60, resizeMode: "contain" }} 
                />
            ),
            headerLeft: () => (
                <Button onPress={() => router.push("/profile")} title="Profile" />
            ),
            headerRight: () => (
                <Button title="Menu" onPress={handleMenuToggle} />
            ),
        });
    }, [navigation]);

    const handleItemPress = (recipeTitle: string) => {
        router.push(`/recipe?title=${encodeURIComponent(recipeTitle)}`);
    };

    const menuItems = [
        { title: 'Enter Ingredients Page', onPress: () => router.push("/IngredientsInput") },
        // Add more menu items here
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Get cooking today!</Text>

            <View style={styles.filters}>
                <View style={{ marginHorizontal: 5 }}><Button title="All" onPress={() => setFilter("All")} /></View>
                <View style={{ marginHorizontal: 5 }}><Button title="Mains" onPress={() => setFilter("Mains")} /></View>
                <View style={{ marginHorizontal: 5 }}><Button title="Lunches" onPress={() => setFilter("Lunches")} /></View>
                {/* Add more filter buttons as needed */}
            </View>

            <Text style={styles.resultsCount}>{resultsCount} results</Text>

            <FlatList
                data={Recipes}
                renderItem={({ item }) => (
                    <Item title={item.title} onPress={() => handleItemPress(item.title)} />
                )}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
            />

            <DropdownMenu isOpen={isMenuOpen} onClose={handleCloseMenu} menuItems={menuItems} />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 20,
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'left',
    },
    searchBar: {
        height: 40,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10,
        textAlign: 'left',
    },
    filters: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    resultsCount: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'left',
    },
    item: {
        backgroundColor: "#94bdff",
        padding: 25,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
    },
    title: {
        fontSize: 20,
    },
});