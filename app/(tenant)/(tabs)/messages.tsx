import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Text, FlatList, TextInput, View, Pressable } from "react-native";
import { fetchUserMessages, subscribeToRealTimeMessages } from "../(aux)/messagecomponent";
import { useAuth } from "@/utils/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatComponent from "../(aux)/ChatComponent";
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { OwnerData, PropertyData } from "@/api/Properties";
import { supabase } from "@/utils/supabase";
import { ContactOwner } from "@/api/ContactOwner";
import { getProfile } from "@/api/DataFetching";

export default function Messages() {
  const session = useAuth();
  const userID = session?.session.user.id;
  const [userMessages, setUserMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [owners, setOwners] = useState([])
  const [ownerProfiles, setOwnerProfiles] = useState<OwnerData[] | null>(null);
  const [ownerProperty, setOwnerProperty] = useState<PropertyData[] | null>(null)


  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);


  async function fetchOwners() {
    try {
      const { data, error } = await supabase
      .from('owners')
      .select("*")
      .not('property_id', 'is', null);  

      if (!error) {
        const ownerProfiles = await Promise.all(data.map(async (owner) => {
          const owners = await getProfile(owner?.owner_id);
          return owners;
        }))
        setOwnerProfiles(ownerProfiles)

        const ownersWithProperties = await Promise.all(data.map(async (owner) => {
          const properties = await fetchOwnerProperty(owner?.owner_id);
          return { ...owner, properties };
        }));
        
        const allProperties = ownersWithProperties.reduce((acc, owner) => {
          return [...acc, ...owner.properties];
        }, []);
        setOwnerProperty(allProperties);
      }        
    } catch (error) {
      console.error("Error fetching owners:", error.message);
      setOwners([]);
    }
  }
  
  async function fetchOwnerProperty(ownerId) {
    try {
      const { data, error } = await supabase
        .from('property')
        .select("name")
        .eq("owner_id", ownerId);
        
      if (!error) {
        return data;
      }
    } catch (error) {
      console.error("Error fetching owner properties:", error.message);
      return [];
    }
  }
  
  useEffect(() => {
    async function fetchData() {
      
      const messages = await fetchUserMessages(userID);
      setUserMessages(messages);
      fetchOwners();
      setLoading(false
      );
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
    <BottomSheetModalProvider>
    <SafeAreaView className="flex-1">
      <View className="p-5">
        <View className='flex-row items-center justify-between mb-4'>
          <View>
            <Text className='text-xl font-semibold'>Messages</Text>
          </View>

          <View className="overflow-hidden rounded-full">
            <Pressable 
            style={{backgroundColor: "#444"}}
            onPress={handlePresentModalPress}
            android_ripple={{color: "white"}}
            className='p-3 rounded-full'>
              <Ionicons name='paper-plane' color={"white"} size={20}/>
            </Pressable>
          </View>
         
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

      <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
        >
          <BottomSheetView>
            <View className="p-5">
              <Text className="font-semibold">Chat Property Owners</Text>

              <FlatList
              data={ownerProfiles}
              renderItem={({item, index}) => (
                <View className="rounded-md overflow-hidden mt-4">
                  <Pressable
                  onPress={() => ContactOwner(session?.session?.user.id, item.id)} 
                  android_ripple={{color: "#444"}}
                  className="p-3 bg-gray-100 flex-row items-center justify-between rounded-md">
                    <View className="rounded-md">
                      <Text className="font-semibold">{item.first_name} {item.last_name}</Text>
                      <Text className="text-xs">Owner of {ownerProperty[index]?.name}</Text> 
                    </View>

                    <View>
                      <Ionicons name="chevron-forward" size={20}/>
                    </View>
                  </Pressable> 
                </View>
              )}/>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
    </SafeAreaView>
  </BottomSheetModalProvider>
  );
}
