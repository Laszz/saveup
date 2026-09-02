import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useApp } from '@/src/context/AppContext';
import { usePalette } from '@/src/hooks/usePalette';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/src/constants/design';
import { useT } from '@/src/utils/i18n';
import { useState, useRef } from 'react';

export default function Onboarding() {
  const router = useRouter();
  const { setSettings, settings } = useApp();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const p=usePalette();
  const insets=useSafeAreaInsets();
  const [busy,setBusy]=useState(false);
  const busyRef=useRef(false);
  const finish = async () => {
    if(busyRef.current) return; busyRef.current=true; setBusy(true);
    try{
      await setSettings({ hasSeenOnboarding: true });
      router.replace('/(tabs)');
    } finally { setTimeout(()=>{ busyRef.current=false; setBusy(false); },800); }
  };
  const features=[
    { icon:'wallet', color:p.primary, title:tt('fitur1') },
    { icon:'target', color:'#EF4444', title:tt('fitur2') },
    { icon:'chart-bar', color:'#059669', title:tt('fitur3') },
    { icon:'cellphone-off', color:p.subText, title:tt('fitur4') },
  ];
  return (
    <ScrollView style={{ flex:1, backgroundColor:p.bg }} contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text variant="displaySmall" style={[styles.title, { color:p.primary }]}>SaveUp</Text>
      <Text variant="bodyLarge" style={[styles.sub, { color:p.subText }]}>{tt('catatKeuanganDesc')}</Text>
      {features.map(f=> (
        <Card key={f.title} style={[styles.card, { backgroundColor:p.card, borderColor:p.border }]} mode="contained">
          <Card.Content style={styles.cardContent}>
            <View style={[styles.iconBox, { backgroundColor:f.color+'14' }]}><Icon source={f.icon} size={20} color={f.color} /></View>
            <Text style={[styles.cardText, { color:p.text }]}>{f.title}</Text>
          </Card.Content>
        </Card>
      ))}
      <Button mode="contained" onPress={finish} loading={busy} disabled={busy} style={styles.btn} contentStyle={{paddingVertical:8}} buttonColor={p.primary} textColor="#FFF">{tt('mulaiSekarang')}</Button>
    </ScrollView>
  );
}
const styles=StyleSheet.create({
  wrap:{ flex:1, padding: Spacing.md, justifyContent:'center', gap:12, backgroundColor:'transparent' },
  title:{ fontWeight:'900', textAlign:'center', fontSize:32 },
  sub:{ textAlign:'center', marginTop:8, marginBottom:12 },
  card:{ borderRadius:12, borderWidth:1 },
  cardContent:{ flexDirection:'row', alignItems:'center', gap:12 },
  iconBox:{ width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center' },
  cardText:{ flex:1, fontSize:14, fontWeight:'500' },
  btn:{ marginTop:16, borderRadius:12 },
});
