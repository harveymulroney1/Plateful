import { Text, TextInput, View, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
export default function LoginPage() {
    const navigation = useNavigation();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
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
    }, [navigation]);
    //let username = "";
    //let password = "";
    async function login() {
        try {
            const response = await axios.post("http://127.0.0.1:3000/logIn", { u: username, p: password })
            const token = response.data.token;
            if (token) {
                //await SecureStore.setItemAsync("userToken", token);
                await AsyncStorage.setItem('userToken', token);
                console.log("SecureStoreAsync has executed - login successful");
            }
            else {
                console.log("Login failed as no token recieved");
            }
        } catch (error) {
            console.log("Login failed - try-catch caught error: ");
            console.log(error);
        }
    }
    function createAccount() {
        axios.post("http://127.0.0.1:3000/createAccount", { u: username, p: password })
    }
    return(
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.boxTitle}>Login</Text>
                <TextInput
                    style = {styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={(username) => setUsername(username)}
                />
                <TextInput
                    style={styles.input}
                    secureTextEntry={true}
                    placeholder="Password"
                    onChangeText={(password) => setPassword(password)}
                />
                <TouchableOpacity
                    style={[styles.button, styles.selectedButton]}
                    onPress={login}
                >
                    <Text style={styles.buttonText}>Log in</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.selectedButton]}
                    onPress={createAccount}
                >
                    <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
    },
    buttons: {
        padding: 5
    },
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
        width: '100%',
    },
    selectedButton: {
        backgroundColor: '#FA6163',
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'System',
    },
  });