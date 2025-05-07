import { Text, Image, View, Button, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function Profile() {
    type bookmark={
        recipeName:string;
        img?:string
        keywords?:string[]
    }
    const [name,setName] = useState("");
    const Level = 1;
    const [recipeMadeCount, setRecipeMadeCount] = useState(0);
    const [isAuthed,setIsAuthed] = useState(Boolean);
    const [bookmarks, setBookmarks] = useState<bookmark[]>([])
    const [lastCooked, setLastCooked] = useState(0);
    const [veganBadgeUnlocked, setVeganBadgeUnlocked] = useState(0);
    const [meatBadgeUnlocked, setMeatBadgeUnlocked] = useState(0);
    const [sweetBadgeUnlocked, setSweetBadgeUnlocked] = useState(0);
    const navigation = useNavigation();
    const router = useRouter();

    const fetchBookMarks = async () =>{
        await axios.post('http://127.0.0.1:3000/getBookmarks',{uName:name})
        .then(response=> {
            console.log("Bookmarks: ",response.data);
            setBookmarks(response.data);
        })
        .catch(err=>{
            console.error("Error Getting bookmarks:",err);
        })

    
        


    }
    
    useEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: "#FAFAFC" },
            headerTitle: "",
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.push("/")}>
                    <Ionicons name="arrow-back" size={22} color="#333333" style={{ marginLeft: 20 }} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => router.push("/settings")}>
                    <Ionicons name="settings-sharp" size={22} color="#333333" style={{ marginRight: 20 }} />
                </TouchableOpacity>
            ),
        });
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                if (!token) {
                    setIsAuthed(false);
                }
                if (token) {
                    const response = await axios.post('http://127.0.0.1:3000/checkToken', null, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    if (response.data) {
                        setIsAuthed(true);
                        setName(response.data.userName);
                        setRecipeMadeCount(response.data.cookedStat);
                        setVeganBadgeUnlocked(response.data.veganBadge);
                        setMeatBadgeUnlocked(response.data.meatBadge);
                        setSweetBadgeUnlocked(response.data.sweetBadge);
                        console.log("VEGAN BADGE:" + response.data.veganBadge);
                        if (response.data.cookedDate.split('T')[0] == "2000-01-01") {
                            setLastCooked(0);
                        }
                        else {
                            setLastCooked(response.data.cookedDate.split('T')[0]);
                        }
                    }
                } else {
                    setIsAuthed(false);
                }
            } catch (error) {
                setIsAuthed(false);
                console.log(error);
            }
        }
        checkToken();
    }, [navigation]);


    return(
        isAuthed ? (
            <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>

            {/* Profile Info */}
            <View style={styles.profileBox}>
                <Image
                    source={require('@/assets/images/users/default.jpg')}
                    style={styles.profileImage}
                />
                <Text style={styles.profileName}>{name}</Text>
                <Text style={styles.profileDetail}>Level: {Level}</Text>
                <Text style={styles.profileDetail}>Recipes Made: {recipeMadeCount}</Text>
{/*                 <TouchableOpacity
                    style={[styles.button, styles.selectedButton]}
                    onPress={() => router.push("/badges")}
                >
                    <Text style={styles.buttonText}>View your badges</Text>
                </TouchableOpacity> */}
            </View>

            {/* Badges */}
            <View style={styles.box}>
                <Text style={styles.boxTitle}>Badges</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
                    <Image source={recipeMadeCount >= 1 ? require("@/assets/images/badges/first-dish.png") : require("@/assets/images/badges/first-dish-locked.png")} style={{ width: 200, height: 200, marginRight: 10 }}/>
                    <Image source={recipeMadeCount >= 10 ? require("@/assets/images/badges/10.png") : require("@/assets/images/badges/10-locked.png")} style={{ width: 200, height: 200, marginRight: 10 }} />
                    <Image source={recipeMadeCount >= 30 ? require("@/assets/images/badges/30.png") : require("@/assets/images/badges/30-locked.png")} style={{ width: 200, height: 200, marginRight: 10 }}/>
                    <Image source={meatBadgeUnlocked ? require("@/assets/images/badges/meat.png") : require("@/assets/images/badges/meat-locked.png")} style={{ width: 200, height: 200, marginRight: 10 }}/>
                    <Image source={sweetBadgeUnlocked ? require("@/assets/images/badges/sweet.png") : require("@/assets/images/badges/sweet-locked.png")} style={{ width: 200, height: 200, marginRight: 10 }}/>
                    <Image source={veganBadgeUnlocked ? require("@/assets/images/badges/vegan.png") : require("@/assets/images/badges/vegan-locked.png")} style={{ width: 200, height: 200, marginRight: 10 }}/>
                    <Image source={require("@/assets/images/badges/international.png")} style={{ width: 200, height: 200, marginRight: 10 }}/>
                </ScrollView>
            </View>
            <TouchableOpacity
            style={[styles.button, styles.selectedButton]}
            onPress={(fetchBookMarks)}
            >
            <Text style={styles.buttonText}>Fetch Bookmarks</Text>
            </TouchableOpacity>
            {/* Streaks */}
            <View style={styles.box}>
                        <Text style={styles.boxTitle}>Streaks</Text>
                        <Text>Last Cooked Date: {lastCooked}</Text>
            </View>
                    <View style={styles.box}>
                        <Text style={styles.boxTitle}>Bookmarks</Text>
                    </View>
        </View>
        </ScrollView>
    ): 
    <View>
        <Text>Not Authed Login Now!</Text>
        <TouchableOpacity
            style={[styles.button, styles.selectedButton]}
            onPress={() => router.push("/loginPage")}
        >
            <Text style={styles.buttonText}>Login/Register Now</Text>
        </TouchableOpacity>
    </View>

                )};
    
    
        


const styles = StyleSheet.create({
    scrollContainer: {
        paddingVertical: 20,
        backgroundColor: "#FAFAFC",
    },
    container: {
        width: "100%",
        alignItems: "center",
    },
    profileBox: {
        backgroundColor: "#FAFAFC",
        width: "80%",
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        marginBottom: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    profileName: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "#333333",
    },
    profileDetail: {
        fontSize: 14,
        color: "#999999",
        marginBottom: 5,
    },
    box: {
        backgroundColor: "#FAFAFC",
        width: "80%",
        borderRadius: 20,
        padding: 20,
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
    },
    selectedButton: {
        backgroundColor: '#FA6163',
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
});
