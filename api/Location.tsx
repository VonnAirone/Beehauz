import * as Location from "expo-location"

export const geocode = async (address) => {
    const geocodedLocation = await Location.geocodeAsync(address);
    console.log("Geocoded Address:");
    console.log(geocodedLocation);
  };

export const getPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log("Please grant location permissions");
      return;
    }

    let currentLocation = (await Location.getCurrentPositionAsync({})).coords;
    
    return currentLocation;
  };
