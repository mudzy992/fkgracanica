export type EntityFieldType = 'text' | 'number' | 'multiline' | 'choice' | 'image';

export type EntityChoice = { value: string; label: string };

export type EntityFieldDef = {
  key: string;
  labelKey: string;
  type?: EntityFieldType;
  required?: boolean;
  choices?: readonly string[] | readonly EntityChoice[];
};

export type EntityCrudConfig = {
  endpoint: string;
  permission: string;
  titleKey: string;
  emptyKey?: string;
  fields: EntityFieldDef[];
  itemTitle: (row: Record<string, unknown>) => string;
  itemSubtitle?: (row: Record<string, unknown>) => string;
  buildBody: (values: Record<string, string>) => Record<string, unknown>;
};
