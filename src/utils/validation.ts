export function validateAmount(v: number): string | null {
  if (!v || isNaN(v)) return 'Nominal wajib diisi';
  if (v <= 0) return 'Nominal harus lebih dari 0';
  return null;
}
export function validateGoal(name: string, targetAmount: number): string | null {
  if (!name || !name.trim()) return 'Nama goal tidak boleh kosong';
  if (!targetAmount || targetAmount <= 0) return 'Target harus lebih dari 0';
  return null;
}
export function validateTargetDate(s?: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return 'Tanggal tidak valid';
  return null;
}
