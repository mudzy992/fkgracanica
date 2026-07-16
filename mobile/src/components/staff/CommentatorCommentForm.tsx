import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { type LiveActionRunner, postLive } from './commentator-api';
import { commentatorStyles as styles } from './commentator-styles';

type Props = {
  matchId: string;
  run: LiveActionRunner;
};

export function CommentatorCommentForm({ matchId, run }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [message, setMessage] = useState('');

  const send = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    void run(async () => {
      await postLive(matchId, 'comments', { message: trimmed });
      setMessage('');
      Alert.alert(t('commentatorTitle'), t('commentSent'));
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{t('commentatorComments')}</Text>
      <TextInput
        style={[
          styles.input,
          { minHeight: 100, textAlignVertical: 'top', borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
        ]}
        value={message}
        onChangeText={setMessage}
        placeholder={t('writeComment')}
        placeholderTextColor={colors.textMuted}
        multiline
        accessibilityLabel={t('writeComment')}
      />
      <Pressable
        accessibilityRole="button"
        style={[styles.submit, { backgroundColor: colors.primary }]}
        onPress={send}
      >
        <Text style={[styles.submitText, { color: colors.white }]}>{t('sendComment')}</Text>
      </Pressable>
    </View>
  );
}
