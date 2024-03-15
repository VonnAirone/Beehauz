import React, { useEffect, useState } from 'react';
import { View, Text, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../(aux)/searchcomponents';
import { fetchPopularNowList, fetchPropertyListData } from '@/api/DataFetching';
import { PopularNow, PropertyList } from '../(aux)/homecomponents';
import { handlePropertyClick } from '@/api/ViewCount';
import { router } from 'expo-router';
import debounce from 'lodash.debounce';
import { Ionicons } from '@expo/vector-icons';

type DataItem = {
    property_id: string;
    name: string;
    price: string;
    view_count: number;
};

export default function Searchpage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [popularSearches, setPopularSearches] = useState([]);
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
[]
    const handleOnChangeText = (text: string) => {
        setSearchQuery(text);
        debouncedSearch(text);
    };

    const clearInput = () => {
        setSearchQuery('');
        setSearchResults([]);
        Keyboard.dismiss();
    };

    const debouncedSearch = debounce(async (query: string) => {
        try {
            if (query.trim() === '') {
                setSearchResults([]);
            } else {
                const fetchedData = await fetchPropertyListData();
                const filtered = fetchedData.filter((item) =>
                    item.name.toLowerCase().includes(query.toLowerCase())
                );
                setSearchResults(filtered);
            }
        } catch (error) {
            console.error('Error searching:', error);
        }
    }, 300);


    return (
        <SafeAreaView className='flex-1 bg-white'>
            <TopBar searchQuery={searchQuery} handleOnChangeText={handleOnChangeText} clearInput={clearInput} />
            <View className='mt-5'>
                  <View>
                    <View>
                        <View>
                            <Text className='pl-5'>Search Results</Text>
                        </View>
                        <View>
                            <Ionicons name='filter-outline'/>
                        </View>
                    </View>
                    
                    {searchResults.length === 0 ? (
                    <View className='mt-3 h-40 items-center justify-center'>
                        <Text>No Search Results</Text>
                    </View>
                    ):(
                      <View>
                        <PropertyList data={searchResults}/>
                      </View>
                    )} 
                  </View>

                  <View className='pl-5 py-2'>
                    <Text className='text-lg font-semibold'>Recommendations</Text>
                  </View>
                  <View>
                        <PopularNow data={popularSearches}/>
                 </View>
            </View>
        </SafeAreaView>
    );
}
