import React from 'react';
import {Tabs} from 'expo-router';
import Foundation from '@expo/vector-icons/Foundation';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function _Layout() {
  return <Tabs screenOptions={({route}) => ({
          tabBarStyle: { backgroundColor: '#F8F9FB'},
          tabBarActiveTintColor: '#fc7f20',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
          tabBarHideOnKeyboard: true,
          tabBarIconStyle: { marginTop: 4 },
        })}>

          <Tabs.Screen name="home"  options={{
            headerShown: false, 
            title: 'Inicio', 
            tabBarLabel: 'Inicio', 
            tabBarActiveTintColor: '#fc7f20',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="home" color={color} size={size} />
            ),
          }} />
          <Tabs.Screen name="my-offers" options={{
            headerShown: false,
            title: 'Mis Ofertas',
            tabBarLabel: 'Mis Ofertas',
            tabBarActiveTintColor: '#fc7f20',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="briefcase" color={color} size={size} />
            ),
          }} />

          <Tabs.Screen name="profile" options={{
            headerShown: false,
            title: 'Perfil',
            tabBarLabel: 'Perfil',
            tabBarActiveTintColor: '#fc7f20',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="user" color={color} size={size} />
            ),
          }} />


        </Tabs>
} 

// briefcase, wrench