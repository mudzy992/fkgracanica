import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLiveMatch } from '../../hooks/use-live-match';
import { useTheme } from '../../lib/theme-context';
import { type LiveActionRunner, patchLiveStream } from './commentator-api';
import { commentatorStyles as styles } from './commentator-styles';

type Props = {
  matchId: string;
  run: LiveActionRunner;
};

export function CommentatorStreamPanel({ matchId, run }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { match } = useLiveMatch(matchId);
  const saved = match?.liveStreamUrl ?? '';
  const [url, setUrl] = useState('');
  useEffect(() => {
    setUrl(saved);
  }, [saved]);
  const linked = !!saved;

  const save = () => {
    const trimmed = url.trim();
    void run(async () => {
      await patchLiveStream(matchId, trimmed || null);
      Alert.alert(t('commentatorTitle'), t('commentatorStreamSaved'));
    });
  };

  const clear = () => {
    void run(async () => {
      await patchLiveStream(matchId, null);
      setUrl('');
      Alert.alert(t('commentatorTitle'), t('commentatorStreamCleared'));
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>
        {linked ? t('commentatorStreamLinked') : t('commentatorStream')}
      </Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        placeholder={t('commentatorStreamUrl')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('commentatorStreamUrl')}
      />
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          style={[styles.submit, { flex: 1, backgroundColor: colors.primary }]}
          onPress={save}
        >
          <Text style={[styles.submitText, { color: colors.white }]}>{t('commentatorStreamSave')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!linked}
          style={[styles.submit, { flex: 1, backgroundColor: colors.surface, opacity: linked ? 1 : 0.5 }]}
          onPress={clear}
        >
          <Text style={[styles.submitText, { color: colors.text }]}>{t('commentatorStreamClear')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
