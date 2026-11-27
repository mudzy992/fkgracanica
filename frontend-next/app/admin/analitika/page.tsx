'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../../../lib/media';
import { getAuthHeader } from '../../../lib/api';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';

type Tab='team'|'h2h'|'player'|'visitors';
type TeamAnalytics={clubId:string;clubName:string;played:number;wins:number;draws:number;losses:number;goalsFor:number;goalsAgainst:number;winPercent:number;form:('W'|'D'|'L')[];recent:{id:string;scheduledAt:string;status:string;home:string;away:string;homeScore:number;awayScore:number}[];};
type H2H={played:number;clubA:{wins:number;draws:number;losses:number};clubB:{wins:number;draws:number;losses:number};matches:TeamAnalytics['recent']};
type PlayerTotals={appearances:number;goals:number;assists:number;minutes:number;yellowCards:number;redCards:number;}; type PlayerAnalytics={totals:PlayerTotals;seasons:{seasonId:string;appearances:number;goals:number;assists:number;minutes:number;yellowCards:number;redCards:number}[]};
type Totals={web:number;mobile:number;total:number}; type Trend={date:string;web:number;mobile:number;total:number}[]; type Geo={countryCode:string;count:number;percent:number}[];

async function j<T>(path:string):Promise<T>{ const res=await fetch(`${getApiUrl()}${path}`,{headers:getAuthHeader(),cache:'no-store'}); if(!res.ok) throw new Error(await res.text().catch(()=>`${res.status}`)); return res.json() as Promise<T>; }

