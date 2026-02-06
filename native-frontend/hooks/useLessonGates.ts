import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export async function requireLesson(key: string, action: () => void) {
  const done = await AsyncStorage.getItem(key);
  if (done === "true") action();
  else Alert.alert("Finish lesson first!");
}
