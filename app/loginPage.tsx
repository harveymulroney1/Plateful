import { Text, TextInput, View, Button, StyleSheet} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import axios from "axios";
export default function Settings() {
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
    function login() {
        axios.post("http://127.0.0.1:3000/getName", { u: username, p: password })
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
                    <Button title="Login" />
                </View> 
                <View style = {styles.buttons}>
                    <Button title="Create Account" onPress={login} />
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