import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import axios from "axios";
import Fuse from 'fuse.js';

// Menu
import { Ionicons } from '@expo/vector-icons';
import Menu from "./menu";

/* const Recipes = [
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
]; */

type ItemProps = { title: string; img?:string; keywords?:string[]; onPress: () => void };

type Recipe={
    recipeName:string;
    img?:string
    keywords?:string[]
}

const Item = ({ title, img, keywords, onPress }: ItemProps) => (
    <TouchableOpacity onPress={onPress} style={styles.item}>
        <ImageBackground
            source={img ? { uri: img } : require('../assets/images/food-image.png')}
            style={styles.foodImage}
            imageStyle={{ borderRadius: 12 }}
        >
            <View style={styles.textContainer}>
                <Text style={styles.recipeTitle}>{title}</Text>
                <View style={styles.labelsContainer}>
                    {Array.isArray(keywords) && keywords.slice(0, 10).map((kw, index) => (
                        <TouchableOpacity key={index} style={styles.label}>
                            <Text style={styles.labelText}>{kw}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ImageBackground>
    </TouchableOpacity>
);


const filters = ["Chinese", "Italian", "Indian", "Thai", "Mexican", "American", "French", "Mediterranean", "Japanese", "Korean", "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Low Carb", "Low Fat", "High Protein", "Low Sugar", "Quick", "Easy", "Healthy"];
const cuisineFilters = ["Chinese", "Italian", "Indian", "Thai", "Mexican", "American", "French", "Mediterranean", "Japanese", "Korean"];
const dietaryFilters = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut-free"];
const otherFilters = ["Quick", "Easy", "Healthy", "Low carb", "Low fat", "High protein", "Low sugar"];

export default function Index() {
    const [Recipes,setRecipes] = useState<Recipe[]>([]);
    const [search, setSearch] = useState("");
    const navigation = useNavigation();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    
    const [allRecipeNames, setAllRecipeNames] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<string[]>([]);

    const handleMenuToggle = () => setIsMenuOpen(prev => !prev);
    const handleCloseMenu = () => setIsMenuOpen(false);
    
    const fuse = new Fuse(allRecipeNames, {
        includeScore: true,
        threshold: 0.4,
    });

    useEffect(() => {
        axios.post("http://127.0.0.1:3000/exploreRecipesToDisplay")
            .then(response => {
                console.log("RESPONSE.DATA:", JSON.stringify(response.data, null, 2));
    
                // Ensure each recipe's keywords is an array of strings
                const cleaned = response.data.map((recipe: any) => ({
                    ...recipe,
                    keywords: cleanKeywords(recipe.keywords)
                }));
    
                setRecipes(cleaned);
            })
            .catch(err => {
                console.error("Error on getExplore: ", err);
            });

            axios.post("http://127.0.0.1:3000/loadAllRecipeNames")
            .then(response => {
                const names = response.data.map((r: { RecipeName: string }) => r.RecipeName);
                setAllRecipeNames(names);
            })
            .catch(err => {
                console.error("Error fetching recipe names:", err);
            });
        }, []);
    

    const cleanKeywords = (keywords: any): string[] => {
        if (Array.isArray(keywords)) {
            return keywords.map((k: any) => (typeof k === "string" ? k.trim() : String(k).trim()));
        } else if (typeof keywords === "string") {
            return keywords
                .split(",")
                .map(k => k.trim())
                .filter(k => k.length > 0);
        } else {
            return [];
        }
    };
    
    const toggleFilter = (filter: string) => {
        setSelectedFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text.trim()) {
            setSearchResults([]);
            return;
        }
    
        const result = fuse.search(text);
        const resultTitles = result.map(r => r.item.toLowerCase());
        setSearchResults(resultTitles);
    };

    const filteredRecipes = Recipes.filter(recipe => {
        const titleLower = recipe.recipeName.toLowerCase();
    
        const matchesFilters =
            selectedFilters.length === 0 ||
            selectedFilters.some(filter =>
                titleLower.includes(filter.toLowerCase()) ||
                (Array.isArray(recipe.keywords) &&
                    recipe.keywords.some(keyword => keyword.toLowerCase() === filter.toLowerCase()))
        );
    
        const matchesSearch = searchQuery.trim() === "" ||
            searchResults.some(result => result.toLowerCase() === titleLower);
    
        return matchesFilters && matchesSearch;
    });
    


    useEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: "#FAFAFC" },
            headerTitle: "",
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.push("/ingredientsInput")} style={{ marginLeft: 20 }}>
                    <Ionicons name="restaurant-outline" size={20} color="#333333" />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => router.push("/profile")} style={{ marginRight: 20 }}>
                    <Ionicons name="person-circle-outline" size={25} color="#333333" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleItemPress = (recipeTitle: string, keywords?: string[]) => {
        const keywordsParam = keywords ? encodeURIComponent(JSON.stringify(keywords)) : "";
        router.push(`/recipe?title=${encodeURIComponent(recipeTitle)}&keywords=${keywordsParam}`);
    };

    const menuItems = [
        { title: 'Enter Ingredients', onPress: () => router.push("/ingredientsInput") },
    ];

    return (
    <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>

                <Text style={styles.mainTitle}>Get cooking today!</Text>

                <View style={styles.searchContainer}>
                    <TouchableOpacity onPress={() => handleSearch(searchInput)}>
                        <Ionicons name="search" size={18} color="gray" style={styles.searchIcon} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search for recipes"
                        value={searchInput}
                        onChangeText={setSearchInput}
                        onSubmitEditing={() => handleSearch(searchInput)} // Pressing Enter
                        placeholderTextColor="#999"
                        returnKeyType="search"
                    />
                </View>

                <Text style={styles.sectionTitle}>Cuisine</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScrollView}
                    contentContainerStyle={styles.filterContainer}
                >
                    {cuisineFilters.map((filter: string, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.filterButton, selectedFilters.includes(filter) && styles.selectedFilter]}
                            onPress={() => toggleFilter(filter)}
                        >
                            <Text style={selectedFilters.includes(filter) ? styles.filterTextSelected : styles.filterText}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>Dietary Requirements</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScrollView}
                    contentContainerStyle={styles.filterContainer}
                >
                    {dietaryFilters.map((filter: string, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.filterButton, selectedFilters.includes(filter) && styles.selectedFilter]}
                            onPress={() => toggleFilter(filter)}
                        >
                            <Text style={selectedFilters.includes(filter) ? styles.filterTextSelected : styles.filterText}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>Other</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScrollView}
                    contentContainerStyle={styles.filterContainer}
                >
                    {otherFilters.map((filter: string, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.filterButton, selectedFilters.includes(filter) && styles.selectedFilter]}
                            onPress={() => toggleFilter(filter)}
                        >
                            <Text style={selectedFilters.includes(filter) ? styles.filterTextSelected : styles.filterText}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>


                <Text style={styles.popularTitle}>Popular</Text>

                {/* {searchResults.length > 0 && (
                    <View style={{ backgroundColor: "white", padding: 10, borderRadius: 8, elevation: 2 }}>
                        {searchResults.map((item, index) => (
                            <Text
                                key={index}
                                onPress={() => {
                                    setSearch("");
                                    setSearchResults([]);
                                    router.push(`/recipe?title=${encodeURIComponent(item)}`);
                                }}
                                style={{
                                    paddingVertical: 8,
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#eee",
                                    color: "#333",
                                }}
                            >
                                {item}
                            </Text>
                        ))}
                    </View>
                )} */}

                <Text style={styles.subText}>
                {filteredRecipes.length} {filteredRecipes.length === 1 ? "recipe" : "recipes"}
                </Text>

                {filteredRecipes.map((item) => (
                    <View key={item.recipeName}>
                        <Item
                            title={item.recipeName}
                            img={item.img}
                            keywords={item.keywords.map(keyword => keyword.charAt(0).toUpperCase() + keyword.slice(1))}
                            onPress={() => handleItemPress(item.recipeName, item.keywords)}
                        />
                    </View>
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
    popularTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
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
        marginRight: 4,
    },
    searchBar: {
        flex: 1,
        height: 40,
        fontFamily: "System",
        color: "#333333",
        borderWidth: 1,
        borderColor: "#FAFAFC",
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333333",
        fontFamily: "System",
    },
    filters: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
    },
    filterScrollView: {
        paddingVertical: 10, // Optional: Add padding at the top and bottom of the scrollable area
    },
    filterContainer: {
        flexDirection: 'row',  // Stack items horizontally
        paddingHorizontal: 5,  // Optional: Add horizontal padding between items
    },
    filterButton: {
        backgroundColor: "#FAFAFC",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 2,
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
