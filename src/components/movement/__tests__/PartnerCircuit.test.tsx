import { beforeEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PartnerCircuit from '../PartnerCircuit';
import { orderedSessions } from '@/lib/partner-progress';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
vi.mock('@/hooks/useExerciseIllustrations', () => ({ useExerciseIllustrations: () => () => undefined }));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const [first, second] = orderedSessions();
const renderHub = (path = '/movement?tab=partner') => render(<MemoryRouter initialEntries={[path]}><PartnerCircuit /></MemoryRouter>);
const swap = () => fireEvent.click(screen.getByTestId('class-swap'));

beforeEach(() => { cleanup(); localStorage.clear(); });

it('shows the next session as a 3x3 station grid and names both partners', () => {
  renderHub();
  expect(screen.getByRole('heading', { name: `Week ${first.week} · Session ${first.index}` })).toBeTruthy();
  expect(screen.getAllByTestId('partner-preview-tile')).toHaveLength(9);
  fireEvent.change(screen.getByPlaceholderText("Friend's name"), { target: { value: 'Jess' } });
  expect(screen.getByRole('heading', { name: 'Partner A & Jess' })).toBeTruthy();
  expect(JSON.parse(localStorage.getItem('signal_partner_settings_v1:guest')!).B.name).toBe('Jess');
});

it('runs 36 alternating turns, carries loads into round 2, saves and moves to the next session', () => {
  renderHub();
  fireEvent.change(screen.getByPlaceholderText("Friend's name"), { target: { value: 'Jess' } });
  fireEvent.click(screen.getByText('Start class'));
  const classMode = screen.getByTestId('class-mode');
  expect(within(classMode).getAllByTestId('class-worker')[0].textContent).toContain('Partner A');
  expect(within(classMode).getAllByTestId('class-treadmill')[0].textContent).toContain('Jess');
  fireEvent.change(screen.getAllByLabelText('Load for Partner A')[0], { target: { value: '40 kg' } });
  for (let i = 0; i < 18; i++) swap();
  // Round 2, partner A, station 1 again: the round-1 load is prefilled.
  expect((screen.getAllByLabelText('Load for Partner A')[0] as HTMLInputElement).value).toBe('40 kg');
  for (let i = 18; i < 36; i++) swap();
  expect(screen.getByTestId('class-summary')).toBeTruthy();
  fireEvent.click(screen.getByTestId('class-save'));

  const progress = JSON.parse(localStorage.getItem('signal_partner_program_v1:guest')!);
  expect(progress.completed[first.id]).toBeTruthy();
  expect(progress.logs[0].records).toHaveLength(36);
  expect(progress.logs[0].records[1]).toMatchObject({ partner: 'B', partnerName: 'Jess', round: 1, exercise_id: first.stations[0].id });
  expect(progress.logs[0].records[0].weight).toBe('40 kg');
  expect(localStorage.getItem('signal_partner_class_v1:guest')).toBeNull();
  expect(screen.queryByTestId('class-mode')).toBeNull();
  if (second) expect(screen.getByRole('heading', { name: `Week ${second.week} · Session ${second.index}` })).toBeTruthy();
});

it('resumes at the saved turn, paused, after navigating away', () => {
  const view = renderHub();
  fireEvent.click(screen.getByText('Start class'));
  swap();
  view.unmount();
  renderHub();
  fireEvent.click(screen.getByText(/Resume class · turn 2\/36/));
  const classMode = screen.getByTestId('class-mode');
  expect(within(classMode).getAllByTestId('class-worker')[0].textContent).toContain('Partner B');
  expect(within(classMode).getAllByLabelText('Resume').length).toBeGreaterThan(0);
});

it('shows the Bluetooth notice when straps are unavailable', () => {
  renderHub();
  fireEvent.click(screen.getByText('Start class'));
  fireEvent.click(screen.getByLabelText('Show heart-rate screen'));
  expect(screen.getAllByText(/iPhone Safari can't connect to Bluetooth from a web page yet/).length).toBeGreaterThan(0);
  expect(screen.getByTestId('hr-tile-A').textContent).toContain('Partner A');
});
