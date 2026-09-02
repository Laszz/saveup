import { Category } from '@/src/types';

export const DEFAULT_CATEGORIES: Category[] = [
  // income 5 — icon pakai MaterialCommunityIcons (react-native-paper)
  { id: 'inc_gaji', name: 'Gaji', type: 'income', icon: 'wallet', isDefault: true },
  { id: 'inc_freelance', name: 'Freelance', type: 'income', icon: 'laptop', isDefault: true },
  { id: 'inc_hadiah', name: 'Hadiah', type: 'income', icon: 'gift', isDefault: true },
  { id: 'inc_investasi', name: 'Investasi', type: 'income', icon: 'trending-up', isDefault: true },
  { id: 'inc_lainnya', name: 'Lainnya', type: 'income', icon: 'cash', isDefault: true },
  // expense 9
  { id: 'exp_makanan', name: 'Makanan', type: 'expense', icon: 'food', isDefault: true },
  { id: 'exp_transportasi', name: 'Transportasi', type: 'expense', icon: 'bus', isDefault: true },
  { id: 'exp_belanja', name: 'Belanja', type: 'expense', icon: 'shopping', isDefault: true },
  { id: 'exp_hiburan', name: 'Hiburan', type: 'expense', icon: 'movie', isDefault: true },
  { id: 'exp_tagihan', name: 'Tagihan', type: 'expense', icon: 'receipt', isDefault: true },
  { id: 'exp_kesehatan', name: 'Kesehatan', type: 'expense', icon: 'medical-bag', isDefault: true },
  { id: 'exp_pendidikan', name: 'Pendidikan', type: 'expense', icon: 'school', isDefault: true },
  { id: 'exp_langganan', name: 'Langganan', type: 'expense', icon: 'repeat', isDefault: true },
  { id: 'exp_lainnya', name: 'Lainnya', type: 'expense', icon: 'package-variant-closed', isDefault: true },
];

// goal icons — juga MCI names (dipakai Paper Icon)
export const GOAL_ICONS = ['laptop','airplane','home','car','cellphone','school','ring','beach','controller-classic','camera','guitar-electric','soccer','piggy-bank','bank','target','rocket','gift','star','heart','lightbulb'];
