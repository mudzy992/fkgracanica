'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../../../lib/media';
import { getAuthHeader } from '../../../lib/api';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';

type FinanceBucket = { key: string; count: number; sum: number };
type FinanceSummary = {
  from: string; to: string;
  tickets: { count: number; sum: number };
  seasonPass: { count: number; sum: number };
  membership: { count: number; sum: number; estimated: true };
  totalSum: number; byProvider: FinanceBucket[]; byStatus: FinanceBucket[];
};
type FinanceFilters = { from: string; to: string; provider: string; status: string };

function formatKm(n: number) { return `${n.toLocaleString('bs-BA',{minimumFractionDigits:2,maximumFractionDigits:2})} KM`; }
function formatDay(iso: string) { const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(iso); return m?`${m[3]}.${m[2]}.${m[1]}.`:iso; }
function localIsoDate(d=new Date()){ const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; }
function paramsOf(f: FinanceFilters){ const p=new URLSearchParams(); if(f.from)p.set('from',f.from); if(f.to)p.set('to',f.to); if(f.provider)p.set('provider',f.provider); if(f.status)p.set('status',f.status); return p.toString(); }

async function fetchSummary(f: FinanceFilters): Promise<FinanceSummary>{
  const qs=paramsOf(f); const res=await fetch(`${getApiUrl()}/finance/summary${qs?'?'+qs:''}`,{headers:getAuthHeader(),cache:'no-store'});
  if(!res.ok) throw new Error(await res.text().catch(()=>`Greška ${res.status}`));
  return res.json();
}
async function downloadFinance(kind:'xlsx'|'pdf', f: FinanceFilters){
  const qs=paramsOf(f); const res=await fetch(`${getApiUrl()}/finance/export.${kind}${qs?'?'+qs:''}`,{headers:getAuthHeader()});
  if(!res.ok) throw new Error(await res.text().catch(()=>`Export ${res.status}`));
  const blob=await res.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`finansije.${kind}`; a.click(); URL.revokeObjectURL(url);
}

function KpiSkeleton(){ return <div aria-busy="true" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{Array.from({length:5}).map((_,i)=><Card key={i} className="h-[118px] bg-surface/40"><div className="space-y-2 p-4"><Skeleton className="h-3 w-20"/><Skeleton className="h-6 w-24"/><Skeleton className="h-3 w-16"/></div></Card>)}</div>; }

