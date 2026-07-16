import * as ImagePicker from 'expo-image-picker';
import { api } from './api';

type UploadResponse = {
  path: string;
  urlPath?: string;
};

type PickerAssetFile = {
  uri: string;
  name: string;
  type: string;
};

export async function uploadMedia(): Promise<string> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Media library permission denied');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) {
    throw new Error('cancelled');
  }
  const asset = result.assets[0];
  const name = asset.fileName ?? `photo-${Date.now()}.jpg`;
  const type = asset.mimeType ?? 'image/jpeg';
  const file: PickerAssetFile = { uri: asset.uri, name, type };
  const form = new FormData();
  form.append('file', file as unknown as Blob);
  const { data } = await api.post<UploadResponse>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.path;
}
