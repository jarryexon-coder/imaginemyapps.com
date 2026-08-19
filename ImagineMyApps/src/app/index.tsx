import { Link, type Href } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const services = [
  { title: 'Mobile apps', detail: 'Native and cross-platform experiences from $1,599' },
  { title: 'Web apps', detail: 'Responsive customer and business platforms from $899' },
  { title: 'Backend systems', detail: 'APIs, databases, integrations, and automation from $979' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <Text style={styles.brand}>ImagineMyApps</Text>
          <Text style={styles.heroTitle}>Turn your app idea into a clear plan.</Text>
          <Text style={styles.heroCopy}>Use the interactive planner to define your audience, platforms, must-have features, early budget range, and launch readiness.</Text>
          <Link href={'/planner' as Href} asChild>
            <Pressable accessibilityRole="button" style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Start project planner</Text>
            </Pressable>
          </Link>
          <Link href={'/projects' as Href} asChild>
            <Pressable accessibilityRole="button" style={styles.showcaseButton}>
              <Text style={styles.showcaseButtonText}>Open my saved projects</Text>
            </Pressable>
          </Link>
        </SafeAreaView>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.eyebrow}>YOUR PROJECT WORKSPACE</Text>
        <Text style={styles.sectionTitle}>Plan, save, track, and share</Text>
        <Text style={styles.body}>Create structured app briefs, receive a directional cost and timeline range, complete a launch-readiness checklist, and share your plan with collaborators.</Text>
        <Link href={'/planner' as Href} asChild><Pressable accessibilityRole="button" style={styles.plannerButton}><Text style={styles.plannerButtonText}>Create a new plan →</Text></Pressable></Link>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.eyebrow}>FEATURED SHOWCASE</Text>
        <Text style={styles.sectionTitle}>Sports Analytics</Text>
        <Text style={styles.body}>Our most complete product: live sports data, player projections, prop research, AI-assisted parlays, fantasy tools, and premium mobile access.</Text>
        <Link href={'/case-study/sports-analytics' as Href} asChild>
          <Pressable accessibilityRole="button" style={styles.featuredButton}>
            <Text style={styles.featuredButtonText}>View flagship case study →</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.eyebrow}>PORTFOLIO</Text>
        <Text style={styles.sectionTitle}>See the complete showcase</Text>
        <Text style={styles.body}>Explore Sports Analytics, InvestBook, FitTrack Pro, UrbanMart, DataDash, Creator API Hub, Nexus AI, and Web Scraper Pro.</Text>
        <Link href={'/portfolio' as Href} asChild><Pressable accessibilityRole="button" style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Open portfolio</Text></Pressable></Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.eyebrow}>WHAT WE BUILD</Text>
        <Text style={styles.sectionTitle}>Practical software for growing ideas</Text>
        {services.map((service) => (
          <View key={service.title} style={styles.card}>
            <Text style={styles.cardTitle}>{service.title}</Text>
            <Text style={styles.cardCopy}>{service.detail}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.eyebrow}>YOUR CONSULTATION</Text>
        <Text style={styles.sectionTitle}>A useful first step</Text>
        <Text style={styles.body}>We’ll discuss your requirements, technical feasibility, development timeline, and an initial cost range. There is no obligation to proceed.</Text>
        <Link href="/consultation" asChild>
          <Pressable accessibilityRole="button" style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Request a free consultation</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={() => Linking.openURL('https://imaginemyapps.com/privacy.html')}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('mailto:admin@imaginemyapps.com')}>
          <Text style={styles.footerLink}>Contact Support</Text>
        </Pressable>
        <Link href={'/support' as Href} asChild><Pressable><Text style={styles.footerLink}>Help & Support</Text></Pressable></Link>
        <Text style={styles.copyright}>© 2026 ImagineMyApps</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingBottom: 40 },
  hero: { backgroundColor: '#111827', paddingHorizontal: 24, paddingBottom: 48 },
  brand: { color: '#F4C95D', fontSize: 20, fontWeight: '800', marginTop: 18, marginBottom: 48 },
  heroTitle: { color: '#FFFFFF', fontSize: 42, lineHeight: 48, fontWeight: '800', letterSpacing: -1.2 },
  heroCopy: { color: '#CBD5E1', fontSize: 17, lineHeight: 27, marginTop: 20 },
  primaryButton: { backgroundColor: '#F4C95D', borderRadius: 14, marginTop: 30, paddingHorizontal: 22, paddingVertical: 17, alignItems: 'center' },
  primaryButtonText: { color: '#111827', fontSize: 17, fontWeight: '800' },
  showcaseButton: { borderColor: '#FFFFFF', borderWidth: 2, borderRadius: 14, marginTop: 12, paddingHorizontal: 22, paddingVertical: 15, alignItems: 'center' },
  showcaseButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  section: { paddingHorizontal: 24, paddingTop: 42 },
  featuredSection: { backgroundColor: '#FFF1F2', borderColor: '#FECDD3', borderWidth: 1, borderRadius: 20, marginHorizontal: 18, marginTop: 26, padding: 22 },
  featuredButton: { backgroundColor: '#E63946', borderRadius: 13, marginTop: 22, paddingVertical: 15, alignItems: 'center' },
  featuredButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  plannerButton: { backgroundColor: '#111827', borderRadius: 13, marginTop: 22, paddingVertical: 15, alignItems: 'center' },
  plannerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  eyebrow: { color: '#A87500', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  sectionTitle: { color: '#111827', fontSize: 29, lineHeight: 35, fontWeight: '800', marginTop: 8, marginBottom: 18 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 16, padding: 20, marginBottom: 12 },
  cardTitle: { color: '#111827', fontSize: 18, fontWeight: '800' },
  cardCopy: { color: '#475569', fontSize: 15, lineHeight: 22, marginTop: 7 },
  body: { color: '#475569', fontSize: 16, lineHeight: 26 },
  secondaryButton: { borderColor: '#111827', borderWidth: 2, borderRadius: 14, marginTop: 24, paddingVertical: 15, alignItems: 'center' },
  secondaryButtonText: { color: '#111827', fontSize: 16, fontWeight: '800' },
  footer: { borderTopColor: '#E2E8F0', borderTopWidth: 1, marginTop: 48, paddingHorizontal: 24, paddingTop: 28, gap: 14 },
  footerLink: { color: '#334155', fontSize: 15, fontWeight: '700' },
  copyright: { color: '#64748B', fontSize: 13, marginTop: 8 },
});
