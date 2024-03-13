import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/utils/AuthProvider';
import { fetchPropertyData, getProfile } from '@/api/DataFetching';
import { fetchUserMessages } from '../(aux)/messagecomponent';
import { subscribeToRealTimeMessages } from '../(aux)/messagecomponent';
import { router } from 'expo-router';

interface DataItem {
  message_id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  message_content: string;
  time_sent: string;
  sender_info: {
    senderId: string;
    name: string;
    propertyName: string;
  };
}

export default function Messages() {
  const session = useAuth();
  const userID = session?.session.user.id;
  const [messages, setMessages] = useState<DataItem[]>([]);
  const [senderData, setSenderData] = useState<Record<string, { name: string; propertyName: string; gender: string; }>>({});
  const [loading, setLoading] = useState(false)

  const formatTime = (time: string) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${suffix}`;
  };


  const renderItem = ({ item, index }: { item: DataItem; index: number }) => {
    const formattedTime = item.time_sent ? formatTime(item.time_sent) : '';
    const isCurrentUser = item.sender_id === userID;

    return (
      <View>
      {loading ? (
        <View className='flex-row py-4 items-center w-80'>
          <View className='rounded-full bg-gray-300 w-14 h-14 mr-5'/>
           <View className='flex-grow'>
              <View className='flex-row items-center gap-x-2'>
                <View className='bg-gray-300 h-3 w-28 rounded-md'/>
                <Ionicons name='ellipse' size={4} />
                <View className='bg-gray-300 h-3 w-16 rounded-md'/>
              </View>

              <View className='flex-row justify-between items-center mt-2'>
                <View className='bg-gray-300 h-4 w-40 rounded-md'/>
                <View className='bg-gray-300 h-2 w-10 rounded-md'/>
              </View>
          </View>
        </View>
      ) : (
        <Pressable onPress={() => 
          router.push({
            pathname: "/Chatbox", 
            params: { room_id: item.room_id, sender_id: item.sender_id, receiver_id: item.receiver_id }
          })
        }> 
          <View className='flex-row items-center py-4 w-80'>
          <View className='rounded-full object-contain w-14 h-14 bg-yellow mr-5'>
                <Image className='w-full h-full' source={require("@/assets/images/icon.png")} />
              </View>
            <View className='flex-grow'>
              <View className='flex-row items-center gap-x-1'>
              <Text className='font-semibold text-base'>
                {isCurrentUser ? senderData[item.receiver_id]?.name : senderData[item.sender_id]?.name}
              </Text>
              {!isCurrentUser && (
                <View className='flex-row items-center gap-x-1'>
                  <Ionicons name='ellipse' size={4} />
                  <Text>{senderData[item.sender_id]?.propertyName}</Text>
                </View>
              )}
  
              </View>
    
              <View className='flex-row justify-between mt-2'>
                <Text>
                  {isCurrentUser ? "You" : senderData[item.sender_id]?.gender === "Male" ? "Him" : "Her"}
                  : {item.message_content}</Text>
                <Text>{formattedTime}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      )}
      </View>
    );
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (session) {
          const fetchedMessages = await fetchUserMessages(userID);
          setMessages(fetchedMessages);
          const senderIds = fetchedMessages.map((message) => message.sender_id);
          const senderData = await fetchSenderData(senderIds);
          setSenderData(senderData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
    setLoading(false)
    const unsubscribe = subscribeToRealTimeMessages(userID, handleNewMessage);
    return () => {
      unsubscribe();
    };
  });
  

  async function handleNewMessage(newMessage: DataItem) {
    if ((newMessage.sender_id === userID && newMessage.receiver_id === userID) || (newMessage.sender_id === userID && newMessage.receiver_id === userID)) {
      const updatedMessage = await fetchUserMessages(userID);
      const latestMessage = updatedMessage.find((message) => message.message_id === newMessage.message_id);
      if (latestMessage) {
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.message_id === latestMessage.message_id ? { ...message, message_content: latestMessage.message_content, time_sent: latestMessage.time_sent } : message
          )
        );
      }
    }
  }
  
  
  

  async function fetchSenderData(senderIds) {
    const usernamePromises = senderIds.map(async (senderId) => {
      const profileData = await getProfile(senderId);
      let name = profileData?.name || '';
      let gender = profileData?.gender
      let propertyName = '';

      if (profileData && profileData.user_type === 'Owner') {
        const propertyData = await fetchPropertyData(senderId);
        propertyName = propertyData?.name || '';
      }

      return { gender, name, propertyName };
    });

    const resolvedUsernames = await Promise.all(usernamePromises);
    const senderData = {};

    resolvedUsernames.forEach((user, index) => {
      senderData[senderIds[index]] = user;
    });

    return senderData;
  }

  return (
    <SafeAreaView className='flex-1 items-center'>
      <View className='flex-row mt-5 justify-between py-5 w-80'>
        <View>
          <Text className='font-semibold text-2xl'>Messages</Text>
        </View>

        <View>
          <Ionicons name='create' size={28} color={'#ffa233'} />
        </View>
      </View>

      <View>
        <View className='flex-row items-center border border-gray-300 rounded-md p-2 w-80 backdrop-blur-3xl bg-white/30'>
          <View className='mx-2'>
            <Ionicons name='search' size={20} />
          </View>
          <TextInput editable={false} placeholder='Search for a place' />
        </View>
      </View>

      <FlatList data={messages} renderItem={renderItem} />


    </SafeAreaView>
  );
}