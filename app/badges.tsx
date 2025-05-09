import { Text,Image, View, Button, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useSnackbar } from "./snackbar";

export default function Badges() {
    const { showError } = useSnackbar();

    const navigation = useNavigation();
    const router = useRouter();
    const [recipeMadeCount, setRecipeMadeCount] = useState(0);
    useEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: "#FAFAFC" },
            headerTitle: "",
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 20 }} />
                </TouchableOpacity>
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
                        setRecipeMadeCount(response.data.cookedStat);
                        console.log("Name: " + response.data.userName + " Cooked: " + response.data.cookedStat)
                    }
                } else {
                    console.log("No token found");
                }
            } catch (error) {
                console.log("caught an error: ");
            }
        }
        checkToken();
      }, [navigation]);
    return(
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.boxTitle}>Badges</Text>
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
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    box: {
        backgroundColor: "#FAFAFC",
        width: "70%",
        flex: 1,
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        marginBottom: 20,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    boxTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 10,
        fontFamily: "System",
    },
});