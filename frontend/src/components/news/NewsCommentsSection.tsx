import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAddNewsComment, useDeleteNewsComment, useNewsComments } from '../../hooks/use-news-comments';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { formatDate } from '../../lib/utils';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface Props {
  newsId: string;
}

function displayName(user: { firstName?: string | null; lastName?: string | null; email: string }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.email;
}

export function NewsCommentsSection({ newsId }: Props) {
  const { user, isAuthenticated } = useAuth();
  const { data: comments, isLoading } = useNewsComments(newsId);
  const addComment = useAddNewsComment(newsId);
  const deleteComment = useDeleteNewsComment(newsId);
  const [content, setContent] = useState('');
  const canModerate = hasPermission(user?.permissions, 'news.manage');

  const onSubmit = async () => {
    const text = content.trim();
    if (!text) return;
    await addComment.mutateAsync(text);
    setContent('');
  };

  const onDelete = (commentId: string) => {
    if (window.confirm('Obrisati komentar?')) void deleteComment.mutateAsync(commentId);
  };

  return (
    <section className="mt-12 border-t border-slate-200 pt-8">
      <h2 className="mb-6 text-xl font-semibold">Komentari ({comments?.length ?? 0})</h2>

      {isLoading ? (
        <p className="text-sm text-text-muted">Učitavanje…</p>
      ) : (
        <div className="space-y-4">
          {comments?.map((c) => {
            const canDelete = canModerate || c.userId === user?.id;
            return (
              <div key={c.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{c.user ? displayName(c.user) : 'Korisnik'}</p>
                    <p className="text-xs text-text-muted">{formatDate(c.createdAt)}</p>
                  </div>
                  {canDelete && (
                    <Button size="sm" variant="ghost" onClick={() => onDelete(c.id)}>
                      Obriši
                    </Button>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{c.content}</p>
              </div>
            );
          })}
          {!comments?.length && <p className="text-sm text-text-muted">Još nema komentara.</p>}
        </div>
      )}

      {isAuthenticated ? (
        <div className="mt-6 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Napišite komentar…"
            rows={3}
          />
          <Button onClick={() => void onSubmit()} disabled={!content.trim() || addComment.isPending}>
            Objavi
          </Button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-text-muted">
          <Link to="/admin/login" className="text-primary underline">
            Prijavite se
          </Link>{' '}
          kao član da biste komentirali.
        </p>
      )}
    </section>
  );
}
