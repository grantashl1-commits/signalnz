import { beforeEach, describe, expect, it, vi } from 'vitest';
import { claimDevice, captureDeviceScope } from '../device-privacy';
describe('account cache isolation', () => {
 beforeEach(() => localStorage.clear());
 it('quarantines unowned legacy data without assigning it to a new member', () => {
  localStorage.setItem('mindcast_journal_v2','private');
  claimDevice('a');
  expect(localStorage.getItem('mindcast_journal_v2')).toBeNull();
  expect(localStorage.getItem('signal-account-cache:unassigned')).toContain('private');
 });
 it('restores offline data to its original account after signout and another login', () => {
  claimDevice('a'); localStorage.setItem('mindcast_journal_v2','a entries');
  localStorage.setItem('weeklyPlan:2026-44','a plan'); localStorage.setItem('sb-project-auth-token','keep');
  claimDevice(null); expect(localStorage.getItem('mindcast_journal_v2')).toBeNull();
  claimDevice('b'); localStorage.setItem('mindcast_journal_v2','b entries');
  claimDevice('a'); expect(localStorage.getItem('mindcast_journal_v2')).toBe('a entries');
  expect(localStorage.getItem('weeklyPlan:2026-44')).toBe('a plan');
  expect(localStorage.getItem('sb-project-auth-token')).toBe('keep');
  claimDevice('b'); expect(localStorage.getItem('mindcast_journal_v2')).toBe('b entries');
 });
 it('invalidates queued work even after switching away and back', () => {
  claimDevice('a'); const scope = captureDeviceScope();
  expect(scope.matches('a')).toBe(true); expect(scope.matches('b')).toBe(false);
  claimDevice('b'); claimDevice('a'); expect(scope.valid()).toBe(false);
 });
 it('isolates anonymous sessions and keeps same-account data', () => {
  claimDevice('a'); localStorage.setItem('signal_habits','a');
  expect(claimDevice('a')).toBe(false);
  claimDevice('anon',true); expect(localStorage.getItem('signal_habits')).toBeNull();
 });
 it('fails closed if an offline archive cannot be saved', () => {
  claimDevice('a'); localStorage.setItem('mindcast_journal_v2','a');
  const write=vi.spyOn(Storage.prototype,'setItem').mockImplementation(() => {throw new Error('quota');});
  try { expect(() => claimDevice('b')).toThrow('quota'); }
  finally { write.mockRestore(); }
  expect(localStorage.getItem('signal_device_owner')).toBe('a');
  expect(localStorage.getItem('mindcast_journal_v2')).toBe('a');
 });
});
