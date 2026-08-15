import type { ReactNode } from 'react';
import { MockAdmin } from '../mocks/MockAdmin';
import { MockCms } from '../mocks/MockCms';
import { MockLive } from '../mocks/MockLive';
import { MockPitch } from '../mocks/MockPitch';
import { MockTicket } from '../mocks/MockTicket';

export function SectionVisual({ id }: { id: string }): ReactNode {
  if (id === 'identity') return <MockPitch />;
  if (id === 'competition') return <MockLive />;
  if (id === 'membership-tickets') return <MockTicket />;
  if (id === 'content') return <MockCms />;
  if (id === 'admin') return <MockAdmin />;
  return null;
}
