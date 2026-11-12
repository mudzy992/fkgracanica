import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../components/admin/CustomHtmlEditor', () => ({ CustomHtmlEditor: ({ value }: any) => <div>custom:{value}</div> }));
vi.mock('../../../../components/admin/RichTextEditor', () => ({ RichTextEditor: ({ value }: any) => <div>rich:{value}</div> }));
vi.mock('./HeroSectionForm', () => ({ HeroSectionForm: () => <div>hero</div> }));
vi.mock('./NewsFeedSectionForm', () => ({ NewsFeedSectionForm: () => <div>news</div> }));
vi.mock('./NextMatchSectionForm', () => ({ NextMatchSectionForm: () => <div>next</div> }));
vi.mock('./GenericSectionForm', () => ({ GenericSectionForm: () => <div>generic</div> }));
vi.mock('./ClubAboutCtaSectionForm', () => ({ ClubAboutCtaSectionForm: () => <div>cta</div> }));

import { CmsSectionForm } from './CmsSectionForm';

describe('fe06 CmsSectionForm branch56', () => {
  it('custom-html config.html undefined → ?? ""', () => {
    render(<CmsSectionForm widgetType="custom-html" config={{}} onChange={() => {}} />);
    expect(document.body.textContent).toContain('custom:');
  });
  it('rich-text config.html undefined → ?? ""', () => {
    render(<CmsSectionForm widgetType="rich-text" config={{}} onChange={() => {}} />);
    expect(document.body.textContent).toContain('rich:');
  });
  it('footer-about config.text undefined → ?? ""', () => {
    render(<CmsSectionForm widgetType="footer-about" config={{}} onChange={() => {}} />);
    expect(document.body.textContent).toContain('Widget:');
  });
});
