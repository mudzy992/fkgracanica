import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  value: string;
  size?: number;
  className?: string;
}

export function MembershipQrCode({ value, size = 180, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  /**
   * Q-FE06-33: bez `catch`-a odbijeno generisanje je ostavljalo skeleton koji
   * pulsira zauvijek uz neobrađen rejection. Sada se prikazuje poruka.
   */
  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (failed) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border-2 border-primary bg-white p-2 text-center text-xs text-text-muted"
        style={{ width: size, height: size }}
      >
        QR kod nije dostupan
      </div>
    );
  }

  if (!src) {
    return <div className="h-[180px] w-[180px] animate-pulse rounded-xl bg-[var(--border-subtle)]" />;
  }

  return (
    <img
      src={src}
      alt="QR kod članstva"
      width={size}
      height={size}
      className={className ?? 'rounded-xl border-2 border-primary bg-white p-2'}
    />
  );
}
