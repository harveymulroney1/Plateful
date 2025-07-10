import { Image, Text, View, Button, StyleSheet, TouchableOpacity, ScrollView,Alert} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError } from "./snackbar";
export default function Recipe() {
    const { showError } = require("./snackbar");
    const navigation = useNavigation();
    const router = useRouter();
    const { title: recipeTitle, keywords } = useLocalSearchParams();
    const [recipeID,setRecipeID] = useState<number>();
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [method, setMethod] = useState<string[][]>([]);
    const [nutrition, setNutrition] = useState<string[][]>([]);
    const [img,setIMG] = useState("");
    const [Description,setDescription] = useState("");
    const [isAuthed,setIsAuthed] = useState(Boolean);
    const [recipeKeywords, setRecipeKeywords] = useState<string[]>([]);
    const checkIsAuthed = async () => {
        const token = await AsyncStorage.getItem("userToken");
        if(token)
        {
            await axios.post('http://127.0.0.1:3000/checkToken', null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }).then(response=>{
                
                setIsAuthed(true);
            })
            .catch(
                err=>{
                    setIsAuthed(false);
                    console.log("User Token Not Valid");
                    Alert.alert(
                        "Authentication Failed",
                        "Your session has expired. Please log in again.",
                        [
                          { text: "OK", onPress: () => router.push("/loginPage") }
                        ]
                      );
                    
                }
            )
            
        }
        else{setIsAuthed(false);}
    }
    const addCount = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                console.log("!token")
            }
            if (token) {
                const response = await axios.post('http://127.0.0.1:3000/addCookedStatistic', null, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (response.data) {
                    let username = response.data;
                }
                if (recipeKeywords.includes("Vegan")) {
                    console.log("VEGAN")
                    const response = await axios.post('http://127.0.0.1:3000/addVeganBadge', null, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                }
                const internationalCuisines = ["chinese", "italian", "indian", "thai", "mexican", "american", "french", "mediterranean", "japanese", "korean"];
                if (recipeKeywords.some(k => internationalCuisines.includes(k.toLowerCase()))) {
                    console.log("INTERNATIONAL")
                    const response = await axios.post('http://127.0.0.1:3000/addInternationalCount', null, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                }
            } else {
                console.log("No token found");
            }
        } catch (error) {
            console.log("caught an error: ");
            console.log(error);
        }
    }
    const bookmarkRecipe = async () => {
        console.log("Trying to boomark");
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                console.log("!token")
            }
            if (token) {
                console.log("token:",token)
                await axios.post('http://127.0.0.1:3000/bookmarkRecipe',{RecipeID:recipeID},{headers: {
                    Authorization: `Bearer ${token}`,
                },})
                .then(response=>{
                    console.log("Bookmark Added Successfully");
                    console.log("(DEBUG) username used:",response.data)
                }
                )
                .catch(err=>{
                    console.error("Error bookmarking: ",err);
                    showError("Failed to bookmark.");
                })
            }
        } catch (error) {
            
        }
    }
    type Recipe = {
        id:number;
        Ingredients:string;
        Image:string;
        Description:string;
        Method:string;
        Nutrition:string;
        
    }
    useEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: "#FAFAFC" },
            headerTitle: "",
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            ),
        });

        if (keywords) {
            try {
                const parsedKeywords = JSON.parse(keywords as string);
                setRecipeKeywords(parsedKeywords);
            } catch (err) {
                console.error("Failed to parse keywords:", err);
                showError("Failed to parse keywords.");
            }
        }

        if (!recipeTitle) return; // Ensure title exists before proceeding

        function formatMethod(methodToFormat: string[]) {
            const formattedMethod = [];
            for (const el of methodToFormat) {
                const match = el.match(/step\s*(\d+)\s*(.+)/i); // skips spaces, grabs number & instruction
                if (match) {
                    const stepNum = match[1];
                    const instruction = match[2];
                    formattedMethod.push([`Step ${stepNum}`, instruction.trim()]);
                }
            }
            setMethod(formattedMethod);
        }

        function formatNutrition(nutritionToFormat: string[]) {
            const formattedNutrition = [];
            for (const el of nutritionToFormat) {
                const match = el.match(/^([a-z]+)([\d.]+(?:kcal|g)?)/i); // skips spaces, grabs number & instruction
                if (match) {
                    const nutrType = match[1];
                    const nutrVal = match[2];
                    console.log(`${nutrType} : ${nutrVal}`);
                    formattedNutrition.push([nutrType, nutrVal.trim()]);
                }
            }
            setNutrition(formattedNutrition);
        }

        axios.post<Recipe[]>("http://127.0.0.1:3000/getRecipe", { n: recipeTitle })
            .then(response => {
                console.log("RESPONSE.DATA:", JSON.stringify(response.data, null, 2));
                setRecipeID(response.data[0].id);
                const parsedIngredients = JSON.parse(response.data[0].Ingredients);
                setIMG(response.data[0].Image);
                if (Array.isArray(parsedIngredients)) {
                    setIngredients(parsedIngredients);
                } else {
                    console.error("Expected ingredients to be an array, but got", response.data[0].Ingredients);
                    setIngredients([]); // Fallback to empty array
                }
                setDescription(response.data[0].Description);
                
                formatMethod(JSON.parse(response.data[0].Method));
                formatNutrition(JSON.parse(response.data[0].Nutrition));
            })
            .catch(error => {
                console.error("Error fetching recipe:", error);
                showError("Error fetching recipe");
            });
    }, [navigation, recipeTitle]);
    
    useEffect(() => {
        checkIsAuthed();

        //console.log("Updated method:", method);
    },[]);

    return (
        <>
        <ScrollView>
            <View style={styles.container}>
                <Text style={styles.titleText}>{recipeTitle}</Text>


                <View style={styles.imageContainer}>
                    <View style={styles.imageShadow}>
                        {img ? (
                            <Image source={{ uri: img }} style={styles.recipeImage} />
                        ) : (
                            <Image source={require('../assets/images/food-image.png')} style={styles.recipeImage} />
                        )}
                    </View>
                </View>
                                <View style={styles.sectionContainer}>
                    {recipeKeywords.length > 0 ? (
                        <View style={styles.labelContainer}>
                            {recipeKeywords.map((keyword, index) => (
                                <Text key={index} style={styles.label}>{keyword}</Text>
                            ))}
                        </View>
                    ) : (
                        <Text/>
                    )}
                </View>
                <View style={styles.descriptionContainer}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    {Description ? (
                        <Text style={styles.listItem}>{Description}</Text>
                    ):(
                    <Text style={styles.loadingText}>Loading description...</Text>
                    )}
                </View>

                {/* <View style={styles.labelContainer}>
                        <Text style={styles.label}>Servings</Text>
                        <Text style={styles.label}>Prep Time</Text>
                        <Text style={styles.label}>Cook Time</Text>
                </View> */}

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    {ingredients.length > 0 ? (
                        ingredients.map((item, index) => (
                            <View key={index} style={styles.ingredientContainer}>
                                <Text style={styles.ingredientText}>{item}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.loadingText}>Loading ingredients...</Text>
                    )}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Method</Text>
                    {method.length > 0 ? (
                        method.map(([step, instruction], index) => (
                            <View key={index} style={styles.stepContainer}>
                                <Text style={styles.stepLabel}>{step}</Text>
                                <Text style={styles.stepText}>{instruction}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.loadingText}>Loading method...</Text>
                    )}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Nutrition</Text>
                    <View style={styles.nutritionWrapper}>
                        {nutrition.length > 0 ? (
                            nutrition.map(([nutrType, nutrVal], index) => (
                                <View key={index} style={styles.nutritionBox}>
                                    <Text style={styles.nutrType}>{nutrType}</Text>
                                    <Text style={styles.nutrVal}>{nutrVal}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.loadingText}>Loading nutritional values...</Text>
                        )}
                    </View>
                </View>
                <View style={styles.completeButtonContainer}>
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel="Bookmark this Recipe"
                        style={[styles.completeButton]}
                        onPress={bookmarkRecipe}
                    >
                        <Text style={styles.completeButtonText}>Bookmark</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.completeButtonContainer}>
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel="Mark this Recipe as Cooked"
                        style={[styles.completeButton]}
                        onPress={addCount}
                    >
                        <Text style={styles.completeButtonText}>Complete</Text>
                    </TouchableOpacity>
                </View>

            </View>

        </ScrollView>

        <View style={styles.footerHeader}>
            <TouchableOpacity onPress={() => router.push("/")} style={styles.footerIconLeft}
                       accessible={true}
                       accessibilityLabel="Go back to home page"
                       >
     
                <Ionicons name="arrow-back" size={20} color="#333333" />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />
        </View>
    </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        backgroundColor: "#FAFAFC",
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    backButton: {
        marginLeft: 20,
    },
    imageContainer: {
        padding: 20,
        alignSelf: "center",
        width: "100%",
        alignItems: "center",
    },
    imageShadow: {
        width: "98%",
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: "#FAFAFC",
    },
    recipeImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    titleText: {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 15,
        marginHorizontal: 20,
        color: "#333333",
        fontFamily: "System",
    },
    sectionContainer: {
        marginTop: 10,
        marginHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333333",
        marginTop: 10,
        marginBottom: 15,
        fontFamily: "System",
    },
    listItem: {
        fontSize: 16,
    },
    stepContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        backgroundColor: "#f2f2f2",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    stepLabel: {
        width: 60,
        fontSize: 14,
        fontWeight: "bold",
        color: "#FA6163",
        marginBottom: 4,
    },
    stepText: {
        color: "#333",
        flex: 1,
        fontSize: 14,
    },
    descriptionContainer: {
        marginTop: 10,
        marginHorizontal: 20,
        marginBottom: 10,
    },
    loadingText: {
        fontSize: 14,
        color: "#999999",
        marginBottom: 20,
        fontFamily: "System",
    },
    labelContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignSelf: "stretch",
        marginBottom: 10,
    },
    label: {
        backgroundColor: "#FA6163",
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
        fontFamily: "System",
        fontSize: 14,
        color: "white",
    },
    ingredientContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#f2f2f2",
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 80,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    ingredientText: {
        fontSize: 14,
        color: "#333",
        flexShrink: 1,
    },
    nutritionWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    nutritionBox: {
        backgroundColor: "#f2f2f2",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        minWidth: 80,
        alignItems: "center",
        justifyContent: "center",
    },
    nutrType: {
        fontWeight: "bold",
        color: "#FA6163",
        fontSize: 14,
        textTransform: "capitalize",
    },
    nutrVal: {
        fontSize: 14,
        color: "#333",
    },
    completeButtonContainer: {
        marginTop: 15,
        alignItems: 'center',
        width: "100%",
    },
    completeButton: {
        backgroundColor: '#FA6163',
        width: "90%",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    completeButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'System',
    },

    // FOOTER

    footerHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FAFAFC",
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        elevation: 4, // adds shadow on Android
        shadowColor: "#000", // adds shadow on iOS
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    footerIconLeft: {
        marginLeft: 20,
    },
    footerIconRight: {
        marginRight: 20,
    },
});
