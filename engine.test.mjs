import { E } from './engine.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const advance = (s)=>{for(let i=0;i<12000&&s.phase==="wave";i++)E.step(s,.05);assert(s.phase!=="wave","wave timeout")};
test("routes are contiguous",()=>{for(let m=0;m<E.maps.length;m++){const s=E.create(m);assert(s.path.every(([x,y],i)=>x>=0&&x<E.COLS&&y>=0&&y<E.ROWS&&(!i||Math.abs(x-s.path[i-1][0])+Math.abs(y-s.path[i-1][1])===1)))}});
test("placement and accounting",()=>{const s=E.create();assert(!E.place(s,"firewall",0,2));assert(!E.place(s,"firewall",-1,0));assert(!E.place(s,"bad",1,0));assert(E.place(s,"firewall",2,1));assert(!E.place(s,"ids",2,1));assert.equal(s.cash,250);assert(E.upgrade(s,s.towers[0].id));assert.equal(s.cash,135);assert(!E.upgrade(s,s.towers[0].id));assert(E.sell(s,s.towers[0].id));assert.equal(s.cash,274)});
test("wave completion, leakage and repair",()=>{const s=E.create();assert(E.start(s));assert(!E.start(s));advance(s);assert.equal(s.phase,"build");assert.equal(s.integrity,45);assert.equal(s.leaks,11);assert.equal(s.cash,423);assert(E.repair(s));assert.equal(s.integrity,65);assert.equal(s.cash,363)});
test("firewall rewards",()=>{const s=E.create();for(const [x,y] of [[2,1],[3,3],[5,4]])assert(E.place(s,"firewall",x,y));E.start(s);advance(s);assert(s.kills>0);assert(s.score>0);assert(s.cash>50)});
test("stealth requires detection",()=>{const s=E.create();s.wave=4;s.phase="wave";E.place(s,"firewall",1,1);const e={id:99,type:"stealth",hp:100,maxHp:100,progress:1,x:1,y:2,slow:0,mark:0};s.enemies=[e];E.step(s,.05);assert.equal(e.hp,100);E.place(s,"ids",2,1);E.step(s,.05);assert(e.mark>0);E.step(s,.05);assert(e.hp<100)});
test("rate limiting slows traffic",()=>{const s=E.create();s.wave=2;s.phase="wave";E.place(s,"limiter",1,1);s.enemies=[{id:99,type:"flood",hp:100,maxHp:100,progress:1,x:1,y:2,slow:0,mark:0}];E.step(s,.05);assert(s.enemies[0].slow>0)});
test("campaign and endless",()=>{for(const endless of [false,true]){const s=E.create(0,"normal",endless);s.wave=15;s.phase="wave";E.step(s,.05);assert.equal(s.phase,endless?"build":"won")}});
test("loss and terminal guards",()=>{const s=E.create();s.integrity=1;s.phase="wave";s.wave=1;s.enemies=[{id:1,type:"bot",hp:10,maxHp:10,progress:s.path.length-1,x:13,y:3,slow:0,mark:0}];E.step(s,.05);assert.equal(s.phase,"lost");assert(!E.place(s,"ids",1,1));assert(!E.start(s));assert(!E.repair(s))});
test("difficulty and boss waves",()=>{assert.equal(E.create(0,"hard").cash,300);assert.equal(E.create(1,"easy").integrity,125);assert.equal(E.wavePlan(5).at(-1),"boss");assert(!E.wavePlan(4).includes("boss"));assert(E.wavePlan(4).includes("stealth"))});

test("rejects invalid input and inherited object keys",()=>{assert.throws(()=>E.create(0,"constructor"));assert.throws(()=>E.create("0"));assert.throws(()=>E.create(0,"normal",1));const s=E.create();assert(!E.place(s,"constructor",0,0));assert(!E.place(s,"__proto__",0,0));assert(!E.place(s,"firewall",1.5,1));assert(!E.place(s,"firewall",NaN,1));});
test("endless wave size remains bounded",()=>{assert(E.wavePlan(1000000).length<=121)});
test("invalid time steps do not mutate the simulation",()=>{const s=E.create();E.start(s);const before=JSON.stringify(s);for(const dt of [0,-1,NaN,Infinity])E.step(s,dt);assert.equal(JSON.stringify(s),before)});
