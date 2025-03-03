import { Image, View, StyleSheet, Text, TextInput, FlatList, Button, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { processReceipt } from "../backend/receiptOCR.js";
import ImageViewer from '@/components/ImageViewer';
import * as ImagePicker from 'expo-image-picker'
import CustomButton from '@/components/Button';
import DropdownMenu from './dropdownMenu';
const PlaceholderImage = require('@/assets/images/background-image.png');
const receiptIngrList = [];

export default function Index() {
    const [ingrList,setingrList] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    const router = useRouter();
    const [receiptLines, setReceiptLines] = useState<string[]>([]);
    const [inputText, setInputText] = useState("");
    const handleAddItem = () => {
        if (inputText.trim()) {
        setingrList([...ingrList, inputText.trim()]);
        setInputText("");
        }
    }
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality:1
    });
    if (!result.canceled){
      setSelectedImage(result.assets[0].uri);
      console.log(result);
    } else{
      alert('You didnt select an image.');
    }
  }
  const handleMenuToggle = () => {
    setIsMenuOpen(prev => !prev); // Toggle the menu visibility
};

const handleCloseMenu = () => {
    setIsMenuOpen(false); // Close the menu when clicking outside
};




const menuItems = [
  { title: 'Enter Ingredients Page', onPress: () => router.push("/IngredientsInput") },
  // Add more menu items here
];
  async function imageToIngredient()
  {
    if(selectedImage != undefined)
      {
        try {
          const text = await processReceipt(selectedImage);
          const lines = text.split("\n").filter((line) => line.trim() !== ""); // Split text into lines & remove empty ones
          console.log("Setting List:",ingrList);
          console.log("Lines:",lines);
          setReceiptLines(lines);
          setingrList([...ingrList, ...lines]);
          console.log("Updated List:",ingrList);
        } catch (error) {
          console.error("Error processing receipt:", error);
          setReceiptLines(["Failed to process the receipt."]);
        }
      }
  }





  /*function IngredientsInput() {
  const [ingrList, setIngrList] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");


  const handleAddItem = () => {
      if (inputText.trim()) {
          setIngrList([...ingrList, inputText.trim()]);
          setInputText("");
      }
  };*/



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Tailored Recipes!</Text>
      
      <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
      <CustomButton theme="primary" label="Upload Receipt" onPress={pickImageAsync} />
      <CustomButton theme="primary" label="Use this photo" onPress={imageToIngredient}/>
      <TextInput
          style={styles.searchBar}
          defaultValue={inputText}
          value={inputText}
          onChangeText={(inputText) => setInputText(inputText)}
          onSubmitEditing={handleAddItem}
          placeholder="Add Ingredients!"
      />

      <FlatList
          data={ingrList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>{item}</Text>
            </View>
          )}
      />

      <Button title="Clear Ingredients" color="red" onPress={() => setingrList([])} />

      <Button title="Find Recipes" color="blue"/>

      <DropdownMenu isOpen={isMenuOpen} onClose={handleCloseMenu} menuItems={menuItems} />
    
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
});