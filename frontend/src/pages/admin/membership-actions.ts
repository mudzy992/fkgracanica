type ConfirmFn = (options: { title: string; confirmLabel?: string }) => Promise<boolean>;

/**
 * FE-04c: potvrda pa akcija nad članstvom — izdvojeno iz `MembershipAdminPage`
 * da stranica ostane ispod `file-size` limita.
 */
export function askMembershipAction(
  confirm: ConfirmFn,
  confirmLabel: string,
  title: string,
  id: string,
  action: (id: string) => Promise<unknown>,
) {
  return confirm({ title, confirmLabel }).then((ok) => {
    if (ok) void action(id);
  });
}
