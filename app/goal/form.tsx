import { View, StyleSheet, ScrollView, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput, Button, Text, Chip, HelperText, Snackbar, Icon, Card } from 'react-native-paper';
import { useState, useRef } from 'react';
import { useApp } from '@/src/context/AppContext';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GOAL_ICONS } from '@/src/constants/categories';
import { validateGoal } from '@/src/utils/validation';
import { parseAmount, formatIDR } from '@/src/utils/currency';
import { formatDateLong } from '@/src/utils/date';
import { Spacing, Palette } from '@/src/constants/design';
import { usePalette } from '@/src/hooks/usePalette';
import { useT } from '@/src/utils/i18n';

export default function GoalForm(){
  const { goals, addGoal, updateGoal, settings } = useApp();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const p=usePalette();
  const insets=useSafeAreaInsets();
  const router=useRouter();
  const params=useLocalSearchParams<{id?:string}>();
  const editing = goals.find(g=>g.id===params.id);
  const [name,setName]=useState(editing?.name||'');
  const [icon,setIcon]=useState(editing?.icon||'target');
  const [target,setTarget]=useState(editing?.targetAmount||0);
  const [targetText,setTargetText]=useState(editing?.targetAmount?formatIDR(editing.targetAmount):'');
  const [dateObj,setDateObj]=useState<Date|null>(editing?.targetDate? new Date(editing.targetDate) : null);
  const [showPicker,setShowPicker]=useState(false);
  const [err,setErr]=useState<string| null>(null);
  const [snack,setSnack]=useState('');
  const [submitting,setSubmitting]=useState(false);
  const submittingRef=useRef(false);

  const dateLabel = dateObj ? formatDateLong(dateObj.toISOString()) : '';

  const submit=async()=>{
    if(submittingRef.current) return;
    submittingRef.current=true; setSubmitting(true);
    const e=validateGoal(name,target);
    if(e){ submittingRef.current=false; setSubmitting(false); setErr(e); return; }
    try{
      const targetDate = dateObj ? dateObj.toISOString() : undefined;
      if(editing) await updateGoal(editing.id,{ name, icon, targetAmount:target, targetDate });
      else await addGoal({ name, icon, targetAmount:target, targetDate });
      setSnack(tt('goalBerhasilDisimpan'));
      setTimeout(()=> router.replace('/(tabs)/goals'),500);
    }catch(e:any){ setErr(e.message); } finally { setTimeout(()=>{ submittingRef.current=false; setSubmitting(false); },1000); }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown:false }} />
      <KeyboardAvoidingView style={{ flex:1, backgroundColor: p.bg }} behavior={Platform.OS==='ios'?'padding':'padding'} keyboardVerticalOffset={insets.top}>
        <View style={[styles.wrap, { backgroundColor: p.bg, paddingTop: insets.top }]}>
          <ScrollView contentContainerStyle={{padding: Spacing.sm, gap: 16, paddingBottom: insets.bottom + 120}} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="interactive">
          <Text style={[styles.title, { color: p.text }]}>{editing?tt('editGoalTitle'):tt('buatGoalTitle')}</Text>
          <Card style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]} mode="contained">
            <Card.Content style={{ gap: 16 }}>
              <Text style={[styles.label, { color: p.text }]}>{tt('namaGoal')} *</Text>
              <TextInput value={name} onChangeText={setName} mode="outlined" placeholder={tt('namaGoalPlaceholder')} style={[styles.input, { backgroundColor: p.card }]} outlineStyle={{ borderRadius:12 }} textColor={p.text} placeholderTextColor={p.subText} cursorColor={p.primary} selectionColor={p.primary} />

              <Text style={[styles.label, { color: p.text }]}>{tt('iconLabel')}</Text>
              <View style={styles.icons}>
                {GOAL_ICONS.map(ic=> (
                  <Chip
                    key={ic}
                    selected={icon===ic}
                    onPress={()=>setIcon(ic)}
                    icon={()=><Icon source={ic} size={16} color={icon===ic?'#FFF':p.text}/>}
                    style={[styles.chip, { backgroundColor: p.card, borderColor: p.border }, icon===ic && styles.chipActive]}
                    textStyle={icon===ic?styles.chipTextActive:[styles.chipText, { color: p.text }]}
                    compact
                  >{ic}</Chip>
                ))}
              </View>
              <View style={[styles.preview, { backgroundColor: p.bg, borderColor: p.border }]}>
                <View style={[styles.previewIcon, { backgroundColor: p.muted }]}><Icon source={icon} size={24} color={p.primary} /></View>
                <Text style={[styles.previewText, { color: p.text }]}>{name || tt('namaGoal')}</Text>
              </View>

              <Text style={[styles.label, { color: p.text }]}>{tt('targetTabungan')} *</Text>
              <TextInput value={targetText} onChangeText={(t)=>{const n=parseAmount(t); setTarget(n); setTargetText(n?formatIDR(n):'');}} keyboardType="numeric" mode="outlined" placeholder="Rp 15.000.000" style={[styles.input, { backgroundColor: p.card }]} outlineStyle={{ borderRadius:12 }} textColor={p.text} placeholderTextColor={p.subText} cursorColor={p.primary} selectionColor={p.primary} left={<TextInput.Icon icon="cash" color={p.subText} />} />

              <Text style={[styles.label, { color: p.text }]}>{tt('targetTanggal')} <Text style={{ color: p.subText, fontWeight:'400' }}>{tt('opsional')}</Text></Text>
              <Pressable onPress={()=>setShowPicker(v=>!v)} style={[styles.dateBox, { backgroundColor: p.card, borderColor: p.border }]}>
                <Icon source="calendar" size={18} color={p.text} />
                <Text style={[styles.dateText, { color: dateObj ? p.text : p.subText }]}>{dateObj ? dateLabel : tt('pilihTanggal')}</Text>
                <Icon source="calendar-month" size={18} color={p.subText} />
              </Pressable>
              {dateObj && <Text onPress={()=>{ setDateObj(null); setShowPicker(false); }} style={[styles.hint, { color: p.subText }]}>{tt('hapusTanggal')}</Text>}
              {showPicker && (
                <DateTimePicker value={dateObj||new Date()} mode="date" display={Platform.OS==='ios'?'inline':'default'} minimumDate={new Date()} onChange={(_:any,d:any)=>{ if(d){ setDateObj(d); if(Platform.OS==='android') setShowPicker(false); } if(Platform.OS==='ios') setShowPicker(false); }} />
              )}

              {err && <HelperText type="error" visible>{err}</HelperText>}
            </Card.Content>
          </Card>

            <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting} style={styles.btn} contentStyle={{ height:48 }} buttonColor="#0E5A3A" textColor="#FFF">{editing?tt('simpanPerubahan'):tt('buatGoalBtn')}</Button>
            <Snackbar visible={!!snack} onDismiss={()=>setSnack('')}>{snack}</Snackbar>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
