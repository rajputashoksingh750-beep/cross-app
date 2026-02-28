import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FeedScreen from './src/screens/FeedScreen';
import MapScreen from './src/screens/MapScreen';
import CreateScreen from './src/screens/CreateScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  bgDark: '#0A0A1A',
  bgCard: '#141428',
  primary: '#6C63FF',
  accent: '#FF6584',
  textMuted: '#6E6E8A',
  textPrimary: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.08)',
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.bgCard,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
            position: 'absolute',
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Feed') {
              iconName = focused ? 'play-circle' : 'play-circle-outline';
            } else if (route.name === 'Map') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'Create') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }

            if (route.name === 'Create') {
              return (
                <View style={styles.createTabIcon}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    style={styles.createTabGradient}
                  >
                    <Ionicons name="add" size={28} color="#FFF" />
                  </LinearGradient>
                </View>
              );
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen
          name="Create"
          component={CreateScreen}
          options={{
            tabBarLabel: '',
          }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  createTabIcon: {
    position: 'absolute',
    top: -18,
  },
  createTabGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
