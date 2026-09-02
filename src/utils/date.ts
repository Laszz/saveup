export function toISODate(d: Date = new Date()): string {
  return d.toISOString();
}
export function formatDateID(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric'});
}
export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric'});
}
export function isSameDay(a: string, b: string): boolean {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear()===db.getFullYear() && da.getMonth()===db.getMonth() && da.getDate()===db.getDate();
}
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}
export function daysBetween(a: string, b: string): number {
  const da = new Date(a); da.setHours(0,0,0,0);
  const db = new Date(b); db.setHours(0,0,0,0);
  return Math.round((db.getTime()-da.getTime())/86400000);
}
