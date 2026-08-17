export type FinanceQuery = {
  from?: string;
  to?: string;
  provider?: string;
  status?: string;
};

export type TicketExportRow = {
  id: string;
  createdAt: Date;
  amount: number;
  status: string;
  provider: string;
  method: string;
  orderId: string;
  email: string;
};

export type MembershipExportRow = {
  id: string;
  updatedAt: Date;
  amount: number;
  status: string;
  email: string;
};

export type SeasonPassExportRow = {
  id: string;
  updatedAt: Date;
  amount: number;
  status: string;
  provider: string;
  label: string;
  email: string;
};

export type Bucket = { key: string; count: number; sum: number };

export type FinanceSummary = {
  from: string;
  to: string;
  tickets: { count: number; sum: number };
  seasonPass: { count: number; sum: number };
  membership: { count: number; sum: number; estimated: true };
  totalSum: number;
  byProvider: Bucket[];
  byStatus: Bucket[];
};

export type FinanceBundle = {
  from: Date;
  to: Date;
  tickets: TicketExportRow[];
  seasonPass: SeasonPassExportRow[];
  membership: MembershipExportRow[];
  summary: FinanceSummary;
};
