import { ScrollView, StyleSheet, View, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput, Button, Text, HelperText, Snackbar, Icon, IconButton } from 'react-native-paper';
import { useState, useRef } from 'react';
import { useApp } from '@/src/context/AppContext';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { validateAmount } from '@/src/utils/validation';
import { Spacing } from '@/src/constants/design';
import { usePalette } from '@/src/hooks/usePalette';
import { useT } from '@/src/utils/i18n';
import { formatCurrency } from '@/src/utils/currency';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateLong } from '@/src/utils/date';

const EXPENSE_CATS = [
  { id:'exp_makanan', name:'Makanan', icon:'silverware-fork-knife', bg:'#FFE4E6', col:'#E11D48' },
  { id:'exp_transportasi', name:'Transport', icon:'bus', bg:'#DBEAFE', col:'#1D4ED8' },
  { id:'exp_belanja', name:'Belanja', icon:'shopping', bg:'#DBEAFE', col:'#1D4ED8' },
  // ponytail: receipt kadang tidak ada di MCI lama, pakai file-document yang pasti ada
  { id:'exp_tagihan', name:'Tagihan', icon:'file-document-outline', bg:'#DBEAFE', col:'#1D4ED8' },
];
const INCOME_CATS = [
  { id:'inc_gaji', name:'Gaji', icon:'wallet', bg:'#E6F7ED', col:'#059669' },
  { id:'inc_freelance', name:'Freelance', icon:'laptop', bg:'#DBEAFE', col:'#1D4ED8' },
  { id:'inc_hadiah', name:'Hadiah', icon:'gift', bg:'#FEF3C7', col:'#D97706' },
  { id:'inc_investasi', name:'Investasi', icon:'trending-up', bg:'#E0F2FE', col:'#0284C7' },
];

function formatDisplay(n:number){
  if(!n) return '';
  return n.toLocaleString('id-ID');
}
function parseDisplay(s:string){
  const digits=s.replace(/[^0-9]/g,'');
  return digits? parseInt(digits,10):0;
}

