import { View, ScrollView, StyleSheet, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Searchbar, IconButton, Card, Icon } from 'react-native-paper';
import { usePalette } from '@/src/hooks/usePalette';
import { useApp } from '@/src/context/AppContext';
import { useT } from '@/src/utils/i18n';
import { EmptyState } from '@/src/components/EmptyState';
import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Spacing, Radius, Palette } from '@/src/constants/design';
import { formatDateID } from '@/src/utils/date';
import { formatIDR } from '@/src/utils/currency';

const filters = ['Semua','Income','Expense','Saving'] as const;

function isToday(iso:string){
  const d=new Date(iso); const n=new Date();
  return d.getDate()===n.getDate() && d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
}
function formatTime(iso:string){
  const d=new Date(iso);
  let h=d.getHours(); const m=String(d.getMinutes()).padStart(2,'0');
  const ap=h>=12?'PM':'AM'; h=h%12||12;
  return `${String(h).padStart(2,'0')}:${m} ${ap}`;
}
function formatGroupDate(iso:string, lang='id'){
  if(isToday(iso)) return lang==='en' ? 'Today' : 'Hari Ini';
  const d=new Date(iso); const n=new Date(); n.setDate(n.getDate()-1);
  if(d.getDate()===n.getDate()&&d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()) return lang==='en' ? 'Yesterday' : 'Kemarin';
  return formatDateID(iso);
}
function groupByDate(txs:any[], lang='id') {
  const groups: Record<string, any[]> = {};
  const order: string[] = [];
  for(const t of txs){
    const key = formatGroupDate(t.date, lang);
    if(!groups[key]){ groups[key]=[]; order.push(key); }
    groups[key].push(t);
  }
  return { groups, order };
}

