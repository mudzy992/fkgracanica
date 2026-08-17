import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EntityFormModal } from '../../../src/components/staff/EntityFormModal';
import type { EntityFieldDef } from '../../../src/components/staff/entity-crud-types';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { Screen } from '../../../src/components/primitives/Screen';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

type Row = Record<string, unknown>;

const COMP_FIELDS: EntityFieldDef[] = [{ key: 'name', labelKey: 'name', required: true }];
const SEASON_FIELDS: EntityFieldDef[] = [
  { key: 'name', labelKey: 'name', required: true },
  { key: 'yearStart', labelKey: 'yearStart', type: 'number', required: true },
  { key: 'yearEnd', labelKey: 'yearEnd', type: 'number', required: true },
];

export default function AdminCompetitionsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [seasons, setSeasons] = useState<Row[]>([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [values, setValues] = useState<Record<string, string>>({ name: '', yearStart: '', yearEnd: '' });
  const [mode, setMode] = useState<'season' | 'edition' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSeasons = useCallback(async () => {
    try {
      const { data } = await api.get('/seasons');
      setSeasons(asArray(data).map((r) => asRecord(r)));
    } catch {
      setSeasons([]);
    }
  }, []);

  useEffect(() => {
    void loadSeasons();
  }, [loadSeasons]);

  const selected = seasons.find((s) => asString(s.id) === selectedSeason);
  const editions = asArray(selected?.competitions).map((r) => asRecord(r));

  const openSeason = (row?: Row) => {
    setMode('season');
    setEditId(row ? asString(row.id) : null);
    setValues({
      name: row ? asString(row.name) : '',
      yearStart: row?.yearStart != null ? String(row.yearStart) : '',
      yearEnd: row?.yearEnd != null ? String(row.yearEnd) : '',
    });
  };

  const openEdition = () => {
    if (!selectedSeason) return;
    setMode('edition');
    setEditId(null);
    setValues({ name: '', yearStart: '', yearEnd: '' });
  };

  const handleSave = async () => {
    if (!values.name.trim()) {
      Alert.alert(t('competitions'), t('validationRequired'));
      return;
    }
    setSaving(true);
    try {
      if (mode === 'season') {
        const body = {
          name: values.name.trim(),
          yearStart: Number(values.yearStart),
          yearEnd: Number(values.yearEnd),
        };
        if (editId) await api.patch(`/seasons/${editId}`, body);
        else await api.post('/seasons', body);
      } else if (mode === 'edition' && selectedSeason) {
        await api.post(`/seasons/${selectedSeason}/competitions`, { name: values.name.trim() });
      }
      await loadSeasons();
      setMode(null);
    } catch {
      Alert.alert(t('error'), t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequirePermission permission="competitions.manage" returnTo="/staff/admin/competitions">
      <Screen padded={false}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[typography.heading, { color: colors.text }]}>{t('competitions')}</Text>
          <PrimaryButton label={t('addSeason')} onPress={() => openSeason()} />
        </View>
        <FlatList
          data={seasons}
          keyExtractor={(item, i) => asString(item.id, String(i))}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<ScreenEmpty message={t('noSeasons')} />}
          ListHeaderComponent={
            selected ? (
              <View style={styles.seasonBlock}>
                <View style={styles.seasonHead}>
                  <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>{t('competitions')}</Text>
                  <PrimaryButton label={t('addCompetition')} onPress={openEdition} />
                </View>
                {editions.length === 0 ? <ScreenEmpty message={t('noItems')} /> : null}
                {editions.map((e) => (
                  <Pressable
                    key={asString(e.id)}
                    onPress={() =>
                      router.push({
                        pathname: '/staff/admin/matches',
                        params: { seasonId: asString(e.id) },
                      })
                    }
                    style={[styles.row, { borderColor: colors.border, backgroundColor: colors.background }]}
                  >
                    <Text style={{ color: colors.text, flex: 1 }}>
                      {asString(asRecord(e.competition).name, asString(e.id))}
                    </Text>
                    <Text style={{ color: colors.primary }}>{t('matches')}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedSeason(asString(item.id))}
              onLongPress={() => openSeason(item)}
              style={[
                styles.row,
                {
                  borderColor: selectedSeason === asString(item.id) ? colors.primary : colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <Text style={{ color: colors.text, flex: 1 }}>{asString(item.name)}</Text>
            </Pressable>
          )}
        />
        <EntityFormModal
          visible={mode != null}
          title={editId ? t('edit') : t('add')}
          fields={mode === 'season' ? SEASON_FIELDS : COMP_FIELDS}
          values={values}
          saving={saving}
          onChange={(k, v) => setValues((p) => ({ ...p, [k]: v }))}
          onSave={() => void handleSave()}
          onClose={() => setMode(null)}
        />
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.md, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  list: { padding: spacing.md, flexGrow: 1 },
  seasonBlock: { marginBottom: spacing.md, gap: spacing.sm },
  seasonHead: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
