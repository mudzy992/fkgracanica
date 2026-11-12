import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** WCAG tagovi bez isključivanja pravila; gate je samo za critical/serious. */
export async function findSeriousA11y(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const violations = result.violations
    .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
    .map((violation) => ({
      id: violation.id, impact: violation.impact,
      nodes: violation.nodes.map((node) => ({ target: node.target, failure: node.failureSummary })),
    }));
  return violations;
}

export async function expectNoSeriousA11y(page: Page, state: string) {
  expect(await findSeriousA11y(page), `axe critical/serious: ${state}`).toEqual([]);
}