export default function TransactionForm(){
  const { addTransaction, updateTransaction, transactions, settings } = useApp();
  const p=usePalette();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const curr=settings.currency||'IDR';
  const symbol = curr==='USD' ? '$' : curr==='IDR' ? 'Rp' : curr;
  const insets=useSafeAreaInsets();
  const router=useRouter();
  const params=useLocalSearchParams<{type?:string, id?:string}>();
  const editing = params.id ? transactions.find(t=>t.id===params.id) : null;
  const initType = (editing?.type || params.type || 'expense') as 'income'|'expense';
  const [type,setType]=useState<'income'|'expense'>(initType==='income'?'income':'expense');
  const [amount,setAmount]=useState(editing?.amount||0);
  const [amountText,setAmountText]=useState(editing?.amount? formatDisplay(editing.amount):'');
  const [note,setNote]=useState(editing?.note||'');
  const [dateObj,setDateObj]=useState(editing?.date ? new Date(editing.date) : new Date());
  const [showPicker,setShowPicker]=useState(false);
  const [catId,setCatId]=useState(editing?.categoryId||'');
  const [err,setErr]=useState<string|null>(null);
  const [snack,setSnack]=useState('');
  const [submitting,setSubmitting]=useState(false);
  const submittingRef=useRef(false);

  const isExpense = type==='expense';
  const cats = isExpense ? EXPENSE_CATS : INCOME_CATS;
  const isLockedFromKeuangan = !!params.type && !editing;

  const dateStr = formatDateLong(dateObj.toISOString());

  const submit=async()=>{
    if(submittingRef.current) return;
    submittingRef.current=true; setSubmitting(true);
    const e=validateAmount(amount);
    if(e){ submittingRef.current=false; setSubmitting(false); setErr(e); return; }
    if(!catId){ submittingRef.current=false; setSubmitting(false); setErr(tt('pilihKategoriError')); return; }
    const payload = { type, amount, categoryId:catId, note, date: dateObj.toISOString() };
    try{
      if(editing) await updateTransaction(editing.id, payload);
      else await addTransaction(payload);
      setSnack(tt('transaksiDisimpan'));
      setTimeout(()=> router.replace('/(tabs)/transactions'),400);
    }catch(e:any){ setErr(e.message); } finally { setTimeout(()=>{ submittingRef.current=false; setSubmitting(false); },1000); }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown:false }} />
      <KeyboardAvoidingView style={{ flex:1, backgroundColor: p.bg }} behavior={Platform.OS==='ios'?'padding':'padding'} keyboardVerticalOffset={insets.top}>
        <View style={[styles.wrap, { backgroundColor: p.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { backgroundColor: p.card, borderColor: p.border, justifyContent:'center', alignItems:'center' }]}>
          <Text style={[styles.headerTitle, { color: p.text, textAlign:'center' }]}>{editing ? (editing.type==='income' ? (lang==='en' ? 'Edit Income' : 'Edit Pemasukan') : (lang==='en' ? 'Edit Expense' : 'Edit Pengeluaran')) : isLockedFromKeuangan ? (isExpense ? tt('tambahPengeluaran') : tt('tambahPemasukan')) : tt('tambahTransaksi')}</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: Spacing.sm, gap: 16, paddingBottom: insets.bottom + 140 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="interactive">
        {editing && <HelperText type="info" visible>{editing.type==='income'?tt('modeEditIncome'):tt('modeEditExpense')}</HelperText>}
        {!editing && !isLockedFromKeuangan && (
          <View style={[styles.toggleWrap, { backgroundColor: p.muted }]}>
            <Pressable onPress={()=>setType('expense')} style={[styles.toggleBtn, isExpense && [styles.toggleActive, { backgroundColor: p.card, borderColor: p.border }]]}>
              <Text style={[styles.toggleText, { color: p.subText }, isExpense && { color: p.expense }]}>{tt('pengeluaran')}</Text>
            </Pressable>
            <Pressable onPress={()=>setType('income')} style={[styles.toggleBtn, !isExpense && [styles.toggleActive, { backgroundColor: p.card, borderColor: p.border }]]}>
              <Text style={[styles.toggleText, { color: p.subText }, !isExpense && { color: p.income }]}>{tt('pemasukan')}</Text>
            </Pressable>
          </View>
        )}


        {/* Nominal — Rp + angka format ribuan, tanpa garis bawah & tanpa preview */}
        <View style={[styles.nominalWrap, { backgroundColor: p.card, borderColor: p.border }]}>
          <Text style={[styles.nominalLabel, { color: p.text }]}>{tt('nominal')}</Text>
          <View style={styles.nominalRow}>
            <Text style={[styles.rp, { color: p.text }]}>{symbol}</Text>
            <TextInput
              value={amountText}
              onChangeText={(t)=>{
                const n=parseDisplay(t);
                setAmount(n);
                setAmountText(formatDisplay(n));
              }}
              keyboardType="numeric"
              placeholder="0"
              style={[styles.nominalInput, { backgroundColor: p.card }]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={p.text}
              placeholderTextColor={p.subText}
              cursorColor={p.primary}
              selectionColor={p.primary}
              mode="flat"
              dense
              contentStyle={{ fontSize: amountText.length>10 ? 28 : amountText.length>7 ? 32 : 36, fontWeight:'800', textAlign:'left' }}
            />
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={[styles.sectionLabel, { color: p.text }]}>{tt('kategori')}</Text>
          <View style={styles.catRow}>
            {cats.slice(0,4).map(c=> (
              <Pressable key={c.id} onPress={()=>setCatId(c.id)} style={[styles.catCard, { backgroundColor: p.card, borderColor: p.border }, catId===c.id && [styles.catCardActive, { borderColor: p.primary, backgroundColor: p.primary+'14' }]]}>
                <View style={[styles.catIcon,{ backgroundColor:c.bg }]}><Icon source={c.icon} size={20} color={c.col} /></View>
                <Text style={[styles.catName, { color: p.text }, catId===c.id && { color: p.primary, fontWeight:'700' }]} numberOfLines={1}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={[styles.sectionLabel, { color: p.text }]}>{tt('tanggal')}</Text>
          <Pressable onPress={()=>setShowPicker(v=>!v)} style={[styles.dateBox, { backgroundColor: p.card, borderColor: p.border }]}>
            <Icon source="calendar" size={18} color={p.text} />
            <Text style={[styles.dateText, { color: p.text }]}>{dateStr}</Text>
            <Icon source="calendar-month" size={18} color={p.subText} />
          </Pressable>
          {showPicker && (
            <DateTimePicker value={dateObj} mode="date" display={Platform.OS==='ios'?'inline':'default'} onChange={(_:any,d:any)=>{ if(d){ const nd=new Date(d); nd.setHours(dateObj.getHours(), dateObj.getMinutes(), 0, 0); setDateObj(nd); if(Platform.OS==='android') setShowPicker(false); }}} />
          )}
        </View>

        <View style={{ gap: 8 }}>
          <Text style={[styles.sectionLabel, { color: p.text }]}>{tt('catatanOpsional')}</Text>
          <View style={[styles.noteBox, { backgroundColor: p.card, borderColor: p.border }]}>
            <View style={{ marginTop:6 }}><Icon source="note-edit-outline" size={18} color={p.subText} /></View>
            <TextInput
              value={note}
              onChangeText={setNote}
              mode="flat"
              placeholder={tt('tambahDetailIncome')}
              style={[styles.noteInput, { backgroundColor: 'transparent' }]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              multiline
              numberOfLines={2}
              placeholderTextColor={p.subText}
              textColor={p.text}
              cursorColor={p.primary}
              selectionColor={p.primary}
              dense={false}
              scrollEnabled
            />
          </View>
        </View>

        {err && <HelperText type="error" visible>{err}</HelperText>}
      </ScrollView>

        <View style={[styles.bottom, { backgroundColor: p.card, borderColor: p.border, paddingBottom: insets.bottom + Spacing.sm }]}>
          <Button mode="contained" onPress={submit} loading={submitting} disabled={submitting} style={styles.saveBtn} contentStyle={{ height:52 }} buttonColor="#0E5A3A" textColor="#FFF" icon="content-save-outline">{tt('simpanTransaksi')}</Button>
        </View>
        <Snackbar visible={!!snack} onDismiss={()=>setSnack('')}>{snack}</Snackbar>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
const styles=StyleSheet.create({
  wrap:{ flex:1 },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth:1 },
  close:{ margin:0 },
  headerTitle:{ fontSize:16, fontWeight:'700' },
  toggleWrap:{ flexDirection:'row', borderRadius:12, padding:4, gap:4 },
  toggleBtn:{ flex:1, height:40, borderRadius:8, alignItems:'center', justifyContent:'center', backgroundColor:'transparent' },
  toggleActive:{ elevation:1, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:4, borderWidth:1 },
  toggleText:{ fontSize:14, fontWeight:'600' },
  nominalWrap:{ alignItems:'center', gap:8, paddingVertical:12, borderRadius:16, borderWidth:1, paddingHorizontal: Spacing.sm },
  nominalLabel:{ fontSize:13, fontWeight:'600' },
  nominalRow:{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:12, width:'100%' },
  rp:{ fontSize:28, fontWeight:'800' },
  nominalInput:{ flex:1, backgroundColor:'transparent', paddingHorizontal:0, maxWidth:220 },
  sectionLabel:{ fontSize:13, fontWeight:'600' },
  catRow:{ flexDirection:'row', gap:12, justifyContent:'space-between' },
  catCard:{ flex:1, borderRadius:12, borderWidth:1, alignItems:'center', paddingVertical:14, gap:8 },
  catCardActive:{ borderWidth:1.5 },
  catIcon:{ width:48, height:48, borderRadius:24, alignItems:'center', justifyContent:'center' },
  catName:{ fontSize:12, fontWeight:'500', textAlign:'center' },
  dateBox:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1, borderRadius:12, paddingHorizontal:12, height:48 },
  dateText:{ flex:1, textAlign:'center', fontSize:15, fontWeight:'600' },
  noteBox:{ flexDirection:'row', gap:10, borderWidth:1, borderRadius:12, paddingHorizontal:12, paddingTop:10, paddingBottom:10, height:84, alignItems:'flex-start' },
  noteInput:{ flex:1, backgroundColor:'transparent', paddingHorizontal:0, paddingVertical:2, fontSize:13, height:62, textAlignVertical:'top' },
  bottom:{ position:'absolute', bottom:0, left:0, right:0, borderTopWidth:1, padding: Spacing.sm, paddingBottom: 16 },
  saveBtn:{ borderRadius:12 },
});
