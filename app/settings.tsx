import { Text, Image, View, Button, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
    const navigation = useNavigation();
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: "#FAFAFC" },
            headerTitle: "",
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.push("/profile")}>
                    <Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 20 }} />
                </TouchableOpacity>
            ),
        });

        const logout = async () => {
            await AsyncStorage.removeItem("userToken");
            console.log("removed token");
        }

    }, [navigation]);

    return(
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.boxTitle}>Settings</Text>
                <Button title="Login" onPress={() => router.push("/login")} />
                <Button title="Log out" onPress={() => logout()}/>
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
