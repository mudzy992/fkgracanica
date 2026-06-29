import { Link } from 'react-router-dom';

export function MembershipBoxOfficeInfo() {
  return (
    <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-surface/50 p-4 text-sm text-text-muted">
      <p className="font-medium text-text">Online kupovina članstva trenutno nije omogućena</p>
      <p>
        Članstvo možete kupiti na <strong>blagajni kluba</strong>. Nakon uplate dobit ćete pristupne
        podatke (email i lozinku) za prijavu na stranicu i pristup digitalnoj članskoj kartici.
      </p>
      <p>
        Za više informacija posjetite klub ili nas kontaktirajte putem{' '}
        <Link to="/kontakt" className="text-primary underline">
          kontakt forme
        </Link>
        .
      </p>
    </div>
  );
}
