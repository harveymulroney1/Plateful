import { Text,Image, View } from "react-native";
import { useState } from "react";
const [name,setName] = useState("");
const Level = 1;
const recipeMadeCount = 3;
export default function Profile(){
    <View>
        <Image source={require('@/assets/images/users/default.jpg')}/>
        <View>
            <Text>Welcome to {name} Profile!</Text>
        </View>

        <View>
            <Text>Level: {Level}</Text>
            <Text>Recipes Made: {recipeMadeCount}</Text>
        </View>
        
    </View>
}