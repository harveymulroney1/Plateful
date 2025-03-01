import { Text, View, Button} from "react-native";
import { useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
export default function Settings() {
    const navigation = useNavigation();
    const router = useRouter();
    useEffect(() => {
        navigation.setOptions({
          title: "Settings",
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
                <Button title="Login" onPress={() => router.push("/loginPage")} />
            </View>
        </View>
    )
}