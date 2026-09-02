import { TextInput } from 'react-native-paper';
import { parseAmount, formatIDR } from '@/src/utils/currency';
import { useState } from 'react';

export function AmountInput({ value, onChange, label, error }: { value:number, onChange:(n:number)=>void, label?:string, error?:string }) {
  const [text, setText] = useState(value? formatIDR(value):'');
  return (
    <TextInput
      label={label||'Nominal *'}
      value={text}
      onChangeText={(t)=>{
        const n=parseAmount(t);
        setText(n? formatIDR(n):'');
        onChange(n);
      }}
      keyboardType="numeric"
      error={!!error}
      mode="outlined"
      placeholder="Rp 500.000"
    />
  );
}
