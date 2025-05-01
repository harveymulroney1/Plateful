import { Text, Image, View, Button, TouchableOpacity, StyleSheet} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function Profile() {
    const [name,setName] = useState("");
    const Level = 1;
    let recipeMadeCount = 0;
    
    const navigation = useNavigation();
    const router = useRouter();
    
    useEffect(() => {
        navigation.setOptions({
          headerStyle: { backgroundColor: "#FAFAFC" },
            headerTitle: "",
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.push("/")}>
                    <Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 20 }} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => router.push("/settings")}>
                    <Ionicons name="settings-sharp" size={24} color="black" style={{ marginRight: 20 }} />
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
        <View style={styles.container}>

            {/* Profile Info */}
            <View style={styles.profileBox}>
                <Image
                    source={require('@/assets/images/users/default.jpg')}
                    style={styles.profileImage}
                />
                <Text style={styles.profileName}>{name}</Text>
                <Text style={styles.profileDetail}>Level: {Level}</Text>
                <Text style={styles.profileDetail}>Recipes Made: {recipeMadeCount}</Text>
                <Button title="View your badges" onPress={() => router.push("/badges")}/>
            </View>

            {/* Badges */}
            <View style={styles.box}>
                <Text style={styles.boxTitle}>Badges</Text>
            </View>

            {/* Streaks */}
            <View style={styles.box}>
                <Text style={styles.boxTitle}>Streaks</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    profileBox: {
        backgroundColor: "#FAFAFC",
        width: "80%",
        height: 260,
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        marginBottom: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    profileName: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "#333333",
        fontFamily: "System",
    },
    profileDetail: {
        fontSize: 14,
        color: "#999999",
        marginBottom: 5,
        fontFamily: "System",
    },
    box: {
        backgroundColor: "#FAFAFC",
        width: "70%",
        flex: 1,
        borderRadius: 20,
        padding: 20,
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
