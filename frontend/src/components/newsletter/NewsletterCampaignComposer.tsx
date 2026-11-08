import { useState } from 'react';
import {
  useCreateNewsletterCampaign,
  usePreviewNewsletterCampaign,
} from '../../hooks/use-newsletter-campaigns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { runAction } from '../../lib/action-errors';

export function NewsletterCampaignComposer() {
  const create = useCreateNewsletterCampaign();
  const preview = usePreviewNewsletterCampaign();
  const [subject, setSubject] = useState('');
  const [textBody, setTextBody] = useState('');
  const [ctaOn, setCtaOn] = useState(false);
  const [ctaLabel, setCtaLabel] = useState('Saznaj više');
  const [ctaUrl, setCtaUrl] = useState('');
  const [html, setHtml] = useState<string | null>(null);

  const payload = () => ({
    subject: subject.trim(),
    textBody: textBody.trim(),
    ctaLabel: ctaOn ? ctaLabel.trim() : undefined,
    ctaUrl: ctaOn ? ctaUrl.trim() : undefined,
  });

  const onPreview = async () => {
    const body = payload();
    if (!body.subject || !body.textBody) return;
    // P-FE06-44: rukovaoci se pozivaju sa `void`, pa greška ne smije pobjeći.
    const result = await runAction(preview.mutateAsync(body));
    if (result.ok) setHtml(result.value.html);
  };

  const onCreate = async () => {
    const body = payload();
    if (!body.subject || !body.textBody) return;
    const result = await runAction(create.mutateAsync(body));
    if (!result.ok) return;
    setSubject('');
    setTextBody('');
    setCtaOn(false);
    setHtml(null);
  };

  const ready = !!subject.trim() && !!textBody.trim() && (!ctaOn || !!ctaUrl.trim());

  return (
    <div className="space-y-2 rounded-lg border border-[var(--border-subtle)] p-4">
      <Input placeholder="Naslov" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <Textarea
        rows={8}
        placeholder="Tekst poruke (novi red = novi paragraf)"
        value={textBody}
        onChange={(e) => setTextBody(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={ctaOn} onCheckedChange={setCtaOn} />
        Dugme u mailu
      </label>
      {ctaOn && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Tekst dugmeta" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
          <Input placeholder="https://…" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => void onPreview()} disabled={!ready || preview.isPending}>
          Pregled
        </Button>
        <Button size="sm" onClick={() => void onCreate()} disabled={!ready || create.isPending}>
          Spremi nacrt
        </Button>
      </div>
      {html !== null && (
        <iframe
          title="Pregled"
          sandbox=""
          className="h-72 w-full rounded border border-[var(--border-subtle)] bg-white"
          srcDoc={html}
        />
      )}
    </div>
  );
}
