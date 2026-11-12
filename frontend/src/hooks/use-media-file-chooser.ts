import { useRef, type RefObject } from 'react';

type Enqueue = (files: FileList, folderId: string, folderName?: string) => void;

/** Dugme „Upload u mapu“ veže cilj prije otvaranja sistemskog odabira fajlova. */
export function useMediaFileChooser(
  input: RefObject<HTMLInputElement | null>, folderId: string | undefined, folderName: string | undefined, enqueue: Enqueue,
) {
  const target = useRef<{ id: string; name?: string } | null>(null);
  const choose = () => {
    if (!folderId) return;
    target.current = { id: folderId, name: folderName };
    input.current?.click();
  };
  const onUpload = (files: FileList) => {
    const chosen = target.current;
    target.current = null;
    enqueue(files, chosen?.id ?? folderId ?? '', chosen ? chosen.name : folderName);
  };
  return { choose, onUpload };
}
