import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  value: string;
  size?: number;
  className?: string;
}

export function MembershipQrCode({ value, size = 180, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    }).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

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
