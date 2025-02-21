import { Text,Image, View, Button } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
const [name,setName] = useState("");
const Level = 1;
const recipeMadeCount = 3;
export default function Profile() {
    const navigation = useNavigation();
    const router = useRouter();
    useEffect(() => {
        navigation.setOptions({
          title: "Profile", // Change header title
          headerRight: () => (
            <Button title="Settings" onPress={() => router.push("/settings")} />
          ),
        });
      }, [navigation]);
    return(
        <View
            style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center",
            }}>
            <Image source={require('@/assets/images/users/default.jpg')}/>
            <View>
                <Text>Welcome to {name} Profile!</Text>
            </View>

            <View>
                <Text>Level: {Level}</Text>
                <Text>Recipes Made: {recipeMadeCount}</Text>
            </View>
        </View>
    )
}