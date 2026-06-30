import { FormResultChips } from './FormResultChips';
import type { FormMatchEntry } from '../../../lib/form-types';

/** @deprecated Use FormResultChips */
export function LeagueFormDots({
  form,
  formMatches,
  clubName,
}: {
  form: string;
  formMatches?: FormMatchEntry[];
  clubName?: string;
}) {
  return <FormResultChips form={form} formMatches={formMatches} clubName={clubName} size="sm" />;
}
