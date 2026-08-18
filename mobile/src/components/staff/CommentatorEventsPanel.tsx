import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveMatch } from '../../hooks/use-live-match';
import { useTheme } from '../../lib/theme-context';
import { type AddEventBody, type LiveActionRunner, postLiveEvent } from './commentator-api';
import { EVENT_I18N, MORE_EVENTS, QUICK_EVENTS, type LiveEventType } from './commentator-events';
import { commentatorStyles as styles } from './commentator-styles';
import type { MatchLineup } from '../../types/api';

type Props = { matchId: string; run: LiveActionRunner };

function rosterLabel(row: MatchLineup): string {
  const p = row.player;
  const name = p ? `${p.firstName} ${p.lastName}` : row.playerId;
  return row.isStarter ? name : `${name} (rez)`;
}

export function CommentatorEventsPanel({ matchId, run }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { match } = useLiveMatch(matchId);
  const [teamSide, setTeamSide] = useState<'home' | 'away'>('home');
  const [playerId, setPlayerId] = useState('');
  const [assistId, setAssistId] = useState('');
  const [subOut, setSubOut] = useState('');
  const [subIn, setSubIn] = useState('');
  const [description, setDescription] = useState('');
  const [showMore, setShowMore] = useState(false);

  const clubId = teamSide === 'home' ? match?.homeClubId : match?.awayClubId;
  const roster = (match?.lineup ?? []).filter((row) => row.clubId === clubId && row.player);

  const fire = (type: LiveEventType, extra?: Partial<AddEventBody>) => {
    if (!extra?.playerId && !playerId) return;
    const body: AddEventBody = { type, teamSide, playerId: extra?.playerId ?? playerId, ...extra };
    if (description.trim()) body.description = description.trim();
    void run(async () => {
      await postLiveEvent(matchId, body);
      setDescription('');
      setPlayerId('');
      setAssistId('');
      if (type === 'SUBSTITUTION') {
        setSubOut('');
        setSubIn('');
      }
    });
  };

  const renderEvents = (types: readonly LiveEventType[]) => (
    <View style={styles.row}>
      {types.map((type) => (
        <Pressable
          key={type}
          accessibilityRole="button"
          style={[styles.actionBtn, { backgroundColor: colors.surface, opacity: playerId ? 1 : 0.45 }]}
          onPress={() => fire(type, type === 'GOAL' && assistId ? { relatedPlayerId: assistId } : undefined)}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>{t(EVENT_I18N[type])}</Text>
        </Pressable>
      ))}
    </View>
  );

  const pickChip = (id: string, current: string, set: (v: string) => void, label: string) => {
    const selected = current === id;
    return (
      <Pressable
        key={id}
        onPress={() => set(selected ? '' : id)}
        style={[styles.chip, { borderColor: colors.border }, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
      >
        <Text style={[styles.chipText, { color: selected ? colors.white : colors.text }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{t('commentatorEvents')}</Text>
      <View style={styles.row}>
        {(['home', 'away'] as const).map((side) => {
          const selected = teamSide === side;
          return (
            <Pressable
              key={side}
              style={[styles.chip, { borderColor: colors.border }, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => {
                setTeamSide(side);
                setPlayerId('');
                setAssistId('');
              }}
            >
              <Text style={[styles.chipText, { color: selected ? colors.white : colors.text }]}>
                {side === 'home' ? t('commentatorHome') : t('commentatorAway')}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t('commentatorPickPlayer')}</Text>
      <ScrollView horizontal style={{ maxHeight: 44 }}>
        <View style={styles.row}>{roster.map((row) => pickChip(row.playerId, playerId, setPlayerId, rosterLabel(row)))}</View>
      </ScrollView>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t('commentatorAssist')}</Text>
      <ScrollView horizontal style={{ maxHeight: 44 }}>
        <View style={styles.row}>
          {roster.filter((r) => r.playerId !== playerId).map((row) => pickChip(row.playerId, assistId, setAssistId, rosterLabel(row)))}
        </View>
      </ScrollView>
      {renderEvents(QUICK_EVENTS)}
      <Pressable onPress={() => setShowMore((v) => !v)}>
        <Text style={[styles.hint, { color: colors.primary }]}>
          {showMore ? t('commentatorLessEvents') : t('commentatorMoreEvents')}
        </Text>
      </Pressable>
      {showMore ? renderEvents(MORE_EVENTS) : null}
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t('commentatorSubOut')}</Text>
      <View style={styles.row}>{roster.map((row) => pickChip(row.playerId, subOut, setSubOut, rosterLabel(row)))}</View>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t('commentatorSubIn')}</Text>
      <View style={styles.row}>{roster.map((row) => pickChip(row.playerId, subIn, setSubIn, rosterLabel(row)))}</View>
      <Pressable
        style={[styles.submit, { backgroundColor: colors.primary, opacity: subOut && subIn ? 1 : 0.45 }]}
        onPress={() => fire('SUBSTITUTION', { playerId: subOut, relatedPlayerId: subIn })}
      >
        <Text style={[styles.submitText, { color: colors.white }]}>{t('eventSub')}</Text>
      </Pressable>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
        value={description}
        onChangeText={setDescription}
        placeholder={t('commentatorEventNote')}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}
