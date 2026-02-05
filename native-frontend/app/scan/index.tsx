import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Scan() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>
        Scan Page Loaded ✅
      </Text>

      <Pressable onPress={() => router.push("/scan/camera")}>
        <Text style={{ marginTop: 20, color: "blue" }}>Go to Camera</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/scan/result")}>
        <Text style={{ marginTop: 20, color: "green" }}>Go to Result</Text>
      </Pressable>
    </View>
  );
}
