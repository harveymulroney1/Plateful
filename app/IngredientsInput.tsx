import { Image, View, StyleSheet, Text, TextInput, FlatList, Button, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { processReceipt } from "../backend/receiptOCR.js";

const PlaceholderImage = require('@/assets/images/background-image.png');
const receiptIngrList = [];


import DropdownMenu from './dropdownMenu';

export default function IngredientsInput() {
  const [ingrList, setIngrList] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigation = useNavigation();
  const router = useRouter();

  const handleAddItem = () => {
      if (inputText.trim()) {
          setIngrList([...ingrList, inputText.trim()]);
          setInputText("");
      }
  };

  const handleMenuToggle = () => {
      setIsMenuOpen(prev => !prev); // Toggle the menu visibility
  };

  const handleCloseMenu = () => {
      setIsMenuOpen(false); // Close the menu when clicking outside
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
          <Button
            onPress={() => router.push("/")} title="Home" // Need to add logo image
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
      <Text style={styles.header}>Find Tailored Recipes!</Text>
      
      <Button title="Scan Ingredients"/>

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

      <Button title="Clear Ingredients" color="red" onPress={() => setIngrList([])} />

      <Button title="Find Recipes"/>

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