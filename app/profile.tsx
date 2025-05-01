import { Text,Image, View, Button } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const Level = 1;
let recipeMadeCount = 0;
export default function Profile() {
    const navigation = useNavigation();
    const router = useRouter();
    const [name,setName] = useState("");
    useEffect(() => {
        navigation.setOptions({
          title: "Profile",
          headerRight: () => (
            <Button title="Settings" onPress={() => router.push("/settings")} />
          ),
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
                        setName(response.data.userName);
                        recipeMadeCount = response.data.cookedStat;
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
            <Image source={require('@/assets/images/users/default.jpg')}/>
            <View>
                <Text>Welcome to {name}'s Profile!</Text>
            </View>

            <View>
                <Text>Level: {Level}</Text>
                <Text>Recipes Made: {recipeMadeCount}</Text>
                <Button title="View your badges" onPress={() => router.push("/badges")}/>
            </View>
        </View>
    )
}