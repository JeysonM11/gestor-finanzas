import {Stack} from "expo-router";
import { useEffect } from 'react'
import { useRouter } from 'expo-router'

export default function RootLayout() {
    
    return <Stack screenOptions={{headerShown: false}} />
}
