import { StyleSheet, View } from 'react-native';
import { memo } from 'react';
import { Card, Text, Icon } from 'react-native-paper';
import { Transaction } from '@/src/types';
import { formatIDR } from '@/src/utils/currency';
import { formatDateID } from '@/src/utils/date';
import { Spacing, Radius, Palette } from '@/src/constants/design';

const typeMeta: Record<string,{sign:string,color:string,label:string,bg:string, icon:string}> = {
  income:{sign:'+',color:Palette.income,label:'Income',bg:'#ECFDF5', icon:'arrow-bottom-left'},
  expense:{sign:'−',color:Palette.expense,label:'Expense',bg:'#FEF2F2', icon:'arrow-top-right'},
  saving:{sign:'',color:Palette.saving,label:'Saving',bg:'#EFF6FF', icon:'piggy-bank'},
  withdrawal:{sign:'',color:Palette.withdrawal,label:'Withdraw',bg:'#F8FAFC', icon:'cash-refund'},
};

export const TransactionItem = memo(function TransactionItem({ tx, categoryName, categoryIcon, goalName, goalIcon, onPress }: { tx:Transaction, categoryName?:string, categoryIcon?:string, goalName?:string, goalIcon?:string, onPress?:()=>void }) {
  const m = typeMeta[tx.type] || typeMeta.expense;
  const isSaving = tx.type==='saving' || tx.type==='withdrawal';
  const iconSource = isSaving ? (goalIcon || m.icon) : (categoryIcon || m.icon);
  return (
    <Card style={styles.card} mode="contained" onPress={onPress}>
      <Card.Content style={styles.row}>
        <View style={[styles.iconBox,{backgroundColor:m.bg}]}>
          <Icon source={iconSource} size={18} color={m.color} />
        </View>
        <View style={styles.mid}>
          <Text variant="titleSmall" numberOfLines={1} style={styles.title}>{categoryName||goalName||m.label}{tx.note?` • ${tx.note}`:''}</Text>
          <Text variant="labelSmall" style={styles.sub}>{isSaving? (goalName||m.label) : (categoryName||m.label)} • {formatDateID(tx.date)}</Text>
        </View>
        <Text variant="titleSmall" style={[styles.amount, { color:m.color }]}>{m.sign}{formatIDR(tx.amount)}</Text>
      </Card.Content>
    </Card>
  );
});
const styles=StyleSheet.create({
  card:{ marginBottom: Spacing.xs, borderRadius: Radius.md, backgroundColor: Palette.card, borderWidth:1, borderColor: Palette.border },
  row:{ flexDirection:'row', alignItems:'center', gap: Spacing.xs },
  iconBox:{ width:40,height:40,borderRadius: Radius.sm, alignItems:'center', justifyContent:'center' },
  mid:{ flex:1, gap:2 },
  title:{ fontWeight:'600', color: Palette.text },
  sub:{ color: Palette.subText },
  amount:{ fontWeight:'700' },
});
