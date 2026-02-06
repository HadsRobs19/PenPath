import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import React from 'react';
import { colors } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = {
    onPress: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    variant?: ButtonVariant;
    style?: StyleProp<ViewStyle>;  // <--- changed from ViewStyle
    textStyle?: StyleProp<TextStyle>; // optional: same for text
};

export default function Button({
    onPress,
    children,
    disabled = false,
    variant = 'primary',
    style,
    textStyle,
}: ButtonProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    button: styles.secondaryButton,
                    text: styles.secondaryText,
                };
            case 'outline':
                return {
                    button: styles.outlineButton,
                    text: styles.outlineText,
                };
            default:
                return {
                    button: styles.primaryButton,
                    text: styles.primaryText,
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.button,
                variantStyles.button,
                disabled && styles.disabled,
                pressed && !disabled && styles.pressed,
                style,
            ]}
        >
            <Text style={[styles.text, variantStyles.text, textStyle]}>
                {children}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    secondaryButton: {
        backgroundColor: colors.grayLight,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryText: {
        color: colors.white,
    },
    secondaryText: {
        color: colors.black,
    },
    outlineText: {
        color: colors.primary,
    },
});