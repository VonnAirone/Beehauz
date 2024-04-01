import BackButton from "@/components/back-button";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";

// export async function fetchUserMessages(userID, existingMessages = []) {
//   try {
//     const { data, error } = await supabase
//       .from('messages')
//       .select('*')
//       .or(`sender_id.eq.${userID}, receiver_id.eq.${userID}`);

//     if (error) {
//       throw error;
//     }

//     const filteredData = data.filter((message, index, self) => {
//       const roomID = message.room_id;
//       return self.findIndex((m) => m.room_id === roomID) === index;
//     });

//     const mergedMessages = [...existingMessages, ...filteredData];

//     return mergedMessages;
    
//   } catch (error) {
//     console.error('Error fetching user messages:', error.message);
//     return existingMessages;
//   }
// }

export async function fetchUserMessages(userID, existingMessages = []) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userID}, receiver_id.eq.${userID}`)
        .order('created_at', { ascending: false });
  
      if (error) {
        throw error;
      }
      const lastMessagesMap = new Map();
  
      data.forEach((message) => {
        const roomID = message.room_id;
        if (!lastMessagesMap.has(roomID)) {
          lastMessagesMap.set(roomID, message);
        }
      });

      const lastMessages = Array.from(lastMessagesMap.values());

      const mergedMessages = [...existingMessages, ...lastMessages];
      
      return mergedMessages;
    } catch (error) {
      console.error('Error fetching user messages:', error.message);
      return existingMessages;
    }
  }
  


export function subscribeToRealTimeMessages(userID, onUpdate) {
  const messages = supabase.channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages' },
      (payload) => {
        const newMessage = payload.new;
        onUpdate(newMessage);
      }
    )
    .subscribe();

  return () => {
    messages.unsubscribe();
  };
}

export async function fetchLastMessage(roomId) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("message_content, created_at, sender_id")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching last message:", error);
      return null;
    } else if (data.length > 0) {
      return data[0];
    } else {
      console.log("No messages found for room_id:", roomId);
      return null;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

export async function fetchRoomID (userID, ownerID, setRoomID) {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .contains('users', [userID, ownerID]);

    setRoomID(data[0]?.room_id)
  if (error) {
    console.error('Error fetching room ID:', error);
  }
}