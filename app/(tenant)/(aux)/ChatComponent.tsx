import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Pressable, Text } from "react-native";
import { fetchLastMessage, subscribeToRealTimeMessages } from "./messagecomponent";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/utils/AuthProvider";
import { getUsername } from "./usercomponent";
import AvatarImage from "./avatar";
import { router } from "expo-router";

const ChatComponent = ({ item }) => {
  const user = useAuth()?.session.user;
  const [lastMessage, setLastMessage] = useState(null);
  const [username, setUsername] = useState()
  const [receiverID, setReceiverID] = useState()
  const [loading, setLoadingState] = useState(true);

  useEffect(() => {
    async function fetchData() {
      fetchMessages();
      fetchUsers();
      setLoadingState(false);
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
  
      setReceiverID(data[0]?.users[1])
      await getUsername(data[0]?.users[1], setUsername) 
      

    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  }
  
  const displayTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <Pressable onPress={() => router.push({
      pathname: "/Chatbox", 
      params: { sender_id: user?.id, receiver_id: receiverID, username }
    })}>
      <View className="p-2 rounded-md flex-row items-center gap-x-2">
        <View className="h-14 w-14">
          <AvatarImage userID={receiverID}/>
        </View>

        <View>
          <Text className="font-semibold">{username}</Text>
          <View className="flex-row items-center gap-x-2">
            <Text>{lastMessage ? `${lastMessage?.sender_id === user?.id ? "You: " : ""}${lastMessage.message_content}` : "Tap to start chatting"}</Text>
            <Text>{lastMessage ? displayTime(lastMessage.created_at) : "now"}</Text>
          </View>
        
        </View>
      </View>
    </Pressable>
  );
};

export default ChatComponent;
