import CustomButton from '@/components/Button';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from "expo-router";
import { useState } from 'react';
import { Button,Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, ImageBackground } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSnackbar } from "./snackbar";
import { Snackbar } from 'react-native-paper';
const PlaceholderImage = require('@/assets/images/background-image.png');
const receiptIngrList = [];
let username = "test1";
let password = "test1";

type ItemProps = { title: string; img?:string; keywords?:string[]; onPress: () => void };

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

export default function Index() {
    const { showError } = useSnackbar();
    const [ingrList,setingrList] = useState<string[]>([]);
    const [receiptLines, setReceiptLines] = useState<string[]>([]);
    const [inputText, setInputText] = useState("");

    const [showOverlay, setShowOverlay] = useState(false);
    
  type Recipe = {
    recipeName: string;
    img: string;
    keywords: string[];
  }

    const [recipes,setRecipes] = useState<Recipe[]>([]);
    const handleAddItem = () => {
        if (inputText.trim()) {
        setingrList([...ingrList, inputText.trim()]);
        setInputText("");
        }
    }

    const navigation = useNavigation();
    const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality:0.5
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      console.log("Selected img set", uri); // log URI directly
      imageToIngredient(uri); // pass directly
    } else{
      alert('You didnt select an image.');
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: "#FAFAFC" },
      headerTitle: "",
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.push("/")}>
          <Ionicons name="arrow-back" size={22} color="#333333" style={{ marginLeft: 20 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  
  function imageToIngredient(imgURI:string)
  {
    // selected img not updated
    if(imgURI)
      {
        console.log("Trying to scan")
        axios.post("http://127.0.0.1:3000/scan",
          { i:imgURI })
        .then(function (response) {
          //console.log("Lines Received: ",response.data);
          // (DEBUGGING DOING LINES ON SERVER SIDE)
          const lines = response.data;
          //const lines = response.data.split("\n").filter((line:string) => line.trim() !== ""); // Split text into lines & remove empty ones
          setReceiptLines(lines);
          setingrList([...ingrList, ...lines]);
          
        })
        .catch(function (error) {
          console.error("Error processing receipt:", error);
          showError("Failed to process receipt.");
          setReceiptLines(["Failed to process the receipt."]);
        });
      }
    else
    {
      console.log("Selected img is undefined");
    }
  }

  async function getRecipes () {
    console.log("Getting Post for Recipes. Ingr List Length: ", ingrList.length);
    
    if (ingrList.length > 0) {
      axios.post<Recipe[]>("http://127.0.0.1:3000/getRecipesToDisplay", { ingredients: ingrList })
        .then((response) => {
          const formatted = response.data.map((r: any): Recipe => ({
            recipeName: r[0],
            img: r?.[3] || "",
            keywords: cleanKeywords(JSON.parse(r?.[4])),
          }));
          console.log("Formatted:",formatted);
          setRecipes(formatted);
          if (formatted.length === 0) {
            showError("No Recipes Found. Add More!");
            Alert.alert("No Recipes Found", "Please add some more ingredients.");
          } else {
            setShowOverlay(true); // Show the overlay
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
  
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

  const updateIngredient = (text:string, index: number) => {
    const updated = [...ingrList];
    updated[index] = text;
    setingrList(updated);
  };

function removeIngredient(index:number)
{
  const updated = [...ingrList];
  const x = updated.splice(index,1);
  setingrList(updated);
  console.log("Removed elem: ",x);
}



  /*function IngredientsInput() {
  const [ingrList, setIngrList] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");


  const handleAddItem = () => {
      if (inputText.trim()) {
        setIngrList([...ingrList, inputText.trim()]);
        axios.post("http://127.0.0.1:3000/insert", { u: username, i: ingrList, p: password })
        setInputText("");
      }
  };*/


const handleItemPress = (recipeTitle: string, keywords?: string[]) => {
  const keywordsParam = keywords ? encodeURIComponent(JSON.stringify(keywords)) : "";
  router.push(`/recipe?title=${encodeURIComponent(recipeTitle)}&keywords=${keywordsParam}`);
};


  return (
    <>
    <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>

      <Text style={styles.header}>Find tailored recipes!</Text>

      {/* <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} /> */}
      {/* <CustomButton theme="primary" label="Upload Receipt" onPress={pickImageAsync} /> */}
      
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleAddItem}>
          <Ionicons name="add" size={20} color="gray" style={styles.inputIcon} />
        </TouchableOpacity>
        <TextInput
          style={styles.inputBox}
          value={inputText}
          onChangeText={(inputText) => setInputText(inputText)}
          onSubmitEditing={handleAddItem}
          placeholder="Enter ingredient"
          placeholderTextColor="#999"
          returnKeyType="done"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
            style={[styles.button, styles.selectedButton]}
            onPress={pickImageAsync}
        >
            <Text style={styles.buttonText}>Scan Ingredients</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.button, styles.selectedButton]}
            onPress={() => setingrList([])} // Clear Ingredients
        >
            <Text style={styles.buttonText}>Clear Ingredients</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ingrList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.ingredientItem}>
            <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeButton}>
              <Ionicons name="remove" size={20} color="gray" />
            </TouchableOpacity>
            <TextInput
              value={item}
              onChangeText={(item) => updateIngredient(item, index)}
            />
          </View>
        )}
      />

      <View style={styles.findRecipesButtonContainer}>
        <TouchableOpacity
            style={[styles.findRecipesButton]}
            onPress={getRecipes}
        >
          <Text style={styles.findRecipesButtonText}>Find Recipes</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
    
    {showOverlay && (
      <View style={styles.overlay}>
        <View style={styles.overlayHeader}>
          <Text style={styles.overlayTitle}>Tailored recipes</Text>
          <TouchableOpacity onPress={() => setShowOverlay(false)}>
            <Ionicons name="close" size={24} color="#FAFAFC" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {recipes.map((item, index) => (
            <Item
              key={index}
              title={item.recipeName}
              img={item.img}
              keywords={item.keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1))}
              onPress={() => {
                setShowOverlay(false);
                handleItemPress(item.recipeName, item.keywords);
              }}
            />
          ))}
        </ScrollView>
      </View>
    )}

    <View style={styles.footerHeader}>
      <TouchableOpacity onPress={() => router.push("/")} style={styles.footerIconLeft}>
        <Ionicons name="arrow-back" size={20} color="#333333" />
      </TouchableOpacity>

      <View style={{ flex: 1 }} />
    </View>
  </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 20,
    zIndex: 1000,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  overlayTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FAFAFC',
  }, 
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFC",
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    color: "#333333",
    fontFamily: "System",
  },
  inputContainer: {
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
  inputIcon: {
    marginLeft: 3,
    marginRight: 3,
  },
  inputBox: {
    flex: 1,
    height: 40,
    fontFamily: "System",
    color: "#333333",
    borderWidth: 1,
    borderColor: "#FAFAFC",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  button: {
      backgroundColor: '#FAFAFC',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      alignItems: 'center',
      justifyContent: 'center',
      width: '48%',
  },
  selectedButton: {
      backgroundColor: '#FA6163',
  },
  buttonText: {
      fontSize: 14,
      color: 'white',
      fontWeight: 'bold',
      fontFamily: 'System',
  },
  findRecipesButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  findRecipesButton: {
    backgroundColor: '#FA6163',
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
    width: '100%',
  },
  findRecipesButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  title: {
    fontSize: 20,
  },
  ingredientItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F0F0F0", // Light gray background
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  removeButton: {
    paddingRight: 10,
  },

    // STYLES FOR RECIPE TILES

    item: {
      height: 150,
      marginBottom: 20,
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
      elevation: 4, // Android shadow
      shadowColor: "#000", // iOS shadow
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
