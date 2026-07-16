import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EntityFormModal } from '../../../src/components/staff/EntityFormModal';
import {
  buildPlayerBody,
  emptyPlayerValues,
  playerFieldsWithClubs,
  type ClubOpt,
} from '../../../src/components/staff/players-admin';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { Screen } from '../../../src/components/primitives/Screen';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

type PlayerRow = Record<string, unknown>;

export default function AdminPlayersScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [clubs, setClubs] = useState<ClubOpt[]>([]);
  const [clubFilter, setClubFilter] = useState('');
  const [items, setItems] = useState<PlayerRow[]>([]);
  const [values, setValues] = useState(emptyPlayerValues());
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fields = useMemo(() => playerFieldsWithClubs(clubs), [clubs]);

  const loadClubs = useCallback(async () => {
    try {
      const { data } = await api.get('/clubs');
      setClubs(asArray(data).map((c) => ({ id: asString(asRecord(c).id), name: asString(asRecord(c).name) })));
    } catch {
      setClubs([]);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const path = clubFilter ? `/players?clubId=${encodeURIComponent(clubFilter)}` : '/players';
      const { data } = await api.get(path);
      setItems(asArray(asRecord(data).data ?? data).map((r) => asRecord(r)));
    } catch {
      setItems([]);
    }
  }, [clubFilter]);

  useEffect(() => {
    void loadClubs();
  }, [loadClubs]);
  useEffect(() => {
    void load();
  }, [load]);

  const clubLabel = (id: string) => clubs.find((c) => c.id === id)?.name ?? id;

  const openCreate = () => {
    setEditId(null);
    setValues({ ...emptyPlayerValues(), clubId: clubFilter || clubs[0]?.id || '' });
    setOpen(true);
  };

  const openEdit = (row: PlayerRow) => {
    setEditId(asString(row.id));
    setValues({
      firstName: asString(row.firstName),
      lastName: asString(row.lastName),
      clubId: asString(row.clubId),
      position: asString(row.position, 'MID'),
      number: row.number == null ? '' : String(row.number),
      bio: asString(row.bio),
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!values.firstName.trim() || !values.lastName.trim()) {
      Alert.alert(t('players'), t('validationRequired'));
      return;
    }
    setSaving(true);
    try {
      const body = buildPlayerBody(values);
      if (editId) await api.patch(`/players/${editId}`, body);
      else await api.post('/players', body);
      setOpen(false);
      await load();
    } catch {
      Alert.alert(t('error'), t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row: PlayerRow) => {
    Alert.alert(t('confirmDelete'), `${asString(row.firstName)} ${asString(row.lastName)}`.trim(), [
      { text: t('close'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          void api.delete(`/players/${asString(row.id)}`).then(load);
        },
      },
    ]);
  };

  return (
    <RequirePermission permission="players.manage" returnTo="/staff/admin/players">
      <Screen padded={false}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[typography.heading, { color: colors.text }]}>{t('players')}</Text>
          <View style={styles.filters}>
            <Pressable
              onPress={() => setClubFilter('')}
              style={[styles.chip, { backgroundColor: !clubFilter ? colors.primary : colors.surface, borderColor: colors.border }]}
            >
              <Text style={{ color: !clubFilter ? colors.white : colors.text, fontSize: 12 }}>{t('filterAll')}</Text>
            </Pressable>
            {clubs.slice(0, 6).map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setClubFilter(c.id)}
                style={[styles.chip, { backgroundColor: clubFilter === c.id ? colors.primary : colors.surface, borderColor: colors.border }]}
              >
                <Text style={{ color: clubFilter === c.id ? colors.white : colors.text, fontSize: 12 }} numberOfLines={1}>
                  {c.name}
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
          ListEmptyComponent={<ScreenEmpty message={t('noItems')} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => openEdit(item)} style={[styles.row, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.text }]}>
                  {asString(item.firstName)} {asString(item.lastName)}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {[asString(item.position), item.number != null ? `#${item.number}` : '', clubLabel(asString(item.clubId))]
                    .filter(Boolean)
                    .join(' · ')}
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

const styles = StyleSheet.create({
  header: { padding: spacing.md, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, maxWidth: 120 },
  list: { padding: spacing.md, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
