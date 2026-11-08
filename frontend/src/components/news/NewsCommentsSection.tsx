import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAddNewsComment, useDeleteNewsComment, useNewsComments } from '../../hooks/use-news-comments';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { formatDate } from '../../lib/utils';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { NewsSectionTitle } from './NewsSectionTitle';
import { runAction } from '../../lib/action-errors';

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
    const result = await runAction(addComment.mutateAsync(text));
    // P-FE06-44: na grešci tekst ostaje u polju da korisnik ne izgubi komentar.
    if (result.ok) setContent('');
  };

  const onDelete = (commentId: string) => {
    if (window.confirm('Obrisati komentar?')) void runAction(deleteComment.mutateAsync(commentId));
  };

  return (
    <section className="mt-14">
      <NewsSectionTitle>
        <span className="inline-flex items-center gap-2">
          <MessageCircle size={16} />
          Komentari ({comments?.length ?? 0})
        </span>
      </NewsSectionTitle>

      {isLoading ? (
        <p className="text-sm text-text-muted">Učitavanje…</p>
      ) : (
        <div className="space-y-3">
          {comments?.map((c) => {
            const canDelete = canModerate || c.userId === user?.id;
            return (
              <div key={c.id} className="glass-premium rounded-xl p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      {c.user ? displayName(c.user) : 'Korisnik'}
                    </p>
                    <p className="text-xs text-text-muted">{formatDate(c.createdAt)}</p>
                  </div>
                  {canDelete && (
                    <Button size="sm" variant="ghost" onClick={() => onDelete(c.id)}>
                      Obriši
                    </Button>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                  {c.content}
                </p>
              </div>
            );
          })}
          {!comments?.length && (
            <p className="text-center text-sm text-text-muted">Još nema komentara. Budite prvi!</p>
          )}
        </div>
      )}

      {isAuthenticated ? (
        <div className="glass-premium mt-6 space-y-3 rounded-xl p-4 sm:p-5">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Napišite komentar…"
            rows={3}
            className="border-white/10 bg-background/50"
          />
          <Button onClick={() => void onSubmit()} disabled={!content.trim() || addComment.isPending}>
            Objavi
          </Button>
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-text-muted">
          <Link to="/prijava" className="font-medium text-primary-light hover:text-white">
            Prijavite se
          </Link>{' '}
          kao član da biste komentirali.
        </p>
      )}
    </section>
  );
}
