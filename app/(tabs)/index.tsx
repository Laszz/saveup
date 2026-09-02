import { BalanceCard } from "@/src/components/BalanceCard";
import { EmptyState } from "@/src/components/EmptyState";
import { Palette, Radius, Spacing } from "@/src/constants/design";
import { useApp } from "@/src/context/AppContext";
import { usePalette } from "@/src/hooks/usePalette";
import { useT } from "@/src/utils/i18n";
import { formatCurrency, formatCurrencyShort, formatIDR, formatIDRShort, parseAmount } from "@/src/utils/currency";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Dialog, Icon, IconButton, Portal, ProgressBar, Snackbar, Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
  const { balance, goals, transactions, categories, refresh, settings } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const p = usePalette();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const curr=settings.currency||'IDR';
  const navRef=useRef(false);
  const go=(path:any)=>{ if(navRef.current) return; navRef.current=true; router.push(path); setTimeout(()=>navRef.current=false,800); };
  const [refreshing, setRefreshing] = useState(false);
  const [editIncomeOpen, setEditIncomeOpen]=useState(false);
  const [editIncomeText, setEditIncomeText]=useState('');
  const [editIncomeErr, setEditIncomeErr]=useState('');
  const [editSnack, setEditSnack]=useState('');
  const [savingEdit, setSavingEdit]=useState(false);
  const savingRef=useRef(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);
  const activeGoals = goals.filter((g) => (g.progress || 0) < 100);
  const topGoal = activeGoals[0];
  const recent = transactions.slice(0, 3);
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const catIconMap = new Map(categories.map((c) => [c.id, c.icon]));

  return (
    <View
      style={[styles.wrap, { paddingTop: insets.top, backgroundColor: p.bg }]}
    >
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.sm,
          paddingBottom: 96,
          gap: Spacing.sm,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Figma: avatar + SaveUp hijau + bell notifikasi + cog setting — jarak 8 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={[styles.avatar, { backgroundColor: p.card }]}
            />
            <Text style={[styles.saveUp, { color: p.text }]}>SaveUp</Text>
          </View>
          <View style={styles.headerRight}>
            <IconButton
              icon="bell-outline"
              size={20}
              iconColor={p.text}
              onPress={() => go("/notifications")}
              style={[
                styles.iconBtn,
                { backgroundColor: p.card, borderColor: p.border },
              ]}
            />
            <IconButton
              icon="cog-outline"
              size={20}
              iconColor={p.text}
              onPress={() => go("/settings")}
              style={[
                styles.iconBtn,
                { backgroundColor: p.card, borderColor: p.border },
              ]}
            />
          </View>
        </View>

        {/* Hero biru */}
        <BalanceCard balance={balance} transactions={transactions} />

        {balance.totalIncome===0 && (balance.totalExpense>0 || transactions.length>0) && (
          <Card style={[styles.incomeHint, { backgroundColor:p.card, borderColor:p.expense }]} mode="contained">
            <Card.Content style={{ gap:8 }}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                <View style={[styles.miniIcon, { backgroundColor:'#FEF2F2' }]}><Icon source="alert-circle" size={14} color="#DC2626" /></View>
                <Text style={[styles.statLabel, { color:p.expense, fontWeight:'700' }]}>{tt('incomeStill0')}</Text>
              </View>
              <Text style={[styles.cardSub, { color:p.subText }]}>{tt('youSpent')} {formatCurrencyShort(balance.totalExpense, curr)} {lang==='id' ? 'tapi belum ada pemasukan.' : 'but no income yet.'} {tt('tapCatat')}</Text>
            </Card.Content>
          </Card>
        )}

        {/* 3 stat cards - Pemasukan = edit total, Pengeluaran = tambah */}
        <View style={styles.statsRow}>
          <Card
            style={[
              styles.statCard,
              { backgroundColor: p.card, borderColor: p.border },
            ]}
            mode="contained"
            onPress={()=>{
              if(balance.totalIncome===0) go('/transaction/form?type=income');
              else { setEditIncomeText(formatCurrency(balance.totalIncome, curr).replace(/[^0-9]/g,'') ? formatCurrency(balance.totalIncome, curr) : ''); setEditIncomeErr(''); setEditIncomeOpen(true); }
            }}
          >
            <Card.Content style={styles.statContent}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4, flex:1 }}
              >
                <View style={[styles.miniIcon, { backgroundColor: "#E6F7ED" }]}>
                  <Icon source="arrow-down" size={12} color="#059669" />
                </View>
                <Text
                  variant="labelSmall"
                  style={[styles.statLabel, { color: p.subText, flex:1 }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {tt('pemasukan')}
                </Text>
              </View>
              <Text
                style={[styles.statVal, { color: p.text }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatCurrencyShort(balance.totalIncome, curr)}
              </Text>
            </Card.Content>
          </Card>
          <Card
            style={[
              styles.statCard,
              { backgroundColor: p.card, borderColor: p.border },
            ]}
            mode="contained"
            onPress={()=> go('/transaction/form?type=expense')}
          >
            <Card.Content style={styles.statContent}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4, flex:1 }}
              >
                <View style={[styles.miniIcon, { backgroundColor: "#FDE8E8" }]}>
                  <Icon source="arrow-up" size={12} color="#DC2626" />
                </View>
                <Text
                  variant="labelSmall"
                  style={[styles.statLabel, { color: p.subText, flex:1 }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {tt('pengeluaran')}
                </Text>
              </View>
              <Text
                style={[styles.statVal, { color: p.text }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatCurrencyShort(balance.totalExpense, curr)}
              </Text>
            </Card.Content>
          </Card>
          <Card
            style={[
              styles.statCard,
              { backgroundColor: p.card, borderColor: p.border },
            ]}
            mode="contained"
          >
            <Card.Content style={styles.statContent}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4, flex:1 }}
              >
                <View style={[styles.miniIcon, { backgroundColor: "#E0F2FE" }]}>
                  <Icon source="piggy-bank" size={12} color="#1C64F2" />
                </View>
                <Text
                  variant="labelSmall"
                  style={[styles.statLabel, { color: p.subText, flex:1 }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {tt('saving')}
                </Text>
              </View>
              <Text
                style={[styles.statVal, { color: p.text }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatCurrencyShort(balance.totalSaving, curr)}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Top Saving Goal - Figma card putih */}
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: p.text }]}>
            {tt('topSavingGoal')}
          </Text>
          <Text
            style={[styles.viewAll, { color: p.primary }]}
            onPress={() => go("/(tabs)/goals")}
          >
            {tt('viewAll')}
          </Text>
        </View>
        {topGoal ? (
          <Card
            style={[
              styles.goalCard,
              { backgroundColor: p.card, borderColor: p.border },
            ]}
            mode="contained"
            onPress={() => go(`/goal/${topGoal.id}` as any)}
          >
            <Card.Content
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.sm,
              }}
            >
              <View style={styles.goalIconBox}>
                <Icon
                  source={topGoal.icon || "beach"}
                  size={24}
                  color={p.primary}
                />
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[styles.goalName, { color: p.text }]}>
                    {topGoal.name}
                  </Text>
                  <Text
                    style={[styles.goalAmount, { color: p.subText }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatCurrencyShort(topGoal.currentAmount || 0, curr)} /{" "}
                    {formatCurrencyShort(topGoal.targetAmount, curr)}
                  </Text>
                </View>
                <ProgressBar
                  progress={(topGoal.progress || 0) / 100}
                  color="#0E5A3A"
                  style={[styles.bar, { backgroundColor: p.muted }]}
                />
              </View>
            </Card.Content>
          </Card>
        ) : (
          <EmptyState
            title={tt('belumAdaGoal')}
            desc={tt('buatTarget')}
            cta={tt('buatGoal')}
            onPress={() => go("/goal/form")}
          />
        )}

        {/* Recent Transactions - Figma grouped white card */}
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: p.text }]}>
            {tt('recentTransactions')}
          </Text>
          <Text
            style={[styles.viewAll, { color: p.primary }]}
            onPress={() => go("/(tabs)/transactions")}
          >
            {tt('seeAll')}
          </Text>
        </View>
        {recent.length === 0 ? (
          <EmptyState
            title={tt('belumAdaTransaksi')}
            desc={tt('buatTransaksi')}
            cta={tt('buatGoal')}
            onPress={() => go("/transaction/form?type=expense")}
          />
        ) : (
          <Card
            style={[
              styles.recentCard,
              { backgroundColor: p.card, borderColor: p.border },
            ]}
            mode="contained"
          >
            {recent.map((t, idx) => {
              const isExpense = t.type === "expense";
              const isIncome = t.type === "income";
              const isSaving = t.type === "saving";
              const isWithdrawal = t.type === "withdrawal";
              const catName = t.categoryId
                ? catMap.get(t.categoryId)
                : undefined;
              const catIcon = t.categoryId
                ? catIconMap.get(t.categoryId)
                : undefined;
              const goal = t.goalId ? goals.find((g) => g.id === t.goalId) : undefined;
              const goalIcon = goal?.icon;
              let bg = "#FFF7ED", iconCol="#F59E0B", iconSrc = goalIcon || "piggy-bank";
              if (isIncome) { bg="#E6F7ED"; iconCol="#059669"; iconSrc=catIcon||"wallet"; }
              else if (isExpense) { bg="#E0F2FE"; iconCol="#1C64F2"; iconSrc=catIcon||"cart"; }
              else if (isSaving) { bg="#DBEAFE"; iconCol="#1C64F2"; iconSrc=goalIcon||"piggy-bank"; }
              else if (isWithdrawal) { bg="#FEE2E2"; iconCol="#DC2626"; iconSrc=goalIcon||"ring"; }
              const title = t.note || goal?.name || catName || t.type;
              const sub = isIncome ? tt('pemasukan') : isSaving ? tt('saving') : isWithdrawal ? "Withdrawal" : (catName || tt('pengeluaran'));
              return (
                <View
                  key={t.id}
                  style={[
                    styles.row,
                    styles.rowBorder,
                    idx < recent.length - 1 ? { borderBottomColor: p.border, borderBottomWidth:1 } : { borderBottomWidth:0 },
                  ]}
                >
                  <View style={[styles.rowIcon, { backgroundColor: bg }]}>
                    <Icon source={iconSrc} size={18} color={iconCol} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: p.text }]}>
                      {t.note || title}
                    </Text>
                    <Text style={[styles.rowSub, { color: p.subText }]}>
                      {sub}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.rowAmount,
                      isIncome && { color: p.income },
                      isExpense && { color: p.expense },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {isIncome ? "+" : ""}
                    {formatCurrency(t.amount, curr)}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={editIncomeOpen} onDismiss={()=>setEditIncomeOpen(false)} style={{ backgroundColor:p.card }}>
          <Dialog.Title style={{ color:p.text }}>{lang==='en' ? 'Edit Total Income' : 'Edit Total Pemasukan'}</Dialog.Title>
          <Dialog.Content style={{ gap:12 }}>
            <View style={{ gap:4 }}>
              <Text style={{ color:p.text, fontWeight:'600' }}>{lang==='en' ? `Total Income :` : `Total Pemasukan :`} {formatCurrency(balance.totalIncome,curr)}</Text>
              <Text style={{ color:p.text, fontWeight:'600' }}>{lang==='en' ? `Current Balance :` : `Saldo Sekarang :`} {formatCurrency(balance.balance,curr)}</Text>
              <Text style={{ color:p.subText }}>{lang==='en' ? `Set new total income` : `Atur total pemasukan baru`}</Text>
            </View>
            <TextInput value={editIncomeText} onChangeText={(t)=>{ const n=parseAmount(t); setEditIncomeText(n?formatCurrency(n,curr):''); setEditIncomeErr(''); }} mode="outlined" placeholder={formatCurrency(1200000,curr)} keyboardType="numeric" style={{ backgroundColor:p.card }} outlineStyle={{ borderRadius:12 }} textColor={p.text} placeholderTextColor={p.subText} cursorColor={p.primary} />
            {editIncomeErr ? <Text style={{ color:p.expense, fontSize:12 }}>{editIncomeErr}</Text> : null}
            <Text style={{ color:p.subText, fontSize:11 }}>{lang==='en' ? 'Will create adjustment transaction for the difference.' : 'Akan buat transaksi penyesuaian untuk selisihnya.'}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={()=>setEditIncomeOpen(false)} textColor={p.subText}>{lang==='en'?'Cancel':'Batal'}</Button>
            <Button
              loading={savingEdit} disabled={savingEdit}
              onPress={async()=>{
                if(savingRef.current) return;
                const n=parseAmount(editIncomeText);
                if(!n || n<=0){ setEditIncomeErr(lang==='en'?'Amount must be >0':'Nominal harus >0'); return; }
                savingRef.current=true; setSavingEdit(true);
                try{
                  const oldTotal=balance.totalIncome;
                  const delta=n - oldTotal;
                  if(delta===0){ setEditIncomeOpen(false); return; }
                  const catId=categories.find(c=>c.type==='income')?.id || 'inc_gaji';
                  const db = await (await import('@/src/database/db')).getDb();
                  const { genId } = await import('@/src/database/db');
                  const id=genId(); const now=new Date().toISOString();
                  await db.runAsync('INSERT INTO transactions (id,type,amount,categoryId,goalId,note,date,createdAt) VALUES (?,?,?,?,?,?,?,?)', [id,'income',delta,catId,null, lang==='en'?'Total income adjustment':'Penyesuaian total pemasukan', now, now]);
                  await refresh();
                  setEditSnack(lang==='en' ? `Total income updated to ${formatCurrency(n,curr)}` : `Total pemasukan jadi ${formatCurrency(n,curr)}`);
                  setEditIncomeOpen(false);
                } catch(e:any){ setEditIncomeErr(e.message); } finally { setTimeout(()=>{ savingRef.current=false; setSavingEdit(false); },800); }
              }}
            >{lang==='en'?'Save':'Simpan'}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar visible={!!editSnack} onDismiss={()=>setEditSnack('')} duration={2000} wrapperStyle={{ top:insets.top+12, bottom:'auto' }} style={{ backgroundColor:p.card, borderColor:p.border, borderWidth:1 }}>{editSnack}</Snackbar>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFF" },
  saveUp: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0E5A3A",
    letterSpacing: -0.3,
  },
  iconBtn: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    margin: 0,
  },
  statsRow: { flexDirection: "row", gap: Spacing.xs },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 1,
  },
  statContent: { gap: 8, paddingVertical: 10, alignItems: "flex-start", flex:1 },
  miniIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    color: Palette.subText,
    fontWeight: "600",
    fontSize: 10,
    letterSpacing: 0.1,
    flexShrink:1,
  },
  statVal: {
    fontSize: 14,
    fontWeight: "800",
    color: Palette.text,
    lineHeight: 18,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: Palette.text },
  viewAll: { fontSize: 12, fontWeight: "600", color: Palette.primary },
  goalCard: {
    borderRadius: Radius.lg,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  goalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  goalName: { fontWeight: "600", color: Palette.text, fontSize: 14 },
  goalAmount: { fontSize: 12, color: Palette.subText, fontWeight: "500" },
  bar: { height: 6, borderRadius: 3, backgroundColor: "#E2E8F0" },
  recentCard: {
    borderRadius: Radius.lg,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  rowBorder: { borderBottomWidth: 1 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontWeight: "600", color: Palette.text, fontSize: 14 },
  rowSub: { color: Palette.subText, fontSize: 12 },
  rowAmount: { fontWeight: "700", fontSize: 14 },
  emptyText: { color: Palette.subText, textAlign: "center" },
  incomeHint:{ borderRadius:16, borderWidth:1, elevation:1 },
  cardSub:{ color: Palette.subText, fontSize:12 },
  quickRow:{ flexDirection:'row', gap:8 },
  quickBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, height:40, borderRadius:12, borderWidth:1 },
  quickIcon:{ width:24, height:24, borderRadius:12, alignItems:'center', justifyContent:'center' },
  quickText:{ fontSize:13, fontWeight:'600' },
});
