'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../../../lib/media';
import { getAuthHeader } from '../../../lib/api';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';

type Entry={id:string;action:string;createdAt:string;actor?:{email:string}|null;entity?:string|null};
type Resp={data:Entry[];meta?:{totalPages:number;page:number}};
const LABELS:Record<string,string>={'settings.update':'Izmjena postavki','rbac.role.permissions.update':'Izmjena dozvola','rbac.role.create':'Kreiranje uloge','rbac.role.delete':'Brisanje uloge','users.create':'Kreiranje korisnika','users.update':'Izmjena korisnika','users.delete':'Brisanje korisnika','auth.login':'Prijava','auth.logout':'Odjava'};
function label(a:string){return LABELS[a]??a;}
function fmt(s:string){try{return new Date(s).toLocaleString('bs-BA',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return s}}

async function fetchAudit(p:Record<string,string|number|undefined>):Promise<Resp>{
  const q=new URLSearchParams();Object.entries(p).forEach(([k,v])=>{if(v!==undefined&&v!==''&&v!==null)q.set(k,String(v))});
  const res=await fetch(`${getApiUrl()}/audit${q.toString()?`?${q}`:''}`,{headers:getAuthHeader(),cache:'no-store'});
  if(!res.ok) throw new Error(await res.text().catch(()=>`${res.status}`));
  const j=await res.json(); if(Array.isArray(j)) return {data:j}; if(j.data) return j as Resp; return {data:j.items??[] , meta:j.meta};
}

export default function AuditAdminPage(){
  const [action,setAction]=useState(''); const [entity,setEntity]=useState(''); const [from,setFrom]=useState(''); const [to,setTo]=useState(''); const [page,setPage]=useState(1);
  const {data,isLoading,isError,isFetching,dataUpdatedAt,refetch}=useQuery({queryKey:['audit',page,action,entity,from,to],queryFn:()=>fetchAudit({page,action:action||undefined,entity:entity||undefined,from:from||undefined,to:to||undefined})});
  const entries=data?.data??[]; const meta=data?.meta; const lastUpdated=dataUpdatedAt?new Date(dataUpdatedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):null;
  const onFilter=(setter:(v:string)=>void)=>(v:string)=>{setter(v);setPage(1);};
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold">Audit</h1><p className="mt-1 text-sm text-text-muted">Log aktivnosti · audit.read</p></div>
        {lastUpdated&&<div className="flex items-center gap-3 text-xs text-text-muted"><span>Ažurirano u {lastUpdated}</span><Button variant="outline" size="sm" onClick={()=>void refetch()} disabled={!!isFetching}>{isFetching?'Učitavanje…':'Osvježi'}</Button></div>}
      </div>
      <Card className="p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input placeholder="Akcija" value={action} onChange={e=>onFilter(setAction)(e.target.value)} className="rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"/>
          <input placeholder="Entitet" value={entity} onChange={e=>onFilter(setEntity)(e.target.value)} className="rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"/>
          <input type="date" value={from} onChange={e=>onFilter(setFrom)(e.target.value)} className="rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"/>
          <input type="date" value={to} onChange={e=>onFilter(setTo)(e.target.value)} className="rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"/>
        </div>
      </Card>
      {isError? <Card className="p-6 text-center"><p role="alert" className="text-sm text-danger">Greška pri učitavanju.</p><Button variant="outline" size="sm" className="mt-3" onClick={()=>void refetch()} disabled={!!isFetching}>{isFetching?'Učitavanje…':'Pokušaj ponovo'}</Button></Card> : isLoading? <div aria-busy="true" className="space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--border-subtle)] text-left text-xs text-text-muted"><th className="px-4 py-2">Akcija</th><th className="px-4 py-2">Korisnik</th><th className="px-4 py-2">Entitet</th><th className="px-4 py-2">Datum</th></tr></thead>
              <tbody>{entries.length?entries.map(r=><tr key={r.id} className="border-t border-[var(--border-subtle)]"><td className="px-4 py-2">{label(r.action)}</td><td className="px-4 py-2">{r.actor?.email??'—'}</td><td className="px-4 py-2">{r.entity??'—'}</td><td className="px-4 py-2 text-xs text-text-muted">{fmt(r.createdAt)}</td></tr>):<tr><td colSpan={4} className="px-4 py-6 text-center text-text-muted">Nema zapisa.</td></tr>}</tbody>
            </table>
          </div>
          {meta&&meta.totalPages>1&&<div className="flex justify-center gap-2 border-t border-[var(--border-subtle)] p-4"><Button variant="outline" size="sm" disabled={page<=1||!!isFetching} onClick={()=>setPage(p=>p-1)}>Prethodna</Button><span className="self-center text-sm" aria-live="polite">{page} / {meta.totalPages}</span><Button variant="outline" size="sm" disabled={page>=meta.totalPages||!!isFetching} onClick={()=>setPage(p=>p+1)}>Sljedeća</Button></div>}
        </Card>
      )}
    </div>
  );
}
