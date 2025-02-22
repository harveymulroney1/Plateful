import { Text, TextInput, View, Button, FlatList, StyleSheet} from "react-native";
import { useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
const Recipes = [
    {
        id: "1",
        title: "Recipe 1"
    },
    {
        id: "2",
        title: "Recipe 2"
    },
    {
        id: "3",
        title: "Recipe 3"
    },
    {
        id: "4",
        title: "Recipe 4"
    },
    {
        id: "5",
        title: "Recipe 5"
    },
    {
        id: "6",
        title: "Recipe 6"
    },
    {
        id: "7",
        title: "Recipe 7"
    },
    {
        id: "8",
        title: "Recipe 8"
    },
    {
        id: "9",
        title: "Recipe 9"
    },
];

type ItemProps = {title: string};

const Item = ({title}: ItemProps) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);


export default function Homepage() {
    const navigation = useNavigation();
    const router = useRouter();
    useEffect(() => {
        navigation.setOptions({
            title: "Home",
            headerLeft: () => (
                <Button onPress={() => router.push("/profile")} title="Profile"></Button>
            ),
            headerRight: () => (
                <Button onPress={() => router.push("/settings")} title="Settings"></Button>
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
                <Text style={{ fontSize: 30 }}>Welcome!</Text>
                <TextInput
                        style={{
                          height: 40,
                          borderColor: 'gray',
                          borderWidth: 1,
                        }}
                        placeholder="Search"
                />
                <FlatList
                    data={Recipes}
                    renderItem={({item}) => <Item title={item.title} />}
                    keyExtractor={item => item.id}
                />
        </View>
    )
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    item: {
      backgroundColor: "#94bdff",
      padding: 25,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    title: {
        fontSize: 28,
    },
  });