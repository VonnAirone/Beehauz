import React, { useState, useEffect } from "react";
import { Text, FlatList, TextInput, View, Pressable } from "react-native";
import { useAuth } from "@/utils/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchUserMessages, subscribeToRealTimeMessages } from "@/app/(tenant)/(aux)/messagecomponent";
import ChatComponent from "../(screens)/ChatComponent";

export default function OwnerMessages() {
  const session = useAuth();
  const userID = session?.session?.user?.id;
  const [userMessages, setUserMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showmodal, setShowModal] = useState(false)
  
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
        <View className="mb-4 flex-row gap-x-1">
          <Text className='text-xl font-semibold'>Messages</Text>
          <Pressable 
          onPress={() => setShowModal(!showmodal)}
          className="top-2">
            <Ionicons name="help-circle-outline" size={15}/>
          </Pressable>

          {showmodal && (
            <View className="bg-white border border-gray-700 p-2 rounded-md absolute top-8 z-10 w-full flex-row items-center justify-between">
              <Text>Only tenants can start a conversation.</Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Ionicons name="close"/>
              </Pressable> 
            </View>
          )}
          
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
            <View></View>
          ) : userMessages.length === 0 ? (
            <View className="items-center justify-center">
             <Text>No messages as of the moment</Text>
            </View>
           
          ) : (
            <>
            <FlatList
              scrollEnabled
              data={userMessages}
              renderItem={({ item }) => (
                <ChatComponent item={item}/>
              )}
              keyExtractor={(item) => (item.message_id || item.id).toString()}
            />
            </>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}
