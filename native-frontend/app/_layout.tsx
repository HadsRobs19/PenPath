import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(scan)" />
      <Stack.Screen name="(account)" />
      <Stack.Screen name="(settings)" />
    </Stack>
  );
}
