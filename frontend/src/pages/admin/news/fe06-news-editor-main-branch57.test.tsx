import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import '../../../i18n';
import { emptyNewsForm, type NewsFormData } from '../news-form-utils';
import { NewsEditorMain } from './NewsEditorMain';

vi.mock('../../../components/admin/MediaPicker', () => ({ MediaPicker: () => <div>media</div> }));
vi.mock('../../../components/admin/RichTextEditor', () => ({ RichTextEditor: () => <div>editor</div> }));

function HarnessWithErrors({ errors }: { errors: any }) {
  const { register, control, watch, setValue } = useForm<NewsFormData>({ defaultValues: emptyNewsForm });
  return <NewsEditorMain register={register} control={control} watch={watch} setValue={setValue} errors={errors} />;
}

describe('fe06 NewsEditorMain branch57 errors', () => {
  it('errors.title prikazuje poruku', () => {
    render(<HarnessWithErrors errors={{ title: { message: 'Naslov je obavezan' } }} />);
    expect(screen.getByText('Naslov je obavezan')).toBeInTheDocument();
  });
  it('errors.content prikazuje poruku', () => {
    render(<HarnessWithErrors errors={{ content: { message: 'Sadržaj je obavezan' } }} />);
    expect(screen.getByText('Sadržaj je obavezan')).toBeInTheDocument();
  });
  it('bez grešaka ne prikazuje poruke', () => {
    render(<HarnessWithErrors errors={{}} />);
    expect(screen.queryByText('Naslov je obavezan')).not.toBeInTheDocument();
    expect(screen.queryByText('Sadržaj je obavezan')).not.toBeInTheDocument();
  });
});
