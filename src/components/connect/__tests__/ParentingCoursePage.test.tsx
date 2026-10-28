import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
vi.mock('@/contexts/AuthContext',()=>({useAuth:()=>({user:null})}));
vi.mock('@/hooks/useFeatureGate',()=>({useFeatureGate:()=>({hasFeatureAccess:()=>true})}));
vi.mock('@/hooks/use-mobile',()=>({haptic:()=>{}}));
vi.mock('@/components/parenting/PointPalsTab',()=>({default:()=>null}));
import ParentingCoursePage from '@/components/parenting/ParentingCoursePage';
import { BABY_COURSE } from '@/data/parenting-course';
import { claimDevice } from '@/lib/device-privacy';
const reflection=BABY_COURSE.flatMap(m=>m.lessons.map(l=>({m,l}))).flatMap(({m,l})=>l.activities.map(a=>({m,l,a}))).find(({a})=>a.type==='open_response')!;
const answer='A saved fictional reflection to review and practise with my family.';
beforeEach(()=>{localStorage.clear();claimDevice(null)});afterEach(cleanup);
it('opens a saved reflection at its activity with its original answer',async()=>{
 const {m,l,a}=reflection;
 localStorage.setItem('signal_course_progress_v1',JSON.stringify({[a.id]:{activity_id:a.id,lesson_id:l.id,module_id:m.id,completed:true,response:{text:answer}}}));
 render(<ParentingCoursePage/>);
 fireEvent.click(await screen.findByRole('button',{name:'My reflections & practice (1)'}));
 fireEvent.click(screen.getByText(answer));
 expect(await screen.findByLabelText(a.content.prompt)).toHaveValue(answer);
});
it('resumes the stored lesson after a new page mount',async()=>{
 const {m,l}=reflection;
 localStorage.setItem('signal_parenting_resume',JSON.stringify({tab:'babies',module:m.id,lesson:l.id}));
 render(<ParentingCoursePage/>);
 fireEvent.click(screen.getByRole('button',{name:'Continue your last lesson'}));
 expect(await screen.findByRole('heading',{name:l.title})).toBeInTheDocument();
});
it('opens the Friendship Audit in the friendship lesson',async()=>{
 render(<ParentingCoursePage/>);
 fireEvent.click(screen.getByRole('button',{name:'Kids & Teens'}));
 fireEvent.click(screen.getByRole('button',{name:'Quick Toolkit'}));
 fireEvent.click(screen.getByRole('button',{name:/Friendship Audit/}));
 expect(await screen.findByRole('heading',{name:'The Friendship Filter'})).toBeInTheDocument();
}, 15000);
