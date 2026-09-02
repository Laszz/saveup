import { Tabs, Redirect } from 'expo-router';
import { Icon } from 'react-native-paper';
import { useApp } from '@/src/context/AppContext';
import { View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/src/constants/design';
import { usePalette } from '@/src/hooks/usePalette';
import { useT } from '@/src/utils/i18n';

export default function TabLayout() {
  const { ready, settings } = useApp();
  const insets=useSafeAreaInsets();
  const p = usePalette();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  if (!ready) return <View style={{flex:1,alignItems:'center',justifyContent:'center', backgroundColor: p.bg}}><ActivityIndicator/></View>;
  if (!settings.hasSeenOnboarding) return <Redirect href="/onboarding" />;
  return (
    <Tabs initialRouteName="index" screenOptions={{
      headerShown:false,
      sceneStyle:{ backgroundColor: p.bg },
      tabBarActiveTintColor: p.secondary,
      tabBarInactiveTintColor: p.subText,
      tabBarActiveBackgroundColor: p.secondary + '26',
      tabBarStyle:{ backgroundColor: p.card, borderTopWidth:1, borderTopColor: p.border, height:64+insets.bottom, paddingTop: Spacing.xs, paddingBottom: insets.bottom + Spacing.xs },
      tabBarLabelStyle:{ fontSize:10, fontWeight:'600', marginTop:2 },
      tabBarItemStyle:{ borderRadius:12, marginHorizontal:4 },
    }}>
      <Tabs.Screen name="transactions" options={{ title: tt('riwayat'), tabBarIcon:({color,size,focused})=> <View style={{ backgroundColor: focused? p.primary+'14': 'transparent', borderRadius:8, padding:4 }}><Icon source="history" size={22} color={color}/></View> }} />
      <Tabs.Screen name="goals" options={{ title: tt('goals'), tabBarIcon:({color,size,focused})=> <View style={{ backgroundColor: focused? p.primary+'14': 'transparent', borderRadius:8, padding:4 }}><Icon source="piggy-bank" size={22} color={color}/></View> }} />
      <Tabs.Screen name="index" options={{ title: tt('home'), tabBarIcon:({color,size,focused})=> <View style={{ backgroundColor: focused? p.primary+'14': 'transparent', borderRadius:8, padding:4 }}><Icon source="home" size={22} color={color}/></View> }} />
      <Tabs.Screen name="record" options={{ title: tt('keuangan'), tabBarIcon:({color,size,focused})=> <View style={{ backgroundColor: focused? p.primary+'14': 'transparent', borderRadius:8, padding:4 }}><Icon source="wallet" size={22} color={color}/></View> }} />
      <Tabs.Screen name="statistics" options={{ title: tt('statistik'), tabBarIcon:({color,size,focused})=> <View style={{ backgroundColor: focused? p.primary+'14': 'transparent', borderRadius:8, padding:4 }}><Icon source="chart-bar" size={22} color={color}/></View> }} />
    </Tabs>
  );
}
