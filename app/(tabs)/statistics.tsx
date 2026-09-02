import { ScrollView, View, StyleSheet, Dimensions, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Icon, IconButton } from 'react-native-paper';
import { useApp } from '@/src/context/AppContext';
import { useT } from '@/src/utils/i18n';
import { formatIDR, formatIDRShort } from '@/src/utils/currency';
import { expenseBreakdown, calcBalance } from '@/src/services/calc';
import { useState, useMemo } from 'react';
import { BarChart } from 'react-native-chart-kit';
import { Spacing, Radius, Palette } from '@/src/constants/design';
import { usePalette } from '@/src/hooks/usePalette';
import { useRouter } from 'expo-router';

function monthLabel(d:Date){
  return d.toLocaleDateString('id-ID',{ month:'long', year:'numeric' }).replace(/^\w/,c=>c.toUpperCase());
}

export default function Statistics(){
  const router=useRouter();
  const insets=useSafeAreaInsets();
  const p=usePalette();
  const { transactions, categories, settings } = useApp();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const [curMonth,setCurMonth]=useState(()=>{ const d=new Date(); d.setDate(1); return d; });
  const screenW = Dimensions.get('window').width - Spacing.sm*2 - Spacing.sm*2;
  const chartConfig = {
    backgroundGradientFrom: p.card,
    backgroundGradientTo: p.card,
    color:(o=1)=> p.primary + Math.round(o*255).toString(16).padStart(2,'0'),
    labelColor:()=> p.subText,
    barPercentage:0.55,
    decimalPlaces:0,
    propsForLabels:{ fontSize:10 },
    propsForBackgroundLines:{ stroke: p.border, strokeDasharray:'4 4' },
  } as any;

  const monthTx = useMemo(()=> transactions.filter(t=>{
    const d=new Date(t.date);
    return d.getMonth()===curMonth.getMonth() && d.getFullYear()===curMonth.getFullYear();
  }),[transactions, curMonth]);

  const prevMonth = useMemo(()=>{ const d=new Date(curMonth); d.setMonth(d.getMonth()-1); return transactions.filter(t=>{ const x=new Date(t.date); return x.getMonth()===d.getMonth()&&x.getFullYear()===d.getFullYear(); }); },[transactions, curMonth]);

  const bal = useMemo(()=> calcBalance(monthTx),[monthTx]);
  const prevBal = useMemo(()=> calcBalance(prevMonth),[prevMonth]);
  // delta vs last month
  const delta = prevBal.balance? ((bal.balance - prevBal.balance)/Math.abs(prevBal.balance)*100) : 0;
  const deltaStr = prevBal.balance===0 ? '' : `${delta>=0?'+':''}${delta.toFixed(0)}% vs last month`;

  const weekly = useMemo(()=>{
    const w={ i:[0,0,0,0], e:[0,0,0,0] } as any;
    for(const t of monthTx){
      const d=new Date(t.date); const day=d.getDate();
      const idx = day<=7?0: day<=14?1: day<=21?2:3;
      if(t.type==='income') w.i[idx]+=t.amount;
      else if(t.type==='expense') w.e[idx]+=t.amount;
    }
    return { labels:['W1','W2','W3','W4'], income:w.i, expense:w.e };
  },[monthTx]);

  const barData = {
    labels: weekly.labels,
    datasets:[
      { data: weekly.income, color:()=>p.income },
      { data: weekly.expense, color:()=>p.expense },
    ],
    legend:['Pemasukan','Pengeluaran']
  };

  const hasData = monthTx.length>0;
  const breakdown = useMemo(()=> expenseBreakdown(monthTx),[monthTx]);

  if(transactions.length===0){
    return (
      <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: p.bg }]}>
        <View style={[styles.topHeader, { backgroundColor: p.bg }]}>
          <View style={styles.headerLeft}>
            <Image source={require('@/assets/images/icon.png')} style={[styles.avatar, { backgroundColor: p.card }]} />
            <Text style={[styles.saveUp, { color: p.text }]}>SaveUp</Text>
          </View>
          <View style={styles.headerRight}>
            <IconButton icon="bell-outline" size={20} iconColor={p.text} onPress={()=>router.push("/notifications")} style={[styles.iconBtn, { backgroundColor: p.card, borderColor: p.border }]} />
            <IconButton icon="cog-outline" size={20} iconColor={p.text} onPress={()=>router.push("/settings")} style={[styles.iconBtn, { backgroundColor: p.card, borderColor: p.border }]} />
          </View>
        </View>
        <View style={[styles.emptyWrap, { backgroundColor: p.bg }]}><View style={styles.empty}><Text style={[styles.emptyText, { color: p.text }]}>{lang==='en'?'No statistics yet':'Belum ada data statistik'}</Text><Text style={[styles.emptySub, { color: p.subText }]}>{lang==='en'?'Add transactions to see your financial pattern.':'Catat beberapa transaksi untuk melihat pola keuanganmu.'}</Text></View></View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: p.bg }]}>
      <View style={[styles.topHeader, { backgroundColor: p.bg }]}>
        <View style={styles.headerLeft}>
          <Image source={require('@/assets/images/icon.png')} style={[styles.avatar, { backgroundColor: p.card }]} />
          <Text style={[styles.saveUp, { color: p.text }]}>SaveUp</Text>
        </View>
        <View style={styles.headerRight}>
          <IconButton icon="bell-outline" size={20} iconColor={p.text} onPress={()=>router.push("/notifications")} style={[styles.iconBtn, { backgroundColor: p.card, borderColor: p.border }]} />
          <IconButton icon="cog-outline" size={20} iconColor={p.text} onPress={()=>router.push("/settings")} style={[styles.iconBtn, { backgroundColor: p.card, borderColor: p.border }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{padding: Spacing.sm, gap: 16, paddingBottom: 32}}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color:p.text }]}>{tt('statistik')}</Text>
          <View style={[styles.monthPill, { backgroundColor:p.card, borderColor:p.border }]}>
            <Pressable onPress={()=>{ const d=new Date(curMonth); d.setMonth(d.getMonth()-1); setCurMonth(d); }} style={styles.arrowBtn}><Text style={[styles.monthArrow, { color:p.text }]}>‹</Text></Pressable>
            <Text style={[styles.monthText, { color:p.text }]}>{monthLabel(curMonth)}</Text>
            <Pressable onPress={()=>{ const d=new Date(curMonth); d.setMonth(d.getMonth()+1); setCurMonth(d); }} style={styles.arrowBtn}><Text style={[styles.monthArrow, { color:p.text }]}>›</Text></Pressable>
          </View>
        </View>

        {/* SALDO BULAN — real per bulan */}
        <View style={[styles.hero, { backgroundColor:p.primary }]}>
          <Text style={styles.heroLabel}>{tt('saldo')} — {monthLabel(curMonth)}</Text>
          <Text style={styles.heroAmount} numberOfLines={1} adjustsFontSizeToFit>{formatIDR(bal.balance)}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:4, marginTop:4 }}>
            <Icon source={delta>=0?"trending-up":"trending-down"} size={12} color="#FFF" />
            <Text style={styles.heroSub}>{hasData? (deltaStr || tt('bulanPertama')) : (lang==='en'?'No data this month':'Belum ada data bulan ini')}</Text>
          </View>
          <View style={[styles.heroDeco, { backgroundColor:'rgba(255,255,255,0.12)' }]} />
        </View>

        <View style={styles.miniRow}>
          <Card style={[styles.miniCard, { backgroundColor: p.card, borderColor: p.border }]} mode="contained">
            <Card.Content style={styles.miniContent}>
              <View style={{ flexDirection:'row', alignItems:'center', gap: 6 }}>
                <View style={[styles.miniIcon,{ backgroundColor:'#E6F7ED' }]}><Icon source="arrow-down" size={12} color="#059669" /></View>
                <Text style={[styles.miniLabel, { color: p.subText }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{tt('pemasukan')}</Text>
              </View>
              <Text style={[styles.miniVal, { color: p.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{formatIDRShort(bal.totalIncome)}</Text>
              <Text style={[styles.miniSub, { color: p.subText }]}>{monthTx.filter(t=>t.type==='income').length} {lang==='en'?'transactions':'transaksi'}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.miniCard, { backgroundColor: p.card, borderColor: p.border }]} mode="contained">
            <Card.Content style={styles.miniContent}>
              <View style={{ flexDirection:'row', alignItems:'center', gap: 6 }}>
                <View style={[styles.miniIcon,{ backgroundColor:'#FDE8E8' }]}><Icon source="arrow-up" size={12} color="#DC2626" /></View>
                <Text style={[styles.miniLabel, { color: p.subText }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{tt('pengeluaran')}</Text>
              </View>
              <Text style={[styles.miniVal, { color: p.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{formatIDRShort(bal.totalExpense)}</Text>
              <Text style={[styles.miniSub, { color: p.subText }]}>{monthTx.filter(t=>t.type==='expense').length} {lang==='en'?'transactions':'transaksi'}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.miniCard, { backgroundColor: p.card, borderColor: p.border }]} mode="contained">
            <Card.Content style={styles.miniContent}>
              <View style={{ flexDirection:'row', alignItems:'center', gap: 6 }}>
                <View style={[styles.miniIcon,{ backgroundColor:'#E0F2FE' }]}><Icon source="piggy-bank" size={12} color="#1C64F2" /></View>
                <Text style={[styles.miniLabel, { color: p.subText }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{lang==='en' ? 'Saving' : 'Tabungan'}</Text>
              </View>
              <Text style={[styles.miniVal, { color: p.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{formatIDRShort(bal.totalSaving)}</Text>
              <Text style={[styles.miniSub, { color: p.subText }]}>{monthTx.filter(t=>t.type==='saving').length} {lang==='en'?'transactions':'transaksi'}</Text>
            </Card.Content>
          </Card>
        </View>
        <Card style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]} mode="contained">
          <Card.Content style={{ gap: 8 }}>
            <Text style={[styles.cardTitle, { color: p.text }]}>{lang==='en' ? 'Savings used from balance' : 'Tabungan terpakai dari saldo'}</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
              <Text style={{ color:p.subText, fontSize:12 }}>{lang==='en' ? 'Total saved this month' : 'Total ditabung bulan ini'}</Text>
              <Text style={{ color:p.primary, fontWeight:'800', fontSize:14 }}>{formatIDR(bal.totalSaving)}</Text>
            </View>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
              <Text style={{ color:p.subText, fontSize:12 }}>{lang==='en' ? 'Balance after savings' : 'Saldo setelah tabungan'}</Text>
              <Text style={{ color: bal.balance<0 ? p.expense : p.income, fontWeight:'700' }}>{formatIDR(bal.balance)}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]} mode="contained">
          <Card.Content style={{ gap: 12 }}>
            <Text style={[styles.cardTitle, { color: p.text }]}>{tt('arusKas')} — {monthLabel(curMonth)}</Text>
            {!hasData ? (
              <View style={styles.emptyChart}><Text style={[styles.emptyText, { color:p.subText }]}>{tt('belumAdaDataMinggu')}</Text><Text style={[styles.emptySub, { color:p.subText }]}>{tt('incomeExpenseHint')} {monthLabel(curMonth)}.</Text></View>
            ) : (
              <>
                <BarChart data={barData as any} width={screenW} height={180} yAxisLabel="Rp " yAxisSuffix="" chartConfig={chartConfig} verticalLabelRotation={0} fromZero style={[styles.chart, { backgroundColor:p.card }]} />
                <View style={styles.legend}>
                  <View style={styles.legendItem}><View style={[styles.dot,{ backgroundColor:p.income }]} /><Text style={[styles.legendText, { color:p.subText }]}>{tt('pemasukan')}</Text></View>
                  <View style={styles.legendItem}><View style={[styles.dot,{ backgroundColor:p.expense }]} /><Text style={[styles.legendText, { color:p.subText }]}>{tt('pengeluaran')}</Text></View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]} mode="contained">
          <Card.Content style={{ gap: 12 }}>
            <Text style={[styles.cardTitle, { color: p.text, textAlign:'center' }]}>{tt('rincianPengeluaran')} — {monthLabel(curMonth)}</Text>
            {!hasData || breakdown.length===0 ? (
              <View style={styles.emptyChart}><Text style={[styles.emptyText, { color:p.subText }]}>{tt('belumAdaPengeluaran')}</Text><Text style={[styles.emptySub, { color:p.subText }]}>{tt('kategoriProgress')}</Text></View>
            ) : breakdown.slice(0,5).map(b=>{
              const cat=categories.find(c=>c.id===b.categoryId);
              const pct=Math.round(b.percent);
              const colors=[p.expense, p.income, p.saving, '#F59E0B', '#8B5CF6'];
              const idx=breakdown.indexOf(b)%colors.length;
              return (
                <View key={b.categoryId} style={{ gap: 6 }}>
                  <View style={styles.breakRow}>
                    <View style={[styles.breakIcon,{ backgroundColor: p.muted }]}><Icon source={cat?.icon||'tag'} size={16} color={colors[idx]} /></View>
                    <View style={{ flex:1, gap:2 }}>
                      <Text style={[styles.breakName, { color: p.text }]}>{cat?.name||b.categoryId}</Text>
                      <Text style={[styles.breakPct, { color: p.subText }]}>{pct}% dari total bulan ini</Text>
                    </View>
                    <Text style={[styles.breakAmt, { color: p.text }]}>{formatIDR(b.amount)}</Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: p.muted }]}><View style={[styles.fill,{ width:`${pct}%`, backgroundColor:colors[idx] }]} /></View>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles=StyleSheet.create({
  wrap:{ flex:1 },
  emptyWrap:{ flex:1 },
  empty:{ flex:1, alignItems:'center', justifyContent:'center', padding: Spacing.lg, gap: Spacing.xs },
  topHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal: Spacing.sm, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  avatar:{ width:32, height:32, borderRadius:16 },
  saveUp:{ fontSize:20, fontWeight:'800', letterSpacing:-0.3 },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap: Spacing.xs },
  headerRight:{ flexDirection:'row', gap:4, alignItems:'center' },
  iconBtn:{ borderWidth:1, margin:0 },
  titleRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  title:{ fontSize:20, fontWeight:'800' },
  monthPill:{ flexDirection:'row', alignItems:'center', gap:4, borderWidth:1, borderRadius:12, paddingHorizontal:8, paddingVertical:4 },
  arrowBtn:{ paddingHorizontal:8, paddingVertical:4 },
  monthArrow:{ fontSize:16, fontWeight:'600' },
  monthText:{ fontSize:12, fontWeight:'600', minWidth:110, textAlign:'center' },
  hero:{ borderRadius:16, padding: Spacing.sm, gap:4, overflow:'hidden' },
  heroLabel:{ color:'rgba(255,255,255,0.85)', fontSize:10, fontWeight:'600', letterSpacing:0.5 },
  heroAmount:{ color:'#FFF', fontSize:26, fontWeight:'800', marginTop:4 },
  heroSub:{ color:'rgba(255,255,255,0.9)', fontSize:11, fontWeight:'500' },
  heroDeco:{ position:'absolute', right:-20, top:-20, width:100, height:100, borderRadius:50 },
  miniRow:{ flexDirection:'row', gap: 8 },
  miniCard:{ flex:1, borderRadius:16, borderWidth:1, minWidth:0 },
  miniContent:{ gap:6, paddingVertical:6, paddingHorizontal:0, alignItems:'flex-start' },
  miniIcon:{ width:24, height:24, borderRadius:8, alignItems:'center', justifyContent:'center' },
  miniLabel:{ fontSize:10, fontWeight:'600', flex:1 },
  miniVal:{ fontSize:15, fontWeight:'800', lineHeight:18 },
  miniSub:{ fontSize:10, lineHeight:12 },
  card:{ borderRadius:16, borderWidth:1 },
  cardTitle:{ fontWeight:'700', fontSize:14 },
  chart:{ marginTop: 8, borderRadius:12, overflow:'hidden' },
  legend:{ flexDirection:'row', justifyContent:'center', gap:16, marginTop:4 },
  legendItem:{ flexDirection:'row', alignItems:'center', gap:6 },
  dot:{ width:8, height:8, borderRadius:4 },
  legendText:{ fontSize:11 },
  breakRow:{ flexDirection:'row', alignItems:'center', gap: 12 },
  breakIcon:{ width:36, height:36, borderRadius:8, alignItems:'center', justifyContent:'center' },
  breakName:{ fontWeight:'600', fontSize:13 },
  breakPct:{ fontSize:11 },
  breakAmt:{ fontWeight:'700', fontSize:13 },
  track:{ height:6, borderRadius:3, overflow:'hidden' },
  fill:{ height:6, borderRadius:3 },
  emptyChart:{ alignItems:'center', gap:4, paddingVertical:12 },
  emptyText:{ fontWeight:'600', fontSize:13 },
  emptySub:{ fontSize:11, textAlign:'center' },
});
