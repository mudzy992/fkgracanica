import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "../../components/public/EmptyState";
import { PageContainer } from "../../components/public/PageContainer";
import { InstallGuide } from "../../components/public/app-download/InstallGuide";
import { PageHeroHeader } from "../../components/public/shell/PageHeroHeader";
import { PremiumCard } from "../../components/public/shell/PremiumCard";
import { Seo } from "../../components/seo/Seo";
import { Skeleton } from "../../components/ui/skeleton";
import {
  latestApkDownloadUrl,
  useLatestAndroidRelease,
} from "../../hooks/use-latest-android-release";

function formatMb(bytes: number): string {
  return Math.max(1, Math.round(bytes / (1024 * 1024))).toString();
}

export function AppDownloadPage() {
  const { t } = useTranslation();
  const { data: latest, isLoading } = useLatestAndroidRelease();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!latest) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    void QRCode.toDataURL(latestApkDownloadUrl(), { width: 180, margin: 1 })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [latest]);

  return (
    <div className="pb-16">
      <Seo
        title={t("appDownload.seoTitle")}
        description={t("appDownload.seoDesc")}
      />
      <PageHeroHeader
        eyebrow={t("appDownload.eyebrow")}
        title={t("appDownload.title")}
        subtitle={t("appDownload.subtitle")}
      />
      <PageContainer className="py-10 sm:py-14">
        {isLoading ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : !latest ? (
          <EmptyState message={t("appDownload.empty")} />
        ) : (
          <div className="space-y-8">
            <PremiumCard
              className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
              hover={false}
            >
              <div>
                <p className="font-display text-lg font-bold text-text">
                  {t("appDownload.version", { version: latest.version })}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  {t("appDownload.size", {
                    size: formatMb(latest.apkSizeBytes),
                  })}
                </p>
                {latest.releaseNotes ? (
                  <p className="mt-3 max-w-xl text-sm text-text-muted">
                    {latest.releaseNotes}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-center gap-4 sm:items-end">
                <a
                  href={latestApkDownloadUrl()}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white hover:bg-primary-light"
                >
                  {t("appDownload.download")}
                </a>
                {qrDataUrl ? (
                  <img
                    loading="lazy"
                    decoding="async"
                    src={qrDataUrl}
                    alt=""
                    width={180}
                    height={180}
                    className="rounded-lg border border-border/40 bg-white p-2"
                  />
                ) : null}
              </div>
            </PremiumCard>
            <InstallGuide version={latest.version} />
          </div>
        )}
      </PageContainer>
    </div>
  );
}
