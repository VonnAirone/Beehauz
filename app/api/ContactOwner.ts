import { supabase } from "@/utils/supabase";
import { router } from "expo-router";

export async function ContactOwner(userID, owner_id) {
  try {
    const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .contains('users', [userID, owner_id]);

    if (data[0]?.room_id) {
      router.push({
        pathname: "/Chatbox", 
        params: { room_id: data[0]?.room_id, sender_id: userID, receiver_id: owner_id }
      });
    } else {
      const { data, error} = await supabase
      .from("chat_rooms")
      .insert([ {'users': [userID, owner_id]}])

      if (data) {
        router.push({
          pathname: "/Chatbox", 
          params: { sender_id: userID, receiver_id: owner_id }
        });
      }
    }
  } catch(error) {
      console.log("Error fetching room ID: ", error.message)
  }
}