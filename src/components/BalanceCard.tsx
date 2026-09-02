import { View, StyleSheet } from 'react-native';
import { memo } from 'react';
import { Text, Icon } from 'react-native-paper';
import { Balance } from '@/src/types';
import { formatCurrency } from '@/src/utils/currency';
import { calcStreak } from '@/src/services/calc';
import { Spacing } from '@/src/constants/design';
import { useApp } from '@/src/context/AppContext';
import { useT } from '@/src/utils/i18n';

// Figma exact: biru #4F80FF, radius 24, jarak 8
export const BalanceCard = memo(function BalanceCard({ balance, transactions }: { balance: Balance; transactions?: any[] }) {
  const { settings }=useApp();
  const lang=(settings.language||'id') as 'id'|'en';
  const tt=useT(lang);
  const curr=settings.currency||'IDR';
  const streak = transactions ? calcStreak(transactions) : 0;
  return (
    <View style={styles.card}>
      <View style={{ gap: 4 }}>
        <Text style={styles.label}>{tt('totalBalance') || 'Total Balance'}</Text>
        <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{formatCurrency(balance.balance, curr)}</Text>
      </View>
      <View style={styles.streakPill}>
        <Icon source="fire" size={16} color="#FF8C00" />
        <Text style={styles.streakText}>
          {streak > 0 ? `${streak} ${lang==='en' ? 'Day Saving Streak' : 'Hari Saving Streak'}` : (lang==='en' ? 'Start Saving Streak' : 'Mulai Saving Streak')}
        </Text>
        <Text style={styles.keep}>{streak > 0 ? 'Keep it up!' : (lang==='en' ? 'Save today!' : 'Nabung hari ini!')}</Text>
      </View>
    </View>
  );
});
const styles=StyleSheet.create({
  card:{ backgroundColor:'#4F80FF', borderRadius:24, padding: Spacing.sm, gap: Spacing.sm },
  label:{ color:'rgba(255,255,255,0.9)', fontSize:14, fontWeight:'400' },
  amount:{ color:'#FFF', fontSize:32, fontWeight:'800', marginTop:4, letterSpacing:-0.5 },
  streakPill:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(0,0,0,0.12)', borderRadius:12, paddingHorizontal: Spacing.xs, paddingVertical: Spacing.xs, gap: Spacing.xs },
  streakText:{ color:'#FFF', fontSize:12, fontWeight:'600', flex:1 },
  keep:{ color:'rgba(255,255,255,0.9)', fontSize:12, fontWeight:'500' },
});
