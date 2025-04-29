import { Text, TextInput, View, Button, StyleSheet} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
export default function LoginPage() {
    const navigation = useNavigation();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    useEffect(() => {
        navigation.setOptions({
          title: "Login",
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
        <View
            style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center",
            }}>
            <View>
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
                <View style = {styles.buttons}>
                    <Button title="Login" onPress={login}/>
                </View> 
                <View style = {styles.buttons}>
                    <Button title="Create Account" onPress={createAccount} />
                </View> 
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
  });