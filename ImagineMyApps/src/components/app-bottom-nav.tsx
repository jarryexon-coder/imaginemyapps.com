import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const items = [
  { href: '/', label: 'Dashboard', icon: '⌂' },
  { href: '/projects', label: 'Projects', icon: '▣' },
  { href: '/resources', label: 'Resources', icon: '≡' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export function AppBottomNav({ active }: { active: string }) {
  return <View style={styles.nav}>{items.map(item => <Link key={item.href} href={item.href as Href} asChild><Pressable accessibilityRole="tab" accessibilityState={{ selected: active === item.href }} style={styles.item}><Text style={[styles.icon, active === item.href && styles.active]}>{item.icon}</Text><Text style={[styles.label, active === item.href && styles.active]}>{item.label}</Text></Pressable></Link>)}</View>;
}

const styles = StyleSheet.create({ nav: { flexDirection: 'row', borderTopColor: '#E2E8F0', borderTopWidth: 1, backgroundColor: '#FFFFFF', paddingTop: 9, paddingBottom: 8 }, item: { flex: 1, alignItems: 'center', gap: 3 }, icon: { color: '#64748B', fontSize: 20, fontWeight: '800' }, label: { color: '#64748B', fontSize: 11, fontWeight: '700' }, active: { color: '#8A6200' } });
