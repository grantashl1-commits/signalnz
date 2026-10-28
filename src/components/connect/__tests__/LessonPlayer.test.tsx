import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LessonPlayer from '../LessonPlayer';
import { claimDevice } from '@/lib/device-privacy';
vi.mock('@/hooks/use-mobile',()=>({haptic:()=>{}}));
const lesson:any={id:'test-lesson',title:'Practice lesson',description:'A fictional test lesson',activities:[
 {id:'first',type:'open_response',title:'First reflection',content:{prompt:'First plan'}},
 {id:'second',type:'open_response',title:'Second reflection',content:{prompt:'Second plan'}}
]};
const answer='This fictional reflection has enough words to save and practise later.';
beforeEach(()=>{localStorage.clear();claimDevice('a')});afterEach(cleanup);
it('resumes at the first unfinished activity and restores its response',async()=>{
 render(<LessonPlayer lesson={lesson} initialCompleted={new Set(['first'])} responses={{second:{text:answer}}} onBack={()=>{}} onComplete={()=>{}} onSaveProgress={()=>{}}/>);
 expect(await screen.findByLabelText('Second plan')).toHaveValue(answer);
 expect(screen.queryByRole('button',{name:/Complete lesson/})).not.toBeInTheDocument();
});
it('does not unlock completion until the last reflection is durably saved',async()=>{
 const save=vi.fn().mockRejectedValueOnce(new Error('Storage full')).mockResolvedValue(undefined);
 render(<LessonPlayer lesson={lesson} initialCompleted={new Set(['first'])} onBack={()=>{}} onComplete={()=>{}} onSaveProgress={save}/>);
 fireEvent.change(await screen.findByLabelText('Second plan'),{target:{value:answer}});
 fireEvent.click(screen.getByRole('button',{name:'Save reflection'}));
 await waitFor(()=>expect(screen.getByText('This activity has not been saved. Reopen it and try again.')).toBeInTheDocument());
 expect(screen.queryByRole('button',{name:/Complete lesson/})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Save reflection'}));
 expect(await screen.findByRole('button',{name:/Complete lesson/})).toBeInTheDocument();
});