export default function AnalitikaAdminPage(){
  const [tab,setTab]=useState<Tab>('team');
  const [seasonId,setSeasonId]=useState(''); const [a,setA]=useState(''); const [b,setB]=useState(''); const [pid,setPid]=useState('');
  const seasonsQ=useQuery({queryKey:['seasons'],queryFn:()=>j<{id:string;name:string}[]>('/seasons').catch(()=>j<{items:{id:string;name:string}[]}[]>('/seasons').then(x=>Array.isArray(x)?x:(x as {items:{id:string;name:string}[]} ).items??[]).catch(()=>[])),enabled:tab==='team'});
  const clubsQ=useQuery({queryKey:['clubs'],queryFn:()=>j<{id:string;name:string}[]>('/clubs').then(x=>Array.isArray(x)?x:(x as {items:{id:string;name:string}[]} ).items??[]).catch(()=>[]),enabled:tab==='h2h'});
  const playersQ=useQuery({queryKey:['players-mini'],queryFn:()=>j<{id:string;firstName:string;lastName:string}[]>('/players').then(x=>Array.isArray(x)?x:(x as {items:unknown[]} ).items as {id:string;firstName:string;lastName:string}[]??[]).catch(()=>[]),enabled:tab==='player'});
  const teamQ=useQuery({queryKey:['analytics','team',seasonId],queryFn:()=>j<TeamAnalytics>(`/analytics/team${seasonId?`?seasonId=${seasonId}`:''}`),enabled:tab==='team'});
  const h2hQ=useQuery({queryKey:['analytics','h2h',a,b],queryFn:()=>j<H2H>(`/analytics/h2h?clubAId=${a}&clubBId=${b}`),enabled:tab==='h2h'&&!!a&&!!b&&a!==b});
  const playerQ=useQuery({queryKey:['analytics','player',pid],queryFn:()=>j<PlayerAnalytics>(`/analytics/players/${pid}`),enabled:tab==='player'&&!!pid});
  const totalsQ=useQuery({queryKey:['visitors','totals'],queryFn:()=>j<Totals>('/public-analytics/totals?days=30'),enabled:tab==='visitors'});
  const trendQ=useQuery({queryKey:['visitors','trend'],queryFn:()=>j<Trend>('/public-analytics/trend?days=30'),enabled:tab==='visitors'});
  const geoQ=useQuery({queryKey:['visitors','geo'],queryFn:()=>j<Geo>('/public-analytics/geo?days=30'),enabled:tab==='visitors'});

  const seasons=(seasonsQ.data as unknown[])??[]; const clubs=(clubsQ.data as unknown[])??[]; const players=(playersQ.data as unknown[])??[];
  const isTeamLoading=teamQ.isLoading; const isTeamError=teamQ.isError; const team=teamQ.data;
  const lastUpdated=teamQ.dataUpdatedAt?new Date(teamQ.dataUpdatedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold">Analitika</h1><p className="mt-1 text-sm text-text-muted">Posjete · H2H · tim · igrač · geo · trend · analytics.read</p></div>
        {tab==='team'&&<select value={seasonId} onChange={e=>setSeasonId(e.target.value)} disabled={teamQ.isFetching} className="rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"><option value="">Sve sezone</option>{(seasons as {id:string;name:string}[]).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>}
      </div>
      <div role="tablist" className="flex gap-2 border-b border-[var(--border-subtle)]">
        {(['team','h2h','player','visitors'] as Tab[]).map(id=>{
          const labels:Record<Tab,string>={team:'Tim',h2h:'H2H',player:'Igrač',visitors:'Posjete'}; const sel=tab===id;
          return <Button key={id} role="tab" aria-selected={sel} aria-pressed={sel} variant={sel?'default':'ghost'} size="sm" onClick={()=>setTab(id)} className={['h-auto rounded-none border-b-2 px-1 pb-2 text-sm font-medium',sel?'border-primary text-text':'border-transparent text-text-muted hover:text-text'].join(' ')}>{labels[id]}</Button>;
        })}
      </div>
      {tab==='team'&&lastUpdated&&!isTeamLoading&&!isTeamError?<div className="flex items-center justify-end gap-3 text-xs text-text-muted"><span>Ažurirano u {lastUpdated}</span><Button variant="outline" size="sm" onClick={()=>void teamQ.refetch()} disabled={teamQ.isFetching}>{teamQ.isFetching?'Učitavanje…':'Osvježi'}</Button></div>:null}

      {tab==='team'? isTeamError? <div role="alert" className="flex flex-col gap-3 p-4"><p className="text-sm text-danger">Greška pri učitavanju.</p><Button variant="outline" size="sm" onClick={()=>void teamQ.refetch()} disabled={teamQ.isFetching}>{teamQ.isFetching?'Učitavanje…':'Pokušaj ponovo'}</Button></div> : isTeamLoading||!team? <div aria-busy="true" className="space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-16 w-full"/>)}</div> : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-surface/50 px-4 py-3"><p className="text-xs text-text-muted">Odigrano</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{team.played}</p></Card>
            <Card className="bg-surface/50 px-4 py-3"><p className="text-xs text-text-muted">W–D–L</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{team.wins}–{team.draws}–{team.losses}</p></Card>
            <Card className="bg-surface/50 px-4 py-3"><p className="text-xs text-text-muted">Golovi</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{team.goalsFor}:{team.goalsAgainst}</p></Card>
            <Card className="bg-surface/50 px-4 py-3"><p className="text-xs text-text-muted">% pobjeda</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{team.winPercent}%</p></Card>
          </div>
          <div className="flex items-center gap-2 text-sm"><span className="text-text-muted">Forma</span>{team.form.length?team.form.map((f,i)=><span key={i} className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${f==='W'?'bg-green-500/15 text-green-600':f==='D'?'bg-yellow-500/15 text-yellow-600':'bg-red-500/15 text-red-600'}`}>{f}</span>):<span className="text-text-muted">—</span>}</div>
          <Card className="p-0"><ul className="divide-y divide-[var(--border-subtle)] text-sm">{team.recent.length?team.recent.map(m=><li key={m.id} className="flex justify-between px-4 py-2"><span>{m.home} – {m.away}</span><span className="tabular-nums">{m.homeScore}:{m.awayScore}</span><span className="text-xs text-text-muted">{new Date(m.scheduledAt).toLocaleDateString('bs-BA')}</span></li>):<li className="px-4 py-6 text-center text-text-muted">Nema mečeva</li>}</ul></Card>
        </div>
      ) : tab==='h2h'? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={a} onChange={e=>setA(e.target.value)} className="rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"><option value="">Klub A</option>{(clubs as {id:string;name:string}[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select value={b} onChange={e=>setB(e.target.value)} className="rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"><option value="">Klub B</option>{(clubs as {id:string;name:string}[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>
          {!a||!b?<Card className="p-6 text-center text-sm text-text-muted">Odaberite dva različita kluba za H2H.</Card>:h2hQ.isLoading?<div aria-busy="true" className="space-y-2">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div>:h2hQ.isError?<div role="alert" className="p-4 text-sm text-danger">Greška H2H. <Button variant="outline" size="sm" className="ml-2" onClick={()=>void h2hQ.refetch()}>Pokušaj ponovo</Button></div>:h2hQ.data?(
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3 text-center"><Card className="px-3 py-3"><p className="text-xs text-text-muted">Mečeva</p><p className="text-xl font-bold">{h2hQ.data.played}</p></Card><Card className="px-3 py-3"><p className="text-xs text-text-muted">A W-D-L</p><p className="font-bold tabular-nums">{h2hQ.data.clubA.wins}-{h2hQ.data.clubA.draws}-{h2hQ.data.clubA.losses}</p></Card><Card className="px-3 py-3"><p className="text-xs text-text-muted">B W-D-L</p><p className="font-bold tabular-nums">{h2hQ.data.clubB.wins}-{h2hQ.data.clubB.draws}-{h2hQ.data.clubB.losses}</p></Card></div>
              <Card className="p-0"><ul className="divide-y divide-[var(--border-subtle)] text-sm">{h2hQ.data.matches.map(m=><li key={m.id} className="flex justify-between px-4 py-2"><span>{m.home} – {m.away}</span><span>{m.homeScore}:{m.awayScore}</span></li>)}</ul></Card>
            </div>
          ):null}
        </div>
      ) : tab==='player'? (
        <div className="space-y-4">
          <select value={pid} onChange={e=>setPid(e.target.value)} className="rounded-lg border border-[var(--border-subtle)] bg-surface px-3 py-2 text-sm"><option value="">Izaberi igrača</option>{(players as {id:string;firstName:string;lastName:string}[]).map(p=><option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select>
          {!pid?<Card className="p-6 text-center text-sm text-text-muted">Odaberite igrača za statistiku po sezonama.</Card>:playerQ.isLoading?<div aria-busy="true"><Skeleton className="h-16 w-full"/></div>:playerQ.isError?<div role="alert" className="p-4 text-sm text-danger">Greška. <Button variant="outline" size="sm" onClick={()=>void playerQ.refetch()}>Pokušaj ponovo</Button></div>:playerQ.data?(
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 text-center text-sm">{[{l:'Nastupi',v:playerQ.data.totals.appearances},{l:'Golovi',v:playerQ.data.totals.goals},{l:'Asistencije',v:playerQ.data.totals.assists},{l:'Minute',v:playerQ.data.totals.minutes},{l:'🟨',v:playerQ.data.totals.yellowCards},{l:'🟥',v:playerQ.data.totals.redCards}].map(s=><Card key={s.l} className="px-3 py-2"><p className="text-xs text-text-muted">{s.l}</p><p className="text-xl font-bold tabular-nums">{s.v}</p></Card>)}</div>
              <Card className="overflow-x-auto p-0"><table className="w-full text-sm"><thead><tr className="border-b border-[var(--border-subtle)] text-left text-xs text-text-muted"><th className="px-4 py-2">Sezona</th><th className="px-4 py-2 text-right">N</th><th className="px-4 py-2 text-right">G</th><th className="px-4 py-2 text-right">A</th><th className="px-4 py-2 text-right">Min</th></tr></thead><tbody>{playerQ.data.seasons.map(s=><tr key={s.seasonId} className="border-t border-[var(--border-subtle)]"><td className="px-4 py-2">{s.seasonId.slice(0,8)}</td><td className="px-4 py-2 text-right tabular-nums">{s.appearances}</td><td className="px-4 py-2 text-right tabular-nums">{s.goals}</td><td className="px-4 py-2 text-right tabular-nums">{s.assists}</td><td className="px-4 py-2 text-right tabular-nums">{s.minutes}</td></tr>)}</tbody></table></Card>
            </div>
          ):null}
        </div>
      ) : (
        <div className="space-y-6">
          {(totalsQ.isError||trendQ.isError||geoQ.isError)?<div role="alert" className="flex flex-col gap-3 p-4"><p className="text-sm text-danger">Greška pri učitavanju posjeta.</p><Button variant="outline" size="sm" onClick={()=>{void totalsQ.refetch();void trendQ.refetch();void geoQ.refetch();}} disabled={totalsQ.isFetching||trendQ.isFetching||geoQ.isFetching}>Pokušaj ponovo</Button></div>:(totalsQ.isLoading||trendQ.isLoading||geoQ.isLoading)?<div aria-busy="true" className="space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div>:(
            <div className="space-y-6">
              {totalsQ.data&&<div className="grid gap-3 sm:grid-cols-3 text-center"><Card className="px-4 py-3"><p className="text-xs text-text-muted">Web</p><p className="text-2xl font-bold tabular-nums">{totalsQ.data.web}</p></Card><Card className="px-4 py-3"><p className="text-xs text-text-muted">Mobile</p><p className="text-2xl font-bold tabular-nums">{totalsQ.data.mobile}</p></Card><Card className="px-4 py-3"><p className="text-xs text-text-muted">Ukupno (30d)</p><p className="text-2xl font-bold tabular-nums">{totalsQ.data.total}</p></Card></div>}
              {trendQ.data&&trendQ.data.length>0&&<Card className="p-4 overflow-x-auto"><div className="flex min-w-[640px] items-end gap-2" style={{height:'10rem'}}>{trendQ.data.slice().reverse().map(r=>{const max=Math.max(...trendQ.data.map(x=>x.total),1); const h=(v:number)=>`${Math.max(4,Math.round(v/max*100))}%`; return <div key={r.date} className="flex flex-1 flex-col items-center gap-1"><div className="flex h-full w-full items-end justify-center gap-0.5"><div className="w-2 rounded-t-sm bg-blue-500/70" style={{height:h(r.web)}}/><div className="w-2 rounded-t-sm bg-primary/70" style={{height:h(r.mobile)}}/><div className="w-2 rounded-t-sm bg-accent/70" style={{height:h(r.total)}}/></div><span className="text-[10px] text-text-muted">{r.date.slice(5)}</span></div>;})}</div></Card>}
              {geoQ.data&&<div className="space-y-2">{geoQ.data.length?geoQ.data.map(row=>{const max=Math.max(...geoQ.data.map(r=>r.count),1); return <div key={row.countryCode} className="grid grid-cols-[1fr_auto] items-center gap-3"><div><div className="mb-1 flex justify-between text-sm"><span className="font-medium">{row.countryCode}</span><span className="tabular-nums text-text-muted">{row.count} · {row.percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-surface/80"><div className="h-full rounded-full bg-primary/70" style={{width:`${Math.max(4,Math.round(row.count/max*100))}%`}}/></div></div></div>; }):<p className="text-sm text-text-muted">Nema geo podataka (potrebna migracija i novi posjeti).</p>}</div>}
            </div>
          )}
          {(totalsQ.dataUpdatedAt||trendQ.dataUpdatedAt||geoQ.dataUpdatedAt)&&<div className="flex justify-end"><Button variant="outline" size="sm" onClick={()=>{void totalsQ.refetch();void trendQ.refetch();void geoQ.refetch();}} disabled={totalsQ.isFetching||trendQ.isFetching||geoQ.isFetching}>{totalsQ.isFetching?'Učitavanje…':'Osvježi'}</Button></div>}
        </div>
      )}
    </div>
  );
}
