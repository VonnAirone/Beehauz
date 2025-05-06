import { getProfile } from "@/app/api/DataFetching"

export const getUsername = async (userID, setUsername) => {
    try {
      const data = await getProfile(userID)
      if (data) {
        const username = `${data.first_name} ${data.last_name}`;
        setUsername(username)
      }
    } catch (error) {
      console.log("Error fetching username", error.message)
    }
  }