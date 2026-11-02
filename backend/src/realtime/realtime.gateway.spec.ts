jest.mock('@prisma/client', () => {
  const makeSentinel = (): unknown => {
    const target: Record<string, unknown> = {};
    return new Proxy(target, {
      get: (t, prop) => {
        if (prop === 'PrismaClient') return class PrismaClientMock {};
        if (prop === 'then' || prop === 'toJSON') return undefined;
        if (prop === 'toString') return () => '[prisma-mock]';
        if (prop === Symbol.toPrimitive) return () => '[prisma-mock]';
        if (typeof prop === 'symbol') return Reflect.get(t, prop) as unknown;
        if (!(prop in t)) t[prop] = makeSentinel();
        return t[prop];
      },
      has: () => true,
    });
  };
  return makeSentinel();
});
import { RealtimeGateway } from './realtime.gateway';

/**
 * BE-06: unit testovi gateway handlera — newsletter soba traži prijavu,
 * match:join ima cap (B-06-02) i idempotentno ponavljanje.
 */
type TestSocket = {
  data: { public?: boolean; userId?: string };
  rooms: Set<string>;
  join: jest.Mock;
  leave: jest.Mock;
};

function createSocket(userId?: string): TestSocket {
  return {
    data: userId ? { userId } : { public: true },
    rooms: new Set(['socket-id']),
    join: jest.fn(),
    leave: jest.fn(),
  };
}

function createGateway(): RealtimeGateway {
  return new RealtimeGateway(
    { verifyAsync: jest.fn() } as never,
    {
      getOrThrow: jest.fn().mockReturnValue('secret'),
      get: jest.fn(),
    } as never,
    {} as never,
  );
}

function asClient(
  s: TestSocket,
): Parameters<RealtimeGateway['handleMatchJoin']>[0] {
  return s as unknown as Parameters<RealtimeGateway['handleMatchJoin']>[0];
}

describe('RealtimeGateway (BE-06)', () => {
  const gateway = createGateway();

  it('match:join: validan id → ok + soba', () => {
    const s = createSocket();
    const res = gateway.handleMatchJoin(asClient(s), { matchId: 'm-1' });

    expect(res).toEqual({ ok: true, matchId: 'm-1' });
    expect(s.join).toHaveBeenCalledWith('match:m-1');
  });

  it('match:join: bez matchId → ok:false, bez join poziva', () => {
    const s = createSocket();
    expect(gateway.handleMatchJoin(asClient(s), {})).toEqual({ ok: false });
    expect(s.join).not.toHaveBeenCalled();
  });

  it('match:join: cap (B-06-02) — 33. soba odbijena', () => {
    const s = createSocket();
    for (let i = 0; i < 32; i++) {
      gateway.handleMatchJoin(asClient(s), { matchId: `m-${i}` });
      s.rooms.add(`match:m-${i}`);
    }
    const res = gateway.handleMatchJoin(asClient(s), { matchId: 'm-32' });
    expect(res).toEqual({ ok: false });
  });

  it('match:join: ponovljeni join iste sobe je idempotentan (ok, bez rasta)', () => {
    const s = createSocket();
    s.rooms.add('match:m-1');
    const res = gateway.handleMatchJoin(asClient(s), { matchId: 'm-1' });
    expect(res).toEqual({ ok: true, matchId: 'm-1' });
    expect(s.join).not.toHaveBeenCalled();
  });

  it('newsletter:join: JAVNI klijent → ok:false (soba traži prijavu)', () => {
    const s = createSocket();
    expect(gateway.handleNewsletterJoin(asClient(s))).toEqual({ ok: false });
    expect(s.join).not.toHaveBeenCalled();
  });

  it('newsletter:join: prijavljen → ok + soba', () => {
    const s = createSocket('user-1');
    expect(gateway.handleNewsletterJoin(asClient(s))).toEqual({ ok: true });
    expect(s.join).toHaveBeenCalledWith('newsletter');
  });

  it('match:leave: poziva leave za zadanu sobu', () => {
    const s = createSocket();
    gateway.handleMatchLeave(asClient(s), { matchId: 'm-9' });
    expect(s.leave).toHaveBeenCalledWith('match:m-9');
  });
});
