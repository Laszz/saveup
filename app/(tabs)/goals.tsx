import { ScrollView, View, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Icon, IconButton, ProgressBar, Button } from 'react-native-paper';
import { usePalette } from '@/src/hooks/usePalette';
import { useApp } from '@/src/context/AppContext';
import { useT } from '@/src/utils/i18n';
import { EmptyState } from '@/src/components/EmptyState';
import { formatIDR } from '@/src/utils/currency';
import { useRouter } from 'expo-router';
import { Spacing, Radius, Palette } from '@/src/constants/design';
import { useRef } from 'react';

// warna progress Figma: biru, oranye, hijau — cycle per index
const progressColors = ['#3B82F6', '#F59E0B', '#059669', '#8B5CF6', '#EC4899'];

export default function GoalsScreen(){
  const { goals, settings } = useApp();
  const router=useRouter();
  const insets=useSafeAreaInsets();
  const p=usePalette();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const navRef=useRef(false);
  const go=(path:any)=>{ if(navRef.current) return; navRef.current=true; router.push(path); setTimeout(()=>navRef.current=false,800); };
  const active = goals.filter(g=>(g.progress||0)<100);
  const completed = goals.filter(g=>(g.progress||0)>=100);
  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: p.bg }]}>
      <ScrollView contentContainerStyle={{padding: Spacing.sm, paddingBottom:80, gap: Spacing.sm}}>
        {/* Header samakan Home: avatar+SaveUp kiri, bell/cog kanan — jarak 8 */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Image source={require('@/assets/images/icon.png')} style={[styles.avatar, { backgroundColor: p.card }]} />
            <Text style={[styles.saveUp, { color: p.text }]}>SaveUp</Text>
          </View>
          <View style={styles.headerRight}>
            <IconButton icon="bell-outline" size={20} iconColor={p.text} onPress={()=>go("/notifications")} style={[styles.iconBtn, { backgroundColor: p.card, borderColor: p.border }]} />
            <IconButton icon="cog-outline" size={20} iconColor={p.text} onPress={()=>go("/settings")} style={[styles.iconBtn, { backgroundColor: p.card, borderColor: p.border }]} />
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={[styles.title, { color:p.text }]}>{tt('yourGoals')}</Text>
          <Button mode="contained" icon="plus" buttonColor="#0E5A3A" textColor="#FFF" style={styles.newBtn} contentStyle={{ height:36 }} onPress={()=>go('/goal/form')}>{tt('newGoal')}</Button>
        </View>

        {active.length===0 ? <EmptyState title={tt('belumAdaGoalAktif')} desc={tt('buatTargetPertama')} cta={tt('buatGoal')} onPress={()=>go('/goal/form')} /> :
          active.map((g, idx)=> {
            const pct = (g.progress||0);
            const color = progressColors[idx % progressColors.length];
            const pctColor = color;
            return (
              <Card key={g.id} style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]} mode="contained" onPress={()=>go(`/goal/${g.id}` as any)}>
                <Card.Content style={{ gap: Spacing.xs }}>
                  <View style={styles.cardHead}>
                    <View style={styles.iconBox}><Icon source={g.icon||'laptop'} size={22} color={color} /></View>
                    <View style={{ flex:1, gap:2 }}>
                      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                        <Text style={[styles.goalName, { color: p.text }]} numberOfLines={1}>{g.name}</Text>
                        <Text style={[styles.pct, { color: pctColor }]}>{Math.round(pct)}%</Text>
                      </View>
                      <Text style={styles.amount}><Text style={[styles.bold, { color: p.text }]}>{formatIDR(g.currentAmount||0)}</Text><Text style={[styles.muted, { color: p.subText }]}> / {formatIDR(g.targetAmount)}</Text></Text>
                    </View>
                  </View>
                  <ProgressBar progress={pct/100} color={color} style={[styles.bar, { backgroundColor: p.muted }]} />
                </Card.Content>
              </Card>
            );
          })
        }

        {completed.length>0 && (
          <>
            <View style={styles.completedHead}>
              <Text style={[styles.completedTitle, { color: p.text }]}>{tt('completed')}</Text>
              <View style={[styles.line, { backgroundColor: p.border }]} />
            </View>
            {completed.map(g=> (
              <Card key={g.id} style={[styles.completedCard, { backgroundColor: p.muted, borderColor: p.border }]} mode="contained" onPress={()=>go(`/goal/${g.id}` as any)}>
                <Card.Content style={{ flexDirection:'row', alignItems:'center', gap: Spacing.sm }}>
                  <View style={[styles.iconBox,{ backgroundColor: p.card }]}><Icon source={g.icon||'shield-check'} size={22} color={p.secondary} /></View>
                    <View style={{ flex:1, gap:2 }}>
                     <Text style={[styles.goalName, { color: p.text }]}>{g.name}</Text>
                     <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}><Icon source="check-circle" size={14} color="#10B981" /><Text style={styles.achieved}>{tt('goalAchieved')}</Text></View>
                   </View>
                  <Text style={[styles.completedAmount, { color: p.text }]}>{formatIDR(g.targetAmount)}</Text>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
const styles=StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#F8FAFC' },
  topHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: Spacing.xs },
  avatar:{ width:32, height:32, borderRadius:16, backgroundColor:'#FFF' },
  saveUp:{ fontSize:20, fontWeight:'800', color:'#0E5A3A', letterSpacing:-0.3 },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap: Spacing.xs },
  headerRight:{ flexDirection:'row', gap:4, alignItems:'center' },
  iconBtn:{ backgroundColor:'#FFF', borderWidth:1, borderColor:'#E2E8F0', margin:0 },
  titleRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop: Spacing.xs },
  title:{ fontSize:22, fontWeight:'800', color: Palette.text },
  newBtn:{ borderRadius:20, paddingHorizontal: 4 },
  card:{ borderRadius: Radius.lg, backgroundColor:'#FFF', borderWidth:1, borderColor:'#E2E8F0', elevation:1 },
  cardHead:{ flexDirection:'row', gap: Spacing.sm, alignItems:'center' },
  iconBox:{ width:48, height:48, borderRadius:12, backgroundColor:'#EFF6FF', alignItems:'center', justifyContent:'center' },
  goalName:{ fontWeight:'700', color: Palette.text, fontSize:14, flex:1 },
  pct:{ fontWeight:'700', fontSize:13 },
  amount:{ fontSize:13, marginTop:2 },
  bold:{ fontWeight:'700', color: Palette.text },
  muted:{ fontWeight:'400', color: Palette.subText },
  bar:{ height:6, borderRadius:3, backgroundColor:'#E2E8F0' },
  completedHead:{ flexDirection:'row', alignItems:'center', gap: Spacing.sm, marginTop: Spacing.sm },
  completedTitle:{ fontSize:16, fontWeight:'700', color: Palette.text },
  line:{ flex:1, height:1, backgroundColor:'#E2E8F0' },
  completedCard:{ borderRadius: Radius.lg, backgroundColor:'#F1F5FF', borderWidth:1, borderColor:'#E0E7FF' },
  completedAmount:{ fontWeight:'700', color: Palette.text, fontSize:13 },
  achieved:{ color:'#10B981', fontSize:12, fontWeight:'600' },
});
