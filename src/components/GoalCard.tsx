import { StyleSheet, View } from 'react-native';
import { Card, Text, ProgressBar, Icon } from 'react-native-paper';
import { Goal } from '@/src/types';
import { formatIDR } from '@/src/utils/currency';
import { formatDateID } from '@/src/utils/date';
import { Spacing, Radius, Palette } from '@/src/constants/design';

// Figma GoalCard: putih, radius 12, jarak 8, progress tipis
export function GoalCard({ goal, onPress }: { goal: Goal; onPress?:()=>void }) {
  const pct = (goal.progress||0)/100;
  const isDone = (goal.progress||0)>=100;
  return (
    <Card style={[styles.card, isDone && styles.done]} mode="contained" onPress={onPress}>
      <Card.Content style={{ gap: Spacing.xs }}>
        <View style={styles.head}>
          <View style={styles.iconBox}>
            <Icon source={goal.icon||'target'} size={20} color={Palette.primary} />
          </View>
          <View style={{ flex:1, gap:2 }}>
            <Text variant="titleSmall" numberOfLines={1} style={styles.name}>{goal.name}</Text>
            <Text variant="labelSmall" style={styles.sub}>{formatIDR(goal.currentAmount||0)} / {formatIDR(goal.targetAmount)}</Text>
          </View>
          <Text variant="labelSmall" style={[styles.pct, isDone && { color: Palette.secondary }]}>{Math.round(goal.progress||0)}%</Text>
        </View>
        <ProgressBar progress={pct} color={isDone?Palette.secondary:Palette.primary} style={styles.bar} />
        <View style={styles.row}>
          {goal.targetDate ? <Text variant="labelSmall" style={styles.date}>Target: {formatDateID(goal.targetDate)}</Text> : <View/>}
          {isDone && <Text style={styles.badge}>Tercapai</Text>}
        </View>
      </Card.Content>
    </Card>
  );
}
const styles=StyleSheet.create({
  card:{ borderRadius: Radius.md, backgroundColor: Palette.card, marginBottom: Spacing.xs, borderWidth:1, borderColor: Palette.border },
  done:{ backgroundColor:'#F0FDF4', borderColor:'#86EFAC' },
  head:{ flexDirection:'row', alignItems:'center', gap: Spacing.xs },
  iconBox:{ width:40, height:40, borderRadius:8, backgroundColor: Palette.muted, alignItems:'center', justifyContent:'center' },
  name:{ fontWeight:'700', color: Palette.text },
  sub:{ color: Palette.subText },
  pct:{ fontWeight:'700', color: Palette.primary },
  bar:{ height:6, borderRadius:4, backgroundColor: Palette.muted },
  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  date:{ color: Palette.subText },
  badge:{ backgroundColor: Palette.secondary, color:'#FFF', paddingHorizontal:8, paddingVertical:2, borderRadius:8, fontSize:10, overflow:'hidden' },
});
