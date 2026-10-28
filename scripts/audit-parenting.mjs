import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';
const server = await createServer({cacheDir:'node_modules/.vite-parenting-audit',server:{middlewareMode:true},appType:'custom'});
try {
 const d=await server.ssrLoadModule('/src/data/parenting-course.ts');
 const courses=Object.fromEntries(['BABY_COURSE','TODDLER_COURSE','KIDS_TEENS_COURSE'].map(k=>[k,d[k]]));
 const rows=Object.entries(courses).flatMap(([course,mods])=>mods.flatMap(m=>m.lessons.map(l=>({course,module:m.id,moduleTitle:m.title,lesson:l.id,title:l.title,minutes:l.estimatedMinutes,activities:l.activities}))));
 const acts=rows.flatMap(l=>l.activities.map(a=>({...a,lesson:l.lesson,module:l.module})));
 const types=Object.fromEntries([...new Set(acts.map(a=>a.type))].map(t=>[t,{count:acts.filter(a=>a.type===t).length,example:acts.find(a=>a.type===t)}]));
 const dup=arr=>arr.filter((v,i)=>arr.indexOf(v)!==i);
 const summary={courses:Object.entries(courses).map(([name,mods])=>({name,modules:mods.length,lessons:mods.reduce((n,m)=>n+m.lessons.length,0),activities:mods.reduce((n,m)=>n+m.lessons.reduce((n,l)=>n+l.activities.length,0),0)})),duplicates:{modules:dup(Object.values(courses).flat().map(m=>m.id)),lessons:dup(rows.map(l=>l.lesson)),activities:dup(acts.map(a=>a.id))},types,lessonsWithoutActivities:rows.filter(l=>!l.activities.length),lessonsWithoutPractice:rows.filter(l=>!l.activities.some(a=>!['info_carousel','carousel','flip_card','knowledge_check'].includes(a.type))).map(l=>l.lesson)};
 writeFileSync('docs/parenting-audit-inventory-current.json',JSON.stringify({summary,lessons:rows},null,2));
 console.log(JSON.stringify(summary,null,2));
} finally {await server.close()}

