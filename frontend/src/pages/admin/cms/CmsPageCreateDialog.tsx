import { useState } from 'react';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useCreateCmsPage } from '../../../hooks/use-cms-pages';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CmsPageCreateDialog({ open, onOpenChange }: Props) {
  const create = useCreateCmsPage();
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setSlug('');
    setTitle('');
    setError('');
  };

  const submit = async () => {
    if (!slug.trim() || !title.trim()) {
      setError('Slug i naslov su obavezni');
      return;
    }
    try {
      await create.mutateAsync({ slug: slug.trim(), title: title.trim(), status: 'DRAFT' });
      reset();
      onOpenChange(false);
    } catch {
      setError('Greška pri kreiranju');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-md">
      <DialogHeader onClose={() => onOpenChange(false)}>Nova CMS stranica</DialogHeader>
      <DialogBody className="space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Naslov stranice *" />
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (npr. o-nama) *" />
        {error && <p className="text-sm text-danger">{error}</p>}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Odustani
        </Button>
        <Button onClick={() => void submit()} disabled={create.isPending}>
          Kreiraj
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
