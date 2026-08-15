import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/primitives/PrimaryButton';
import { api } from '../lib/api';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import type { ShowcaseClub } from './types';

export function ShowcaseCta({ club }: { club: ShowcaseClub }) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [news, setNews] = useState('');
  const [sending, setSending] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const input = [styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }];

  const sendContact = async () => {
    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      Alert.alert('Kontakt', 'Ime, email i poruka (min. 10 znakova).');
      return;
    }
    setSending(true);
    try {
      await api.post('/contact', { name: name.trim(), email: email.trim(), message: message.trim() });
      setName('');
      setEmail('');
      setMessage('');
      Alert.alert('Kontakt', 'Poruka je poslana.');
    } catch {
      Alert.alert('Greška', 'Slanje nije uspjelo.');
    } finally {
      setSending(false);
    }
  };

  const subscribe = async () => {
    if (!news.trim()) return;
    setSubscribing(true);
    try {
      await api.post('/newsletter/subscribe', { email: news.trim() });
      setNews('');
      Alert.alert('Newsletter', 'Hvala na pretplati.');
    } catch {
      Alert.alert('Greška', 'Pretplata nije uspjela.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Ostajemo u vezi</Text>
      {club.email ? <Text style={{ color: colors.textMuted }}>{club.email}</Text> : null}
      {club.phone ? <Text style={{ color: colors.textMuted }}>{club.phone}</Text> : null}
      <TextInput style={input} value={news} onChangeText={setNews} placeholder="Email za newsletter" autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.textMuted} />
      <PrimaryButton label="Pretplati se" onPress={() => void subscribe()} loading={subscribing} />
      <TextInput style={input} value={name} onChangeText={setName} placeholder="Ime" placeholderTextColor={colors.textMuted} />
      <TextInput style={input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.textMuted} />
      <TextInput style={[input, styles.msg]} value={message} onChangeText={setMessage} placeholder="Poruka" multiline placeholderTextColor={colors.textMuted} />
      <PrimaryButton label="Pošalji poruku" onPress={() => void sendContact()} loading={sending} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, gap: spacing.sm, marginBottom: spacing.xl, padding: spacing.md },
  title: { ...typography.heading, fontSize: 20 },
  input: { borderRadius: 12, borderWidth: 1, padding: spacing.sm },
  msg: { minHeight: 88, textAlignVertical: 'top' },
});
