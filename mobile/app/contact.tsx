import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../src/components/primitives/PrimaryButton';
import { Screen } from '../src/components/primitives/Screen';
import { SectionHeader } from '../src/components/primitives/SectionHeader';
import { api } from '../src/lib/api';
import { colors, spacing, typography } from '../src/lib/theme';

export default function ContactScreen() {
  const [sending, setSending] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submitContact = async () => {
    setSending(true);
    try {
      await api.post('/contact', { name, email, message });
      setName('');
      setEmail('');
      setMessage('');
      Alert.alert('Kontakt', 'Poruka je poslana.');
    } finally {
      setSending(false);
    }
  };

  const subscribe = async () => {
    setSubscribing(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      Alert.alert('Newsletter', 'Pretplata je evidentirana.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <Screen scroll>
      <SectionHeader title="Kontakt" subtitle="Pošaljite poruku ili se prijavite na newsletter." />
      <View style={styles.card}>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ime" />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
        <TextInput
          style={[styles.input, styles.message]}
          value={message}
          onChangeText={setMessage}
          placeholder="Poruka"
          multiline
        />
        <PrimaryButton label="Pošalji poruku" onPress={() => void submitContact()} loading={sending} />
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Newsletter</Text>
        <PrimaryButton label="Pretplati se" onPress={() => void subscribe()} loading={subscribing} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  section: { ...typography.heading, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
  },
  message: { minHeight: 110, textAlignVertical: 'top' },
});
