import React, { useState, useEffect } from "react";
import { View, FlatList, ActivityIndicator, TouchableOpacity, Text, TextInput, Button, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/utils/AuthProvider";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import MessageComponent from "../(aux)/MessageChip";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUsername } from "../(aux)/usercomponent";
import BackButton from "@/components/back-button";

const Chatbox = () => {
  const roomData = useLocalSearchParams();
  const [sender, setSender] = useState('')
  const session = useAuth();
  const userID = session?.session.user.id;
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    const newMessage = {
      room_id: roomData.room_id,
      sender_id: userID,
      receiver_id: roomData.sender_id,
      message_content: message
    };

    const { data, error } = await supabase.from('messages').insert([newMessage]);
    if (error) {
      console.error('Error sending message:', error);
    } else {
      setChatMessages([...chatMessages, newMessage]);
      setMessage('');
    }
  };

  useEffect(() => {
    const fetchChatMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomData.room_id)
        .order('created_at');
      if (error) {
        console.error('Error fetching chat messages:', error);
      } else {
        setChatMessages(data);
        setLoading(false);
      }
    };

    getUsername(roomData.sender_id, setSender)
    fetchChatMessages();
  }, [roomData.room_id]);

  return (
    <SafeAreaView className="flex-1">
      <BackButton/>


      <View className="px-5 mt-3 flex-1">
        {loading ? (
          <View>
            <ActivityIndicator/>
          </View>
        ) : (
          
          <View>
            <View className="items-center">
              <Text className="font-semibold text-xl">{sender}</Text>
              <Text className="text-sm font-medium">Owner of Villa Villasor</Text>
              <Pressable className="flex-row gap-x items-center mt-3">
                <Text className="text-yellow">View profile</Text>
                <Ionicons name="chevron-forward-outline" color={"#ffa233"} />
              </Pressable>
            </View>

            <View>
              <FlatList
              showsVerticalScrollIndicator={false}
              data={chatMessages}
              renderItem={({ item }) => (
                <MessageComponent item={item} user={userID}/>
              )}
              keyExtractor={(item, index) =>
                item.message_id ? item.message_id.toString() : index.toString()
              }              
            />
            </View>
        </View>
        )}

      </View>
      

      <View className="flex-row items-center p-2 bottom-0 relative bg-white">
        <View className="p-2">
            <Ionicons name="camera-outline" size={30} color={'#ffa233'} />
        </View>
        <TextInput
        className="flex-grow rounded-md p-2 bg-white border-yellow border"
          value={message}
          onChangeText={(value) => setMessage(value)}
        />
        <View className="p-2">
          <Pressable onPress={sendMessage}>
            <Ionicons name="send-outline" size={30} color={"#ffa233"}/>
          </Pressable>
          
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Chatbox;
