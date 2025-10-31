import { View,Text } from "react-native";

export function MealCard({name,calories}:Props)
{
    return(
        <View>
            <Text>{name}</Text>
            <Text>{calories} kcal</Text>
        </View>
    );
}