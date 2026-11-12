import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

const state = vi.hoisted(() => ({ created: 0 }));

vi.mock('./router', async () => {
  const React = await import('react');
  const { createMemoryRouter } = await import('react-router-dom');
  state.created += 1;
  return {
    appRouter: createMemoryRouter([
      { path: '/', element: React.createElement('main', null, 'početna stranica') },
    ]),
  };
});

describe('App', () => {
  it('renderuje rutu kroz RouterProvider', async () => {
    render(<App />);
    expect(await screen.findByText('početna stranica')).toBeInTheDocument();
    expect(state.created).toBe(1);
  });
});
