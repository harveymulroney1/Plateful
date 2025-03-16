import { Image, Text, View, Button } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";

export default function Recipe() {
    const navigation = useNavigation();
    const router = useRouter();
    const { title: recipeTitle } = useLocalSearchParams();

    const [ingredients, setIngredients] = useState([]);
    const [method, setMethod] = useState("");

    useEffect(() => {

        navigation.setOptions({
            headerLeft: () => (
                <Button onPress={() => router.replace("/")} title="Home" />
            ),
            headerTitle: () => (
                <Image 
                    source={require("../assets/images/logo.png")}
                    style={{ width: 60, height: 60, resizeMode: "contain" }} 
                />
            ),
        });

        if (!recipeTitle) return; // Ensure title exists before proceeding

        axios.post("http://127.0.0.1:3000/getRecipe", { n: recipeTitle })
            .then(response => {
                console.log("RESPONSE.DATA:", JSON.stringify(response.data, null, 2));
                console.log("Raw Ingredients Data:", response.data[0].Ingredients);
                console.log("Full Ingredients Array:", JSON.stringify(response.data[0].Ingredients, null, 2));
                console.log("First Ingredient Object:", response.data[0].Ingredients[0]);

                if (Array.isArray(response.data[0].Ingredients)) {
                    setIngredients(response.data[0].Ingredients);
                } else {
                    console.error("Expected ingredients to be an array, but got:", response.data[0].Ingredients);
                    setIngredients([]); // Fallback to empty array
                }
                setMethod(response.data[0].Method || "Error fetching method");
            })
            .catch(error => console.error("Error fetching recipe:", error));
    }, [navigation, recipeTitle]);

    useEffect(() => {
        console.log("Updated method:", method);
    }, [method]);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center",
                padding: 20,
            }}
        >
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
                {recipeTitle}
            </Text>

            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>
                Ingredients:
            </Text>
            {ingredients.length > 0 ? (
                ingredients.map((item, index) => (
                    <Text key={index} style={{ fontSize: 16 }}>
                        • {item}
                    </Text>
                ))
            ) : (
                <Text>Loading ingredients...</Text>
            )}

            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>
                Method:
            </Text>
            <Text style={{ fontSize: 16, textAlign: "center", marginTop: 5 }}>
                {method || "Loading method..."}
            </Text>
        </View>
    );
}