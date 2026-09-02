// ponytail: design tokens dari Figma — light & dark, jarak 8
export const Spacing = { xs: 8, sm: 16, md: 24, lg: 32, xl: 40 } as const;
export const Radius = { sm: 8, md: 12, lg: 16, xl: 24 } as const;

const Light = {
  primary: '#1C64F2', primaryDark: '#1E40AF',
  secondary: '#059669', secondaryDark: '#047857',
  income: '#059669', expense: '#DC2626', saving: '#1C64F2', withdrawal: '#6B7280',
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0', text: '#0F172A', subText: '#64748B', muted: '#F1F5F9',
} as const;

export const DarkPalette = {
  primary: '#3B82F6', primaryDark: '#60A5FA',
  secondary: '#10B981', secondaryDark: '#34D399',
  income: '#10B981', expense: '#F87171', saving: '#60A5FA', withdrawal: '#9CA3AF',
  bg: '#0F172A', card: '#1E293B', border: '#334155', text: '#F1F5F9', subText: '#94A3B8', muted: '#1E293B',
} as const;

// mutable Palette — semua file import Palette akan otomatis ikut dark/light via setPalette()
export let Palette: typeof Light = { ...Light };
export function setPalette(isDark: boolean) {
  const src = isDark ? DarkPalette : Light;
  (Object.keys(src) as (keyof typeof src)[]).forEach(k => {
    (Palette as any)[k] = (src as any)[k];
  });
}

export const Typography = {
  display: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34 },
  title: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
} as const;
