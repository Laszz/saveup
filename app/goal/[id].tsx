import { TransactionItem } from "@/src/components/TransactionItem";
import { Spacing } from "@/src/constants/design";
import { useApp } from "@/src/context/AppContext";
import { usePalette } from "@/src/hooks/usePalette";
import { formatIDR } from "@/src/utils/currency";
import { formatDateID } from "@/src/utils/date";
import { useT } from "@/src/utils/i18n";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Dialog,
  Icon,
  Portal,
  ProgressBar,
  Snackbar,
  Text
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, transactions, deleteGoal, settings } = useApp();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const router = useRouter();
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const navRef=useRef(false);
  const go=(path:any)=>{ if(navRef.current) return; navRef.current=true; router.push(path); setTimeout(()=>navRef.current=false,800); };
  const [del, setDel] = useState(false);
  const [snack, setSnack] = useState("");
  const goal = goals.find((g) => g.id === id);
  if (!goal)
    return (
      <View
        style={[
          styles.wrap,
          {
            backgroundColor: p.bg,
            paddingTop: insets.top,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ color: p.text }}>{tt('goalTidakDitemukan')}</Text>
      </View>
    );
  const rel = transactions
    .filter((t) => t.goalId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pct = (goal.progress || 0) / 100;
  const isDone = (goal.progress || 0) >= 100;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={[styles.wrap, { backgroundColor: p.bg, paddingTop: insets.top }]}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: p.card, borderColor: p.border },
          ]}
        >
          <Text
            variant="titleMedium"
            style={[styles.headerTitle, { color: p.text, textAlign:'center' }]}
          >
            {tt('detailGoal')}
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{
            padding: Spacing.sm,
            gap: 12,
            paddingBottom: 24,
          }}
        >
          <Card
            style={[
              styles.hero,
              { backgroundColor: p.card, borderColor: p.border },
              isDone && {
                backgroundColor: p.secondary + "12",
                borderColor: p.secondary,
              },
            ]}
          >
            <Card.Content style={{ alignItems: "center", gap: 6 }}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: p.primary + "14" },
                ]}
              >
                <Icon
                  source={goal.icon || "target"}
                  size={36}
                  color={p.primary}
                />
              </View>
              <Text
                variant="titleLarge"
                style={[styles.name, { color: p.text }]}
              >
                {goal.name}
              </Text>
              <Text
                variant="headlineSmall"
                style={[styles.cur, { color: p.primary }]}
              >
                {formatIDR(goal.currentAmount || 0)}
              </Text>
              <Text variant="bodySmall" style={{ color: p.subText }}>
                {tt('terkumpulDari')} {formatIDR(goal.targetAmount)}
              </Text>
              {isDone && (
                <Text
                  style={[
                    styles.cele,
                    { backgroundColor: p.secondary, color: "#FFF" },
                  ]}
                >
                  {tt('targetTercapai')}
                </Text>
              )}
              <ProgressBar
                progress={pct}
                color={isDone ? p.secondary : p.primary}
                style={[styles.bar, { backgroundColor: p.muted }]}
              />
              <Text variant="labelSmall" style={{ color: p.subText }}>
                {Math.round(goal.progress || 0)}% •{" "}
                {formatIDR(goal.currentAmount || 0)} /{" "}
                {formatIDR(goal.targetAmount)}
              </Text>
              {goal.targetDate && (
                <Text
                  variant="bodySmall"
                  style={[styles.date, { color: p.subText }]}
                >
                  {tt('targetLabel')} {formatDateID(goal.targetDate)}
                </Text>
              )}
              {!isDone && goal.targetDate && (
                <Text
                  variant="bodySmall"
                  style={[styles.est, { color: p.secondary }]}
                >
                  {tt('sisa')}{" "}
                  {formatIDR(
                    Math.max(0, goal.targetAmount - (goal.currentAmount || 0)),
                  )}{" "}
                  {(() => {
                    const diff = Math.ceil(
                      (new Date(goal.targetDate).getTime() - Date.now()) /
                        86400000 /
                        30,
                    );
                    if (diff > 0)
                      return `• ~${formatIDR(Math.ceil(Math.max(0, goal.targetAmount - (goal.currentAmount || 0)) / diff))}${tt('perBulan')}`;
                    return "";
                  })()}
                </Text>
              )}
            </Card.Content>
          </Card>

          <View style={styles.actions}>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => go(`/saving/add?goalId=${goal.id}` as any)}
              style={styles.act}
              buttonColor={p.primary}
              textColor="#FFF"
            >
              {tt('tambahTabungan')}
            </Button>
            <Button
              mode="outlined"
              icon="minus"
              onPress={() => go(`/saving/withdraw?goalId=${goal.id}` as any)}
              textColor={p.primary}
              style={{ borderColor: p.border }}
            >
              {tt('ambilTabungan')}
            </Button>
          </View>

          <Text variant="titleSmall" style={{ color: p.text, marginTop: 4 }}>
            {tt('riwayatMenabung')}
          </Text>
          {rel.length === 0 ? (
            <Card
              style={{
                backgroundColor: p.card,
                borderColor: p.border,
                borderWidth: 1,
              }}
            >
              <Card.Content>
                <Text variant="bodySmall" style={{ color: p.subText }}>
                  {tt('belumAdaTransaksiMenabung')}
                </Text>
              </Card.Content>
            </Card>
          ) : (
            rel.map((t) => (
              <TransactionItem key={t.id} tx={t} goalName={goal.name} goalIcon={goal.icon} />
            ))
          )}

          <View style={[styles.danger, { borderTopColor: p.border }]}>
            <Button
              icon="pencil"
              onPress={() => go(`/goal/form?id=${goal.id}` as any)}
              textColor={p.primary}
            >
              {tt('editGoal')}
            </Button>
            <Button
              icon="delete"
              textColor={p.expense}
              onPress={() => { if(navRef.current) return; setDel(true); }}
            >
              {tt('hapusGoal')}
            </Button>
          </View>

          <Portal>
            <Dialog
              visible={del}
              onDismiss={() => setDel(false)}
              style={{ backgroundColor: p.card }}
            >
              <Dialog.Title style={{ color: p.text }}>{tt('hapusGoalTitle')}</Dialog.Title>
              <Dialog.Content>
                <Text style={{ color: p.subText }}>
                  {tt('hapusGoalDesc')}
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setDel(false)} textColor={p.subText}>
                  {tt('batal')}
                </Button>
                <Button
                  textColor={p.expense}
                  onPress={async () => {
                    await deleteGoal(goal.id);
                    setSnack(tt('goalDihapus'));
                    setDel(false);
                    setTimeout(() => router.replace("/(tabs)/goals"), 400);
                  }}
                >
                  {tt('hapus')}
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
          <Snackbar visible={!!snack} onDismiss={() => setSnack("")}>
            {snack}
          </Snackbar>
        </ScrollView>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", textAlign:'center' },
  hero: { borderRadius: 16, borderWidth: 1 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontWeight: "800", marginTop: 4, textAlign: "center" },
  cur: { fontWeight: "900", marginTop: 2, textAlign: "center" },
  bar: { height: 10, borderRadius: 5, marginTop: 8, width: "100%" },
  date: { marginTop: 4, textAlign: "center" },
  est: { marginTop: 2, fontWeight: "600", textAlign: "center" },
  cele: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
    fontWeight: "700",
    textAlign: "center",
  },
  actions: { gap: 8, marginTop: 4 },
  act: { borderRadius: 12 },
  danger: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  sub: {},
});
