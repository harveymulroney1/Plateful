import { Image, View, StyleSheet, Text, TextInput, FlatList, Button, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { scanReceipt } from "../backend/receiptOCR.js";
import ImageViewer from '@/components/ImageViewer';
import * as ImagePicker from 'expo-image-picker'
import CustomButton from '@/components/Button';
import {fetchRecipes} from "../backend/MatchreceiptToRecipes.js"
import DropdownMenu from './dropdownMenu';
const PlaceholderImage = require('@/assets/images/background-image.png');
const receiptIngrList = [];
import axios from 'axios';
let username = "test1";
let password = "test1";
export default function Index() {
    const [ingrList,setingrList] = useState<string[]>([])
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
      await setSelectedImage(result.assets[0].uri);
      console.log("Selected img set",selectedImage);
      await imageToIngredient();
      console.log(result);
    } else{
      alert('You didnt select an image.');
    }
  }
  async function imageToIngredient()
  {
    // selected img not updated
    if(selectedImage != undefined)
      {
        console.log("Trying to scan")
        axios.post("http://127.0.0.1:3000/scan", 
          { i:selectedImage })
        .then(function (response) {
          console.log("Lines Received: ",response.data);
          const lines = response.data.split("\n").filter((line:string) => line.trim() !== ""); // Split text into lines & remove empty ones
          setReceiptLines(lines);
          setingrList([...ingrList, ...lines]);
          
        })
        .catch(function (error) {
          console.log(error);
        });
        try {
          const text = await scanReceipt(selectedImage);
          const lines = text.split("\n").filter((line) => line.trim() !== ""); // Split text into lines & remove empty ones
          setReceiptLines(lines);
          setingrList([...ingrList, ...lines]);
        } catch (error) {
          console.error("Error processing receipt:", error);
          setReceiptLines(["Failed to process the receipt."]);
        }
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
        console.log("Recipes Received: ",response.data);
        console.log("Formatted recipes: ",formatted);
        setRecipes(formatted);
      })
      .catch(function (error) {
        console.log(error);
      });
    }
    
    
    
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
      <Text style={styles.header}>Find Tailored Recipes!</Text>
      
      <Button onPress={pickImageAsync} title="Scan Ingredients"/>

      {/* <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} /> */}
      {/* <CustomButton theme="primary" label="Upload Receipt" onPress={pickImageAsync} /> */}
      
      <TextInput
          style={styles.searchBar}
          defaultValue={inputText}
          value={inputText}
          onChangeText={(inputText) => setInputText(inputText)}
          onSubmitEditing={handleAddItem}
          placeholder="Add Ingredients!"
      />
      <CustomButton theme="primary" label = "Find Recipes!" onPress={getRecipes}></CustomButton>

      <FlatList
          data={ingrList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>{item}</Text>
            </View>
          )}
      />
      <FlatList
        data={recipes}
        renderItem={({ item }) => (
          
            <Item title={item.RecipeName} onPress={() => handleItemPress(item.RecipeName)} />
        )}
        showsVerticalScrollIndicator={false}
    />
      <Button title="Clear Ingredients" color="red" onPress={() => setingrList([])} />

      

      
    
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#fff",
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
  },
  searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: "gray",
      paddingBottom: 10,
      marginBottom: 20,
  },
  searchInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: "gray",
      borderRadius: 5,
      paddingHorizontal: 10,
      marginRight: 10,
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
  ingredientItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderColor: "#ccc",
  },
  findRecipesButton: {
      backgroundColor: "#ff6347",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
  },
  findRecipesText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
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