import type { RefObject } from 'react';

type Props = {
  uploadRef: RefObject<HTMLInputElement | null>;
  replaceRef: RefObject<HTMLInputElement | null>;
  folderId?: string;
  replaceId: string | null;
  onUpload: (files: FileList) => void;
  onReplace: (file: File) => void;
};

export function MediaPageFileInputs({
  uploadRef,
  replaceRef,
  folderId,
  replaceId,
  onUpload,
  onReplace,
}: Props) {
  return (
    <>
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length && folderId) onUpload(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && replaceId) onReplace(file);
          e.target.value = '';
        }}
      />
    </>
  );
}
