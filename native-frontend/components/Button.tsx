import { Pressable, Text, StyleSheet } from 'react-native';
import React from 'react';

type ButtonProps = {
    onPress: () => void;
    children: React.ReactNode;
    disabled?: boolean;
};

export default function Button({
    onPress,
    children,
    disabled = false,
}: ButtonProps) {
    return (
        <Pressable 
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.button,
                disabled && styles.disabled,
                pressed && !disabled && styles.pressed,
            ]}
        >
            <Text style={styles.text}>{children}</Text>
        </Pressable>
    );   
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#2563EB',
        borderRadius: 8,
        alignItems: 'center',
    },
    pressed: {
        opacity: 0.8,
    },
    disabled: {
        fontSize: 16,
        color: "FFFFFF",
        fontWeight: '500',
    },
    text: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
});