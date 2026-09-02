import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
export function EmptyState({ title, desc, cta, onPress }: { title:string, desc:string, cta?:string, onPress?:()=>void }) {
  return (
    <View style={styles.wrap}>
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      <Text variant="bodyMedium" style={styles.desc}>{desc}</Text>
      {cta && onPress && <Button mode="contained" icon="plus" onPress={onPress} style={styles.btn} buttonColor="#0E5A3A" textColor="#FFF">{cta}</Button>}
    </View>
  );
}
const styles=StyleSheet.create({
  wrap:{ alignItems:'center', padding:24, gap:8 },
  title:{ fontWeight:'700', color:'#0F172A' },
  desc:{ color:'#64748B', textAlign:'center' },
  btn:{ marginTop:8, borderRadius:12 },
});
