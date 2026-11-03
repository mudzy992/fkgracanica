import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface Props {
  /** Poruka; podrazumijevano `common.loadError` iz locale fajlova. */
  message?: string;
  /** Retry iz react-query hooka (`refetch`); bez njega se prikazuje samo poruka. */
  onRetry?: () => void;
  className?: string;
}

/**
 * FE-03/P-FE03-2: javne stranice su imale samo `isLoading` granu — pad API-ja je
 * izgledao kao „nema sadržaja” (lažno prazno stanje) i korisnik nije imao retry.
 * `role="alert"` da ekranski čitači odmah objave grešku.
 */
export function DataError({ message, onRetry, className }: Props) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-4 py-16 text-center",
        className,
      )}
    >
      <p className="max-w-md text-text-muted">
        {message ?? t("common.loadError", "Podatke nije moguće učitati.")}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("actions.retry", "Pokušaj ponovo")}
        </Button>
      )}
    </div>
  );
}
