import { useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'https://imaginemyapps.com/api/contact';
const services = [
  { value: 'mobile', label: 'Mobile App', price: 'From $1,599' },
  { value: 'web', label: 'Web App', price: 'From $899' },
  { value: 'backend', label: 'Backend System', price: 'From $979' },
  { value: 'full', label: 'Full-Stack Project', price: 'Let’s scope it' },
];
const timeframes = ['Within 1 month', '2–3 months', '3–6 months', 'Flexible'];

export default function ConsultationScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  async function submit() {
    setError('');
    if (name.trim().length < 2 || !email.includes('@') || !service || message.trim().length < 10) {
      setError('Please enter your name, a valid email, a service, and a short project description.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, phone, service, timeframe, message, source: 'ios' }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Your request could not be sent.');
      setReference(data.reference || 'received');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your request could not be sent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <SafeAreaView style={styles.success} edges={['bottom']}>
        <View style={styles.successMark}><Text style={styles.successMarkText}>✓</Text></View>
        <Text style={styles.successTitle}>Request received</Text>
        <Text style={styles.successCopy}>Thank you, {name.trim()}. We’ll review your project and contact you using the details you provided.</Text>
        <Text style={styles.reference}>Reference #{reference}</Text>
        <Pressable style={styles.outlineButton} onPress={() => Linking.openURL('mailto:admin@imaginemyapps.com')}>
          <Text style={styles.outlineButtonText}>Contact support</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
        <Text style={styles.title}>Tell us about your idea</Text>
        <Text style={styles.intro}>We’ll use these details to prepare for your free 30-minute consultation.</Text>

        <Field label="Full name *" value={name} onChangeText={setName} autoComplete="name" />
        <Field label="Email address *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />

        <Text style={styles.label}>What would you like to build? *</Text>
        <View style={styles.options}>
          {services.map((item) => (
            <Pressable key={item.value} accessibilityRole="radio" accessibilityState={{ checked: service === item.value }} onPress={() => setService(item.value)} style={[styles.option, service === item.value && styles.optionSelected]}>
              <Text style={[styles.optionLabel, service === item.value && styles.optionLabelSelected]}>{item.label}</Text>
              <Text style={styles.optionPrice}>{item.price}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Preferred timeline</Text>
        <View style={styles.chips}>
          {timeframes.map((item) => (
            <Pressable key={item} onPress={() => setTimeframe(item)} style={[styles.chip, timeframe === item && styles.chipSelected]}>
              <Text style={[styles.chipText, timeframe === item && styles.chipTextSelected]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Project description *</Text>
        <TextInput value={message} onChangeText={setMessage} multiline maxLength={4000} textAlignVertical="top" placeholder="What should the app do, who is it for, and what outcome are you hoping for?" placeholderTextColor="#94A3B8" style={[styles.input, styles.message]} />
        <Text style={styles.characterCount}>{message.length}/4000</Text>

        <Text style={styles.privacy}>By submitting, you agree that ImagineMyApps may use this information to respond to your request. <Text style={styles.link} onPress={() => Linking.openURL('https://imaginemyapps.com/privacy.html')}>Read our Privacy Policy.</Text></Text>
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Pressable disabled={submitting} onPress={submit} style={[styles.submit, submitting && styles.disabled]}>
          <Text style={styles.submitText}>{submitting ? 'Sending…' : 'Request consultation'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, style, ...inputProps } = props;
  return <View><Text style={styles.label}>{label}</Text><TextInput {...inputProps} maxLength={254} placeholderTextColor="#94A3B8" style={[styles.input, style]} /></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { padding: 24, paddingBottom: 56 },
  title: { color: '#111827', fontSize: 31, lineHeight: 38, fontWeight: '800' },
  intro: { color: '#475569', fontSize: 16, lineHeight: 25, marginTop: 10, marginBottom: 28 },
  label: { color: '#1E293B', fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 18 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderWidth: 1, borderRadius: 12, color: '#0F172A', fontSize: 16, paddingHorizontal: 15, paddingVertical: 14 },
  message: { height: 140 },
  characterCount: { color: '#64748B', fontSize: 12, textAlign: 'right', marginTop: 5 },
  options: { gap: 10 },
  option: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderWidth: 1, borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between' },
  optionSelected: { borderColor: '#B8860B', borderWidth: 2, backgroundColor: '#FFFBEB' },
  optionLabel: { color: '#1E293B', fontSize: 15, fontWeight: '700' },
  optionLabelSelected: { color: '#8A6200' },
  optionPrice: { color: '#64748B', fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  chipSelected: { backgroundColor: '#111827' },
  chipText: { color: '#334155', fontSize: 14, fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF' },
  privacy: { color: '#64748B', fontSize: 13, lineHeight: 20, marginTop: 24 },
  link: { color: '#8A6200', fontWeight: '700', textDecorationLine: 'underline' },
  error: { backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: 10, padding: 12, marginTop: 16 },
  submit: { backgroundColor: '#111827', borderRadius: 14, alignItems: 'center', paddingVertical: 17, marginTop: 20 },
  disabled: { opacity: 0.55 },
  submitText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  success: { flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', padding: 30 },
  successMark: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  successMarkText: { color: '#15803D', fontSize: 38, fontWeight: '800' },
  successTitle: { color: '#111827', fontSize: 30, fontWeight: '800', marginTop: 24 },
  successCopy: { color: '#475569', fontSize: 16, lineHeight: 25, textAlign: 'center', marginTop: 12 },
  reference: { color: '#64748B', fontSize: 14, fontWeight: '700', marginTop: 18 },
  outlineButton: { borderColor: '#111827', borderWidth: 2, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13, marginTop: 28 },
  outlineButtonText: { color: '#111827', fontSize: 15, fontWeight: '800' },
});
