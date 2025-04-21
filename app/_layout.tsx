import { Stack, useRouter } from "expo-router";
import { SearchBar } from "@rneui/themed";
import { Text, View } from "react-native";
import { useState,useEffect } from "react";
import axios from "axios";
import Fuse from 'fuse.js';

export default function RootLayout() {
  
  const options = {
    includeScore: true,
    threshold: 0.4, 
  };
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const router = useRouter();
  const [allRecipes,setAllRecipes] = useState<string[]>([]);
  const fuse = new Fuse(allRecipes,options)
  useEffect(() => {
    const loadNames = async () => {
      axios.post("http://127.0.0.1:3000/loadAllRecipeNames")
      .then(response => {
        console.log("Response data from fetch all: ",response.data);
        const receivedRecipes = response.data.map((r: { RecipeName: any; }) => r.RecipeName);
        setAllRecipes(receivedRecipes);
      })
      .catch(err=>{
        console.error("Error on fetching all R Names: ",err);
      })
    };
    loadNames();
  }, []);
  
  // Example search logic placeholder
  const performSearch = async (text: string) => {
    setSearch(text);

    if (!text.trim()||!fuse) {
      setResults([]); // remove results - DOESNT CALL ON white space
      return;
    }
    console.log("allRecipes: ",allRecipes);
    console.log("Searching text: ",text);
    const result = fuse.search(text).slice(0,5)//.map(r=>r.item); // gets first 5 & changes out of fuse format
    console.log("Result of fuse: ",result,"Score of fuse: ",result[0]?.score);
    setResults(result.map(r=>r.item)); // removes fuse stuff
    if(results)
    {
      console.log("Results: ",results);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SearchBar
        platform="default"
        containerStyle={{ backgroundColor: "white" }}
        inputContainerStyle={{ backgroundColor: "#eee" }}
        inputStyle={{}}
        placeholder="Search for a recipe..."
        placeholderTextColor="#000"
        round
        showLoading
        value={search}
        onChangeText={performSearch}
      />

      {results.length > 0 && (
        <View style={{ backgroundColor: "white", zIndex: 100, paddingHorizontal: 10 }}>
          {results.map((item, index) => (
            <Text
              key={index}
              onPress={() => {
                setSearch("");
                setResults([]);
                router.push(`/recipe?title=${encodeURIComponent(item)}`);
              }}
              style={{
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              {item}
            </Text>
          ))}
        </View>
      )}

      <Stack screenOptions={{ headerTitleAlign: "center" }} />
    </View>
  );
}
