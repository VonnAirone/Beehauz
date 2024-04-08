import * as Location from "expo-location";

export const getPermissions = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log("Please grant location permissions");
    return;
  }
};
