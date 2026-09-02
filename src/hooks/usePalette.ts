import { Palette, DarkPalette } from '@/src/constants/design';
import { useApp } from '@/src/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function usePalette() {
  const { settings } = useApp();
  const system = useColorScheme();
  const pref = settings.theme || 'system';
  const isDark = pref === 'dark' ? true : pref === 'light' ? false : system === 'dark';
  return isDark ? DarkPalette : Palette;
}
export function useIsDark() {
  const { settings } = useApp();
  const system = useColorScheme();
  const pref = settings.theme || 'system';
  return pref === 'dark' ? true : pref === 'light' ? false : system === 'dark';
}
