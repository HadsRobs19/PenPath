import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="email-sent" />
        <Stack.Screen name="home" />
        <Stack.Screen name="account" />
        <Stack.Screen name="tutorial" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="colors/reading" />
        <Stack.Screen name="colors/writing" />
        <Stack.Screen name="colors/checkpoint" />
        <Stack.Screen name="colors/badge" />
        <Stack.Screen name="animals/reading" />
        <Stack.Screen name="animals/writing" />
        <Stack.Screen name="animals/checkpoint" />
        <Stack.Screen name="animals/badge" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
