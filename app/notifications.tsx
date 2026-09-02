import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Icon } from 'react-native-paper';
import { useApp } from '@/src/context/AppContext';
import { Spacing, Palette, Radius } from '@/src/constants/design';
import { usePalette } from '@/src/hooks/usePalette';
import { formatIDR } from '@/src/utils/currency';
import { formatDateID } from '@/src/utils/date';

export default function NotificationsScreen(){
  const p=usePalette();
  const insets=useSafeAreaInsets();
  const { transactions, goals, settings } = useApp();
  // buat notif lokal sederhana dari data user (ponytail: offline, tanpa backend)
  const recentSavings = transactions.filter(t=>t.type==='saving').slice(0,5);
  const completed = goals.filter(g=>(g.progress||0)>=100);
  const hasNotif = recentSavings.length>0 || completed.length>0 || settings.reminderEnabled;

  return (
    <View style={[styles.wrap, { backgroundColor: p.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: p.card, borderColor: p.border }]}>
        <Text style={[styles.title, { color: p.text }]}>Notifikasi</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.sm, gap: Spacing.sm }}>
        {!hasNotif ? (
          <Card style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]}><Card.Content style={{ alignItems:'center', gap: Spacing.xs, paddingVertical: Spacing.lg }}>
            <Icon source="bell-off-outline" size={32} color={p.subText} />
            <Text style={[styles.emptyTitle, { color: p.text }]}>Belum ada notifikasi</Text>
            <Text style={[styles.emptySub, { color: p.subText }]}>Saving, streak & pengingat akan muncul di sini.</Text>
          </Card.Content></Card>
        ) : (
          <>
            {settings.reminderEnabled && (
              <Card style={[styles.card, { backgroundColor: p.muted===' #F1F5F9'.trim()? '#EFF6FF': '#1E3A3A', borderColor: p.border }]}><Card.Content style={{ flexDirection:'row', gap: Spacing.sm, alignItems:'center' }}>
                <View style={[styles.iconBox,{ backgroundColor:'#DBEAFE' }]}><Icon source="alarm" size={18} color={p.primary} /></View>
                <View style={{ flex:1 }}><Text style={[styles.notifTitle, { color: p.text }]}>Pengingat aktif</Text><Text style={[styles.notifSub, { color: p.subText }]}>Setiap hari jam {settings.reminderTime}</Text></View>
              </Card.Content></Card>
            )}
            {completed.map(g=> (
              <Card key={g.id} style={[styles.card,{ backgroundColor: p.muted===' #F1F5F9'.trim()? '#F0FDF4':'#14332A', borderColor: p.border }]}><Card.Content style={{ flexDirection:'row', gap: Spacing.sm, alignItems:'center' }}>
                <View style={[styles.iconBox,{ backgroundColor:'#DCFCE7' }]}><Icon source="trophy" size={18} color={p.secondary} /></View>
                <View style={{ flex:1 }}><Text style={[styles.notifTitle, { color: p.text }]}>Target tercapai!</Text><Text style={[styles.notifSub, { color: p.subText }]}>{g.name} • {formatIDR(g.targetAmount)}</Text></View>
              </Card.Content></Card>
            ))}
            {recentSavings.map(t=>{
              const g = goals.find(x=>x.id===t.goalId);
              return (
                <Card key={t.id} style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]}><Card.Content style={{ flexDirection:'row', gap: Spacing.sm, alignItems:'center' }}>
                  <View style={[styles.iconBox,{ backgroundColor:'#FEF3C7' }]}><Icon source="piggy-bank" size={18} color="#D97706" /></View>
                  <View style={{ flex:1 }}><Text style={[styles.notifTitle, { color: p.text }]}>Menabung {formatIDR(t.amount)}</Text><Text style={[styles.notifSub, { color: p.subText }]}>{g?.name || 'Saving'} • {formatDateID(t.date)}</Text></View>
                </Card.Content></Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}
const styles=StyleSheet.create({
  wrap:{ flex:1, backgroundColor: Palette.bg },
  header:{ alignItems:'center', justifyContent:'center', padding: Spacing.sm, backgroundColor:'#FFF', borderBottomWidth:1, borderColor: Palette.border },
  title:{ fontWeight:'700', color: Palette.text, fontSize:16, textAlign:'center' },
  card:{ borderRadius: Radius.lg, backgroundColor:'#FFF', borderWidth:1, borderColor: Palette.border },
  iconBox:{ width:36, height:36, borderRadius:8, alignItems:'center', justifyContent:'center' },
  notifTitle:{ fontWeight:'600', color: Palette.text, fontSize:13 },
  notifSub:{ color: Palette.subText, fontSize:11, marginTop:2 },
  emptyTitle:{ fontWeight:'700', color: Palette.text },
  emptySub:{ color: Palette.subText, fontSize:12, textAlign:'center' },
});
