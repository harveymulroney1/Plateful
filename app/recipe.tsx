import { Text, View, Button} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import axios from "axios";
export default function Recipe() {
    const navigation = useNavigation();
    const router = useRouter();
  
    const response = axios.post("http://127.0.0.1:3000/getRecipe", { n: "Smash burgers" });
    useEffect(() => {
        navigation.setOptions({
          title: "Recipe",
        });
      }, [navigation]);
    return(
        <View
            style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center",
            }}>
        </View>
    )
}