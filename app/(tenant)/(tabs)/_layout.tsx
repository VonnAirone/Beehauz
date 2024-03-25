import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={24} style={styles.tabBarIcon} {...props}/>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarLabel:() => {return null},
        headerShown: false,
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }) => <TabBarIcon name="home-outline" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color="gray"
                    style={[styles.headerRight, { opacity: pressed ? 0.5 : 1 }]}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <TabBarIcon name="chatbox-outline" color={color} />,
        }}
      />
        <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <TabBarIcon name="location-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <TabBarIcon name="notifications-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <TabBarIcon name="person-circle-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15,
  },
  tabBarIcon: {
    marginBottom: -3,
  },
});
