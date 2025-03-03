import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';

type DropdownMenuProps = {
    isOpen: boolean;
    onClose: () => void;
    menuItems: { title: string, onPress: () => void }[];
};

const DropdownMenu = ({ isOpen, onClose, menuItems }: DropdownMenuProps) => {
    if (!isOpen) return null; // Don't render the dropdown if it's closed
    return (
        <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.dropdownBackdrop}>
            <View style={styles.dropdown}>
            {menuItems.map((item, index) => (
                <Text key={index} style={styles.menuItem} onPress={item.onPress}>
                {item.title}
                </Text>
            ))}
            </View>
        </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    dropdownBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdown: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 5,
        width: '80%',
        marginTop: 60, // Space from the header
    },
    menuItem: {
        fontSize: 18,
        paddingVertical: 10,
        textAlign: 'center',
    },
});

export default DropdownMenu;
