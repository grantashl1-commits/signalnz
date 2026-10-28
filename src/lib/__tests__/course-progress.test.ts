import { beforeEach, expect, it, vi } from 'vitest';
const mock=vi.hoisted(()=>({read:vi.fn(),write:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{from:()=>{const q:any={select:()=>q,eq:()=>q,order:()=>q,range:mock.read,upsert:mock.write};return q}}}));
import { claimDevice } from '../device-privacy';
import { saveCourseActivity, loadCourseProgress, flushCourseProgress, getLocalCourseProgress, hasPendingCourseProgress } from '../course-progress';
const row={activity_id:'reflection',completed:true,response:{text:'Fictional test reflection'}};
beforeEach(()=>{localStorage.clear();claimDevice('a');mock.read.mockReset().mockResolvedValue({data:[],error:null});mock.write.mockReset().mockResolvedValue({error:null});});
it('keeps failed uploads queued and retries them without losing the response',async()=>{
 mock.write.mockResolvedValue({error:{message:'offline'}});
 await saveCourseActivity('a',row);await flushCourseProgress('a').catch(()=>{});
 expect(getLocalCourseProgress()[0].response).toEqual(row.response);expect(hasPendingCourseProgress()).toBe(true);
 mock.write.mockResolvedValue({error:null});await flushCourseProgress('a');expect(hasPendingCourseProgress()).toBe(false);
 expect(mock.write).toHaveBeenLastCalledWith(expect.objectContaining({user_id:'a',response:row.response}),{onConflict:'user_id,activity_id'});
});
it('restores the written response on a new device',async()=>{
 mock.read.mockResolvedValue({data:[{...row,updated_at:'2026-10-28T00:00:00Z'}],error:null});
 expect((await loadCourseProgress('a'))[0].response).toEqual(row.response);
});
it('ignores a late restore after switching accounts',async()=>{
 let resolve!:(v:any)=>void;mock.read.mockImplementation(()=>new Promise(r=>{resolve=r}));
 const loading=loadCourseProgress('a');await vi.waitFor(()=>expect(mock.read).toHaveBeenCalled());
 claimDevice('b');resolve({data:[row],error:null});expect(await loading).toEqual([]);expect(getLocalCourseProgress()).toEqual([]);
});
it('retains an edit made while a cloud read is in flight',async()=>{
 let resolve!:(v:any)=>void;mock.read.mockImplementation(()=>new Promise(r=>{resolve=r}));
 const loading=loadCourseProgress('a');await vi.waitFor(()=>expect(mock.read).toHaveBeenCalled());
 await saveCourseActivity('a',{...row,response:{text:'Newer edit'}});await flushCourseProgress('a');
 resolve({data:[{...row,updated_at:'2020-01-01T00:00:00Z'}],error:null});
 expect((await loading)[0].response).toEqual({text:'Newer edit'});
});
it('does not acknowledge a newer edit when an older upload completes',async()=>{
 let resolve!:(v:any)=>void;mock.write.mockImplementationOnce(()=>new Promise(r=>{resolve=r}));
 await saveCourseActivity('a',row);await saveCourseActivity('a',{...row,response:{text:'Second edit'}});
 resolve({error:null});await flushCourseProgress('a');
 expect(mock.write).toHaveBeenCalledTimes(2);expect(getLocalCourseProgress()[0].response).toEqual({text:'Second edit'});expect(hasPendingCourseProgress()).toBe(false);
});
it('surfaces storage failure instead of reporting a saved completion',async()=>{
 const write=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota')});
 await expect(saveCourseActivity('a',row)).rejects.toThrow('quota');expect(mock.write).not.toHaveBeenCalled();write.mockRestore();
});
it('migrates legacy local-only completed answers into the retry queue',async()=>{
 localStorage.setItem('signal_course_progress_v1',JSON.stringify({reflection:row}));await loadCourseProgress('a');
 expect(mock.write).toHaveBeenCalledWith(expect.objectContaining({response:row.response,user_id:'a'}),expect.anything());
});
it('paginates beyond 500 activities',async()=>{
 mock.read.mockImplementation(async(start:number)=>({data:start===0?Array.from({length:500},(_,i)=>({...row,activity_id:`activity-${i}`})):[{...row,activity_id:'last'}],error:null}));
 expect(await loadCourseProgress('a')).toHaveLength(501);expect(mock.read).toHaveBeenNthCalledWith(2,500,999);
});
it('refuses to save an old account callback into the new active cache',async()=>{
 claimDevice('b');await expect(saveCourseActivity('a',row)).rejects.toThrow('account changed');expect(getLocalCourseProgress()).toEqual([]);
});
