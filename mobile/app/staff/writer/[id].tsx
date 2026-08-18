import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { MediaPickerSheet } from '../../../src/components/media/MediaPickerSheet';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { PrimaryButton } from '../../../src/components/primitives/PrimaryButton';
import { Screen } from '../../../src/components/primitives/Screen';
import { SectionHeader } from '../../../src/components/primitives/SectionHeader';
import NewsBodyDomEditor from '../../../src/components/writer/NewsBodyDomEditor';
import { WriterNewsFields } from '../../../src/components/writer/WriterNewsFields';
import { WriterRelationsBlock } from '../../../src/components/writer/WriterRelationsBlock';
import { useWriterEditor } from '../../../src/components/writer/use-writer-editor';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

export default function WriterEditorScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const editor = useWriterEditor(id);

  const handleSave = async () => {
    const savedId = await editor.save();
    if (savedId && editor.isNew) router.replace(`/staff/writer/${savedId}`);
  };

  const handleSubmit = async () => {
    if (await editor.submit()) router.replace('/staff/writer');
  };

  return (
    <RequirePermission permission="news.submit" returnTo="/staff/writer">
      <Screen scroll>
        <SectionHeader title={t('writer')} subtitle={t('writerHint')} />
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <WriterNewsFields
            article={editor.article}
            categories={editor.categories}
            onChange={editor.patch}
            onPickCover={() => editor.setCoverOpen(true)}
          />
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('writerBody')}</Text>
          <View style={styles.dom}>
            <NewsBodyDomEditor
              html={editor.article.content}
              onChangeHtml={async (content) => editor.patch({ content })}
              onRequestImage={editor.requestBodyImage}
              dom={{ style: { height: 360, width: '100%' } }}
            />
          </View>
          <WriterRelationsBlock article={editor.article} onChange={editor.patch} />
          <PrimaryButton label={editor.isNew ? t('writerSaveDraft') : t('writerSave')} onPress={() => void handleSave()} loading={editor.saving} />
          {!editor.isNew ? (
            <PrimaryButton label={t('writerSubmit')} onPress={() => void handleSubmit()} loading={editor.saving} />
          ) : null}
        </View>
        <MediaPickerSheet
          visible={editor.coverOpen}
          selected={editor.article.coverPath ? [editor.article.coverPath] : []}
          onClose={() => editor.setCoverOpen(false)}
          onConfirm={editor.pickCoverPaths}
        />
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  label: { ...typography.caption, fontWeight: '600' },
  dom: { borderWidth: 1, borderColor: '#334155', borderRadius: 10, overflow: 'hidden' },
});
