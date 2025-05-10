import { ImageBackground, Text, Image, View, Button, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useSnackbar } from "./snackbar";

export default function Profile() {
    const { showError } = useSnackbar();
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
    const [veganBadgeUnlocked, setVeganBadgeUnlocked] = useState(Boolean);
    const [meatBadgeUnlocked, setMeatBadgeUnlocked] = useState(Boolean);
    const [sweetBadgeUnlocked, setSweetBadgeUnlocked] = useState(Boolean);
    const [internationalBadgeUnlocked, setInternationalBadgeUnlocked] = useState(Boolean)
    const [streak, setStreak] = useState(0);
    const navigation = useNavigation();
    const router = useRouter();

    const fetchBookMarks = async () =>{
        await axios.post<bookmark[]>('http://127.0.0.1:3000/getBookmarks',{uName:name})
        .then(response=> {
            console.log("Bookmarks: ",response.data);
            setBookmarks(response.data);
        })
        .catch(err=>{
            console.error("Error Getting bookmarks:",err);
            showError("Failed to load bookmarked recipes.");
        })

    
        


    }
    type userProfile = {
        userName: string;
        cookedStat: number;
        veganBadge: boolean;
        meatBadge: boolean;
        sweetBadge: boolean;
        streak: number;
        cookedDate: number;

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
                    const response = await axios.post<userProfile>('http://127.0.0.1:3000/checkToken', null, {
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
                        setStreak(response.data.streak);
                        console.log("VEGAN BADGE:" + response.data.veganBadge);
                        console.log("INTL COUNT: " + response.data.international)
                        const cookedDateStr = String(response.data.cookedDate);
                        if (response.data.international >= 10) {
                            setInternationalBadgeUnlocked(true);
                        }
                        if (cookedDateStr.split('T')[0] === "2000-01-01") {
                            setLastCooked(0);
                          } else {
                            setLastCooked(cookedDateStr.split('T')[0]);
                          }
                    }
                } else {
                    setIsAuthed(false);
                }
            } catch (error) {
                setIsAuthed(false);
                showError("Failed to authenticate.");;
            }
        }
        checkToken();
    }, [navigation]);
    useEffect(() => {
        if (name) {
            fetchBookMarks();
        }
    }, [name]);
    function navToRecipe(recipeTitle:string){
        router.push(`/recipe?title=${encodeURIComponent(recipeTitle)}`);
    }
    type ItemProps = { title: string; img?:string; onPress: () => void };
const Item = ({ title, img, onPress }: ItemProps) => (
    <TouchableOpacity onPress={onPress} style={styles.item}>
        <ImageBackground
            source={img ? { uri: img } : require('../assets/images/food-image.png')}
            style={styles.foodImage}
            imageStyle={{ borderRadius: 12 }}
        >
            <View style={styles.textContainer}>
                <Text style={styles.recipeTitle}>{title}</Text>
                
                
            </View>
        </ImageBackground>
    </TouchableOpacity>
);
    return(
        <>
        {isAuthed ? (
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
                    <Image source={recipeMadeCount >= 1 ? require("@/assets/images/badges/first-dish.png") : require("@/assets/images/badges/first-dish-locked.png")} style={{ width: 150, height: 150, marginRight: 10 }}/>
                    <Image source={recipeMadeCount >= 10 ? require("@/assets/images/badges/10.png") : require("@/assets/images/badges/10-locked.png")} style={{ width: 150, height: 150, marginRight: 10 }} />
                    <Image source={recipeMadeCount >= 30 ? require("@/assets/images/badges/30.png") : require("@/assets/images/badges/30-locked.png")} style={{ width: 150, height: 150, marginRight: 10 }}/>
                    <Image source={veganBadgeUnlocked ? require("@/assets/images/badges/vegan.png") : require("@/assets/images/badges/vegan-locked.png")} style={{ width: 150, height: 150, marginRight: 10 }}/>
                    <Image source={internationalBadgeUnlocked ? require("@/assets/images/badges/international.png") : require("@/assets/images/badges/international-locked.png")} style={{ width: 150, height: 150, marginRight: 10 }}/>
                </ScrollView>
            </View>
            {/* <TouchableOpacity
            style={[styles.button, styles.selectedButton]}
            onPress={(fetchBookMarks)}
            >
            <Text style={styles.buttonText}>Fetch Bookmarks</Text>
            </TouchableOpacity>  */}
            {/* Streaks */}
            <View style={styles.box}>
                        <Text style={styles.boxTitle}>Streaks</Text>
                        <Text style={styles.profileDetail}>Last Cooked Date: {lastCooked}</Text>
                        <Text style={styles.profileDetail}>Streak: {streak}</Text>
            </View>
                    <View style={styles.box}>
                        <Text style={styles.boxTitle}>Bookmarks</Text>
                                        {bookmarks.map((item) => (
                                            <View key={item.recipeName}>
                                                <Item
                                                    title={item.recipeName}
                                                    img={item.img}
                                                    onPress={() => navToRecipe(item.recipeName)}
                                                />
                                            </View>
                                        ))}
                    </View>
        </View>
        </ScrollView>
    ): 
    <View style={[styles.container, { paddingVertical: 20 }]}>
        <View style={styles.box}>
            <Text style={styles.boxTitle}>Not authed, login now!</Text>
            <TouchableOpacity
                style={[styles.button, styles.selectedButton]}
                onPress={() => router.push("/loginPage")}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    </View>}

        <View style={styles.footerHeader}>
            <TouchableOpacity onPress={() => router.push("/")} style={styles.footerIconLeft}>
                <Ionicons name="arrow-back" size={20} color="#333333" />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity onPress={() => router.push("/settings")} style={styles.footerIconRight}>
                <Ionicons name="settings-sharp" size={25} color="#333333" />
            </TouchableOpacity>
        </View>
    </>
)};



const styles = StyleSheet.create({
    scrollContainer: {
        paddingVertical: 20,
        backgroundColor: "#FAFAFC",
    },
    textContainer: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    container: {
        height: "100%",
        width: "100%",
        alignItems: "center",
        backgroundColor: "#FAFAFC",
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
    item: {
        height: 150,
        marginBottom: 15,
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: "#FAFAFC",
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
    recipeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FAFAFC',
        marginBottom: 8,
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
    foodImage: {
        flex: 1,
        justifyContent: 'flex-end',
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
