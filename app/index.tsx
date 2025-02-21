import { useState, useEffect } from "react";
import { Text, View, Image,TextInput, Button} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Link, useRouter, useNavigation } from 'expo-router';
import { red } from "react-native-reanimated/lib/typescript/Colors";

export default function Index() {
  const [name, setName] = useState("");
  const [ingrList, setingrList] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const router = useRouter();
  const navigation = useNavigation();
 const handleAddItem = () => {
  if (inputText.trim()) {
    setingrList([...ingrList, inputText.trim()]);
    setInputText("");
  }
 };
 useEffect(() => {
  navigation.setOptions({
    title: "Index", // Change header title
    headerLeft: () => (
      <Button onPress={() => router.push("/profile")} title="Profile"></Button>
    ),
  });
}, [navigation]);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Whats your Name?</Text>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
        }}
        placeholder="Type Here"
        defaultValue={name}
        value={name}
        onChangeText={(text) => setName(text)}
      />

      <Image
        source={require('@/assets/images/food-icon.png')}
      />

      <Text>Welcome to {name}'s Ingredients App</Text>
      <Text>Enter your Ingredients Below:</Text>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
        }}
        placeholder="Type Here"
        defaultValue={inputText}
        value={inputText}
        onChangeText={(inputText) => setInputText(inputText)}
        onSubmitEditing={handleAddItem}
      />
    <FlatList
      data={ingrList}
      keyExtractor={(ingr, index) => index.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item}</Text>
        </View>
      )}
    >
      
      
    </FlatList>
    <Button onPress={() => {setingrList([])}} title="Clear Ingredients" color = "red"></Button>
      <Button onPress = {() => router.push("/IngredientsInput") } title = "Scan Receipt"></Button>
    </View>
  );
}
