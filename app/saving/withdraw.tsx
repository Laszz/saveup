import { ScrollView, StyleSheet, View, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button, Text, Chip, HelperText, Snackbar, Icon, Card } from 'react-native-paper';
import { useState, useRef } from 'react';
import { useApp } from '@/src/context/AppContext';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { parseAmount, formatIDR } from '@/src/utils/currency';
import { formatDateLong } from '@/src/utils/date';
import { usePalette } from '@/src/hooks/usePalette';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/src/constants/design';
import { useT } from '@/src/utils/i18n';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Withdraw(){
  const { goals, withdrawSaving, settings } = useApp();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const p=usePalette();
  const insets=useSafeAreaInsets();
  const router=useRouter();
  const { goalId } = useLocalSearchParams<{goalId?:string}>();
  const [selected,setSelected]=useState(goalId||goals[0]?.id||'');
  const [amount,setAmount]=useState(0);
  const [text,setText]=useState('');
  const [note,setNote]=useState('');
  const [dateObj,setDateObj]=useState(new Date());
  const [showPicker,setShowPicker]=useState(false);
  const [err,setErr]=useState<string|null>(null);
  const [snack,setSnack]=useState('');
  const [submitting,setSubmitting]=useState(false);
  const submittingRef=useRef(false);
  const goal=goals.find(g=>g.id===selected);
  const max=goal?.currentAmount||0;
  const dateLabel = formatDateLong(dateObj.toISOString());

  const submit=async()=>{
    if(submittingRef.current) return;
    submittingRef.current=true; setSubmitting(true);
    if(!selected){ submittingRef.current=false; setSubmitting(false); setErr(tt('pilihGoalError')); return; }
    if(!amount||amount<=0){ submittingRef.current=false; setSubmitting(false); setErr(tt('nominalHarus')); return; }
    if(amount>max){ submittingRef.current=false; setSubmitting(false); setErr(`${tt('melebihiTersedia')} ${formatIDR(max)}`); return; }
    try{
      await withdrawSaving(selected, amount, note, dateObj.toISOString());
      setSnack(tt('penarikanBerhasil'));
      setTimeout(()=>router.replace(`/goal/${selected}` as any),400);
    }catch(e:any){ setErr(e.message); } finally { setTimeout(()=>{ submittingRef.current=false; setSubmitting(false); },1000); }
  };

  if(goals.length===0) return (
    <>
      <Stack.Screen options={{ headerShown:false }} />
      <View style={[styles.wrap, { backgroundColor:p.bg, paddingTop:insets.top, padding: Spacing.sm, gap:12, justifyContent:'center', alignItems:'center' }]}>
        <Icon source="piggy-bank" size={48} color={p.subText} />
        <Text style={{ color:p.text, fontWeight:'700' }}>{tt('belumAdaGoal')}</Text>
        <Text style={{ color:p.subText, textAlign:'center' }}>{tt('buatGoalDuluWithdraw')}</Text>
      </View>
    </>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown:false }} />
      <KeyboardAvoidingView style={{ flex:1, backgroundColor:p.bg }} behavior={Platform.OS==='ios'?'padding':'padding'} keyboardVerticalOffset={insets.top}>
        <View style={[styles.wrap, { backgroundColor:p.bg, paddingTop:insets.top }]}>
          <View style={[styles.header, { backgroundColor:p.card, borderColor:p.border }]}>
            <Text variant="titleMedium" style={[styles.headerTitle, { color:p.text, textAlign:'center' }]}>{tt('ambilTabungan')}</Text>
          </View>
          <ScrollView contentContainerStyle={{padding: Spacing.sm, gap:16, paddingBottom: insets.bottom + 24}} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="interactive">
            {goal && (
              <Card style={[styles.goalCard, { backgroundColor:p.card, borderColor:p.border }]}>
                <Card.Content style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                  <View style={[styles.goalIcon, { backgroundColor:p.muted }]}><Icon source={goal.icon||'target'} size={20} color={p.primary} /></View>
                  <View style={{ flex:1 }}>
                    <Text style={[styles.goalName, { color:p.text }]}>{goal.name}</Text>
                    <Text style={[styles.goalSub, { color:p.subText }]}>{tt('tersedia')} {formatIDR(max)} • {goal.name}</Text>
                  </View>
                  <Text style={[styles.badge, { backgroundColor:max>0?p.primary+'14':p.muted, color:max>0?p.primary:p.subText }]}>{formatIDR(max)}</Text>
                </Card.Content>
              </Card>
            )}

            <View style={{ gap:8 }}>
              <Text style={[styles.label, { color:p.text }]}>{tt('pilihGoal')}</Text>
              <View style={styles.chips}>
                {goals.map(g=> <Chip key={g.id} selected={selected===g.id} onPress={()=>setSelected(g.id)} icon={()=><Icon source={g.icon||'target'} size={16} color={selected===g.id?'#FFF':p.text}/>} style={[styles.chip, { backgroundColor:p.card, borderColor:p.border }, selected===g.id && styles.chipActive]} textStyle={selected===g.id?styles.chipActiveText:[styles.chipText, { color:p.text }]} compact>{g.name} • {formatIDR(g.currentAmount||0)}</Chip>)}
              </View>
            </View>

            <View style={{ gap:8 }}>
              <Text style={[styles.label, { color:p.text }]}>{tt('nominalRequired')}</Text>
              <TextInput value={text} onChangeText={(t)=>{const n=parseAmount(t); setAmount(n); setText(n?formatIDR(n):'');}} keyboardType="numeric" mode="outlined" placeholder="Rp 100.000" style={[styles.input, { backgroundColor:p.card }]} outlineStyle={{ borderRadius:12 }} textColor={p.text} placeholderTextColor={p.subText} cursorColor={p.primary} selectionColor={p.primary} error={amount>max} left={<TextInput.Icon icon="cash" color={p.subText} />} />
              {amount>max && <HelperText type="error" visible>{tt('jumlahMelebihi')} {formatIDR(max)}</HelperText>}
            </View>

            <View style={{ gap:8 }}>
              <Text style={[styles.label, { color:p.text }]}>{tt('catatan')} <Text style={{ color:p.subText, fontWeight:'400' }}>{tt('opsional')}</Text></Text>
              <TextInput value={note} onChangeText={setNote} mode="outlined" placeholder={tt('catatanPlaceholderWithdraw')} style={[styles.input, { backgroundColor:p.card }]} outlineStyle={{ borderRadius:12 }} textColor={p.text} placeholderTextColor={p.subText} cursorColor={p.primary} selectionColor={p.primary} />
            </View>

            <View style={{ gap:8 }}>
              <Text style={[styles.label, { color:p.text }]}>{tt('tanggal')}</Text>
              <Pressable onPress={()=>setShowPicker(v=>!v)} style={[styles.dateBox, { backgroundColor:p.card, borderColor:p.border }]}>
                <Icon source="calendar" size={18} color={p.text} />
                <Text style={[styles.dateText, { color:p.text }]}>{dateLabel}</Text>
                <Icon source="calendar-month" size={18} color={p.subText} />
              </Pressable>
              {showPicker && (
                <DateTimePicker value={dateObj} mode="date" display={Platform.OS==='ios'?'inline':'default'} onChange={(_:any,d:any)=>{ if(d){ const nd=new Date(d); nd.setHours(dateObj.getHours(), dateObj.getMinutes(), 0, 0); setDateObj(nd); if(Platform.OS==='android') setShowPicker(false); } if(Platform.OS==='ios') setShowPicker(false); }} />
              )}
            </View>

            {err && <HelperText type="error" visible>{err}</HelperText>}
            <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting||amount>max||amount<=0} style={styles.btn} contentStyle={{ height:48 }} buttonColor={amount>0&&amount<=max? '#E02424' : undefined} textColor="#FFF">{tt('ambilTabungan')}</Button>
            <Snackbar visible={!!snack} onDismiss={()=>setSnack('')}>{snack}</Snackbar>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
