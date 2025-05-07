import CustomButton from '@/components/Button';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from "expo-router";
import { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PlaceholderImage = require('@/assets/images/background-image.png');
const receiptIngrList = [];
let username = "test1";
let password = "test1";
export default function Index() {
    const [ingrList,setingrList] = useState<string[]>([]);
    const [receiptLines, setReceiptLines] = useState<string[]>([]);
    const [inputText, setInputText] = useState("");
    
    type Recipe = {
      RecipeName:string;
      Ingredients:string[];
      Method:string[];
      Image:string;
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
    if (!result.canceled){
      setSelectedImage(result.assets[0].uri);
      console.log("Selected img set",selectedImage);
      
      imageToIngredient(result.assets[0].uri);
      console.log(result);
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
          <Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 20 }} />
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
          setReceiptLines(["Failed to process the receipt."]);
        });
      }
    else
    {
      console.log("Selected img is undefined");
    }
  } 
  async function getRecipes () {
    console.log("Getting Post for Recipes. Ingr List Length: ",ingrList.length);
    if(ingrList.length>0){
      console.log("Sending Post");
      axios.post("http://127.0.0.1:3000/getRecipesToDisplay", 
        { ingredients:ingrList })
        
      .then(function (response) {
        const formatted = response.data.map((r: any): Recipe => ({
          RecipeName: r[0],
          Ingredients: r[1],
          //Ingredients: typeof r.Ingredients === 'string' ? JSON.parse(r.Ingredients) : r.Ingredients,
          //Method: typeof r.Method === 'string' ? JSON.parse(r.Method) : r.Method,
          Method: r[2],
          Image: r.Image || ""
        }));
        //console.log("Recipes Received: ",response.data);
        console.log("Formatted recipes: ",formatted);
        setRecipes(formatted);
        if(formatted.length==0)
        {
          alert("No Recipes Found!");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }
    
    
    
  }
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


  const handleItemPress = (recipeTitle: string) => {
    router.push(`/recipe?title=${encodeURIComponent(recipeTitle)}`);
};
  type ItemProps = { title: string; onPress: () => void };
const Item = ({ title, onPress }: ItemProps) => (
    <TouchableOpacity onPress={onPress} style={styles.item}>
        <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find tailored recipes!</Text>

      {/* <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} /> */}
      {/* <CustomButton theme="primary" label="Upload Receipt" onPress={pickImageAsync} /> */}
      
      <View style={styles.inputContainer}>
        <Ionicons name="add" size={20} color="gray" style={styles.inputIcon} />
        <TextInput
          style={styles.inputBox}
          defaultValue={inputText}
          value={inputText}
          onChangeText={(inputText) => setInputText(inputText)}
          onSubmitEditing={handleAddItem}
          placeholder="Enter ingredient"
          placeholderTextColor="#999"
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

    {recipes.length>0 ?
          <FlatList
          data={recipes}
          renderItem={({ item }) => (
            
              <Item title={item.RecipeName} onPress={() => handleItemPress(item.RecipeName)} />
          )}
          showsVerticalScrollIndicator={false}
      />
      : 
      <Text>test</Text>
    }


    <View style={styles.findRecipesButtonContainer}>
        <TouchableOpacity
            style={[styles.findRecipesButton]}
            onPress={getRecipes}
        >
            <Text style={styles.buttonText}>Find Recipes</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
const styles = StyleSheet.create({
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
    marginLeft: 4,
    marginRight: 12,
  },
  inputBox: {
    flex: 1,
    height: 40,
    fontFamily: "System",
    color: "#333333",
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
      fontSize: 16,
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
});
