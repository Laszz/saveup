const CURRENCY_MAP: Record<string,{symbol:string,locale:string}> = {
  IDR:{symbol:'Rp',locale:'id-ID'},
  USD:{symbol:'$',locale:'en-US'},
  EUR:{symbol:'€',locale:'de-DE'},
  JPY:{symbol:'¥',locale:'ja-JP'},
  SGD:{symbol:'S$',locale:'en-SG'},
  MYR:{symbol:'RM',locale:'ms-MY'},
};
export function formatCurrency(n: number, currency='IDR'): string {
  if (isNaN(n as any) || n===null) return (CURRENCY_MAP[currency]?.symbol||'Rp')+' 0';
  const cfg=CURRENCY_MAP[currency]||CURRENCY_MAP.IDR;
  return cfg.symbol+' '+Math.abs(n).toLocaleString(cfg.locale);
}
export function formatIDR(n: number): string {
  if (isNaN(n) || n === null) return 'Rp 0';
  return 'Rp ' + n.toLocaleString('id-ID');
}
// ponytail: short untuk card sempit — aman sampai triliun tanpa overflow
export function formatIDRShort(n: number): string {
  if (!n || isNaN(n)) return 'Rp 0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return 'Rp ' + (n/1_000_000_000_000).toFixed(abs%1_000_000_000_000===0?0:1).replace('.',',') + ' T';
  if (abs >= 1_000_000_000) return 'Rp ' + (n/1_000_000_000).toFixed(abs%1_000_000_000===0?0:1).replace('.',',') + ' M';
  if (abs >= 1_000_000) return 'Rp ' + (n/1_000_000).toFixed(abs%1_000_000===0?0:1).replace('.',',') + ' jt';
  if (abs >= 1000) return 'Rp ' + Math.round(n/1000) + ' rb';
  return formatIDR(n);
}
export function formatCurrencyShort(n: number, currency='IDR'): string {
  const sym=(CURRENCY_MAP[currency]?.symbol||'Rp');
  if (!n || isNaN(n)) return sym+' 0';
  const abs=Math.abs(n);
  if(currency==='USD'){
    if(abs>=1_000_000_000_000) return sym+(n/1_000_000_000_000).toFixed(1)+' T';
    if(abs>=1_000_000_000) return sym+(n/1_000_000_000).toFixed(1)+' B';
    if(abs>=1_000_000) return sym+(n/1_000_000).toFixed(1)+' M';
    if(abs>=1000) return sym+Math.round(n/1000)+' k';
    return formatCurrency(n,currency);
  }
  return formatIDRShort(n).replace('Rp',sym);
}
// picker: hero pakai short jika > 1M biar tidak overflow 32px, card selalu short
export function formatIDRAdaptive(n: number, opts?:{ shortThreshold?: number }): string {
  const t = opts?.shortThreshold ?? 100_000_000; // 100jt
  if (Math.abs(n) >= t) return formatIDRShort(n);
  return formatIDR(n);
}
export function parseAmount(s: string): number {
  const cleaned = s.replace(/[^0-9]/g,'');
  return cleaned ? parseInt(cleaned,10) : 0;
}
