import BackButton from "@/components/back-button";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";

type DataItem = {
  property_id: string;
  property_name: string;
  price: string;
};

export function TopBar({ searchQuery, handleOnChangeText, clearInput }) {
    return (
      <View className='flex-row items-center w-80 mx-auto'>
      <View>
        <BackButton />
      </View>
      
    </View>
    )
}