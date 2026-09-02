import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { AppProvider, useApp } from '@/src/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View, ActivityIndicator } from 'react-native';
import { setPalette } from '@/src/constants/design';

export const unstable_settings = { anchor: '(tabs)' };

const light = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary:'#1C64F2', secondary:'#059669', error:'#DC2626', background:'#F8FAFC', surface:'#FFFFFF' } };
const dark = { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, primary:'#3B82F6', secondary:'#10B981', error:'#F87171' } };

function ThemedApp(){
  const { settings, ready } = useApp();
  const system = useColorScheme();
  const pref = settings.theme || 'system';
  const isDark = pref==='dark' ? true : pref==='light' ? false : system==='dark';
  setPalette(isDark);
  const theme = isDark ? dark : light;
  if(!ready) return <View style={{flex:1,alignItems:'center',justifyContent:'center', backgroundColor: isDark?'#0F172A':'#F8FAFC'}}><ActivityIndicator/></View>;
  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDark?'light':'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown:false }} />
        <Stack.Screen name="onboarding" options={{ headerShown:false }} />
        <Stack.Screen name="goal" options={{ headerShown:false }} />
        <Stack.Screen name="transaction" options={{ headerShown:false }} />
        <Stack.Screen name="saving" options={{ headerShown:false }} />
        <Stack.Screen name="notifications" options={{ headerShown:false }} />
        <Stack.Screen name="settings" options={{ headerShown:false }} />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout(){
  return (
    <AppProvider>
      <ThemedApp/>
    </AppProvider>
  );
}
