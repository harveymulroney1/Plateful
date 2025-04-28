import { Text, View, Button} from "react-native";
import { useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function Settings() {
    const navigation = useNavigation();
    const router = useRouter();
    useEffect(() => {
        navigation.setOptions({
          title: "Settings",
        });
    }, [navigation]);
    const logout = async () => {
        await AsyncStorage.removeItem("userToken");
        console.log("removed token");
    }
    return(
        <View
            style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center",
            }}>
            <View>
                <Button title="Login" onPress={() => router.push("/loginPage")} />
                <Button title="Log out" onPress={() => logout()}/>
            </View>
        </View>
    )
}