const styles=StyleSheet.create({
  wrap:{ flex:1 },
  header:{ alignItems:'center', justifyContent:'center', paddingHorizontal:4, paddingVertical:12, borderBottomWidth:1 },
  headerTitle:{ fontSize:16, fontWeight:'700', textAlign:'center' },
  goalCard:{ borderRadius:12, borderWidth:1 },
  goalIcon:{ width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center' },
  goalName:{ fontWeight:'700', fontSize:14 },
  goalSub:{ fontSize:12, fontWeight:'500' },
  badge:{ fontSize:11, fontWeight:'700', paddingHorizontal:8, paddingVertical:4, borderRadius:8, overflow:'hidden' },
  label:{ fontSize:12, fontWeight:'600' },
  input:{ backgroundColor:'#FFF' },
  chips:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  chip:{ borderWidth:1, height:32 },
  chipActive:{ backgroundColor:'#0E5A3A', borderColor:'#0E5A3A' },
  chipText:{ fontSize:11 },
  chipActiveText:{ color:'#FFF', fontSize:11, fontWeight:'600' },
  dateBox:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1, borderRadius:12, paddingHorizontal:12, height:48 },
  dateText:{ flex:1, textAlign:'center', fontSize:15, fontWeight:'600' },
  btn:{ borderRadius:12 },
});
