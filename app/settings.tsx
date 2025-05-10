import { Text, Image, View, Button, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
    const navigation = useNavigation();
    const router = useRouter();
    const [isAuthed,setIsAuthed] = useState(Boolean);
    useEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: "#FAFAFC" },
            headerTitle: "",
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.push("/profile")}>
                    <Ionicons name="arrow-back" size={22} color="#333333" style={{ marginLeft: 20 }} />
                </TouchableOpacity>
            ),
        });
        checkIsAuthed();

    }, [navigation]);
    useEffect(()=>{
        checkIsAuthed();
    }
    );
    
    const checkIsAuthed = async () => {
        const token = await AsyncStorage.getItem("userToken");
        if(token)
        {
            setIsAuthed(true);
        }
        else{setIsAuthed(false);}
    }

    const logout = async () => {
        setIsAuthed(false);
        await AsyncStorage.removeItem("userToken");
        console.log("removed token");
    }

    return(
        <>
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.boxTitle}>Settings</Text>
                {isAuthed ?
                <TouchableOpacity
                    style={[styles.button, styles.selectedButton]}
                    onPress={() => logout()}
                >
                    <Text style={styles.buttonText}>Log out</Text>
                </TouchableOpacity>

                :
                <TouchableOpacity
                    style={[styles.button, styles.selectedButton]}
                    onPress={() => router.push("/loginPage")}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                }


                
            </View>
        </View>

            <View style={styles.footerHeader}>
                <TouchableOpacity onPress={() => router.push("/")} style={styles.footerIconLeft}>
                    <Ionicons name="arrow-back" size={20} color="#333333" />
                </TouchableOpacity>
    
                <View style={{ flex: 1 }} />
    
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        backgroundColor: "#FAFAFC",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    box: {
        backgroundColor: "#FAFAFC",
        width: "80%",
        flex: 1,
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        marginBottom: 20,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    boxTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 10,
        fontFamily: "System",
    },
    button: {
        backgroundColor: '#FAFAFC',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    selectedButton: {
        backgroundColor: '#FA6163',
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'System',
    },
    
        // FOOTER

    footerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAFAFC",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 4, // adds shadow on Android
    shadowColor: "#000", // adds shadow on iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    },
    footerIconLeft: {
        marginLeft: 20,
    },
    footerIconRight: {
        marginRight: 20,
    },
});
