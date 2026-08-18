import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RemoteImage } from '../RemoteImage';
import { saveImageToLibrary, shareImageFile } from '../../lib/share-media';
import { spacing, typography } from '../../lib/theme';
import type { PagerPhoto } from './photo-pager-types';

type Props = {
  visible: boolean;
  photos: PagerPhoto[];
  index: number;
  onClose: () => void;
};

export function NativePhotoPager({ visible, photos, index, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<PagerPhoto>>(null);
  const [current, setCurrent] = useState(index);
  const photo = photos[current];

  useEffect(() => {
    if (!visible) return;
    setCurrent(index);
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index, animated: false });
    });
  }, [visible, index]);

  const onMomentum = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next >= 0 && next < photos.length) setCurrent(next);
  };

  const handleShare = useCallback(async () => {
    if (!photo?.path) return;
    try {
      await shareImageFile(photo.path);
    } catch {
      Alert.alert(t('error'), t('shareFailed'));
    }
  }, [photo?.path, t]);

  const handleSave = useCallback(async () => {
    if (!photo?.path) return;
    try {
      await saveImageToLibrary(photo.path);
      Alert.alert(t('photoSaved'));
    } catch {
      Alert.alert(t('error'), t('downloadFailed'));
    }
  }, [photo?.path, t]);

  if (!visible || photos.length === 0) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.root}>
        <FlatList
          ref={listRef}
          data={photos}
          horizontal
          pagingEnabled
          initialScrollIndex={index}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={onMomentum}
          onScrollToIndexFailed={({ index: failed }) => {
            setTimeout(() => listRef.current?.scrollToIndex({ index: failed, animated: false }), 50);
          }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width, height }}>
              <RemoteImage path={item.path} variant="original" contentFit="contain" style={styles.image} />
            </View>
          )}
        />
        <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('close')} style={styles.iconBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
          <Text style={styles.counter}>
            {current + 1} / {photos.length}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={() => void handleSave()} accessibilityRole="button" accessibilityLabel={t('downloadPhoto')} style={styles.iconBtn}>
              <Ionicons name="download-outline" size={24} color="#fff" />
            </Pressable>
            <Pressable onPress={() => void handleShare()} accessibilityRole="button" accessibilityLabel={t('sharePhoto')} style={styles.iconBtn}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
        {photo?.caption ? (
          <Text style={[styles.caption, { paddingBottom: insets.bottom + spacing.md }]}>{photo.caption}</Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  image: { width: '100%', height: '100%' },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  counter: { ...typography.body, color: '#fff', fontWeight: '700', flex: 1, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { padding: spacing.sm },
  caption: {
    ...typography.body,
    color: '#fff',
    textAlign: 'center',
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 0,
  },
});
