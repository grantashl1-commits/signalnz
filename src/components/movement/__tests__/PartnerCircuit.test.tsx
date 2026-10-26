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

it('runs A, B, A, B at each station with planned loads, saves itself to today and moves to the next session', () => {
  renderHub();
  fireEvent.change(screen.getByPlaceholderText("Friend's name"), { target: { value: 'Jess' } });
  fireEvent.click(screen.getByText('Start class'));
  const classMode = screen.getByTestId('class-mode');
  expect(within(classMode).getByTestId('class-worker').textContent).toBe('Partner A');
  // Nothing to type: the station shows the plan's reps and load.
  expect(within(classMode).queryByRole('textbox')).toBeNull();
  expect(within(classMode).getByTestId('class-target').textContent).toContain(first.stations[0].reps);
  swap();
  expect(within(classMode).getByTestId('class-worker').textContent).toBe('Jess');
  swap(); swap(); swap();
  // Both partners did two rounds of station 1; now station 2.
  expect(within(classMode).getByText(/^Station 2\/9/)).toBeTruthy();
  for (let i = 4; i < 36; i++) swap();
  expect(screen.getByTestId('class-summary')).toBeTruthy();
  expect(screen.getByTestId('summary-A').textContent).toMatch(/Calories\d+ kcal/);
  expect(screen.getByTestId('class-saved').textContent).toContain('Saved to today');

  const progress = JSON.parse(localStorage.getItem('signal_partner_program_v1:guest')!);
  expect(progress.completed[first.id]).toBeTruthy();
  expect(progress.logs[0].records).toHaveLength(36);
  expect(progress.logs[0].records.slice(0, 4).map((r: { partnerName: string; round: number; exercise_id: string }) => [r.partnerName, r.round, r.exercise_id])).toEqual([
    ['Partner A', 1, first.stations[0].id], ['Jess', 1, first.stations[0].id], ['Partner A', 2, first.stations[0].id], ['Jess', 2, first.stations[0].id],
  ]);
  expect(progress.logs[0].records[0]).toMatchObject({ planned: true });
  expect(progress.logs[0].hr.A.kcal).toBeGreaterThanOrEqual(0);
  fireEvent.click(screen.getByTestId('class-done'));
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
  expect(within(classMode).getByTestId('class-worker').textContent).toBe('Partner B');
  expect(within(classMode).getAllByLabelText('Resume').length).toBeGreaterThan(0);
});

it('shows the Bluetooth notice when straps are unavailable', () => {
  renderHub();
  fireEvent.click(screen.getByText('Start class'));
  fireEvent.click(screen.getByLabelText('Show heart-rate screen'));
  expect(screen.getAllByText(/iPhone Safari can't connect to Bluetooth from a web page yet/).length).toBeGreaterThan(0);
  expect(screen.getByTestId('hr-tile-A').textContent).toContain('Partner A');
});

it('asks before restarting a class in progress', () => {
  renderHub();
  fireEvent.click(screen.getByText('Start class'));
  swap();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByTestId('class-mode')).toBeNull();
  fireEvent.click(screen.getByLabelText('Restart this class from turn 1'));
  expect(screen.getByText(/Turns logged so far will be discarded/)).toBeTruthy();
  fireEvent.click(screen.getByText('Keep it'));
  expect(screen.getByText(/Resume class · turn 2\/36/)).toBeTruthy();
});

it('swaps the squat and bench for dumbbells when the rack has no safeties', () => {
  renderHub('/movement?tab=partner&session=w5-s1');
  const labels = () => screen.getAllByTestId('partner-preview-tile').map(t => t.textContent ?? '');
  // Tile text is "<number><LABEL><reps>".
  expect(labels().some(l => /^\dBENCH PRESS/.test(l))).toBe(true);
  fireEvent.click(screen.getByText('No, hooks only'));
  expect(labels().some(l => /^\dBENCH PRESS/.test(l))).toBe(false);
  expect(labels().some(l => /^\dDB BENCH PRESS/.test(l))).toBe(true);
  expect(JSON.parse(localStorage.getItem('signal_partner_settings_v1:guest')!).safeties).toBe(false);
});

it('keeps an unticked early finish out of the plan', () => {
  renderHub();
  fireEvent.click(screen.getByText('Start class'));
  for (let i = 0; i < 4; i++) swap();
  fireEvent.click(screen.getByLabelText('End class'));
  fireEvent.click(within(screen.getByRole('alertdialog')).getByText('End class'));
  const tick = screen.getByRole('checkbox') as HTMLInputElement;
  expect(tick.checked).toBe(false);
  fireEvent.click(screen.getByTestId('class-save'));
  const progress = JSON.parse(localStorage.getItem('signal_partner_program_v1:guest')!);
  expect(progress.completed[first.id]).toBeUndefined();
  expect(progress.logs[0]).toMatchObject({ counted: false });
  expect(progress.logs[0].records).toHaveLength(4);
});

it('runs the optional third strength round (42 turns)', () => {
  renderHub();
  fireEvent.click(screen.getByText('Add a 3rd round of the strength stations'));
  fireEvent.click(screen.getByText('Start class'));
  for (let i = 0; i < 42; i++) swap();
  expect(screen.getByTestId('class-saved').textContent).toContain('Saved to today');
  const progress = JSON.parse(localStorage.getItem('signal_partner_program_v1:guest')!);
  expect(progress.logs[0].records).toHaveLength(42);
  // Each strength station gets a third A/B pair before moving on.
  expect(progress.logs[0].records[5]).toMatchObject({ round: 3, exercise_id: first.stations[0].id, partner: 'B' });
  expect(progress.logs[0].records[6]).toMatchObject({ round: 1, exercise_id: first.stations[1].id, partner: 'A' });
});
