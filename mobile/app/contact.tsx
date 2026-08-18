import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ContactClubInfo } from '../src/components/contact/ContactClubInfo';
import { PrimaryButton } from '../src/components/primitives/PrimaryButton';
import { Screen } from '../src/components/primitives/Screen';
import { SectionHeader } from '../src/components/primitives/SectionHeader';
import { api } from '../src/lib/api';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';

export default function ContactScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [message, setMessage] = useState('');

  const submitContact = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert(t('contact'), t('validationRequired'));
      return;
    }
    setSending(true);
    try {
      await api.post('/contact', { name: name.trim(), email: email.trim(), message: message.trim() });
      setName('');
      setEmail('');
      setMessage('');
      Alert.alert(t('contact'), t('sendMessage'));
    } catch {
      Alert.alert(t('error'), t('retry'));
    } finally {
      setSending(false);
    }
  };

  const subscribe = async () => {
    if (!newsletterEmail.trim()) {
      Alert.alert(t('newsletter'), t('validationRequired'));
      return;
    }
    setSubscribing(true);
    try {
      await api.post('/newsletter/subscribe', { email: newsletterEmail.trim() });
      setNewsletterEmail('');
      Alert.alert(t('newsletter'), t('subscribe'));
    } catch {
      Alert.alert(t('error'), t('retry'));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <Screen scroll>
      <SectionHeader title={t('contact')} subtitle={t('contactHint')} />
      <ContactClubInfo />
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          value={name}
          onChangeText={setName}
          placeholder={t('name')}
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          value={email}
          onChangeText={setEmail}
          placeholder={t('email')}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          style={[styles.input, styles.message, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          value={message}
          onChangeText={setMessage}
          placeholder={t('message')}
          multiline
          placeholderTextColor={colors.textMuted}
        />
        <PrimaryButton label={t('sendMessage')} onPress={() => void submitContact()} loading={sending} />
      </View>
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={[styles.section, { color: colors.text }]}>{t('newsletter')}</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
          value={newsletterEmail}
          onChangeText={setNewsletterEmail}
          placeholder={t('email')}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={colors.textMuted}
        />
        <PrimaryButton label={t('subscribe')} onPress={() => void subscribe()} loading={subscribing} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  section: { ...typography.heading },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  message: { minHeight: 110, textAlignVertical: 'top' },
});
