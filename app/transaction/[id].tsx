import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Dialog, Portal, Snackbar, Icon } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '@/src/context/AppContext';
import { formatIDR } from '@/src/utils/currency';
import { formatDateLong } from '@/src/utils/date';
import { useState, useRef } from 'react';
import { usePalette } from '@/src/hooks/usePalette';
import { useT } from '@/src/utils/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/src/constants/design';

export default function TransactionDetail(){
  const { id } = useLocalSearchParams<{id:string}>();
  const { transactions, categories, goals, deleteTransaction, settings } = useApp();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const p=usePalette();
  const insets=useSafeAreaInsets();
  const router=useRouter();
  const [del,setDel]=useState(false);
  const [snack,setSnack]=useState('');
  const [busy,setBusy]=useState(false);
  const [deleting,setDeleting]=useState(false);
  const busyRef=useRef(false);
  const deletingRef=useRef(false);
  const tx=transactions.find(t=>t.id===id);
  if(!tx) return (
    <>
      <Stack.Screen options={{ headerShown:false }} />
      <View style={[styles.wrap, { backgroundColor:p.bg, paddingTop:insets.top, alignItems:'center', justifyContent:'center' }]}><Text style={{ color:p.text }}>{tt('transaksiTidakDitemukan')}</Text></View>
    </>
  );
  const cat=categories.find(c=>c.id===tx.categoryId);
  const goal=goals.find(g=>g.id===tx.goalId);
  const meta = tx.type==='income'?{label:'Income',color:p.income}:tx.type==='expense'?{label:'Expense',color:p.expense}:tx.type==='saving'?{label:'Saving',color:p.saving}:{label:'Withdrawal',color:p.withdrawal};
  const title = tx.type==='saving'||tx.type==='withdrawal'? (goal?.name||meta.label) : (cat?.name||meta.label);
  const iconSrc = tx.type==='income' ? (cat?.icon||'wallet') : tx.type==='expense' ? (cat?.icon||'cart') : (goal?.icon|| (tx.type==='saving' ? 'piggy-bank' : 'ring'));

  return (
    <>
      <Stack.Screen options={{ headerShown:false }} />
      <View style={[styles.wrap, { backgroundColor:p.bg, paddingTop:insets.top }]}>
        <View style={[styles.header, { backgroundColor:p.card, borderColor:p.border }]}>
          <Text variant="titleMedium" style={[styles.headerTitle, { color:p.text }]}>{tt('detailTransaksi')}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: Spacing.sm, gap:12 }}>
          <Card style={[styles.card, { backgroundColor:p.card, borderColor:p.border }]}><Card.Content style={{alignItems:'center', gap:6}}>
            <View style={[styles.iconCircle, { backgroundColor:meta.color+'14' }]}><Icon source={iconSrc} size={28} color={meta.color} /></View>
            <Text variant="labelLarge" style={{ color:p.subText, fontWeight:'600' }}>{title}</Text>
            <Text variant="headlineSmall" style={{color:meta.color, fontWeight:'900'}}>{tx.type==='expense'||tx.type==='saving'?'−':'+'}{formatIDR(tx.amount)}</Text>
            <Text variant="bodySmall" style={{ color:p.subText }}>{meta.label} {cat?`• ${cat.name}`:''} {goal?`• ${goal.name}`:''}</Text>
            <Text variant="bodySmall" style={{ color:p.subText }}>{formatDateLong(tx.date)}</Text>
            {tx.note ? (
              <Card style={[styles.note, { backgroundColor:p.muted, borderColor:p.border }]}><Card.Content><Text variant="bodySmall" style={{ color:p.text }}>{tt('catatanLabel')} {tx.note}</Text></Card.Content></Card>
            ) : null}
          </Card.Content></Card>

          {(tx.type==='income'||tx.type==='expense') && (
            <View style={styles.actions}>
              <Button mode="contained" icon="pencil" loading={busy} disabled={busy||deleting} onPress={()=>{ if(busyRef.current) return; busyRef.current=true; setBusy(true); router.push(`/transaction/form?id=${tx.id}` as any); setTimeout(()=>{ busyRef.current=false; setBusy(false); },1000); }} buttonColor={p.primary} textColor="#FFF" style={styles.act}>{tt('editLabel')}</Button>
              <Button mode="outlined" icon="delete" disabled={busy||deleting} onPress={()=>{ if(busyRef.current||deletingRef.current) return; setDel(true); }} textColor={p.expense} style={[styles.act, { borderColor:p.border }]}>{tt('hapusLabel')}</Button>
            </View>
          )}
          {(tx.type==='saving'||tx.type==='withdrawal') && <Text variant="bodySmall" style={[styles.info, { color:p.subText }]}>{tt('editHapusSavingInfo')}</Text>}

          <Portal>
            <Dialog visible={del} onDismiss={()=>{ if(deletingRef.current) return; setDel(false); }} style={{ backgroundColor:p.card }}>
              <Dialog.Title style={{ color:p.text }}>{tt('hapusTransaksiTitle')}</Dialog.Title>
              <Dialog.Content><Text style={{ color:p.subText }}>{tt('hapusTransaksiDesc')}</Text></Dialog.Content>
              <Dialog.Actions>
                <Button disabled={deleting} onPress={()=>setDel(false)} textColor={p.subText}>{tt('batal')}</Button>
                <Button loading={deleting} disabled={deleting} textColor={p.expense} onPress={async()=>{ if(deletingRef.current) return; deletingRef.current=true; setDeleting(true); try{ await deleteTransaction(tx.id); setSnack(tt('dihapus')); setDel(false); setTimeout(()=>router.replace('/(tabs)/transactions'),300); } finally { setTimeout(()=>{ deletingRef.current=false; setDeleting(false); },1000); } }}>{tt('hapus')}</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
          <Snackbar visible={!!snack} onDismiss={()=>setSnack('')}>{snack}</Snackbar>
        </ScrollView>
      </View>
    </>
  );
}
const styles=StyleSheet.create({
  wrap:{ flex:1 },
  header:{ alignItems:'center', justifyContent:'center', paddingVertical:12, borderBottomWidth:1 },
  headerTitle:{ fontSize:16, fontWeight:'700', textAlign:'center' },
  card:{ borderRadius:16, borderWidth:1 },
  iconCircle:{ width:56, height:56, borderRadius:28, alignItems:'center', justifyContent:'center' },
  note:{ marginTop:8, width:'100%', borderWidth:1 },
  actions:{ flexDirection:'row', gap:8, marginTop:4 },
  act:{ borderRadius:12, flex:1 },
  info:{ textAlign:'center', marginTop:12 },
});
