import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InstallGuide } from './InstallGuide';
import { PhoneFrame, TapHint } from './phone-frame';
import { ChromePageScreen, ChromeWarnScreen, NotifScreen } from './chrome-screens';
import { InstallerScreen, UnknownAppsScreen } from './android-screens';

const state = vi.hoisted(() => ({
  settings: { data: undefined as unknown },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks', () => ({ usePublicSettings: () => state.settings }));

const t = (key: string) => key;

describe('InstallGuide', () => {
  beforeEach(() => {
    state.settings = { data: undefined };
  });

  it('prikazuje naslov, opis i šest koraka', () => {
    render(<InstallGuide version="1.4.0" />);
    expect(screen.getByRole('heading', { name: 'appDownload.guideTitle' })).toBeTruthy();
    expect(screen.getByText('appDownload.mock.caption')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    ['1', '2', '3', '4', '5', '6'].forEach((n) => expect(screen.getByText(n)).toBeTruthy());
  });

  it('prikazuje tri napomene na dnu', () => {
    render(<InstallGuide version="1.4.0" />);
    expect(screen.getByText('appDownload.playProtect')).toBeTruthy();
    expect(screen.getByText('appDownload.iosNote')).toBeTruthy();
    expect(screen.getByText('appDownload.pwaNote')).toBeTruthy();
  });

  it('koristi naziv kluba iz postavki', () => {
    state.settings = { data: { 'club.name': 'FK Gračanica' } };
    render(<InstallGuide version="2.0" />);
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
  });

  it('bez postavki koristi podrazumijevani naziv i inicijale', () => {
    render(<InstallGuide version="2.0" />);
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
    expect(screen.getByText('FK')).toBeTruthy();
  });

  it('grb iz postavki prikazuje sliku umjesto inicijala', () => {
    state.settings = { data: { 'club.name': 'Klub', 'club.crestUrl': 'originals/crest.png' } };
    const { container } = render(<InstallGuide version="2.0" />);
    expect(container.querySelector('img')?.getAttribute('src')).toContain('thumbs/crest.webp');
    expect(screen.queryByText('FK')).toBeNull();
  });

  it('naziv kluba od samih razmaka pada na podrazumijevani', () => {
    state.settings = { data: { 'club.name': '   ' } };
    render(<InstallGuide version="2.0" />);
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
  });
});

describe('PhoneFrame i TapHint', () => {
  it('okvir je skriven od čitalaca ekrana i prikazuje sadržaj', () => {
    const { container } = render(
      <PhoneFrame>
        <p>ekran</p>
      </PhoneFrame>,
    );
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('ekran')).toBeTruthy();
    expect(screen.getByText('9:41')).toBeTruthy();
  });

  it('TapHint prikazuje natpis', () => {
    render(<TapHint label="Dodirni" />);
    expect(screen.getByText('Dodirni')).toBeTruthy();
  });
});

describe('Prikazi telefona', () => {
  it('ChromePageScreen prikazuje host i dugme za preuzimanje', () => {
    render(<ChromePageScreen version="3.1" t={t} />);
    expect(screen.getByText(/\/aplikacija$/)).toBeTruthy();
    expect(screen.getByText('appDownload.download')).toBeTruthy();
    expect(screen.queryByText('appDownload.mock.tap')).toBeNull();
  });

  it('ChromePageScreen sa highlight prikazuje nagovještaj dodira', () => {
    render(<ChromePageScreen version="3.1" t={t} highlight />);
    expect(screen.getByText('appDownload.mock.tap')).toBeTruthy();
  });

  it('ChromeWarnScreen prikazuje ime APK fajla i opciju za nastavak', () => {
    render(<ChromeWarnScreen version="3.1" t={t} />);
    expect(screen.getByText('appDownload.mock.warnTitle')).toBeTruthy();
    expect(screen.getByText('appDownload.mock.warnAnyway')).toBeTruthy();
    expect(screen.getByText('appDownload.mock.warnDiscard')).toBeTruthy();
  });

  it('NotifScreen prikazuje naziv fajla i akciju otvaranja', () => {
    render(<NotifScreen version="3.1" t={t} />);
    expect(screen.getByText('appDownload.mock.notifTitle')).toBeTruthy();
    expect(screen.getByText('fk-gracanica-3.1.apk')).toBeTruthy();
    expect(screen.getByText('appDownload.mock.notifOpen')).toBeTruthy();
  });

  it('UnknownAppsScreen prikazuje postavke i Chrome kao izvor', () => {
    render(<UnknownAppsScreen t={t} />);
    expect(screen.getByText('appDownload.mock.settingsTitle')).toBeTruthy();
    expect(screen.getByText('appDownload.mock.chromeApp')).toBeTruthy();
    expect(screen.getByText('appDownload.mock.allowSource')).toBeTruthy();
  });

  it('InstallerScreen prikazuje klub, verziju i dugmad', () => {
    render(<InstallerScreen version="3.1" clubName="FK Gračanica" t={t} />);
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
    expect(screen.getByText('appDownload.version')).toBeTruthy();
    expect(screen.getByText('appDownload.mock.install')).toBeTruthy();
    expect(screen.getByText('appDownload.mock.cancel')).toBeTruthy();
    expect(screen.getByText('FK')).toBeTruthy();
  });

  it('InstallerScreen sa grbom prikazuje sliku', () => {
    const { container } = render(
      <InstallerScreen version="3.1" clubName="Klub" crestUrl="originals/c.png" t={t} />,
    );
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
  });
});
