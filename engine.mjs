const engine = function engine(){
 const COLS=14,ROWS=10;
 const maps=[
 {name:"Edge Gateway",points:[[0,2],[4,2],[4,7],[9,7],[9,3],[13,3]]},
 {name:"Cloud Perimeter",points:[[0,7],[3,7],[3,1],[7,1],[7,8],[11,8],[11,4],[13,4]]},
 {name:"Data Centre",points:[[0,4],[2,4],[2,8],[6,8],[6,2],[10,2],[10,6],[13,6]]}
 ];
 const towers={
 firewall:{name:"Firewall",cost:100,range:2.35,damage:24,interval:.65,color:"#38bdf8",symbol:"FW",description:"Filters common malicious traffic. Strong against bots and scans."},
 ids:{name:"IDS",cost:85,range:3.1,damage:0,interval:.8,color:"#c084fc",symbol:"ID",description:"Detects stealth traffic and marks threats for increased damage."},
 limiter:{name:"Rate limiter",cost:90,range:2.5,damage:9,interval:.55,color:"#fbbf24",symbol:"RL",description:"Slows packet floods and fast threats."},
 ips:{name:"IPS",cost:165,range:2.8,damage:45,interval:.9,color:"#2dd4bf",symbol:"IP",description:"Blocks detected exploits and malware. Can hit stealth threats when marked."},
 waf:{name:"Web app firewall",cost:145,range:2.45,damage:34,interval:.7,color:"#fb7185",symbol:"WA",description:"Specialised protection against application-layer attacks."},
 scrubber:{name:"Traffic scrubber",cost:210,range:2.1,damage:19,interval:.85,color:"#a3e635",symbol:"TS",description:"Area damage against groups of simulated malicious packets."}
 };
 const threats={
 bot:{name:"Bot traffic",hp:65,speed:1.25,reward:15,impact:5,color:"#f87171"},
 flood:{name:"DDoS flood",hp:42,speed:2.05,reward:11,impact:4,color:"#fbbf24"},
 exploit:{name:"Web exploit",hp:115,speed:1.05,reward:24,impact:9,color:"#fb7185"},
 stealth:{name:"Stealth malware",hp:105,speed:1.35,reward:27,impact:10,color:"#c084fc"},
 scan:{name:"Recon scan",hp:36,speed:2.5,reward:12,impact:3,color:"#60a5fa"},
 boss:{name:"Advanced threat",hp:680,speed:.7,reward:120,impact:30,color:"#f97316"}
 };
 const difficulty={easy:{cash:420,hp:125,scale:.8},normal:{cash:350,hp:100,scale:1},hard:{cash:300,hp:85,scale:1.25}};
 const pathFor=map=>{const p=[map.points[0]];for(let i=1;i<map.points.length;i++){let [x,y]=p.at(-1),[a,b]=map.points[i];while(x!==a||y!==b){x+=Math.sign(a-x);y+=Math.sign(b-y);p.push([x,y]);}}return p;};
 const stats=t=>{const d=towers[t.type],l=t.level-1;return {...d,range:d.range+l*.23,damage:d.damage*(1+l*.65),interval:d.interval/(1+l*.14)};};
 const upgradeCost=t=>Math.round(towers[t.type].cost*(.75+t.level*.4));
 const distance=(x,y,a,b)=>Math.hypot(x-a,y-b);
 function create(map=0,mode="normal",endless=false){if(!Number.isInteger(map)||!maps[map]||!Object.hasOwn(difficulty,mode)||typeof endless!=="boolean")throw Error("Invalid mission");const d=difficulty[mode];return {map,mode,endless,path:pathFor(maps[map]),cash:d.cash,integrity:d.hp,maxIntegrity:d.hp,wave:0,phase:"build",towers:[],enemies:[],queue:[],spawnIn:0,score:0,kills:0,leaks:0,shots:[],events:["Network online. Deploy defences."],nextId:1,time:0};}
 function log(s,m){s.events.unshift(m);s.events.length=Math.min(s.events.length,30);}
 function place(s,type,x,y){const d=Object.hasOwn(towers,type)?towers[type]:null;if(!d||!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=COLS||y>=ROWS||!["build","wave"].includes(s.phase)||s.cash<d.cost||s.path.some(p=>p[0]===x&&p[1]===y)||s.towers.some(t=>t.x===x&&t.y===y))return false;s.cash-=d.cost;s.towers.push({id:s.nextId++,type,x,y,level:1,spent:d.cost,cooldown:0,target:"first"});return true;}
 function upgrade(s,id){const t=s.towers.find(t=>t.id===id);if(!t||t.level>=3||s.cash<upgradeCost(t)||!["build","wave"].includes(s.phase))return false;const cost=upgradeCost(t);s.cash-=cost;t.spent+=cost;t.level++;return true;}
 function sell(s,id){const i=s.towers.findIndex(t=>t.id===id);if(i<0||!["build","wave"].includes(s.phase))return false;s.cash+=Math.floor(s.towers[i].spent*.65);s.towers.splice(i,1);return true;}
 function wavePlan(w){const list=[];for(let i=0;i<Math.min(120,8+w*3);i++){let k="bot";if(w>=2&&i%3===0)k="flood";if(w>=3&&i%5===1)k="exploit";if(w>=4&&i%7===2)k="stealth";if(w>=6&&i%5===3)k="scan";list.push(k);}if(w%5===0)list.push("boss");return list;}
 function start(s){if(s.phase!=="build")return false;s.wave++;s.phase="wave";s.queue=wavePlan(s.wave);s.spawnIn=0;log(s,"Wave "+s.wave+" inbound.");return true;}
 function spawn(s,type){const d=threats[type],hp=d.hp*(1+(s.wave-1)*.14)*difficulty[s.mode].scale;const [x,y]=s.path[0];s.enemies.push({id:s.nextId++,type,hp,maxHp:hp,progress:0,x,y,slow:0,mark:0});}
 function hit(s,t,e,d){if(t.type==="ids"){e.mark=Math.max(e.mark,3+t.level);return;}let damage=d.damage;if(t.type==="firewall"&&["bot","scan"].includes(e.type))damage*=1.45;if(t.type==="waf"&&e.type==="exploit")damage*=2.2;if(t.type==="ips"&&["stealth","exploit","boss"].includes(e.type))damage*=1.35;if(t.type==="limiter"){e.slow=Math.max(e.slow,1.2+t.level*.4);if(e.type==="flood")damage*=1.6;}if(e.mark>0)damage*=1.4;e.hp-=damage;}
 function step(s,dt){if(s.phase!=="wave"||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);s.time+=dt;s.shots=s.shots.filter(a=>(a.ttl-=dt)>0);s.spawnIn-=dt;if(s.queue.length&&s.spawnIn<=0){spawn(s,s.queue.shift());s.spawnIn=Math.max(.23,.75-s.wave*.025);}
 for(const e of s.enemies){e.mark=Math.max(0,e.mark-dt);e.slow=Math.max(0,e.slow-dt);e.progress+=threats[e.type].speed*(e.slow>0?.48:1)*dt;const i=Math.floor(e.progress);if(i<s.path.length-1){const a=s.path[i],b=s.path[i+1],f=e.progress-i;e.x=a[0]+(b[0]-a[0])*f;e.y=a[1]+(b[1]-a[1])*f;}else{[e.x,e.y]=s.path.at(-1);}}
 for(const t of s.towers){t.cooldown-=dt;if(t.cooldown>0)continue;const d=stats(t),eligible=s.enemies.filter(e=>e.hp>0&&e.progress<s.path.length-1&&distance(t.x,t.y,e.x,e.y)<=d.range&&(e.type!=="stealth"||e.mark>0||t.type==="ids"));if(!eligible.length)continue;eligible.sort((a,b)=>t.type==="ids"?a.mark-b.mark||b.progress-a.progress:t.target==="strong"?b.hp-a.hp:t.target==="weak"?a.hp-b.hp:b.progress-a.progress);const e=eligible[0];for(const target of t.type==="scrubber"?eligible.filter(a=>distance(a.x,a.y,e.x,e.y)<=1.3):[e])hit(s,t,target,d);s.shots.push({x:t.x,y:t.y,ex:e.x,ey:e.y,color:d.color,ttl:.15});t.cooldown=d.interval;}
 s.enemies=s.enemies.filter(e=>{const d=threats[e.type];if(e.hp<=0){s.cash+=d.reward;s.score+=d.reward*10;s.kills++;return false;}if(e.progress>=s.path.length-1){s.integrity=Math.max(0,s.integrity-d.impact);s.leaks++;log(s,d.name+" reached server: -"+d.impact+" integrity.");return false;}return true;});
 if(s.integrity<=0){s.phase="lost";log(s,"Server compromised.");return;}if(!s.queue.length&&!s.enemies.length){s.cash+=65+s.wave*8;s.score+=s.wave*100;s.phase=s.wave>=15&&!s.endless?"won":"build";log(s,s.phase==="won"?"Mission complete.":"Wave cleared. Deployment budget replenished.");}}
 function repair(s){if(s.phase!=="build"||s.cash<60||s.integrity>=s.maxIntegrity)return false;s.cash-=60;s.integrity=Math.min(s.maxIntegrity,s.integrity+20);return true;}
 return {COLS,ROWS,maps,towers,threats,difficulty,stats,upgradeCost,create,place,upgrade,sell,start,step,repair,wavePlan};
};
export const E = engine();
