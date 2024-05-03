  import React, { useEffect, useState } from "react";
  import { View, TouchableOpacity, StyleSheet, Pressable, Text } from "react-native";
  import { supabase } from "@/utils/supabase";
  import { useAuth } from "@/utils/AuthProvider";
  import { router } from "expo-router";
import { fetchLastMessage, subscribeToRealTimeMessages } from "@/app/(tenant)/(aux)/messagecomponent";
import { getUsername } from "@/app/(tenant)/(aux)/usercomponent";
import AvatarImage from "@/app/(tenant)/(aux)/avatar";

  const ChatComponent = ({ item }) => {
    const user = useAuth()?.session?.user;
    const [lastMessage, setLastMessage] = useState(null);
    const [username, setUsername] = useState()
    const [receiverID, setReceiverID] = useState()
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function fetchData() {
        try {
          setLoading(true)
          await fetchMessages();
          await fetchUsers();
        } catch (error) {
          console.log("Error fetching messages: ", error.message)
        } finally {
          setLoading(false)
        }
      
      }
      fetchData()

      const unsubscribe = subscribeToRealTimeMessages(item.room_id, (newMessage) => {
        setLastMessage(newMessage);
      });

      return () => {
        unsubscribe();
      };
    }, [item.room_id]);

    const fetchMessages = async () => {
      const message = await fetchLastMessage(item.room_id);
      setLastMessage(message);
    };

    async function fetchUsers() {
      try {
        const { data, error} = await supabase.from('chat_rooms').select("*").eq('room_id', item?.room_id)
    
        setReceiverID(data[0]?.users[0])
        await getUsername(data[0]?.users[0], setUsername) 
        

      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    }
    
    const displayTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    };

    return (
      <View>
      {loading ? (
        <View className="p-2 rounded-md flex-row items-center gap-x-2">
          <View className="rounded-full h-14 w-14 bg-gray-200"/>

          <View>
            <View className="h-3 w-28 bg-gray-200 rounded-sm"/>
            <View className="mt-2 h-3 w-32 bg-gray-200 rounded-sm"/>
          </View>
        </View>
      ) : (
        <Pressable onPress={() => router.push({
          pathname: "/(owner)/(screens)/Chatbox", 
          params: { sender_id: user?.id, receiver_id: receiverID, username: username }
        })}>
          <View className="p-2 rounded-md flex-row items-center gap-x-2">
            <View className="h-14 w-14 bg-white overflow-hidden rounded-full">
              <AvatarImage userID={receiverID}/>
            </View>
    
            <View>
              <Text className="font-semibold">{username}</Text>
              <View className="flex-row items-center gap-x-2">
                <Text>{lastMessage ? `${lastMessage?.sender_id === user?.id ? "You: " : ""}${lastMessage?.message_content}` : ''}</Text>
                <Text>{lastMessage ? displayTime(lastMessage?.created_at) : "now"}</Text>
              </View>
            
            </View>
          </View>
        </Pressable>
      )}
      </View>
    
    );
  };

  export default ChatComponent;
