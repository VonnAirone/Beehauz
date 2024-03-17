import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";

export const RoomTypes = () => {
  const [selectedChips, setSelectedChips] = useState([]);
  const [roomPrices, setRoomPrices] = useState({});

  const toggleChip = (roomType) => {
    if (selectedChips.includes(roomType)) {
      setSelectedChips(selectedChips.filter(chip => chip !== roomType));
      const updatedRoomPrices = { ...roomPrices };
      delete updatedRoomPrices[roomType];
      setRoomPrices(updatedRoomPrices);
    } else {
      setSelectedChips([...selectedChips, roomType]);
    }
  };

  const insertRoomType = async (roomType, price) => {
    try {
      const { data, error } = await supabase.from('room_types').insert([{ room_type: roomType, price: price }]);
      if (error) {
        throw error;
      }
      console.log("Room type inserted successfully:", data);
    } catch (error) {
      console.error("Error inserting room type:", error.message);
    }
  };

  const handleSave = async () => {
    selectedChips.forEach(roomType => {
      const price = roomPrices[roomType] || null;
      insertRoomType(roomType, price);
    });
  };

  return (
    <View className='mt-10'>
      <View className='flex-row items-center'>
        <Text>Types of Room:</Text>
        <Text className='ml-1 text-xs text-gray-600'>Select one or more</Text>
      </View>

      <View className='flex-row flex-wrap gap-y-2 gap-x-2 mt-1'>
        {["Single Room", "2-Person Room", "3-Person Room", "Suite"].map((roomType, index) => (
          <Pressable
            key={index}
            onPress={() => toggleChip(roomType)}
            style={{
              borderWidth: 1,
              borderColor: 'gray',
              padding: 8,
              borderRadius: 8,
              backgroundColor: selectedChips.includes(roomType) ? 'yellow' : 'transparent',
            }}
          >
            <Text>{roomType}</Text>
          </Pressable>
        ))}
      </View>

      <View className='mt-4'>
        <Text>Set Room Prices:</Text>
        <View className="mt-1">
          {selectedChips.map((roomType, index) => (
            <View key={index} className="mt-2 flex-row gap-x-2">
              <View className="p-2 border grow border-gray-300 rounded-md">
                <TextInput 
                  value={roomType}
                  editable={false} 
                />
              </View>

              <View className="p-2 border w-32 border-gray-300 rounded-md">
                <TextInput 
                  placeholder="Price"
                  onChangeText={(price) => setRoomPrices({ ...roomPrices, [roomType]: price })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};



export const PageOne = () => {
  return (
    <View>   
      
    </View>
  )
}
