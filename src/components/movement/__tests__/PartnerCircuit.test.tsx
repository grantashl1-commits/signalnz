import { beforeEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import PartnerCircuit from '../PartnerCircuit';
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
beforeEach(() => { cleanup(); localStorage.clear(); });
it('completes 36 swaps, keeps both partners loads, and advances to upper body', () => {
 render(<PartnerCircuit />); fireEvent.click(screen.getByText('Start partner circuit'));
 for (let i=0; i<36; i++) { fireEvent.change(screen.getByLabelText(/Reps completed/), { target: { value: '10' } }); fireEvent.change(screen.getByLabelText(/Load \/ springs/), { target: { value: '20 kg' } }); fireEvent.click(screen.getByText(i===35 ? 'Finish circuit' : 'Reps done — swap / next')); }
 const data = JSON.parse(localStorage.getItem('signal_partner_circuits_v1:guest')!); expect(data.active).toBeNull(); expect(data.history[0].records).toHaveLength(36); expect(data.history[0].records[1].partner).toBe('B'); expect(data.history[0].records[0].weight).toBe('20 kg'); expect(screen.getByLabelText('Choose your session')).toHaveValue('upper-strength');
});
it('resumes at the saved partner and pauses after navigation', () => {
 const view=render(<PartnerCircuit />); fireEvent.click(screen.getByText('Start partner circuit')); fireEvent.change(screen.getByLabelText(/Reps completed/), { target: { value: '8' } }); fireEvent.click(screen.getByText('Reps done — swap / next')); view.unmount(); render(<PartnerCircuit />); expect(screen.getByText(/Partner B: Barbell back squat/)).toBeTruthy(); expect(screen.getByText('Resume')).toBeTruthy(); expect(screen.getByText('Reps done — swap / next')).toBeDisabled();
});
