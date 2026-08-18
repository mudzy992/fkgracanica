import type { ReactNode } from 'react';

type Props = { children: ReactNode };

export function PhoneFrame({ children }: Props) {
  return (
    <div className="mx-auto w-[200px] shrink-0 sm:w-[220px]" aria-hidden="true">
      <div className="rounded-[1.75rem] border-[8px] border-zinc-800 bg-zinc-800 shadow-lg">
        <div className="relative aspect-[9/17] overflow-hidden rounded-[1.2rem] bg-[#f3f4f6] text-zinc-900">
          <div className="flex h-6 items-center justify-between px-3 text-[9px] font-medium text-zinc-700">
            <span>9:41</span>
            <span className="absolute left-1/2 top-1.5 h-2.5 w-12 -translate-x-1/2 rounded-full bg-zinc-800" />
            <span className="flex items-center gap-0.5">
              <span className="h-1.5 w-2.5 rounded-[1px] bg-zinc-600" />
              <span className="h-2 w-3 rounded-[1px] border border-zinc-600">
                <span className="ml-px mt-px block h-1 w-1.5 bg-zinc-600" />
              </span>
            </span>
          </div>
          {children}
          <div className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center">
            <span className="h-1 w-16 rounded-full bg-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TapHint({ label }: { label: string }) {
  return (
    <span className="absolute -top-2.5 right-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-zinc-900 shadow">
      {label}
    </span>
  );
}
