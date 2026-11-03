import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePublicSettings, useContactSubmit } from "../../hooks";
import { useAuth } from "../../lib/auth";
import { PageContainer } from "../../components/public/PageContainer";
import { ContactCinematicHero } from "../../components/public/contact/ContactCinematicHero";
import { ContactInfoAside } from "../../components/public/contact/ContactInfoAside";
import {
  ContactFormPanel,
  type ContactFormData,
} from "../../components/public/contact/ContactFormPanel";
import { Seo } from "../../components/seo/Seo";

export function ContactPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [defaults, setDefaults] = useState<Partial<ContactFormData>>({});
  const submit = useContactSubmit();
  const { data: settings } = usePublicSettings();
  const { user, isAuthenticated } = useAuth();

  const email = settings?.["contact.email"];
  const phone = settings?.["contact.phone"];
  const address = settings?.["contact.address"];

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const name = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    setDefaults({
      ...(user.email ? { email: user.email } : {}),
      ...(name ? { name } : {}),
    });
  }, [isAuthenticated, user]);

  const onSubmit = async (data: ContactFormData) => {
    await submit.mutateAsync(data);
    setSent(true);
  };

  return (
    <div className="pb-16 sm:pb-20">
      <Seo
        title={t("contactPage.seoTitle")}
        description={t("contactPage.seoDesc")}
      />
      <ContactCinematicHero
        hasEmail={!!email}
        hasPhone={!!phone}
        hasAddress={!!address}
      />
      <PageContainer className="py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ContactInfoAside email={email} phone={phone} address={address} />
          <ContactFormPanel
            key={`${defaults.email ?? ""}-${defaults.name ?? ""}`}
            sent={sent}
            pending={submit.isPending}
            defaultValues={defaults}
            onSubmit={onSubmit}
          />
        </div>
      </PageContainer>
    </div>
  );
}
