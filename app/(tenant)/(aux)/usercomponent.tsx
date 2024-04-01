import { getProfile } from "@/api/DataFetching"

export const getUsername = async (userID, setUsername) => {
    try {
      const data = await getProfile(userID)
      if (data) {
        setUsername(data?.first_name)
      }
    } catch (error) {
      console.log("Error fetching username", error.message)
    }
  }