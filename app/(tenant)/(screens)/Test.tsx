// import React from 'react';
// import MapView, { Callout, Marker } from 'react-native-maps';
// import { StyleSheet, View, Text } from 'react-native';

// const PropertyCallout = ({ property }) => {
//   return (
//     <Callout>
//       <View style={{ padding: 10 }}>
//         <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{property.title}</Text>
//         <Text>{property.description}</Text>
//         <Text style={{ marginTop: 5 }}>Price: {property.price}</Text>
//         <Text>Bedrooms: {property.bedrooms}</Text>
//         <Text>Bathrooms: {property.bathrooms}</Text>
//       </View>
//     </Callout>
//   );
// };


// export default function Map() {
//   // const properties = [
//   //   { id: 1, title: 'Beautiful House', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', price: '$500,000', bedrooms: 3, bathrooms: 2, coordinate: { latitude: 37.78825, longitude: -122.4324 } },
//   // ];

//   // return (
//   //   <View style={{ flex: 1 }}>
//   //     <MapView style={{ flex: 1 }} initialRegion={{ latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}>
//   //       {properties.map(property => (
//   //         <Marker key={property.id} coordinate={property.coordinate}>
//   //           <PropertyCallout property={property} />
//   //         </Marker>
//   //       ))}
//   //     </MapView>
//   //   </View>
//   // );
  
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
// });


import React from 'react';
// import MapView, { Callout, Marker } from 'react-native-maps';
// import { StyleSheet, View, Text } from 'react-native';

// const PropertyCallout = ({ property }) => {
//   return (
//     <Callout>
//       <View style={{ padding: 10 }}>
//         <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{property.title}</Text>
//         <Text>{property.description}</Text>
//         <Text style={{ marginTop: 5 }}>Price: {property.price}</Text>
//         <Text>Bedrooms: {property.bedrooms}</Text>
//         <Text>Bathrooms: {property.bathrooms}</Text>
//       </View>
//     </Callout>
//   );
// };


// export default function Map() {
//   const properties = [
//     { id: 1, title: 'Beautiful House', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', price: '$500,000', bedrooms: 3, bathrooms: 2, coordinate: { latitude: 37.78825, longitude: -122.4324 } },
//   ];

//   return (
//     <View style={{ flex: 1 }}>
//       <MapView style={{ flex: 1 }} 
//       showsCompass={true}
//       showsUserLocation={true} 
//       followsUserLocation={true}>
//         {properties.map(property => (
//           <Marker key={property.id} coordinate={property.coordinate}>
//             <PropertyCallout property={property} />
//           </Marker>
//         ))}
//       </MapView>
//     </View>
//   );
  
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
// });

            {/* {properties.map(property => (
              <Marker key={property.id} coordinate={property.coordinate}>
                <PropertyCallout property={property} />
              </Marker>
            ))} */}

                        {/* <View className='absolute bg-white h-40 bottom-32 w-full items-center'>
              <View className='bg-gray-300 h-20 w-20'/>
            </View>
              
            <View className='absolute bottom-10 w-full items-center'>
              <TextInput className='bg-white p-4 w-80 rounded-md' placeholder='Search a boarding house'/>
            </View> */}

            {/*       
      <TextInput
      className='border border-gray-300 p-2 w-80 rounded-md' 
      placeholder='Address' 
      value={address}
      onChangeText={handleAddressChange}/>

      <Pressable 
      android_ripple={{color: "#ffa233"}}
      onPress={() => geocode(address)}
      className='p-2 bg-yellow mt-5 rounded-md'>
        <Text>Geocode Location</Text>
      </Pressable> */}