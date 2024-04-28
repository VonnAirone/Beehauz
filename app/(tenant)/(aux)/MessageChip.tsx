import React from "react";
import { View, Text } from "react-native";
import AvatarImage from "./avatar";

export default function MessageComponent({ item, user }) {
  const isSender = item.sender_id === user;

  // const displayTime = (timestamp) => {
  //   const date = new Date(timestamp);
  //   return date.toLocaleTimeString([], {hour: "numeric", minute: "2-digit", hour12: true})
  // };

  return (
    <View className={`${isSender ? 'items-end' : 'items-start'} py-2`}>
      {isSender ? (
        <View className="flex-row gap-x-2 items-center">
          <View className="px-3 py-1 rounded-md bg-white">
            <Text className="min-w-max">{item.message_content}</Text>
          </View>
          <View className="h-10 w-10 rounded-full">
          <AvatarImage userID={item.sender_id}/>
          </View>
        </View>
      ) : (
        <View className="flex-row gap-x-2 items-center">
          <View className="h-10 w-10 rounded-full">
          <AvatarImage userID={item.user}/>
          </View>

          <View className="bg-yellow px-3 py-1 rounded-md bg-white">
            <Text className="min-w-max">{item.message_content}</Text>
          </View>
        </View>
      )}
  </View>
  );
}