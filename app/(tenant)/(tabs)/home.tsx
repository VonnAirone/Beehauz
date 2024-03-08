import { fetchPopularNowList } from '@/api/DataFetching';
import { downloadImage, loadImages } from '@/api/ImageFetching';
import { NearbyMe, PopularNow, Services } from '@/app/(tenant)/(aux)/homecomponents';
import Logo from '@/components/logo';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { memo, useEffect, useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, ActivityIndicator, Pressable } from 'react-native'; // Rename the component to avoid conflict
import { SafeAreaView } from 'react-native-safe-area-context';

type DataItem = {
  property_id: string;
  property_name: string;
  price: string;
  view_count: number;
};

const services = [
  {
    id: 1,
    name: 'Laundry Shops',
    image: '',
  },
  {
    id: 2,
    name: 'Haircut Salons',
    image: '',
  },
  {
    id: 3,
    name: 'School Supplies',
    image: '',
  },
  {
    id: 4,
    name: 'Refilling Stations',
    image: '',
  }, 
  {
    id: 5,
    name: 'Coffee Shops',
    image: ''
  }
];


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
      <View className='mt-10'>
        <View className='items-start ml-5'>
          <Logo/>
        </View>


        {/* SEARCHBAR */}
        <View className='flex-row items-center justify-center ml-4'>
          <Pressable onPress={() => router.push("/Searchpage")}>    
            <View className='flex-row items-center border border-gray-300 rounded-md p-2 w-80 backdrop-blur-3xl bg-white/30'>
              <View className='mx-2'>
                <Ionicons name='search' size={20}/>
              </View>
              <TextInput 
              editable={false} 
              placeholder='Search for a place'/>
            </View>
          </Pressable>
          <View className='mx-3'>
            <Ionicons name='notifications' size={28}/>
          </View>
        </View>

        {/* POPULAR NOW */}
        <View className='mt-10'>
          <Text className='font-semibold text-xl ml-8'>POPULAR NOW</Text>
          <PopularNow 
          data={PopularList} 
          //this is where you put the router.push()
          />
        </View>

        <View className='mt-10'>
          <Text className='font-semibold text-xl ml-8'>NEARBY ME</Text>
          <NearbyMe data={PopularList}/>
        </View>

        <View className='mt-10'>
          <Text className='font-semibold text-xl ml-8'>SERVICES</Text>
          <Services data={services}/>
        </View>


      </View>
    </> 
    )}
    </ScrollView>
  </SafeAreaView> 

  );
}
