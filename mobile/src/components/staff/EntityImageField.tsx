import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MediaPickerSheet } from '../media/MediaPickerSheet';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing } from '../../lib/theme';

type Props = {
  value: string;
  onChange: (path: string) => void;
};

export function EntityImageField({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      {value ? <RemoteImage path={value} variant="thumb" style={styles.thumb} /> : null}
      <Pressable onPress={() => setOpen(true)} style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.text }}>{value ? t('imageSet') : t('pickImage')}</Text>
      </Pressable>
      <MediaPickerSheet visible={open} selected={value ? [value] : []} onClose={() => setOpen(false)} onConfirm={(paths) => onChange(paths[0] ?? '')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  thumb: { width: 72, height: 72, borderRadius: 8 },
  btn: { borderWidth: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
});
