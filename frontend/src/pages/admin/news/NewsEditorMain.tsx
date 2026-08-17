import { Controller } from 'react-hook-form';
import { MediaPicker } from '../../../components/admin/MediaPicker';
import { RichTextEditor } from '../../../components/admin/RichTextEditor';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import type { NewsEditorFieldsProps } from '../news-form-utils';

export function NewsEditorMain({ register, control, errors }: NewsEditorFieldsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Naslov</label>
        <Input {...register('title')} className="text-lg" />
        {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Uvod</label>
        <Textarea rows={3} {...register('excerpt')} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Sadržaj</label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor tall value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.content && <p className="mt-1 text-xs text-danger">{errors.content.message}</p>}
      </div>
      <Controller
        name="coverPath"
        control={control}
        render={({ field }) => (
          <MediaPicker value={field.value} onSelect={field.onChange} />
        )}
      />
    </div>
  );
}