const styles=StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#F8FAFC' },
  title:{ fontSize:20, fontWeight:'800', color: Palette.text, marginBottom: Spacing.xs },
  card:{ borderRadius:16, backgroundColor:'#FFF', borderWidth:1, borderColor:'#E2E8F0' },
  label:{ fontSize:12, fontWeight:'600', color: Palette.text },
  input:{ backgroundColor:'#FFF' },
  hint:{ fontSize:11, color: Palette.subText, marginTop:-4 },
  icons:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  chip:{ backgroundColor:'#FFF', borderWidth:1, borderColor:'#E2E8F0', height:32 },
  chipActive:{ backgroundColor:'#0E5A3A', borderColor:'#0E5A3A' },
  chipText:{ color: Palette.text, fontSize:11 },
  chipTextActive:{ color:'#FFF', fontSize:11, fontWeight:'600' },
  preview:{ flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#F8FAFC', borderRadius:12, padding:12, borderWidth:1, borderColor:'#E2E8F0' },
  previewIcon:{ width:40, height:40, borderRadius:8, backgroundColor:'#EFF6FF', alignItems:'center', justifyContent:'center' },
  previewText:{ fontWeight:'600', color: Palette.text },
  btn:{ borderRadius:12 },
  cancel:{ borderRadius:12, borderColor:'#E2E8F0' },
  dateBox:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1, borderRadius:12, paddingHorizontal:12, height:48 },
  dateText:{ flex:1, textAlign:'center', fontSize:15, fontWeight:'600' },
});
