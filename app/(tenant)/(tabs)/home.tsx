import { fetchPopularNowList } from '@/api/DataFetching';
import { PopularNow, PropertyList, Services } from '@/app/(tenant)/(aux)/homecomponents';
import Logo from '@/components/logo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, TouchableOpacity } from 'react-native'; // Rename the component to avoid conflict
import { SafeAreaView } from 'react-native-safe-area-context';

type DataItem = {
  property_id: string;
  name: string;
  price: string;
  view_count: number;
  address: string;
};

export default function HomePage() {
  const [PopularList, setPopularList] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const PopularList = await fetchPopularNowList();
        setPopularList(PopularList);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <SafeAreaView className="flex-1 items-center">
      <ScrollView className='flex-1'>
    { loading ? (
      <View></View>
    ) : (  
    <> 
      <View className='mt-5'>
        <View className='items-start ml-5'>
          <Logo/>
        </View>


        {/* SEARCHBAR */}
        <View className='flex-row items-center justify-start ml-8'>
          <Pressable onPress={() => router.push("/Searchpage")}>    
            <View className='flex-row items-center border border-gray-300 rounded-md p-2 w-72 backdrop-blur-3xl bg-white'>
              <View className='mx-2'>
                <Ionicons name='search' size={20}/>
              </View>
              <TextInput 
              editable={false} 
              placeholder='Search for a place'/>
            </View>
          </Pressable>
          <View className='mx-3'>
            <TouchableOpacity>
              <Ionicons name='notifications' size={28} color={"#ffa233"}/>
            </TouchableOpacity>
            
          </View>
        </View>

        <View className='mt-10'>
          <Text className='font-semibold text-xl ml-8'>SERVICES</Text>
          <Services/>
        </View>

        <View className='mt-5'>
          <Text className='font-semibold text-xl ml-8'>POPULAR NOW</Text>
          <PopularNow 
          data={PopularList} 
          //this is where you put the router.push()
          />
        </View>

        <View className='mt-5'>
          <Text className='font-semibold text-xl ml-8'>NEARBY ME</Text>
          <PropertyList data={PopularList}/>
        </View>

      </View>
    </> 
    )}
    </ScrollView>
  </SafeAreaView> 

  );
}
