import { Stack, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";
import { PaperProvider } from 'react-native-paper';
import { SnackbarProvider } from "./snackbar";
import { Ionicons } from "@expo/vector-icons";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (options: object, containerId: string) => void;
      };
    };
  }
}



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
    // Function to load all recipe names from the server
    const loadNames = async () => {
      axios.post("http://127.0.0.1:3000/loadAllRecipeNames")
        .then(response => {
          type RecipeResponse = { RecipeName: string }[];
          const data = response.data as RecipeResponse;
          console.log("Response data from fetch all: ", data);
          const receivedRecipes = data.map((r) => r.RecipeName); // Extract recipe names
        })
        .catch(err => {
          console.error("Error on fetching all R Names: ", err); // Log error if request fails
        });
    };
    loadNames(); // Call the function to fetch recipe names

    // Function to add Google Translate script to the document
    const addGoogleTranslateScript = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script); // Append the script to the document body

      // start Google Translate widget
      window.googleTranslateElementInit = () => {
        window.google?.translate?.TranslateElement &&
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en' }, // Set the page language to English
          'google_translate_element' // Target element ID for the widget
        );
      };
    };

    addGoogleTranslateScript(); //  add the Google Translate script
  }, []);

  return (
    <PaperProvider>
      <SnackbarProvider>
        <View style={{ flex: 1 }}> {/* Added paddingBottom */}
          {/* Google Translate Widget */}
          <View
            style={{
              position: 'absolute', // Changed to absolute
              top: 615,
              right: 95,
              zIndex: 1000,
            }}
          >
            <div id="google_translate_element"></div>
          </View>

          <Stack screenOptions={{ headerTitleAlign: "center", headerShown: false }}/>
        </View>
      </SnackbarProvider>
    </PaperProvider>
  );
}
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
