import { Image, Text, TextInput, View, Button, FlatList, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import DropdownMenu from "./dropdownMenu";

const Recipes = [
    { id: "1", title: "Recipe 1" },
    { id: "2", title: "Recipe 2" },
    { id: "3", title: "Recipe 3" },
    { id: "4", title: "Recipe 4" },
    { id: "5", title: "Recipe 5" },
    { id: "6", title: "Recipe 6" },
    { id: "7", title: "Recipe 7" },
    { id: "8", title: "Recipe 8" },
    { id: "9", title: "Recipe 9" },
];

type ItemProps = { title: string };

const Item = ({ title }: ItemProps) => (
    <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
    </View>
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

    const menuItems = [
        { title: 'Enter Ingredients Page', onPress: () => router.push("/IngredientsInput") },
        // Add more menu items here
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Get cooking today!</Text>

            <TextInput
                style={styles.searchBar}
                placeholder="Search for recipes..."
            />

            <View style={styles.filters}>
                <Button title="All" onPress={() => setFilter("All")} />
                <Button title="Mains" onPress={() => setFilter("Mains")} />
                <Button title="Lunches" onPress={() => setFilter("Lunches")} />
                {/* Add more filter buttons as needed */}
            </View>

            <Text style={styles.resultsCount}>{resultsCount} results</Text>

            <FlatList
                data={Recipes}
                renderItem={({ item }) => <Item title={item.title} />}
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
        alignItems: "flex-start",
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
        marginRight: 20,
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