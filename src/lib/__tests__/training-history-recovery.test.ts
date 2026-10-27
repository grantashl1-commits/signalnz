import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ row: null as any, logs: [] as any[], error: null as any, afterRead: () => {}, writes: vi.fn(), ranges: vi.fn(), eq: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: 'member-a' } } }) },
  from: (table: string) => {
    const q: any = {
      select: () => q, eq: (...args: unknown[]) => { mock.eq(...args); return q; }, order: () => q, limit: () => q,
      maybeSingle: async () => ({ data: mock.row, error: null }),
      range: async (start: number, end: number) => { mock.ranges(start, end); mock.afterRead(); return { data: mock.logs.slice(start, end + 1), error: mock.error }; },
      insert: async (value: unknown) => { mock.writes(table, value); return { error: null }; },
      update: (value: unknown) => { mock.writes(table, value); return q; },
    };
    return q;
  },
} }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
import { syncTrainingProgress } from '../training-path-utils';
import { claimDevice } from '../device-privacy';
import { SIGNAL_TRAINING_PATHS, PARTNER_PATH_ID } from '@/data/signal-training-paths';
const path = SIGNAL_TRAINING_PATHS.find(p => p.id !== PARTNER_PATH_ID && p.weeks.length)!;
const week = path.weeks[0];
const key = `${path.id}::w${week.week}::d${week.sessions[0].day}`;
const completedKey = 'signal_path_completed_sessions';
const timeKey = 'signal_training_progress_updated_at';
beforeEach(() => {
  localStorage.clear(); claimDevice('member-a'); vi.clearAllMocks();
  mock.row = null; mock.logs = [{ notes: `Workout [${key}]` }]; mock.error = null; mock.afterRead = () => {};
});
describe('legacy training history recovery', () => {
  it('recovers valid sessions and saves a cloud snapshot scoped to the member', async () => {
    mock.logs.push({ notes: '[unknown::w1::d1]' }, { notes: `[${path.id}::w999::d1]` }, { notes: 'unrelated workout' });
    await syncTrainingProgress();
    expect(JSON.parse(localStorage.getItem(completedKey)!)).toEqual({ [key]: true });
    expect(mock.eq).toHaveBeenCalledWith('user_id', 'member-a');
    expect(mock.eq).toHaveBeenCalledWith('completed', true);
    expect(mock.writes).toHaveBeenCalledWith('user_plans', expect.objectContaining({ user_id: 'member-a', plan_data: expect.objectContaining({ completed: { [key]: true } }) }));
  });
  it('migrates untimestamped device completions even with no history', async () => {
    mock.logs = []; localStorage.setItem(completedKey, JSON.stringify({ [key]: true }));
    await syncTrainingProgress(); expect(mock.writes).toHaveBeenCalledTimes(1);
  });
  it('does not restore history over a local reset', async () => {
    localStorage.setItem(timeKey, '123'); localStorage.setItem(completedKey, '{}');
    await syncTrainingProgress(); expect(mock.ranges).not.toHaveBeenCalled(); expect(localStorage.getItem(completedKey)).toBe('{}');
  });
  it('does not restore history over a remote reset', async () => {
    mock.row = { id: 'progress', plan_data: { updatedAt: 123, completed: {} } };
    await syncTrainingProgress(); expect(mock.ranges).not.toHaveBeenCalled(); expect(localStorage.getItem(completedKey)).toBe('{}');
  });
  it('does not write results into a different account after a delayed read', async () => {
    mock.afterRead = () => { claimDevice('member-b'); };
    await syncTrainingProgress(); expect(localStorage.getItem(completedKey)).toBeNull(); expect(mock.writes).not.toHaveBeenCalled();
  });
  it('leaves recovery retryable on a history read error', async () => {
    mock.error = { message: 'offline' }; await syncTrainingProgress();
    expect(localStorage.getItem(timeKey)).toBeNull(); expect(mock.writes).not.toHaveBeenCalled();
  });
  it('reads beyond the first history page', async () => {
    mock.logs = [...Array.from({ length: 500 }, () => ({ notes: 'other workout' })), { notes: `[${key}]` }];
    await syncTrainingProgress(); expect(mock.ranges).toHaveBeenNthCalledWith(2, 500, 999);
    expect(JSON.parse(localStorage.getItem(completedKey)!)).toEqual({ [key]: true });
  });
  it('preserves a reset made while the history request is in flight', async () => {
    mock.afterRead = () => { localStorage.setItem(timeKey, '456'); localStorage.setItem(completedKey, '{}'); };
    await syncTrainingProgress(); expect(localStorage.getItem(completedKey)).toBe('{}');
  });
});
