import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Keyboard, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../(aux)/searchcomponents';
import { fetchPopularNowList, fetchPropertyListData } from '@/api/DataFetching';
import { PopularNow, SingleImageDisplay } from '../(aux)/homecomponents';
import { handlePropertyClick } from '@/api/ViewCount';
import { router } from 'expo-router';
import debounce from 'lodash.debounce';
import { Ionicons } from '@expo/vector-icons';

type DataItem = {
    property_id: string;
    property_name: string;
    price: string;
    view_count: number;
};

export default function Searchpage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<DataItem[]>([]);
    const [popularSearches, setPopularSearches] = useState([]);
    const [text, setText] = useState("Popular Searches");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const PopularList = await fetchPopularNowList();
                setPopularSearches(PopularList);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleCardPress = async (propertyID: string) => {
        try {
            await handlePropertyClick(propertyID);
        } catch (error) {
            console.error('Error handling property click:', error);
        }
        router.push({ pathname: "/(tenant)/(screens)/BHDetails", params: { propertyID: propertyID } });
    };

    const handleOnChangeText = (text: string) => {
        setSearchQuery(text);
        debouncedSearch(text);
        setText("Search Results");
    };

    const clearInput = () => {
        setSearchQuery('');
        setSearchResults([]);
        Keyboard.dismiss();
        setText("Popular Searches");
    };

    const debouncedSearch = debounce(async (query: string) => {
        try {
            const fetchedData = await fetchPropertyListData();
            const filtered = fetchedData.filter((item) =>
                item.property_name.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
        } catch (error) {
            console.error('Error searching:', error);
        }
    }, 300);

    const skeletonComponent = ({ index }: { index: number }) => (
        <View className='flex-row mt-3'>
            <View className='w-24 h-24 bg-gray-200 rounded-md'></View>
            <View className='px-2 justify-evenly'>
                <View>
                    <View className='bg-gray-200 h-4 w-48 rounded-sm'/>
                    <View className='bg-gray-200 h-2 mt-1 w-42 rounded-sm'/>
                </View>
                <View className=' bg-gray-200 w-24 h-8 p-1 rounded-md'/>
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: DataItem }) => (
        <View className='overflow-hidden mt-3'>
            <Pressable onPress={() => handleCardPress(item.property_id)}>
                <View className='flex-row'>
                    <View className='w-24 h-24'>
                        <SingleImageDisplay propertyID={item.property_id}/>
                    </View>
                    <View className='px-2 justify-evenly'>
                        <View>
                            <Text className='font-semibold text-xl'>{item.property_name}</Text>
                            <View className='flex-row items-center gap-x-1'>
                                <Ionicons name='location-outline'/>
                                <Text>Location of the boarding house</Text>
                            </View>
                        </View>
                        <View className='border border-yellow w-24 p-1 rounded-md'>
                            <Text className='font-semibold text-xl text-center'>Php {item.price}</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </View>
    );

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <TopBar searchQuery={searchQuery} handleOnChangeText={handleOnChangeText} clearInput={clearInput} />
            <View className='p-5'>
                {loading ? (
                  <View>
                    <Text>{text}</Text>
                    <FlatList
                        data={[1, 2, 3]} // Dummy data to render skeletons
                        keyExtractor={(item, index) => index.toString()}
                        initialNumToRender={3}
                        renderItem={skeletonComponent}
                        showsVerticalScrollIndicator={false}
                    />
                  </View>
                ) : (
                  <View>
                    <Text>{text}</Text>
                    {searchResults.length === 0 ? (
                    <View className='mt-3'>
                      <FlatList
                          data={popularSearches}
                          keyExtractor={(item) => item.property_id}
                          renderItem={renderItem}
                          showsVerticalScrollIndicator={false}
                      />
                    </View>):(
                      <View>
                         <FlatList
                          data={searchResults}
                          keyExtractor={(item) => item.property_id}
                          renderItem={renderItem}
                          showsVerticalScrollIndicator={false}
                        />
                      </View>
                    )}
                    
                  </View>
                )}
            </View>
        </SafeAreaView>
    );
}
