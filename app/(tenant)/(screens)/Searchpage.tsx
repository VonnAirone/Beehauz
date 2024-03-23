import React, { useEffect, useState } from 'react';
import { View, Text, Keyboard, TextInput, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPopularNowList, fetchPropertyListData } from '@/api/DataFetching';
import { PopularNow, PropertyList } from '../(aux)/homecomponents';
import debounce from 'lodash.debounce';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/back-button';
import { LocationData } from '@/api/Properties';
import { getPermissions } from '@/api/Location';
import { Filters, fetchAverageProperties, fetchCheapProperties, fetchNearbySAC, fetchNearbyUA, fetchPropertiesByTotalRating, locationsData, pricesData, ratingsData } from '../(aux)/Filters';

export default function Searchpage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [popularSearches, setPopularSearches] = useState([]);
    const [nearbyUA, setNearbyUA] = useState([])
    const [nearbySAC, setNearbySAC] = useState([])
    const [cheapProperties, setCheapProperties] = useState([]);
    const [averageProperties, setAverageProperties] = useState([]);
    const [expensiveProperties, setExpensiveProperties] = useState([]);
    
    const [location, setLocation] = useState<LocationData | null>(null);

    const [selectedFilter, setSelectedFilter] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const PopularList = await fetchPopularNowList();
                setPopularSearches(PopularList);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
        fetchCurrentLocation();
        fetchNearbyUA(setNearbyUA);
        fetchNearbySAC(setNearbySAC);
        fetchCheapProperties(setCheapProperties);
        // fetchAverageProperties(undefined)
        fetchPropertiesByTotalRating();
    }, []);

    async function fetchCurrentLocation() {
      try {
        const data = await getPermissions();
        setLocation(data)
      } catch (error) {
        console.log("Error fetching user location: ", error.message)
      }
    }
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

    

    const handleItemPress = (filter) => {
      setSelectedFilter(selectedFilter === filter ? null : filter);
    };

    const handleLocationPress = (locationId) => {
      setSelectedLocation(selectedLocation === locationId ? null : locationId);
    };

    const handlePricePress = (price) => {
      if (selectedPrice === price) {
        setSelectedPrice(null);
        setCheapProperties([]);
      } else {
        setSelectedPrice(price);
        fetchCheapProperties(setCheapProperties);
      }
    };

    const handleRatingPress = (rating) => {
      setSelectedRating(selectedRating === rating ? null : rating);
    };

    return (
        <SafeAreaView className='flex-1'>
          <View className='flex-row items-center p-5'>
            <View className='mr-4'>
              <BackButton/>
            </View>
            
            <View className='flex-row items-center justify-between border border-gray-300 grow rounded-md mx-auto p-2'>
              <View className='flex-row items-center'>
                <View className='mx-2'>
                  <Ionicons name='search' size={20} />
                </View>
                <TextInput
                  value={searchQuery}
                  onChangeText={handleOnChangeText}
                  placeholder='Search for a place' />
              </View>
              <View>
                <Ionicons
                  onPress={clearInput}
                  name='close-outline' size={15} />
              </View>
            </View>
          </View>

          <View className='flex-row px-5 gap-x-2'>
            <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal
              data={Filters}
              renderItem={({ item, index }) => (
                <View key={index}>
                  <Pressable
                    className={`p-2 mr-2 w-20 rounded-md border border-gray-200 ${selectedFilter === item.filter ? 'bg-yellow' : ''}`}
                    onPress={() => handleItemPress(item.filter)}
                  >
                    <Text className='text-center'>{item.filter}</Text>
                  </Pressable>
                </View>
              )}
            />
          </View>
          
          <View className='px-5'>
            {selectedFilter === 'Location' && (
              <FlatList
                horizontal
                data={locationsData}
                renderItem={({ item, index }) => (
                  <View key={index} className='mt-2'>
                    <Pressable
                    className={`p-2 mr-2 rounded-md border border-gray-200 ${selectedLocation === item.name ? 'bg-yellow' : ''}`} 
                    onPress={() => handleLocationPress(item.name)}>
                      <Text>{item.name}</Text>
                    </Pressable>
                  </View>
                )}
              />
            )}

            {selectedFilter === 'Price' && (
              <FlatList
                horizontal
                data={pricesData}
                renderItem={({ item, index }) => (
                  <View key={index} className='mt-2'>
                    <Pressable 
                     className={`p-2 mr-2 rounded-md border border-gray-200 ${selectedPrice === item.price ? 'bg-yellow' : ''}`} 
                     onPress={() => handlePricePress(item.price)}>
                      <Text>{item.price}</Text>
                    </Pressable>
                  </View>
                )}
              />
            )}

            {selectedFilter === 'Rating' && (
              <FlatList
                horizontal
                data={ratingsData}
                renderItem={({ item, index }) => (
                  <View key={index} className='mt-2'>
                    <Pressable 
                    className={`p-2 mr-2 rounded-md border border-gray-200 ${selectedRating === item.rating ? 'bg-yellow' : ''}`} 
                     onPress={() => handleRatingPress(item.rating)}>
                      <Text>{item.rating} - star</Text>
                    </Pressable>
                  </View>
                )}
              />
            )}

          </View>
            <View className='px-10 mt-4'>
              <View className='h-80'>
                <View className='flex-row items-center justify-between'>
                  <Text>Search Results</Text>
                  <Ionicons name='filter-outline'/>
                </View>
                
                <View className='mt-5'>
                {selectedLocation && selectedLocation === 'UA Main Campus' ? (
                  nearbyUA.length === 0 ? (
                      <View className='bg-slate-300 grow'>
                          <Text>No Results</Text>
                      </View>
                  ) : (
                      <PropertyList data={nearbyUA}/>
                  )
                ) : selectedLocation && selectedLocation === 'SAC' ? (
                  nearbySAC.length === 0 ? (
                      <View>
                          <Text>No Results</Text>
                      </View>
                  ) : (
                      <PropertyList data={nearbySAC}/>
                  )
                )  : searchResults.length === 0 ? (
                  <View>
                      {/* <Text>No Results</Text> */}
                  </View>
              ) : (
                  <PropertyList data={searchResults}/>
              )}



                </View>

                
                {/* {searchResults.length !== 0 && (
                  <View className='mt-5'>
                    <PropertyList data={searchResults}/>
                  </View>
                )}  */}

              </View>

              <View>
                <Text className='text-lg font-semibold'>Recommendations</Text>
                <View className='mt-2'>
                  <PopularNow data={popularSearches}/>
                </View>
              </View>
              
            </View>
        </SafeAreaView>
    );
}
