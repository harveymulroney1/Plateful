import { Text, View, } from "react-native";
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
                <Text>Settings should go here</Text>
            </View>
        </View>
    )
}