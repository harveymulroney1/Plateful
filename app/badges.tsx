import { Text,Image, View, Button } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
export default function Badges() {
    const navigation = useNavigation();
    const router = useRouter();
    useEffect(() => {
        navigation.setOptions({
          title: "Badges",
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
                <Text>Badges page</Text>
            </View>
        </View>
    )
}