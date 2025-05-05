import { Text, Image, View, Button, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function Profile() {
    const [name, setName] = useState("");
    const Level = 1;
    const [recipeMadeCount, setRecipeMadeCount] = useState(0);
    const [isAuthed, setIsAuthed] = useState(Boolean);
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
                    setIsAuthed(false);
                }
                if (token) {
                    const response = await axios.post('http://127.0.0.1:3000/checkToken', null, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    if (response.data) {
                        setIsAuthed(true);
                        setName(response.data.userName);
                        setRecipeMadeCount(response.data.cookedStat);
                    }
                } else {
                    setIsAuthed(false);
                }
            } catch (error) {
                setIsAuthed(false);
                console.log(error);
            }
        }
        checkToken();
    }, [navigation]);

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.profileBox}>
                    <Image
                        source={require('@/assets/images/users/default.jpg')}
                        style={styles.profileImage}
                    />
                    <Text style={styles.profileName}>{name}</Text>
                    <Text style={styles.profileDetail}>Level: {Level}</Text>
                    <Text style={styles.profileDetail}>Recipes Made: {recipeMadeCount}</Text>
                    {/* <TouchableOpacity
                        style={[styles.button, styles.selectedButton]}
                        onPress={() => router.push("/badges")}
                    >
                        <Text style={styles.buttonText}>View your badges</Text>
                    </TouchableOpacity> */}
                </View>

                <View style={styles.box}>
                    <Text style={styles.boxTitle}>Badges</Text>
                    <Text>Cook 5 recipes: {(recipeMadeCount >= 5).toString()}</Text>
                    <Text>Cook 10 recipes: {(recipeMadeCount >= 10).toString()}</Text>
                    <Text>Cook 20 recipes: {(recipeMadeCount >= 20).toString()}</Text>
                    <Text>Cook 50 recipes: {(recipeMadeCount >= 50).toString()}</Text>
                    <Text>Cook a vegetarian recipe: </Text>
                    <Text>Cook an Italian recipe: </Text>
                </View>

                <View style={styles.box}>
                    <Text style={styles.boxTitle}>Streaks</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        paddingVertical: 20,
        alignItems: "center",
        backgroundColor: "#FAFAFC",
    },
    container: {
        width: "100%",
        alignItems: "center",
    },
    profileBox: {
        backgroundColor: "#FAFAFC",
        width: "80%",
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
    },
    profileDetail: {
        fontSize: 14,
        color: "#999999",
        marginBottom: 5,
    },
    box: {
        backgroundColor: "#FAFAFC",
        width: "80%",
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
    },
    button: {
        backgroundColor: '#FAFAFC',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedButton: {
        backgroundColor: '#FA6163',
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
});