export default function Transactions(){
  const { transactions, categories, goals, settings } = useApp();
  const router=useRouter();
  const insets=useSafeAreaInsets();
  const p=usePalette();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const navRef=useRef(false);
  const go=(path:any)=>{ if(navRef.current) return; navRef.current=true; router.push(path); setTimeout(()=>navRef.current=false,800); };
  const [active, setActive]=useState('Semua');
  const [q, setQ]=useState('');
  const catMap=new Map(categories.map(c=>[c.id,c.name]));
  const catIconMap=new Map(categories.map(c=>[c.id,c.icon]));
  const goalMap=new Map(goals.map(g=>[g.id,g.name]));
  const goalIconMap=new Map(goals.map(g=>[g.id,g.icon]));
  const filtered=useMemo(()=>{
    let t=[...transactions];
    if(active!=='Semua') t=t.filter(x=>x.type===active.toLowerCase());
    if(q) t=t.filter(x=> (x.note||'').toLowerCase().includes(q.toLowerCase()) || (x.categoryId&&catMap.get(x.categoryId)?.toLowerCase().includes(q.toLowerCase())) || (x.goalId&&goalMap.get(x.goalId)?.toLowerCase().includes(q.toLowerCase())) );
    return t;
  },[transactions,active,q]);
  const { groups, order } = groupByDate(filtered, lang);
  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: p.bg }]}>
      {/* Top bar JANGAN DIUBAH — tetap avatar+SaveUp kiri, bell/cog kanan jarak 8 */}
      <View style={[styles.topHeader, { backgroundColor: p.bg }]}>
        <View style={styles.headerLeft}>
          <Image source={require('@/assets/images/icon.png')} style={[styles.avatar, { backgroundColor: p.card }]} />
          <Text style={[styles.saveUp, { color: p.text }]}>SaveUp</Text>
        </View>
        <View style={styles.headerRight}>
          <IconButton icon="bell-outline" size={20} iconColor={p.text} onPress={()=>go("/notifications")} style={[styles.iconBtn, { backgroundColor: p.card, borderColor: p.border }]} />
          <IconButton icon="cog-outline" size={20} iconColor={p.text} onPress={()=>go("/settings")} style={[styles.iconBtn, { backgroundColor: p.card, borderColor: p.border }]} />
        </View>
      </View>

      {/* Search Figma: rounded 12, border, placeholder Search transactions... */}
      <Searchbar placeholder={tt('searchTransactions')} value={q} onChangeText={setQ} style={[styles.search, { backgroundColor: p.card, borderColor: p.border }]} inputStyle={{ fontSize:14, color: p.text }} iconColor={p.subText} placeholderTextColor={p.subText} />

      {/* Chips custom pill biar center sempurna — kanan Saving sejajar Search */}
      <View style={styles.chipsRow}>
        {filters.map(f=> {
          const sel = active===f;
          const display = f==='Semua' ? tt('semua') : f==='Income' ? tt('pemasukan') : f==='Expense' ? tt('pengeluaran') : tt('saving');
          return (
            <Pressable key={f} onPress={()=>setActive(f)} style={[styles.pill, { backgroundColor:p.card, borderColor:p.border }, sel && { backgroundColor:p.primary, borderColor:p.primary }]}>
              <Text style={[styles.pillText, { color:p.text }, sel && { color:'#FFF' }]}>{display}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{padding: Spacing.sm, paddingBottom: 32, gap: 16}}>
        {filtered.length===0 ? <EmptyState title={tt('belumAdaTransaksiHistory')} desc={tt('transaksiAkanMuncul')} /> :
          order.map(date=> (
            <View key={date} style={{ gap: Spacing.xs }}>
              <Text style={[styles.dateHead, { color: p.text }]}>{date}</Text>
              {groups[date].map((t:any)=> {
                const isIncome = t.type==='income';
                const isExpense = t.type==='expense';
                const isSaving = t.type==='saving';
                const isWithdrawal = t.type==='withdrawal';
                const catName = t.categoryId ? catMap.get(t.categoryId) : undefined;
                const catIcon = t.categoryId ? catIconMap.get(t.categoryId) : undefined;
                const goalName = t.goalId ? goalMap.get(t.goalId) : undefined;
                const goalIcon = t.goalId ? goalIconMap.get(t.goalId) : undefined;
                let bg='#FFE4E6', iconCol='#DC2626', iconSrc=catIcon||'silverware-fork-knife';
                if(isIncome){ bg='#E0F2FF'; iconCol='#0B6B4A'; iconSrc=catIcon||'wallet'; }
                else if(isSaving){ bg='#DBEAFE'; iconCol='#1C64F2'; iconSrc=goalIcon||'piggy-bank'; }
                else if(isWithdrawal){ bg='#FEE2E2'; iconCol='#DC2626'; iconSrc=goalIcon||'ring'; }
                else if(t.note?.toLowerCase().includes('kopi')){ bg='#FFE4D6'; iconCol='#9A3412'; iconSrc='coffee'; }
                else if(isExpense && catName==='Makanan'){ bg='#FFE4E6'; iconCol='#BE123C'; iconSrc='silverware-fork-knife'; }
                const title = (t.note || goalName || catName || t.type).slice(0,22);
                const sub = isIncome ? tt('pemasukan') : isSaving ? 'Saving' : isWithdrawal ? 'Withdrawal' : (catName || tt('pengeluaran'));
                const amtColor = isIncome ? p.income : isWithdrawal ? p.expense : isSaving ? p.saving : p.expense;
                const sign = isIncome ? '+ ' : isWithdrawal ? '- ' : isSaving ? '- ' : '- ';
                return (
                  <Card key={t.id} style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]} mode="contained" onPress={()=>go(`/transaction/${t.id}` as any)}>
                    <Card.Content style={styles.cardContent}>
                      <View style={[styles.iconBox,{ backgroundColor:bg }]}><Icon source={iconSrc} size={20} color={iconCol} /></View>
                      <View style={{ flex:1, gap:2 }}>
                        <Text style={[styles.cardTitle, { color: p.text }]} numberOfLines={1}>{title}</Text>
                        <Text style={[styles.cardSub, { color: p.subText }]} numberOfLines={1}>{sub}</Text>
                      </View>
                      <View style={{ alignItems:'flex-end', gap:2 }}>
                        <Text style={[styles.amount,{ color: amtColor }]} numberOfLines={1}>{sign}{formatIDR(t.amount)}</Text>
                        <Text style={[styles.time, { color: p.subText }]}>{formatTime(t.date)}</Text>
                      </View>
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          ))
        }
      </ScrollView>
    </View>
  );
}
const styles=StyleSheet.create({
  wrap:{ flex:1, backgroundColor: '#F8FAFC' },
  topHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal: Spacing.sm, paddingTop: Spacing.sm, paddingBottom: Spacing.xs, backgroundColor:'#F8FAFC' },
  avatar:{ width:32, height:32, borderRadius:16, backgroundColor:'#FFF' },
  saveUp:{ fontSize:20, fontWeight:'800', color:'#0E5A3A', letterSpacing:-0.3 },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap: Spacing.xs },
  headerRight:{ flexDirection:'row', gap:4, alignItems:'center' },
  iconBtn:{ backgroundColor:'#FFF', borderWidth:1, borderColor:'#E2E8F0', margin:0 },
  search:{ marginHorizontal: Spacing.sm, marginTop: 12, marginBottom: 12, borderRadius: 12, backgroundColor:'#FFF', elevation:0, borderWidth:1, borderColor:'#E2E8F0' },
  chipsRow:{ flexDirection:'row', gap: 8, marginHorizontal: Spacing.sm, marginBottom: 4, justifyContent:'space-between' },
  pill:{ flex:1, height:36, borderRadius:12, borderWidth:1, alignItems:'center', justifyContent:'center' },
  pillText:{ fontSize:12, fontWeight:'500', textAlign:'center', textAlignVertical:'center', includeFontPadding:false },
  dateHead:{ color: Palette.text, fontWeight:'600', fontSize:14, marginTop: 16, marginBottom: 4 },
  card:{ borderRadius: 16, backgroundColor:'#FFF', borderWidth:1, borderColor:'#F1F5F9', elevation:1 },
  cardContent:{ flexDirection:'row', alignItems:'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  iconBox:{ width:48, height:48, borderRadius:12, alignItems:'center', justifyContent:'center' },
  cardTitle:{ fontWeight:'700', color: Palette.text, fontSize:14 },
  cardSub:{ color: Palette.subText, fontSize:12 },
  amount:{ fontWeight:'700', fontSize:14 },
  time:{ color: Palette.subText, fontSize:11 },
});
