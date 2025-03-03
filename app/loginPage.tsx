import { Text, TextInput, View, Button, StyleSheet} from "react-native";
import { useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
export default function Settings() {
    const navigation = useNavigation();
    const router = useRouter();
    useEffect(() => {
        navigation.setOptions({
          title: "Login",
        });
      }, [navigation]);
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
                    placeholder = "Username"
                />
                <TextInput
                    style={styles.input}
                    secureTextEntry={true}
                    placeholder = "Password"
                />
                <View style = {styles.buttons}>
                    <Button title="Login" />
                </View> 
                <View style = {styles.buttons}>
                    <Button title="Create Account" />
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