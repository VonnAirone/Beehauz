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
      <View className='flex-row'>
      <BackButton />
      <View className='flex-row items-center justify-between mt-3 ml-3 border w-72 border-gray-300 rounded-md p-2 backdrop-blur-3xl bg-white/30'>
        <View className='flex-row items-center'>
          <View className='mx-2'>
            <Ionicons name='search' size={20} />
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={handleOnChangeText}
            placeholder='Search for a place' />
        </View>
        <View>
          <Ionicons
            onPress={clearInput}
            name='close-outline' size={15} />
        </View>
      </View>
    </View>
    )
}