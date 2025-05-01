import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from "react-native";
import { useEffect, useRef } from "react";

interface MenuProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: { title: string; onPress: () => void }[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Menu({ isOpen, onClose, menuItems }: MenuProps) {
    const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.6)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isOpen) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -SCREEN_WIDTH * 0.6,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isOpen]);

    return (
        <Animated.View pointerEvents={isOpen ? 'auto' : 'none'} style={[styles.overlay, { opacity: overlayOpacity }]}>
            <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={onClose}
            />
            <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
                {menuItems.map((item, index) => (
                <TouchableOpacity key={index} onPress={item.onPress}>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
                ))}
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        zIndex: 1000,
    },
    menuContainer: {
        width: SCREEN_WIDTH * 0.6,
        height: '100%',
        backgroundColor: "#FAFAFC",
        shadowColor: "#000",
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    menuItemText: {
        fontSize: 18,
        color: "#333333",
        fontFamily: "System",
        fontWeight: "bold",
    },
});