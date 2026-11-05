/** Zajedničko stanje i dvojnici za tab-stranice (UsersRoles, Heritage) i njihove panele. */
export const tabPageState = {
  perms: [] as string[],
  moduleFlags: {} as Record<string, string>,
  seo: [] as string[],
  rendered: [] as string[],
};

export function resetTabPageState() {
  tabPageState.perms = [];
  tabPageState.moduleFlags = {};
  tabPageState.seo = [];
  tabPageState.rendered = [];
}

export function tabAuthModule() {
  return { useAuth: () => ({ user: { permissions: tabPageState.perms } }) };
}

export function tabModuleFlagsModule() {
  return { useModuleFlags: () => ({ data: tabPageState.moduleFlags }) };
}

export function tabSeoModule() {
  return {
    Seo: ({ title }: { title: string }) => {
      tabPageState.seo.push(title);
      return null;
    },
  };
}

/** Panel-dvojnik koji bilježi da je renderovan i da je dobio `embedded`. */
export function panelDouble(_name: string) {
  return ({ embedded }: { embedded?: boolean }) => {
    tabPageState.rendered.push(`${_name}:${String(embedded)}`);
    return <div>{`panel:${_name}:${String(embedded)}`}</div>;
  };
}

export function tabShellModule() {
  return {
    AdminPageShell: ({ title, actions, children }: {
      title: string; actions?: React.ReactNode; children: React.ReactNode;
    }) => (
      <div>
        <h1>{title}</h1>
        <div data-testid="actions">{actions}</div>
        {children}
      </div>
    ),
  };
}
