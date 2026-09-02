import { useApp } from "@/src/context/AppContext";
import { usePalette } from "@/src/hooks/usePalette";
import { useT } from "@/src/utils/i18n";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Card,
  HelperText,
  Icon,
  SegmentedButtons,
  Snackbar,
  Switch,
  Text,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function SettingsScreen() {
  const { settings, setSettings } = useApp();
  const p = usePalette();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const insets=useSafeAreaInsets();
  const router = useRouter();
  const [snack, setSnack] = useState("");
  const [snackKey, setSnackKey] = useState(0);
  const [time, setTime] = useState(settings.reminderTime || "20:00");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeErr, setTimeErr] = useState("");
  const [savingTime, setSavingTime] = useState(false);
  const savingRef=useRef(false);
  const snackRef=useRef(false);
  const showSnack=(msg:string)=>{
    if(snackRef.current) return;
    snackRef.current=true;
    setSnack(msg);
    setSnackKey(k=>k+1);
    setTimeout(()=>{ snackRef.current=false; },1200);
  };

  const isValidTime = (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
  const timeDate = (() => {
    const [h, m] = (isValidTime(time) ? time : "20:00").split(":").map(Number);
    const d = new Date(); d.setHours(h, m, 0, 0); return d;
  })();

  const toggleReminder = async (val: boolean) => {
    if(snackRef.current) return;
    if (val) {
      if (Platform.OS === "web") {
        showSnack("Reminder tidak tersedia di web");
        return;
      }
      // ponytail: always allow picking time before enabling — fallback to 20:00 if invalid instead of blocking
      let t = time;
      if (!isValidTime(t)) { t = "20:00"; setTime(t); setTimeErr(""); }
      const perm = await Notifications.requestPermissionsAsync();
      // @ts-ignore
      const status =
        (perm as any).status || (perm as any).granted ? "granted" : "denied";
      if (status !== "granted") {
        showSnack("Izin notifikasi ditolak, pengingat mati");
        await setSettings({ reminderEnabled: false });
        return;
      }
      await Notifications.cancelAllScheduledNotificationsAsync();
      const [h, m] = t.split(":").map(Number);
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "💰 Saatnya menabung!",
            body: "Jangan lupa menambahkan tabungan hari ini.",
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: h, minute: m } as any,
        });
      } catch {
        // fallback for older SDK shape
        await Notifications.scheduleNotificationAsync({
          content: { title: "💰 Saatnya menabung!", body: "Jangan lupa menambahkan tabungan hari ini." },
          trigger: { type: 'daily', hour: h, minute: m } as any,
        });
      }
      showSnack(`Pengingat aktif jam ${t}`);
      await setSettings({ reminderEnabled: val, reminderTime: t });
      return;
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      showSnack("Pengingat dimatikan");
    }
    await setSettings({ reminderEnabled: val, reminderTime: time });
  };

  const saveTime = async () => {
    if(savingRef.current) return;
    if (!isValidTime(time)) { setTimeErr("Format jam harus HH:mm, contoh 20:00 (00-23:00-59)"); return; }
    savingRef.current=true; setSavingTime(true); setTimeErr("");
    try {
      await setSettings({ reminderTime: time });
      if (settings.reminderEnabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        const [h, m] = time.split(":").map(Number);
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "💰 Saatnya menabung!",
              body: "Jangan lupa menambahkan tabungan hari ini.",
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: h, minute: m } as any,
          });
        } catch {
          await Notifications.scheduleNotificationAsync({
            content: { title: "💰 Saatnya menabung!", body: "Jangan lupa menambahkan tabungan hari ini." },
            trigger: { type: 'daily', hour: h, minute: m } as any,
          });
        }
      }
      showSnack("Waktu pengingat disimpan");
    } finally {
      setTimeout(()=>{ savingRef.current=false; setSavingTime(false); },1000);
    }
  };

  return (
    <View style={{ flex:1, backgroundColor:p.bg, paddingTop: insets.top }}>
      <ScrollView
        style={{ flex:1, backgroundColor:p.bg }}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
      >
      <Text variant="titleLarge" style={{ color: p.text, paddingTop: 8 }}>{tt('settings')}</Text>
      <Card style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]}>
        <Card.Content>
          <Text variant="titleSmall" style={{ color: p.text }}>{tt('theme')}</Text>
          <Text variant="bodySmall" style={[styles.sub, { color: p.subText }]}>
            {tt('themeDesc')}
          </Text>
          <SegmentedButtons
            value={settings.theme || "system"}
            onValueChange={(v) => setSettings({ theme: v as any })}
            buttons={[
              { value: "light", label: tt('light'), icon: "white-balance-sunny" },
              { value: "dark", label: tt('dark'), icon: "moon-waning-crescent" },
              { value: "system", label: tt('system'), icon: "cellphone-cog" },
            ]}
            style={{ marginTop: 12 }}
          />
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]}>
        <Card.Content style={{ gap:12 }}>
          <Text variant="titleSmall" style={{ color: p.text }}>{tt('language')}</Text>
          <Text variant="bodySmall" style={[styles.sub, { color: p.subText }]}>{tt('languageDesc')}</Text>
          <SegmentedButtons
            value={settings.language || 'id'}
            onValueChange={(v)=> { setSettings({ language: v as any, currency: v==='en' ? (settings.currency==='IDR' ? 'USD' : settings.currency) : (settings.currency==='USD' ? 'IDR' : settings.currency) }); setSnack(v==='en' ? 'Language: English' : 'Bahasa: Indonesia'); }}
            buttons={[
              { value:'id', label:'Indonesia', icon:'flag' },
              { value:'en', label:'English', icon:'flag-outline' },
            ]}
            style={{ marginTop:4 }}
          />
          <HelperText type="info" visible> {lang==='id' ? tt('langActiveId') : tt('langActiveEn')} </HelperText>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]}>
        <Card.Content style={{ gap:12 }}>
          <Text variant="titleSmall" style={{ color: p.text }}>{tt('currency')}</Text>
          <Text variant="bodySmall" style={[styles.sub, { color: p.subText }]}>
            {lang==='id' ? tt('currencyDescId') : tt('currencyDescEn')}
          </Text>
          <SegmentedButtons
            value={settings.currency || 'IDR'}
            onValueChange={(v)=> setSettings({ currency: v as any })}
            buttons={[
              { value:'IDR', label:'IDR — Rp' },
              { value:'USD', label:'USD — $' },
            ]}
            style={{ marginTop:4 }}
          />
          <HelperText type="info" visible> {lang==='id' ? tt('exampleId') : tt('exampleEn')} </HelperText>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]}>
        <Card.Content style={{ gap: 12 }}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: settings.reminderEnabled ? p.secondary + '18' : p.muted }]}>
              <Icon source={settings.reminderEnabled ? "bell-ring" : "bell-off-outline"} size={18} color={settings.reminderEnabled ? p.secondary : p.subText} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={{ color: p.text }}>{tt('reminder')}</Text>
              <Text variant="bodySmall" style={[styles.sub, { color: p.subText }]}>
                {settings.reminderEnabled ? `${tt('reminderOn')} ${time} • ${tt('reminderLocal')}` : tt('reminderOff')}
              </Text>
            </View>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={toggleReminder}
            />
          </View>

          <View>
            <Text variant="labelMedium" style={{ color: p.text, marginBottom: 6 }}>{tt('reminderTime')}</Text>
            <Pressable
              onPress={() => setShowTimePicker(v => !v)}
              style={[styles.timeBox, { backgroundColor: p.card, borderColor: timeErr ? '#DC2626' : p.border }]}
            >
              <Icon source="clock-outline" size={18} color={p.text} />
              <Text style={[styles.timeText, { color: p.text }]}>{time}</Text>
              <Text style={[styles.timeSub, { color: p.subText }]}>WIB</Text>
              <Icon source="chevron-down" size={18} color={p.subText} />
            </Pressable>
            <HelperText type="info" visible={!timeErr}>{tt('reminderHint')}</HelperText>
            {timeErr ? <HelperText type="error" visible>{timeErr}</HelperText> : null}
            {showTimePicker && (
              <DateTimePicker
                value={timeDate}
                mode="time"
                is24Hour
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_: any, d: any) => {
                  if (Platform.OS === 'android') setShowTimePicker(false);
                  if (d) {
                    const hh = String(d.getHours()).padStart(2, '0');
                    const mm = String(d.getMinutes()).padStart(2, '0');
                    const v = `${hh}:${mm}`;
                    setTime(v);
                    setTimeErr("");
                    setSettings({ reminderTime: v });
                  }
                }}
              />
            )}
            <Button mode="contained" onPress={saveTime} loading={savingTime} disabled={savingTime} style={{ marginTop: 4 }} buttonColor="#0E5A3A" textColor="#FFF" icon="content-save-outline">
              {tt('saveTime')}
            </Button>
            {!settings.reminderEnabled && <Text variant="bodySmall" style={{ color: p.subText, marginTop: 6, textAlign:'center' }}>{tt('switchOffHint')}</Text>}
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: p.card, borderColor: p.border }]}>
        <Card.Content>
          <Text variant="titleSmall" style={{ color: p.text }}>{tt('about')}</Text>
          <Text variant="bodySmall" style={[styles.sub, { color: p.subText }]}>
            {tt('aboutDesc')}
          </Text>
          <Text variant="bodySmall" style={[styles.sub, { color: p.subText }]}>
            v1.0.0
          </Text>
        </Card.Content>
      </Card>
      </ScrollView>

      <Snackbar
        key={snackKey}
        visible={!!snack}
        onDismiss={() => setSnack("")}
        duration={2200}
        wrapperStyle={{ top: insets.top + 12, bottom: 'auto' }}
        style={{ marginHorizontal:16, borderRadius:12, backgroundColor:p.card, borderWidth:1, borderColor:p.border, elevation:4 }}
      >
        <Text style={{ color:p.text, fontWeight:'600' }}>{snack}</Text>
      </Snackbar>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#F8FAFC" },
  card: { borderRadius: 16, backgroundColor: "#FFF", borderWidth:1, borderColor: '#E2E8F0' },
  sub: { color: "#64748B" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox:{ width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center' },
  timeBox:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1, borderRadius:12, paddingHorizontal:12, height:48, gap:8 },
  timeText:{ flex:1, textAlign:'center', fontSize:18, fontWeight:'700', letterSpacing:1 },
  timeSub:{ fontSize:12, fontWeight:'600' },
});
