import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BABY_COURSE, TODDLER_COURSE, KIDS_TEENS_COURSE } from '@/data/parenting-course';
import SingleChoice from '../activities/SingleChoice';
import TrueFalse from '../activities/TrueFalse';
import Survey from '../activities/SurveyActivity';
import Carousel from '../activities/CarouselActivity';
import FlipCard from '../activities/FlipCard';
import KnowledgeCheck from '../activities/KnowledgeCheck';
import ReactionSlider from '../activities/ReactionSlider';
import OpenResponse from '../activities/OpenResponse';
import FindPair from '../activities/FindPairActivity';
import DecisionPoint from '../activities/DecisionPoint';
import Sort from '../activities/SortActivity';
import Comparison from '../activities/ComparisonActivity';
import FillBlanks from '../activities/FillBlanks';
vi.mock('@/hooks/use-mobile',()=>({haptic:()=>{}}));
const activities=[...BABY_COURSE,...TODDLER_COURSE,...KIDS_TEENS_COURSE].flatMap(m=>m.lessons.flatMap(l=>l.activities));
const renderers:Record<string,React.ComponentType<any>>={single_choice:SingleChoice,true_false:TrueFalse,survey:Survey,info_carousel:Carousel,flip_card:FlipCard,knowledge_check:KnowledgeCheck,reaction_slider:ReactionSlider,open_response:OpenResponse,find_the_pair:FindPair,decision_point:DecisionPoint,sort:Sort,comparison:Comparison,fill_blanks:FillBlanks};
afterEach(()=>{cleanup();localStorage.clear()});
it('renders every authored parenting activity and validates quiz answer keys',()=>{
 expect(new Set(activities.map(a=>a.id)).size).toBe(activities.length);
 for(const a of activities){
  expect(renderers[a.type],a.id).toBeDefined();
  const content=a.type==='info_carousel'?{cards:a.content.slides.map((s:any)=>({title:s.heading,body:s.body}))}:a.content;
  expect(()=>render(React.createElement(renderers[a.type],{content,onComplete:()=>{}})).unmount(),a.id).not.toThrow();
  if(a.type==='knowledge_check'){
   expect(a.content.questions.length).toBeGreaterThanOrEqual(a.content.passMark);
   for(const q of a.content.questions)expect(q.options[q.correct],a.id).toBeTruthy();
  }
 }
});
describe.each(activities.filter(a=>a.type==='true_false'))('$id',a=>{
 it('rejects the wrong answer and allows retry with the correct answer',()=>{
  const done=vi.fn();render(<TrueFalse content={a.content} onComplete={done}/>);
  const correct=a.content.correctAnswer??a.content.isTrue;
  fireEvent.click(screen.getByRole('button',{name:correct?'False':'True'}));
  expect(screen.getByText('Not quite!')).toBeInTheDocument();expect(done).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Try again'}));
  fireEvent.click(screen.getByRole('button',{name:correct?'True':'False'}));expect(done).toHaveBeenCalledTimes(1);
 });
});
it.each(activities.filter(a=>a.type==='single_choice'))('grades $id using its authored answer',a=>{
 const done=vi.fn();render(<SingleChoice content={a.content} onComplete={done}/>);
 const correct=a.content.options.findIndex((o:any)=>o.isCorrect);
 const label=(i:number)=>a.content.options[i].label;
 fireEvent.click(screen.getByRole('button',{name:label((correct+1)%a.content.options.length)}));fireEvent.click(screen.getByRole('button',{name:'Confirm'}));expect(done).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'Try again'}));fireEvent.click(screen.getByRole('button',{name:label(correct)}));fireEvent.click(screen.getByRole('button',{name:'Confirm'}));expect(done).toHaveBeenCalledTimes(1);
});
it.each(activities.filter(a=>a.type==='survey'))('records a choice for $id',a=>{
 const done=vi.fn();render(<Survey content={a.content} onComplete={done}/>);
 fireEvent.click(screen.getByRole('button',{name:a.content.options[0]}));fireEvent.click(screen.getByRole('button',{name:'Save response'}));
 expect(done).toHaveBeenCalledWith(expect.objectContaining({selectedOption:a.content.options[0]}));
});

