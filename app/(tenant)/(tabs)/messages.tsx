import React, { useState, useEffect } from "react";
import { Text, FlatList, TextInput, View, Pressable} from "react-native";
import { fetchUserMessages, subscribeToRealTimeMessages } from "../(aux)/messagecomponent";
import { useAuth } from "@/utils/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatComponent from "../(aux)/ChatComponent";

export default function Messages() {
  const session = useAuth();
  const userID = session?.session.user.id;
  const [userMessages, setUserMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const messages = await fetchUserMessages(userID);
      setUserMessages(messages);
      setLoading(false);
    }

    fetchData();

    const unsubscribe = subscribeToRealTimeMessages(userID, (newMessage) => {
    setUserMessages((prevMessages) => {
      const isUniqueRoom = !prevMessages.some(
        (message) => message.room_id === newMessage.room_id
      );

      if (isUniqueRoom) {
        return [...prevMessages, newMessage];
      } else {
        return prevMessages.map((message) =>
          message.room_id === newMessage.room_id ? newMessage : message
        );
      }
    });
  });

  return () => {
    unsubscribe();
  };
  }, [userID]);

  return (
    <SafeAreaView className="flex-1">
      <View className="p-5">
        <View className='flex-row items-center justify-between mb-4'>
          <View>
            <Text className='text-xl font-semibold'>Messages</Text>
          </View>

          <Pressable 
          style={{backgroundColor: "#444"}}
          onPress={() => {}}
          android_ripple={{color: "white"}}
          className='p-3 rounded-md'>
            <Ionicons name='create' color={"white"} size={20}/>
          </Pressable>
        </View>

        <View>
          <View className='flex-row items-center bg-gray-50 rounded-md p-2 backdrop-blur-3xl'>
            <View className='mx-2'>
              <Ionicons name='search' size={20} color={'#444'}/>
            </View>
            <TextInput 
            editable={false} 
            placeholder='Search for a user'/>
          </View>
        </View>

        <View className="mt-5">
          {loading ? (
            <Text>Loading...</Text>
          ) : userMessages.length === 0 ? (
            <Text>No messages</Text>
          ) : (
            <FlatList
              scrollEnabled
              data={userMessages}
              renderItem={({ item }) => (
                <ChatComponent item={item}/>
              )}
              keyExtractor={(item) => (item.message_id || item.id).toString()}
            />
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}
