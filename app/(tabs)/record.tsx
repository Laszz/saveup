import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text, Card, Icon, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { usePalette } from '@/src/hooks/usePalette';
import { useApp } from '@/src/context/AppContext';
import { useT } from '@/src/utils/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/src/constants/design';
import { useRef } from 'react';

export default function RecordScreen(){
  const p=usePalette();
  const { settings }=useApp();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const insets=useSafeAreaInsets();
  const router=useRouter();
  const navRef=useRef(false);
  const go=(path:any)=>{ if(navRef.current) return; navRef.current=true; router.push(path); setTimeout(()=>navRef.current=false,800); };

  return (
    <View style={[styles.wrap, { backgroundColor:p.bg, paddingTop:insets.top }]}>
      <View style={[styles.topHeader, { backgroundColor:p.bg }]}>
        <View style={styles.headerLeft}>
          <Image source={require('@/assets/images/icon.png')} style={[styles.avatar, { backgroundColor:p.card }]} />
          <Text style={[styles.saveUp, { color:p.text }]}>SaveUp</Text>
        </View>
        <View style={styles.headerRight}>
          <IconButton icon="bell-outline" size={20} iconColor={p.text} onPress={()=>go("/notifications")} style={[styles.iconBtn, { backgroundColor:p.card, borderColor:p.border }]} />
          <IconButton icon="cog-outline" size={20} iconColor={p.text} onPress={()=>go("/settings")} style={[styles.iconBtn, { backgroundColor:p.card, borderColor:p.border }]} />
        </View>
      </View>
      <View style={[styles.header, { backgroundColor:p.card, borderColor:p.border }]}>
        <Text variant="titleMedium" style={[styles.headerTitle, { color:p.text }]}>{tt('keuangan')}</Text>
      </View>
      <View style={{ padding: Spacing.sm, gap:16, flex:1 }}>
        <Text variant="bodyMedium" style={{ color:p.subText, textAlign:'center' }}>{tt('pilihJenis')}</Text>

        <Pressable onPress={()=>go('/transaction/form?type=income')} style={[styles.bigCard, { backgroundColor:p.card, borderColor:p.border }]}>
          <View style={[styles.bigIcon, { backgroundColor:'#E6F7ED' }]}><Icon source="wallet" size={28} color="#059669" /></View>
          <View style={{ flex:1, gap:4 }}>
            <Text style={[styles.bigTitle, { color:p.text }]}>{tt('pemasukan')}</Text>
            <Text style={[styles.bigSub, { color:p.subText }]}>{tt('pemasukanDesc')}</Text>
          </View>
          <Icon source="chevron-right" size={20} color={p.subText} />
        </Pressable>

        <Pressable onPress={()=>go('/transaction/form?type=expense')} style={[styles.bigCard, { backgroundColor:p.card, borderColor:p.border }]}>
          <View style={[styles.bigIcon, { backgroundColor:'#FDE8E8' }]}><Icon source="cart" size={28} color="#DC2626" /></View>
          <View style={{ flex:1, gap:4 }}>
            <Text style={[styles.bigTitle, { color:p.text }]}>{tt('pengeluaran')}</Text>
            <Text style={[styles.bigSub, { color:p.subText }]}>{tt('pengeluaranDesc')}</Text>
          </View>
          <Icon source="chevron-right" size={20} color={p.subText} />
        </Pressable>

        <Card style={[styles.tip, { backgroundColor:p.primary+'0D', borderColor:p.border }]}>
          <Card.Content style={{ gap:6 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
              <Icon source="lightbulb-outline" size={16} color={p.primary} />
              <Text style={[styles.tipTitle, { color:p.text }]}>{tt('tips')}</Text>
            </View>
            <Text variant="bodySmall" style={{ color:p.subText }}>{tt('tipsDesc')}</Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}
const styles=StyleSheet.create({
  wrap:{ flex:1 },
  topHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal: Spacing.sm, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  avatar:{ width:32, height:32, borderRadius:16 },
  saveUp:{ fontSize:20, fontWeight:'800', letterSpacing:-0.3 },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap: Spacing.xs },
  headerRight:{ flexDirection:'row', gap:4, alignItems:'center' },
  iconBtn:{ borderWidth:1, margin:0 },
  header:{ alignItems:'center', justifyContent:'center', paddingVertical:12, borderBottomWidth:1 },
  headerTitle:{ fontSize:16, fontWeight:'700', textAlign:'center' },
  bigCard:{ flexDirection:'row', alignItems:'center', gap:16, padding:16, borderRadius:16, borderWidth:1 },
  bigIcon:{ width:48, height:48, borderRadius:12, alignItems:'center', justifyContent:'center' },
  bigTitle:{ fontSize:16, fontWeight:'700' },
  bigSub:{ fontSize:12, fontWeight:'500' },
  tip:{ borderRadius:12, borderWidth:1 },
  tipTitle:{ fontSize:12, fontWeight:'700' },
});
