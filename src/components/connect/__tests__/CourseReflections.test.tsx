import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import OpenResponse from '../activities/OpenResponse';
import { claimDevice } from '@/lib/device-privacy';
import { readCourseDraft } from '@/lib/course-progress';
const content={prompt:'Your plan'};const answer='This fictional practice plan contains enough words to save the reflection.';
beforeEach(()=>{localStorage.clear();claimDevice('a')});afterEach(cleanup);
it('keeps an unfinished draft when navigating away and back',()=>{
 const first=render(<OpenResponse activityId="a1" content={content} onComplete={()=>{}}/>);
 fireEvent.change(screen.getByLabelText('Your plan'),{target:{value:answer}});first.unmount();
 render(<OpenResponse activityId="a1" content={content} onComplete={()=>{}}/>);expect(screen.getByLabelText('Your plan')).toHaveValue(answer);
});
it('reviews, edits and records a practice check-in against a restored reflection',async()=>{
 const save=vi.fn().mockResolvedValue(true);
 render(<OpenResponse activityId="a1" content={content} initialResponse={{text:answer}} onComplete={save}/>);
 expect(screen.getByLabelText('Your plan')).toHaveValue(answer);expect(screen.queryByText(/couple.s vault/)).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Edit reflection'}));fireEvent.change(screen.getByLabelText('Your plan'),{target:{value:answer+' Updated.'}});
 fireEvent.click(screen.getByRole('button',{name:'Save reflection'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Edit reflection'})).toBeInTheDocument());
 expect(readCourseDraft('a1')).toBeUndefined();
 fireEvent.change(screen.getByLabelText('After trying this in daily life, what happened?'),{target:{value:'The pause helped.'}});fireEvent.click(screen.getByRole('button',{name:'Save practice check-in'}));
 await waitFor(()=>expect(save).toHaveBeenLastCalledWith(expect.objectContaining({practice:expect.objectContaining({note:'The pause helped.'})})));
});
it('keeps the draft and shows an error when the parent cannot save',async()=>{
 render(<OpenResponse activityId="a1" content={content} onComplete={async()=>false}/>);
 fireEvent.change(screen.getByLabelText('Your plan'),{target:{value:answer}});fireEvent.click(screen.getByRole('button',{name:'Save reflection'}));
 await waitFor(()=>expect(screen.getByRole('alert')).toBeInTheDocument());expect(readCourseDraft('a1')).toBe(answer);expect(screen.queryByText(/Reflection saved/)).not.toBeInTheDocument();
});
