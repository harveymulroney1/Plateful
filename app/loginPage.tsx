import { Text, TextInput, View, Button, StyleSheet, TouchableOpacity , Alert} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useSnackbar } from "./snackbar";
export default function LoginPage() {
    const { showError } = useSnackbar();
    const navigation = useNavigation();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isAuthed,setIsAuthed] = useState(Boolean);
    useEffect(() => {
        checkIsAuthed();
        navigation.setOptions({
            headerStyle: { backgroundColor: "#FAFAFC" },
            headerTitle: "",
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#333333" style={{ marginLeft: 20 }} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);
    const checkIsAuthed = async () => {
        const token = await AsyncStorage.getItem("userToken");
        if(token)
        {
            await axios.post('http://127.0.0.1:3000/checkToken', null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }).then(response=>{
                
                setIsAuthed(true);
            })
            .catch(
                err=>{
                    setIsAuthed(false);
                    console.log("User Token Not Valid");
                    Alert.alert(
                        "Authentication Failed",
                        "Your session has expired. Please log in again.",
                        [
                          { text: "OK", onPress: () => router.push("/loginPage") }
                        ]
                      );
                    
                }
            )
            
        }
        else{setIsAuthed(false);}
    }
    //let username = "";
    //let password = "";
    async function login() {
        try {
            const response = await axios.post("http://127.0.0.1:3000/logIn", { u: username, p: password });
            const token = response.data.token;
            if (token) {
                await AsyncStorage.setItem('userToken', token);
                console.log("Login successful, token saved");
                setIsAuthed(true);
                router.replace("/profile"); // Navigate to profile and close login page
            } else {
                console.log("Login failed: No token received");
                showError("Login failed: No token received");
            }
        } catch (error) {
            console.log("Login failed:", error);
            showError("Login Failed.");
        }
    }

    function createAccount() {
        axios.post("http://127.0.0.1:3000/createAccount", { u: username, p: password })
    }
        const logout = async () => {
        setIsAuthed(false);
        await AsyncStorage.removeItem("userToken");
        console.log("removed token");
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
                {/* <TouchableOpacity
                    style={[styles.button, styles.selectedButton]}
                    onPress={login}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity> */}

                {/* Login */}
                {isAuthed ?
                <TouchableOpacity
                    style={[styles.button, styles.selectedButton]}
                    onPress={() => logout()}
                >
                    <Text style={styles.buttonText}>Log out</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity
                    style={[styles.button, styles.selectedButton]}
                    onPress={login}
                >
                    <Text style={styles.buttonText}>Log in</Text>
                </TouchableOpacity>
                }

                <TouchableOpacity
                    style={[styles.button, styles.selectedButton]}
                    onPress={createAccount}
                >
                    <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footerHeader}>
                <TouchableOpacity onPress={() => router.push("/profile")} style={styles.footerIconLeft}>
                    <Ionicons name="arrow-back" size={20} color="#333333" />
                </TouchableOpacity>
            <View/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderWidth: 1,
        padding: 10,
        fontFamily: "System",
        color: "#333333",
        borderColor: "#999999",
        borderRadius: 8,
        paddingHorizontal: 10,
        width: "100%",
        marginTop: 10,
        marginBottom: 10,
    },
    buttons: {
        padding: 5
    },
    container: {
        flex: 1,
        paddingVertical: 20,
        backgroundColor: "#FAFAFC",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    box: {
        backgroundColor: "#FAFAFC",
        width: "80%",
        flex: 1,
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        marginBottom: 40,
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
        marginBottom: 8,
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

    // FOOTER

    footerHeader: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FAFAFC",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        elevation: 4, // adds shadow on Android
        shadowColor: "#000", // adds shadow on iOS
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    footerIconLeft: {
        marginLeft: 20,
    },
});