export default function FinanceAdminPage(){
  const [draft,setDraft]=useState<FinanceFilters>({from:`${new Date().getFullYear()}-01-01`,to:localIsoDate(),provider:'',status:''});
  const [applied,setApplied]=useState(draft);
  const {data,isLoading,isError,dataUpdatedAt,refetch,isFetching}=useQuery({queryKey:['finance','summary',applied],queryFn:()=>fetchSummary(applied)});
  const lastUpdated=dataUpdatedAt?new Date(dataUpdatedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Finansije</h1>
          <p className="mt-1 text-sm text-text-muted">Pregled uplata {formatDay(applied.from)} – {formatDay(applied.to)} · finance.read</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={()=>void downloadFinance('xlsx',applied)}>Preuzmi Excel</Button>
          <Button variant="outline" size="sm" onClick={()=>void downloadFinance('pdf',applied)}>Preuzmi PDF</Button>
        </div>
      </div>

      {lastUpdated ? <div className="flex items-center justify-end gap-3 border-b border-[var(--border-subtle)] px-2 py-2 text-xs text-text-muted"><span>Ažurirano u {lastUpdated}</span><Button variant="outline" size="sm" onClick={()=>void refetch()} disabled={isFetching}>{isFetching?'Učitavanje…':'Osvježi'}</Button></div>:null}

      <form className="grid gap-3 rounded-xl border border-[var(--border-subtle)] bg-surface/40 p-4 sm:grid-cols-2 lg:grid-cols-5" onSubmit={e=>{e.preventDefault();setApplied(draft);}}>
        <label className="text-sm"><span className="mb-1 block text-text-muted">Od</span><input type="date" value={draft.from} onChange={e=>setDraft({...draft,from:e.target.value})} className="w-full rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"/></label>
        <label className="text-sm"><span className="mb-1 block text-text-muted">Do</span><input type="date" value={draft.to} onChange={e=>setDraft({...draft,to:e.target.value})} className="w-full rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"/></label>
        <label className="text-sm"><span className="mb-1 block text-text-muted">Provider</span><select value={draft.provider} onChange={e=>setDraft({...draft,provider:e.target.value})} className="w-full rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"><option value="">Svi</option><option value="stripe">Stripe</option><option value="paypal">PayPal</option><option value="monri">Monri</option><option value="box_office">Blagajna</option></select></label>
        <label className="text-sm"><span className="mb-1 block text-text-muted">Status</span><select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})} className="w-full rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"><option value="">Svi</option><option value="CONFIRMED">Plaćeno</option><option value="PENDING_ONLINE">Čeka online</option><option value="PENDING_BOX_OFFICE">Čeka blagajnu</option><option value="REFUNDED">Povraćeno</option><option value="CANCELLED">Otkazano</option></select></label>
        <div className="flex items-end"><Button type="submit" variant="premium" size="sm" className="w-full">Primijeni</Button></div>
      </form>

      {isError ? <div role="alert" className="flex flex-col items-center gap-3 py-8"><p className="text-sm text-text-muted">Greška pri učitavanju — GET /finance/summary zahtijeva finance.read</p><Button variant="outline" size="sm" onClick={()=>void refetch()} disabled={isFetching}>{isFetching?'Učitavanje…':'Pokušaj ponovo'}</Button></div> : isLoading || !data ? <KpiSkeleton/> : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Card className="px-4 py-3"><p className="text-xs text-text-muted">Ulaznice</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{formatKm(data.tickets.sum)}</p><p className="mt-1 text-xs text-text-muted">{data.tickets.count} transakcija</p></Card>
            <Card className="px-4 py-3"><p className="text-xs text-text-muted">Sezonske</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{formatKm(data.seasonPass.sum)}</p><p className="mt-1 text-xs text-text-muted">{data.seasonPass.count} kartica</p></Card>
            <Card className="px-4 py-3"><p className="text-xs text-text-muted">Članarine (procjena)</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{formatKm(data.membership.sum)}</p><p className="mt-1 text-xs text-text-muted">{data.membership.count} aktivnih</p></Card>
            <Card className="px-4 py-3"><p className="text-xs text-text-muted">Ukupno</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{formatKm(data.totalSum)}</p><p className="mt-1 text-xs text-text-muted">{formatDay(data.from)} – {formatDay(data.to)}</p></Card>
            <Card className="px-4 py-3"><p className="text-xs text-text-muted">Provajderi</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{data.byProvider.length}</p><p className="mt-1 text-xs text-text-muted">statusa {data.byStatus.length}</p></Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
              <p className="border-b border-[var(--border-subtle)] px-4 py-2 text-sm font-medium">Po provajderu</p>
              <table className="w-full text-sm"><thead><tr className="text-left text-text-muted"><th className="px-4 py-2 font-medium">Provajder</th><th className="px-4 py-2 font-medium">Broj</th><th className="px-4 py-2 font-medium">Iznos</th></tr></thead><tbody>{data.byProvider.length?data.byProvider.map(r=><tr key={r.key} className="border-t border-[var(--border-subtle)]"><td className="px-4 py-2">{r.key}</td><td className="px-4 py-2 tabular-nums">{r.count}</td><td className="px-4 py-2 tabular-nums">{formatKm(r.sum)}</td></tr>):<tr><td colSpan={3} className="px-4 py-3 text-text-muted">Nema podataka</td></tr>}</tbody></table>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
              <p className="border-b border-[var(--border-subtle)] px-4 py-2 text-sm font-medium">Po statusu</p>
              <table className="w-full text-sm"><thead><tr className="text-left text-text-muted"><th className="px-4 py-2 font-medium">Status</th><th className="px-4 py-2 font-medium">Broj</th><th className="px-4 py-2 font-medium">Iznos</th></tr></thead><tbody>{data.byStatus.length?data.byStatus.map(r=><tr key={r.key} className="border-t border-[var(--border-subtle)]"><td className="px-4 py-2">{r.key}</td><td className="px-4 py-2 tabular-nums">{r.count}</td><td className="px-4 py-2 tabular-nums">{formatKm(r.sum)}</td></tr>):<tr><td colSpan={3} className="px-4 py-3 text-text-muted">Nema podataka</td></tr>}</tbody></table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
