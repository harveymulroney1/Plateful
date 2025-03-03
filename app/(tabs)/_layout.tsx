import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
export default function TabsLayout() {
  return <Tabs
  screenOptions={{
    tabBarActiveTintColor: '#ffd33d',
    headerStyle: {
      backgroundColor: '#25292e',
    },
    headerShadowVisible: false,
    headerTintColor: '#fff',
    tabBarStyle: {
    backgroundColor: '#25292e',
    },
  }}
    >
    <Tabs.Screen name="index" 
    options={{
        headerTitle:"Home",
        tabBarIcon: ({focused,color}) => 
        <Ionicons 
        name={focused ? "home-sharp":"home-outline"} 
        color={color} 
        size={24}/>
    }}
    />
    <Tabs.Screen name="IngredientsInput" 
    options={{
        headerTitle:"Add your Ingredients",
        headerTintColor:"#fff",
        tabBarIcon: ({focused,color}) => 
        <Ionicons 
        name={focused ? "add-circle-sharp": "add-circle-outline"} 
        color={color} 
        size={24}/>
    }}
    />
    <Tabs.Screen name="Profile"
    options={{
        headerTitle:"Profile",
        tabBarIcon:({focused,color})=>
            <Ionicons
            name={focused ? "person-sharp":"person-outline"}
            color={color}
            size={24}/>
    }}/>
    <Tabs.Screen name = "recipe"
    options={{
      headerTitle:"Chilli Con Carne",
      tabBarIcon:({focused,color})=>
        <Ionicons
        name={focused ? "restaurant-sharp":"restaurant-outline"}
        color={color}
        size={24}/>
    }}/>
    </Tabs>

}
