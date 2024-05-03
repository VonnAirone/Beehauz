import React, { useEffect, useState } from 'react';
import { View, Text, Keyboard, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPopularNowList, fetchPropertyListData } from '@/api/DataFetching';
import { PopularNow, PropertyList } from '../(aux)/homecomponents';
import debounce from 'lodash.debounce';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/back-button';
import { LocationData } from '@/api/Properties';
import { getPermissions } from '@/api/Location';
import { fetchNearbySAC, fetchNearbyUA, locationsData, pricesData, ratingsData, fetchPropertiesByAverageRating, fetchPropertiesByPriceRange } from '../(aux)/Filters';
import { Dropdown } from 'react-native-element-dropdown';

export default function Searchpage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [popularSearches, setPopularSearches] = useState([]);
    const [nearbyUA, setNearbyUA] = useState([])
    const [nearbySAC, setNearbySAC] = useState([])
    const [propertyByRating, setPropertyByRating] = useState([]) 
    const [propertyByPrice, setPropertyByPrice] = useState([]) 
    const [location, setLocation] = useState<LocationData | null>(null);

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
                    item.name.toLowerCase().includes(query.toLowerCase()) ||
                    item.address.toLowerCase().includes(query.toLowerCase())
                );
                console.log(filtered)
                setSearchResults(filtered);
            }
        } catch (error) {
            console.error('Error searching:', error);
        }
    }, 300);
    

    const handleLocationPress = (locationId) => {
      setSelectedLocation(selectedLocation === locationId ? null : locationId);
    };

    const parsePriceRange = (priceString) => {
      const [minPrice, maxPrice] = priceString.split(' - ');
      return { minPrice: parseInt(minPrice), maxPrice: parseInt(maxPrice) };
    };

    const handlePricePress = async (price) => {
      setSelectedPrice(selectedPrice === price ? null : price);
      const { minPrice, maxPrice } = parsePriceRange(price);
    
      try {
         const properties = await fetchPropertiesByPriceRange(minPrice, maxPrice);
        setPropertyByPrice(properties)
      } catch (error) {
        console.error('Error fetching properties by price range:', error.message);
      }
    };
    
    const handleRatingPress = async (rating) => {
      const properties = await fetchPropertiesByAverageRating(parseInt(rating))
      setPropertyByRating(properties)
      setSelectedRating(selectedRating === rating ? null : rating);
    };

    const handleResetFilters = () => {
      setSelectedLocation(null);
      setSelectedPrice(null);
      setSelectedRating(null);
    };

    return (
        <SafeAreaView className='flex-1'>
          <View className='p-5'>
          <View className='flex-row items-center'>
            <View className='mr-4'>
              <BackButton/>
            </View>
            
            <View className='flex-row items-center justify-between bg-gray-200 border-50 grow rounded-md mx-auto p-2'>
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
          
          <View className='mt-4'>
              <View className='flex-row items-center gap-x-2'>
                <View className='grow'>
                <Dropdown
                  selectedTextStyle={{fontSize: 10, left: 10}}          
                  itemTextStyle={{fontSize: 13}}
                  style={{backgroundColor: "#e5e7eb", padding: 3, borderRadius: 5, width: '100%'}}
                  placeholderStyle={{fontSize: 13, left: 10}}
                  data={locationsData}
                  placeholder={selectedLocation ? selectedLocation : 'Location'}
                  labelField={'name'}
                  valueField={'id'}
                  value={selectedLocation}
                  onChange={(item) => handleLocationPress(item.name)}
                />
                </View>

                <View className='grow'>
                <Dropdown
                  selectedTextStyle={{fontSize: 10, left: 10}}          
                  itemTextStyle={{fontSize: 13}}
                  style={{backgroundColor: "#e5e7eb", padding: 3, borderRadius: 5, width: '100%'}}
                  placeholderStyle={{fontSize: 13, left: 10}}
                  data={pricesData}
                  placeholder={selectedPrice ? selectedPrice : 'Price'}
                  labelField={'price'}
                  valueField={'id'}
                  value={selectedPrice}
                  onChange={(item) => handlePricePress(item.price)}
                />
                </View>

                <View className='grow'>
                <Dropdown
                  selectedTextStyle={{fontSize: 10, left: 10}}          
                  itemTextStyle={{fontSize: 13}}
                  style={{backgroundColor: "#e5e7eb", padding: 3, borderRadius: 5, width: '100%'}}
                  placeholderStyle={{fontSize: 13, left: 10}}
                  data={ratingsData}
                  placeholder={selectedRating ? selectedRating : 'Rating'}
                  labelField={'rating'}
                  valueField={'id'}
                  value={selectedRating}
                  onChange={(item) => handleRatingPress(item.rating)}
                />
                </View>

              </View>
              
          </View>
            <View className='mt-4'>
              <View className='h-80'>
                <View className='flex-row justify-between items-center'>
                  <Text className='text-xs font-semibold'>Search Results</Text>

                  <Pressable 
                  onPress={handleResetFilters}
                  className='flex-row items-center'>
                    <Ionicons name='refresh' size={15}/>
                    <Text className='text-sm'>Reset filters</Text>
                  </Pressable>
                  
                </View>

                
                <View className='mt-5'>
                  {selectedLocation ? (
                    selectedLocation === 'University of Antique' ? (
                      nearbyUA.length === 0 ? (
                        <View className='bg-slate-300 grow'>
                          <Text>No Results</Text>
                        </View>
                      ) : (
                        <PropertyList data={nearbyUA}/>
                      )
                    ) : selectedLocation === `Saint Anthony's College` ? (
                      nearbySAC.length === 0 ? (
                        <View>
                          <Text>No Results</Text>
                        </View>
                      ) : (
                        <PropertyList data={nearbySAC}/>
                      )
                    ) : null
                  ) : selectedPrice ? (
                    // Render based on selected price
                    propertyByPrice?.length === 0 ? (
                      <View>
                        <Text>No Results</Text>
                      </View>
                    ) : (
                      <PropertyList data={propertyByPrice}/>
                    )
                  ) : selectedRating ? (
                    // Render based on selected rating
                    propertyByRating?.length === 0 ? (
                      <View>
                        <Text>No Results</Text>
                      </View>
                    ) : (
                      <PropertyList data={propertyByRating}/>
                    )
                  ) : searchResults.length === 0 ? (
                    // Render when no filters are selected and there are no search results
                    <View>
                      <Text>No Results</Text>
                    </View>
                  ) : (
                    // Render search results when no filters are selected
                    <PropertyList data={searchResults}/>
                  )}
                </View>
              </View>

          <View>
            <Text className='text-lg font-semibold'>Recommendations</Text>
            <View className='mt-2'>
              <PopularNow data={popularSearches}/>
            </View>
          </View>
              
        </View>
      </View>
    </SafeAreaView>
  );
}
