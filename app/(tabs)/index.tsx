import { useState } from "react";
import { Text, View, Image,TextInput, Button,StyleSheet} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { red } from "react-native-reanimated/lib/typescript/Colors";
import {Link} from "expo-router"
export default function Index() {
 const [name,setName] = useState("");
 const [ingrList,setingrList] = useState<string[]>([])
 const [inputText, setInputText] = useState("");
 const handleAddItem = () => {
  if (inputText.trim()) {
    setingrList([...ingrList, inputText.trim()]);
    setInputText("");
  }
};
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:"#25292e"
      }}
    >
      
      <Text style={styles.text} >Whats your Name?</Text>
      <TextInput 
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          color:"#fff"
        }}
        placeholder="Type Here"
        defaultValue={name}
        
        value={name}
        onChangeText={(text) => setName(text)}
      />

      <Image
        source={require('@/assets/images/food-icon.png')}
      />

      <Text style={styles.text} >Welcome to {name}'s Ingredients App</Text>
      <Text style={styles.text}>Enter your Ingredients Below:</Text>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          color:"#fff"
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
          <Text style={styles.text}>{item}</Text>
        </View>
      )}
    >
      
      
    </FlatList>
    <Button onPress={() => {setingrList([])}} title="Clear Ingredients" color = "red"></Button>
    </View>

  );
}
const styles = StyleSheet.create({
  navButton: {
    fontSize:20,
    textDecorationLine: "underline",
    color: "#0000FF",
  },
  text:{
    fontSize:20,
    color:"#fff"
  }
});