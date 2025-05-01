import { Text,Image, View, Button } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
export default function Badges() {
    const navigation = useNavigation();
    const router = useRouter();
    const [recipeMadeCount, setRecipeMadeCount] = useState(0);
    useEffect(() => {
        navigation.setOptions({
          title: "Badges",
        });
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                if (!token) {
                    console.log("!token")
                }
                if (token) {
                    const response = await axios.post('http://127.0.0.1:3000/checkToken', null, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    if (response.data) {
                        setRecipeMadeCount(response.data.cookedStat);
                        console.log("Name: " + response.data.userName + " Cooked: " + response.data.cookedStat)
                    }
                } else {
                    console.log("No token found");
                }
            } catch (error) {
                console.log("caught an error: ");
                console.log(error);
            }
        }
        checkToken();
      }, [navigation]);
    return(
        <View
            style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center",
            }}>
            <View>
                <Text>Total cooked for debug: {recipeMadeCount}</Text>
                <Text>Cook 5 recipes: {(recipeMadeCount >= 5).toString() }</Text>
                <Text>Cook 10 recipes: {(recipeMadeCount >= 10).toString() }</Text>
                <Text>Cook 20 recipes: {(recipeMadeCount >= 20).toString() }</Text>
                <Text>Cook 50 recipes: {(recipeMadeCount >= 50).toString() }</Text>
                <Text>Cook a vegitarian recipe: </Text>
                <Text>Cook an Italian recipe: </Text>
            </View>
        </View>
    )
}