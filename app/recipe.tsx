import { Image, Text, View, Button, StyleSheet} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";


export default function Recipe() {
    const navigation = useNavigation();
    const router = useRouter();
    const { title: recipeTitle } = useLocalSearchParams();

    const [ingredients, setIngredients] = useState<string[]>([]);
    const [method, setMethod] = useState<string[][]>([]);
    const [nutrition, setNutrition] = useState<string[][]>([]);
    const [img,setIMG] = useState("");
    
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
        function formatMethod(methodToFormat:string[]){
            const formattedMethod = [];
            for(const el of methodToFormat){
                const match = el.match(/step\s*(\d+)\s*(.+)/i) // skips spaces, grabs number & instruction
                if(match){
                    const stepNum = match[1];
                    const instruction = match[2];
                    formattedMethod.push([`Step ${stepNum}`,instruction.trim()]);
                }
            }
            //console.log("Formatted method: ",formattedMethod);
            setMethod(formattedMethod);           
        }
        function formatNutrition(nutritionToFormat:string[]){
            const formattedNutrition = [];
            for(const el of nutritionToFormat){
                const match = el.match(/^([a-z]+)([\d.]+g)/i) // skips spaces, grabs number & instruction
                if(match){
                    const nutrType = match[1];
                    const nutrVal = match[2];
                    console.log(`${nutrType} : ${nutrVal}`)
                    formattedNutrition.push([nutrType,nutrVal.trim()]);
                }
            }
            
            //console.log("Formatted Nutrition: ",formattedNutrition);
            setNutrition(formattedNutrition);           
        }
        axios.post("http://127.0.0.1:3000/getRecipe", { n: recipeTitle })
            .then(response => {
                console.log("RESPONSE.DATA:", JSON.stringify(response.data, null, 2));
                //console.log("Raw Ingredients Data:", response.data[0].Ingredients);
                const parsedIngredients = JSON.parse(response.data[0].Ingredients);
                //console.log("Full Ingredients Array:", JSON.stringify(response.data[0].Ingredients, null, 2));
                //console.log("Image Data Received:",response.data[0].Image);
                setIMG(response.data[0].Image);
                if (Array.isArray(parsedIngredients)) {
                    setIngredients(parsedIngredients);
                } else {
                    console.error("Expected ingredients to be an array, but got:", response.data[0].Ingredients);
                    setIngredients([]); // Fallback to empty array
                }
                
                formatMethod(JSON.parse(response.data[0].Method));
                formatNutrition(JSON.parse(response.data[0].Nutrition));
                //setMethod(JSON.parse(response.data[0].Method) || "Error fetching method");
            })
            .catch(error => console.error("Error fetching recipe:", error));
    }, [navigation, recipeTitle]);

    useEffect(() => {
        //console.log("Updated method:", method);
    }, [method]);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "flex-start",
                padding: 20,
            }}
        >
            <View style={{ padding: 20 }}>
                {img ? (
                    <Image source={{ uri: img }} style={{ width: 200, height: 200 }} />
                    ) : (
                    <Text>No image available Image: {img}</Text>
                    )}
                </View>
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
{/*             <Text style={{ fontSize: 16, textAlign: "center", marginTop: 5 }}>
                {method || "Loading method..."}
            </Text> */}
            {method.length > 0 ? (
                method.map(([step,instruction]) => (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepLabel}>• {step}:</Text>
                        <Text style={styles.stepText}>{instruction}</Text>
                        
                    </View>

                ))
            ) : (
                <Text>Loading Method...</Text>
            )}
            {nutrition.length > 0 ? (
                nutrition.map(([nutrType,nutrVal]) => (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepLabel}>• {nutrType}:</Text>
                        <Text style={styles.stepText}>{nutrVal}</Text>
                        
                    </View>

                ))
            ) : (
                <Text>Loading Nutritional Values...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    stepLabel: {
        width: 70, 
        color: '#3366cc',
        fontWeight: 'bold',
    },
      
    stepText: {
        color: `#333`,
        flex:1,
        fontSize:16,
    },
    stepContainer: {
        flexDirection: 'row',       
        alignItems: 'flex-start',   // Align tops of step + text
        marginBottom: 8,
      },
      
});