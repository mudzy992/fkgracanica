import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EntityFormModal } from '../../../src/components/staff/EntityFormModal';
import {
  buildMatchBody,
  emptyMatchValues,
  matchAdminStyles as styles,
  matchFields,
  type ClubOpt,
  type SeasonOpt,
} from '../../../src/components/staff/matches-admin';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { Screen } from '../../../src/components/primitives/Screen';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useTheme } from '../../../src/lib/theme-context';
import { typography } from '../../../src/lib/theme';

type Row = Record<string, unknown>;

export default function AdminMatchesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ seasonId?: string | string[] }>();
  const paramSeason = Array.isArray(params.seasonId) ? params.seasonId[0] : params.seasonId;
  const [seasons, setSeasons] = useState<SeasonOpt[]>([]);
  const [clubs, setClubs] = useState<ClubOpt[]>([]);
  const [seasonId, setSeasonId] = useState(asString(paramSeason));
  const [items, setItems] = useState<Row[]>([]);
  const [values, setValues] = useState(emptyMatchValues());
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const clubChoices = useMemo(() => clubs.map((c) => ({ value: c.id, label: c.name })), [clubs]);
  const fields = useMemo(() => matchFields(clubChoices), [clubChoices]);

  const loadMeta = useCallback(async () => {
    try {
      const [seasonsRes, clubsRes] = await Promise.all([
        api.get('/competitions/seasons/list'),
        api.get('/clubs'),
      ]);
      const seasonList = asArray(seasonsRes.data).map((s) => ({
        id: asString(asRecord(s).id),
        name: asString(asRecord(s).name),
      }));
      setSeasons(seasonList);
      setClubs(asArray(clubsRes.data).map((c) => ({ id: asString(asRecord(c).id), name: asString(asRecord(c).name) })));
      setSeasonId((prev) => prev || seasonList[0]?.id || '');
    } catch {
      setSeasons([]);
      setClubs([]);
    }
  }, []);

  const load = useCallback(async () => {
    if (!seasonId) {
      setItems([]);
      return;
    }
    try {
      const { data } = await api.get(`/matches?seasonId=${encodeURIComponent(seasonId)}`);
      setItems(asArray(asRecord(data).data ?? data).map((r) => asRecord(r)));
    } catch {
      setItems([]);
    }
  }, [seasonId]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);
  useEffect(() => {
    void load();
  }, [load]);

  const clubName = (id: string) => clubs.find((c) => c.id === id)?.name ?? id;

  const openCreate = () => {
    setEditId(null);
    setValues({
      ...emptyMatchValues(),
      seasonId,
      homeClubId: clubs[0]?.id ?? '',
      awayClubId: clubs[1]?.id ?? clubs[0]?.id ?? '',
      scheduledAt: new Date().toISOString(),
    });
    setOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditId(asString(row.id));
    setValues({
      homeClubId: asString(row.homeClubId),
      awayClubId: asString(row.awayClubId),
      scheduledAt: asString(row.scheduledAt),
      venue: asString(row.venue),
      seasonId: asString(row.seasonId, seasonId),
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!values.homeClubId || !values.awayClubId || !values.scheduledAt || !seasonId) {
      Alert.alert(t('matches'), t('validationRequired'));
      return;
    }
    setSaving(true);
    try {
      const body = buildMatchBody(values, seasonId);
      if (editId) await api.patch(`/matches/${editId}`, body);
      else await api.post('/matches', body);
      setOpen(false);
      await load();
    } catch {
      Alert.alert(t('error'), t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row: Row) => {
    Alert.alert(t('confirmDelete'), `${clubName(asString(row.homeClubId))} vs ${clubName(asString(row.awayClubId))}`, [
      { text: t('close'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          void api.delete(`/matches/${asString(row.id)}`).then(load);
        },
      },
    ]);
  };

  return (
    <RequirePermission permission="matches.manage" returnTo="/staff/admin/matches">
      <Screen padded={false}>
        <View style={[styles.header, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
          <Text style={[typography.heading, { color: colors.text }]}>{t('matches')}</Text>
          <View style={styles.filters}>
            {seasons.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setSeasonId(s.id)}
                style={[styles.chip, { backgroundColor: seasonId === s.id ? colors.primary : colors.surface, borderColor: colors.border }]}
              >
                <Text style={{ color: seasonId === s.id ? colors.white : colors.text, fontSize: 12 }} numberOfLines={1}>
                  {s.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton label={t('add')} onPress={openCreate} />
        </View>
        <FlatList
          data={items}
          keyExtractor={(item, i) => asString(item.id, String(i))}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<ScreenEmpty message={t('noMatches')} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => openEdit(item)} style={[styles.row, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.text }]}>
                  {clubName(asString(item.homeClubId))} vs {clubName(asString(item.awayClubId))}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {[asString(item.scheduledAt), asString(item.venue)].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Pressable onPress={() => confirmDelete(item)}>
                <Text style={{ color: colors.danger }}>{t('delete')}</Text>
              </Pressable>
            </Pressable>
          )}
        />
        <EntityFormModal
          visible={open}
          title={editId ? t('edit') : t('add')}
          fields={fields}
          values={values}
          saving={saving}
          onChange={(k, v) => setValues((p) => ({ ...p, [k]: v }))}
          onSave={() => void handleSave()}
          onClose={() => setOpen(false)}
        />
      </Screen>
    </RequirePermission>
  );
}
