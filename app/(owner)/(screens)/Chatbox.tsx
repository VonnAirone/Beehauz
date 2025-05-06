import { useAuth } from "@/utils/AuthProvider";
import { supabase } from "@/utils/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, TextInput, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import LoadingComponent from "@/app/components/LoadingComponent";
import MessageComponent from "../../(tenant)/(aux)/MessageChip";
import { fetchRoomID } from "../../(tenant)/(aux)/messagecomponent";
import { getUsername } from "../../(tenant)/(aux)/usercomponent";

const Chatbox = () => {
  const roomData = useLocalSearchParams();
  const [roomID, setRoomID] = useState("")
  const session = useAuth();
  const userID = session?.session?.user?.id;
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("")
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const sendMessage = async () => {
    const newMessage = {
      room_id: roomID,
      sender_id: userID,
      receiver_id: roomData.receiver_id,
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

  const handleMessageLongPress = (message) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };


  const deleteSelectedMessage = async () => {
    const { error } = await supabase.from('messages').delete().eq('message_id', selectedMessage.message_id);
    if (error) {
      console.error('Error deleting message:', error);
    } else {
      
      setChatMessages(chatMessages.filter((message) => message.message_id !== selectedMessage.message_id));
      setModalVisible(false);
    }
  };



  const fetchChatMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomID)
      .order('created_at');
    if (error) {
      console.error('Error fetching chat messages:', error);
    } else {
      setChatMessages(data);
      setLoading(false);
    }
  };

  const messages = supabase.channel('custom-insert-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        console.log("Change received!", payload.new)
        fetchChatMessages()
      }
    )
    .subscribe()


    useEffect(() => {
      async function fetchData() {
        await getUsername(roomData?.receiver_id, setUsername)
        await fetchRoomID(userID, roomData?.receiver_id, setRoomID);
        if (roomID) {
          await fetchChatMessages();
        }
      }
      fetchData();
      return () => {
        messages.unsubscribe();
      };
    }, [roomID]);


  return (
    <SafeAreaView className="flex-1">
      {loading ?
      (
        <LoadingComponent/>
      ) : (
        <View className="flex-1 p-5">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20}/>
          </Pressable>
          <Pressable 
          onPress={() => router.back()}
          // onPress={() => router.push({pathname: "/OwnerProfile", params: {owner_id: roomData?.receiver_id}})}
          >
            <Text className="ml-5 font-semibold text-lg">{username}</Text>
          </Pressable>
          
        </View>
        <View className="mt-2">
          <FlatList
            showsVerticalScrollIndicator={false}
            data={chatMessages}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={{
                marginTop: index === 0 ? 16 : 0,
                marginBottom: index === chatMessages.length - 1 ? 60 : 0,
              }} onLongPress={() => handleMessageLongPress(item)}>
                <MessageComponent item={item} user={userID}/>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) =>
              item.message_id ? item.message_id.toString() : index.toString()
            }
            ListEmptyComponent={null}
          />
        </View>
        
        
        <View className="flex-row items-center justify-between absolute bottom-0 p-4 w-screen">
          <TextInput
            className="w-64 bg-white py-2 px-5 rounded-md border border-gray-200"
            placeholder="Enter your message"
            value={message}
            onChangeText={(value) => setMessage(value)}
          />
          <Pressable
          android_ripple={{color: "white"}} 
          onPress={sendMessage}
          style={{backgroundColor: "#444"}}
          className="flex-row items-center p-3 rounded-md">
            <View className="mx-2">
              <Text className="text-white">Send</Text>
            </View>
            <Ionicons name="send" size={15} color={"white"}/>
          </Pressable>
        </View>

          {/* <Modal visible={isModalVisible} onDismiss={hideModal}>
            <View>
              <Text>Do you want to delete this message?</Text>
              <Pressable onPress={deleteSelectedMessage} >
                <Text>Unsend</Text>
                </Pressable>
              <Pressable onPress={() => setModalVisible(false)} >
                <Text>Remove</Text>
              </Pressable>
            </View>
          </Modal> */}
        </View>
      )}
      
    </SafeAreaView>
  );
};

export default Chatbox;
