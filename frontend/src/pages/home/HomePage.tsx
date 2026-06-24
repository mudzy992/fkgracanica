import { Seo } from '../../components/seo/Seo';
import { Hero } from './sections/Hero';
import { NextMatch } from './sections/NextMatch';
import { LastResult } from './sections/LastResult';
import { LatestNews } from './sections/LatestNews';
import { FeaturedPlayers } from './sections/FeaturedPlayers';
import { LeagueTable } from './sections/LeagueTable';
import { GallerySection } from './sections/GallerySection';
import { SponsorsSection } from './sections/SponsorsSection';
import { MembershipCTA } from './sections/MembershipCTA';
import { TicketsCTA } from './sections/TicketsCTA';
import { TrophiesSection } from './sections/TrophiesSection';
import { Newsletter } from './sections/Newsletter';

export function HomePage() {
  return (
    <>
      <Seo title="Početna" description="Službena web stranica FK Gračanica" />
      <Hero />
      <NextMatch />
      <LastResult />
      <LatestNews />
      <FeaturedPlayers />
      <LeagueTable />
      <GallerySection />
      <SponsorsSection />
      <MembershipCTA />
      <TicketsCTA />
      <TrophiesSection />
      <Newsletter />
    </>
  );
}
