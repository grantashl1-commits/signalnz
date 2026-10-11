import { it, expect } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { usePageTab } from '../usePageTab';
function Demo() { const [tab, setTab] = usePageTab(['today', 'shop'] as const, 'today'); const navigate=useNavigate(); return <><p>{tab}</p><button onClick={() => setTab('shop')}>List</button><button onClick={() => navigate(-1)}>Back</button></>; }
it('keeps tabs in the URL and follows browser back', () => { render(<MemoryRouter initialEntries={['/nutrition?tab=today']}><Demo /></MemoryRouter>); fireEvent.click(screen.getByText('List')); expect(screen.getByText('shop')).toBeTruthy(); fireEvent.click(screen.getByText('Back')); expect(screen.getByText('today')).toBeTruthy(); cleanup(); });
it('falls back to Today for an invalid linked tab', () => { render(<MemoryRouter initialEntries={['/nutrition?tab=missing']}><Demo /></MemoryRouter>); expect(screen.getByText('today')).toBeTruthy(); cleanup(); });
