import { Stack, useRouter } from "expo-router";

import { Text, View } from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";
import Fuse from 'fuse.js';
import { PaperProvider } from 'react-native-paper';
import { SnackbarProvider } from "./snackbar";



export default function RootLayout() {

  // const options = {
  //   includeScore: true,
  //   threshold: 0.4,
  // };

  // const [search, setSearch] = useState("");
  // const [results, setResults] = useState<string[]>([]);
  const router = useRouter();
  // const [allRecipes, setAllRecipes] = useState<string[]>([]);
  // const fuse = new Fuse(allRecipes, options);

  useEffect(() => {
    const loadNames = async () => {
      axios.post("http://127.0.0.1:3000/loadAllRecipeNames")
        .then(response => {
          console.log("Response data from fetch all: ", response.data);
          const receivedRecipes = response.data.map((r: { RecipeName: any; }) => r.RecipeName);
          // setAllRecipes(receivedRecipes);
        })
        .catch(err => {
          console.error("Error on fetching all R Names: ", err);
        });
    };
    loadNames();
  }, []);

  // const performSearch = async (text: string) => {
  //   setSearch(text);

  //   if (!text.trim() || !fuse) {
  //     setResults([]);
  //     return;
  //   }
  //   console.log("allRecipes: ", allRecipes);
  //   console.log("Searching text: ", text);
  //   const result = fuse.search(text).slice(0, 5);
  //   console.log("Result of fuse: ", result, "Score of fuse: ", result[0]?.score);
  //   setResults(result.map(r => r.item));
  //   if (results) {
  //     console.log("Results: ", results);
  //   }
  // };

  return (
    <PaperProvider>
      <SnackbarProvider>
        <View style={{ flex: 1 }}>
          {}
          <Stack screenOptions={{ headerTitleAlign: "center" }} />
        </View>
      </SnackbarProvider>
    </PaperProvider>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* <SearchBar
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
      /> */}

      {/* {results.length > 0 && (
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
      )} */}

      <Stack screenOptions={{ headerTitleAlign: "center" }} />
    </View>
  );
}
