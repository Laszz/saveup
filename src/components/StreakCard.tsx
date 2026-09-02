import { StyleSheet, View } from 'react-native';
import { Card, Text, Icon } from 'react-native-paper';
import { calcStreak } from '@/src/services/calc';
import { Transaction } from '@/src/types';
export function StreakCard({ txs }: { txs: Transaction[] }) {
  const s = calcStreak(txs);
  if (s===0) return (
    <Card style={styles.card} mode="contained">
      <Card.Content>
        <View style={styles.row}><Icon source="fire" size={18} color="#EA580C"/><Text variant="titleSmall"> Mulai Saving Streak</Text></View>
        <Text variant="bodySmall" style={styles.sub}>Menabung hari ini untuk memulai streak-mu.</Text>
      </Card.Content>
    </Card>
  );
  return (
    <Card style={[styles.card, styles.active]} mode="contained">
      <Card.Content>
        <View style={styles.row}><Icon source="fire" size={18} color="#EA580C"/><Text variant="titleSmall"> {s} Hari Berturut-turut</Text></View>
        <Text variant="bodySmall" style={styles.sub}>Konsisten menabung setiap hari!</Text>
      </Card.Content>
    </Card>
  );
}
const styles=StyleSheet.create({
  card:{ borderRadius:16, backgroundColor:'#FFFBEB', borderWidth:1, borderColor:'#FDE68A', marginVertical:8 },
  active:{ backgroundColor:'#FFF7ED', borderColor:'#FDBA74' },
  sub:{ color:'#92400E', marginTop:2 },
  row:{ flexDirection:'row', alignItems:'center' },
});
