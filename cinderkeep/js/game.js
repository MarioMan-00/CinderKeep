
(()=>{
'use strict';
/* =========================================================
   CONSTANTS & PALETTE
   ========================================================= */
const T=16,VW=400,VH=225,ROWS=22,LH=ROWS*T,GRAV=950;
const C={
  stone:'#36343d',stoneL:'#45424d',stoneD:'#2a2830',deep:'#201f26',mortar:'#1c1b21',lip:'#5a5561',lipL:'#726c78',
  back:'#1b1a20',backL:'#222028',backD:'#131217',
  iron:'#3b3940',ironL:'#5d5a64',rust:'#6e3f28',rustL:'#8f5533',wood:'#3b2a21',woodL:'#54402f',woodD:'#2a1e18',
  ember:'#ff8c2e',emberL:'#ffc368',emberW:'#fff0b8',blood:'#6b1d22',bloodL:'#8c2a2e',bone:'#b4ab94',boneD:'#857c69',
  cloak:'#363c45',cloakD:'#252a31',hood:'#2c3139',scarf:'#7a3e26',skinD:'#1a1a20'
};
const FONT_D='"Grenze Gotisch",Georgia,serif',FONT_B='"Alegreya Sans",system-ui,sans-serif';

/* =========================================================
   HELPERS
   ========================================================= */
function rng32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=rng32(1);
const ri=(a,b)=>a+Math.floor(R()*(b-a+1)),chance=p=>R()<p,pick=a=>a[Math.floor(R()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=Math.random;
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]};
function harden(cv,cut=110){const c=cv.getContext('2d'),d=c.getImageData(0,0,cv.width,cv.height),a=d.data;for(let i=3;i<a.length;i+=4)a[i]=a[i]>cut?255:0;c.putImageData(d,0,0)}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function deadTree(c,x,y,ang,len,w,depth,col,r){
  const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len,mx=(x+x2)/2+(r()-.5)*len*.35,my=(y+y2)/2;
  c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(mx,my,x2,y2);c.stroke();
  if(depth<=0||len<3)return;const n=2+(r()<.4?1:0);
  for(let i=0;i<n;i++)deadTree(c,x2,y2,ang+(r()-.5)*1.6,len*(.55+r()*.22),Math.max(1,w*.6),depth-1,col,r);
}

/* =========================================================
   BACKDROP LAYERS (outdoor sky, distant ruined castles)
   ========================================================= */
const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const [sky,skx]=mk(VW,VH);
(()=>{const cols=['#0f0f15','#13131a','#18171f','#1d1c25','#24212a','#2d262c','#3a2c2d','#4a332c'].map(h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)));
  const d=skx.createImageData(VW,VH),a=d.data;
  for(let y=0;y<VH;y++)for(let x=0;x<VW;x++){const t=Math.pow(y/VH,1.35)*(cols.length-1);let i=Math.floor(t);if((t-i)*16>BAYER[y&3][x&3])i++;i=Math.min(i,cols.length-1);const o=(y*VW+x)*4,c=cols[i];a[o]=c[0];a[o+1]=c[1];a[o+2]=c[2];a[o+3]=255}
  skx.putImageData(d,0,0);
  // moon
  const mx=306,my=44;for(let r=26;r>14;r-=4){skx.globalAlpha=.05;skx.fillStyle='#b9b3a6';skx.beginPath();skx.arc(mx,my,r,0,7);skx.fill()}
  skx.globalAlpha=1;skx.fillStyle='#c9c2ad';skx.beginPath();skx.arc(mx,my,12,0,7);skx.fill();
  skx.fillStyle='#aba48f';skx.fillRect(mx-5,my-3,4,3);skx.fillRect(mx+3,my+2,3,3);skx.fillRect(mx-2,my+5,2,2);
  skx.fillStyle='#0f0f15';skx.beginPath();skx.arc(mx+7,my-4,11,0,7);skx.fill();
  // thin cloud streaks
  const r=rng32(9);for(let i=0;i<22;i++){skx.fillStyle=r()<.5?'#1a1921':'#22202a';skx.fillRect(r()*VW|0,20+r()*90|0,20+r()*70|0,1+(r()<.3?1:0))}
})();
function castle(c,x,base,s,col,litP,r){
  const w=(40+r()*50)*s,h=(30+r()*30)*s;
  c.fillStyle=col;c.fillRect(x,base-h,w,h);
  for(let cx=x;cx<x+w;cx+=4*s)if(r()<.7)c.fillRect(cx,base-h-3*s,2*s,3*s);
  const nt=2+(r()*3|0);
  for(let i=0;i<nt;i++){const tx=x+r()*w-6*s,tw=(7+r()*6)*s,th=h+(15+r()*45)*s;c.fillRect(tx,base-th,tw,th);
    if(r()<.55){c.beginPath();c.moveTo(tx-2*s,base-th);c.lineTo(tx+tw/2,base-th-tw*2.2);c.lineTo(tx+tw+2*s,base-th);c.fill()}
    else{for(let k=0;k<tw;k+=2*s)c.fillRect(tx+k,base-th-(r()*6*s),2*s,6*s)}
    if(r()<litP){c.fillStyle='#c9772e';c.fillRect(Math.round(tx+tw/2),Math.round(base-th+8*s),1,2);c.fillStyle=col}}
  for(let i=0;i<5;i++)if(r()<litP*.6){c.fillStyle='#b8692a';c.fillRect(Math.round(x+r()*w),Math.round(base-h*.6+r()*h*.4),1,1);c.fillStyle=col}
  // broken bite
  c.globalCompositeOperation='destination-out';c.beginPath();const bx=x+r()*w;c.moveTo(bx,base-h-10);c.lineTo(bx+10*s,base-h*.6);c.lineTo(bx+20*s,base-h-10);c.fill();c.globalCompositeOperation='source-over';
}
const [farL,fx]=mk(1000,VH),[midL,mx2]=mk(1500,VH),[nearL,nx]=mk(2800,VH);
(()=>{const r=rng32(17);
  fx.fillStyle='#202029';fx.beginPath();fx.moveTo(0,VH);for(let x=0;x<=1000;x+=5)fx.lineTo(x,168+Math.sin(x*.006)*7+Math.sin(x*.021)*3);fx.lineTo(1000,VH);fx.fill();
  for(const x of [60,260,470,690,880])castle(fx,x,170,.7,'#202029',.5,r);
  harden(farL,90);
  mx2.fillStyle='#18181f';mx2.beginPath();mx2.moveTo(0,VH);for(let x=0;x<=1500;x+=5)mx2.lineTo(x,182+Math.sin(x*.004+2)*9+Math.sin(x*.017)*4);mx2.lineTo(1500,VH);mx2.fill();
  for(const x of [140,620,1120])castle(mx2,x,186,1.15,'#18181f',.4,r);
  for(let i=0;i<10;i++)deadTree(mx2,r()*1500,190,-Math.PI/2+(r()-.5)*.3,16+r()*14,3,6,'#18181f',r);
  harden(midL,90);
  nx.fillStyle='#111116';nx.beginPath();nx.moveTo(0,VH);for(let x=0;x<=2800;x+=5)nx.lineTo(x,200+Math.sin(x*.005+5)*8);nx.lineTo(2800,VH);nx.fill();
  for(let i=0;i<9;i++)deadTree(nx,r()*2800,206,-Math.PI/2+(r()-.5)*.3,26+r()*22,5,7,'#111116',r);
  for(let i=0;i<4;i++){const x=200+r()*1800;nx.fillStyle='#111116';nx.fillRect(x,150,7,60);nx.fillRect(x+36,150,7,60);nx.lineWidth=6;nx.strokeStyle='#111116';nx.beginPath();nx.arc(x+21,154,18,Math.PI,Math.PI*(1.5+r()*.5));nx.stroke()}
  harden(nearL,90);
})();
const [fogC,fogx]=mk(1000,80);
(()=>{const r=rng32(3);for(let i=0;i<46;i++){const x=r()*1000,y=25+r()*35,rx=40+r()*90;const gr=fogx.createRadialGradient(x,y,0,x,y,rx);gr.addColorStop(0,'rgba(120,118,138,.13)');gr.addColorStop(1,'rgba(120,118,138,0)');fogx.save();fogx.translate(x,y);fogx.scale(1,.18+r()*.1);fogx.translate(-x,-y);fogx.fillStyle=gr;fogx.beginPath();fogx.arc(x,y,rx,0,7);fogx.fill();fogx.restore()}})();
const [vig,vgx]=mk(VW,VH);
(()=>{const gr=vgx.createRadialGradient(VW/2,VH*.48,VH*.32,VW/2,VH*.5,VW*.6);gr.addColorStop(0,'rgba(5,4,8,0)');gr.addColorStop(1,'rgba(5,4,8,.7)');vgx.fillStyle=gr;vgx.fillRect(0,0,VW,VH)})();

/* =========================================================
   WORLD: one authored, connected level in five sections
   tiles: 0 air, 1 stone, 2 one-way iron ledge, 3 spikes, 4 bridge, 5 false wall, 6 iron door
   ========================================================= */
const WIDTHS=[242,400,440,480,660];
const SECT=[[
  {x0:0,name:'The Forgotten Gate',sub:'Where the pilgrims of ash first came knocking.'},
  {x0:44,name:'The Fallen Courtyard',sub:'Broken saints keep a broken watch.'},
  {x0:104,name:'The Prison Walk',sub:'The cells are empty. The jailers are not.'},
  {x0:172,name:'The Ashen Shrine',sub:'A brazier that has never gone out.'},
  {x0:196,name:'The Throne of Cinders',sub:'The king still sits in judgement.'}
],[
  {x0:0,name:'The Bone Stair',sub:'Every step down was cut from someone.'},
  {x0:70,name:'The Ossuary Halls',sub:'The dead are stacked here by the thousand.'},
  {x0:170,name:"The Matron's Choir",sub:'She still sings them to sleep.'},
  {x0:240,name:'The Cinder Well',sub:'The keep burns from below.'},
  {x0:330,name:"The Seraph's Pyre",sub:'Something winged keeps the last fire.'}],[
  {x0:0,name:'The Slag Gate',sub:'Iron runs like water here.'},
  {x0:80,name:'The Bellows Halls',sub:'The keep still breathes through these lungs.'},
  {x0:180,name:'The Anvil Court',sub:'Every blade in Cinderkeep was struck here.'},
  {x0:260,name:'The Chain Shafts',sub:'Hold fast. The slag does not forgive.'},
  {x0:360,name:'The Crown Furnace',sub:'She keeps the last flame for herself.'}],[
  {x0:0,name:'The Gatehouse Roof',sub:'Daylight. You had almost forgotten it.'},
  {x0:90,name:'The Long Wall',sub:'The garrison never stood down.'},
  {x0:197,name:'The Bell Tower',sub:'Someone still rings for the dead.'},
  {x0:278,name:'The Sky Bridge',sub:'Mind the wind. Mind the drop.'},
  {x0:390,name:'The Sun Spire',sub:'Something vast nests above the keep.'}],[
  {x0:0,name:'The Rampart Stair',sub:'The outer walls, and everything that guards them.'},
  {x0:140,name:'The Siege Yard',sub:'The siege never ended. The engines still stand.'},
  {x0:263,name:'The Muster Field',sub:'The garrison forms ranks at the sound of a horn.'},
  {x0:345,name:'The Curtain Wall',sub:'A long walk on a broken wall.'},
  {x0:525,name:'The Barbican',sub:'The great gate. Something enormous is chained to it.'}]];
let SECTIONS=SECT[0];
function sectionAt(x){const tx=x/T;let s=0;for(let i=0;i<SECTIONS.length;i++)if(tx>=SECTIONS[i].x0)s=i;return s}
let MW=0,grid,indoorCol,darkCol,backTop,levelBack,levelFront,levelFake,fakeCtx,decorLive=[],staticLights=[],objs=[],items=[],arena=null,arenas=[],fakeGroups=[],spawnList=[];
function solidCode(v){return v===1||v===4||v===6}
function tileAt(tx,ty){if(tx<0||tx>=MW)return 1;if(ty<0||ty>=ROWS)return 0;return grid[ty*MW+tx]}
function buildL1({S,D,O,I,E,zone}){

  /* ---- A: THE FORGOTTEN GATE ---- safe start, ruined gate, a little platforming, one gap */
  zone(0,43,.3);S(0,0,1,ROWS-1,1);
  for(let x=24;x<=31;x++)backTop[x]=9+(x*7)%3;for(let x=37;x<=43;x++)backTop[x]=11+(x&1);
  S(13,6,21,8,1);S(13,5,14,5,1);S(17,5,17,5,1);S(20,5,21,5,1);
  D('gatehouse',13,16);D('portcullis',17,9);
  D('tree',4,16,{s:1});D('brazier',8,16);D('statue',10,16,{k:1});D('tree',31,16,{s:0});
  S(24,14,26,15,1);S(27,11,30,11,2);I('souls',29,11,{v:20,id:'a_cache'});
  S(33,16,35,ROWS-1,0);
  D('statue',41,16,{k:2});E('hollow',39,16,3);
  O('chest',42,16,{id:'a_chest',loot:'souls',v:40});

  /* ---- B: THE FALLEN COURTYARD ---- two soldiers, a raised ledge, a treasure room, a false wall, a barred door */
  zone(44,103,.32);
  for(let x=44;x<=69;x++)backTop[x]=8+Math.round(Math.sin(x*.7)*2+Math.sin(x*1.9));
  for(let x=88;x<=103;x++)backTop[x]=8+Math.round(Math.sin(x*.9)*2);
  S(52,14,53,15,1);
  D('statue',48,16,{k:0});D('gibbet',55,16);D('statue',66,16,{k:2});D('statue',92,16,{k:0});D('tree',60,16,{s:1});D('brazier',99,16);
  E('hollow',58,16,3);E('hollow',84,16,4);
  S(62,14,63,15,1);S(64,11,69,11,2);
  S(70,4,80,11,1);S(71,6,79,10,0);S(70,8,70,10,0);zone(70,87,.6,4);
  O('chest',77,11,{id:'b_chest',loot:'scroll'});D('candles',73,11);D('banner',75,6);D('torch',72,8);
  S(81,4,87,11,1);S(81,8,86,10,0);S(80,8,80,10,5);S(86,11,87,11,0);
  I('souls',83,11,{v:60,id:'b_secret'});I('vial',85,10,{id:'b_vial'});D('bones',82,11);
  for(const x of [72,76,80,84])D('pillar',x,12,{top:12*T,bot:16*T});
  S(95,16,98,19,0);S(95,17,95,19,1);S(96,18,96,19,1);S(99,17,99,19,6);
  O('lockedDoor',97,20,{});zone(92,103,.4);for(let x=92;x<=101;x++)backTop[x]=Math.max(backTop[x],9);
  S(102,0,103,15,1);S(102,11,103,15,0);

  /* ---- C: THE PRISON WALK ---- corridors and cells, an archer, an armored warden, spikes, a secret, a shortcut */
  zone(104,171,.86,0);
  S(104,0,107,8,1);S(108,0,127,9,1);
  S(120,14,127,15,1);E('archer',124,14,2);
  S(121,5,127,8,0);S(128,0,128,9,1);S(128,7,128,8,5);
  I('whetstone',124,9,{id:'c_whetstone'});D('anvil',122,9);D('candles',126,9);
  S(129,0,146,3,1);S(136,14,137,15,1);S(134,12,135,15,1);S(129,9,133,9,2);
  E('warden',142,16,3);
  S(147,0,171,9,1);S(150,15,152,15,3);S(156,14,158,15,1);
  S(168,16,168,16,2);O('note',168,16,{label:'Iron grate',sub:'Hold S and press Space to drop through'});
  S(100,17,169,19,0);O('bar',100,20,{});
  for(const x of [110,114,161,165])D('cell',x,16);
  for(const x of [112,118])D('torch',x,13);for(const x of [131,140,145])D('torch',x,11);for(const x of [154,167])D('torch',x,13);
  D('pillar',138,4,{top:4*T,bot:16*T});D('banner',143,5);D('chain',132,4,{len:40,end:'cage'});D('chain',144,4,{len:56,end:'hook'});D('chain',139,4,{len:24,end:null});
  D('bones',149,16);D('coffin',160,16);D('torch',104,19);D('torch',140,19);D('bones',122,20);D('bones',152,20);D('chain',130,17,{len:16,end:'hook'});

  /* ---- D: THE ASHEN SHRINE ---- the checkpoint brazier */
  zone(172,195,.7,0);
  S(172,0,195,3,1);S(172,4,173,10,1);S(194,4,195,10,1);
  O('shrine',183,16,{});
  D('statue',177,16,{k:1});D('statue',189,16,{k:1});D('window',179,5);D('window',185,5);D('candles',180,16);D('candles',186,16);D('banner',176,5);D('banner',190,5);

  /* ---- E: THE THRONE OF CINDERS ---- the arena */
  zone(196,241,.8,0);
  S(196,0,197,12,1);S(198,0,239,2,1);S(240,0,241,ROWS-1,1);
  S(205,11,209,11,2);S(221,11,225,11,2);S(229,14,236,15,1);
  D('throne',233,14);
  for(const [x,h] of [[201,150],[213,90],[217,120],[228,70],[238,160]])D('brokenPillar',x,16,{h});
  D('fallenPillar',211,16);D('window',207,4);D('window',219,4);
  for(const x of [204,216,226])D('torch',x,10);D('chain',210,3,{len:48,end:'cage'});D('chain',223,3,{len:30,end:null});D('banner',231,4);
  E('king',226,16,0);
  arenas.push({gates:[197],trigger:201*T,x1:239,boss:'king',flag:'kingDead',name:'The Ashen King',sub:'Last ember of a hollow crown'});
  O('descent',238,16,{to:1,flag:'kingDead'});

  return{x:5*T+8,y:16*T}}
function buildWorld(L=0){
  MW=WIDTHS[L];SECTIONS=SECT[L];arenas=[];arena=null;grid=new Uint8Array(MW*ROWS);indoorCol=new Uint8Array(MW);darkCol=new Float32Array(MW);backTop=new Int8Array(MW).fill(-1);
  decorLive=[];staticLights=[];objs=[];items=[];fakeGroups=[];spawnList=[];
  const S=(x0,y0,x1,y1,v)=>{for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)if(x>=0&&x<MW&&y>=0&&y<ROWS)grid[y*MW+x]=v};
  const D=(t,tx,ty,o={})=>decorLive.push(Object.assign({t,x:tx*T+8,y:ty*T},o));
  const O=(kind,tx,ty,o={})=>objs.push(Object.assign({kind,x:tx*T+8,y:ty*T},o));
  const I=(kind,tx,ty,o={})=>items.push(Object.assign({kind,x:tx*T+8,y:ty*T,vx:0,vy:0,w:8,h:8},o));
  const E=(t,tx,ty,range)=>spawnList.push({t,x:tx*T+8,y:ty*T,range:range*T});
  const zone=(x0,x1,dark,top)=>{for(let x=x0;x<=x1;x++){darkCol[x]=dark;indoorCol[x]=dark>.5?1:0;if(top!==undefined)backTop[x]=top}};
  S(0,16,MW-1,ROWS-1,1);
  const start=[buildL1,buildL2,buildL3,buildL4,buildL5][L]({S,D,O,I,E,zone});

  // connected false-wall groups
  const seen=new Set();
  for(let i=0;i<grid.length;i++){if(grid[i]!==5||seen.has(i))continue;const g2=[],st=[i];seen.add(i);
    while(st.length){const j=st.pop();g2.push(j);const x=j%MW,y=(j/MW)|0;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(y+b)*MW+x+a;if(x+a>=0&&x+a<MW&&y+b>=0&&y+b<ROWS&&grid[k]===5&&!seen.has(k)){seen.add(k);st.push(k)}}}
    fakeGroups.push({tiles:g2,revealed:false})}
  renderLevel();
  for(const d of decorLive){
    if(d.t==='torch')staticLights.push({x:d.x,y:d.y-4,r:62,warm:1,ph:rnd()*9});
    if(d.t==='brazier')staticLights.push({x:d.x,y:d.y-14,r:80,warm:1,ph:rnd()*9});
    if(d.t==='candles')staticLights.push({x:d.x,y:d.y-6,r:34,warm:1,ph:rnd()*9});
    if(d.t==='window')staticLights.push({x:d.x+7,y:d.y+14,r:34,warm:0,ph:0});
    if(d.t==='throne')staticLights.push({x:d.x,y:d.y-30,r:70,warm:1,ph:3});
  }
  for(let y=0;y<ROWS;y++)for(let x=0;x<MW;x+=2)if(grid[y*MW+x]===7)staticLights.push({x:x*T+8,y:y*T,r:54,warm:1,ph:rnd()*9});
  for(const d of decorLive){if(d.t==='furnace')staticLights.push({x:d.x,y:d.y-24,r:140,warm:1,ph:2});if(d.t==='emberglow')staticLights.push({x:d.x,y:LH-14,r:120,warm:1,ph:rnd()*9});if(d.t==='pyre')staticLights.push({x:d.x,y:d.y-40,r:130,warm:1,ph:1})}
  for(const o of objs)if(o.kind==='shrine')staticLights.push({x:o.x,y:o.y-30,r:116,warm:1,ph:2});
  return start;
}
/* =========================================================
   LEVEL RENDERING (prerendered once per level)
   ========================================================= */
function renderLevel(){const day=game.level>=3,keep={};if(day)for(const k in DAYPAL){keep[k]=C[k];C[k]=DAYPAL[k]}
  try{renderLevel0()}finally{if(day)Object.assign(C,keep)}}
function renderLevel0(){
  const W=MW*T;[levelBack]=mk(W,LH);[levelFront]=mk(W,LH);[levelFake,fakeCtx]=mk(W,LH);
  const b=levelBack.getContext('2d'),f=levelFront.getContext('2d');const r=rng32(77);
  // back wall
  for(let x=0;x<MW;x++){const top=backTop[x];if(top<0)continue;
    for(let y=top;y<ROWS;y++){const px=x*T,py=y*T;
      b.fillStyle=C.back;b.fillRect(px,py,T,T);
      const off=(y&1)*6;b.fillStyle=C.backD;b.fillRect(px,py+T-1,T,1);for(let bx=off;bx<T;bx+=12)b.fillRect(px+bx,py,1,T-1);
      b.fillStyle=C.backL;for(let bx=off+1;bx<T;bx+=12)b.fillRect(px+bx,py,Math.min(5,T-bx-1),1);
      if(r()<.12){b.fillStyle=C.backD;b.fillRect(px+2+r()*8|0,py+3+r()*8|0,4+r()*5|0,3+r()*3|0)}
      if(y===top&&!indoorCol[x]){b.clearRect(px,py,T,4);for(let i=0;i<T;i+=2){const d=r()*7|0;b.clearRect(px+i,py+4,2,d)}}
    }}
  // static decor
  for(const d of decorLive)drawStaticDecor(b,d,r);
  // tiles
  const at=(x,y)=>{const v=tileAt(x,y);return v===5?1:v};
  for(let y=0;y<ROWS;y++)for(let x=0;x<MW;x++){const v=grid[y*MW+x];if(!v)continue;const px=x*T,py=y*T;
    if(v===1||v===5){const F=v===5?fakeCtx:f;
      let deep=true;for(let dy=-1;dy<=1&&deep;dy++)for(let dx=-1;dx<=1;dx++){const n=at(x+dx,y+dy);if(!(n===1||(y+dy>=ROWS)))deep=false}
      if(deep&&y>0&&y<ROWS-1){F.fillStyle=C.deep;F.fillRect(px,py,T,T);if(r()<.25){F.fillStyle='#26242c';F.fillRect(px+r()*10|0,py+r()*10|0,5,3)}continue}
      F.fillStyle=C.stone;F.fillRect(px,py,T,T);
      for(let row=0;row<2;row++){const off=((x+y+row)&1)*8;F.fillStyle=C.mortar;F.fillRect(px,py+row*8+7,T,1);
        for(let bx=off;bx<T;bx+=16){F.fillRect(px+bx,py+row*8,1,7)}
        for(let bx=off-16;bx<T;bx+=16){const sx=Math.max(0,bx+1),ex=Math.min(T,bx+16);if(ex<=sx)continue;
          const k=r();if(k<.25){F.fillStyle=C.stoneD;F.fillRect(px+sx,py+row*8,ex-sx,7)}else if(k<.4){F.fillStyle=C.stoneL;F.fillRect(px+sx,py+row*8,ex-sx,7)}
          F.fillStyle=C.stoneL;F.fillRect(px+sx,py+row*8,Math.min(3,ex-sx),1)}}
      if(r()<.2){F.fillStyle=C.mortar;let cx=px+4+r()*8|0,cy=py+2;for(let i=0;i<6;i++){F.fillRect(cx,cy,1,1);cx+=r()<.5?1:-1;cy++}}
      const up=at(x,y-1),dn=at(x,y+1),lf=at(x-1,y),rt=at(x+1,y);
      if(!(up===1)&&y>0){F.fillStyle=C.lip;F.fillRect(px,py,T,2);F.fillStyle=C.lipL;for(let i=0;i<T;i+=3)if(r()<.5)F.fillRect(px+i,py,2,1)}
      if(lf!==1){F.fillStyle=C.stoneD;F.fillRect(px,py,2,T);F.fillStyle=C.mortar;F.fillRect(px,py,1,T)}
      if(rt!==1){F.fillStyle=C.stoneD;F.fillRect(px+T-2,py,2,T);F.fillStyle=C.mortar;F.fillRect(px+T-1,py,1,T)}
      if(dn!==1&&y<ROWS-1){F.fillStyle=C.mortar;F.fillRect(px,py+T-2,T,2);for(let i=0;i<T;i+=4)if(r()<.4)F.fillRect(px+i,py+T,1,1+r()*3|0)}
      // dead weeds, pebbles on exposed tops
      if(up===0&&y>0){for(let i=0;i<T;i+=2){if(r()<.18){F.fillStyle=r()<.5?'#4a4038':'#3a332d';const h=1+r()*4|0;for(let k=0;k<h;k++)F.fillRect(px+i+(k>2?(r()<.5?1:-1):0),py-1-k,1,1)}if(r()<.08){F.fillStyle='#4e4a55';F.fillRect(px+i,py-1,2,1)}}}
    }else if(v===2){
      f.fillStyle=C.iron;f.fillRect(px,py,T,5);f.fillStyle=C.ironL;f.fillRect(px,py,T,1);f.fillStyle=C.rust;f.fillRect(px,py+4,T,1);
      for(let i=2;i<T;i+=6){f.fillStyle=C.rustL;f.fillRect(px+i,py+2,1,1)}
      if(r()<.4){f.fillStyle=C.rust;f.fillRect(px+r()*12|0,py+5,1,1+r()*3|0)}
      if(at(x-1,y)!==2){f.fillStyle=C.iron;for(let k=0;k<6;k++)f.fillRect(px+1+k,py+5+k,2,1)}
      if(at(x+1,y)!==2){f.fillStyle=C.iron;for(let k=0;k<6;k++)f.fillRect(px+T-3-k,py+5+k,2,1)}
    }else if(v===3){
      f.fillStyle=C.iron;f.fillRect(px,py+T-3,T,3);
      for(let i=1;i<T;i+=4){const h=8+(r()*4|0);for(let k=0;k<h;k++){f.fillStyle=k>h-3?'#8f8b96':k<3?C.rust:C.ironL;f.fillRect(px+i+(k>h-4?1:0),py+T-3-k,k>h-4?1:3,1)}}
    }else if(v===7){for(let yy=0;yy<T;yy++)for(let xx=0;xx<T;xx+=2){f.fillStyle=yy<2?((((x*T+xx)>>1)+yy)%3===0?C.emberW:C.emberL):yy<6?C.ember:yy<11?'#c4521f':'#7a2a14';f.fillRect(px+xx,py+yy,2,1)}
      f.fillStyle='#ffe0a0';if(r()<.6)f.fillRect(px+(r()*14|0),py+1,2,1)
    }else if(v===4){
      f.fillStyle=C.wood;f.fillRect(px,py,T,6);f.fillStyle=C.woodL;f.fillRect(px,py,T,1);
      f.fillStyle=C.woodD;for(let i=0;i<T;i+=5)f.fillRect(px+i,py+1,1,5);f.fillRect(px,py+6,T,1);
      f.fillStyle=C.iron;f.fillRect(px,py+2,T,1);if((x&1)===0){f.fillStyle=C.ironL;f.fillRect(px+2,py+2,1,1)}
      if(r()<.3){f.fillStyle=C.woodD;f.fillRect(px+r()*12|0,py+7,1,2)}
    }
  }
}
function drawStaticDecor(c,d,r){
  if(DECOR2[d.t]){DECOR2[d.t](c,d,r);return}
  const x=Math.round(d.x),y=Math.round(d.y);
  switch(d.t){
    case 'pillar':{const top=d.top,bot=d.bot;c.fillStyle='#24222a';c.fillRect(x-6,top,12,bot-top);c.fillStyle='#2d2b34';c.fillRect(x-6,top,3,bot-top);c.fillStyle='#1a1920';c.fillRect(x+4,top,2,bot-top);
      c.fillStyle='#19181e';for(let k=x-2;k<x+4;k+=3)c.fillRect(k,top+8,1,bot-top-16);
      c.fillStyle='#2f2d36';c.fillRect(x-8,top,16,5);c.fillRect(x-9,bot-6,18,6);c.fillStyle='#3a3842';c.fillRect(x-8,top,16,1);c.fillRect(x-9,bot-6,18,1);
      if(r()<.5){c.fillStyle='#19181e';c.fillRect(x-3,top+20+r()*40|0,4,6)}break}
    case 'window':{const w=14,h=28;c.fillStyle='#2a2830';c.fillRect(x-2,y+6,w+4,h-4);c.beginPath();c.moveTo(x-2,y+8);c.quadraticCurveTo(x+w/2,y-8,x+w+2,y+8);c.fill();
      c.fillStyle='#0d0d13';c.fillRect(x,y+8,w,h-8);c.beginPath();c.moveTo(x,y+9);c.quadraticCurveTo(x+w/2,y-4,x+w,y+9);c.fill();
      c.fillStyle='#232838';for(let i=0;i<8;i++)c.fillRect(x+1+r()*(w-2)|0,y+6+r()*(h-8)|0,1,1);c.fillStyle='#2e3446';c.fillRect(x+2,y+10,3,8);
      c.fillStyle='#2a2830';c.fillRect(x+w/2-1,y+2,2,h-2);c.fillRect(x,y+16,w,1);c.fillStyle='#38353f';c.fillRect(x-3,y+h,w+6,2);break}
    case 'torch':{c.fillStyle=C.iron;c.fillRect(x-1,y,3,7);c.fillRect(x-3,y-1,7,2);c.fillStyle=C.rust;c.fillRect(x-1,y+5,3,1);c.fillStyle='#14131a';c.fillRect(x-2,y+7,5,1);break}
    case 'banner':{c.fillStyle=C.woodL;c.fillRect(x-8,y,16,2);c.fillStyle='#3a1b1f';const len=22+r()*10|0;c.fillRect(x-6,y+2,12,len);
      c.fillStyle='#2a1316';c.fillRect(x-6,y+2,2,len);for(let i=-6;i<6;i+=2){c.clearRect(x+i,y+2+len-(r()*7|0),2,8)}
      c.fillStyle='#55302a';c.fillRect(x-2,y+8,4,1);c.fillRect(x-1,y+6,2,6);c.fillRect(x-3,y+10,6,1);
      if(r()<.6){c.clearRect(x-1+(r()*4|0),y+14+(r()*6|0),2,3)}break}
    case 'statue':{const k=d.k;c.fillStyle='#3b3943';c.fillRect(x-10,y-7,20,7);c.fillStyle='#4a4752';c.fillRect(x-10,y-7,20,1);c.fillStyle='#2b2930';c.fillRect(x-10,y-2,20,2);
      if(k===0){ // headless knight, broken blade raised
        c.fillStyle='#4a4752';c.fillRect(x-4,y-22,3,15);c.fillRect(x+1,y-22,3,15);c.fillRect(x-6,y-34,12,13);c.fillRect(x-8,y-34,4,4);c.fillRect(x+4,y-34,4,4);
        c.fillStyle='#5a5762';c.fillRect(x-6,y-34,3,12);c.fillRect(x-1,y-37,2,3);c.fillStyle='#3b3943';c.fillRect(x+2,y-30,3,8);c.fillRect(x-1,y-24,2,2);
        c.fillStyle='#5a5762';c.fillRect(x+6,y-44,2,12);c.fillRect(x+4,y-34,6,1);c.fillStyle='#2b2930';c.fillRect(x+6,y-45,2,1);c.fillRect(x-3,y-28,1,4)}
      else if(k===1){ // kneeling mourner, hood
        c.fillStyle='#4a4752';c.fillRect(x-7,y-14,14,7);c.fillRect(x-5,y-24,10,11);c.fillRect(x-4,y-29,8,6);c.fillStyle='#5a5762';c.fillRect(x-5,y-24,2,11);c.fillRect(x-4,y-29,3,2);
        c.fillStyle='#232128';c.fillRect(x,y-27,3,3);c.fillStyle='#3b3943';c.fillRect(x+3,y-20,4,3);c.fillStyle='#2b2930';c.fillRect(x-7,y-10,14,1)}
      else{ // angel, one wing snapped
        c.fillStyle='#4a4752';c.fillRect(x-3,y-26,6,19);c.fillRect(x-2,y-31,4,5);c.fillStyle='#5a5762';c.fillRect(x-3,y-26,2,19);
        c.fillStyle='#4a4752';for(let i=0;i<10;i++)c.fillRect(x-4-i,y-28+i,2,3+(i>>1));c.fillStyle='#3b3943';c.fillRect(x+3,y-27,4,3);c.fillRect(x+5,y-8,4,2);c.fillRect(x+9,y-7,3,1)}
      break}
    case 'tree':{deadTree(c,x,y,-Math.PI/2+(r()-.5)*.2,d.s?30:22,d.s?5:4,6,'#16151a',r);c.fillStyle='#16151a';c.fillRect(x-4,y-3,9,3);break}
    case 'brazier':{c.fillStyle=C.iron;c.fillRect(x-1,y-12,2,12);c.fillRect(x-6,y-1,3,1);c.fillRect(x+3,y-1,3,1);for(let k=0;k<5;k++){c.fillRect(x-5+k,y-1-k*2,1,2);c.fillRect(x+4-k,y-1-k*2,1,2)}
      c.fillStyle=C.ironL;c.fillRect(x-7,y-16,14,2);c.fillStyle=C.iron;c.fillRect(x-6,y-14,12,3);c.fillStyle=C.rust;c.fillRect(x-5,y-12,10,1);break}
    case 'coffin':{c.fillStyle='#3b3943';c.fillRect(x-12,y-9,24,9);c.fillStyle='#4a4752';c.fillRect(x-13,y-11,26,3);c.fillStyle='#5a5762';c.fillRect(x-13,y-11,26,1);
      c.fillStyle='#2b2930';c.fillRect(x-1,y-8,2,6);c.fillRect(x-3,y-6,6,1);c.fillRect(x-12,y-1,24,1);break}
    case 'candles':{for(let i=-5;i<=5;i+=3){const h=3+r()*5|0;c.fillStyle='#b8ab8c';c.fillRect(x+i,y-h,2,h);c.fillStyle='#8a7e66';c.fillRect(x+i,y-1,3,1)}break}
    case 'bones':{c.fillStyle=C.boneD;c.fillRect(x-8,y-2,14,2);c.fillStyle=C.bone;c.fillRect(x-6,y-5,5,4);c.fillStyle='#1a1a20';c.fillRect(x-5,y-4,1,1);c.fillRect(x-3,y-4,1,1);c.fillStyle=C.bone;c.fillRect(x+1,y-3,7,1);c.fillRect(x+3,y-4,1,3);break}
    case 'post':{c.fillStyle=C.woodD;c.fillRect(x-3,y-104,6,104);c.fillStyle=C.wood;c.fillRect(x-3,y-104,2,104);c.fillStyle=C.iron;c.fillRect(x-4,y-100,8,3);c.fillRect(x-4,y-60,8,2);c.fillStyle=C.ironL;c.fillRect(x-5,y-106,10,2);break}
    case 'chainline':{const n=Math.hypot(d.x1-d.x0,d.y1-d.y0)/3|0;for(let i=0;i<=n;i++){const t=i/n,px=d.x0+(d.x1-d.x0)*t,py=d.y0+(d.y1-d.y0)*t+Math.sin(t*Math.PI)*10;c.fillStyle=i&1?C.ironL:C.iron;c.fillRect(Math.round(px),Math.round(py),2,i&1?1:2)}break}
    case 'gibbet':{c.fillStyle=C.woodD;c.fillRect(x,y-70,5,70);c.fillStyle=C.wood;c.fillRect(x,y-70,2,70);c.fillStyle=C.woodD;c.fillRect(x,y-70,36,4);c.fillStyle=C.wood;c.fillRect(x,y-70,36,1);
      for(let k=0;k<10;k++){c.fillStyle=C.woodD;c.fillRect(x+4+k,y-56-k*1.2|0,2,2)}d.live={x:x+30,y:y-66};break}
  }
}
/* =========================================================
   DISPLAY, AUDIO, INPUT
   ========================================================= */
const stage=document.getElementById('stage'),disp=document.getElementById('game'),dctx=disp.getContext('2d');
const [buf,g]=mk(VW,VH);const LS=4;const [lightC,lx]=mk(VW/LS,Math.ceil(VH/LS));
function resize(){const r=disp.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);disp.width=Math.max(VW,Math.round(r.width*d));disp.height=Math.max(VH,Math.round(r.height*d))}
addEventListener('resize',resize);resize();
if(document.fonts){document.fonts.load('20px "Grenze Gotisch"');document.fonts.load('700 20px "Alegreya Sans"');document.fonts.load('italic 20px "Alegreya Sans"')}

/* =========================================================
   AUDIO: everything synthesized live with the Web Audio API.
   Signal path: voice -> dry bus + cathedral reverb send -> master -> compressor
   ========================================================= */
const AU={ctx:null,master:null,dry:null,wet:null,nb:null,amb:null,muted:false,last:{}};
const SET={master:.85,music:.65,sfx:.85};try{Object.assign(SET,JSON.parse(localStorage.getItem('cinderkeep-settings'))||{})}catch(e){}
function sfxPreview(fn){if(!AU.ctx)return;AU.preview=true;applyVolumes();clearTimeout(AU.pvT);setTimeout(fn,40);AU.pvT=setTimeout(()=>{AU.preview=false;applyVolumes()},1100)}
function saveSettings(){try{localStorage.setItem('cinderkeep-settings',JSON.stringify(SET))}catch(e){}}
function applyVolumes(){if(!AU.ctx)return;const t=AU.ctx.currentTime;AU.master.gain.setTargetAtTime(AU.muted?0:SET.master,t,.05);AU.sfxG.gain.setTargetAtTime(SET.sfx*(game.state==='title'&&!AU.preview?.1:1),t,.05);AU.musG.gain.setTargetAtTime(SET.music,t,.05)}
function audioInit(){try{
  if(!AU.ctx){const c=new(window.AudioContext||window.webkitAudioContext)();AU.ctx=c;c.onstatechange=()=>{if(c.state==='running'&&game.state==='title')musicStart()};
    const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;comp.attack.value=.003;comp.release.value=.2;comp.connect(c.destination);
    AU.master=c.createGain();AU.master.gain.value=AU.muted?0:SET.master;AU.master.connect(comp);
    AU.sfxG=c.createGain();AU.sfxG.gain.value=SET.sfx;AU.sfxG.connect(AU.master);AU.musG=c.createGain();AU.musG.gain.value=SET.music;AU.musG.connect(AU.master);
    AU.dry=c.createGain();AU.dry.connect(AU.sfxG);const ir=impulse(c,2.4,2.8);
    const conv=c.createConvolver();conv.buffer=ir;AU.wet=c.createGain();AU.wet.gain.value=.34;AU.wet.connect(conv);conv.connect(AU.sfxG);
    const mconv=c.createConvolver();mconv.buffer=impulse(c,3.6,2.2);AU.musWet=c.createGain();AU.musWet.gain.value=.5;AU.musWet.connect(mconv);mconv.connect(AU.musG);
    AU.song=c.createGain();AU.song.gain.value=1;AU.song.connect(AU.musG);const sw=c.createGain();sw.gain.value=.55;AU.song.connect(sw);sw.connect(AU.musWet);
    AU.nb=c.createBuffer(1,c.sampleRate*3,c.sampleRate);const d=AU.nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    startAmbience();applyVolumes();if(game.state==='title')musicStart()}
  else if(AU.ctx.state==='suspended'){AU.ctx.resume();if(game.state==='title')musicStart()}}catch(e){AU.ctx=null}}
function setMuted(m){AU.muted=m;if(AU.master)AU.master.gain.setTargetAtTime(m?0:SET.master,AU.ctx.currentTime,.05)}
function impulse(c,dur,decay){const len=Math.floor(c.sampleRate*dur),b=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay)*(i<c.sampleRate*.01?i/(c.sampleRate*.01):1)}return b}
function bus(wet){const c=AU.ctx,g=c.createGain();g.connect(AU.dry);if(wet>0){const s=c.createGain();s.gain.value=wet;g.connect(s);s.connect(AU.wet)}return g}
function env(g,T,a,peak,d){g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),T+a);g.gain.exponentialRampToValueAtTime(.0001,T+a+d)}
const live=()=>AU.ctx&&!AU.muted;
// filtered noise voice
function nz({t=0,dur=.2,type='bandpass',f0=1000,f1=0,q=1,vol=.3,a=.004,wet=.3}){if(!live())return;const c=AU.ctx,T=c.currentTime+t;
  const s=c.createBufferSource();s.buffer=AU.nb;s.playbackRate.value=.85+Math.random()*.3;const f=c.createBiquadFilter();f.type=type;f.Q.value=q;
  f.frequency.setValueAtTime(f0,T);if(f1)f.frequency.exponentialRampToValueAtTime(f1,T+a+dur);const g=c.createGain();env(g,T,a,vol,dur);
  s.connect(f);f.connect(g);g.connect(bus(wet));s.start(T,Math.random()*2);s.stop(T+a+dur+.05)}
// oscillator voice, optional lowpass
function osc({t=0,type='sine',f0=440,f1=0,dur=.2,vol=.2,a=.004,wet=.3,lp=0}){if(!live())return;const c=AU.ctx,T=c.currentTime+t;
  const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,T);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),T+a+dur);
  const g=c.createGain();env(g,T,a,vol,dur);let n=o;if(lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}
  n.connect(g);g.connect(bus(wet));o.start(T);o.stop(T+a+dur+.05)}
// struck metal: inharmonic partials with a bright click
function metal(base,vol,dur,t=0,wet=.35){[1,2.76,5.4,8.93,1.52].forEach((r,i)=>osc({t,type:i?'sine':'triangle',f0:base*r*(1+(Math.random()-.5)*.03),dur:dur*(1-i*.13),vol:vol/(1+i*.7),a:.001,wet}));
  nz({t,dur:.035,type:'highpass',f0:3500,vol:vol*.9,a:.001,wet:wet*.5})}
function thud(v,t=0){osc({t,type:'sine',f0:150,f1:50,dur:.2,vol:v,a:.002,wet:.12});nz({t,dur:.09,type:'lowpass',f0:900,vol:v*.9,a:.002,wet:.1})}
function once(k,gap){const n=performance.now();if(AU.last[k]&&n-AU.last[k]<gap)return false;AU.last[k]=n;return true}
function startAmbience(){const c=AU.ctx,g=c.createGain();g.gain.value=0;g.connect(AU.musG);AU.amb=g;
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=170;lp.connect(g);
  [55,55.35,82.4,41.2].forEach((f,i)=>{const o=c.createOscillator();o.type=i===3?'sine':'sawtooth';o.frequency.value=f;const og=c.createGain();og.gain.value=i===3?.5:.2;o.connect(og);og.connect(lp);o.start()});
  const w=c.createBufferSource();w.buffer=AU.nb;w.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=480;bp.Q.value=.7;const wg=c.createGain();wg.gain.value=.55;w.connect(bp);bp.connect(wg);wg.connect(g);w.start();
  const lfo=c.createOscillator();lfo.frequency.value=.06;const lg=c.createGain();lg.gain.value=320;lfo.connect(lg);lg.connect(bp.frequency);lfo.start();
  const lfo2=c.createOscillator();lfo2.frequency.value=.11;const lg2=c.createGain();lg2.gain.value=.25;lfo2.connect(lg2);lg2.connect(wg.gain);lfo2.start();
  g.gain.linearRampToValueAtTime(game.state==='title'?.004:.07,c.currentTime+4)}
/* ---------- title theme: a slow D-minor lament of pads, a low drone, a bell melody and a distant toll ---------- */
const MUS={on:false,name:'',timer:null,next:0,bar:0,out:null};
const mf=m=>440*Math.pow(2,(m-69)/12);
function mv(f,T,dur,{type='sine',vol=.02,a=.01,r=.5,lp=0,q=.7,bp=0,det=0,decay=false,vib=0}={}){const c=AU.ctx,o=c.createOscillator();o.type=type;o.frequency.value=f;if(det)o.detune.value=det;
  if(vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.2;lg.gain.setValueAtTime(0,T);lg.gain.linearRampToValueAtTime(vib,T+Math.min(.7,dur*.5));l.connect(lg);lg.connect(o.detune);l.start(T);l.stop(T+a+dur+.1)}
  const g=c.createGain();g.gain.setValueAtTime(0,T);let n=o;if(lp||bp){const fl=c.createBiquadFilter();fl.type=bp?'bandpass':'lowpass';fl.frequency.value=bp||lp;fl.Q.value=q;o.connect(fl);n=fl}
  if(decay){g.gain.linearRampToValueAtTime(vol,T+a);g.gain.exponentialRampToValueAtTime(.0001,T+a+dur)}else{g.gain.linearRampToValueAtTime(vol,T+a);g.gain.setValueAtTime(vol,T+Math.max(a,dur-r));g.gain.linearRampToValueAtTime(0,T+dur)}
  n.connect(g);g.connect(MUS.out||AU.song);o.start(T);o.stop(T+a+dur+.1)}
const SONG={chords:[[50,53,57],[46,50,53],[48,53,57],[48,52,55],[50,53,57],[46,50,53],[43,50,55],[45,49,52]],
  mel:[[[0,69],[1.5,65],[2,62],[3,64]],[[0,65],[1,62],[2.5,58]],[[0,69],[1.5,72],[2,69],[3,67]],[[0,67],[2,64]],
       [[0,74],[1,72],[1.5,69],[2,74],[3,72]],[[0,70],[1.5,69],[2,65]],[[0,67],[1,70],[2,74],[3,72]],[[0,73],[2,69],[3,64]]]};
function musicChord(i,T){const ch=SONG.chords[i%8],D=4,pass=Math.floor(i/8);
  for(const m of ch)for(const d of [-7,7])mv(mf(m),T,D+.9,{type:'sawtooth',vol:.011,a:1.3,r:1.4,lp:700+120*Math.sin(i*.7),det:d});
  mv(mf(ch[0]-12),T,D+.4,{type:'sine',vol:.05,a:.4,r:.8});mv(mf(ch[0]-12),T,D+.4,{type:'triangle',vol:.012,a:.4,r:.8});
  if(pass%2===1)mv(mf(ch[2]+12),T+.5,D,{type:'sawtooth',vol:.006,a:1.8,r:1.6,bp:900,q:3});
  for(const [b,m] of SONG.mel[i%8]){if(pass>0&&Math.random()<.18)continue;const f=mf(m+(pass%3===2?12:0)),t=T+b;
    mv(f,t,2.6,{vol:.03,a:.005,decay:true});mv(f*2,t,1.3,{vol:.009,a:.005,decay:true});mv(f*3.01,t,.6,{type:'triangle',vol:.004,a:.003,decay:true})}
  if(i%4===0){const f=mf(38);for(const [r,v,d] of [[1,.03,6],[2.76,.012,4],[5.4,.006,2.5]])mv(f*r,T,d,{vol:v,a:.004,decay:true})}}
/* ---------- boss theme: "The Last Vigil", an A-minor lament over a heartbeat; strings, a sighing violin line and a falling harp ---------- */
const BSONG={bar:3.2,chords:[[57,60,64],[57,60,65],[55,60,64],[55,59,62],[57,60,64],[53,57,60],[53,57,62],[52,56,59]],bass:[45,41,48,43,45,41,38,40],
  mel:[[[0,76,2.4],[2.4,74,.8]],[[0,72,1.6],[1.6,69,1.6]],[[0,67,2.4],[2.4,72,.8]],[[0,71,3.2]],
       [[0,76,1.6],[1.6,79,1.6]],[[0,77,2.4],[2.4,76,.8]],[[0,74,1.6],[1.6,77,1.6]],[[0,76,1.6],[1.6,68,1.6]]],
  alt:[[[0,81,1.6],[1.6,79,.8],[2.4,76,.8]],[[0,77,2.4],[2.4,76,.8]],[[0,76,1.6],[1.6,72,1.6]],[[0,74,2.4],[2.4,71,.8]],
       [[0,72,1.6],[1.6,76,1.6]],[[0,81,2.4],[2.4,77,.8]],[[0,77,1.6],[1.6,74,1.6]],[[0,71,2.4],[2.4,68,.8]]]};
function mbeat(T,v,f0=72,f1=38,len=.5){const c=AU.ctx,o=c.createOscillator();o.frequency.setValueAtTime(f0,T);o.frequency.exponentialRampToValueAtTime(f1,T+len*.5);
  const g=c.createGain();g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v,T+.008);g.gain.exponentialRampToValueAtTime(.0001,T+len);o.connect(g);g.connect(MUS.out||AU.song);o.start(T);o.stop(T+len+.05)}
function bossBar(i,T){const S=BSONG,B=S.bar,k=i%8,pass=Math.floor(i/8),ch=S.chords[k],intro=pass===0&&k<4;
  // strings: a slow swell under everything
  for(const m of ch)for(const d of [-9,9])mv(mf(m-12),T,B+.7,{type:'sawtooth',vol:.008,a:.9,r:1,lp:900+250*(pass>0),det:d});
  mv(mf(S.bass[k]-12),T,B+.3,{type:'sine',vol:.055,a:.25,r:.6});mv(mf(S.bass[k]),T,B+.3,{type:'sawtooth',vol:.006,a:.3,r:.6,lp:400});
  // the heartbeat: lub-dub on the bar, a softer echo halfway
  mbeat(T,.11);mbeat(T+.28,.07);mbeat(T+1.6,.05);if(pass>0)mbeat(T+1.88,.035);
  // a falling harp of eighth notes over the chord
  const arp=[ch[2]+12,ch[1]+12,ch[0]+12,ch[2],ch[1]+12,ch[0]+12,ch[2],ch[1]];
  arp.forEach((m,j)=>{const t=T+j*B/8;mv(mf(m),t,1.1,{type:'triangle',vol:j===0?.022:.015,a:.004,decay:true});mv(mf(m)*2,t,.4,{vol:.004,a:.003,decay:true})});
  // the violin: it waits four bars, then sings; on the second pass it climbs higher
  if(!intro){const mel=(pass%2===1?S.alt:S.mel)[k];for(const [b,m,d] of mel){const f=mf(m),t=T+b;
    mv(f,t,d+.25,{type:'sawtooth',vol:.016,a:.18,r:.35,lp:1700,q:1.2,vib:14,det:-4});mv(f,t,d+.25,{type:'sawtooth',vol:.012,a:.22,r:.35,lp:1500,q:1,vib:11,det:5});
    mv(f/2,t,d+.25,{type:'triangle',vol:.008,a:.2,r:.4})}}
  // a choir of breath on the second pass and after
  if(pass>0)for(const m of [ch[0]+12,ch[2]+12])mv(mf(m),T+.2,B,{type:'sawtooth',vol:.0045,a:1.2,r:1.2,bp:1000,q:4});
  // the turn back home: a low timpani roll into the top of the loop
  if(k===7){for(let j=0;j<6;j++)mbeat(T+2.2+j*.16,.03+.012*j,95,60,.35);mv(mf(33),T+3.15,4,{vol:.04,a:.01,decay:true})}}
/* ---------- the Bell Warden's theme: "Requiem of the Bell", a tragic D-minor boss hymn in the dark-orchestral manner:
   a chanting choir, a driving string ostinato, low brass swells, timpani, and cathedral bells carrying the lament ---------- */
function cbell(f,T,v,len=5){for(const [r,a,d] of [[.5,.55,1],[1,1,.8],[1.19,.45,.55],[1.5,.3,.45],[2,.42,.35],[2.51,.18,.25],[3.01,.14,.18]])mv(f*r,T,len*d,{vol:v*a,a:.003,decay:true})}
function tbell(f,T,v,len=3.2){for(const [r,a,d] of [[1,1,1],[2,.38,.6],[3,.18,.4],[4.2,.08,.25]])mv(f*r,T,len*d,{vol:v*a,a:.003,decay:true})}
function choir(m,T,d,v){for(const det of [-9,0,9]){mv(mf(m),T,d,{type:'sawtooth',vol:v,a:.5,r:.6,bp:760,q:2.2,det:det,vib:9});mv(mf(m),T,d,{type:'sawtooth',vol:v*.6,a:.5,r:.6,bp:1180,q:3,det:det})}}
function brass(m,T,d,v){for(const det of [-5,5])mv(mf(m),T,d,{type:'sawtooth',vol:v,a:.35,r:.5,lp:850,q:1.4,det:det})}
const WSONG={bar:2.6,
  chords:[[57,62,65],[58,62,65],[55,58,62],[57,61,64],[57,62,65],[57,60,65],[55,58,63],[57,61,64],
          [55,58,62],[57,62,65],[58,62,65],[57,60,65],[55,58,62],[57,62,65],[55,58,63],[57,61,64]],
  bass:[38,34,43,45,38,41,39,45,43,38,34,41,43,38,39,45],
  mel:[[[0,74,2],[2,70,1],[3,72,1]],[[0,69,3],[3,65,1]],[[0,70,2],[2,74,1],[3,77,1]],[[0,77,3],[3,76,1]],
       [[0,79,2],[2,77,1],[3,74,1]],[[0,77,2],[2,74,2]],[[0,75,2],[2,74,1],[3,70,1]],[[0,73,4]]]};
function bellBar(i,T){const S=WSONG,B=S.bar,bt=B/4,k=i%16,sec=k<8?0:1,pass=Math.floor(i/16),ch=S.chords[k],b=S.bass[k],full=sec===1;
  // the cathedral bell: once every two bars in the opening, every bar once the hymn swells
  if(k%2===0||full)cbell(mf(b+12),T,full?.045:.04,6);
  // low strings and contrabass
  mv(mf(b-12),T,B+.3,{type:'sine',vol:.05,a:.12,r:.4});mv(mf(b),T,B+.2,{type:'sawtooth',vol:.007,a:.15,r:.4,lp:500});
  // the string ostinato: restless eighth notes that never quite settle
  const ost=[ch[0],ch[1],ch[2],ch[1],ch[0]+12,ch[2],ch[1],ch[2]];
  ost.forEach((m,j)=>{const t=T+j*bt/2;mv(mf(m-12),t,bt*.48,{type:'sawtooth',vol:j%4===0?.011:.008,a:.012,r:.08,lp:1300,det:j&1?-6:6})});
  // the choir: a low chant in the opening, the full hymn after
  choir(ch[0]-12,T,B+.15,full?.0034:.0026);choir(ch[1],T,B+.15,full?.003:.0018);if(full)choir(ch[2]+12,T,B+.15,.0024);
  // low brass swells on the turns
  if(k%4===3||full&&k%2===1)brass(b,T+bt,B-bt+.2,full?.011:.008),brass(b+7,T+bt,B-bt+.2,full?.007:.005);
  // timpani: a heavy beat on one, a pick-up into the next bar, a roll at the end of each half
  mbeat(T,full?.13:.09,b<40?62:56,48,.9);if(full)mbeat(T+bt*2,.06,58,46,.7);mbeat(T+bt*3.5,.05,60,48,.5);
  if(k===7||k===15)for(let j=0;j<8;j++)mbeat(T+bt*2+j*bt/4,.025+.01*j,64,50,.35);
  // the lament: a violin line doubled by tubular bells; in the opening only the bells sigh a falling motif
  if(full){for(const [b0,m,d] of S.mel[k-8]){const f=mf(m+(pass%2?12:0)),t=T+b0*bt,dd=d*bt+.2;
      mv(f,t,dd,{type:'sawtooth',vol:.013,a:.08,r:.2,lp:2000,q:1.1,vib:13,det:-4});mv(f,t,dd,{type:'sawtooth',vol:.01,a:.1,r:.2,lp:1700,vib:10,det:5});tbell(mf(m),t,.022,2.8)}}
  else if(k%2===1)[ch[2]+12,ch[1]+12,ch[0]+12,ch[2]].forEach((m,j)=>tbell(mf(m),T+j*bt,.02,2.4));
  // a carillon cascade into the top of the loop
  if(k===15)[74,72,69,65,62,57].forEach((m,j)=>cbell(mf(m),T+bt*2+j*.18,.011,2.2))}
const SONGS={bell:{bar:WSONG.bar,play:bellBar,fadeIn:2,amb:.02,gain:.9},title:{bar:4,play:musicChord,fadeIn:3,amb:.004},boss:{bar:BSONG.bar,play:bossBar,fadeIn:1.8,amb:.025,gain:1.35}};
function musicStart(name='title'){if(!AU.ctx||AU.ctx.state!=='running')return;if(MUS.on&&MUS.name===name)return;const c=AU.ctx,S=SONGS[name];
  if(MUS.on)musicStop(1.4,true);MUS.on=true;MUS.name=name;MUS.next=c.currentTime+.15;MUS.bar=0;
  const g=c.createGain();g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(S.gain||1,c.currentTime+S.fadeIn);g.connect(AU.song);MUS.out=g;
  if(AU.amb)AU.amb.gain.setTargetAtTime(S.amb,c.currentTime,1);
  clearInterval(MUS.timer);MUS.timer=setInterval(()=>{if(!MUS.on)return;while(MUS.next<AU.ctx.currentTime+1.6){S.play(MUS.bar++,MUS.next);MUS.next+=S.bar}},120)}
function musicStop(fade=1.6,swap){if(!MUS.on||!AU.ctx)return;MUS.on=false;MUS.name='';const c=AU.ctx,g=MUS.out;clearInterval(MUS.timer);MUS.out=null;
  if(g){g.gain.cancelScheduledValues(c.currentTime);g.gain.setValueAtTime(g.gain.value,c.currentTime);g.gain.linearRampToValueAtTime(0,c.currentTime+fade);setTimeout(()=>{try{g.disconnect()}catch(e){}},(fade+3)*1000)}
  if(!swap&&AU.amb)AU.amb.gain.setTargetAtTime(game.state==='title'?.004:.07,c.currentTime,1.5)}
// boss fights get their own music; it fades out when the boss falls or the hero does
function musicDirector(){if(!AU.ctx||game.state==='title')return;
  const fight=(game.state==='play'||game.state==='menu')&&arena&&arena.locked&&boss&&boss.state!=='dead'&&P&&P.state!=='death';
  const want=boss&&boss.t==='bellwarden'?'bell':'boss';
  if(fight){if(!(MUS.on&&MUS.name===want))musicStart(want)}else if(MUS.on&&(MUS.name==='boss'||MUS.name==='bell'))musicStop(boss&&boss.state==='dead'?5:2)}
const sfx={
  // the knight
  swing:()=>{nz({dur:.15,f0:800,f1:3600,q:1.6,vol:.24,a:.035,wet:.12});nz({t:.02,dur:.08,type:'highpass',f0:5000,vol:.04,wet:0})},
  heavy:()=>{nz({dur:.3,f0:350,f1:2000,q:1.1,vol:.32,a:.07,wet:.2});osc({type:'sine',f0:95,f1:50,dur:.3,vol:.12,a:.05})},
  heavyWind:()=>{nz({dur:.42,f0:160,f1:900,q:.8,vol:.12,a:.32,wet:.3});osc({type:'sawtooth',f0:55,f1:95,dur:.42,vol:.05,a:.3,lp:260});metal(1200,.03,.6,.1,.6)},
  slam:()=>{osc({type:'sine',f0:72,f1:30,dur:.6,vol:.42,a:.002,wet:.35});nz({dur:.45,type:'lowpass',f0:700,f1:90,vol:.45,a:.002,wet:.35});metal(190,.09,.5);nz({t:.04,dur:.6,f0:2200,f1:700,q:.6,vol:.07,wet:.3})},
  step:(run)=>{thud(run?.07:.05);metal(1700+Math.random()*500,run?.018:.012,.07,.005,.05)},
  jump:()=>{nz({dur:.08,type:'lowpass',f0:600,vol:.1,wet:.05});metal(1500,.02,.1,0,.1)},
  dbl:()=>{nz({dur:.16,f0:600,f1:2400,q:1,vol:.12,a:.02,wet:.2});osc({type:'sine',f0:500,f1:900,dur:.12,vol:.03})},
  land:()=>{thud(.12);metal(900+Math.random()*300,.04,.18,.01,.1)},
  roll:()=>{nz({dur:.26,type:'lowpass',f0:900,f1:300,vol:.16,a:.01,wet:.08});for(let i=0;i<3;i++)metal(1300+Math.random()*900,.025,.08,.04+i*.07,.1)},
  hurt:()=>{metal(320+Math.random()*60,.2,.45,0,.25);thud(.22);osc({type:'sawtooth',f0:200,f1:115,dur:.28,vol:.11,a:.01,lp:900,wet:.2})},
  heal:()=>{osc({type:'triangle',f0:190,f1:120,dur:.1,vol:.07,t:.22});osc({type:'triangle',f0:180,f1:110,dur:.1,vol:.06,t:.36});
    [523.3,659.3,784,1046.5,1318.5].forEach((f,i)=>osc({t:.45+i*.07,type:'sine',f0:f,dur:.9,vol:.05,a:.02,wet:.7}));nz({t:.45,dur:.7,f0:3000,q:2,vol:.03,a:.2,wet:.5})},
  die:()=>{metal(260,.18,.8);thud(.3,.25);metal(180,.12,.9,.3,.5);osc({type:'sawtooth',f0:150,f1:45,dur:1.4,vol:.12,a:.02,lp:600,wet:.6});nz({t:.3,dur:1.2,type:'highpass',f0:2500,vol:.05,a:.3,wet:.5})},
  // contact
  clang:()=>metal(480+Math.random()*80,.22,.7,0,.45),
  crit:()=>{osc({type:'square',f0:1500,f1:900,dur:.09,vol:.05,wet:.2});metal(1100,.06,.25)},
  impact(t){if(!once('imp',25))return;
    if(t==='husk'){metal(360+Math.random()*90,.17,.4);thud(.16)}
    else if(t==='warden'){metal(220+Math.random()*50,.22,.75,0,.45);thud(.22)}
    else if(t==='archer'){nz({dur:.05,type:'highpass',f0:2600,vol:.22,wet:.1});osc({type:'square',f0:700,f1:260,dur:.05,vol:.05});thud(.08)}
    else if(t==='hound'){thud(.22);nz({dur:.12,f0:480,q:.8,vol:.2,wet:.1});osc({type:'sine',f0:620,f1:380,dur:.08,vol:.05,t:.02})}
    else{nz({dur:.22,type:'highpass',f0:4200,f1:1400,vol:.16,wet:.3});osc({type:'sine',f0:950,f1:220,dur:.18,vol:.06})}},
  foeDie(t){
    if(t==='husk'){metal(300,.13,.6);thud(.2,.08);metal(210,.1,.5,.2);osc({type:'sawtooth',f0:140,f1:55,dur:.6,vol:.08,lp:600,wet:.4})}
    else if(t==='hound'){osc({type:'sine',f0:900,f1:300,dur:.32,vol:.07,wet:.3});thud(.18,.12)}
    else if(t==='archer'){for(let i=0;i<6;i++){nz({t:i*.05+Math.random()*.03,dur:.04,type:'highpass',f0:2200+Math.random()*1500,vol:.12,wet:.2});osc({t:i*.05,type:'square',f0:500+Math.random()*400,f1:200,dur:.04,vol:.03})}}
    else{nz({dur:.4,type:'highpass',f0:5000,f1:900,vol:.14,wet:.4});thud(.12,.15)}
    nz({t:.15,dur:.7,type:'highpass',f0:3000,vol:.04,a:.1,wet:.4})},
  // foes and the boss
  foe:()=>{if(once('foe',120))nz({dur:.2,f0:500,f1:300,q:2,vol:.09,a:.03,wet:.3})},
  axe:()=>nz({dur:.2,f0:500,f1:1800,q:1,vol:.18,a:.05,wet:.2}),
  bow:()=>{nz({dur:.08,f0:2600,q:3,vol:.12,wet:.1});osc({type:'triangle',f0:320,f1:120,dur:.08,vol:.05})},
  bossWind:()=>{for(let i=0;i<8;i++)metal(800+Math.random()*500,.035,.07,i*.075,.25);nz({dur:.6,f0:300,f1:900,q:.7,vol:.08,a:.4,wet:.3})},
  bossSweep:()=>{nz({dur:.42,f0:220,f1:1500,q:.9,vol:.36,a:.06,wet:.3});osc({type:'sine',f0:70,f1:38,dur:.42,vol:.18})},
  bossLeap:()=>{osc({type:'sawtooth',f0:110,f1:70,dur:.35,vol:.1,lp:500,wet:.4});nz({dur:.3,type:'lowpass',f0:500,vol:.12})},
  bossSlam:()=>{osc({type:'sine',f0:62,f1:24,dur:1.1,vol:.55,a:.002,wet:.45});nz({dur:.8,type:'lowpass',f0:600,f1:70,vol:.55,a:.002,wet:.45});metal(140,.14,.8);
    nz({t:.06,dur:1,f0:1800,f1:500,q:.5,vol:.09,a:.05,wet:.35})},
  scrape:()=>{if(once('scr',60))nz({dur:.1,f0:3200+Math.random()*800,q:5,vol:.07,wet:.25})},
  roar:()=>{osc({type:'sawtooth',f0:96,f1:58,dur:1.2,vol:.16,a:.12,lp:700,wet:.55});osc({type:'sawtooth',f0:99,f1:55,dur:1.2,vol:.12,a:.12,lp:480,wet:.55});nz({dur:1.1,f0:420,f1:180,q:.6,vol:.17,a:.12,wet:.5})},
  bossDie:()=>{osc({type:'sawtooth',f0:110,f1:24,dur:2.6,vol:.17,a:.08,lp:650,wet:.7});osc({type:'sawtooth',f0:113,f1:22,dur:2.6,vol:.12,a:.08,lp:450,wet:.7});
    osc({type:'sine',f0:60,f1:22,dur:1.6,vol:.5,t:.2,wet:.5});nz({t:.2,dur:1.2,type:'lowpass',f0:700,f1:60,vol:.5,wet:.5});
    for(let i=0;i<9;i++)metal(180+Math.random()*600,.09,.6,.35+i*.13+Math.random()*.05,.5);sfx.bell(2.6)},
  // world
  checkpoint:()=>{nz({dur:.7,f0:250,f1:2600,q:.7,vol:.17,a:.3,wet:.5});osc({type:'sine',f0:70,f1:110,dur:.6,vol:.12,a:.2});
    [110,164.8,220,277.2,329.6,440].forEach((f,i)=>osc({t:.25+i*.09,type:i%2?'triangle':'sine',f0:f,dur:2.6,vol:.06,a:.25,wet:.75}));metal(880,.05,2.4,.3,.8)},
  bell:(t=0)=>{[[147,.14,3.4],[294,.07,2.6],[441,.04,2],[588,.03,1.6],[352,.03,2.4]].forEach(([f,v,d])=>osc({t,type:'sine',f0:f,dur:d,vol:v,a:.004,wet:.7}))},
  boom:()=>{osc({type:'sine',f0:90,f1:30,dur:.5,vol:.4,a:.002,wet:.4});nz({dur:.6,type:'lowpass',f0:1800,f1:120,vol:.45,a:.002,wet:.4});nz({t:.05,dur:.7,f0:2500,f1:800,q:.6,vol:.06,wet:.3})},
  pick:()=>{osc({type:'triangle',f0:660,dur:.15,vol:.06,wet:.5});osc({type:'triangle',f0:990,dur:.25,vol:.05,t:.08,wet:.6})},
  chest:()=>{nz({dur:.35,f0:350,f1:200,q:3,vol:.14,a:.05,wet:.2});metal(700,.05,.3,.25);osc({type:'triangle',f0:330,f1:660,dur:.4,vol:.05,t:.3,wet:.5})},
  door:()=>{nz({dur:1,type:'lowpass',f0:400,f1:120,vol:.3,a:.1,wet:.5});osc({type:'sawtooth',f0:62,f1:48,dur:1,vol:.12,a:.1,lp:300,wet:.5});metal(260,.08,1,.8,.6)},
  upgrade:()=>{metal(520,.14,.9,0,.5);metal(780,.08,.8,.12,.5);nz({dur:.5,f0:400,f1:2400,q:.8,vol:.12,a:.1,wet:.4});[220,277.2,329.6,440].forEach((f,i)=>osc({t:.2+i*.06,type:'triangle',f0:f,dur:1.4,vol:.05,a:.05,wet:.7}))},
  ward:()=>{nz({dur:.8,type:'highpass',f0:1800,f1:5000,vol:.08,a:.2,wet:.5});osc({type:'sine',f0:110,f1:165,dur:.8,vol:.08,a:.2,wet:.5})},
  ui:()=>{osc({type:'triangle',f0:330,f1:300,dur:.12,vol:.04,wet:.5});metal(1400,.015,.2,0,.5)},
  secret:()=>{[392,523.3,659.3,784].forEach((f,i)=>osc({t:i*.09,type:'triangle',f0:f,dur:.8,vol:.05,wet:.7}));nz({dur:.6,type:'lowpass',f0:600,vol:.15,wet:.3})},
  growl:()=>{if(once('growl',220))osc({type:'sawtooth',f0:92,f1:68,dur:.45,vol:.08,a:.05,lp:320,wet:.3})},
  lunge:()=>{nz({dur:.18,f0:500,f1:1500,q:1,vol:.14,wet:.15});osc({type:'sawtooth',f0:160,f1:90,dur:.15,vol:.05,lp:500})},
  chant:()=>{if(once('chant',300))[196,233,294].forEach((f,i)=>osc({t:i*.04,type:'triangle',f0:f,f1:f*.98,dur:.9,vol:.03,a:.2,wet:.7}))},
  blink:()=>{nz({dur:.35,type:'highpass',f0:5000,f1:1200,vol:.1,wet:.5});osc({type:'sine',f0:900,f1:300,dur:.3,vol:.04,wet:.5})},
  wail:()=>{if(once('wail',400)){osc({type:'sine',f0:520,f1:780,dur:.6,vol:.04,a:.15,wet:.8});osc({type:'sine',f0:533,f1:760,dur:.6,vol:.03,a:.15,wet:.8})}},
  dive:()=>nz({dur:.35,f0:600,f1:2600,q:1.2,vol:.16,a:.03,wet:.3}),
  feather:()=>{for(let i=0;i<4;i++)nz({t:i*.03,dur:.12,f0:2500,f1:4000,q:2,vol:.06,wet:.3})},
  flap:()=>nz({dur:.3,type:'lowpass',f0:500,f1:150,vol:.18,a:.05,wet:.3}),
  lance:()=>metal(700,.04,.3,0,.4),
  pillar:(hand)=>{if(!once('pil',40))return;if(hand){nz({dur:.2,type:'highpass',f0:2000,vol:.12,wet:.3});thud(.12)}else{nz({dur:.5,f0:300,f1:1400,q:.7,vol:.22,a:.02,wet:.4});osc({type:'sine',f0:80,f1:40,dur:.4,vol:.12})}},
  horn:()=>{[[146.8,0],[146.8,.5],[196,.75]].forEach(([f,t])=>{osc({t,type:'sawtooth',f0:f*.97,f1:f,dur:t?.9:.4,vol:.07,a:.06,lp:900,wet:.6});osc({t,type:'square',f0:f*2,dur:t?.9:.4,vol:.02,a:.06,lp:1200,wet:.6})})},
  thunk:()=>{if(once('thk',40)){thud(.08);nz({dur:.04,type:'highpass',f0:2400,vol:.08})}},
  caw:()=>{if(once('caw',250)){osc({type:'sawtooth',f0:900,f1:520,dur:.18,vol:.05,lp:2400,wet:.3});osc({t:.12,type:'sawtooth',f0:850,f1:480,dur:.16,vol:.04,lp:2400,wet:.3})}},
  mortar:()=>{osc({type:'sine',f0:120,f1:50,dur:.3,vol:.18,wet:.3});nz({dur:.25,type:'lowpass',f0:900,f1:200,vol:.2,wet:.3})},
  toll:()=>{[[110,.2,3.6],[220,.1,3],[331,.06,2.4],[262,.05,2.8],[440,.03,1.8]].forEach(([f,v,d])=>osc({type:'sine',f0:f,f1:f*.995,dur:d,vol:v,a:.003,wet:.8}));nz({dur:.08,type:'highpass',f0:3000,vol:.1,wet:.4})},
  breath:()=>{nz({dur:1,f0:300,f1:900,q:.5,vol:.22,a:.1,wet:.4});osc({type:'sawtooth',f0:70,f1:50,dur:1,vol:.07,lp:300,wet:.4})},
  wind:()=>nz({dur:1.6,type:'bandpass',f0:300,f1:900,q:.6,vol:.12,a:.4,wet:.3}),
  golemWind:()=>{osc({type:'sawtooth',f0:55,f1:40,dur:.9,vol:.12,a:.3,lp:260,wet:.4});nz({dur:.8,type:'lowpass',f0:300,f1:120,vol:.12,a:.4,wet:.3})},
  steam:()=>nz({dur:1.2,type:'highpass',f0:3000,f1:1500,vol:.1,a:.05,wet:.4}),
  cackle:()=>{if(once('cak',400))for(let i=0;i<4;i++)osc({t:i*.07,type:'square',f0:700+i*60,f1:500,dur:.06,vol:.025,wet:.3})},
  chainSpin:()=>{for(let i=0;i<7;i++)metal(1300+Math.random()*500,.025,.06,i*.1,.2)},
  whip:()=>{nz({dur:.15,f0:1500,f1:4000,q:1.5,vol:.14,wet:.2});metal(900,.05,.2,.05,.2)},
  chainPull:()=>{for(let i=0;i<5;i++)metal(800+Math.random()*400,.05,.08,i*.05,.2);thud(.15,.25)},
  splash:()=>{if(once('spl',60)){nz({dur:.3,f0:400,f1:1500,q:.7,vol:.16,wet:.3});osc({type:'sine',f0:120,f1:60,dur:.2,vol:.08})}},
  ember:()=>{if(once('emb',45))osc({type:'sine',f0:1200+Math.random()*400,f1:1700,dur:.05,vol:.018,wet:.4})},
};

const keys={},pressed={};
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',ArrowDown:'down',KeyS:'down',
  KeyJ:'a1',KeyZ:'a1',KeyK:'a2',KeyX:'a2',ShiftLeft:'roll',ShiftRight:'roll',KeyL:'roll',KeyC:'roll',KeyQ:'skill',KeyF:'heal',KeyE:'use',KeyR:'item2',Digit1:'ab1',Digit2:'ab2',Digit3:'ab3',Digit4:'ab4',Numpad1:'ab1',Numpad2:'ab2',Numpad3:'ab3',Numpad4:'ab4',Enter:'start',KeyP:'pause',Escape:'pause',KeyM:'mute'};
const press=a=>{if(!keys[a])pressed[a]=true;keys[a]=true;audioInit()};
addEventListener('keydown',e=>{if(e.code==='Tab'){e.preventDefault();if(e.repeat)return;if(game.state==='play'&&!game.fadeDir)openMenu('sheet');else if(game.state==='menu'&&MENU.view==='sheet')closeMenu();return}
  if(game.state==='menu'||game.state==='title'){audioInit();if(menuKey(e))e.preventDefault();return}const a=KEYMAP[e.code];if(!a)return;e.preventDefault();press(a)});
addEventListener('keyup',e=>{const a=KEYMAP[e.code];if(a)keys[a]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
function aimFrom(e){const r=disp.getBoundingClientRect();AIM.sx=(e.clientX-r.left)/r.width*VW;AIM.sy=(e.clientY-r.top)/r.height*VH}
function syncButtons(e){const b=e.buttons||0,L=!!(b&1),Rt=!!(b&2);if(L&&!keys.a1)press('a1');if(!L)keys.a1=false;if(Rt&&!keys.a2)press('a2');if(!Rt)keys.a2=false}
stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||game.state==='title')return;AIM.active=true;aimFrom(e);if(game.state==='play')syncButtons(e)});
stage.addEventListener('contextmenu',e=>e.preventDefault());
stage.addEventListener('pointerdown',e=>{stage.focus({preventScroll:true});audioInit();
  if(game.state==='dead'||game.state==='won'){if(e.button===0||e.pointerType!=='mouse')pressed.start=true;return}if(game.state==='title')return;
  if(game.state==='play'&&e.pointerType==='mouse'){AIM.active=true;aimFrom(e);syncButtons(e);e.preventDefault()}});
addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')return;syncButtons(e)});
for(const b of document.querySelectorAll('#touch button')){const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}b.classList.add('on');press(k);if((game.state==='dead'||game.state==='won')&&k!=='pause')pressed.start=true});
  const up=()=>{b.classList.remove('on');keys[k]=false};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up)}

/* =========================================================
   THE ASHEN KNIGHT'S GREATSWORD
   angles: 0 = forward, -90 = up, 90 = down, 180 = behind
   ========================================================= */
let SWORD={
  light:[
    {dur:.32,a:.08,b:.16,dmg:12,reach:31,kb:70,lunge:60,a0:-110,a1:50},
    {dur:.32,a:.08,b:.16,dmg:12,reach:31,kb:70,lunge:60,a0:60,a1:-95},
    {dur:.48,a:.15,b:.25,dmg:21,reach:35,kb:170,lunge:105,a0:-160,a1:72,big:1}],
  heavy:{dur:.9,a:.44,b:.56,dmg:44,reach:38,kb:250,lunge:45,a0:-150,a1:84,big:1}
};
const MOVE={walk:58,run:122,air:118},RUN_AFTER=.26;
const LOCO=['idle','walk','run','jump','fall'];
/* =========================================================
   GAME STATE
   ========================================================= */
let SAVE=null;try{SAVE=JSON.parse(localStorage.getItem('cinderkeep-save'))}catch(e){}
const game={state:'title',time:0,runTime:0,kills:0,embers:0,banner:0,bTitle:'',bSub:'',fade:0,fadeDir:0,next:null,deadT:0,toast:0,toastText:'',flags:{opened:[],taken:[]},checkpoint:null,levelStart:null,section:-1,wonT:0,restLantern:null};
let P,foes=[],shots=[],parts=[],nums=[],tempLights=[],camX=0,camY=116,shake=0,hitstop=0,swingId=0,boss=null;
function newPlayer(x,y,keep){const p={x,y,w:10,h:26,vx:0,vy:0,face:1,onGround:false,jumps:0,hp:100,maxHp:100,flasks:2,maxFlasks:2,power:1,scrolls:0,
  state:'idle',st:0,animT:0,combo:0,hitId:0,lightBuf:0,heavyBuf:0,jumpBuf:0,coyote:0,rollBuf:0,inv:0,rollCd:0,skillCd:0,drop:0,landT:0,jumpHeld:false,moveT:0,flashT:0,ghosts:[],safe:{x,y},healed:false,quaked:false,trail:100,
  sta:100,maxSta:100,staDelay:0,staFlash:0,swordLv:0,flaskLv:0,staLv:0,bombs:3,maxBombs:3,wards:2,maxWards:2,wardT:0,edgeLv:0,armorLv:0,satchelLv:0,vigorLv:0,sunderLv:0,drinkLv:0,cls:'knight',ab1:1,ab2:1,ab3:1,ab4:1,abCd:[0,0,0,0],abMax:[1,1,1,1],abFlash:[0,0,0,0],def:1,spd:1,rollCost:22,cryT:0,guardT:0,veilT:0,divT:0,rallyT:0,smokeT:0,barrier:0,barrierT:0,hotT:0,skillMul:0,shards:0};
  if(keep)for(const k of ['hp','maxHp','flasks','maxFlasks','power','scrolls','trail','maxSta','swordLv','flaskLv','staLv','bombs','maxBombs','wards','maxWards','edgeLv','armorLv','satchelLv','vigorLv','sunderLv','drinkLv','cls','ab1','ab2','ab3','ab4','shards'])p[k]=keep[k]??p[k];p.sta=p.maxSta;applyClassDerived(p);return p}
function toast(t){game.toastText=t;game.toast=2.4}
function banner(t,s){game.bTitle=t;game.bSub=s||'';game.banner=3.4}
const SAVE_KEYS=['shards','cls','ab1','ab2','ab3','ab4','vigorLv','sunderLv','drinkLv','edgeLv','armorLv','satchelLv','maxHp','maxFlasks','power','scrolls','swordLv','flaskLv','staLv','maxSta','maxBombs','maxWards'];
function openShortcut(announce){for(let y=17;y<=19;y++)grid[y*MW+99]=0;game.flags.doorOpen=true;if(announce){sfx.door();shake=3;toast('The bar slides free. The way back to the courtyard is open.')}}
function applyFlags(){const f=game.flags;f.opened=f.opened||[];f.taken=f.taken||[];
  for(const o of objs)if(o.kind==='chest'&&f.opened.includes(o.id))o.open=true;
  items=items.filter(it=>!(it.id&&f.taken.includes(it.id)));if(f.doorOpen&&game.level===0)openShortcut(false)}
function startGame(fromSave,replay){
  game.titleScene=null;game.fadeDir=0;game.fade=0;game.next=null;musicStop(.8);for(const k in keys)keys[k]=false;AIM.active=false;arena=null;setTimeout(applyVolumes,0);
  const sv=fromSave&&SAVE?SAVE:null;
  game.flags=sv?JSON.parse(JSON.stringify(sv.flags||{})):{opened:[],taken:[]};
  if(replay){delete game.flags.marshalDead;delete game.flags.colossusDead}
  game.level=replay?4:sv?(sv.level||0):0;game.levelStart=buildWorld(game.level);foes=spawnList.map(makeFoe);applyFlags();
  game.checkpoint=sv&&!replay?sv.checkpoint:null;const at=game.checkpoint||game.levelStart;P=newPlayer(at.x,at.y,null);
  if(sv){Object.assign(P,sv.player||{});if(!CLASSES[P.cls])P.cls='knight';applyClassDerived(P);P.hp=P.maxHp;P.trail=P.maxHp;P.flasks=P.maxFlasks;P.bombs=P.maxBombs;P.wards=P.maxWards;P.sta=P.maxSta;game.embers=sv.souls||0;game.kills=sv.kills||0;game.runTime=sv.time||0}
  else{game.embers=0;game.kills=0;game.runTime=0;applyClassBase(P,game.newCls||'knight')}
  for(const k of foes)if(BOSS[k.t]&&game.flags[BOSS[k.t]]){k.state='dead';k.gone=true}
  shots=[];parts=[];nums=[];tempLights=[];boss=null;game.section=-1;game.wonT=0;hitstop=0;game.restLantern=null;
  camX=clamp(P.x-VW/2,0,MW*T-VW);camY=clamp(P.y-140,0,LH-VH);
  $('menu').hidden=true;MENU.view=null;MENU.stack=[];game.state='play';stage.focus({preventScroll:true});sfx.bell()}
function saveGame(){const p=P,data={level:game.level,checkpoint:game.checkpoint,souls:game.embers,kills:game.kills,time:game.runTime,flags:game.flags,player:{}};
  for(const k of SAVE_KEYS)data.player[k]=p[k];try{localStorage.setItem('cinderkeep-save',JSON.stringify(data));SAVE=data;return true}catch(e){return false}}
function resetArena(){if(arena&&arena.locked){arena.locked=false;for(const gx of arena.gates)for(let y=13;y<16;y++)grid[y*MW+gx]=0}boss=null}
function goToLevel(L){if(game.fadeDir)return;sfx.door();game.fadeDir=1;game.fade=0;game.next=()=>{const keep=P;game.level=L;game.levelStart=buildWorld(L);foes=spawnList.map(makeFoe);applyFlags();game.checkpoint=null;
  P=newPlayer(game.levelStart.x,game.levelStart.y,keep);P.hp=P.maxHp;P.trail=P.maxHp;P.flasks=P.maxFlasks;P.bombs=P.maxBombs;P.wards=P.maxWards;
  shots=[];parts=[];nums=[];tempLights=[];boss=null;game.section=-1;hitstop=0;camX=clamp(P.x-VW/2,0,MW*T-VW);camY=clamp(P.y-140,0,LH-VH);saveGame();sfx.bell()}}
function respawn(death){const c=game.checkpoint||game.levelStart;
  if(death){objs=objs.filter(o=>o.kind!=='remnant');if(game.embers>0){objs.push({kind:'remnant',x:P.safe.x,y:P.safe.y,v:game.embers});game.embers=0}}
  const old=P;P=newPlayer(c.x,c.y,old);P.hp=P.maxHp;P.trail=P.maxHp;P.flasks=P.maxFlasks;P.bombs=P.maxBombs;P.wards=P.maxWards;P.inv=1.5;
  resetArena();resetFoes();shots=[];hitstop=0;game.state='play';game.section=sectionAt(c.x);
  camX=clamp(P.x-VW/2,0,MW*T-VW);camY=clamp(P.y-140,0,LH-VH);sfx.checkpoint();for(let i=0;i<30;i++)emberP(c.x,c.y-12,14);
  banner('',game.checkpoint?'You rise again at the shrine.':'You rise again at '+SECTIONS[0].name+'.')}
function grantScroll(){const p=P;p.scrolls++;p.power+=.15;p.maxHp+=15;p.hp=Math.min(p.maxHp,p.hp+30);toast('Scroll of Ash: your blade bites deeper, your armor holds longer.')}
function worldTick(p,dt){
  const s=sectionAt(p.x);if(s!==game.section){game.section=s;banner(SECTIONS[s].name,SECTIONS[s].sub)}
  windTick(p,dt);
  for(const o of objs)if(o.kind==='vent'){o.t=(o.t??o.phase)+dt;if(o.t>=o.period){o.t-=o.period;if(Math.abs(o.x-p.x)<VW)pillar('pillar',o.x,o.y,.8,game.level>=2?24:16)}}
  for(const o of objs)if(o.kind==='remnant'&&Math.abs(o.x-p.x)<14&&Math.abs(o.y-p.y)<26){objs.splice(objs.indexOf(o),1);game.embers+=o.v;sfx.pick();sfx.upgrade();toast(`You reclaim ${o.v} souls.`);for(let i=0;i<24;i++)emberP(p.x,p.y-14,14);break}
  for(const yy of [p.y-4,p.y-20])for(const xx of [p.x-4,p.x+4]){const tx=Math.floor(xx/T),ty=Math.floor(yy/T);if(tileAt(tx,ty)===5)revealFake(tx,ty)}
  if(!(arena&&arena.locked))for(const a of arenas){if(!a.locked&&!game.flags[a.flag]&&p.x>a.trigger&&p.x<a.x1*T){a.locked=true;arena=a;for(const gx of a.gates)for(let y=13;y<16;y++)grid[y*MW+gx]=1;
    boss=foes.find(f=>f.t===a.boss&&f.state!=='dead');if(boss){boss.active=true;boss.state='intro';boss.st=0;boss.face=-1;sfx.roar();sfx.clang();shake=6;banner(a.name,a.sub)}break}}
  if(game.wonT>0){game.wonT-=dt;if(game.wonT<=0){saveGame();game.state='won';game.deadT=0}}}
const TSCENES=[{L:0,x0:40,name:'Cinderkeep',sub:'The Forgotten Gate',foes:['hollow','hollow','archer','warden','hollow']},{L:0,boss:'king'},
  {L:1,x0:175,name:'The Depths',sub:'Below the keep',foes:['hound','hollow','wraith','hound','priest']},{L:1,boss:'matron'},
  {L:2,x0:90,name:'The Hollow Forge',sub:'Where the fire was kept',foes:['imp','reaver','hollow','golem','reaver']},{L:2,boss:'forgemaster'},
  {L:3,x0:80,name:'The Castle Walls',sub:'Daylight on the battlements',foes:['halberd','crow','hollow','bomber','halberd']},{L:3,boss:'bellwarden'},
  {L:4,x0:150,name:'The Outer Ramparts',sub:'The siege yard',foes:['brute','halberd','flail','hollow','brute']},{L:4,boss:'marshal'}];
const TCLS=['knight','sage','rogue','sentinel'];
const tSafe=x=>solidCode(tileAt(x,16))&&[13,14,15].every(y=>tileAt(x,y)===0)&&[-2,-1,0,1,2].every(d=>![3,7].includes(tileAt(x+d,16))&&![3,7].includes(tileAt(x+d,15)));
const tOpen=x=>tSafe(x)&&[9,10,11,12].every(y=>!solidCode(tileAt(x,y)));
function tRuns(){const runs=[];let a=-1;const bad=x=>arenas.some(q=>x>=q.gates[0]-2&&x<=q.x1+2);
  for(let x=3;x<MW-3;x++){const ok=tOpen(x)&&!bad(x);if(ok&&a<0)a=x;if(!ok&&a>=0){runs.push([a,x-1]);a=-1}}if(a>=0)runs.push([a,MW-4]);return runs}
function tArena(){const r=tRuns().filter(q=>q[1]-q[0]>=24);if(!r.length){const all=tRuns().sort((p,q)=>(q[1]-q[0])-(p[1]-p[0]));return all[0]||[3,MW-4]}return r[Math.floor(r.length*.35)]}
function tNear(x,lo,hi){for(let d=0;d<16;d++){for(const c of [x+d,x-d])if(c>=lo&&c<=hi&&tSafe(c))return c}return null}
function tFoe(t,tx){const d=FOE[t],f=makeFoe({t,x:tx*T+8,y:d.fly?16*T-48:16*T,range:40*T});if(!BOSS[t]){f.hp=f.max=f.trail=Math.round(d.hp*(t==='brute'||t==='golem'||t==='warden'?.8:1.1));f.dmg=d.dmg}
  f.summoned=true;f.active=true;f.state='alert';f.st=0;f.sight=999;f.face=P.x>f.x?1:-1;foes.push(f);for(let i=0;i<10;i++)part(f.x+(rnd()-.5)*12,f.y-rnd()*f.h,(rnd()-.5)*30,-10-rnd()*30,.6,'#5e5a62',{g:-5});return f}
function titleScene(i){const n=TSCENES.length,sc=TSCENES[((i%n)+n)%n];game.level=sc.L;game.flags={opened:[],taken:[]};game.levelStart=buildWorld(sc.L);foes=[];applyFlags();
  const first=(SAVE&&SAVE.player&&SAVE.player.cls)||'knight',cls=TCLS[(TCLS.indexOf(first)+i-(game.titleBase||0)+40)%4];
  shots=[];parts=[];nums=[];tempLights=[];boss=null;arena=null;game.banner=0;game.toast=0;game.wonT=0;for(const k in keys)keys[k]=false;
  let name=sc.name,sub=sc.sub,hx,lo=1,hi=MW-2;
  if(sc.boss){const a=arenas.find(q=>q.boss===sc.boss),sp=spawnList.find(q=>q.t===sc.boss);arena=a;a.locked=true;for(const gx of a.gates)for(let y=13;y<16;y++)grid[y*MW+gx]=1;
    lo=a.gates[0]+2;hi=a.x1-2;const bx=Math.floor(sp.x/T);hx=tNear(clamp(bx-9,lo,hi),lo,hi)??lo+3;name=a.name;sub=a.sub}
  else{const r=tRuns().find(q=>sc.x0>=q[0]&&sc.x0<=q[1])||tArena();lo=r[0];hi=r[1];hx=tNear(Math.floor((lo+hi)/2)-4,lo,hi)??lo}
  P=newPlayer(hx*T+8,16*T,null);P.cls=cls;applyClassDerived(P);P.face=1;P.onGround=true;P.maxSta+=40;P.sta=P.maxSta;
  if(sc.boss){const sp=spawnList.find(q=>q.t===sc.boss),b=makeFoe(sp);b.active=true;b.state='intro';b.st=.4;b.face=-1;foes.push(b);boss=b}
  game.titleScene={i,sc,t:0,cls,lo,hi,spawnT:.6,nWave:0,hold:{},atkT:.8,abT:2.5+rnd()*2,rollT:2,tg:null,cx:null};
  const tx=sc.boss?boss.x:P.x+90;camX=clamp((P.x+tx)/2-VW*.64,0,MW*T-VW);camY=clamp(16*T-150,0,LH-VH);
  const c=$('tcap');if(c)c.innerHTML=`<b>${esc(name)}</b><span>${esc(sub)} · the ${esc(CLASSES[cls].name)}</span>`}
// the demo hero: picks the nearest foe, closes in, swings, dodges, casts
const TABS={knight:[0,1,2,3],sage:[0,1],rogue:[0,1,3],sentinel:[0,1,3]};
function titleBot(dt){const ts=game.titleScene,p=P,H=ts.hold;
  for(const k in H)H[k]-=dt;ts.atkT-=dt;ts.abT-=dt;ts.rollT-=dt;
  let tg=null,bd=1e9;for(const e of foes){if(e.state==='dead'||e.gone)continue;const d=Math.abs(e.x-p.x)+Math.abs(e.y-p.y)*.6;if(d<bd){bd=d;tg=e}}ts.tg=tg;
  keys.left=keys.right=false;keys.a1=H.a1>0;keys.a2=H.a2>0;keys.jump=false;
  if(!tg||p.state==='death')return;
  const dx=tg.x-p.x,dy=(tg.y-tg.h/2)-(p.y-14),adx=Math.abs(dx),dir=dx>0?1:-1,free=LOCO.includes(p.state);
  AIM.active=true;AIM.sx=tg.x-camX;AIM.sy=tg.y-tg.h*.55-camY;
  const go=d=>{if(d>0)keys.right=true;else if(d<0)keys.left=true};
  const edge=x=>x<ts.lo*T+20?1:x>ts.hi*T-20?-1:0;
  if(p.cls==='sage'){
    if(adx>150)go(dir);else if(adx<48&&!edge(p.x-dir*30))go(-dir);
    if(free&&ts.atkT<=0&&adx<190&&Math.abs(dy)<60){if(rnd()<.3&&p.sta>40){startCharge(p);H.a2=.6+rnd()*.6}else{H.a1=.5+rnd()*.7}ts.atkT=H.a1>0?H.a1+.35:1.2}}
  else if(p.cls==='sentinel'){
    const r=40;if(adx>r&&!(H.a2>0))go(dir);
    if(free&&ts.atkT<=0&&adx<r+16){if(rnd()<.55&&p.sta>30){H.a2=1.4;ts.thr=.35;ts.atkT=1.9}else{p.lightBuf=.24;p.face=dir;ts.atkT=.38}}
    if(H.a2>0&&ts.thr!=null){ts.thr-=dt;if(ts.thr<=0&&ts.thr>-.65)keys.a1=true}
    if(!(H.a2>0))ts.thr=null}
  else{const r=p.cls==='rogue'?22:26;if(adx>r)go(dir);
    if(ts.atkT<=0&&adx<r+14&&Math.abs(dy)<40){p.face=dir;const armored=tg.plate>0||tg.t==='golem'||tg.t==='warden';
      if(p.onGround&&(armored?rnd()<.6:rnd()<.22)){p.heavyBuf=.24;ts.atkT=1}else{p.lightBuf=.24;ts.atkT=p.combo===2?.55:.3}}}
  if(p.onGround&&(keys.left||keys.right)&&Math.abs(p.vx)<8&&free){ts.stk=(ts.stk||0)+dt;if(ts.stk>.25){ts.stk=0;p.jumpBuf=.12;keys.jump=true}}else ts.stk=0;
  if(tg.fly&&dy<-26&&adx<40&&p.onGround&&rnd()<dt*3){p.jumpBuf=.12;keys.jump=true}
  if(!tg.fly&&p.onGround&&adx>30&&adx<120&&tg.y<p.y-20&&rnd()<dt*2){p.jumpBuf=.12;keys.jump=true}
  if(free&&ts.rollT<=0&&adx<46&&(BOSS[tg.t]||rnd()<.5)){ts.rollT=2+rnd()*2.5;if(rnd()<.55){const away=edge(p.x-dir*50)?dir:-dir;p.face=away;go(away);p.rollBuf=.15}}
  if(free&&ts.abT<=0&&adx<120){ts.abT=3+rnd()*3;const L=TABS[p.cls],i=L[Math.floor(rnd()*L.length)];p.face=dir;p.abCd[i]=0;useAbility(i)}
  if(p.sta<20)p.sta+=40*dt}
function titleTick(dt){const ts=game.titleScene;if(!ts)return;ts.t+=dt;const sc=ts.sc;
  titleBot(dt);
  if(!sc.boss){ts.spawnT-=dt;const alive=foes.filter(e=>e.state!=='dead'&&!e.gone).length,want=ts.t<1?2:3;
    if(ts.spawnT<=0&&alive<want){ts.spawnT=alive?1.4:.5;const t=sc.foes[ts.nWave++%sc.foes.length],side=rnd()<.75?1:-1,
      x=tNear(Math.floor(P.x/T)+side*(9+Math.floor(rnd()*6)),ts.lo,ts.hi);if(x!=null&&Math.abs(x*T-P.x)>70)tFoe(t,x)}
    foes=foes.filter(e=>!e.gone)}
  const tg=ts.tg,mx=tg?(P.x*.6+tg.x*.4):P.x+50,want=clamp(mx-VW*.64,0,MW*T-VW);
  camX+=(want-camX)*Math.min(1,dt*2.2);camY+=(clamp(Math.min(P.y,tg?tg.y:P.y)-150,0,LH-VH)-camY)*Math.min(1,dt*2);
  if(ts.t>16&&!game.fadeDir){game.fadeDir=1;game.fade=0;game.next=()=>titleScene(ts.i+1)}}
function showTitle(){game.state='title';game.fade=0;game.fadeDir=0;game.next=null;game.titleBase=SAVE?Math.min(4,SAVE.level||0)*2:0;
  titleScene(game.titleBase);applyVolumes();MENU.stack=[];$('menu').hidden=false;showView('titleMenu');musicStart()}
/* =========================================================
   PARTICLES
   ========================================================= */
function part(x,y,vx,vy,life,c,o={}){if(parts.length>700)return;parts.push({x,y,vx,vy,life,max:life,c,g:o.g??300,s:o.s||1,home:o.home||0,drag:o.drag||0,glow:o.glow||0})}
function sparks(x,y,dir,n=8){for(let i=0;i<n;i++)part(x,y,dir*(40+rnd()*150)+(rnd()-.5)*70,-30-rnd()*120,.2+rnd()*.25,rnd()<.5?C.emberW:C.emberL,{g:420})}
function blood(x,y,dir,n=8,c){for(let i=0;i<n;i++)part(x,y,dir*(20+rnd()*90),-30-rnd()*90,.45+rnd()*.4,c||(rnd()<.6?C.blood:C.bloodL),{g:520,s:rnd()<.3?2:1})}
function dust(x,y,n=5){for(let i=0;i<n;i++)part(x+(rnd()-.5)*8,y-1,(rnd()-.5)*50,-8-rnd()*18,.35+rnd()*.3,'#4e4a55',{g:15,drag:3})}
function emberP(x,y,spread=4){part(x+(rnd()-.5)*spread,y,(rnd()-.5)*16,-16-rnd()*26,.6+rnd()*.9,rnd()<.5?C.ember:C.emberL,{g:-8,glow:1})}
function dropEmbers(x,y,n){for(let i=0;i<n;i++)part(x,y,(rnd()-.5)*170,-60-rnd()*100,4,C.emberL,{g:260,home:1,drag:2,glow:1})}

/* =========================================================
   PHYSICS
   ========================================================= */
function move(o,dt,grav=true){
  if(grav)o.vy=Math.min(o.vy+GRAV*dt,560);
  let nx=o.x+o.vx*dt;o.hitWall=false;const top=o.y-o.h+1,bot=o.y-1;
  if(o.vx>0){const tx=Math.floor((nx+o.w/2)/T);for(let ty=Math.floor(top/T);ty<=Math.floor(bot/T);ty++)if(solidCode(tileAt(tx,ty))){nx=tx*T-o.w/2-.01;o.vx=0;o.hitWall=true;break}}
  else if(o.vx<0){const tx=Math.floor((nx-o.w/2)/T);for(let ty=Math.floor(top/T);ty<=Math.floor(bot/T);ty++)if(solidCode(tileAt(tx,ty))){nx=(tx+1)*T+o.w/2+.01;o.vx=0;o.hitWall=true;break}}
  o.x=nx;
  let ny=o.y+o.vy*dt;const was=o.onGround;o.onGround=false;
  const l=Math.floor((o.x-o.w/2+.5)/T),r=Math.floor((o.x+o.w/2-.5)/T);
  if(o.vy>=0){const ty=Math.floor(ny/T);for(let tx=l;tx<=r;tx++){const c=tileAt(tx,ty);if(solidCode(c)||(c===2&&!(o.drop>0)&&o.y<=ty*T+.01)){ny=ty*T;o.vy=0;o.onGround=true;break}}}
  else{const ty=Math.floor((ny-o.h)/T);for(let tx=l;tx<=r;tx++)if(solidCode(tileAt(tx,ty))){ny=(ty+1)*T+o.h;o.vy=0;break}}
  o.y=ny;return!was&&o.onGround;
}
const overlap=(a0,b0,a1,b1,c0,d0,c1,d1)=>a0<c1&&a1>c0&&b0<d1&&b1>d0;
const groundAhead=(o,dir)=>{const tx=Math.floor((o.x+dir*(o.w/2+2))/T),ty=Math.floor((o.y+2)/T),c=tileAt(tx,ty);return solidCode(c)||c===2};
const isLit=x=>!indoorCol[clamp(Math.floor(x/T),0,MW-1)];

/* =========================================================
   PLAYER: the Ashen Knight, driven by a state machine
   states: idle walk run jump fall | light heavy dodge hurt heal death
   ========================================================= */
function setState(p,s){const prev=p.state;p.state=s;p.st=0;if(s!=='heavy')p.skillMul=0;if(!LOCO.includes(s)||!LOCO.includes(prev))p.animT=0;const h=PS[s];if(h.enter)h.enter(p,prev)}
function locoState(p){if(!p.onGround)return p.vy<0?'jump':'fall';if(Math.abs(p.vx)<8)return'idle';return p.moveT>RUN_AFTER?'run':'walk'}
const AIM={active:false,sx:VW/2,sy:VH/2};
const LIVE=()=>game.state==='play'||(game.state==='title'&&!!game.titleScene);
function aimFace(p){if(!AIM.active||!LIVE())return 0;const dx=AIM.sx+camX-p.x;return Math.abs(dx)<3?0:dx>0?1:-1}
function aimLook(p){if(!AIM.active)return 0;const dy=AIM.sy+camY-(p.y-25);return dy<-34?-1:dy>34?1:0}
function faceInput(p){const a=aimFace(p);if(a){p.face=a;return}const ix=(keys.right?1:0)-(keys.left?1:0);if(ix)p.face=ix}
function steer(p,dt,ix){const sp=(!p.onGround?MOVE.air:(p.moveT>RUN_AFTER?MOVE.run:MOVE.walk))*(p.spd||1);const a=aimFace(p);if(a)p.face=a;else if(ix)p.face=ix;const back=a&&ix&&ix!==a?.7:1;p.vx+=(ix*sp*back-p.vx)*Math.min(1,dt*(p.onGround?16:9))}
function tryJump(p){if(!LIVE()||p.jumpBuf<=0)return false;
  if(p.onGround||p.coyote>0){
    if(keys.down&&dropable(p)){p.drop=.22;p.jumpBuf=0;p.onGround=false;return true}
    p.vy=-352;p.jumps=1;p.jumpBuf=0;p.coyote=0;p.jumpHeld=true;p.onGround=false;sfx.jump();dust(p.x,p.y,4);setState(p,'jump');return true}
  if(p.jumps<2){p.vy=-300;p.jumps=2;p.jumpBuf=0;p.jumpHeld=true;sfx.dbl();for(let i=0;i<8;i++)part(p.x+(rnd()-.5)*10,p.y,(rnd()-.5)*60,20+rnd()*30,.35,'#6c6874',{g:0,drag:4});for(let i=0;i<5;i++)emberP(p.x,p.y-4,10);setState(p,'jump');return true}
  return false}
function useSta(p,c){if(p.sta<=0){p.staFlash=.35;return false}p.sta=Math.max(0,p.sta-c);p.staDelay=p.sta<=0?1.1:.6;return true}
function tryActions(p){if(!LIVE()||p.stunT>0)return false;
  if(p.lightBuf>0){if(!useSta(p,14)){p.lightBuf=0;return false}p.combo=0;setState(p,'light');return true}
  if(p.heavyBuf>0&&p.onGround){if(!useSta(p,30)){p.heavyBuf=0;return false}setState(p,'heavy');return true}
  if(pressed2.heal&&p.onGround){if(p.flasks>0){setState(p,'heal');return true}toast('Your flask is empty. Rekindle it at a shrine.')}
  return false}
function loco(p,dt,ix){steer(p,dt,ix);if(tryActions(p))return;tryJump(p)}
const PS={
  idle:{update:loco},walk:{update:loco},run:{update:loco},jump:{update:loco},fall:{update:loco},
  light:{
    enter(p){const s=SWORD.light[p.combo];p.hitId=++swingId;p.lightBuf=0;faceInput(p);(s.big?sfx.heavy:sfx.swing)();p.boltPending=p.cls==='sage'&&p.combo===2},
    update(p,dt,ix){const s=SWORD.light[p.combo];
      if(p.onGround)p.vx=p.st<.09?p.face*s.lunge:p.vx*Math.pow(.001,dt);else p.vx+=(ix*80-p.vx)*Math.min(1,dt*6);
      if(p.st>=s.a&&p.st<=s.b)meleeHits(s);
      if(p.st>=s.dur*.62&&p.lightBuf>0&&p.combo<2&&useSta(p,p.combo===1?20:14)){p.combo++;setState(p,'light');return}
      if(p.st>=s.b&&p.heavyBuf>0&&p.onGround&&useSta(p,30)){setState(p,'heavy');return}
      if(p.st>=s.b&&tryJump(p))return;
      if(p.st>=s.dur){p.combo=0;setState(p,locoState(p))}}},
  heavy:{
    enter(p){p.hitId=++swingId;p.heavyBuf=0;p.quaked=false;faceInput(p);sfx.heavyWind()},
    update(p,dt){const s=SWORD.heavy;
      p.vx=(p.st>s.a-.06&&p.st<s.a+.05)?p.face*s.lunge:p.vx*Math.pow(.001,dt);
      if(p.st<s.a&&rnd()<dt*40){const t=swordTip(p);emberP(t[0],t[1],4)}
      if(p.st>=s.a&&p.st<=s.b)meleeHits(s);
      if(!p.quaked&&p.st>=s.a+.06){p.quaked=true;shake=Math.max(shake,6);sfx.slam();if(p.edgeLv>0){shots.push({x:p.x+p.face*28,y:p.y-8,vx:p.face*(220+p.edgeLv*25),vy:0,g:0,from:'p',kind:'pwave',dmg:(14+p.edgeLv*12)*p.power*(1+.12*p.swordLv),life:.4+.12*p.edgeLv,w:12,h:18,pierce:1,hits:new Set()});sfx.breath()}const ix0=p.x+p.face*30;dust(ix0,p.y,12);
        for(let i=0;i<22;i++)part(ix0+(rnd()-.5)*24,p.y-2,(rnd()-.5)*120,-40-rnd()*120,.5+rnd()*.4,rnd()<.5?C.ember:C.emberL,{g:420,glow:1});
        tempLights.push({x:ix0,y:p.y-6,r:90,life:.3,max:.3})}
      if(p.st>=s.dur)setState(p,locoState(p))}},
  dodge:{
    enter(p){p.rollCd=.5;p.rollBuf=0;p.combo=0;const ix=(keys.right?1:0)-(keys.left?1:0);if(ix)p.face=ix;else faceInput(p);sfx.roll();dust(p.x,p.y,6)},
    update(p,dt){const k=p.st/.36;p.vx=p.face*(265-140*k);if(p.st<.3)p.inv=Math.max(p.inv,.03);if(rnd()<.5)p.ghosts.push({x:p.x,y:p.y,f:p.face,fr:Math.floor(p.st/.36*5)%4,t:.16});if(p.st>=.36)setState(p,locoState(p))}},
  hurt:{update(p,dt){p.vx*=Math.pow(.02,dt);if(p.st>=.34)setState(p,locoState(p))}},
  heal:{
    enter(p){p.flasks--;p.healed=false;sfx.heal()},
    update(p,dt){p.vx*=Math.pow(.001,dt);
      if(p.st>.15&&p.st<.6&&rnd()<dt*30)part(p.x+p.face*9,p.y-28,(rnd()-.5)*10,-10,.5,C.emberL,{g:-6,glow:1});
      if(!p.healed&&p.st>=.6){p.healed=true;const h=Math.round(p.maxHp*(.5+.1*p.flaskLv));p.hp=Math.min(p.maxHp,p.hp+h);nums.push({x:p.x,y:p.y-32,v:'+'+h,t:1,c:'#e8c66a'});
        for(let i=0;i<22;i++)part(p.x+(rnd()-.5)*16,p.y-2-rnd()*26,0,-18-rnd()*24,.9,rnd()<.5?C.emberL:C.ember,{g:-10,glow:1});tempLights.push({x:p.x,y:p.y-14,r:80,life:.5,max:.5})}
      if(p.st>=.95)setState(p,locoState(p))}},
  death:{
    enter(p){sfx.die();p.inv=0;p.combo=0},
    update(p,dt){p.vx*=Math.pow(.001,dt);if(p.st<3&&rnd()<dt*14)part(p.x+(rnd()-.5)*18,p.y-4-rnd()*8,(rnd()-.5)*10,-14-rnd()*18,1+rnd(),rnd()<.5?C.ember:'#5e5a62',{g:-6,glow:1})}}
};
function hurtPlayer(d,dir){const p=P;if(p.inv>0||p.state==='death'||!LIVE())return;const demo=game.state==='title';
  if(p.cls==='sentinel'&&p.state==='skill'&&(p.skillKind==='stance'||p.skillKind==='thrustC')&&dir&&dir===-p.face){
    const cost=Math.max(6,d*.6);p.sta=Math.max(0,p.sta-cost);p.staDelay=.8;sfx.clang();shake=Math.max(shake,2);sparks(p.x+p.face*10,p.y-18,p.face,10);
    if(p.sta>0){const c=Math.max(1,Math.round(d*.15*(p.def||1)));p.hp-=c;if(demo)p.hp=Math.max(p.hp,Math.round(p.maxHp*.4));p.flashT=.06;p.vx=dir*90;p.inv=.25;nums.push({x:p.x,y:p.y-36,v:'Blocked',t:.6,c:'#cbb27a'});
      if(p.hp<=0){p.hp=0;game.state='dead';game.deadT=0;setState(p,'death')}return}
    nums.push({x:p.x,y:p.y-36,v:'Guard broken',t:.9,c:'#c4483c'});d*=.5}
  d=d*(p.wardT>0?.5:1)*(1-.06*(p.armorLv||0))*(p.def||1)*(p.guardT>0?.3-.05*(p.guardR-1):1)*(p.rallyT>0?.85-.05*(p.rallyR-1):1)*(p.veilT>0?.6:1);
  if(p.barrier>0){const a=Math.min(p.barrier,d);p.barrier-=a;d-=a;nums.push({x:p.x,y:p.y-40,v:'Absorbed',t:.6,c:'#8fd0ff'});sfx.clang();if(d<1){p.inv=.4;for(let i=0;i<8;i++)part(p.x,p.y-16,(rnd()-.5)*120,(rnd()-.5)*120,.3,'#8fd0ff',{g:0,glow:1});return}}
  d=Math.round(d);p.hp-=d;if(demo)p.hp=Math.max(p.hp,Math.round(p.maxHp*.4));p.flashT=.12;shake=5;hitstop=.022;blood(p.x,p.y-16,dir||1,8);sparks(p.x,p.y-18,dir||1,6);sfx.hurt();
  nums.push({x:p.x,y:p.y-32,v:d,t:.9,c:'#e05050'});
  if(p.hp<=0){p.hp=0;game.state='dead';game.deadT=0;setState(p,'death');return}
  if(p.state==='heavy'&&p.st<SWORD.heavy.b){p.inv=.45;sfx.clang();return}
  if(p.guardT>0){p.inv=.4;sfx.clang();sparks(p.x+(dir||1)*6,p.y-18,-(dir||1),8);p.vx=(dir||-p.face)*60;return} // the knight's poise: a heavy swing is not interrupted
  p.inv=1;setState(p,'hurt');p.vx=(dir||-p.face)*150;p.vy=-160}
function updatePlayer(dt){
  const p=P;p.st+=dt;p.animT+=dt;p.inv=Math.max(0,p.inv-dt);p.flashT-=dt;p.rollCd-=dt;p.skillCd-=dt;p.jumpBuf-=dt;p.coyote-=dt;p.drop-=dt;p.landT-=dt;p.rollBuf-=dt;p.lightBuf-=dt;p.heavyBuf-=dt;
  p.trail+=(p.hp-p.trail)*Math.min(1,dt*2.5);
  if(p.pullT>0){p.pullT-=dt;p.x+=(p.pullX-p.x)*Math.min(1,dt*14);p.vx=0}
  p.stunT=(p.stunT||0)-dt;if(p.stunT>0&&rnd()<dt*16){const a=game.time*7+rnd()*6;part(p.x+Math.cos(a)*7,p.y-31+Math.sin(a)*2,0,-4,.35,rnd()<.5?'#fff2b0':'#e8d890',{g:0,glow:1})}
  const ctl=LIVE()&&p.state!=='death'&&!(p.stunT>0),ix=ctl?(keys.right?1:0)-(keys.left?1:0):0;
  if(ix&&p.onGround)p.moveT+=dt;else if(!ix)p.moveT=0;
  const H=SWORD.heavy,locked=['dodge','hurt','heal','death'].includes(p.state)||(p.state==='heavy'&&p.st>=H.a-.08&&p.st<=H.b);
  if(ctl&&p.rollBuf>0&&p.rollCd<=0&&!locked&&useSta(p,p.rollCost||22))setState(p,'dodge');
  p.staDelay-=dt;p.staFlash-=dt;if(p.staDelay<=0&&!['light','heavy','dodge'].includes(p.state))p.sta=Math.min(p.maxSta,p.sta+52*dt);
  abilityTick(p,dt);if(ctl)for(let i=0;i<4;i++)if(pressed2['ab'+(i+1)])useAbility(i);
  if(ctl&&p.cls==='sage'&&pressed2.chg)startCharge(p);
  if(ctl&&p.cls==='sentinel'&&pressed2.stance)startStance(p);
  if(ctl&&p.cls==='sage'&&(keys.a1||keys.ab4)&&p.state!=='skill'&&p.sta>0)useAbility(3);
  if(p.wardT>0){p.wardT-=dt;if(rnd()<dt*26)part(p.x+(rnd()-.5)*20,p.y-rnd()*28,(rnd()-.5)*10,-6-rnd()*10,.8,rnd()<.5?'#b4ab94':'#857c69',{g:-3})}
  PS[p.state].update(p,dt,ix);
  if(p.jumpHeld&&!keys.jump&&p.vy<-140){p.vy=-140;p.jumpHeld=false}if(p.vy>=0)p.jumpHeld=false;
  if(ctl&&pressed2.item2){if(p.wardT>0)toast('The ash still clings to you.');else if(p.wards>0){p.wards--;p.wardT=8;sfx.ward();for(let i=0;i<30;i++)part(p.x+(rnd()-.5)*24,p.y-rnd()*30,(rnd()-.5)*40,-10-rnd()*30,1,'#b4ab94',{g:-4,drag:2})}else toast('No warding ash left. Rest at the shrine to restock.')}
  if(ctl&&pressed2.skill&&p.bombs<=0)toast('No ember bombs left. Rest at the shrine to restock.');
  else if(ctl&&pressed2.skill){if(p.skillCd<=0){p.skillCd=.6;p.bombs--;shots.push({x:p.x+p.face*6,y:p.y-18,vx:p.face*190+p.vx*.3,vy:-210,g:700,from:'p',kind:'bomb',dmg:34,life:2.5,w:6,h:6,hits:new Set()});sfx.swing()}}
  if(ctl&&pressed2.use)interact();
  const landed=move(p,dt);
  if(LOCO.includes(p.state)){const n=locoState(p);if(n!==p.state){p.state=n;p.st=0}}
  if(p.onGround&&(p.state==='walk'||p.state==='run')){p.stepT=(p.stepT||0)-dt;if(p.stepT<=0){sfx.step(p.state==='run');p.stepT=p.state==='run'?.21:.33}}else p.stepT=.06;
  if(p.onGround){p.coyote=.08;p.jumps=0;const l=tileAt(Math.floor((p.x-4)/T),Math.floor((p.y+2)/T)),r=tileAt(Math.floor((p.x+4)/T),Math.floor((p.y+2)/T));if(solidCode(l)&&solidCode(r)&&!nearSpike(p))p.safe={x:p.x,y:p.y}}
  if(landed){p.landT=.1;dust(p.x,p.y,5);sfx.land()}
  if(p.swordLv>=7&&p.state!=='death'&&rnd()<dt*(p.swordLv-5)*2){const t=swordTip(p);emberP(t[0],t[1],4)}
  if(p.state!=='death'&&rnd()<dt*3){const pc=PAL[p.cls]||PAL.knight;part(p.x+(rnd()-.5)*12,p.y-8-rnd()*14,(rnd()-.5)*8,-8-rnd()*12,.6+rnd()*.7,rnd()<.6?pc.ember:pc.eye,{g:-4,glow:1})}
  for(const gh of p.ghosts)gh.t-=dt;p.ghosts=p.ghosts.filter(g=>g.t>0);
  // hazards
  if(p.state!=='death'){
    if(nearSpike(p,true)&&p.inv<=0){hurtPlayer(18,-p.face);if(p.state!=='death')p.vy=-300}
    if(p.y>LH+40){p.x=p.safe.x;p.y=p.safe.y;p.vx=p.vy=0;const was=p.inv;p.inv=0;hurtPlayer(15,0);if(p.state!=='death'){setState(p,'fall');p.inv=Math.max(1,was)}}}
  if(game.state!=='title')worldTick(p,dt);
}
function dropable(p){const ty=Math.floor((p.y+2)/T);const a=tileAt(Math.floor((p.x-4)/T),ty),b=tileAt(Math.floor((p.x+4)/T),ty);return(a===2||a===0)&&(b===2||b===0)&&(a===2||b===2)}
function nearSpike(o,strict){const xs=[o.x-o.w/2+2,o.x,o.x+o.w/2-2],hz=c=>c===3||c===7;for(const x of xs){if(hz(tileAt(Math.floor(x/T),Math.floor((o.y-(strict?3:1))/T))))return true;if(!strict&&hz(tileAt(Math.floor(x/T),Math.floor((o.y+2)/T))))return true}return false}
/* =========================================================
   ENEMIES: Hollow Soldier, Crypt Archer, Armored Warden, and the Ashen King
   Every attack has a visible wind-up and a recovery window.
   ========================================================= */
const BOSS={marshal:'marshalDead',colossus:'colossusDead',bellwarden:'bellDead',drake:'drakeDead',king:'kingDead',matron:'matronDead',seraph:'seraphDead',forgemaster:'forgeDead',queen:'queenDead'};
const SND={brute:'warden',bulwark:'warden',flail:'warden',marshal:'warden',colossus:'warden',crow:'wisp',halberd:'husk',bomber:'hound',bellwarden:'warden',drake:'warden',golem:'warden',imp:'hound',reaver:'husk',forgemaster:'warden',queen:'husk',hollow:'husk',king:'warden',matron:'archer',seraph:'warden',priest:'hound',wraith:'wisp',warden:'warden'};
const FOE={
  brute:{hp:170,souls:45,w:24,h:40,speed:26,dmg:24,sight:170,plate:3},
  bulwark:{hp:80,souls:30,w:18,h:30,speed:22,dmg:14,sight:170},
  flail:{hp:100,souls:34,w:14,h:30,speed:30,dmg:16,sight:180},
  marshal:{hp:4493,souls:5000,w:22,h:48,speed:56,dmg:51,sight:999},
  colossus:{hp:9668,souls:12000,w:44,h:84,speed:30,dmg:55,sight:999},
  crow:{hp:8,souls:5,w:8,h:7,speed:80,dmg:7,sight:220,fly:1},
  halberd:{hp:40,souls:14,w:12,h:28,speed:36,dmg:12,sight:170},
  bomber:{hp:30,souls:16,w:14,h:22,speed:0,dmg:12,sight:280},
  bellwarden:{hp:1592,souls:2500,w:28,h:66,speed:34,dmg:42,sight:999},
  drake:{hp:2200,souls:4000,w:46,h:36,speed:60,dmg:42,sight:999},
  golem:{hp:95,souls:20,w:20,h:34,speed:18,dmg:18,sight:150},
  imp:{hp:18,souls:8,w:10,h:16,speed:50,dmg:9,sight:210},
  reaver:{hp:45,souls:14,w:12,h:26,speed:50,dmg:12,sight:180},
  forgemaster:{hp:1106,souls:1200,w:28,h:50,speed:44,dmg:35,sight:999},
  queen:{hp:1327,souls:2000,w:12,h:30,speed:120,dmg:35,sight:999},
  hound:{hp:30,souls:8,w:16,h:12,speed:95,dmg:12,sight:170},
  priest:{hp:45,souls:18,w:10,h:28,speed:30,dmg:17,sight:210},
  wraith:{hp:28,souls:14,w:12,h:14,speed:55,dmg:13,sight:200,fly:1},
  matron:{hp:768,souls:300,w:18,h:46,speed:38,dmg:29,sight:999},
  seraph:{hp:922,souls:600,w:22,h:40,speed:60,dmg:29,sight:999,fly:1},
  hollow:{hp:50,souls:10,w:10,h:24,speed:34,dmg:15,sight:150},
  archer:{hp:35,souls:12,w:10,h:24,speed:40,dmg:13,sight:230},
  warden:{hp:120,souls:30,w:16,h:30,speed:19,dmg:28,sight:150},
  king:{hp:640,souls:400,w:26,h:46,speed:50,dmg:24,sight:999}
};
const LVS=[[1,1,1],[1.3,1.35,1.5],[1.65,1.62,2.2],[2,1.95,3],[4.667,2.34,3.6]];
function makeFoe(s){const d=FOE[s.t],k=BOSS[s.t]?[1,1,1]:LVS[game.level]||LVS[0],hp=Math.round(d.hp*k[0]);
  return{t:s.t,fly:!!d.fly,x:s.x,y:s.y,w:d.w,h:d.h,vx:0,vy:0,face:-1,hp,max:hp,dmg:d.dmg*k[1],speed:d.speed,sight:d.sight,souls:Math.round(d.souls*k[2]),
    state:'patrol',st:0,flash:0,t2:rnd()*9,cd:.6,active:false,onGround:true,hitBy:-1,dir:-1,home:{x:s.x,y:s.y},range:s.range,
    pause:0,lost:0,turnT:0,aim:null,hitDone:false,phase:1,gone:false,blocked:false,trail:hp,fast:0,plate:d.plate||0,bside:0,blown:false,called:false}}
function resetFoe(e){Object.assign(e,makeFoe({t:e.t,x:e.home.x,y:e.home.y,range:e.range}))}
function resetFoes(){foes=foes.filter(e=>!e.summoned);for(const e of foes){if(BOSS[e.t]&&game.flags[BOSS[e.t]])continue;resetFoe(e)}boss=null}
const FRONT_STATES=['patrol','chase','alert','return','windup','turn'];
function clearSight(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/6);for(let i=1;i<n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(solidCode(tileAt(Math.floor(x/T),Math.floor(y/T))))return false}return true}
function lineOfSight(e){if(e.t==='priest'||e.t==='imp')return Math.abs(P.y-e.y)<80&&clearSight(e.x,e.y-22,P.x,P.y-16);const y=Math.floor((e.y-16)/T),py=Math.floor((P.y-16)/T);if(y!==py&&Math.abs(P.y-e.y)>20)return false;
  const a=Math.min(e.x,P.x),b=Math.max(e.x,P.x);for(let x=a;x<b;x+=8)if(solidCode(tileAt(Math.floor(x/T),y)))return false;return true}
function walker(e,dt,want,spd){e.vx+=(want*spd-e.vx)*Math.min(1,dt*8);
  if(e.onGround&&want&&!groundAhead(e,want)){e.vx=0;e.blocked=true}else e.blocked=false;
  if(e.onGround&&e.vx&&!groundAhead(e,Math.sign(e.vx)))e.vx=0;
  move(e,dt);if(e.hitWall)e.blocked=true}
function patrolArea(e,dt){
  if(e.pause>0){e.pause-=dt;walker(e,dt,0,0);return}
  if(e.x<e.home.x-e.range)e.dir=1;else if(e.x>e.home.x+e.range)e.dir=-1;
  if(e.blocked){e.dir*=-1;e.pause=.5+rnd()*.6}else if(rnd()<dt*.35)e.pause=.7+rnd()*.9;
  e.face=e.dir;walker(e,dt,e.dir,e.speed*.45)}
function goHome(e,dt){const d=e.home.x-e.x;e.face=d>0?1:-1;if(Math.abs(d)<6){e.state='patrol';e.pause=.6;walker(e,dt,0,0);return}walker(e,dt,e.face,e.speed*.7);if(e.blocked){e.state='patrol'}}
function hitPlayerBox(x0,y0,x1,y1){return overlap(x0,y0,x1,y1,P.x-5,P.y-24,P.x+5,P.y)}
function updateFoe(e,dt){
  if(e.gone)return;
  e.t2+=dt;e.flash-=dt;e.st+=dt;e.cd-=dt;
  if(e.state==='dead'){e.vx*=Math.pow(.01,dt);move(e,dt);if(e.st>1.6)e.gone=true;return}
  if(!e.active){if(!BOSS[e.t]&&Math.abs(e.x-P.x)<VW*.75&&Math.abs(e.y-P.y)<VH)e.active=true;else return}
  if(!e.fly&&e.y>LH+20){const h=e.hp;resetFoe(e);e.hp=h;e.active=true;return}
  if(!e.fly&&!BOSS[e.t]&&solidCode(tileAt(Math.floor(e.x/T),Math.floor((e.y-e.h/2)/T)))){ // wedged in stone: step to the nearest open column, else go home
    let freed=false;for(const d of [1,-1,2,-2]){const tx=Math.floor(e.x/T)+d;if(!solidCode(tileAt(tx,Math.floor((e.y-e.h/2)/T)))&&!solidCode(tileAt(tx,Math.floor((e.y-2)/T)))){e.x=tx*T+T/2;freed=true;break}}
    if(!freed){const h=e.hp;resetFoe(e);e.hp=h;e.active=true;return}}
  const p=P,dx=p.x-e.x,dy=p.y-e.y,adx=Math.abs(dx),alive=p.state!=='death'&&LIVE();
  if(e.stunT>0){e.stunT-=dt;if(e.fly){e.vx*=Math.pow(.05,dt);e.vy=Math.min(80,e.vy+120*dt);e.x+=e.vx*dt;e.y=Math.min(e.y+e.vy*dt,16*T-4)}else{e.vx*=Math.pow(.01,dt);move(e,dt)}return}
  const sees=alive&&!hiddenP()&&adx<e.sight&&Math.abs(dy)<(e.t==='priest'||e.t==='imp'?80:40)&&lineOfSight(e);
  const leashed=Math.abs(e.x-e.home.x)>e.range+170;
  if(e.state==='hurt'&&e.fly){e.vx*=Math.pow(.02,dt);e.vy*=Math.pow(.02,dt);e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.st>.26){e.state='chase';e.cd=Math.max(e.cd,.45)}return}
  if(e.summoned&&!BOSS[e.t]&&p.state!=='death'&&!hiddenP()){e.lost=0;if(e.state==='patrol'||e.state==='return'){e.state='chase';e.st=0}}
  if(e.summoned&&!e.fly&&!BOSS[e.t]&&e.state!=='hurt'){ // reinforcements climb or hop whatever stands between them and the knight
    if(e.onGround&&(e.hitWall||e.blocked)&&adx>30&&p.state!=='death'){e.stuckT=(e.stuckT||0)+dt;if(e.stuckT>.45){e.stuckT=0;const dir=dx>0?1:-1;e.onGround=false;if(e.hitWall){e.vy=-440;e.vx=dir*120}else{e.vy=-170;e.vx=dir*110};dust(e.x,e.y,8)}}else e.stuckT=0}
  if(e.state==='hurt'){e.vx*=Math.pow(.01,dt);if(e.onGround&&e.vx&&!groundAhead(e,Math.sign(e.vx)))e.vx=0;move(e,dt);if(e.st>.26){e.state=sees?'chase':'return';e.cd=Math.max(e.cd,.45)}return}
  ({hollow:aiHollow,archer:aiArcher,warden:aiWarden,king:aiKing,hound:aiHound,priest:aiPriest,wraith:aiWraith,matron:aiMatron,seraph:aiSeraph,golem:aiGolem,imp:aiImp,reaver:aiReaver,forgemaster:aiForgemaster,queen:aiQueen,crow:aiCrow,halberd:aiHalberd,bomber:aiBomber,bellwarden:aiBell,drake:aiDrake,brute:aiBrute,bulwark:aiBulwark,flail:aiFlail,marshal:aiMarshal,colossus:aiColossus})[e.t](e,dt,dx,dy,adx,sees,leashed);
}
function aiHollow(e,dt,dx,dy,adx,sees,leashed){
  switch(e.state){
    case 'patrol':if(sees){e.state='alert';e.st=0;e.face=dx>0?1:-1;sfx.foe()}else patrolArea(e,dt);return;
    case 'alert':walker(e,dt,0,0);if(e.st>.4)e.state='chase';return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees){e.lost+=dt;if(e.lost>1.4){e.state='return';e.lost=0}}else e.lost=0;
      if(leashed){e.state='return';return}
      e.face=dx>0?1:-1;walker(e,dt,adx>24?e.face:0,e.speed);
      if(adx<34&&Math.abs(dy)<16&&e.cd<=0&&e.onGround){e.state='windup';e.st=0;e.vx=0}return;
    case 'windup':walker(e,dt,0,0);if(e.st>.62){e.state='strike';e.st=0;e.hitDone=false;sfx.axe()}return;
    case 'strike':{e.vx=e.st<.08?e.face*85:e.vx*Math.pow(.001,dt);if(e.onGround&&!groundAhead(e,e.face))e.vx=0;
      if(!e.hitDone&&e.st<.15){const x0=e.face>0?e.x:e.x-32,x1=e.face>0?e.x+32:e.x;if(hitPlayerBox(x0,e.y-26,x1,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}}
      move(e,dt);if(e.st>.2){e.state='recover';e.st=0}return}
    case 'recover':walker(e,dt,0,0);if(e.st>.66){e.state='chase';e.cd=.7+rnd()*.6}return;
  }
}
function aiArcher(e,dt,dx,dy,adx,sees,leashed){
  const away=dx>0?-1:1;
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);if(rnd()<dt*.25)e.face*=-1;if(sees){e.state='chase';e.face=dx>0?1:-1;sfx.foe()}return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees){e.lost+=dt;if(e.lost>2){e.state='return';e.lost=0}}else e.lost=0;
      e.face=dx>0?1:-1;
      if(adx<80&&e.onGround){e.state='retreat';e.st=0;return}
      if(adx>200)walker(e,dt,e.face,e.speed);else walker(e,dt,0,0);
      if(e.cd<=0&&sees&&e.onGround){e.state='aim';e.st=0;e.aim=null}return;
    case 'retreat':{walker(e,dt,away,e.speed*1.35);e.face=away;
      if(e.blocked&&e.onGround){const tx=Math.floor((e.x+away*40)/T),ty=Math.floor((e.y+2)/T),c=tileAt(tx,ty);
        if((solidCode(c)||c===2)&&!solidCode(tileAt(tx,ty-1))&&!solidCode(tileAt(Math.floor((e.x+away*16)/T),ty-1))){e.vy=-250;e.vx=away*120;e.onGround=false;e.state='hop';e.st=0;sfx.jump()}
        else{e.state='aim';e.st=.3;e.aim=null;e.face=-away}}
      else if(e.st>.9||adx>120){e.state='aim';e.st=0;e.aim=null;e.face=-away}return}
    case 'hop':move(e,dt);if(e.onGround&&e.st>.1){e.state='aim';e.st=.2;e.face=dx>0?1:-1;dust(e.x,e.y,3)}return;
    case 'aim':{walker(e,dt,0,0);e.face=dx>0?1:-1;if(e.st<.6)e.aim={x:P.x,y:P.y-14};
      if(e.st>.88){const sx2=e.x+e.face*7,sy2=e.y-17,a=Math.atan2(e.aim.y-sy2,e.aim.x-sx2);
        shots.push({x:sx2,y:sy2,vx:Math.cos(a)*250,vy:Math.sin(a)*250,g:0,from:'e',kind:'earrow',dmg:e.dmg,life:2.2,w:6,h:2});sfx.bow();e.state='recover';e.st=0}return}
    case 'recover':walker(e,dt,0,0);if(e.st>.6){e.state='chase';e.cd=1.1+rnd()*.7}return;
  }
}
function aiWarden(e,dt,dx,dy,adx,sees,leashed){
  const side=dx>0?1:-1;
  switch(e.state){
    case 'patrol':if(sees){e.state='chase';sfx.foe();sfx.clang()}else patrolArea(e,dt);return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees){e.lost+=dt;if(e.lost>2){e.state='return';e.lost=0}}else e.lost=0;
      if(leashed){e.state='return';return}
      if(side!==e.face){e.state='turn';e.st=0;walker(e,dt,0,0);return}
      walker(e,dt,adx>30?e.face:0,e.speed);if(e.onGround&&Math.abs(e.vx)>4&&Math.floor(e.t2*3)!==Math.floor((e.t2-dt)*3))sfx.step(true);
      if(adx<40&&Math.abs(dy)<16&&e.cd<=0){e.state='windup';e.st=0;tone2()}return;
    case 'turn':walker(e,dt,0,0);if(e.st>.75){e.face=dx>0?1:-1;e.state='chase'}return;
    case 'windup':walker(e,dt,0,0);if(e.st>.95){e.state='strike';e.st=0;e.hitDone=false;sfx.heavy()}return;
    case 'strike':{walker(e,dt,0,0);
      if(!e.hitDone&&e.st>.06&&e.st<.2){const x0=e.face>0?e.x:e.x-40,x1=e.face>0?e.x+40:e.x;if(hitPlayerBox(x0,e.y-34,x1,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}}
      if(e.st>.12&&e.st-dt<=.12){shake=Math.max(shake,5);sfx.slam();dust(e.x+e.face*30,e.y,10);for(let i=0;i<10;i++)sparks(e.x+e.face*30,e.y-2,e.face,1)}
      if(e.st>.24){e.state=e.hitDone?'recover':'stuck';e.st=0}return}
    case 'recover':walker(e,dt,0,0);if(e.st>.8){e.state='chase';e.cd=1+rnd()*.6}return;
    case 'stuck':walker(e,dt,0,0);if(e.st>1.7){e.state='chase';e.cd=.8}return;
    case 'stagger':e.vx*=Math.pow(.01,dt);move(e,dt);if(e.st>.9){e.state='chase';e.cd=.4}return;
  }
}
function tone2(){osc({type:'sawtooth',f0:70,f1:110,dur:.8,vol:.06,a:.5,lp:400,wet:.4});metal(900,.03,.5,.4,.5)}
function aiKing(e,dt,dx,dy,adx){
  if(e.phase===1&&e.hp<e.max*.5){e.phase=2;banner('','The Ashen King burns brighter.');sfx.roar();shake=7;for(let i=0;i<50;i++)emberP(e.x,e.y-rnd()*44,30)}
  const ph2=e.phase===2,sp=ph2?.75:1;if(ph2&&rnd()<dt*14)emberP(e.x+(rnd()-.5)*20,e.y-28-rnd()*14,4);
  const pick=()=>{const r=rnd();
    if(ph2&&e.rainCd<=0&&r<.3){e.state='rainW';e.rainCd=7}
    else if(adx<64&&r<.65)e.state='sweepW';else if(adx>120&&r<.55)e.state='chargeW';else e.state='slamW';
    e.st=0;e.face=dx>0?1:-1;if(e.state==='sweepW')sfx.bossWind();if(e.state==='chargeW')sfx.roar();if(e.state==='rainW')sfx.bossWind()};
  e.rainCd=(e.rainCd||0)-dt;
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);return;
    case 'intro':walker(e,dt,0,0);if(e.st>1.6){e.state='chase';e.cd=.5}return;
    case 'chase':e.face=dx>0?1:-1;walker(e,dt,adx>46?e.face:0,e.speed*(ph2?1.25:1));if(e.cd<=0)pick();return;
    case 'sweepW':walker(e,dt,0,0);if(e.st>.72*sp){e.state='sweep';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'sweep':{walker(e,dt,0,0);if(!e.hitDone&&e.st<.22){const x0=e.face>0?e.x-14:e.x-66,x1=e.face>0?e.x+66:e.x+14;if(hitPlayerBox(x0,e.y-40,x1,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}}
      if(e.st>.8*sp){e.state='chase';e.cd=.5+rnd()*.5}return}
    case 'slamW':walker(e,dt,0,0);if(e.st>.5*sp){e.state='slamUp';e.st=0;e.vy=-430;e.vx=clamp(dx/0.9,-210,210);e.face=dx>0?1:-1;sfx.bossLeap()}return;
    case 'slamUp':move(e,dt);if(e.onGround&&e.st>.15){e.state='slam';e.st=0;shake=8;sfx.bossSlam();dust(e.x,e.y,20);for(let i=0;i<20;i++)emberP(e.x+(rnd()-.5)*40,e.y-4,6);
      const n=ph2?2:1;for(let k=0;k<n;k++)for(const d of [-1,1])shots.push({x:e.x+d*16,y:e.y,vx:d*(ph2?190:155)*(k?.62:1),vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.8,life:3,w:10,h:14});
      if(hitPlayerBox(e.x-26,e.y-46,e.x+26,e.y))hurtPlayer(e.dmg,P.x>e.x?1:-1)}return;
    case 'slam':walker(e,dt,0,0);if(e.st>.85*sp){e.state='chase';e.cd=.4+rnd()*.5}return;
    case 'chargeW':walker(e,dt,0,0);e.face=dx>0?1:-1;if(rnd()<.5){sparks(e.x-e.face*12,e.y-1,-e.face,1);sfx.scrape()}if(e.st>.62*sp){e.state='charge';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'charge':e.vx=e.face*(ph2?300:255);if(!e.hitDone&&hitPlayerBox(e.x-13,e.y-44,e.x+13,e.y)){e.hitDone=true;hurtPlayer(e.dmg*1.1,e.face)}
      if(rnd()<.6)dust(e.x-e.face*8,e.y,1);move(e,dt);if(e.hitWall||e.st>1.5){if(e.hitWall){e.state='stunned';shake=7;sfx.clang();sparks(e.x+e.face*13,e.y-28,-e.face,16)}else e.state='recover';e.st=0;e.vx=0}return;
    case 'recover':walker(e,dt,0,0);if(e.st>.6){e.state='chase';e.cd=.4}return;
    case 'stunned':walker(e,dt,0,0);if(e.st>1.4){e.state='chase';e.cd=.3}return;
    case 'rainW':{walker(e,dt,0,0);if(e.st>.8&&!e.rained){e.rained=true;const xs=[P.x];for(let i=0;i<4;i++)xs.push(P.x+(i-1.5)*56+(rnd()-.5)*20);
        for(const x of xs){const cx=clamp(x,(arena.gates[0]+2)*T,(arena.x1-1)*T);shots.push({x:cx,y:3*T+4,vx:0,vy:0,g:0,from:'e',kind:'cinder',dmg:e.dmg*.7,life:3,w:8,h:10,delay:.85+rnd()*.25,floor:16*T})}}
      if(e.st>1.5){e.rained=false;e.state='chase';e.cd=.6}return}
  }
}
function meleeHits(s){const p=P,f=p.face,x0=f>0?p.x-6:p.x-s.reach,x1=f>0?p.x+s.reach:p.x+6,y0=p.y-34,y1=p.y+2;let any=false,crit=false;
  for(const e of foes){if(e.state==='dead'||e.gone||!e.active||e.hitBy===p.hitId||(e.alpha!==undefined&&e.alpha<.5))continue;
    if(!overlap(x0,y0,x1,y1,e.x-e.w/2,e.y-e.h,e.x+e.w/2,e.y))continue;e.hitBy=p.hitId;any=true;
    let d=s.dmg*p.power*(1+.12*p.swordLv),c=false;
    const behind=e.face===f;
    d*=atkMul(p)*(p.state==='heavy'&&p.skillMul?p.skillMul:1);if(p.veilT>0){d*=1.8;c=true}
    if(['stunned','stuck','stagger','dizzy','open','smashR'].includes(e.state)||e.stunT>0){d*=1.5;c=true}else if(behind&&!BOSS[e.t]){d*=e.t==='warden'?1.5:p.cls==='rogue'?1.6:1.25;c=true}
    if(p.state==='heavy'&&p.skillMul)stunFoe(e,p.skillStun);
    if(p.cls==='sage'){d=s.dmg;c=false} // the staff is a focus, not a weapon
    if(damageFoe(e,d,f,s.kb,c,s.big?'heavy':'light'))crit=crit||c}
  if(any){hitstop=s.big?.05:.028;shake=Math.max(shake,s.big?5:2);if(crit)sfx.crit();if(P.veilT>0)P.veilT=0}}
// returns false when the blow was blocked
function damageFoe(e,d,dir,kb,crit,kind){
  if(P&&P.sunderLv&&ARMORED.has(e.t))d*=1+.15*P.sunderLv;
  const front=e.face===-dir;
  if(e.t==='marshal'&&front&&kind!=='blast'&&['chase','cutR','leapLand','hornR'].includes(e.state)&&game.time>(e.parryT||0)&&rnd()<(e.phase===2?.38:.24)){
    e.parryT=game.time+2.2;e.flash=.05;sfx.clang();sfx.crit();sparks(e.x+e.face*10,e.y-30,-dir,16);nums.push({x:e.x,y:e.y-e.h-6,v:'Parried',t:.8,c:C.emberL});
    if(P){P.vx=-dir*150;P.sta=Math.max(0,P.sta-20);P.staDelay=.7}hitstop=.0225;e.state='riposteW';e.st=0;return false}
  if(e.t==='brute'&&kind!=='blast'&&e.plate>0){
    if(kind==='heavy'||(P.sunderLv>=2&&rnd()<.12*P.sunderLv)){e.plate--;sfx.clang();sparks(e.x,e.y-24,dir,14);
      if(e.plate<=0){nums.push({x:e.x,y:e.y-e.h-14,v:'Plate shattered',t:1,c:C.emberL});e.state='stagger';e.st=0;e.vx=0;shake=Math.max(shake,4)}
      else nums.push({x:e.x,y:e.y-e.h-14,v:'Plate cracked',t:.8,c:'#c9c2b0'})}
    else if(front&&!['stunned','stagger','smashR'].includes(e.state)){d*=.35;sfx.clang();sparks(e.x+e.face*8,e.y-22,-dir,6);nums.push({x:e.x,y:e.y-e.h-14,v:'Armored',t:.6,c:'#9a94a2'})}}
  if(e.t==='bulwark'&&front&&!BULWARK_OPEN.includes(e.state)&&kind!=='blast'){e.flash=.05;sfx.clang();sparks(e.x+e.face*10,e.y-18,-dir,10);
    nums.push({x:e.x,y:e.y-e.h-4,v:'Blocked',t:.7,c:'#9a94a2'});if(kind==='heavy'){e.vx=dir*80;nums.push({x:e.x,y:e.y-e.h-14,v:'It holds',t:.7,c:'#9a94a2'})}
    if(P){P.vx=-dir*110;P.sta=Math.max(0,P.sta-(kind==='heavy'?18:10));P.staDelay=.6}hitstop=.022;return false}
  if(e.t==='flail'&&front&&e.state!=='dizzy'&&kind!=='blast')d*=.7;
  if(e.t==='colossus'&&front&&kind==='light'&&!['stunned','stuck'].includes(e.state)){d*=.6;if(rnd()<.3)nums.push({x:e.x,y:e.y-e.h-14,v:'Armored',t:.6,c:'#9a94a2'})}
  if(e.t==='golem'&&kind!=='blast'){if(e.state==='vent'){d*=2;crit=true}else{d*=.3;sfx.clang();sparks(e.x-dir*6,e.y-20,-dir,8);nums.push({x:e.x,y:e.y-e.h-14,v:'Armored',t:.6,c:'#9a94a2'})}}
  if(e.t==='warden'&&FRONT_STATES.includes(e.state)&&e.face===-dir&&kind!=='blast'){
    if(kind!=='heavy'){e.flash=.05;sfx.clang();sparks(e.x+e.face*8,e.y-18,-dir,10);nums.push({x:e.x,y:e.y-e.h-4,v:'Blocked',t:.7,c:'#9a94a2'});
      if(P){P.vx=-dir*90;P.sta=Math.max(0,P.sta-10);P.staDelay=.6}hitstop=.022;return false}
    d*=.5;e.state='stagger';e.st=0;sfx.clang();nums.push({x:e.x,y:e.y-e.h-14,v:'Guard broken',t:.9,c:C.emberL})}
  d=Math.round(d);e.hp-=d;if(game.state==='title'&&BOSS[e.t])e.hp=Math.max(e.hp,Math.round(e.max*.3));e.flash=.1;e.active=true;sfx.impact(SND[e.t]||e.t);
  nums.push({x:e.x,y:e.y-e.h-4,v:d,t:.8,c:crit?'#ffd36a':'#efe6d6',crit});
  sparks(e.x-dir*3,e.y-e.h*.6,dir,crit?14:7);blood(e.x,e.y-e.h*.6,dir,5,e.t==='archer'||e.t==='matron'?C.boneD:e.t==='king'||e.t==='seraph'||e.t==='wraith'?C.ember:e.t==='hound'?'#4a3a3a':null);
  if(e.hp<=0){killFoe(e,dir);return true}
  if(BOSS[e.t]||e.t==='warden'||e.t==='golem'||e.t==='brute'||e.t==='bulwark'||(e.t==='flail'&&e.state==='spin'))return true;
  e.vx=dir*kb*(e.t==='hollow'?.8:1);if(e.onGround&&!groundAhead(e,dir))e.vx=0;if(kb>150)e.vy=-100;
  if(!['strike','hop'].includes(e.state)){e.state='hurt';e.st=0}e.face=-dir;return true}
function killFoe(e,dir){e.state='dead';e.st=0;if(game.state!=='title'){game.kills++;dropSouls(e.x,e.y-e.h/2,e.souls)}else for(let i=0;i<10;i++)emberP(e.x,e.y-rnd()*e.h,18);
  for(let i=0;i<12;i++)part(e.x+(rnd()-.5)*e.w,e.y-rnd()*e.h,(rnd()-.5)*40,-20-rnd()*40,.9+rnd()*.6,'#5e5a62',{g:-5,drag:1.5});
  if(BOSS[e.t]){sfx.bossDie();shake=10;hitstop=.3;for(let i=0;i<70;i++)emberP(e.x,e.y-rnd()*44,34);
    game.flags[BOSS[e.t]]=true;dropShard(e);if(arena){arena.locked=false;for(const gx of arena.gates)for(let y=13;y<16;y++)grid[y*MW+gx]=0}
    if(e.t==='king')banner('The Ashen King Falls','Behind the throne, a stair descends into the dark.');
    else if(e.t==='matron'){banner('The Grave Matron Falls','The choir is silent. The way deeper opens.');for(const f of foes)if(f.summoned&&f.state!=='dead')killFoe(f,1)}
    else if(e.t==='seraph')banner('The Cinder Seraph Falls','Beyond the pyre a stair glows red. The forge waits below.');
    else if(e.t==='forgemaster')banner('The Forgemaster Falls','The anvil goes cold. The way on opens.');
    else if(e.t==='queen')banner('The Ember Queen Falls','Above her furnace, a stair climbs toward daylight.');
    else if(e.t==='bellwarden')banner('The Bellwarden Falls','The bell is silent. The bridge lies ahead.');
    else if(e.t==='drake')banner('Ignis Falls','Below the spire, a stair leads down to the outer ramparts.');
    else if(e.t==='marshal')banner('The Iron Marshal Falls','His muster scatters. The curtain wall lies open.');
    else{banner('The Siege Colossus Falls','The great gate stands open. Cinderkeep is yours.');game.wonT=5}
    for(const f of foes)if(f.summoned&&f.state!=='dead'&&f!==e)killFoe(f,1)}
  if(P&&P.drinkLv&&P.state!=='death'&&P.hp>0){const h=3+3*P.drinkLv;if(P.hp<P.maxHp){P.hp=Math.min(P.maxHp,P.hp+h);nums.push({x:P.x,y:P.y-36,v:'+'+h,t:.7,c:'#8fd07a'})}}
  if(BOSS[e.t]){}
  else sfx.foeDie({hollow:'husk',warden:'husk',golem:'husk',reaver:'husk',halberd:'husk',priest:'hound',imp:'hound',bomber:'hound',wraith:'wisp',crow:'wisp',brute:'husk',bulwark:'husk',flail:'husk',marshal:'husk',colossus:'husk'}[e.t]||e.t)}
function dropShard(e){const id='shard_'+BOSS[e.t];if(game.flags.taken.includes(id)||items.some(it=>it.id===id))return;
  const x=arena?clamp(e.x,(Math.min(...arena.gates)+2)*T,(arena.x1-1)*T):e.x;items.push({kind:'shard',x,y:Math.min(e.y-10,16*T-10),vx:0,vy:-140,w:8,h:8,id});
  for(let i=0;i<30;i++)part(x,e.y-20,(rnd()-.5)*120,-40-rnd()*120,.8,i&1?'#b8a0ff':'#8fd0ff',{g:200,glow:1});tempLights.push({x,y:e.y-20,r:90,life:.8,max:.8})}
function dropSouls(x,y,total){const n=Math.min(total,32);let left=total;for(let i=0;i<n;i++){const v=i===n-1?left:Math.floor(total/n);left-=v;
  parts.push({x,y,vx:(rnd()-.5)*170,vy:-60-rnd()*100,life:4,max:4,c:C.emberL,g:260,s:1,home:1,drag:2,glow:1,val:v})}}

function interact(){const p=P;let best=null,bd=1e9;
  for(const it of items){const d=Math.abs(it.x-p.x);if(d<16&&Math.abs(it.y-p.y)<24&&d<bd){best={o:it,type:'item'};bd=d}}
  for(const o of objs){if(o.kind==='note'||o.kind==='vent'||o.kind==='gust'||o.kind==='remnant'||(o.kind==='chest'&&o.open))continue;if((o.kind==='bar'||o.kind==='lockedDoor')&&game.flags.doorOpen)continue;
    const r=o.kind==='shrine'?22:o.kind==='chest'?16:18,d=Math.abs(o.x-p.x);if(d<r&&Math.abs(o.y-p.y)<24&&d<bd){best={o,type:o.kind};bd=d}}
  if(!best)return;const o=best.o;
  if(best.type==='item'){items.splice(items.indexOf(o),1);if(o.id)game.flags.taken.push(o.id);sfx.pick();for(let i=0;i<20;i++)emberP(p.x,p.y-14,16);
    if(o.kind==='scroll')grantScroll();
    else if(o.kind==='shard'){p.shards=(p.shards||0)+1;sfx.upgrade();toast(`Weapon Shard: temper your ${wname()} at a shrine (${p.shards} held).`);for(let i=0;i<24;i++)part(p.x,p.y-16,(rnd()-.5)*90,-30-rnd()*80,.7,i&1?'#b8a0ff':'#8fd0ff',{g:60,glow:1})}
    else if(o.kind==='vial'){if(p.maxFlasks<4){p.maxFlasks++;p.flasks++;toast('Ember Vial: you can carry another flask.')}else{p.flasks=p.maxFlasks;toast('Ember Vial: your flasks are refilled.')}}
    else if(o.kind==='souls'){dropSouls(o.x,o.y-6,o.v);toast(`A cache of ${o.v} souls.`)}
    else if(o.kind==='whetstone'){dropSouls(o.x,o.y-6,400);toast('An Ashen Whetstone crumbles into 400 souls. Only shards can temper a weapon now.')}}
  else if(best.type==='chest'){o.open=true;game.flags.opened.push(o.id);sfx.chest();for(let i=0;i<14;i++)emberP(o.x,o.y-8,14);if(o.loot==='scroll')grantScroll();else{dropSouls(o.x,o.y-8,o.v||30);toast(`The chest holds ${o.v||30} souls.`)}}
  else if(best.type==='shrine'){game.restLantern=o;openMenu('rest')}
  else if(best.type==='descent'){if(game.flags[o.flag])goToLevel(o.to);else{toast(['','An iron grate seals the stair. The King still reigns.','An iron grate seals the stair. The Seraph still burns.','A gate bars the way up. The Queen still burns.','A grate bars the stair. The drake still rules the spire.'][o.to]);sfx.clang()}}
  else if(best.type==='lockedDoor'){toast('The door is barred from the other side.');sfx.clang()}
  else if(best.type==='bar')openShortcut(true)}
/* =========================================================
   LEVEL 2: THE DEPTHS. New foes (Ash Hound, Pyre Priest, Cinder Wraith)
   and bosses (the Grave Matron, the Cinder Seraph). Every attack is telegraphed.
   ========================================================= */
function buildL2({S,D,O,I,E,zone}){
  /* ---- A: THE BONE STAIR ---- a shrine at the foot of the stair, a hound pack, a spike pit, an archer ledge, an abyss */
  zone(0,69,.72,0);S(0,0,1,ROWS-1,1);S(2,0,69,3,1);
  for(let x=2;x<70;x++)if((x*13)%7<2)S(x,4,x,4,1);
  D('stairDown',4,16);O('shrine',10,16,{label:'Shrine of the Deep'});
  D('torch',7,11);D('torch',14,11);D('skullwall',18,16);
  S(22,16,25,17,0);S(22,17,25,17,3);
  D('torch',28,11);D('torch',34,11);D('torch',41,9);E('hound',32,16,3);E('hound',36,16,3);
  S(39,14,40,15,1);S(43,11,48,11,2);E('archer',46,11,2);D('bonepile',45,16);D('torch',50,8);
  S(52,16,55,ROWS-1,0);D('emberglow',53,21);D('chain',54,4,{len:50,end:'cage'});
  S(59,13,60,15,1);E('hollow',64,16,3);O('chest',67,16,{id:'l2_a_chest',loot:'souls',v:80});D('torch',62,11);D('torch',68,11);

  /* ---- B: THE OSSUARY HALLS ---- a pyre priest on a dais, a spiked hall crossed on iron walkways, a warden, hounds, a crypt above, a false wall */
  zone(70,169,.75,0);S(70,0,169,3,1);S(70,4,71,10,1);
  D('skullwall',76,16);D('skullwall',98,16);D('skullwall',134,16);D('torch',74,11);D('torch',84,11);D('torch',101,11);
  E('hollow',80,16,3);
  S(88,14,96,15,1);E('priest',92,14,3);D('candles',89,14);D('candles',95,14);
  E('hollow',104,16,3);
  S(110,15,124,15,3);S(107,13,112,13,2);S(115,12,120,12,2);S(123,13,128,13,2);E('archer',127,13,1);
  for(const x of [109,117,125])D('chain',x,4,{len:30,end:null});D('torch',114,9);D('torch',122,9);
  E('warden',140,16,3);D('torch',137,12);D('torch',146,13);D('torch',156,13);D('brazier',131,16);
  S(143,4,167,10,1);S(145,5,161,9,0);S(158,10,159,10,2);S(155,13,158,13,2);
  O('chest',148,10,{id:'l2_b_chest',loot:'scroll'});D('bones',151,10);D('candles',153,10);D('torch',147,7);D('banner',156,5);
  S(162,7,162,9,5);S(163,7,166,9,0);I('vial',165,9,{id:'l2_b_vial'});I('souls',164,9,{v:120,id:'l2_b_cache'});
  E('hound',150,16,2);E('hound',154,16,2);D('torch',164,13);

  /* ---- C: THE MATRON'S CHOIR ---- a wraith in the nave, then the Grave Matron's arena */
  zone(170,239,.74,0);S(170,0,239,3,1);
  D('torch',172,11);D('torch',176,11);D('torch',180,11);D('brazier',188,16);D('brazier',234,16);E('wraith',178,11,3);D('chain',175,4,{len:40,end:'cage'});
  S(184,4,185,12,1);S(237,4,238,12,1);
  S(194,11,199,11,2);S(224,11,229,11,2);S(209,12,214,12,2);
  D('organ',211,16);for(const x of [190,203,220,233])D('torch',x,10);for(const x of [192,201,222,231])D('candles',x,16);
  D('window',198,5);D('window',224,5);D('chain',206,4,{len:44,end:'cage'});D('chain',217,4,{len:30,end:null});
  E('matron',222,16,0);
  arenas.push({gates:[185,237],trigger:191*T,x1:236,boss:'matron',flag:'matronDead',name:'The Grave Matron',sub:'She sings the dead to sleep'});

  /* ---- D: THE CINDER WELL ---- bridges over the burning well, wraiths, a priest on a ledge, two wardens in a low hall, the last shrine */
  zone(240,329,.76,0);S(240,0,329,3,1);
  D('torch',242,11);D('brazier',264,16);D('torch',282,11);D('torch',294,11);D('torch',320,11);
  S(246,16,262,ROWS-1,0);S(246,16,251,16,4);S(254,16,259,16,4);
  D('emberglow',249,21);D('emberglow',257,21);D('emberglow',261,21);E('wraith',252,10,4);E('wraith',259,8,4);
  for(const x of [247,253,259])D('chain',x,4,{len:60,end:null});
  S(268,13,270,13,2);S(272,13,279,15,1);E('priest',276,13,2);D('candles',273,13);D('torch',274,9);
  S(283,16,292,ROWS-1,0);S(285,13,287,13,2);S(290,12,292,12,2);D('emberglow',288,21);
  S(296,4,318,10,1);E('warden',302,16,3);E('warden',312,16,3);D('torch',299,13);D('torch',308,13);D('torch',316,13);
  E('hound',321,16,2);
  O('shrine',325,16,{label:'Shrine of Embers'});D('statue',322,16,{k:1});D('statue',328,16,{k:1});

  /* ---- E: THE SERAPH'S PYRE ---- the final arena */
  zone(330,399,.72,0);S(330,0,399,2,1);S(398,0,399,ROWS-1,1);S(330,3,331,12,1);
  S(343,12,348,12,2);S(360,11,365,11,2);S(377,12,382,12,2);
  for(const [x,h] of [[340,120],[356,90],[372,140],[388,100]])D('brokenPillar',x,16,{h});
  D('pyre',392,16);for(const x of [337,352,368,384])D('torch',x,10);D('window',347,4);D('window',379,4);
  D('chain',351,3,{len:40,end:'cage'});D('chain',369,3,{len:56,end:null});
  E('seraph',372,9,0);O('descent',395,16,{to:2,flag:'seraphDead'});
  arenas.push({gates:[331],trigger:338*T,x1:397,boss:'seraph',flag:'seraphDead',name:'The Cinder Seraph',sub:'Warden of the last pyre'});
  return{x:5*T+8,y:16*T};
}
/* ---------- shared helpers for the new foes ---------- */
function groundY(x,fromY){const tx=Math.floor(x/T);for(let ty=Math.max(0,Math.floor(fromY/T));ty<ROWS;ty++){const c=tileAt(tx,ty);if(solidCode(c)||c===2)return ty*T}return null}
function standable(x,y){const tx=Math.floor(x/T),ty=Math.floor(y/T),c=tileAt(tx,ty);return(solidCode(c)||c===2)&&!solidCode(tileAt(tx,ty-1))&&!solidCode(tileAt(tx,ty-2))&&tileAt(tx,ty-1)!==3&&tileAt(tx,ty-1)!==7}
function flyTo(e,dt,tx,ty,acc,max){e.vx+=((tx-e.x)*acc-e.vx)*Math.min(1,dt*3);e.vy+=((ty-e.y)*acc-e.vy)*Math.min(1,dt*3);
  const sp=Math.hypot(e.vx,e.vy);if(sp>max){e.vx*=max/sp;e.vy*=max/sp}e.x+=e.vx*dt;e.y+=e.vy*dt}
function pillar(kind,x,floor,delay,dmg){shots.push({kind,x,y:floor,floor,delay,life:kind==='hand'?.45:.5,dmg,from:'e',vx:0,vy:0,g:0,w:12,h:kind==='hand'?30:44,hit:false})}

/* ---------- ASH HOUND: stalks at a distance, crouches, then lunges ---------- */
function aiHound(e,dt,dx,dy,adx,sees,leashed){
  const fp=dx>0?1:-1;
  switch(e.state){
    case 'patrol':if(sees){e.state='alert';e.st=0;e.face=fp;sfx.growl()}else patrolArea(e,dt);return;
    case 'alert':walker(e,dt,0,0);e.face=fp;if(e.st>.35)e.state='stalk';return;
    case 'return':if(sees&&!leashed){e.state='stalk';return}goHome(e,dt);return;
    case 'stalk':{
      if(!sees){e.lost+=dt;if(e.lost>1.5){e.state='return';e.lost=0}}else e.lost=0;
      if(leashed){e.state='return';return}
      const want=adx>95?fp:adx<55?-fp:0;walker(e,dt,want,e.speed*(want===fp?1:.6));e.face=fp;
      if(e.cd<=0&&adx<125&&Math.abs(dy)<18&&e.onGround){const land=e.x+fp*Math.min(adx+12,135);
        if(standable(land,e.y)){e.state='crouch';e.st=0;e.lx=land;sfx.growl()}else e.cd=.5}
      return}
    case 'crouch':walker(e,dt,0,0);if(e.st>.5){e.state='lunge';e.st=0;e.hitDone=false;e.vx=e.face*Math.max(110,Math.abs(e.lx-e.x)/.42);e.vy=-200;e.onGround=false;sfx.lunge()}return;
    case 'lunge':move(e,dt);if(!e.hitDone&&hitPlayerBox(e.x-8,e.y-12,e.x+8,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}
      if(e.onGround&&e.st>.12){e.state='recover';e.st=0;e.vx=0;dust(e.x,e.y,4)}return;
    case 'recover':walker(e,dt,0,0);if(e.st>.85){e.state='stalk';e.cd=.9+rnd()*.9}return;
  }}
/* ---------- PYRE PRIEST: calls fire pillars under you, bursts and blinks away when crowded ---------- */
function aiPriest(e,dt,dx,dy,adx,sees,leashed){
  const fp=dx>0?1:-1;e.cd2=(e.cd2||0)-dt;
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);if(rnd()<dt*.2)e.face*=-1;if(sees){e.state='chase';e.face=fp;sfx.chant()}return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees){e.lost+=dt;if(e.lost>2.2){e.state='return';e.lost=0}}else e.lost=0;
      e.face=fp;
      if(adx<58&&Math.abs(dy)<26&&e.cd2<=0){e.state='burstW';e.st=0;sfx.chant();return}
      walker(e,dt,adx>210?fp:0,e.speed);
      if(e.cd<=0&&sees){e.state='cast';e.st=0;e.cast=false;e.tx=P.x;sfx.chant()}return;
    case 'cast':walker(e,dt,0,0);e.face=fp;if(e.st<.35)e.tx=P.x+P.vx*.25;
      if(e.st>=.35&&!e.cast){e.cast=true;const fy=groundY(e.tx,P.y-20);if(fy!==null)pillar('pillar',e.tx,fy,.75,e.dmg)}
      if(e.st>1.2){e.state='castR';e.st=0}return;
    case 'castR':walker(e,dt,0,0);if(e.st>.6){e.state='chase';e.cd=2+rnd()*.8}return;
    case 'burstW':walker(e,dt,0,0);if(rnd()<.7){const a=rnd()*Math.PI*2;part(e.x+Math.cos(a)*40,e.y-14+Math.sin(a)*24,-Math.cos(a)*70,-Math.sin(a)*40,.5,'#8a8590',{g:0})}
      if(e.st>.55){if(Math.hypot(P.x-e.x,P.y-e.y)<52)hurtPlayer(e.dmg*.6,fp);sfx.boom();tempLights.push({x:e.x,y:e.y-14,r:80,life:.3,max:.3});
        for(let i=0;i<26;i++){const a=rnd()*Math.PI*2;part(e.x,e.y-14,Math.cos(a)*140,Math.sin(a)*90,.5,rnd()<.5?C.ember:'#8a8590',{g:0,drag:3,glow:1})}e.state='blinkOut';e.st=0;e.cd2=4}return;
    case 'blinkOut':walker(e,dt,0,0);e.alpha=Math.max(0,1-e.st/.3);if(e.st>.3){const s=findBlink(e);if(s){e.x=s.x;e.y=s.y}e.state='blinkIn';e.st=0;sfx.blink()}return;
    case 'blinkIn':walker(e,dt,0,0);e.alpha=Math.min(1,e.st/.3);if(e.st>.3){e.alpha=1;e.state='chase';e.cd=Math.min(e.cd,.9)}return;
  }}
function findBlink(e){const away=P.x>e.x?-1:1;
  for(const d of [130,110,150,90])for(const s of [away,-away]){const x=P.x+s*d;if(Math.abs(x-e.home.x)>e.range+220)continue;
    for(const yy of [e.y,e.y-T,e.y+T,e.y-2*T,e.y+2*T,e.y-3*T])if(standable(x,yy))return{x:Math.floor(x/T)*T+8,y:yy}}return null}
/* ---------- CINDER WRAITH: hovers over pits, marks a line, then dives through it ---------- */
function aiWraith(e,dt,dx,dy,adx){
  const dist=Math.hypot(dx,dy+10),sees=P.state!=='death'&&LIVE()&&dist<200&&Math.abs(e.x-e.home.x)<e.range+260;
  if(rnd()<dt*10)part(e.x+(rnd()-.5)*8,e.y-2,(rnd()-.5)*6,8+rnd()*8,.6,rnd()<.5?'#3a3442':'#5e5a62',{g:0,drag:1});
  switch(e.state){
    case 'patrol':flyTo(e,dt,e.home.x+Math.sin(e.t2*.7)*30,e.home.y+Math.sin(e.t2*2)*6,1.2,40);if(Math.abs(e.vx)>4)e.face=e.vx>0?1:-1;if(sees){e.state='chase';sfx.wail()}break;
    case 'return':flyTo(e,dt,e.home.x,e.home.y,1.4,70);if(Math.hypot(e.x-e.home.x,e.y-e.home.y)<10)e.state='patrol';if(sees)e.state='chase';break;
    case 'chase':{if(!sees){e.lost+=dt;if(e.lost>2){e.state='return';e.lost=0}}else e.lost=0;
      const side=e.x<P.x?-1:1;flyTo(e,dt,P.x+side*72,P.y-46+Math.sin(e.t2*2.4)*8,1.6,e.speed*1.6);e.face=P.x>e.x?1:-1;
      if(e.cd<=0&&dist<170){e.state='markW';e.st=0;e.vx*=.3;e.vy*=.3;sfx.wail()}break}
    case 'markW':e.vx*=Math.pow(.02,dt);e.vy*=Math.pow(.02,dt);e.x+=e.vx*dt;e.y+=e.vy*dt;e.face=P.x>e.x?1:-1;if(e.st<.45){e.tx=P.x;e.ty=P.y-12}
      if(e.st>.72){const a=Math.atan2(e.ty-(e.y-7),e.tx-e.x);e.vx=Math.cos(a)*255;e.vy=Math.sin(a)*255;e.state='dive';e.st=0;e.hitDone=false;sfx.dive()}break;
    case 'dive':e.x+=e.vx*dt;e.y+=e.vy*dt;if(rnd()<.6)emberP(e.x,e.y-6,4);
      if(!e.hitDone&&hitPlayerBox(e.x-6,e.y-13,e.x+6,e.y)){e.hitDone=true;hurtPlayer(e.dmg,Math.sign(e.vx)||1)}
      if(e.st>.55||solidCode(tileAt(Math.floor(e.x/T),Math.floor(e.y/T)))){e.state='rest';e.st=0;e.vx*=.2;e.vy=-20}break;
    case 'rest':e.vx*=Math.pow(.1,dt);e.vy*=Math.pow(.1,dt);e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.st>.95){e.state='chase';e.cd=1.3+rnd()*.8}break;
  }
  e.x=clamp(e.x,12,MW*T-12);e.y=clamp(e.y,5*T,16*T-2);
  for(let n=0;n<6&&solidCode(tileAt(Math.floor(e.x/T),Math.floor((e.y-7)/T)));n++)e.y-=4}
/* ---------- THE GRAVE MATRON: bone lances, grasping hands, a blink behind you, and her children ---------- */
function aiMatron(e,dt,dx,dy,adx){
  const fp=dx>0?1:-1,G=16*T,L0=(arena.gates[0]+2)*T,L1=(arena.x1-2)*T;
  if(e.phase===1&&e.hp<e.max*.5){e.phase=2;banner('','The Matron calls her children.');sfx.wail();shake=5;summon(e)}
  const sp=e.phase===2?.75:1;
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);return;
    case 'intro':walker(e,dt,0,0);if(e.st>1.6){e.state='chase';e.cd=.6}return;
    case 'chase':{e.face=fp;const want=adx>150?fp:adx<70?-fp:0;walker(e,dt,want,e.speed);e.face=fp;
      if(e.cd<=0){const r=rnd();
        if(adx<56)e.state='sweepW';else if(r<.38)e.state='lanceW';else if(r<.72)e.state='handsW';else e.state='blinkOut';
        e.st=0;e.face=fp;if(e.state!=='blinkOut')sfx.bossWind()}return}
    case 'sweepW':walker(e,dt,0,0);if(e.st>.62*sp){e.state='sweep';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'sweep':walker(e,dt,0,0);if(!e.hitDone&&e.st<.2){const x0=e.face>0?e.x-10:e.x-56,x1=e.face>0?e.x+56:e.x+10;if(hitPlayerBox(x0,e.y-42,x1,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}}
      if(e.st>.7*sp){e.state='chase';e.cd=.7+rnd()*.5}return;
    case 'lanceW':walker(e,dt,0,0);e.face=fp;if(e.st>.78*sp){const n=e.phase===2?5:3,base=Math.atan2(P.y-14-(e.y-34),P.x-e.x);
        for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*.16;shots.push({x:e.x+e.face*10,y:e.y-34,vx:Math.cos(a)*215,vy:Math.sin(a)*215,g:0,from:'e',kind:'bone',dmg:e.dmg*.75,life:2.2,w:8,h:3})}
        sfx.bow();sfx.lance();e.state='lanceR';e.st=0}return;
    case 'lanceR':walker(e,dt,0,0);if(e.st>.6*sp){e.state='chase';e.cd=.6+rnd()*.5}return;
    case 'handsW':walker(e,dt,0,0);if(e.st>.62*sp){const n=e.phase===2?8:6;for(let i=0;i<n;i++){const x=e.x+e.face*(30+i*26);if(x<L0||x>L1)break;pillar('hand',x,G,.35+i*.14,e.dmg*.85)}e.state='handsR';e.st=0}return;
    case 'handsR':walker(e,dt,0,0);if(e.st>1.1*sp){e.state='chase';e.cd=.5}return;
    case 'blinkOut':walker(e,dt,0,0);e.alpha=Math.max(0,1-e.st/.4);if(e.st>.4){e.bx=clamp(P.x-P.face*48,L0,L1);e.state='blinkMark';e.st=0}return;
    case 'blinkMark':e.alpha=0;if(rnd()<.8)part(e.bx+(rnd()-.5)*20,G-rnd()*6,(rnd()-.5)*10,-20-rnd()*20,.6,'#9a94a2',{g:-5});
      if(e.st>.55*sp){e.x=e.bx;e.y=G;e.vx=0;e.state='blinkIn';e.st=0;sfx.blink()}return;
    case 'blinkIn':e.alpha=Math.min(1,e.st/.25);walker(e,dt,0,0);e.face=P.x>e.x?1:-1;if(e.st>.25){e.alpha=1;e.state='sweepW';e.st=0;sfx.bossWind()}return;
  }}
function summon(e){for(const s of [-1,1]){const x=clamp(e.x+s*120,(arena.gates[0]+3)*T,(arena.x1-3)*T);const f=makeFoe({t:'hollow',x,y:16*T,range:6*T});
  f.summoned=true;f.active=true;f.state='alert';f.st=0;foes.push(f);for(let i=0;i<20;i++)part(x+(rnd()-.5)*12,16*T-rnd()*24,0,-20,.8,'#9a94a2',{g:-5})}}
/* ---------- THE CINDER SERAPH: feather volleys, marked dives, a ground sweep, a pyre rain ---------- */
function aiSeraph(e,dt,dx,dy,adx){
  const fp=dx>0?1:-1,G=16*T,L0=(arena.gates[0]+3)*T,L1=(arena.x1-3)*T;
  if(e.phase===1&&e.hp<e.max*.5){e.phase=2;banner('','The Seraph burns.');sfx.roar();shake=7;for(let i=0;i<40;i++)emberP(e.x,e.y-20-rnd()*20,30)}
  const ph2=e.phase===2,sp=ph2?.75:1;e.pyreCd=(e.pyreCd||0)-dt;
  const hover=ty=>{const tx=clamp(P.x+(e.x<P.x?-70:70),L0,L1);flyTo(e,dt,tx,ty+Math.sin(e.t2*2)*5,1.5,e.speed*1.5);e.face=fp};
  if(ph2&&rnd()<dt*12)emberP(e.x+(rnd()-.5)*30,e.y-20,6);
  switch(e.state){
    case 'patrol':return;
    case 'intro':e.vx=0;e.y+=(G-80-e.y)*Math.min(1,dt*1.5);if(e.st>1.8){e.state='hover';e.cd=.8}return;
    case 'hover':hover(G-78);if(e.cd<=0){const r=rnd();
        if(ph2&&e.pyreCd<=0&&r<.35){e.state='pyreW';e.pyreCd=7}else if(r<.5)e.state='featherW';else e.state='markW';
        e.st=0;sfx.bossWind()}return;
    case 'featherW':hover(G-84);if(e.st>.7*sp){const n=ph2?7:5,base=Math.atan2(P.y-14-(e.y-24),P.x-e.x);
        for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*.13;shots.push({x:e.x,y:e.y-24,vx:Math.cos(a)*215,vy:Math.sin(a)*215,g:0,from:'e',kind:'feather',dmg:e.dmg*.6,life:2.4,w:6,h:3})}
        sfx.feather();e.state='featherR';e.st=0}return;
    case 'featherR':hover(G-80);if(e.st>.55*sp){e.state='hover';e.cd=.5+rnd()*.5}return;
    case 'markW':hover(G-96);if(e.st<.5*sp)e.tx=clamp(P.x,L0,L1);
      if(e.st>.85*sp){e.state='dive';e.st=0;e.hitDone=false;const ddx=e.tx-e.x,ddy=G-e.y,d=Math.hypot(ddx,ddy)||1;e.vx=ddx/d*330;e.vy=ddy/d*330;e.face=ddx>0?1:-1;sfx.dive()}return;
    case 'dive':e.x+=e.vx*dt;e.y+=e.vy*dt;if(rnd()<.8)emberP(e.x,e.y-20,10);
      if(!e.hitDone&&hitPlayerBox(e.x-12,e.y-36,e.x+12,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}
      if(e.y>=G||e.st>1.2){e.y=G;e.vx=e.vy=0;e.state='landed';e.st=0;shake=8;sfx.bossSlam();dust(e.x,G,20);
        for(const d of [-1,1])shots.push({x:e.x+d*14,y:G,vx:d*(ph2?185:150),vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.7,life:3,w:10,h:14});
        if(hitPlayerBox(e.x-22,e.y-40,e.x+22,e.y))hurtPlayer(e.dmg,P.x>e.x?1:-1)}return;
    case 'landed':e.vx=0;if(e.st>1.3*sp){if(adx<66){e.state='sweepW';e.st=0;e.face=fp;sfx.bossWind()}else{e.state='rise';e.st=0;sfx.flap()}}return;
    case 'sweepW':if(e.st>.6*sp){e.state='sweep';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'sweep':if(!e.hitDone&&e.st<.22&&hitPlayerBox(e.x-58,e.y-36,e.x+58,e.y)){e.hitDone=true;hurtPlayer(e.dmg,P.x>e.x?1:-1)}if(e.st>.7){e.state='rise';e.st=0;sfx.flap()}return;
    case 'rise':e.y-=90*dt;if(e.y<G-76||e.st>1){e.state='hover';e.cd=.6;e.vy=0}return;
    case 'pyreW':hover(G-110);if(e.st>.8){const xs=[P.x];for(let i=0;i<5;i++)xs.push(P.x+(i-2)*52+(rnd()-.5)*16);
        for(const x of xs){const cx=clamp(x,L0,L1),fy=groundY(cx,P.y-20);pillar('pillar',cx,fy??G,.7+rnd()*.35,e.dmg*.8)}e.state='pyreR';e.st=0}return;
    case 'pyreR':hover(G-100);if(e.st>1.2){e.state='hover';e.cd=.6}return;
  }}

/* =========================================================
   LEVEL 3: THE HOLLOW FORGE. New foes (Slag Golem, Ember Imp, Chain Reaver),
   bosses (the Forgemaster, the Ember Queen), and hazards (molten slag, fire vents, burning ground).
   ========================================================= */
function buildL3({S,D,O,I,E,zone}){
  /* ---- A: THE SLAG GATE ---- a shrine, a slag pool, an imp ledge, two soldiers, a vent, a molten chasm, a reaver */
  zone(0,79,.72,0);S(0,0,1,ROWS-1,1);S(2,0,79,3,1);
  D('stairDown',4,16);O('shrine',10,16,{label:'Shrine of the Forge'});D('torch',7,11);D('torch',14,11);D('gears',17,16);
  S(20,16,23,17,0);S(20,17,23,17,7);
  S(28,12,33,12,2);E('imp',30,12,2);D('torch',26,9);D('torch',35,9);
  E('hollow',38,16,3);E('hollow',42,16,3);D('torch',40,11);
  O('vent',46,16,{period:3,phase:1.5});
  S(50,16,57,ROWS-1,0);S(53,13,54,13,2);D('emberglow',51,21);D('emberglow',56,21);D('chain',53,4,{len:140,end:null});D('chain',54,4,{len:140,end:null});
  D('pipes',62,16);E('reaver',67,16,3);O('chest',75,16,{id:'l3_a_chest',loot:'souls',v:150});D('torch',70,11);D('torch',77,11);

  /* ---- B: THE BELLOWS HALLS ---- a timed vent corridor, a slag golem, an imp perch, a hidden smithy with a whetstone, a reaver and hounds */
  zone(80,179,.74,0);S(80,0,179,3,1);S(80,4,81,10,1);
  D('bellows',86,16);D('torch',84,11);
  for(const [x,ph] of [[90,0],[95,.75],[100,1.5],[105,2.25]])O('vent',x,16,{period:3,phase:ph});
  D('torch',93,11);D('torch',103,11);D('pipes',110,16);
  E('golem',119,16,3);D('gears',114,16);D('torch',112,11);D('torch',125,11);
  S(128,11,134,11,2);E('imp',131,11,2);S(136,13,138,13,2);
  S(140,4,166,10,1);S(142,5,160,9,0);S(157,10,158,10,2);S(154,13,157,13,2);
  O('chest',145,10,{id:'l3_b_chest',loot:'scroll'});D('candles',148,10);D('torch',144,7);D('anvil',151,10);
  S(161,7,161,9,5);S(162,7,165,9,0);I('whetstone',164,9,{id:'l3_b_whet'});I('souls',163,9,{v:200,id:'l3_b_cache'});
  E('reaver',150,16,3);E('hound',168,16,2);E('hound',172,16,2);D('torch',158,13);D('torch',170,13);
  O('vent',176,16,{period:2.6,phase:0});

  /* ---- C: THE ANVIL COURT ---- a priest on a dais, then the Forgemaster's arena */
  zone(180,259,.72,0);S(180,0,259,3,1);
  D('torch',182,11);S(186,14,192,15,1);E('priest',189,14,3);D('candles',187,14);D('candles',191,14);
  S(196,4,197,12,1);S(257,4,258,12,1);
  S(205,11,210,11,2);S(244,11,249,11,2);
  D('furnace',227,16);D('bigAnvil',214,16);D('bellows',238,16);for(const x of [201,219,236,253])D('torch',x,10);D('chain',211,4,{len:50,end:'hook'});D('chain',247,4,{len:36,end:'cage'});
  for(const x of [204,214,226,238,250])D('ventGrate',x,16);
  E('forgemaster',245,16,0);
  arenas.push({gates:[197,257],trigger:202*T,x1:256,boss:'forgemaster',flag:'forgeDead',name:'The Forgemaster',sub:'He struck every blade in Cinderkeep',vents:[204,214,226,238,250]});

  /* ---- D: THE CHAIN SHAFTS ---- hanging platforms over a slag lake, wraiths and an imp, a golem with a reaver, an archer, a warden, the last shrine */
  zone(260,359,.76,0);S(260,0,359,3,1);D('torch',262,11);
  S(266,16,298,ROWS-1,0);
  for(const [x0,r] of [[268,13],[274,11],[280,13],[286,10],[292,12]]){S(x0,r,x0+3,r,2);D('chain',x0,4,{len:(r-4)*T-1,end:null});D('chain',x0+3,4,{len:(r-4)*T-1,end:null})}
  for(const x of [270,277,283,289,296])D('emberglow',x,21);
  E('wraith',278,8,4);E('wraith',291,7,4);E('imp',287,10,1);
  D('torch',300,11);E('golem',308,16,3);E('reaver',317,16,3);D('torch',312,11);
  S(321,11,327,11,2);E('archer',324,11,2);
  S(331,4,345,10,1);E('warden',338,16,3);D('torch',333,13);D('torch',343,13);
  O('vent',347,16,{period:3.2,phase:.5});
  O('shrine',352,16,{label:'Shrine of the Crown'});D('statue',349,16,{k:1});D('statue',355,16,{k:1});

  /* ---- E: THE CROWN FURNACE ---- the final arena */
  zone(360,439,.7,0);S(360,0,439,2,1);S(438,0,439,ROWS-1,1);S(360,3,361,12,1);
  S(372,11,377,11,2);S(398,12,403,12,2);S(421,11,426,11,2);
  D('furnace',430,16);for(const [x,h] of [[368,110],[386,140],[412,90]])D('brokenPillar',x,16,{h});
  for(const x of [366,381,395,409,424])D('torch',x,10);D('window',375,4);D('window',418,4);D('chain',391,3,{len:40,end:'cage'});
  E('queen',410,16,0);O('descent',435,16,{to:3,flag:'queenDead',up:1});
  arenas.push({gates:[361],trigger:367*T,x1:437,boss:'queen',flag:'queenDead',name:'The Ember Queen',sub:'Keeper of the last flame'});
  return{x:5*T+8,y:16*T};
}
function puddle(x,y,life,dmg){shots.push({kind:'puddle',x,y,life,max:life,w:26,tick:0,dmg,from:'e',vx:0,vy:0,g:0})}
function lobAt(sx0,sy0,tx,ty,t,G2){return{vx:(tx-sx0)/t,vy:(ty-sy0-.5*G2*t*t)/t}}
/* ---------- SLAG GOLEM: armored; a long pound, then it vents its core and takes double damage ---------- */
function aiGolem(e,dt,dx,dy,adx,sees,leashed){
  const side=dx>0?1:-1;
  switch(e.state){
    case 'patrol':if(sees){e.state='chase';sfx.foe();sfx.clang()}else patrolArea(e,dt);return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees){e.lost+=dt;if(e.lost>2.2){e.state='return';e.lost=0}}else e.lost=0;
      if(leashed){e.state='return';return}
      if(side!==e.face){e.state='turn';e.st=0;walker(e,dt,0,0);return}
      walker(e,dt,adx>34?e.face:0,e.speed);if(e.onGround&&Math.abs(e.vx)>4&&Math.floor(e.t2*2.5)!==Math.floor((e.t2-dt)*2.5)){sfx.step(true);shake=Math.max(shake,1)}
      if(adx<46&&Math.abs(dy)<20&&e.cd<=0){e.state='poundW';e.st=0;sfx.golemWind()}return;
    case 'turn':walker(e,dt,0,0);if(e.st>.7){e.face=dx>0?1:-1;e.state='chase'}return;
    case 'poundW':walker(e,dt,0,0);if(e.st>.9){e.state='pound';e.st=0;e.hitDone=false;sfx.bossSlam();shake=6;dust(e.x+e.face*20,e.y,14);
        for(const d of [-1,1])shots.push({x:e.x+d*16,y:e.y,vx:d*130,vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.55,life:.7,w:10,h:14})}return;
    case 'pound':walker(e,dt,0,0);if(!e.hitDone&&e.st<.15){const x0=e.face>0?e.x-6:e.x-46,x1=e.face>0?e.x+46:e.x+6;if(hitPlayerBox(x0,e.y-30,x1,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}}
      if(e.st>.25){e.state='vent';e.st=0;sfx.steam()}return;
    case 'vent':walker(e,dt,0,0);if(rnd()<.5)part(e.x+(rnd()-.5)*14,e.y-24,(rnd()-.5)*20,-30-rnd()*30,.8,'#8a8590',{g:-20,drag:1});if(e.st>1.9){e.state='chase';e.cd=1+rnd()*.6}return;
  }}
/* ---------- EMBER IMP: hops away from you and lobs fire bombs that leave burning ground ---------- */
function aiImp(e,dt,dx,dy,adx,sees,leashed){
  const fp=dx>0?1:-1;e.cd2=(e.cd2||0)-dt;
  const hop=(dir,vx)=>{if(!e.onGround)return false;const land=e.x+dir*Math.min(60,vx*.5);
    if(!standable(land,e.y)&&!standable(land,e.y+T)&&!standable(land,e.y-T))return false;e.vy=-250;e.vx=dir*vx;e.onGround=false;e.state='hop';e.st=0;return true};
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);if(rnd()<dt*.3)e.face*=-1;if(sees){e.state='chase';e.face=fp;sfx.cackle()}return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees){e.lost+=dt;if(e.lost>2){e.state='return';e.lost=0}}else e.lost=0;
      e.face=fp;walker(e,dt,0,0);
      if(adx<70&&e.cd2<=0&&hop(-fp,110)){e.cd2=1.2;return}
      if(adx>200&&hop(fp,90))return;
      if(e.cd<=0&&e.onGround){e.state='throwW';e.st=0;sfx.cackle()}return;
    case 'hop':move(e,dt);if(e.onGround&&e.st>.1){e.state='chase';e.vx=0}return;
    case 'throwW':walker(e,dt,0,0);e.face=fp;if(e.st>.62){const sx0=e.x+e.face*4,sy0=e.y-18,v=lobAt(sx0,sy0,P.x+P.vx*.3,P.y-4,.75,700);
        shots.push({x:sx0,y:sy0,vx:v.vx,vy:v.vy,g:700,from:'e',kind:'firebomb',dmg:e.dmg,life:3,w:5,h:5});sfx.swing();e.state='throwR';e.st=0}return;
    case 'throwR':walker(e,dt,0,0);if(e.st>.5){e.state='chase';e.cd=1.7+rnd()*.7}return;
  }}
/* ---------- CHAIN REAVER: spins a chain, hooks you in, then cuts ---------- */
function aiReaver(e,dt,dx,dy,adx,sees,leashed){
  const fp=dx>0?1:-1;e.cd2=(e.cd2||0)-dt;
  switch(e.state){
    case 'patrol':if(sees){e.state='chase';e.face=fp;sfx.foe()}else patrolArea(e,dt);return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees){e.lost+=dt;if(e.lost>1.8){e.state='return';e.lost=0}}else e.lost=0;
      if(leashed){e.state='return';return}
      e.face=fp;
      if(adx<34&&Math.abs(dy)<18&&e.cd2<=0){e.state='slashW';e.st=0;e.cd2=1.6;return}
      walker(e,dt,adx>140?fp:adx<80?-fp:0,e.speed);e.face=fp;
      if(e.cd<=0&&sees&&adx<180&&e.onGround){e.state='hookW';e.st=0;sfx.chainSpin()}return;
    case 'hookW':walker(e,dt,0,0);e.face=fp;if(e.st>.78){e.state='hookThrow';e.st=0;shots.push({x:e.x+e.face*8,y:e.y-15,vx:e.face*320,vy:0,g:0,from:'e',kind:'hook',dmg:e.dmg*.35,life:1,w:6,h:4,owner:e});sfx.whip()}return;
    case 'hookThrow':walker(e,dt,0,0);if(e.st>.9){e.state='hookMiss';e.st=0}return;
    case 'hookMiss':walker(e,dt,0,0);if(e.st>.7){e.state='chase';e.cd=1.6+rnd()*.6}return;
    case 'slashW':walker(e,dt,0,0);e.face=fp;if(e.st>.55){e.state='slash';e.st=0;e.hitDone=false;sfx.swing()}return;
    case 'slash':e.vx=e.st<.08?e.face*120:e.vx*Math.pow(.001,dt);if(e.onGround&&!groundAhead(e,e.face))e.vx=0;move(e,dt);
      if(!e.hitDone&&e.st<.14){const x0=e.face>0?e.x:e.x-34,x1=e.face>0?e.x+34:e.x;if(hitPlayerBox(x0,e.y-26,x1,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}}
      if(e.st>.2){e.state='recover';e.st=0}return;
    case 'recover':walker(e,dt,0,0);if(e.st>.6){e.state='chase';e.cd=Math.max(e.cd,1)}return;
  }}
/* ---------- THE FORGEMASTER: hammer slams with shockwaves, thrown molten ingots, a bull charge; the forge wakes at half health ---------- */
function aiForgemaster(e,dt,dx,dy,adx){
  const fp=dx>0?1:-1,G=16*T,L0=(arena.gates[0]+2)*T,L1=(arena.x1-1)*T;
  if(e.phase===1&&e.hp<e.max*.5){e.phase=2;banner('','The forge roars to life.');sfx.roar();shake=7;e.ventT=1}
  const ph2=e.phase===2,sp=ph2?.75:1;
  if(ph2&&e.state!=='intro'){e.ventT-=dt;if(e.ventT<=0){e.ventT=3.2;const vs=arena.vents.slice().sort(()=>rnd()-.5).slice(0,3);for(const v of vs)pillar('pillar',v*T+8,G,.85,e.dmg*.7)}}
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);return;
    case 'intro':walker(e,dt,0,0);if(e.st>1.6){e.state='chase';e.cd=.6}return;
    case 'chase':e.face=fp;walker(e,dt,adx>50?fp:0,e.speed*(ph2?1.25:1));e.face=fp;
      if(e.cd<=0){const r=rnd();if(adx<64)e.state='hammerW';else if(r<.4)e.state='ingotW';else if(adx>120&&r<.75)e.state='chargeW';else e.state='hammerW';
        e.st=0;e.face=fp;if(e.state==='chargeW')sfx.roar();else sfx.bossWind()}return;
    case 'hammerW':walker(e,dt,adx>40?fp*.5:0,e.speed);e.face=fp;if(e.st>.85*sp){e.state='hammer';e.st=0;e.hitDone=false;sfx.bossSlam();shake=8;dust(e.x+e.face*36,G,18);
        const n=ph2?2:1;for(let k=0;k<n;k++)for(const d of [-1,1])shots.push({x:e.x+d*20,y:G,vx:d*(ph2?185:155)*(k?.6:1),vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.65,life:3,w:10,h:14})}return;
    case 'hammer':walker(e,dt,0,0);if(!e.hitDone&&e.st<.15){const x0=e.face>0?e.x-8:e.x-60,x1=e.face>0?e.x+60:e.x+8;if(hitPlayerBox(x0,e.y-48,x1,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}}
      if(e.st>.9*sp){e.state='chase';e.cd=.5+rnd()*.5}return;
    case 'ingotW':walker(e,dt,0,0);e.face=fp;if(e.st>.65*sp){const n=ph2?5:3;for(let i=0;i<n;i++){const tx=clamp(P.x+(i-(n-1)/2)*44,L0,L1),sx0=e.x+e.face*14,sy0=e.y-42,v=lobAt(sx0,sy0,tx,G-4,.8+i*.08,700);
        shots.push({x:sx0,y:sy0,vx:v.vx,vy:v.vy,g:700,from:'e',kind:'ingot',dmg:e.dmg*.6,life:3,w:6,h:4})}sfx.swing();e.state='ingotR';e.st=0}return;
    case 'ingotR':walker(e,dt,0,0);if(e.st>.7*sp){e.state='chase';e.cd=.6+rnd()*.4}return;
    case 'chargeW':walker(e,dt,0,0);e.face=fp;if(rnd()<.6)part(e.x-e.face*10,e.y-34,(rnd()-.5)*20,-30,.6,'#8a8590',{g:-20});if(e.st>.65*sp){e.state='charge';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'charge':e.vx=e.face*(ph2?280:240);if(!e.hitDone&&hitPlayerBox(e.x-14,e.y-48,e.x+14,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}if(rnd()<.6)dust(e.x-e.face*10,e.y,1);move(e,dt);
      if(e.hitWall||e.st>1.4){if(e.hitWall){e.state='stunned';shake=7;sfx.clang();sparks(e.x+e.face*14,e.y-30,-e.face,16)}else e.state='chase';e.st=0;e.vx=0}return;
    case 'stunned':walker(e,dt,0,0);if(e.st>1.5){e.state='chase';e.cd=.3}return;
  }}
/* ---------- THE EMBER QUEEN: a fast duelist; thrusts, three-cut combos, backsteps; at half health she burns the ground behind her ---------- */
function aiQueen(e,dt,dx,dy,adx){
  const fp=dx>0?1:-1,G=16*T;
  if(e.phase===1&&e.hp<e.max*.5){e.phase=2;banner('','The Queen takes flame.');sfx.roar();shake=7;for(let i=0;i<50;i++)emberP(e.x,e.y-rnd()*30,24)}
  const ph2=e.phase===2,sp=ph2?.8:1;e.cd3=(e.cd3||0)-dt;
  const trail=()=>{if(ph2&&Math.abs(e.x-(e.lastTrail??-999))>34){e.lastTrail=e.x;puddle(e.x,G,2.2,e.dmg*.35)}};
  if(ph2&&rnd()<dt*10)emberP(e.x+(rnd()-.5)*12,e.y-30,6);
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);return;
    case 'intro':walker(e,dt,0,0);e.face=fp;if(e.st>1.4){e.state='stalk';e.cd=.5}return;
    case 'stalk':{e.face=fp;const want=adx>110?fp:adx<60?-fp:0;walker(e,dt,want,e.speed*.55);e.face=fp;
      if(adx<52&&(P.state==='light'||P.state==='heavy')&&e.cd3<=0){e.cd3=2.6;e.state='backstep';e.st=0;e.vy=-170;e.vx=-fp*210;e.onGround=false;sfx.roll();return}
      if(e.cd<=0){const r=rnd();if(ph2&&r<.25)e.state='leapW';else if(r<.55)e.state='thrustW';else e.state='c1W';e.st=0;e.face=fp;sfx.bossWind()}return}
    case 'backstep':move(e,dt);if(e.onGround&&e.st>.1){e.state='stalk';e.vx=0;e.cd=Math.min(e.cd,.35)}return;
    case 'thrustW':walker(e,dt,0,0);e.face=fp;if(e.st>.5*sp){e.state='thrust';e.st=0;e.hitDone=false;sfx.dive()}return;
    case 'thrust':e.vx=e.face*(ph2?340:300);move(e,dt);trail();if(!e.hitDone&&hitPlayerBox(e.face>0?e.x:e.x-30,e.y-24,e.face>0?e.x+30:e.x,e.y-4)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}
      if(e.st>.32||e.hitWall){e.state='thrustR';e.st=0;e.vx=0}return;
    case 'thrustR':walker(e,dt,0,0);if(e.st>.65*sp){e.state='stalk';e.cd=.45+rnd()*.4}return;
    case 'c1W':case 'c2W':case 'c3W':{walker(e,dt,0,0);e.face=fp;const w=e.state==='c3W'?.5:.34;if(e.st>w*sp){e.state=e.state.slice(0,2);e.st=0;e.hitDone=false;sfx.swing()}return}
    case 'c1':case 'c2':case 'c3':{const big=e.state==='c3',reach=big?42:32;e.vx=e.st<.08?e.face*(big?140:90):e.vx*Math.pow(.001,dt);if(e.onGround&&!groundAhead(e,e.face))e.vx=0;move(e,dt);trail();
      if(!e.hitDone&&e.st<.13){const x0=e.face>0?e.x-4:e.x-reach,x1=e.face>0?e.x+reach:e.x+4;if(hitPlayerBox(x0,e.y-30,x1,e.y)){e.hitDone=true;hurtPlayer(e.dmg*(big?1.2:.8),e.face)}}
      if(e.st>.18){if(e.state==='c3'){e.state='comboR';e.st=0}else{e.state=e.state==='c1'?'c2W':'c3W';e.st=0}}return}
    case 'comboR':walker(e,dt,0,0);if(e.st>.75*sp){e.state='stalk';e.cd=.5+rnd()*.4}return;
    case 'leapW':walker(e,dt,0,0);e.face=fp;if(e.st>.45){e.state='leap';e.st=0;e.vy=-400;e.vx=clamp(dx/.85,-220,220);e.onGround=false;sfx.bossLeap()}return;
    case 'leap':move(e,dt);if(e.onGround&&e.st>.15){e.state='leapR';e.st=0;shake=7;sfx.bossSlam();for(const d of [-1,0,1])puddle(e.x+d*40,G,2.6,e.dmg*.4);
        for(const d of [-1,1])shots.push({x:e.x+d*12,y:G,vx:d*170,vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.7,life:3,w:10,h:14});
        if(hitPlayerBox(e.x-18,e.y-30,e.x+18,e.y))hurtPlayer(e.dmg,P.x>e.x?1:-1)}return;
    case 'leapR':walker(e,dt,0,0);if(e.st>.9){e.state='stalk';e.cd=.4}return;
  }}
/* ---------- projectiles unique to the forge; returns true when handled ---------- */
function stepShot3(s,dt){
  if(s.kind==='firebomb'||s.kind==='ingot'){s.vy+=s.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(rnd()<.6)emberP(s.x,s.y,2);
    const c=tileAt(Math.floor(s.x/T),Math.floor(s.y/T));
    if(solidCode(c)||(c===2&&s.vy>0)||c===7||s.y>LH){const fy=groundY(s.x,s.y-10);if(fy!==null)puddle(s.x,fy,s.kind==='ingot'?3:2.4,s.dmg*.5);s.life=0;sfx.splash();sparks(s.x,s.y-2,1,4);sparks(s.x,s.y-2,-1,4);return true}
    if(P.inv<=0&&hitPlayerBox(s.x-4,s.y-4,s.x+4,s.y+4)){hurtPlayer(s.dmg,Math.sign(s.vx)||1);s.life=0;sfx.splash()}return true}
  if(s.kind==='puddle'){s.life-=dt;s.tick-=dt;if(rnd()<.5)emberP(s.x+(rnd()-.5)*s.w,s.y-2,3);
    if(s.tick<=0&&s.life>.2&&hitPlayerBox(s.x-s.w/2,s.y-8,s.x+s.w/2,s.y+1)){s.tick=.5;hurtPlayer(s.dmg,P.x>s.x?1:-1)}return true}
  if(s.kind==='hook'){s.x+=s.vx*dt;s.life-=dt;const o=s.owner;
    if(solidCode(tileAt(Math.floor(s.x/T),Math.floor(s.y/T)))||Math.abs(s.x-o.x)>190||o.state==='dead'||o.state==='hurt'||s.life<=0){s.life=0;if(o.state==='hookThrow'){o.state='hookMiss';o.st=0}return true}
    if(P.inv<=0&&P.state!=='death'&&hitPlayerBox(s.x-4,s.y-3,s.x+4,s.y+3)){hurtPlayer(s.dmg,-Math.sign(s.vx));if(P.state==='hurt'){P.vx=0;P.vy=-60;P.pullT=.28;P.pullX=o.x-Math.sign(o.x-P.x)*26}s.life=0;o.state='slashW';o.st=0;sfx.chainPull()}return true}
  return false}

/* =========================================================
   LEVEL 4: THE CASTLE WALLS, in daylight. New foes (Carrion Crow, Halberdier, Siege Bombardier),
   bosses (the Bellwarden, Ignis the Ash Drake), and wind that pushes you along the sky bridge.
   ========================================================= */
function buildL4({S,D,O,I,E,zone}){
  zone(0,MW-1,.05);
  /* ---- A: THE GATEHOUSE ROOF ---- out of a stair tower into daylight; crows, a halberdier, an archer on a merlon, a breach, a bombardier tower */
  S(0,0,1,ROWS-1,1);S(2,0,14,5,1);S(13,6,14,12,1);zone(2,12,.55,6);
  D('stairUp',4,16);O('shrine',9,16,{label:'Shrine of the Dawn'});D('torch',6,11);D('torch',11,11);D('banner',8,7);
  D('parapet',15,16,{x1:56});D('flag',20,16);D('flag',40,16);
  E('crow',24,8,3);E('crow',28,7,3);E('crow',32,8,3);
  E('halberd',37,16,3);
  S(44,14,49,15,1);D('parapet',44,14,{x1:49});E('archer',47,14,2);
  S(57,16,59,ROWS-1,0);
  S(61,13,63,13,2);S(63,10,65,10,2);
  S(66,7,77,15,1);S(67,10,76,15,0);S(66,13,66,15,0);S(77,13,77,15,0);zone(67,76,.55,10);D('parapet',66,7,{x1:77});
  E('bomber',72,7,0);D('flag',75,7);E('hollow',71,16,2);D('torch',69,13);D('torch',74,13);
  D('parapet',78,16,{x1:89});E('hollow',82,16,3);E('hollow',86,16,3);D('flag',88,16);

  /* ---- B: THE LONG WALL ---- a long battlement: a halberdier, a crow flock, a broken ballista, an archer turret,
     a bombardier's gun platform, hounds, a breach, a halberdier with a warden, a tower with a chest and a false floor */
  D('parapet',90,16,{x1:183});for(const x of [96,120,150,176])D('flag',x,16);
  E('halberd',100,16,3);
  E('crow',106,8,3);E('crow',110,7,3);E('crow',114,8,3);E('crow',118,6,3);
  D('ballista',123,16);
  S(128,9,133,15,1);S(129,12,132,15,0);S(128,13,128,15,0);S(133,13,133,15,0);zone(129,132,.55,12);S(125,12,127,12,2);E('archer',131,9,1);D('parapet',128,9,{x1:133});
  S(140,12,147,15,1);S(137,13,139,13,2);E('bomber',144,12,0);D('parapet',140,12,{x1:147});
  E('hound',152,16,2);E('hound',155,16,2);
  S(160,16,162,ROWS-1,0);
  E('halberd',169,16,3);E('warden',177,16,3);
  S(184,6,196,15,1);S(185,10,195,15,0);S(184,13,184,15,0);S(196,13,196,15,0);zone(185,195,.55,10);D('parapet',184,6,{x1:196});
  O('chest',188,16,{id:'l4_d_chest',loot:'scroll'});D('torch',187,13);D('torch',193,13);
  S(190,16,191,16,5);S(188,17,193,19,0);I('whetstone',189,20,{id:'l4_d_whet'});I('souls',192,20,{v:500,id:'l4_d_cache'});

  /* ---- C: THE BELL TOWER ---- the Bellwarden's open belfry */
  D('parapet',197,16,{x1:203});E('crow',200,7,2);
  S(204,4,205,12,1);S(276,4,277,12,1);
  S(214,11,219,11,2);S(258,11,263,11,2);
  D('belfry',240,16);D('parapet',206,16,{x1:275});D('flag',210,16);D('flag',270,16);
  E('bellwarden',252,16,0);
  arenas.push({gates:[205,276],trigger:211*T,x1:275,boss:'bellwarden',flag:'bellDead',name:'The Bellwarden',sub:'He tolls the hours of the dead'});

  /* ---- D: THE SKY BRIDGE ---- a broken bridge between towers, wind, halberdiers, crows, a bombardier on the far tower, the last shrine */
  D('parapet',278,16,{x1:285});
  S(286,16,360,ROWS-1,0);S(286,16,360,16,4);for(const [a,b] of [[300,301],[318,320],[336,337],[350,352]])S(a,16,b,16,0);
  for(const x of [286,309,328,345,360])D('post',x,16);
  O('gust',0,0,{x0:304*T,x1:333*T,dir:-1,period:4.5,phase:0});O('gust',0,0,{x0:338*T,x1:359*T,dir:1,period:5,phase:2.4});
  E('halberd',294,16,2);E('halberd',326,16,2);E('halberd',344,16,2);
  for(const [x,y] of [[306,9],[310,8],[314,9],[340,8],[344,7],[348,8]])E('crow',x,y,3);
  S(366,4,389,15,1);S(367,9,388,15,0);S(366,13,366,15,0);S(389,13,389,15,0);zone(367,388,.55,9);D('parapet',366,4,{x1:389});
  E('bomber',378,4,0);D('flag',384,4);
  O('shrine',380,16,{label:'Shrine of the Spire'});D('torch',370,12);D('torch',386,12);D('statue',374,16,{k:1});

  /* ---- E: THE SUN SPIRE ---- the highest roof, where the drake nests */
  S(390,4,391,12,1);S(478,0,479,ROWS-1,1);
  S(404,12,409,12,2);S(430,10,436,10,2);S(456,12,461,12,2);
  D('parapet',392,16,{x1:477});for(const x of [398,420,445,470])D('flag',x,16);D('spire',471,16);D('brokenPillar',414,16,{h:70});D('brokenPillar',440,16,{h:100});D('bonepile',462,16);
  E('drake',450,16,0);O('descent',466,16,{to:4,flag:'drakeDead'});
  arenas.push({gates:[391],trigger:396*T,x1:477,boss:'drake',flag:'drakeDead',name:'Ignis, the Ash Drake',sub:'It has nested on the spire since the fire began'});
  return{x:5*T+8,y:16*T};
}
/* ---------- CARRION CROW: circles in a flock, caws, then swoops ---------- */
function aiCrow(e,dt,dx,dy,adx){
  const dist=Math.hypot(dx,dy+20),sees=P.state!=='death'&&LIVE()&&dist<220&&Math.abs(e.x-e.home.x)<e.range+300;
  e.ang=e.ang??rnd()*6.28;
  switch(e.state){
    case 'patrol':e.ang+=dt*1.6;flyTo(e,dt,e.home.x+Math.cos(e.ang)*34,e.home.y+Math.sin(e.ang)*12,1.4,70);if(sees){e.state='chase';sfx.caw()}break;
    case 'return':flyTo(e,dt,e.home.x,e.home.y,1.4,90);if(Math.hypot(e.x-e.home.x,e.y-e.home.y)<12)e.state='patrol';if(sees)e.state='chase';break;
    case 'chase':if(!sees){e.lost+=dt;if(e.lost>2){e.state='return';e.lost=0}}else e.lost=0;
      e.ang+=dt*2.2;flyTo(e,dt,P.x+Math.cos(e.ang)*70,P.y-60+Math.sin(e.ang)*14,1.8,e.speed*1.3);if(e.cd<=0&&dist<160){e.state='caw';e.st=0;sfx.caw()}break;
    case 'caw':e.vx*=Math.pow(.05,dt);e.vy*=Math.pow(.05,dt);e.x+=e.vx*dt;e.y+=e.vy*dt-12*dt;if(e.st<.35){e.tx=P.x;e.ty=P.y-12}
      if(e.st>.5){const a=Math.atan2(e.ty-e.y,e.tx-e.x);e.vx=Math.cos(a)*240;e.vy=Math.sin(a)*240;e.state='swoop';e.st=0;e.hitDone=false}break;
    case 'swoop':e.x+=e.vx*dt;e.y+=e.vy*dt;if(!e.hitDone&&hitPlayerBox(e.x-5,e.y-6,e.x+5,e.y)){e.hitDone=true;hurtPlayer(e.dmg,Math.sign(e.vx)||1)}
      if(e.st>.55||e.y>16*T-4){e.state='climb';e.st=0;e.vy=-160}break;
    case 'climb':e.vx*=Math.pow(.2,dt);e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy*=Math.pow(.3,dt);if(e.st>.6){e.state='chase';e.cd=1.4+rnd()*1.4}break;
  }
  if(e.state==='caw'||e.state==='chase')e.face=P.x>e.x?1:-1;else if(Math.abs(e.vx)>4)e.face=e.vx>0?1:-1;
  e.x=clamp(e.x,12,MW*T-12);e.y=clamp(e.y,2*T,16*T-2);
  for(let n=0;n<6&&solidCode(tileAt(Math.floor(e.x/T),Math.floor((e.y-3)/T)));n++)e.y-=4}
/* ---------- HALBERDIER: a long thrust and a sweep that hits both sides; both shove you hard ---------- */
function shove(dmg,dir,v){const h=P.hp;hurtPlayer(dmg,dir);if(P.hp<h&&P.state==='hurt')P.vx=dir*v}
function aiHalberd(e,dt,dx,dy,adx,sees,leashed){
  const fp=dx>0?1:-1;
  switch(e.state){
    case 'patrol':if(sees){e.state='alert';e.st=0;e.face=fp;sfx.foe()}else patrolArea(e,dt);return;
    case 'alert':walker(e,dt,0,0);e.face=fp;if(e.st>.35)e.state='chase';return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees){e.lost+=dt;if(e.lost>1.6){e.state='return';e.lost=0}}else e.lost=0;
      if(leashed){e.state='return';return}
      e.face=fp;walker(e,dt,adx>46?fp:adx<24?-fp:0,e.speed);e.face=fp;
      if(e.cd<=0&&Math.abs(dy)<18&&e.onGround&&adx<58){e.state=adx<28||rnd()<.35?'sweepW':'thrustW';e.st=0}return;
    case 'thrustW':walker(e,dt,0,0);if(e.st>.55){e.state='thrust';e.st=0;e.hitDone=false;sfx.whip()}return;
    case 'thrust':walker(e,dt,0,0);if(!e.hitDone&&e.st<.14){const x0=e.face>0?e.x+4:e.x-58,x1=e.face>0?e.x+58:e.x-4;if(hitPlayerBox(x0,e.y-24,x1,e.y-8)){e.hitDone=true;shove(e.dmg,e.face,230)}}
      if(e.st>.2){e.state='recover';e.st=0}return;
    case 'sweepW':walker(e,dt,0,0);if(e.st>.75){e.state='sweep';e.st=0;e.hitDone=false;sfx.heavy()}return;
    case 'sweep':walker(e,dt,0,0);if(!e.hitDone&&e.st<.2&&hitPlayerBox(e.x-46,e.y-30,e.x+46,e.y)){e.hitDone=true;shove(e.dmg*1.2,P.x>e.x?1:-1,240)}if(e.st>.3){e.state='recover';e.st=0}return;
    case 'recover':walker(e,dt,0,0);if(e.st>.7){e.state='chase';e.cd=.8+rnd()*.7}return;
  }}
/* ---------- SIEGE BOMBARDIER: marks your spot, then a mortar shell lands on it; kicks when crowded ---------- */
function aiBomber(e,dt,dx,dy,adx){
  const fp=dx>0?1:-1,sees=P.state!=='death'&&LIVE()&&adx<280&&Math.abs(dy)<170;
  e.face=fp;walker(e,dt,0,0);
  switch(e.state){
    case 'patrol':if(sees){e.state='chase';sfx.foe()}return;
    case 'return':case 'chase':if(!sees){e.state='patrol';return}
      if(adx<44&&Math.abs(dy)<20){e.state='kickW';e.st=0;return}
      if(e.cd<=0){e.state='load';e.st=0}return;
    case 'load':if(e.st>.45){const tx=P.x+P.vx*.4,ty=groundY(tx,P.y-24)??groundY(P.x,P.y-24);
        if(ty!==null){const mx=e.x+e.face*14,my=e.y-18,v=lobAt(mx,my,tx,ty,1,500);shots.push({kind:'shell',x:mx,y:my,vx:v.vx,vy:v.vy,g:500,t:1,tx,ty,from:'e',dmg:e.dmg,life:2,w:6,h:6})}
        sfx.mortar();e.state='reload';e.st=0}return;
    case 'reload':if(e.st>1.9){e.state='chase';e.cd=.2+rnd()*.6}return;
    case 'kickW':if(e.st>.42){e.state='kick';e.st=0;e.hitDone=false;sfx.swing()}return;
    case 'kick':if(!e.hitDone&&e.st<.12){const x0=e.face>0?e.x:e.x-30,x1=e.face>0?e.x+30:e.x;if(hitPlayerBox(x0,e.y-18,x1,e.y)){e.hitDone=true;shove(e.dmg,e.face,260)}}
      if(e.st>.5){e.state='chase';e.cd=Math.max(e.cd,.5)}return;
  }}
/* ---------- THE BELL WARDEN: a bell fused where his head was, two more on chains.
   Bell Swing (wide arc, knockback) · Ground Slam (shockwave that stuns) · Chain Pull (reels you in, then strikes)
   Phase 2, the Unbound: faster, double swings, and the Ringing Phase, spectral bells that circle the arena ---------- */
function stunP(t){if(P&&P.state==='hurt')P.stunT=Math.max(P.stunT||0,t)}
function aiBell(e,dt,dx,dy,adx){
  const fp=dx>0?1:-1,G=16*T,L0=(arena.gates[0]+2)*T,L1=(arena.x1-1)*T;
  if(e.phase===1&&e.hp<e.max*.5&&['chase','recover'].includes(e.state)){e.phase=2;banner('','The Warden is enraged. His bells burn.');sfx.toll();sfx.boom();shake=10;e.state='enrage';e.st=0;e.ringCd=0;e.vx=0;
    tempLights.push({x:e.x,y:e.y-40,r:150,life:1,max:1});for(let i=0;i<90;i++){const a=rnd()*Math.PI*2,v=60+rnd()*200;part(e.x,e.y-36,Math.cos(a)*v,Math.sin(a)*v-60,.6+rnd()*.6,[C.ember,C.emberL,C.emberW,'#ff5020'][i%4],{g:-40,glow:1,drag:1.5})}return}
  const ph2=e.phase===2,sp=ph2?.55:1;if(ph2)e.ringCd=(e.ringCd??0)-dt;
  if(ph2){const FC=[C.ember,C.emberL,C.emberW,'#ff5020'];for(let i=0,n=Math.floor(dt*55+rnd());i<n;i++)part(e.x+(rnd()-.5)*28,e.y-6-rnd()*58,(rnd()-.5)*24,-50-rnd()*60,.45+rnd()*.35,FC[Math.floor(rnd()*4)],{g:-70,glow:1});
    for(const o of [e.bfo,e.bbo])if(o&&rnd()<dt*30)part(e.x+o[0]+(rnd()-.5)*12,e.y+o[1]+4+rnd()*10,(rnd()-.5)*16,-40-rnd()*40,.4,FC[Math.floor(rnd()*4)],{g:-60,glow:1});
    if(rnd()<dt*22)part(e.x+(rnd()-.5)*12,e.y-80,(rnd()-.5)*12,-50-rnd()*40,.5,FC[Math.floor(rnd()*4)],{g:-60,glow:1})}
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);return;
    case 'intro':walker(e,dt,0,0);e.face=fp;if(e.st>1.8){e.state='chase';e.cd=.8}return;
    case 'enrage':walker(e,dt,0,0);e.face=fp;if(e.st<1.2&&rnd()<.5)shake=Math.max(shake,3);if(e.st>1.3){e.state='ringW';e.st=0}return;
    case 'chase':e.face=fp;walker(e,dt,adx>52?fp:0,e.speed*(ph2?1.75:1));e.face=fp;
      if(e.cd<=0){const r=rnd();e.st=0;e.combo=0;
        if(ph2&&e.ringCd<=0&&!shots.some(q=>q.kind==='sbell'))e.state='ringW';
        else if(adx<84&&r<.5)e.state='swingW';
        else if(adx<140&&r<(ph2?.68:.78))e.state='slamW';
        else if(adx>=50&&adx<250)e.state='pullW';
        else e.state=adx<84?'swingW':'slamW';
        if(e.state!=='ringW')sfx.bossWind()}return;
    // 1. BELL SWING: a wide arc from over the shoulder to the floor in front
    case 'swingW':walker(e,dt,0,0);e.face=fp;if(e.st>.8*sp){e.state='swing';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'swing':walker(e,dt,e.st<.18?e.face:0,ph2?110:70);
      if(!e.hitDone&&e.st>.03&&e.st<.24){const rch=ph2?104:92,x0=e.face>0?e.x-26:e.x-rch,x1=e.face>0?e.x+rch:e.x+26;if(hitPlayerBox(x0,e.y-74,x1,e.y)){e.hitDone=true;shove(e.dmg*(ph2?1.1:1),e.face,320)}}
      if(e.st>.2&&!e.rang){e.rang=1;sfx.toll();shake=Math.max(shake,3);const bx=e.x+e.face*48;dust(bx,G,8);sparks(bx,G-4,e.face,8)}
      if(e.st>.55*sp){e.rang=0;if(ph2&&!e.combo){e.combo=1;e.state='swing';e.st=0;e.hitDone=false;e.face=fp;sfx.bossSweep()}else{e.state='recover';e.st=0;e.rec=ph2?.3:1.15}}return;
    // 2. GROUND SLAM: both bells overhead, then into the stone; the shockwave stuns
    case 'slamW':walker(e,dt,0,0);e.face=fp;if(e.st>.95*sp){e.state='slam';e.st=0;shake=10;sfx.bossSlam();sfx.toll();const fx=e.x+e.face*22;dust(fx,G,26);
        for(let i=0;i<18;i++)part(fx+(rnd()-.5)*34,G-2,(rnd()-.5)*180,-60-rnd()*130,.55,rnd()<.5?'#e0483a':C.emberL,{g:420,glow:1});tempLights.push({x:fx,y:G-10,r:100,life:.45,max:.45});
        if(hitPlayerBox(fx-36,G-44,fx+36,G)){const h=P.hp;hurtPlayer(e.dmg*1.05,P.x>fx?1:-1);if(P.hp<h)stunP(.75)}
        for(const d of [-1,1])shots.push({x:fx+d*16,y:G,vx:d*(ph2?250:195),vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.55,life:ph2?2.6:1.7,w:10,h:14,stun:.6});
        if(ph2)for(const d of [-1,1])shots.push({x:fx+d*16,y:G,vx:d*135,vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.5,life:1.5,w:10,h:14,stun:.5})}return;
    case 'slam':walker(e,dt,0,0);if(e.st>.35){e.state='recover';e.st=0;e.rec=ph2?.35:1.25}return;
    // 3. CHAIN PULL: he hurls a bell on its chain; if it catches you, you are reeled in and struck
    case 'pullW':walker(e,dt,0,0);e.face=fp;if(e.st>.75*sp){e.state='pullT';e.st=0;e.hook=0;e.hooked=false;sfx.swing();sfx.bossSweep()}return;
    case 'pullT':{walker(e,dt,0,0);const max=ph2?270:220;
      if(!e.hooked){e.hook+=(ph2?560:460)*dt;const hx=e.x+e.face*(18+e.hook);if(rnd()<.6)part(hx,e.y-24,0,0,.25,'#8a8494',{g:0});
        if(P.inv<=0&&P.state!=='death'&&P.state!=='dodge'&&hitPlayerBox(hx-7,e.y-36,hx+7,e.y-12)){const h=P.hp;hurtPlayer(e.dmg*.3,-e.face);
          if(P.hp<h&&P.state!=='death'){e.hooked=true;e.st=0;P.pullT=ph2?.32:.42;P.pullX=e.x+e.face*34;P.vy=0;P.inv=.3;sfx.clang();sparks(hx,e.y-24,-e.face,10)}}
        if(!e.hooked&&e.hook>=max){e.state='pullR';e.st=0}}
      else{e.hook=Math.max(0,Math.abs(P.x-e.x)-18);if(e.st>(ph2?.32:.42)){e.state='pullHit';e.st=0;e.hitDone=false;sfx.bossWind()}}return}
    case 'pullR':walker(e,dt,0,0);e.hook=Math.max(0,e.hook-620*dt);if(e.hook<=0){e.state='recover';e.st=0;e.rec=ph2?.3:.9}return;
    case 'pullHit':walker(e,dt,0,0);e.hook=Math.max(0,e.hook-500*dt);
      if(e.st>(ph2?.15:.22)&&!e.hitDone){e.hitDone=true;sfx.bossSweep();sfx.toll();const x0=e.face>0?e.x:e.x-62,x1=e.face>0?e.x+62:e.x;if(hitPlayerBox(x0,e.y-60,x1,e.y))shove(e.dmg*.95,e.face,300)}
      if(e.st>(ph2?.5:.7)){e.state='recover';e.st=0;e.rec=ph2?.3:1}return;
    // 4. THE RINGING PHASE: the head tolls and spectral bells take flight around the arena
    case 'ringW':walker(e,dt,0,0);e.face=fp;if(rnd()<.6)part(e.x+(rnd()-.5)*30,e.y-60-rnd()*20,(rnd()-.5)*30,-20-rnd()*30,.6,rnd()<.5?'#a070ff':'#6ab4ff',{g:-10,glow:1});
      if(e.st>(ph2&&e.ringCd>-99&&e.rung?.9:1.4)){e.rung=1;sfx.toll();shake=6;e.ringCd=13;e.state='ringR';e.st=0;
        for(let k=0;k<2;k++)shots.push({kind:'ring',x:e.x,y:e.y-62,r:12-k*70,vr:210,max:300,dmg:e.dmg*.6,life:3,from:'e',vx:0,vy:0,g:0,hit:false,ghost:1});
        const cx=(L0+L1)/2,rx=(L1-L0)/2-26,n=3,dir=rnd()<.5?1:-1,a0=Math.atan2(0,e.x-cx);
        for(let k=0;k<n;k++){const a=a0+k*Math.PI*2/n;shots.push({kind:'sbell',owner:e,a,va:dir*.62,cx,rx,cyc:G-60,ry:50,x:cx+Math.cos(a)*rx,y:G-60+Math.sin(a)*50,vx:0,vy:0,g:0,life:12,born:0,dmg:e.dmg*.4,from:'e',w:12,h:14})}}return;
    case 'ringR':walker(e,dt,0,0);if(e.st>.6){e.state='chase';e.cd=.3}return;
    case 'recover':walker(e,dt,0,0);if(e.st>(e.rec||1)){e.state='chase';e.cd=ph2?.1+rnd()*.2:.3+rnd()*.4}return;
    default:e.state='chase';return;
  }}
/* ---------- IGNIS, THE ASH DRAKE: claws, tail sweeps and fire breath on the roof; strafing fire runs and fireball volleys from the air ---------- */
function drakeMouth(e){return[e.x+e.face*44,e.y-34]}
function aiDrake(e,dt,dx,dy,adx){
  const fp=dx>0?1:-1,G=16*T,L0=(arena.gates[0]+3)*T,L1=(arena.x1-3)*T;
  if(e.phase===1&&e.hp<e.max*.5){e.phase=2;banner('','Ignis takes to the sky in fury.');sfx.roar();shake=8}
  const ph2=e.phase===2,sp=ph2?.78:1;
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);return;
    case 'intro':walker(e,dt,0,0);e.face=fp;if(e.st>2){e.state='stalk';e.cd=.8}return;
    case 'stalk':e.face=fp;walker(e,dt,adx>70?fp:0,e.speed);e.face=fp;
      if(e.cd<=0){const r=rnd();
        if(ph2?r<.4:r<.22)e.state='takeoff';
        else if(adx<76&&r<.62)e.state=rnd()<.65?'clawW':'tailW';
        else if(r<.82)e.state='breathW';else e.state='tailW';
        e.st=0;if(e.state==='breathW')e.bdir=fp;sfx.bossWind()}return;
    case 'clawW':walker(e,dt,0,0);e.face=fp;if(e.st>.55*sp){e.state='claw';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'claw':walker(e,dt,0,0);if(!e.hitDone&&e.st<.18){const x0=e.face>0?e.x+6:e.x-64,x1=e.face>0?e.x+64:e.x-6;if(hitPlayerBox(x0,e.y-36,x1,e.y)){e.hitDone=true;hurtPlayer(e.dmg,e.face)}}
      if(e.st>.6){e.state='stalk';e.cd=.5+rnd()*.4}return;
    case 'tailW':walker(e,dt,0,0);if(e.st>.62*sp){e.state='tail';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'tail':walker(e,dt,0,0);if(!e.hitDone&&e.st<.25&&hitPlayerBox(e.x-80,e.y-24,e.x+80,e.y)){e.hitDone=true;shove(e.dmg*.9,P.x>e.x?1:-1,250)}if(e.st>.7){e.state='stalk';e.cd=.5+rnd()*.4}return;
    case 'breathW':walker(e,dt,0,0);e.face=e.bdir;if(e.st>.85*sp){e.state='breath';e.st=0;e.tick=0;sfx.breath();for(let i=1;i<=4;i++)puddle(e.x+e.bdir*(30+i*28),G,2.4,e.dmg*.3)}return;
    case 'breath':{walker(e,dt,0,0);const [mx,my]=drakeMouth(e);for(let i=0;i<5;i++)part(mx,my,e.bdir*(120+rnd()*150),20+rnd()*60,.5,rnd()<.5?C.ember:C.emberL,{g:40,glow:1});
      e.tick-=dt;if(e.tick<=0){e.tick=.2;const x0=e.bdir>0?mx:mx-140,x1=e.bdir>0?mx+140:mx;if(hitPlayerBox(x0,G-44,x1,G))hurtPlayer(e.dmg*.55,e.bdir)}
      if(e.st>1){e.state='stalk';e.cd=.7}return}
    case 'takeoff':e.vx=0;e.y-=150*dt;if(e.st>.7){e.state='skyW';e.st=0;e.side=P.x<(L0+L1)/2?1:-1;sfx.flap()}return;
    case 'skyW':{flyTo(e,dt,e.side>0?L1:L0,G-120,1.5,220);e.face=-e.side;if(e.st>1.2*sp){e.state=rnd()<.55?'strafeW':'volleyW';e.st=0;sfx.roar()}return}
    case 'volleyW':flyTo(e,dt,e.x,G-120+Math.sin(e.t2*2)*6,1.2,60);e.face=fp;
      if(e.st>.7*sp){const n=ph2?5:3,[mx,my]=drakeMouth(e);for(let i=0;i<n;i++){const tx=clamp(P.x+(i-(n-1)/2)*50,L0,L1),v=lobAt(mx,my,tx,G-2,.75+i*.07,700);shots.push({x:mx,y:my,vx:v.vx,vy:v.vy,g:700,from:'e',kind:'firebomb',dmg:e.dmg*.55,life:3,w:5,h:5,big:1})}
        sfx.feather();e.state=ph2&&!e.twice?'skyW':'landW';e.twice=ph2&&!e.twice;e.st=0}return;
    case 'strafeW':flyTo(e,dt,e.side>0?L1:L0,G-76,1.6,200);e.face=-e.side;if(e.st>.9*sp){e.state='strafe';e.st=0;e.lastP=e.x;e.tick=0}return;
    case 'strafe':{e.vx=-e.side*230;e.x+=e.vx*dt;e.y+=((G-76)-e.y)*Math.min(1,dt*3);e.face=-e.side;const [mx,my]=drakeMouth(e);
      for(let i=0;i<4;i++)part(mx,my+6,(rnd()-.5)*40,150+rnd()*80,.4,rnd()<.5?C.ember:C.emberL,{g:200,glow:1});
      if(Math.abs(e.x-e.lastP)>30){e.lastP=e.x;puddle(mx,G,2.4,e.dmg*.3)}
      e.tick-=dt;if(e.tick<=0&&hitPlayerBox(mx-18,G-60,mx+18,G)){e.tick=.35;hurtPlayer(e.dmg*.45,Math.sign(e.vx))}
      if((e.side>0&&e.x<L0+8)||(e.side<0&&e.x>L1-8)){e.side=-e.side;e.state=ph2&&!e.twice?'skyW':'landW';e.twice=ph2&&!e.twice;e.st=0}return}
    case 'landW':flyTo(e,dt,clamp(P.x,L0,L1),G-100,1.6,220);if(e.st>.8){e.state='land';e.st=0;e.vy=260;e.vx=0}return;
    case 'land':e.y+=e.vy*dt;e.vy+=600*dt;if(e.y>=G){e.y=G;e.vy=0;e.onGround=true;e.state='landed';e.st=0;shake=9;sfx.bossSlam();dust(e.x,G,24);
        for(const d of [-1,1])shots.push({x:e.x+d*30,y:G,vx:d*170,vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.6,life:3,w:10,h:14});
        if(hitPlayerBox(e.x-40,e.y-34,e.x+40,e.y))hurtPlayer(e.dmg,P.x>e.x?1:-1)}return;
    case 'landed':walker(e,dt,0,0);if(e.st>1.4*sp){e.state='stalk';e.cd=.4}return;
  }}
/* ---------- shells, toll rings, wind; returns true when the shot is handled ---------- */
function stepShot4(s,dt){
  if(s.kind==='shell'){s.vy+=s.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.t-=dt;if(rnd()<.5)part(s.x,s.y,0,0,.3,'#8a8590',{g:0});
    const c=tileAt(Math.floor(s.x/T),Math.floor(s.y/T));
    if(s.t<=0||solidCode(c)){const ex=s.t<=0?s.tx:s.x,ey=s.t<=0?s.ty:s.y;s.life=0;sfx.boom();shake=Math.max(shake,4);tempLights.push({x:ex,y:ey-6,r:90,life:.3,max:.3});
      for(let i=0;i<24;i++){const a=rnd()*Math.PI*2,sp=40+rnd()*120;part(ex,ey-4,Math.cos(a)*sp,Math.sin(a)*sp-50,.4+rnd()*.3,rnd()<.5?C.ember:'#8a8590',{g:300,glow:1})}
      if(Math.hypot(P.x-ex,P.y-10-ey)<32)hurtPlayer(s.dmg,P.x>ex?1:-1)}return true}
  if(s.kind==='sbell'){s.life-=dt;s.born+=dt;if(s.owner&&s.owner.state==='dead')s.life=Math.min(s.life,.5);s.a+=s.va*dt;s.x=s.cx+Math.cos(s.a)*s.rx;s.y=s.cyc+Math.sin(s.a)*s.ry;
    if(rnd()<.55)part(s.x+(rnd()-.5)*12,s.y+(rnd()-.5)*12,(rnd()-.5)*12,-12,.55,rnd()<.5?'#9a7aff':'#6ab4ff',{g:0,glow:1});
    if(s.born>.9&&s.life>.5&&P.inv<=0&&P.state!=='death'&&hitPlayerBox(s.x-7,s.y-7,s.x+7,s.y+9))hurtPlayer(s.dmg,P.x>s.x?1:-1);return true}
  if(s.kind==='ring'){s.r+=s.vr*dt;s.life-=dt;if(s.r>s.max)s.life=0;if(s.r>0){const d=Math.hypot(P.x-s.x,P.y-12-s.y);if(!s.hit&&Math.abs(d-s.r)<9&&P.inv<=0&&P.state!=='death'){s.hit=true;hurtPlayer(s.dmg,P.x>s.x?1:-1)}}return true}
  return false}
function windTick(p,dt){
  for(const o of objs){if(o.kind!=='gust')continue;o.t=(o.t??o.phase)+dt;if(o.t>=o.period){o.t-=o.period;if(Math.abs((o.x0+o.x1)/2-p.x)<VW)sfx.wind()}
    const active=o.t<1.4,warn=o.period-o.t<1;
    if((active||warn)&&Math.abs((o.x0+o.x1)/2-camX-VW/2)<VW&&rnd()<(active?.95:.35)){const x=o.x0+rnd()*(o.x1-o.x0);part(x,5*T+rnd()*11*T,o.dir*(active?280:90),0,.5,'#e8e6dc',{g:0})}}}

/* =========================================================
   LEVEL 5: THE OUTER RAMPARTS, in the afternoon sun. Armored foes (Iron Brute, Bulwark, Flail Knight)
   that body-block the way, the Iron Marshal and his muster, and the Siege Colossus at the great gate.
   ========================================================= */
function buildL5({S,D,O,I,E,zone}){
  zone(0,MW-1,.05);
  /* ---- A: THE RAMPART STAIR ---- down from the spire onto the outer wall: a bulwark, a brute in a tower passage, an archer deck, a flail knight */
  S(0,0,1,ROWS-1,1);S(2,0,14,5,1);S(13,6,14,12,1);zone(2,12,.55,6);
  D('stairUp',4,16);O('shrine',9,16,{label:'Shrine of the Ramparts'});D('torch',6,11);D('torch',11,11);D('banner',8,7);
  D('parapet',15,47,{x1:47});D('flag',18,16);D('flag',36,16);
  E('crow',22,8,3);E('crow',26,7,3);E('crow',30,8,3);
  E('halberd',28,16,3);E('bulwark',40,16,3);
  S(48,16,50,ROWS-1,0);
  S(54,13,58,15,1);D('parapet',54,13,{x1:58});E('archer',56,13,1);
  S(62,6,75,15,1);S(63,10,74,15,0);S(62,13,62,15,0);S(75,13,75,15,0);zone(63,74,.55,10);D('parapet',62,6,{x1:75});
  E('brute',69,16,3);D('torch',65,13);D('torch',72,13);E('bomber',70,6,0);D('flag',73,6);
  D('parapet',76,16,{x1:99});E('hound',80,16,2);E('hound',83,16,2);E('hollow',88,16,3);E('hollow',92,16,3);E('halberd',97,16,3);D('flag',86,16);
  D('ballista',102,16);
  S(105,12,113,15,1);S(102,13,104,13,2);D('parapet',105,12,{x1:113});E('archer',107,12,1);E('bomber',111,12,0);
  D('parapet',114,16,{x1:139});E('flail',120,16,3);
  for(const [x,y] of [[124,8],[128,7],[132,8],[136,7]])E('crow',x,y,3);
  E('brute',134,16,2);D('flag',126,16);

  /* ---- B: THE SIEGE YARD ---- through the wall gate into the outer bailey: siege engines, scaffolds, spikes, a shield wall, a cellar */
  S(140,4,146,15,1);S(141,10,145,15,0);S(140,13,140,15,0);S(146,13,146,15,0);zone(141,145,.55,10);D('portcullis',143,10);D('torch',141,12);D('torch',145,12);
  E('bulwark',143,16,1);
  zone(147,262,.05,11);
  D('trebuchet',156,16);D('tent',170,16);D('barricade',181,16);D('siegeTower',202,16);D('tent',246,16);D('trebuchet',236,16);D('barricade',224,16);
  E('hollow',150,16,3);E('hollow',158,16,3);E('hollow',163,16,3);E('halberd',167,16,3);
  S(172,11,178,11,2);for(const x of [172,178])D('post',x,16);E('bomber',175,11,0);
  S(183,15,186,15,3);
  E('flail',191,16,3);E('brute',198,16,3);
  S(197,10,206,10,2);S(199,13,204,13,2);E('archer',203,10,1);E('archer',198,10,1);
  E('reaver',212,16,3);
  E('hound',218,16,2);E('hound',221,16,2);E('hound',224,16,2);
  S(228,15,230,15,3);
  E('warden',234,16,2);E('bulwark',238,16,2);
  for(const [x,y] of [[236,8],[240,7],[244,8],[248,7]])E('crow',x,y,3);
  O('chest',244,16,{id:'l5_b_chest',loot:'scroll'});
  S(252,16,253,16,5);S(250,17,256,19,0);S(254,18,255,18,2);I('souls',251,20,{v:800,id:'l5_b_cache'});I('souls',255,20,{v:400,id:'l5_b_cache2'});
  O('shrine',258,16,{label:'Shrine of the Muster'});D('flag',255,16);

  /* ---- C: THE MUSTER FIELD ---- the Iron Marshal's arena; archers on the scaffolds, reinforcements at his horn */
  S(264,4,265,12,1);S(343,4,344,12,1);zone(266,342,.05,11);
  S(270,11,276,11,2);S(332,11,338,11,2);S(298,9,309,9,2);for(const x of [270,276,332,338])D('post',x,16);
  E('archer',273,11,0);E('archer',335,11,0);
  D('tent',284,16);D('tent',322,16);for(const x of [280,303,326])D('flag',x,16);D('weaponRack',292,16);D('weaponRack',314,16);
  E('marshal',318,16,0);
  arenas.push({gates:[265,343],trigger:270*T,x1:342,boss:'marshal',flag:'marshalDead',name:'Sir Varric, the Iron Marshal',sub:'He has drilled the dead for a hundred years'});

  /* ---- D: THE CURTAIN WALL ---- a long broken wall walk: a brute tower, gaps and gusts, shield and flail knights, an archer turret */
  S(346,5,358,15,1);S(347,9,357,15,0);S(346,13,346,15,0);S(358,13,358,15,0);zone(347,357,.55,9);D('parapet',346,5,{x1:358});
  E('brute',353,16,2);E('bomber',352,5,0);D('torch',349,12);D('torch',355,12);
  S(350,16,351,16,5);S(348,17,354,19,0);S(352,18,353,18,2);I('whetstone',349,20,{id:'l5_d_whet'});I('souls',353,20,{v:900,id:'l5_d_cache'});
  D('parapet',359,16,{x1:519});for(const x of [362,390,420,455,490,512])D('flag',x,16);
  for(const [a,b] of [[372,374],[398,400],[430,432],[470,473]])S(a,16,b,ROWS-1,0);
  O('gust',0,0,{x0:378*T,x1:428*T,dir:-1,period:4.6,phase:0});O('gust',0,0,{x0:436*T,x1:500*T,dir:1,period:5.2,phase:2.2});
  E('halberd',366,16,2);E('bulwark',386,16,2);
  for(const [x,y] of [[384,8],[388,7],[392,8]])E('crow',x,y,3);
  E('flail',410,16,3);
  S(414,10,419,15,1);S(411,13,413,13,2);D('parapet',414,10,{x1:419});E('archer',417,10,1);
  E('brute',425,16,2);
  E('hound',440,16,2);E('hound',443,16,2);E('halberd',452,16,3);E('halberd',461,16,3);
  for(const [x,y] of [[455,8],[459,7],[463,8],[467,7]])E('crow',x,y,3);
  E('bulwark',466,16,1);
  S(478,12,484,15,1);S(475,13,477,13,2);D('parapet',478,12,{x1:484});E('bomber',481,12,0);
  E('brute',492,16,3);E('flail',500,16,3);E('warden',508,16,3);
  S(510,4,524,15,1);S(511,9,523,15,0);S(510,13,510,15,0);S(524,13,524,15,0);zone(511,523,.55,9);D('parapet',510,4,{x1:524});
  O('shrine',517,16,{label:'Shrine of the Barbican'});D('torch',513,12);D('torch',521,12);D('statue',514,16,{k:1});

  /* ---- E: THE BARBICAN ---- a last gauntlet, then the Siege Colossus before the great gate, with bombardiers on the gate towers */
  D('parapet',525,16,{x1:561});D('flag',530,16);D('flag',556,16);
  E('brute',535,16,2);E('bulwark',545,16,2);E('flail',553,16,2);E('crow',540,8,3);E('crow',548,7,3);
  S(562,4,563,12,1);S(658,0,659,ROWS-1,1);zone(564,657,.05,10);
  D('greatGate',615,16);
  S(572,11,576,15,1);S(569,13,571,13,2);D('parapet',572,11,{x1:576});E('bomber',574,11,0);
  S(646,11,650,15,1);S(643,13,645,13,2);D('parapet',646,11,{x1:650});E('bomber',648,11,0);
  S(596,9,602,9,2);S(626,9,632,9,2);
  E('colossus',612,16,0);
  arenas.push({gates:[563],trigger:568*T,x1:657,boss:'colossus',flag:'colossusDead',name:'Gorrath, the Siege Colossus',sub:'Chained to the gate it was built to break'});
  return{x:5*T+8,y:16*T};
}

/* ---------- shared: armored bodies you cannot walk or roll through ---------- */
const ARMORED=new Set(['warden','golem','brute','bulwark','flail','marshal','colossus']);
function bodyBlock(e){const p=P;if(p.state==='death'||e.state==='dead'||e.gone)return;const hw=e.w/2+5;
  const over=Math.abs(p.x-e.x)<hw&&p.y>e.y-e.h+6&&p.y-22<e.y;
  if(!over){e.bside=p.x<e.x?-1:1;return}
  const s=e.bside||(p.x<e.x?-1:1),nx=e.x+s*hw;
  if(!solidCode(tileAt(Math.floor((nx+s*5)/T),Math.floor((p.y-8)/T)))){p.x=nx;if(p.vx*s<0)p.vx=0}else e.x=p.x-s*hw}
function slowTurn(e,fp,dt,t){if(fp!==e.face){e.turnT+=dt;if(e.turnT>t){e.face=fp;e.turnT=0}}else e.turnT=0}
function rainAt(x,delay,dmg,rock){const fl=groundY(x,Math.min(P.y,16*T)-48)??16*T;shots.push({kind:'rain',x,y:fl-230,fl,delay,dmg,rock:!!rock,life:8,vx:0,vy:0,g:0,from:'e',w:4,h:8})}
function callAdd(t,x,e,leapY){const f=makeFoe({t,x,y:16*T,range:60*T});f.summoned=true;f.active=true;f.state='alert';f.st=0;f.sight=999;f.face=P.x>x?1:-1;foes.push(f);
  if(e&&e.t==='marshal'){f.speed*=1.15;f.fast=1}
  if(leapY){f.y=leapY;f.onGround=false;f.vy=-160;f.vx=f.face*90;dust(x,leapY,10);return f}
  for(let i=0;i<22;i++)part(x+(rnd()-.5)*16,16*T-rnd()*30,(rnd()-.5)*20,-30,.8,'#c9c2b0',{g:-5});dust(x,16*T,12);return f}
function liveAdds(){return foes.filter(f=>f.summoned&&f.state!=='dead'&&!f.gone).length}

/* ---------- IRON BRUTE: three plates that only heavy blows crack; a maul smash, a shoulder charge, an upward swat at jumpers ---------- */
function aiBrute(e,dt,dx,dy,adx,sees,leashed){
  const fp=dx>0?1:-1;bodyBlock(e);
  const above=adx<e.w/2+14&&P.y<e.y-e.h+6&&P.y>e.y-e.h-70&&P.state!=='death';
  switch(e.state){
    case 'patrol':if(sees){e.state='alert';e.st=0;e.face=fp;sfx.foe()}else patrolArea(e,dt);return;
    case 'alert':walker(e,dt,0,0);e.face=fp;if(e.st>.5)e.state='chase';return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees&&!above){e.lost+=dt;if(e.lost>2.2){e.state='return';e.lost=0}}else e.lost=0;
      if(leashed){e.state='return';return}
      if(above&&e.cd<.7){e.state='swatW';e.st=0;sfx.bossWind();return}
      slowTurn(e,fp,dt,.45);walker(e,dt,adx>36&&fp===e.face?e.face:0,e.speed);
      if(e.cd<=0&&Math.abs(dy)<24&&e.onGround&&fp===e.face){if(adx<56){e.state='smashW';e.st=0;sfx.heavyWind()}else if(adx>90&&adx<200&&rnd()<.6){e.state='chargeW';e.st=0}}return;
    case 'smashW':walker(e,dt,0,0);if(e.st>.85){e.state='smash';e.st=0;shake=6;sfx.bossSlam();dust(e.x+e.face*34,e.y,14);
        const x0=e.face>0?e.x+2:e.x-58,x1=e.face>0?e.x+58:e.x-2;if(hitPlayerBox(x0,e.y-42,x1,e.y))shove(e.dmg,e.face,240);
        shots.push({x:e.x+e.face*40,y:e.y,vx:e.face*150,vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.5,life:.9,w:10,h:14})}return;
    case 'smash':walker(e,dt,0,0);if(e.st>.15){e.state='smashR';e.st=0}return;
    case 'smashR':walker(e,dt,0,0);if(e.st>1.1){e.state='chase';e.cd=.7+rnd()*.6}return;
    case 'swatW':walker(e,dt,0,0);e.face=fp;if(e.st>.32){e.state='swat';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'swat':walker(e,dt,0,0);if(!e.hitDone&&e.st<.15&&hitPlayerBox(e.x-30,e.y-e.h-74,e.x+30,e.y-e.h+12)){e.hitDone=true;shove(e.dmg*.8,P.x>e.x?1:-1,230);if(P.state==='hurt')P.vy=-240}
      if(e.st>.55){e.state='chase';e.cd=1}return;
    case 'chargeW':walker(e,dt,0,0);e.face=fp;if(rnd()<.5){sparks(e.x-e.face*12,e.y-1,-e.face,1);sfx.scrape()}if(e.st>.7){e.state='charge';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'charge':walker(e,dt,e.face,220);if(rnd()<.6)dust(e.x-e.face*10,e.y,1);
      if(!e.hitDone&&hitPlayerBox(e.x-e.w/2-4,e.y-e.h,e.x+e.w/2+4,e.y)){e.hitDone=true;shove(e.dmg,e.face,340);if(P.state==='hurt')P.vy=-170}
      if(e.hitWall){e.state='stunned';e.st=0;shake=6;sfx.clang();sparks(e.x+e.face*12,e.y-26,-e.face,14);e.vx=0}
      else if(e.blocked||e.st>1.1){e.state='chargeR';e.st=0;e.vx=0}return;
    case 'chargeR':walker(e,dt,0,0);if(e.st>.9){e.state='chase';e.cd=.6}return;
    case 'stunned':case 'stagger':walker(e,dt,0,0);if(e.st>(e.state==='stagger'?1.3:1.6)){e.state='chase';e.cd=.4}return;
  }}
/* ---------- BULWARK: a tower shield that stops every blow from the front; a shield bash that leaves it open, a spear poke over the rim ---------- */
const BULWARK_OPEN=['open','bash','stagger','bashW'];
function aiBulwark(e,dt,dx,dy,adx,sees,leashed){
  const fp=dx>0?1:-1;bodyBlock(e);
  switch(e.state){
    case 'patrol':if(sees){e.state='alert';e.st=0;e.face=fp;sfx.foe()}else patrolArea(e,dt);return;
    case 'alert':walker(e,dt,0,0);e.face=fp;if(e.st>.4)e.state='chase';return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees){e.lost+=dt;if(e.lost>2){e.state='return';e.lost=0}}else e.lost=0;
      if(leashed){e.state='return';return}
      slowTurn(e,fp,dt,.38);walker(e,dt,adx>30&&fp===e.face?e.face:0,e.speed);
      if(e.cd<=0&&Math.abs(dy)<20&&fp===e.face){if(adx<44){e.state=rnd()<.55?'bashW':'pokeW';e.st=0}else if(adx<72&&rnd()<dt*2){e.state='pokeW';e.st=0}}return;
    case 'bashW':walker(e,dt,0,0);if(e.st>.5){e.state='bash';e.st=0;e.hitDone=false;sfx.swing()}return;
    case 'bash':walker(e,dt,e.st<.2?e.face:0,170);if(!e.hitDone&&e.st<.22){const x0=e.face>0?e.x:e.x-30,x1=e.face>0?e.x+30:e.x;if(hitPlayerBox(x0,e.y-30,x1,e.y)){e.hitDone=true;shove(e.dmg,e.face,300);sfx.clang()}}
      if(e.st>.3){e.state='open';e.st=0}return;
    case 'open':walker(e,dt,0,0);if(e.st>1.05){e.state='chase';e.cd=.8+rnd()*.5}return;
    case 'pokeW':walker(e,dt,0,0);if(e.st>.42){e.state='poke';e.st=0;e.hitDone=false;sfx.whip()}return;
    case 'poke':walker(e,dt,0,0);if(!e.hitDone&&e.st<.12){const x0=e.face>0?e.x+6:e.x-56,x1=e.face>0?e.x+56:e.x-6;if(hitPlayerBox(x0,e.y-30,x1,e.y-14)){e.hitDone=true;hurtPlayer(e.dmg*.8,e.face)}}
      if(e.st>.45){e.state='chase';e.cd=.5+rnd()*.4}return;
    case 'stagger':walker(e,dt,0,0);if(e.st>.8){e.state='chase';e.cd=.3}return;
  }}
/* ---------- FLAIL KNIGHT: a whirling ball and chain it walks into you with, then reels dizzy; a long lash ---------- */
function flailBall(e){const a=e.ang||0;if(e.state==='spin'||e.state==='spinW'){const r=e.state==='spinW'?Math.min(1,e.st/.6)*38:38;return[e.x+Math.cos(a)*r,e.y-18+Math.sin(a)*14]}
  if(e.state==='lash'){const k=Math.sin(Math.min(1,e.st/.45)*Math.PI);return[e.x+e.face*(10+k*96),e.y-16]}
  return[e.x+e.face*8,e.y-4]}
function aiFlail(e,dt,dx,dy,adx,sees,leashed){
  const fp=dx>0?1:-1;
  switch(e.state){
    case 'patrol':if(sees){e.state='alert';e.st=0;e.face=fp;sfx.foe()}else patrolArea(e,dt);return;
    case 'alert':walker(e,dt,0,0);e.face=fp;if(e.st>.4)e.state='chase';return;
    case 'return':if(sees&&!leashed){e.state='chase';return}goHome(e,dt);return;
    case 'chase':
      if(!sees){e.lost+=dt;if(e.lost>2){e.state='return';e.lost=0}}else e.lost=0;
      if(leashed){e.state='return';return}
      e.face=fp;walker(e,dt,adx>44?fp:adx<22?-fp:0,e.speed);e.face=fp;
      if(e.cd<=0&&Math.abs(dy)<24){if(adx<80&&rnd()<.55){e.state='spinW';e.ang=0}else if(adx<120)e.state='lashW';e.st=0}return;
    case 'spinW':walker(e,dt,0,0);e.ang+=dt*(4+e.st*12);if(e.st>.6){e.state='spin';e.st=0;e.tick=0}return;
    case 'spin':{e.ang+=dt*11;const want=Math.abs(dx)>12?fp:0;walker(e,dt,want,e.speed*1.5);if(want)e.face=want;
      if(Math.floor(e.ang/Math.PI)!==Math.floor((e.ang-dt*11)/Math.PI))sfx.whip();
      e.tick-=dt;const [bx,by]=flailBall(e);if(e.tick<=0&&hitPlayerBox(bx-7,by-7,bx+7,by+7)){e.tick=.45;hurtPlayer(e.dmg,bx>e.x?1:-1)}
      if(e.st>1.9){e.state='dizzy';e.st=0}return}
    case 'dizzy':walker(e,dt,0,0);if(e.st>1.25){e.state='chase';e.cd=.9+rnd()*.5}return;
    case 'lashW':walker(e,dt,0,0);e.face=fp;if(e.st>.5){e.state='lash';e.st=0;e.hitDone=false;sfx.whip()}return;
    case 'lash':{walker(e,dt,0,0);const [bx,by]=flailBall(e);if(!e.hitDone&&hitPlayerBox(bx-7,by-6,bx+7,by+6)){e.hitDone=true;shove(e.dmg,e.face,200)}
      if(e.st>.45){e.state='lashR';e.st=0}return}
    case 'lashR':walker(e,dt,0,0);if(e.st>.45){e.state='chase';e.cd=.6+rnd()*.5}return;
  }}
/* ---------- SIR VARRIC, THE IRON MARSHAL: sword combos, a lunge, a leaping slam; his horn calls reinforcements and his archers loose volleys ---------- */
function aiMarshal(e,dt,dx,dy,adx){
  const fp=dx>0?1:-1,G=16*T,L0=(arena.gates[0]+3)*T,L1=(arena.x1-2)*T;
  if(e.phase===1&&e.hp<e.max*.5){e.phase=2;banner('','The Marshal sounds the charge.');sfx.horn();shake=6;e.hornCd=0;e.volCd=Math.min(e.volCd,2.5);e.cd=0}
  const ph2=e.phase===2,sp=ph2?.7:.88;e.hornCd-=dt;e.volCd-=dt;
  const cuts=ph2?5:4;
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);return;
    case 'intro':walker(e,dt,0,0);e.face=fp;e.hornCd=2.5;e.volCd=7;for(const f of foes)if(f!==e&&!f.fast&&f.x>arena.gates[0]*T&&f.x<arena.x1*T){f.speed*=1.15;f.fast=1}if(e.st>1.6){e.state='chase';e.cd=.3}return;
    case 'chase':e.face=fp;walker(e,dt,adx>48?fp:0,e.speed*(ph2?1.4:1.15));e.face=fp;
      if(e.cd<=0){const adds=liveAdds();
        if(e.hornCd<=0&&adds<(ph2?7:5))e.state='hornW';
        else if(e.volCd<=0)e.state='volleyW';
        else if(adx<72)e.state=rnd()<.7?'cutW':'leapW';
        else e.state=rnd()<.55?'lungeW':'leapW';
        e.st=0;e.hits=0;if(e.state!=='hornW')sfx.bossWind()}return;
    case 'cutW':walker(e,dt,0,0);e.face=fp;if(e.st>(e.hits?.2:.5)*sp){e.state='cut';e.st=0;e.hitDone=false;e.vx=e.face*120;sfx.bossSweep()}return;
    case 'cut':{walker(e,dt,0,0);const last=e.hits===cuts-1;if(!e.hitDone&&e.st<.14){const r=last?70:56,x0=e.face>0?e.x:e.x-r,x1=e.face>0?e.x+r:e.x;
        if(hitPlayerBox(x0,e.y-44,x1,e.y)){e.hitDone=true;if(last)shove(e.dmg*1.2,e.face,260);else hurtPlayer(e.dmg*.8,e.face)}}
      if(e.st>.24){e.hits++;if(e.hits>=cuts){e.state='cutR';e.st=0}else{e.state='cutW';e.st=0}}return}
    case 'cutR':walker(e,dt,0,0);if(e.st>.65*sp){e.state='chase';e.cd=.25+rnd()*.35}return;
    case 'riposteW':walker(e,dt,0,0);e.face=fp;if(e.st>.22){e.state='riposte';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'riposte':walker(e,dt,e.st<.15?e.face:0,220);if(!e.hitDone&&e.st<.16){const x0=e.face>0?e.x:e.x-64,x1=e.face>0?e.x+64:e.x;if(hitPlayerBox(x0,e.y-44,x1,e.y)){e.hitDone=true;shove(e.dmg*1.25,e.face,300)}}
      if(e.st>.3){e.state='cutR';e.st=0}return;
    case 'lungeW':walker(e,dt,0,0);e.face=fp;if(e.st>.55*sp){e.state='lunge';e.st=0;e.hitDone=false;sfx.lunge()}return;
    case 'lunge':walker(e,dt,e.st<.34?e.face:0,360);if(!e.hitDone&&hitPlayerBox(e.x-14,e.y-40,e.x+14+e.face*30,e.y)){e.hitDone=true;shove(e.dmg,e.face,260)}
      if(e.st>.45){if(ph2&&rnd()<.6){e.state='cutW';e.st=0;e.hits=cuts-2}else{e.state='cutR';e.st=0}}return;
    case 'leapW':walker(e,dt,0,0);e.face=fp;if(e.st>.45*sp){e.state='leapUp';e.st=0;e.vy=-400;e.vx=clamp(dx/.85,-240,240);e.onGround=false;sfx.bossLeap()}return;
    case 'leapUp':move(e,dt);e.x=clamp(e.x,L0,L1);if(e.onGround&&e.st>.15){e.state='leapLand';e.st=0;shake=8;sfx.bossSlam();dust(e.x,e.y,18);
        if(hitPlayerBox(e.x-28,e.y-46,e.x+28,e.y))hurtPlayer(e.dmg,P.x>e.x?1:-1);
        const n=ph2?3:2;for(let k=0;k<n;k++)for(const d of [-1,1])shots.push({x:e.x+d*16,y:e.y,vx:d*(ph2?200:170)*(1-k*.3),vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.6,life:3,w:10,h:14})}return;
    case 'leapLand':walker(e,dt,0,0);if(e.st>.6*sp){if(Math.abs(P.x-e.x)<70&&rnd()<.6){e.state='cutW';e.st=0;e.hits=0}else{e.state='chase';e.cd=.3}}return;
    case 'hornW':walker(e,dt,0,0);if(e.st>.3&&!e.blown){e.blown=true;sfx.horn();shake=5;nums.push({x:e.x,y:e.y-e.h-14,v:'To arms!',t:1.2,c:C.emberL})}
      if(e.st>.9){e.blown=false;const cap=ph2?7:5,n=Math.min(ph2?4:3,cap-liveAdds()),brutes=foes.filter(f=>f.summoned&&f.t==='brute'&&f.state!=='dead'&&!f.gone).length;
        const pool=ph2?['bulwark','halberd','flail','brute','halberd']:['hollow','halberd','bulwark','flail','hollow'];
        for(let i=0;i<n;i++){const t=i===0&&brutes<(ph2?2:1)?'brute':pool[(rnd()*pool.length)|0],left=i%2===0?P.x>(L0+L1)/2:P.x<=(L0+L1)/2,off=Math.floor(i/2)*26;
          callAdd(t,left?L0+10+off:L1-10-off,e)}
        e.hornCd=ph2?9:12;e.state='hornR';e.st=0}return;
    case 'hornR':walker(e,dt,0,0);if(e.st>.45){e.state='chase';e.cd=.3}return;
    case 'volleyW':walker(e,dt,0,0);e.face=fp;if(e.st>.2&&!e.called){e.called=true;nums.push({x:e.x,y:e.y-e.h-14,v:'Loose!',t:1.1,c:C.emberL});sfx.horn()}
      if(e.st>.8){e.called=false;const n=ph2?16:10;rainAt(clamp(P.x+P.vx*.3,L0,L1),.7,e.dmg*.55);for(let i=1;i<n;i++)rainAt(clamp(P.x+(rnd()-.5)*340,L0,L1),.7+i*.06,e.dmg*.55);
        if(ph2)for(let i=0;i<4;i++)rainAt(clamp(P.x+(rnd()-.5)*120,L0,L1),1.9+i*.1,e.dmg*.55);
        e.volCd=ph2?7:9;e.state='hornR';e.st=0}return;
  }}
/* ---------- GORRATH, THE SIEGE COLOSSUS: a club that sticks in the stone, a low sweep, a stomp that brings down rubble, a ram that stuns it on a wall ---------- */
function aiColossus(e,dt,dx,dy,adx){
  const fp=dx>0?1:-1,G=16*T,L0=(arena.gates[0]+3)*T,L1=(arena.x1-3)*T;bodyBlock(e);
  if(e.phase===1&&e.hp<e.max*.66){e.phase=2;banner('','The Colossus tears free of its chains.');sfx.roar();shake=9;e.roarCd=0;e.cd=0}
  if(e.phase===2&&e.hp<e.max*.33){e.phase=3;banner('','Gorrath is enraged. The gate itself shakes.');sfx.roar();sfx.horn();shake=14;e.roarCd=0;e.cd=0;e.state='quakeW';e.st=0}
  const ph=e.phase,ph2=ph>=2,ph3=ph===3,sp=ph3?.58:ph2?.7:.85;e.roarCd-=dt;
  const above=adx<90&&P.y<e.y-56&&P.state!=='death';
  const troops=()=>foes.filter(f=>f.summoned&&f.t!=='crow'&&f.state!=='dead'&&!f.gone).length;
  const wave=(x0,d)=>shots.push({x:x0,y:G,vx:d*(ph3?240:ph2?210:180),vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.6,life:3,w:10,h:14});
  switch(e.state){
    case 'patrol':walker(e,dt,0,0);return;
    case 'intro':walker(e,dt,0,0);e.face=fp;e.roarCd=6;if(e.st>2){e.state='chase';e.cd=.4}return;
    case 'chase':slowTurn(e,fp,dt,ph3?.25:.4);walker(e,dt,adx>64&&fp===e.face?e.face:0,e.speed*(ph3?1.7:ph2?1.4:1.15));
      if(e.cd<=0){const r=rnd();
        if(e.roarCd<=0&&troops()<(ph3?5:ph2?4:2))e.state='roarW';
        else if(above)e.state=adx<60?'swatW':'stompW';
        else if(fp!==e.face)e.state='sweepW';
        else if(ph2&&r<.16)e.state='quakeW';
        else if(adx<120)e.state=r<.42?'clubW':r<.64?'sweepW':ph2&&r<.84?'chainW':'stompW';
        else e.state=ph2&&r<.35?'chainW':r<.7?'chargeW':'stompW';
        e.st=0;e.combo=0;if(e.state!=='roarW')sfx.bossWind()}return;
    case 'clubW':walker(e,dt,0,0);if(e.combo)e.face=fp;if(e.st>(e.combo?.55:.9)*sp){e.state='club';e.st=0;shake=10;sfx.bossSlam();sfx.slam();const cx=e.x+e.face*70;dust(cx,G,24);
        const x0=e.face>0?e.x+6:e.x-122,x1=e.face>0?e.x+122:e.x-6;if(hitPlayerBox(x0,e.y-64,x1,e.y))shove(e.dmg,e.face,290);
        for(const d of ph2?[-1,1]:[e.face])wave(cx+d*14,d);if(ph3)for(const d of [-1,1])shots.push({x:cx+d*14,y:G,vx:d*150,vy:0,g:0,from:'e',kind:'wave',dmg:e.dmg*.5,life:3,w:10,h:14});
        const n=ph3?6:ph2?4:2;for(let i=0;i<n;i++)rainAt(clamp(P.x+(rnd()-.5)*240,L0,L1),.55+i*.13,e.dmg*.5,1)}return;
    case 'club':walker(e,dt,0,0);if(e.st>.2){if(ph3&&!e.combo&&rnd()<.6){e.state='clubW';e.st=0;e.combo=1}else if(ph2&&rnd()<.55){e.state='sweepW';e.st=.35}else{e.state='stuck';e.st=0}}return;
    case 'stuck':walker(e,dt,0,0);if(rnd()<.2)dust(e.x+e.face*70,G,1);if(e.st>1.1*sp){e.state='chase';e.cd=.35}return;
    case 'sweepW':walker(e,dt,0,0);if(e.st>.75*sp){e.state='sweep';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'sweep':walker(e,dt,0,0);if(!e.hitDone&&e.st<.28&&hitPlayerBox(e.x-124,e.y-20,e.x+124,e.y)){e.hitDone=true;shove(e.dmg*.85,P.x>e.x?1:-1,290)}
      if(e.st>.3){if(ph3&&!e.combo&&rnd()<.5){e.combo=1;e.state='sweepW';e.st=.3}else{e.state='sweepR';e.st=0}}return;
    case 'sweepR':walker(e,dt,0,0);if(e.st>.6*sp){e.state='chase';e.cd=.3+rnd()*.3}return;
    case 'swatW':walker(e,dt,0,0);e.face=fp;if(e.st>.35*sp){e.state='swat';e.st=0;e.hitDone=false;sfx.bossSweep()}return;
    case 'swat':walker(e,dt,0,0);if(!e.hitDone&&e.st<.18){const x0=e.face>0?e.x-10:e.x-96,x1=e.face>0?e.x+96:e.x+10;if(hitPlayerBox(x0,e.y-150,x1,e.y-40)){e.hitDone=true;shove(e.dmg*.9,e.face,300);if(P.state==='hurt')P.vy=-120}}
      if(e.st>.45){e.state='sweepR';e.st=0}return;
    case 'stompW':walker(e,dt,0,0);if(e.st>.65*sp){e.state='stomp';e.st=0;shake=11;sfx.bossSlam();sfx.boom();dust(e.x,G,26);
        if(hitPlayerBox(e.x-48,e.y-30,e.x+48,e.y))hurtPlayer(e.dmg*.8,P.x>e.x?1:-1);
        for(const d of [-1,1])wave(e.x+d*26,d);
        const n=ph3?16:ph2?12:8;rainAt(clamp(P.x,L0,L1),.5,e.dmg*.55,1);rainAt(clamp(P.x+P.vx*.6,L0,L1),.75,e.dmg*.55,1);for(let i=2;i<n;i++)rainAt(L0+rnd()*(L1-L0),.55+rnd()*.8,e.dmg*.55,1)}return;
    case 'stomp':walker(e,dt,0,0);if(e.st>.8*sp){e.state='chase';e.cd=.35}return;
    case 'chainW':walker(e,dt,0,0);e.face=fp;if(e.st>.6*sp){e.state='chain';e.st=0;e.hitDone=false;sfx.whip();sfx.bossSweep()}return;
    case 'chain':{walker(e,dt,0,0);const k=Math.sin(Math.min(1,e.st/.4)*Math.PI),reach=20+k*170;if(!e.hitDone&&k>.3){const x0=e.face>0?e.x+10:e.x-reach,x1=e.face>0?e.x+reach:e.x-10;if(hitPlayerBox(x0,e.y-42,x1,e.y-14)){e.hitDone=true;shove(e.dmg*.8,e.face,320)}}
      if(e.st>.4){if(ph3&&!e.combo){e.combo=1;e.face=fp;e.state='chainW';e.st=.35*sp}else{e.state='sweepR';e.st=0}}return}
    case 'quakeW':walker(e,dt,0,0);if(rnd()<.5)dust(e.x+(rnd()-.5)*80,G,1);shake=Math.max(shake,2);if(e.st>1.1*sp){e.state='quake';e.st=0;shake=16;sfx.bossSlam();sfx.boom();sfx.roar();dust(e.x,G,40);
        if(hitPlayerBox(e.x-50,e.y-30,e.x+50,e.y))hurtPlayer(e.dmg*.8,P.x>e.x?1:-1);for(const d of [-1,1])wave(e.x+d*26,d);
        const gap=clamp(L0+60+rnd()*(L1-L0-120),L0+40,L1-40);let i=0;for(let x=L0+8;x<L1;x+=34){if(Math.abs(x-gap)<44)continue;rainAt(x,.8+(i++%6)*.06,e.dmg*.6,1)}}return;
    case 'quake':walker(e,dt,0,0);if(e.st>1*sp){e.state='chase';e.cd=.3}return;
    case 'chargeW':walker(e,dt,0,0);e.face=fp;if(rnd()<.6){sparks(e.x-e.face*18,e.y-1,-e.face,1);sfx.scrape()}if(e.st>.75*sp){e.state='charge';e.st=0;e.hitDone=false;sfx.roar()}return;
    case 'charge':e.vx=e.face*(ph3?320:ph2?285:250);move(e,dt);if(rnd()<.7)dust(e.x-e.face*16,e.y,2);shake=Math.max(shake,2);
      if(!e.hitDone&&hitPlayerBox(e.x-e.w/2-6,e.y-e.h,e.x+e.w/2+6,e.y)){e.hitDone=true;shove(e.dmg*1.1,e.face,380);if(P.state==='hurt')P.vy=-200}
      if(e.hitWall){e.vx=0;shake=12;sfx.clang();sfx.bossSlam();sparks(e.x+e.face*20,e.y-50,-e.face,22);for(let i=0;i<(ph2?7:4);i++)rainAt(e.x+(rnd()-.5)*200,.4+i*.1,e.dmg*.45,1);
        if(ph3&&!e.combo){e.combo=1;e.face=-e.face;e.state='chargeW';e.st=.4*sp}else{e.state='stunned';e.st=0}}
      else if(e.st>1.7||e.x<L0||e.x>L1){e.x=clamp(e.x,L0,L1);e.vx=0;e.state='sweepR';e.st=0}return;
    case 'stunned':walker(e,dt,0,0);if(e.st>(ph3?1.2:1.6)){e.state='chase';e.cd=.3}return;
    case 'roarW':walker(e,dt,0,0);if(e.st>.4&&!e.blown){e.blown=true;sfx.roar();shake=8}
      if(e.st>1){e.blown=false;const cap=ph3?5:ph2?4:2,n=Math.min(ph3?3:ph2?2:1,cap-troops()),pool=ph3?['brute','flail','bulwark','brute']:ph2?['brute','flail','bulwark']:['brute','flail'];
        for(let i=0;i<n;i++){const side=i%2?1:-1,x=clamp(P.x+side*(96+Math.floor(i/2)*30+rnd()*20),578*T,642*T);callAdd(pool[(rnd()*pool.length)|0],x,e,10*T)}
        for(let k=0;k<(ph3?3:2);k++){const s=k%2?1:-1,f=makeFoe({t:'crow',x:clamp(e.x+s*(80+k*20),L0,L1),y:7*T,range:40*T});f.summoned=true;f.active=true;f.state='chase';f.sight=999;foes.push(f)}
        e.roarCd=ph3?8:ph2?11:14;e.state='stomp';e.st=.3}return;
  }}
/* ---------- arrow volleys and falling rubble: a marker on the ground, then the drop ---------- */
function stepShot5(s,dt){
  if(s.kind!=='rain')return false;
  if(s.delay>0){s.delay-=dt;return true}
  s.y+=(s.rock?380:520)*dt;if(rnd()<.4)part(s.x,s.y-6,0,0,.25,s.rock?'#6a6570':'#c9c2b0',{g:0});
  if(s.y>=s.fl){s.life=0;if(s.rock){sfx.boom();shake=Math.max(shake,3);dust(s.x,s.fl,10);for(let i=0;i<8;i++)part(s.x,s.fl-4,(rnd()-.5)*120,-60-rnd()*80,.5,'#5e5a64',{g:400})}else{sparks(s.x,s.fl,0,3);sfx.thunk&&sfx.thunk()}
    const r=s.rock?16:9;if(Math.abs(P.x-s.x)<r&&Math.abs(P.y-s.fl)<26)hurtPlayer(s.dmg,P.x>s.x?1:-1)}
  return true}

/* =========================================================
   STEP
   ========================================================= */
const pressed2={};
function step(dt){
  game.time+=dt;game.banner-=dt;game.toast-=dt;shake=Math.max(0,shake-dt*22);
  if(game.fadeDir){game.fade+=dt*2.2*game.fadeDir;if(game.fade>=1&&game.fadeDir>0){game.fade=1;game.next&&game.next();game.next=null;game.fadeDir=-1}if(game.fade<=0&&game.fadeDir<0){game.fade=0;game.fadeDir=0}}
  if(hitstop>0){hitstop-=dt;dt*=.18}
  if(game.state==='play')game.runTime+=dt;
  musicDirector();
  if(game.state==='won'||game.state==='dead')game.deadT+=dt;
  if(!P)return;
  updatePlayer(dt);
  for(const e of foes)updateFoe(e,dt);
  // projectiles
  for(const s of shots){
    if(stepShot3(s,dt)||stepShot4(s,dt)||stepShot5(s,dt)||stepShotC(s,dt))continue;
    if(s.kind==='pillar'||s.kind==='hand'){if(s.delay>0){s.delay-=dt;if(s.delay<=0)sfx.pillar(s.kind==='hand');continue}s.life-=dt;
      if(!s.hit&&s.life>.12&&hitPlayerBox(s.x-6,s.floor-(s.kind==='hand'?30:46),s.x+6,s.floor)){s.hit=true;hurtPlayer(s.dmg,P.x>s.x?1:-1)}
      if(s.kind==='pillar'&&rnd()<.7)emberP(s.x+(rnd()-.5)*8,s.floor-rnd()*40,4);continue}
    if(s.kind==='cinder'&&s.delay>0){s.delay-=dt;continue}s.vy+=s.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
    if(s.kind==='cinder'){s.vy=Math.min(s.vy+900*dt,430);if(rnd()<.8)emberP(s.x,s.y-6,4);if(s.y>=s.floor){s.life=0;sparks(s.x,s.floor-2,1,6);sparks(s.x,s.floor-2,-1,6);dust(s.x,s.floor,6);sfx.impact('wisp');continue}if(P.inv<=0&&hitPlayerBox(s.x-4,s.y-10,s.x+4,s.y)){hurtPlayer(s.dmg,P.x>s.x?1:-1);s.life=0}continue}
    if(s.kind==='wave'){const tx=Math.floor((s.x+Math.sign(s.vx)*6)/T);if(solidCode(tileAt(tx,Math.floor((s.y-4)/T)))||!solidCode(tileAt(Math.floor(s.x/T),Math.floor((s.y+2)/T))))s.life=0;
      if(rnd()<.7)emberP(s.x,s.y-2,8);if(overlap(s.x-5,s.y-14,s.x+5,s.y,P.x-5,P.y-22,P.x+5,P.y)){{const h=P.hp;hurtPlayer(s.dmg,Math.sign(s.vx));if(s.stun&&P.hp<h)stunP(s.stun)}s.life=0}continue}
    if(s.kind==='bolt'&&rnd()<.6)emberP(s.x,s.y,2);
    const c=tileAt(Math.floor(s.x/T),Math.floor(s.y/T));
    if(solidCode(c)){if(s.kind==='bomb')explode(s.x,s.y);else if(s.kind==='arcaneH')arcaneBurst(s);else sparks(s.x,s.y,-Math.sign(s.vx),4);s.life=0;continue}
    if(s.from==='p'){for(const e of foes){if(e.state==='dead'||!e.active||s.hits.has(e))continue;if(overlap(s.x-s.w/2,s.y-s.h/2,s.x+s.w/2,s.y+s.h/2,e.x-e.w/2,e.y-e.h,e.x+e.w/2,e.y)){
        if(s.kind==='bomb'){explode(s.x,s.y);s.life=0;break}s.hits.add(e);damageFoe(e,s.dmg,Math.sign(s.vx),s.kind==='bolt'?120:s.kind==='arcaneH'?170:50,false);hitstop=0;if(s.kind==='arcaneH'){for(let i=0;i<10;i++)part(s.x,s.y,(rnd()-.5)*160,(rnd()-.5)*160,.3,HB_COL[i%5],{g:0,glow:1});sfx.cast()}if(!s.pierce){s.life=0;break}}}}
    else if(overlap(s.x-3,s.y-2,s.x+3,s.y+2,P.x-5,P.y-22,P.x+5,P.y)&&P.inv<=0&&P.state!=='death'){hurtPlayer(s.dmg,Math.sign(s.vx));s.life=0}}
  shots=shots.filter(s=>s.life>0);
  // items
  for(const it of items){move(it,dt);it.vx*=.9}
  // particles
  for(const q of parts){q.life-=dt;
    if(q.home&&q.max-q.life>.5&&P.state!=='death'){const dx=P.x-q.x,dy=P.y-12-q.y,d=Math.hypot(dx,dy)||1;q.vx+=dx/d*1100*dt;q.vy+=dy/d*1100*dt;q.vx*=.93;q.vy*=.93;if(d<8){q.life=0;game.embers+=q.val||1;if(rnd()<.35)sfx.ember()}}
    else{q.vy+=q.g*dt;if(q.drag){const k=1-Math.min(1,q.drag*dt);q.vx*=k;q.vy*=k}}
    q.x+=q.vx*dt;q.y+=q.vy*dt;
    if(!q.home&&q.g>100&&solidCode(tileAt(Math.floor(q.x/T),Math.floor(q.y/T)))){q.vy*=-.2;q.vx*=.4;q.y-=1}}
  parts=parts.filter(q=>q.life>0);
  for(const n of nums){n.t-=dt;n.y-=dt*22}nums=nums.filter(n=>n.t>0);
  for(const l of tempLights)l.life-=dt;tempLights=tempLights.filter(l=>l.life>0);if(tempLights.length>20)tempLights=tempLights.slice(-20);
  // ambient embers + ash
  for(const l of staticLights){if(l.warm&&Math.abs(l.x-camX-VW/2)<VW&&rnd()<dt*(l.r>70?4:1.5))emberP(l.x,l.y,6)}
  if(rnd()<dt*14){const x=camX+rnd()*VW;if(isLit(x)){if(game.level>=3){if(rnd()<.5)part(x,camY+rnd()*VH,6+rnd()*12,(rnd()-.5)*5,5,rnd()<.5?'#efe8d4':'#c9c2ae',{g:0})}else part(x,camY-4,(rnd()-.3)*14,12+rnd()*10,6,rnd()<.15?C.ember:'#4f4b56',{g:0,glow:0})}}
  // camera
  if(game.state==='title'&&game.titleScene)titleTick(dt);else{const tx=clamp(P.x-VW/2+P.face*30,0,MW*T-VW),ty=clamp(P.y-140,0,LH-VH);camX+=(tx-camX)*Math.min(1,dt*5);camY+=(ty-camY)*Math.min(1,dt*4)}
  for(const k in pressed2)pressed2[k]=false;
}
function explode(x,y){shake=6;hitstop=.035;sfx.boom();tempLights.push({x,y,r:120,life:.35,max:.35});
  for(let i=0;i<40;i++){const a=rnd()*Math.PI*2,s=40+rnd()*160;part(x,y,Math.cos(a)*s,Math.sin(a)*s-40,.4+rnd()*.5,rnd()<.5?C.ember:C.emberL,{g:200,glow:1})}
  for(const e of foes){if(e.state==='dead'||!e.active)continue;if(Math.hypot(e.x-x,e.y-e.h/2-y)<44)damageFoe(e,34*P.power,e.x>x?1:-1,140,false,'blast')}}

/* =========================================================
   DRAWING: characters
   ========================================================= */
let OX=0,OY=0;
function line(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);g.fillStyle=c;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;
  for(let i=0;i<300;i++){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}}}
function flame(x,y,s=1){x=Math.round(x);y=Math.round(y);const n=8*s;for(let i=0;i<n;i++){const ry=-(rnd()*6*s)|0,rx=Math.round((rnd()-.5)*(4*s-ry*.3));g.fillStyle=ry<-4*s?'#c4521f':ry<-2*s?C.ember:C.emberL;g.fillRect(x+rx,y+ry,1,1)}g.fillStyle=C.emberW;g.fillRect(x,y-1,1,2)}
const sx=x=>Math.round(x-camX),sy=y=>Math.round(y-camY);
/* =========================================================
   THE ASHEN KNIGHT: pose per state, drawn into a sprite buffer,
   then composited with a dark outline and a cold rim light
   ========================================================= */
const KN={pl:'#3e4149',plL:'#5a5e68',plH:'#868c98',plD:'#26282e',blk:'#0f0f13',ck:'#2d2325',ckD:'#1c1617',ckL:'#3d3030',lea:'#3a2a20',
  steel:'#8c8c94',steelL:'#cfccc2',steelD:'#53535c',eye:'#ffb04a',eyeW:'#fff0c0',ember:'#ff8c2e',emDim:'#5e3424'};
const [kc,kx]=mk(112,72),[kt,ktx]=mk(112,72);const KO={x:56,y:58};
const KR=(dx,dy,w,h,c)=>{kx.fillStyle=c;kx.fillRect(KO.x+dx,KO.y+dy,w,h)};
function kline(x0,y0,x1,y1,c){x0=Math.round(x0+KO.x);y0=Math.round(y0+KO.y);x1=Math.round(x1+KO.x);y1=Math.round(y1+KO.y);kx.fillStyle=c;
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx2=x0<x1?1:-1,sy2=y0<y1?1:-1;let err=dx+dy;
  for(let i=0;i<120;i++){kx.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx2}if(e2<=dx){err+=dx;y0+=sy2}}}
function knightPose(p){
  const t=p.animT,st=p.st,s=p.state;const q={by:0,lean:0,legs:'stand',ang:74,hx:5,hy:-12,cloak:0,eye:1,flask:false,smear:null,ph:0};
  switch(s){
    case 'idle':q.by=Math.sin(t*2.4)>.25?0:1;q.ang=76;break;
    case 'walk':q.ph=Math.sin(t*9);q.legs='walk';q.by=Math.abs(q.ph)>.8?-1:0;q.ang=64;q.cloak=1;break;
    case 'run':q.ph=Math.sin(t*14);q.legs='run';q.by=Math.abs(q.ph)>.6?-1:0;q.lean=1;q.ang=160;q.hx=1;q.hy=-12;q.cloak=3;break;
    case 'jump':q.legs='tuck';q.ang=-58;q.hx=4;q.hy=-17;q.cloak=-1;break;
    case 'fall':q.legs='dangle';q.ang=-18;q.hx=5;q.hy=-16;q.cloak=-2;break;
    case 'light':{const sw=SWORD.light[p.combo],k=clamp((st-sw.a*.5)/(sw.b-sw.a*.5),0,1),e=1-Math.pow(1-k,3);
      q.ang=sw.a0+(sw.a1-sw.a0)*e;q.lean=st<sw.a*.6?-1:1;q.legs='lunge';
      if(st>sw.a*.5&&st<sw.b+.07)q.smear={a0:sw.a0,a1:q.ang,big:sw.big,fade:st>sw.b};break}
    case 'heavy':{const sw=SWORD.heavy;
      if(st<sw.a){const k=Math.min(1,st/(sw.a*.7)),e=1-Math.pow(1-k,2);q.ang=70+(sw.a0-70)*e;q.lean=-1;q.by=1;q.eye=st>sw.a*.6&&Math.floor(st*24)%2?1.4:1}
      else{const k=clamp((st-sw.a)/(sw.b-sw.a),0,1),e=1-Math.pow(1-k,4);q.ang=sw.a0+(sw.a1-sw.a0)*e;q.lean=2;q.by=2;if(st<sw.b+.1)q.smear={a0:sw.a0,a1:q.ang,big:1,heavy:1,fade:st>sw.b}}
      q.legs='brace';break}
    case 'dodge':q.legs='roll';q.frame=Math.floor(st/.36*5)%4;break;
    case 'hurt':q.lean=-2;q.ang=112;q.hx=3;q.hy=-11;q.eye=Math.floor(st*30)%2?.3:1;q.cloak=1;break;
    case 'heal':q.legs='kneel';q.by=4;q.ang=92;q.hx=7;q.hy=-9;q.flask=st>.12&&st<.85;break;
    case 'skill':{const k=p.skillKind;q.legs='brace';
      if(k==='cast'||k==='charge'){q.lean=1;if(k==='charge')q.eye=1.4;if(p.cls==='sage'){const a=AIM.active?aimAngle(p):(p.castAng??(p.face>0?0:Math.PI));q.ang=Math.round(staffLocal(a,p.face)*180/Math.PI)}else q.ang=-20}
      else if(k==='cry'){q.ang=-95;q.eye=1.4;q.by=-1}
      else if(k==='bash'){q.ang=120;q.lean=2;q.legs='lunge';q.buckler=p.cls==='knight'}
      else if(k==='stab'){q.ang=0;q.lean=2;q.legs='lunge'}
      else if(k==='flurry'){q.ang=Math.floor(st/.09)%2?-45:40;q.lean=1;q.legs='lunge'}
      else if(k==='pray'){q.legs='kneel';q.by=4;q.ang=-80}
      else if(k==='judg'){q.ang=st<.2?-95:40;q.lean=st<.2?-1:2;q.eye=1.4}
      else if(k==='guard'){q.ang=-8;q.lean=-1}
      else if(k==='stance'||k==='thrustC'||k==='thrust'){const L=k==='thrust'?(p.thrL||0):(p.spL||0),c=p.thrCh||0;
        const kk=k==='stance'?-2:k==='thrustC'?-2-8*c:-2+12*c*(st<.18?1:Math.max(0,1-(st-.18)/.14)),G=spearGeom(L,kk);
        q.ang=Math.round(L*180/Math.PI);q.hx=Math.round(G.hx);q.hy=Math.round(G.hy);q.fixedHand=true;q.shieldUp=true;q.shX=G.shX;q.shY=G.shY;
        if(k==='thrustC'&&c>=1)q.eye=1.4;if(k==='thrust'){q.lean=1;q.legs='lunge'}}
      break}
    case 'death':if(st<.7){q.legs='kneel';q.by=5;q.lean=Math.min(2,Math.floor(st*6));q.ang=92;q.hx=7;q.hy=-8;q.eye=1-st}else{q.legs='dead';q.eye=Math.max(0,.4-(st-.7)*.25)}break;
  }
  if((p.cls==='sage'||p.cls==='sentinel')&&['idle','walk','run','jump','fall','hurt'].includes(s)){q.ang=s==='run'?-118:s==='jump'?-70:s==='fall'?-60:-80;if(s==='run'){q.hx=1}}
  if(p.cls==='rogue'&&['idle','walk'].includes(s))q.ang=50;
  if((s==='light'||s==='heavy'||s==='skill')&&!q.fixedHand){const r=q.ang*Math.PI/180;q.hx=Math.round(1+Math.cos(r)*6)+(q.hxo||0);q.hy=Math.round(-17+Math.sin(r)*5)+(q.hyo||0)}
  q.look=aimLook(p);
  return q}
function swordTip(p){const q=knightPose(p),r=q.ang*Math.PI/180;return[p.x+p.face*(q.hx+q.lean+Math.cos(r)*25),p.y+q.hy+q.by+Math.sin(r)*25]}
function kSword(hx,hy,ang){const r=ang*Math.PI/180,c=Math.cos(r),s=Math.sin(r),px=-s,py=c;
  kline(hx-c*5,hy-s*5,hx,hy,KN.lea);KR(Math.round(hx-c*6)-1,Math.round(hy-s*6)-1,2,2,KN.steelD);
  kline(hx+c*1+px*3,hy+s*1+py*3,hx+c*1-px*3,hy+s*1-py*3,KN.plL);
  kline(hx+c*2-px,hy+s*2-py,hx+c*23-px,hy+s*23-py,KN.steelD);
  kline(hx+c*2,hy+s*2,hx+c*25,hy+s*25,KN.steel);
  kline(hx+c*2+px,hy+s*2+py,hx+c*22+px,hy+s*22+py,KN.steelL);
  // battered edge: nicks and a dark fuller
  for(const L of [9,15,19]){kx.clearRect(Math.round(KO.x+hx+c*L+px),Math.round(KO.y+hy+s*L+py),1,1)}
  kx.fillStyle=KN.steelD;kx.fillRect(Math.round(KO.x+hx+c*7),Math.round(KO.y+hy+s*7),1,1);kx.fillRect(Math.round(KO.x+hx+c*12),Math.round(KO.y+hy+s*12),1,1);
  const lv=P?P.swordLv:0;if(lv>=4){kx.fillStyle=lv>=8?KN.eye:KN.ember;for(const L of lv>=8?[5,8,11,14,17,20,23]:lv>=6?[7,13,19]:[13])kx.fillRect(Math.round(KO.x+hx+c*L-px),Math.round(KO.y+hy+s*L-py),1,1)}if(lv>=10){kx.fillStyle=KN.eyeW;kx.fillRect(Math.round(KO.x+hx+c*25),Math.round(KO.y+hy+s*25),1,1)}}
function kLegs(q){const L=q.legs,a=Math.round(q.ph*(L==='run'?4:2));
  const leg=(x,y,h,c)=>{KR(x,y,3,h,c);KR(x,y+Math.max(0,h-6),3,1,KN.plL)};
  const boot=(x,y,c)=>{KR(x,y,5,2,c);KR(x+4,y+1,1,1,KN.blk)};
  if(L==='stand'){leg(-4,-10,9,KN.plD);boot(-5,-2,KN.blk);leg(1,-10,9,KN.pl);boot(1,-2,KN.plD);KR(1,-6,3,1,KN.plH)}
  else if(L==='walk'){const lift=q.ph>0?1:0;leg(-4-a,-10,9,KN.plD);boot(-5-a,-2,KN.blk);leg(1+a,-10,9-lift,KN.pl);boot(1+a,-2-lift,KN.plD);KR(1+a,-6,3,1,KN.plH)}
  else if(L==='run'){if(q.ph>0){leg(-3,-10,5,KN.plD);KR(-6,-6,4,3,KN.plD);boot(-8,-4,KN.blk);leg(1,-10,4,KN.pl);KR(3,-7,3,6,KN.pl);boot(3,-2,KN.plD)}
    else{leg(-2,-10,4,KN.plD);KR(-1,-7,3,6,KN.plD);boot(-1,-2,KN.blk);leg(1,-10,5,KN.pl);KR(-3,-6,4,3,KN.pl);boot(-6,-4,KN.plD)}}
  else if(L==='tuck'){leg(-4,-10,5,KN.plD);KR(-6,-6,3,3,KN.plD);boot(-7,-4,KN.blk);leg(1,-10,4,KN.pl);KR(3,-7,3,3,KN.pl);boot(3,-5,KN.plD)}
  else if(L==='dangle'){leg(-4,-10,9,KN.plD);boot(-5,-1,KN.blk);leg(1,-10,8,KN.pl);boot(1,-3,KN.plD)}
  else if(L==='lunge'){leg(-5,-10,5,KN.plD);KR(-7,-6,3,5,KN.plD);boot(-9,-2,KN.blk);leg(2,-10,9,KN.pl);boot(3,-2,KN.plD);KR(2,-6,3,1,KN.plH)}
  else if(L==='brace'){leg(-6,-10,5,KN.plD);KR(-8,-6,3,5,KN.plD);boot(-10,-2,KN.blk);leg(2,-10,4,KN.pl);KR(4,-7,3,6,KN.pl);boot(4,-2,KN.plD);KR(4,-5,3,1,KN.plH)}
  else if(L==='kneel'){KR(0,-8,6,3,KN.pl);KR(4,-6,3,6,KN.pl);boot(4,-2,KN.plD);KR(-5,-6,4,3,KN.plD);KR(-7,-3,7,3,KN.plD);KR(-9,-1,4,1,KN.blk)}}
function drawKnightSprite(p,q){
  const CL=PAL[p.cls]?p.cls:'knight';Object.assign(KN,PAL[CL]);
  kx.clearRect(0,0,kc.width,kc.height);const by=q.by,ln=q.lean,t=game.time,pulse=(Math.sin(t*3.2+p.x*.01)+1)/2;
  if(q.legs==='roll'){const f=q.frame,rows=[5,9,11,13,13,13,13,11,9,5];
    rows.forEach((w,i)=>KR(-Math.floor(w/2),-13+i,w,1,i<2?KN.plL:i>7?KN.plD:KN.pl));
    const ang=f*Math.PI/2-Math.PI/2,hxr=Math.round(Math.cos(ang)*4),hyr=Math.round(Math.sin(ang)*4)-8;
    const cxr=Math.round(Math.cos(ang+Math.PI)*5),cyr=Math.round(Math.sin(ang+Math.PI)*5)-8;
    KR(cxr-3,cyr-3,7,6,KN.ck);KR(cxr-4,cyr-1,2,4,KN.ckD);KR(cxr+2,cyr+2,3,2,KN.ckD);
    KR(hxr-3,hyr-3,7,6,KN.pl);KR(hxr-3,hyr-3,7,1,KN.plH);KR(hxr-3,hyr-3,1,6,KN.plD);KR(hxr-1,hyr,4,1,KN.eye);KR(hxr+1,hyr,1,1,KN.eyeW);
    kline(-7,-3,7,-12,KN.steelD);kline(-6,-3,8,-12,KN.steel);KR(-2,-6,1,1,KN.ember);return}
  if(q.legs==='dead'){KR(-12,-6,18,5,KN.pl);KR(-12,-6,18,1,KN.plL);KR(-10,-4,4,1,KN.plD);KR(6,-7,7,6,KN.pl);KR(6,-7,7,1,KN.plH);KR(9,-4,4,1,q.eye>.05?KN.emDim:KN.blk);
    if(q.eye>.15)KR(10,-4,2,1,KN.eye);KR(-14,-3,14,3,KN.ck);for(let i=0;i<14;i+=2)KR(-14+i,0,1,1,KN.ckD);KR(-4,-2,2,1,pulse>.5&&q.eye>.1?KN.ember:KN.emDim);
    kline(-18,-1,10,-1,KN.steelD);kline(-17,-2,10,-2,KN.steel);kline(10,-3,10,1,KN.plL);return}
  // cloak behind
  const ext=q.cloak>0?q.cloak:0,len=q.cloak<0?9:16+(q.legs==='kneel'?-3:0),cy0=-20+by,cx0=-8+ln-ext;
  if(q.cloak>=0){KR(cx0,cy0,5,len,KN.ck);KR(cx0+3,cy0,3,len-3,KN.ck);KR(cx0,cy0,1,len,KN.ckD);
    for(let i=0;i<6;i++){const h=1+((i*7+Math.floor(t*(4+ext*2)))%3);KR(cx0+i,cy0+len,1,h,i&1?KN.ckD:KN.ck)}
    if(ext){const fl=Math.sin(t*12)>0?1:0;KR(cx0-2,cy0+4+fl,2,len-6,KN.ck);KR(cx0-3-ext,cy0+8-fl,2,4,KN.ckD)}}
  else{const up=q.cloak===-2?4:2;KR(cx0,cy0-up,5,8,KN.ck);KR(cx0-2,cy0-up-3,3,5,KN.ck);KR(cx0-3,cy0-up-5,2,3,KN.ckD);KR(cx0+1,cy0+5,4,3,KN.ck)}
  kLegs(q);
  if(CL==='sage')sageRobe(q,ln,by,t);
  // faulds
  KR(-5+ln,-13+by,10,4,KN.pl);KR(-5+ln,-13+by,10,1,KN.plL);KR(-5+ln,-11+by,10,1,KN.plD);KR(-5+ln,-10+by,2,1,KN.plD);
  // cuirass
  KR(-5+ln,-20+by,10,7,KN.pl);KR(-5+ln,-20+by,2,7,KN.plD);KR(-1+ln,-19+by,5,3,KN.plL);KR(0+ln,-19+by,3,1,KN.plH);KR(-5+ln,-14+by,10,1,KN.lea);KR(1+ln,-14+by,2,1,'#7a5a3a');
  KR(-2+ln,-16+by,1,2,pulse>.55?KN.ember:KN.emDim);KR(3+ln,-17+by,1,1,pulse<.45?KN.ember:KN.emDim);
  // back pauldron + gorget
  KR(-7+ln,-21+by,5,4,KN.plD);KR(-7+ln,-21+by,5,1,KN.pl);KR(-3+ln,-22+by,7,2,KN.plD);
  // great helm
  const h0=-4+ln,lk=q.look||0;if(CL!=='knight'){HEADS[CL](h0,by,lk,q.eye,pulse,t)}else{KR(h0,-29+by,9,7,KN.pl);KR(h0+1,-30+by,7,1,KN.plL);KR(h0,-29+by,9,1,KN.plH);KR(h0,-29+by,2,7,KN.plD);KR(h0+8,-28+by,1,5,KN.plL);
  KR(h0+2,-23+by,7,1,KN.plD);KR(h0+3,-26+by+lk,6,1,KN.blk);
  const e=q.eye;KR(h0+4,-26+by+lk,5,1,e>.6?KN.eye:e>.15?KN.emDim:KN.blk);if(e>.6)KR(h0+7,-26+by+lk,1,1,KN.eyeW);if(e>1.2)KR(h0+9,-26+by+lk,2,1,KN.ember);
  KR(h0+6,-24+by,1,1,KN.blk);KR(h0+6,-22+by,1,1,KN.blk);KR(h0+4,-29+by,1,1,KN.plD)}
  // greatsword, then the arm over it
  EXTRA[CL](q,ln,by,t);
  const hx=q.hx+ln,hy=q.hy+by;(WDRAW[CL]||kSword)(hx,hy,q.ang);
  KR(1+ln,-21+by,6,4,KN.pl);KR(1+ln,-21+by,6,1,KN.plH);KR(6+ln,-20+by,1,3,KN.plD);KR(2+ln,-18+by,5,1,KN.plD);KR(3+ln,-20+by,1,1,pulse>.7?KN.ember:KN.plL);
  kline(3+ln,-17+by,hx,hy,KN.pl);kline(3+ln,-16+by,hx,hy+1,KN.plD);KR(hx-1,hy-1,3,3,KN.plL);KR(hx-1,hy+1,3,1,KN.plD);
  if(q.flask){kline(3+ln,-17+by,8+ln,-22+by,KN.pl);KR(7+ln,-27+by,4,5,'#1d1c22');KR(8+ln,-26+by+lk,2,3,'#c43a2e');KR(8+ln,-26+by+lk,1,1,'#ff9a6a');KR(7+ln,-28+by,4,1,'#8a8378');KR(6+ln,-23+by,2,2,KN.plL)}
}
function tintTo(src,col){ktx.globalCompositeOperation='source-over';ktx.clearRect(0,0,kt.width,kt.height);ktx.drawImage(src,0,0);ktx.globalCompositeOperation='source-in';ktx.fillStyle=col;ktx.fillRect(0,0,kt.width,kt.height);ktx.globalCompositeOperation='source-over';return kt}
function blitKnight(src,X,Y,face,ox,oy){g.save();if(face<0){g.translate(X*2,0);g.scale(-1,1)}g.drawImage(src,X-KO.x+ox*face,Y-KO.y+oy);g.restore()}
function drawPlayer(){const p=P,X=sx(p.x),Y=sy(p.y);
  // dodge afterimages
  for(const gh of p.ghosts){const q={legs:'roll',frame:gh.fr};drawKnightSprite(p,q);g.globalAlpha=gh.t*2.4;blitKnight(tintTo(kc,'#4a5568'),sx(gh.x),sy(gh.y),gh.f,0,0);g.globalAlpha=1}
  const q=knightPose(p);drawKnightSprite(p,q);
  const blink=p.inv>0&&!(p.divT>0)&&p.state!=='dodge'&&p.state!=='death'&&Math.floor(p.inv*20)%2===0;
  g.globalAlpha=hiddenP()?.32:blink?.45:1;
  const o=tintTo(kc,'#07060a');for(const [ox,oy] of [[-1,0],[1,0],[0,1],[0,-1]])blitKnight(o,X,Y,p.face,ox,oy);
  blitKnight(tintTo(kc,'#7f8899'),X,Y,p.face,0,-1);
  blitKnight(p.flashT>0?tintTo(kc,'#f4e6dc'):kc,X,Y,p.face,0,0);
  g.globalAlpha=1;
  if(q.smear){const f=p.face,HX=X+f*(q.hx+q.lean),HY=Y+q.hy+q.by,sa=d=>{const r=d*Math.PI/180;return f>0?r:Math.PI-r},acw=q.smear.a1>q.smear.a0?f<0:f>0,R0=q.smear.heavy?33:29;
    g.globalAlpha=q.smear.fade?.2:q.smear.heavy?.6:.48;g.fillStyle=q.smear.heavy?'#ffc98a':q.smear.big?'#f0dcc0':'#ddd7cb';
    g.beginPath();g.arc(HX,HY,R0,sa(q.smear.a0),sa(q.smear.a1),acw);g.arc(HX,HY,R0-(q.smear.heavy?18:14),sa(q.smear.a1),sa(q.smear.a0),!acw);g.closePath();g.fill();
    g.globalAlpha=1;if(q.smear.heavy&&!q.smear.fade&&rnd()<.6){const r=q.smear.a1*Math.PI/180;emberP(p.x+f*(q.hx+Math.cos(r)*R0),p.y+q.hy+q.by+Math.sin(r)*R0,3)}}
  drawPlayerFx(p);
}
/* ---------- enemy art ---------- */
function drawFoe(e){if(e.gone)return;const X=sx(e.x),Y=sy(e.y);if(X<-70||X>VW+70)return;const f=e.face,fl=e.flash>0;
  const R=(dx,dy,w,h,c)=>{g.fillStyle=fl?'#f2ece0':c;g.fillRect(f>0?X+dx:X-dx-w,Y+dy,w,h)};
  g.globalAlpha=(e.state==='dead'?clamp(1-(e.st-.7)/.8,0,1):1)*(e.alpha??1);
  if(e.stunT>0&&e.state!=='dead'){for(let i=0;i<3;i++){const a=game.time*6+i*2.1;g.fillStyle=i===1?'#fff2b0':'#e8d890';g.fillRect(X+Math.round(Math.cos(a)*7),Y-e.h-6+Math.round(Math.sin(a)*2),1,1)}}
  ({hollow:drawHollow,archer:drawArcher,warden:drawWardenFoe,king:drawKing,hound:drawHound,priest:drawPriest,wraith:drawWraith,matron:drawMatron,seraph:drawSeraph,golem:drawGolem,imp:drawImp,reaver:drawReaver,forgemaster:drawForgemaster,queen:drawQueen,crow:drawCrow,halberd:drawHalberd,bomber:drawBomber,bellwarden:drawBellwarden,drake:drawDrake,brute:drawBrute,bulwark:drawBulwark,flail:drawFlail,marshal:drawMarshal,colossus:drawColossus})[e.t](e,X,Y,R,f,fl);
  g.globalAlpha=1}
function swordLine(X,Y,f,ang,len,c1,c2){const r=ang*Math.PI/180,ex=X+f*Math.cos(r)*len,ey=Y+Math.sin(r)*len;line(X,Y+1,ex,ey+1,c2);line(X,Y,ex,ey,c1);return[ex,ey]}
function drawHollow(e,X,Y,R,f,fl){
  if(e.state==='dead'){const k=Math.min(1,e.st/.3);if(k<1){R(-5,-18,10,12,'#3d3833');R(-2,-23,7,5,'#6a5a4c')}R(-11,-5,20,5,'#3d3833');R(-11,-2,9,2,'#4a4850');R(7,-6,6,5,'#6a5a4c');R(-15,-1,12,1,'#7d7a82');return}
  const mv=Math.abs(e.vx)>6&&e.onGround,s=mv?Math.sin(e.t2*9):0,st=e.state;
  const lean=st==='windup'?-2:st==='strike'?3:st==='recover'?2:0,bob=st==='alert'?-1:0;
  R(-3+Math.round(s*2),-8,3,8,'#2a2626');R(1-Math.round(s*2),-8,3,8,'#33302e');R(-4+Math.round(s*2),-1,4,1,'#1a1818');R(1-Math.round(s*2),-1,4,1,'#1a1818');
  R(-6+lean,-18+bob,11,10,'#3d3833');R(-6+lean,-18+bob,2,10,'#2c2825');R(-5+lean,-11+bob,10,4,'#5a2a26');R(-5+lean,-8+bob,2,2,'#3a1c1a');R(1+lean,-8+bob,2,2,'#5a2a26');R(-5+lean,-15+bob,10,1,'#4a4850');
  R(-3+lean,-24+bob,8,6,'#6a5a4c');R(-3+lean,-24+bob,8,1,'#8a7460');R(-4+lean,-20+bob,10,1,'#4a3a30');R(-1+lean,-23+bob,6,2,'#1b1a1e');
  const eye=st==='windup'||st==='alert'?C.emberW:'#c9c2b0';R(1+lean,-22+bob,1,1,eye);R(3+lean,-22+bob,1,1,eye);R(-3+lean,-23+bob,1,3,C.rust);
  if(st==='alert'){g.fillStyle=C.emberL;g.fillRect(X-1,Y-34,2,5);g.fillRect(X-1,Y-28,2,2)}
  let ang=st==='windup'?-120-Math.min(1,e.st/.35)*30:st==='strike'?40:st==='recover'?65:35;
  const hx=X+f*(4+lean),hy=Y-14+bob;swordLine(hx,hy,f,ang,15,fl?'#fff':'#8f8b96','#4f4c55');line(hx-f*2,hy-1,hx+f*0,hy+2,C.wood);
  if(st==='windup'&&e.st>.3){g.fillStyle=C.emberW;const r=ang*Math.PI/180;g.fillRect(Math.round(hx+f*Math.cos(r)*15),Math.round(hy+Math.sin(r)*15),1,1)}
  if(st==='strike'&&e.st<.16){g.globalAlpha=.42;g.fillStyle='#e8e2d4';g.beginPath();const a0=f>0?-150*Math.PI/180:Math.PI+150*Math.PI/180,a1=f>0?40*Math.PI/180:Math.PI-40*Math.PI/180;g.arc(hx,hy,18,a0,a1,f<0);g.arc(hx,hy,9,a1,a0,f>0);g.fill();g.globalAlpha=1}
  R(2+lean,-15+bob,4,2,'#3d3833')}
function drawArcher(e,X,Y,R,f,fl){
  if(e.state==='dead'){R(-8,-3,13,3,C.boneD);R(4,-5,4,4,C.bone);R(-10,-5,8,3,'#2e2a2e');R(-4,-2,1,1,C.bone);R(0,-2,1,1,C.bone);return}
  const mv=Math.abs(e.vx)>6&&e.onGround,s=mv?Math.sin(e.t2*11):0;
  R(-2+Math.round(s*2),-9,1,9,C.boneD);R(1-Math.round(s*2),-9,1,9,C.bone);R(-4,-12,8,3,C.boneD);
  R(-4,-19,8,8,'#2e2a2e');R(-5,-12,3,5,'#262226');R(2,-11,2,4,'#262226');for(let i=-3;i<3;i+=2)R(i,-17,1,4,C.boneD);
  R(-4,-26,8,8,'#2e2a2e');R(-3,-27,6,1,'#4a4450');R(-4,-26,1,2,'#4a4450');R(-5,-24,2,6,'#262226');R(0,-24,4,4,C.bone);R(1,-23,1,1,'#120f12');R(3,-23,1,1,'#120f12');R(1,-23,1,1,e.state==='aim'?C.ember:'#9fc3cf');R(3,-23,1,1,e.state==='aim'?C.emberW:'#c9e0e6');R(1,-21,3,1,C.boneD);
  R(-6,-18,3,9,'#3a2a20');R(-6,-19,3,1,C.woodL);for(let i=0;i<3;i++)R(-5+i,-22-i,1,3,'#8a7a5a');
  const drawn=e.state==='aim',k=drawn?Math.min(4,e.st*7):0,bx=X+f*6,by=Y-16;
  g.fillStyle=fl?'#fff':C.woodL;for(let i=-7;i<=7;i++)g.fillRect(bx+f*Math.round(2-i*i/20),by+i,1,1);
  line(bx-f*k,by,bx,by-7,'#8f8b96');line(bx-f*k,by,bx,by+7,'#8f8b96');
  if(drawn){line(bx-f*k,by,bx+f*4,by,C.woodL);g.fillStyle='#c9c2b0';g.fillRect(bx+f*4,by,1,1)}
  R(3,-17,3,1,C.bone);
  if(drawn&&e.aim&&e.st>.12){g.globalAlpha=e.st>.6?(Math.floor(e.st*20)%2?.65:.25):.25;line(bx,by,sx(e.aim.x),sy(e.aim.y),'#c0392b');g.globalAlpha=1}}
function drawWardenFoe(e,X,Y,R,f,fl){
  const A='#4a4650',AL='#66616e',AH='#8a8592',AD='#2e2b33',BR='#5e4a32',BRL='#8a6a42';
  if(e.state==='dead'){R(-14,-7,26,7,A);R(-14,-7,26,1,AL);R(8,-9,8,7,AD);R(-18,-3,10,3,BR);R(-20,-2,4,2,BRL);return}
  const st=e.state,mv=Math.abs(e.vx)>3&&e.onGround,s=mv?Math.sin(e.t2*5):0,a=Math.round(s*2);
  const crouch=st==='stuck'?4:st==='strike'?2:st==='stagger'?2:0,lean=st==='stuck'?4:st==='strike'?3:st==='windup'?-2:st==='stagger'?-3:0;
  // legs
  R(-6-a,-11,5,11,AD);R(-7-a,-2,7,2,'#1e1c22');R(2+a,-11,5,11,A);R(2+a,-2,7,2,AD);R(3+a,-8,3,1,AH);
  // body
  R(-8+lean,-25+crouch,15,14,A);R(-8+lean,-25+crouch,15,2,AL);R(-8+lean,-25+crouch,3,14,AD);R(-1+lean,-22+crouch,6,4,AL);R(-7+lean,-13+crouch,14,2,'#2a2420');
  R(-9+lean,-12+crouch,16,3,'#3a2e2a');
  // helm
  R(-4+lean,-33+crouch,10,9,A);R(-4+lean,-33+crouch,10,2,AH);R(-4+lean,-33+crouch,2,9,AD);R(0+lean,-29+crouch,6,1,'#0f0e12');R(3+lean,-29+crouch,2,1,st==='windup'?C.emberW:'#a8603a');R(1+lean,-35+crouch,3,2,AL);
  // hammer
  let ang=st==='windup'?-95-Math.min(1,e.st/.5)*10:st==='strike'?(e.st<.1?-40+e.st*1300:90):st==='stuck'?92:st==='recover'?80:st==='stagger'?120:150;
  if(st==='patrol'||st==='chase'||st==='turn'||st==='return')ang=130+Math.sin(e.t2*2)*4;
  const hx=X+f*(3+lean),hy=Y-20+crouch,r=ang*Math.PI/180,ex=hx+f*Math.cos(r)*20,ey=hy+Math.sin(r)*20;
  line(hx,hy,ex,ey,C.woodD);line(hx,hy+1,ex,ey+1,C.wood);
  const hx2=Math.round(ex),hy2=Math.round(ey);g.fillStyle=fl?'#fff':AD;g.fillRect(hx2-4,hy2-4,9,8);g.fillStyle=fl?'#fff':AL;g.fillRect(hx2-4,hy2-4,9,1);g.fillStyle=C.rust;g.fillRect(hx2-3,hy2+2,4,1);
  if(st==='windup'&&e.st>.55){g.fillStyle=C.emberL;g.fillRect(hx2-1,hy2-6,2,1)}
  if(st==='strike'&&e.st<.22){g.globalAlpha=.4;g.fillStyle='#e8e2d4';g.fillRect(f>0?hx:hx-38,hy-6,38,3);g.globalAlpha=1}
  // tower shield (front), lowered when stuck or staggered
  const shieldDown=st==='stuck'||st==='stagger'||st==='strike',sxo=shieldDown?8:7,syo=shieldDown?-14:-27;
  if(!shieldDown||st==='strike'){R(sxo+lean,syo+crouch,5,22,BR);R(sxo+lean,syo+crouch,5,1,BRL);R(sxo+4+lean,syo+crouch,1,22,'#3a2c1e');R(sxo+1+lean,syo+8+crouch,3,4,'#3a2c1e');R(sxo+2+lean,syo+9+crouch,1,2,C.emberL)}
  else{R(sxo-2,-8,14,4,BR);R(sxo-2,-8,14,1,BRL)}
  if(st==='stuck'||st==='stagger'){for(let i=0;i<3;i++){const a3=game.time*5+i*2.1;g.fillStyle=C.emberL;g.fillRect(X+Math.round(Math.cos(a3)*7),Y-40+crouch+Math.round(Math.sin(a3)*2),1,1)}}}
function drawKing(e,X,Y,R,f,fl){
  const A='#2f2c33',AL='#4a4650',AH='#6a6570',AD='#1c1a20',CR='#5a1418',CRD='#3a0c10',EM=C.ember;const pulse=(Math.sin(game.time*4)+1)/2;
  if(e.state==='dead'){R(-20,-9,38,9,A);R(-20,-9,38,1,AL);R(12,-12,10,9,AD);R(14,-15,2,3,'#3a3540');R(18,-15,2,3,'#3a3540');R(-24,-4,16,4,CR);line(X-f*26,Y-2,X+f*24,Y-2,'#6a3020');return}
  const st=e.state,mv=Math.abs(e.vx)>8&&e.onGround,s=mv?Math.sin(e.t2*6):0,a=Math.round(s*3);
  const crouch=st==='slamW'||st==='slam'?5:st==='stunned'?6:st==='intro'?(e.st<1?4:0):0,lean=st==='charge'?5:st==='chargeW'?-3:st==='sweepW'?-2:st==='sweep'?3:0;
  // cape
  R(-15+lean,-40+crouch,7,36,CR);R(-17+lean,-14+crouch,5,10,CRD);R(-15+lean,-4,2,3,CRD);R(-11+lean,-5,2,3,CR);R(-15+lean,-40+crouch,2,36,CRD);
  // legs
  R(-8-a,-15,7,15,AD);R(-9-a,-2,9,2,'#111014');R(2+a,-15,7,15,A);R(2+a,-2,9,2,AD);R(3+a,-11,4,1,AH);R(4+a,-7,1,1,EM);
  // torso with ember fissures
  R(-11+lean,-36+crouch,22,21,A);R(-11+lean,-36+crouch,22,2,AL);R(-11+lean,-36+crouch,3,21,AD);R(-2+lean,-32+crouch,9,4,AL);
  R(-4+lean,-27+crouch,1,6,pulse>.4?EM:'#7a2a14');R(-3+lean,-22+crouch,3,1,pulse>.4?EM:'#7a2a14');R(4+lean,-30+crouch,1,4,pulse<.6?EM:'#7a2a14');R(-11+lean,-16+crouch,22,2,'#1a1418');
  R(-14+lean,-38+crouch,9,7,AL);R(-14+lean,-38+crouch,9,1,AH);R(5+lean,-38+crouch,9,7,A);R(7+lean,-35+crouch,4,1,EM);
  // helm and iron crown
  R(-5+lean,-47+crouch,12,11,A);R(-5+lean,-47+crouch,12,2,AL);R(-5+lean,-47+crouch,2,11,AD);R(0+lean,-42+crouch,7,2,'#0b0a0d');
  const vis=st==='stunned'?'#6a3a22':st.endsWith('W')?C.emberW:EM;R(2+lean,-42+crouch,5,1,vis);
  R(-6+lean,-49+crouch,14,2,'#3a3540');for(const k of [-5,-1,3,7]){R(k+lean,-53+crouch,2,4,'#3a3540');R(k+lean,-54+crouch,2,1,pulse>.3?EM:C.emberL)}
  // cinder greatsword
  let ang;
  if(st==='sweepW')ang=-160;else if(st==='sweep'){const k=Math.min(1,e.st/.2);ang=-160+k*230}else if(st==='slamW'||st==='slamUp')ang=-95;else if(st==='slam')ang=88;
  else if(st==='chargeW')ang=165;else if(st==='charge')ang=8;else if(st==='rainW')ang=-90;else if(st==='stunned')ang=95;else ang=60+Math.sin(e.t2*2)*4;
  const hx=X+f*(8+lean),hy=Y-26+crouch,r=ang*Math.PI/180,L=38,ex=hx+f*Math.cos(r)*L,ey=hy+Math.sin(r)*L,px=-Math.sin(r),py=Math.cos(r);
  line(hx-f*Math.cos(r)*6,hy-Math.sin(r)*6,hx,hy,'#3a2a20');line(hx+f*px*4,hy-py*4,hx-f*px*4,hy+py*4,'#4a4650');
  line(hx+f*(Math.cos(r)*2-px),hy+Math.sin(r)*2-py,ex-f*px,ey-py,'#1a1418');line(hx+f*Math.cos(r)*2,hy+Math.sin(r)*2,ex,ey,'#2a2228');line(hx+f*(Math.cos(r)*2+px),hy+Math.sin(r)*2+py,ex+f*px,ey+py,pulse>.3?EM:'#c4521f');
  if(fl){g.globalAlpha=.6;line(hx,hy,ex,ey,'#fff');g.globalAlpha=1}
  if(st==='sweep'&&e.st<.25){g.globalAlpha=.4;g.fillStyle='#ffc98a';g.beginPath();const s0=f>0?-160*Math.PI/180:Math.PI+160*Math.PI/180,s1=f>0?r:Math.PI-r;g.arc(hx,hy,L,s0,s1,f<0);g.arc(hx,hy,L-14,s1,s0,f>0);g.fill();g.globalAlpha=1}
  if(st==='rainW'||st.endsWith('W')){if(rnd()<.5)emberP(e.x+f*(8+Math.cos(r)*L),e.y-26+crouch+Math.sin(r)*L,4)}
  R(9+lean,-31+crouch,5,5,AL);
  if(st==='stunned'){for(let i=0;i<3;i++){const a3=game.time*5+i*2.1;g.fillStyle=C.emberL;g.fillRect(X+Math.round(Math.cos(a3)*10),Y-58+crouch+Math.round(Math.sin(a3)*2),1,1)}}}
function drawLiveDecor(){
  const t=game.time,L=camX-40,Rr=camX+VW+40;
  for(const d of decorLive){if((d.x??d.x0)<L-80||(d.x??d.x0)>Rr+80)continue;
    if(d.t==='torch'){flame(sx(d.x),sy(d.y-1),1.1)}
    else if(d.t==='brazier'){flame(sx(d.x)-2,sy(d.y-15),1.4);flame(sx(d.x)+2,sy(d.y-15),1.3)}
    else if(d.t==='candles'){for(let i=-5;i<=5;i+=3)if(rnd()<.9){g.fillStyle=rnd()<.5?C.emberL:C.ember;g.fillRect(sx(d.x)+i,sy(d.y)-9+(rnd()<.5?1:0),1,2)}}
    else if(d.t==='chain'){const n=Math.floor(d.len/3);const sw=Math.sin(t*1.2+d.x*.05)*n*.08;let px=0;
      for(let i=0;i<n;i++){px=Math.round(sw*(i/n)*(i/n)*3);g.fillStyle=i&1?C.ironL:C.iron;g.fillRect(sx(d.x)+px-(i&1?0:1),sy(d.y)+i*3,i&1?1:3,i&1?3:2)}
      const ex=sx(d.x)+px,ey=sy(d.y)+n*3;
      if(d.end==='hook'){g.fillStyle=C.ironL;g.fillRect(ex,ey,1,4);g.fillRect(ex+1,ey+4,2,1);g.fillRect(ex+3,ey+2,1,2)}
      else if(d.end==='cage'){g.fillStyle=C.iron;g.fillRect(ex-6,ey,13,2);g.fillRect(ex-6,ey+17,13,2);for(let k=-6;k<=6;k+=3)g.fillRect(ex+k,ey+1,1,17);g.fillStyle=C.rust;g.fillRect(ex-6,ey+1,13,1);
        g.fillStyle=C.bone;g.fillRect(ex-2,ey+11,3,3);g.fillRect(ex-3,ey+15,6,2);g.fillStyle='#120f12';g.fillRect(ex-1,ey+12,1,1)}}
    else if(d.t==='gibbet'&&d.live){const sw=Math.round(Math.sin(t*.9+d.x)*2);const x=sx(d.live.x),y=sy(d.live.y);for(let i=0;i<5;i++){g.fillStyle=i&1?C.ironL:C.iron;g.fillRect(x+Math.round(sw*i/5),y+i*3,i&1?1:2,3)}
      const cx=x+sw,cy=y+15;g.fillStyle=C.iron;g.fillRect(cx-5,cy,11,2);g.fillRect(cx-5,cy+20,11,2);for(let k=-5;k<=5;k+=2)g.fillRect(cx+k,cy+1,1,19);g.fillStyle=C.rust;g.fillRect(cx-5,cy+10,11,1);g.fillStyle=C.bone;g.fillRect(cx-1,cy+4,3,3)}
  }
  
}
/* ---------- authored set pieces ---------- */
const DECOR2={
  gatehouse(c,d,r){const tower=(x0,top,w,broken)=>{
      c.fillStyle='#2a2830';c.fillRect(x0,top,w,16*T-top);c.fillStyle='#34313b';c.fillRect(x0,top,3,16*T-top);c.fillStyle='#1f1d24';c.fillRect(x0+w-3,top,3,16*T-top);
      c.fillStyle='#212027';for(let y=top+8;y<16*T;y+=8){c.fillRect(x0,y,w,1);for(let x=x0+((y/8)&1)*6;x<x0+w;x+=12)c.fillRect(x,y-7,1,7)}
      c.fillStyle='#2a2830';for(let x=x0;x<x0+w;x+=10)c.fillRect(x,top-8,6,8);
      c.fillStyle='#0c0c10';for(const y of [top+18,top+60,top+102]){c.fillRect(x0+w/2-1,y,3,12);c.fillRect(x0+w/2-3,y+4,7,2)}
      if(rnd()<2&&top+102<16*T){c.fillStyle='#c9772e';c.fillRect(x0+w/2,top+64,1,2)}
      if(broken){c.globalCompositeOperation='destination-out';c.beginPath();c.moveTo(x0-2,top-9);for(let x=0;x<=w+4;x+=4)c.lineTo(x0-2+x,top+8+r()*24);c.lineTo(x0+w+2,top-9);c.fill();c.globalCompositeOperation='source-over'}};
    tower(11*T+4,2*T,40,false);tower(20*T+12,3*T,40,true);
    c.fillStyle='#14131a';c.fillRect(13*T,9*T,9*T,7*T);c.fillStyle='#1a1920';c.fillRect(13*T,9*T,9*T,2)},
  portcullis(c,d){const y=9*T;c.fillStyle=C.iron;for(let x=13*T+3;x<22*T;x+=5){c.fillRect(x,y,2,10);c.fillStyle=C.ironL;c.fillRect(x,y+9,2,2);c.fillStyle=C.iron}c.fillRect(13*T,y+3,9*T,2);c.fillStyle=C.rust;c.fillRect(13*T,y+5,9*T,1)},
  cell(c,d,r){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle='#0b0a0f';c.fillRect(x-15,y-44,30,44);c.beginPath();c.moveTo(x-15,y-44);c.quadraticCurveTo(x,y-58,x+15,y-44);c.fill();
    c.fillStyle='#2e2c34';c.fillRect(x-17,y-46,2,46);c.fillRect(x+15,y-46,2,46);
    c.fillStyle=C.bone;c.fillRect(x-8,y-12,4,4);c.fillStyle='#0b0a0f';c.fillRect(x-7,y-11,1,1);c.fillStyle=C.boneD;c.fillRect(x-9,y-8,8,2);c.fillRect(x-6,y-6,1,6);c.fillRect(x-4,y-3,6,1);
    c.fillStyle=C.iron;for(let k=-14;k<=14;k+=4)c.fillRect(x+k,y-48,2,48);c.fillRect(x-15,y-36,30,2);c.fillRect(x-15,y-14,30,2);c.fillStyle=C.ironL;for(let k=-14;k<=14;k+=4)c.fillRect(x+k,y-48,1,48);
    c.fillStyle=C.rust;c.fillRect(x+6,y-14,4,2);c.fillRect(x-12,y-36,3,2)},
  throne(c,d,r){const x=Math.round(d.x),y=Math.round(d.y);const S1='#3a3742',S2='#4a4752',S3='#2a2830';
    c.fillStyle=S3;c.fillRect(x-20,y-6,40,6);c.fillStyle=S2;c.fillRect(x-20,y-6,40,1);
    c.fillStyle=S1;c.fillRect(x-14,y-62,28,46);c.fillStyle=S2;c.fillRect(x-14,y-62,4,46);
    for(const k of [-14,-3,8]){c.fillStyle=S1;c.fillRect(x+k,y-70,6,10);c.beginPath();c.moveTo(x+k-1,y-70);c.lineTo(x+k+3,y-82-(k===-3?8:0));c.lineTo(x+k+7,y-70);c.fill()}
    c.fillStyle=S2;c.fillRect(x-18,y-24,36,8);c.fillRect(x-20,y-34,6,18);c.fillRect(x+14,y-34,6,18);c.fillStyle=S1;c.fillRect(x-18,y-16,36,10);
    c.fillStyle='#3a1014';c.fillRect(x-11,y-56,22,30);c.fillStyle='#2a0a0e';c.fillRect(x-11,y-30,22,4);
    c.fillStyle='#ff8c2e';for(const [a,b,h] of [[-6,-48,6],[4,-40,8],[-2,-20,4],[10,-58,5]]){c.fillRect(x+a,y+b,1,h)}c.fillStyle='#ffc368';c.fillRect(x-6,y-46,1,2);
    c.fillStyle=C.boneD;c.fillRect(x+16,y-8,5,2);c.fillStyle=C.bone;c.fillRect(x+18,y-11,4,3)},
  brokenPillar(c,d,r){const x=Math.round(d.x),y=Math.round(d.y),h=d.h;c.fillStyle='#26242c';c.fillRect(x-7,y-h,14,h);c.fillStyle='#302e37';c.fillRect(x-7,y-h,3,h);c.fillStyle='#1b1a20';c.fillRect(x+5,y-h,2,h);
    c.fillStyle='#1b1a20';for(let k=x-3;k<x+5;k+=3)c.fillRect(k,y-h+6,1,h-14);c.fillStyle='#2f2d36';c.fillRect(x-9,y-6,18,6);c.fillStyle='#3a3842';c.fillRect(x-9,y-6,18,1);
    c.globalCompositeOperation='destination-out';c.beginPath();c.moveTo(x-9,y-h-2);for(let k=0;k<=18;k+=3)c.lineTo(x-9+k,y-h+2+r()*12);c.lineTo(x+9,y-h-2);c.fill();c.globalCompositeOperation='source-over'},
  fallenPillar(c,d){const x=Math.round(d.x),y=Math.round(d.y);for(let i=0;i<3;i++){const px=x-26+i*18;c.fillStyle='#2f2d36';c.fillRect(px,y-12,16,12);c.fillStyle='#3a3842';c.fillRect(px,y-12,16,2);c.fillStyle='#1f1d24';c.fillRect(px+15,y-12,1,12);for(let k=px+3;k<px+15;k+=4)c.fillRect(k,y-9,1,8)}},
  anvil(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle='#2f2d36';c.fillRect(x-5,y-6,10,6);c.fillStyle=C.iron;c.fillRect(x-8,y-11,16,5);c.fillRect(x+8,y-10,4,2);c.fillStyle=C.ironL;c.fillRect(x-8,y-11,16,1);c.fillStyle=C.rust;c.fillRect(x-6,y-7,3,1)}
};
/* ---------- Level 2 set pieces ---------- */
Object.assign(DECOR2,{
  skullwall(c,d,r){const x=Math.round(d.x),y=Math.round(d.y);
    for(let row=0;row<4;row++)for(let col=-2;col<=2;col++){const nx=x+col*14-6,ny=y-96+row*18;
      c.fillStyle='#0d0c11';c.fillRect(nx,ny+3,12,13);c.beginPath();c.moveTo(nx,ny+4);c.quadraticCurveTo(nx+6,ny-3,nx+12,ny+4);c.fill();
      c.fillStyle='#2e2c34';c.fillRect(nx-1,ny+16,14,2);
      if(r()<.82){const k=r()<.5;c.fillStyle=k?C.boneD:'#6e6858';c.fillRect(nx+3,ny+8,6,5);c.fillRect(nx+4,ny+13,4,2);c.fillStyle='#0d0c11';c.fillRect(nx+4,ny+9,1,2);c.fillRect(nx+7,ny+9,1,2);c.fillRect(nx+5,ny+13,1,1)}
      if(r()<.3){c.fillStyle='#6e6858';c.fillRect(nx+1,ny+14,10,1)}}},
  bonepile(c,d,r){const x=Math.round(d.x),y=Math.round(d.y);for(let i=0;i<14;i++){c.fillStyle=r()<.5?C.boneD:'#6e6858';c.fillRect(x-12+r()*24|0,y-2-r()*6|0,3+r()*5|0,1+(r()<.4?1:0))}
    c.fillStyle=C.bone;c.fillRect(x-3,y-9,6,5);c.fillStyle='#0d0c11';c.fillRect(x-2,y-8,1,2);c.fillRect(x+1,y-8,1,2);c.fillStyle=C.boneD;c.fillRect(x+4,y-5,5,4);c.fillStyle='#0d0c11';c.fillRect(x+5,y-4,1,1)},
  emberglow(c,d,r){const x=Math.round(d.x),y0=(ROWS-4)*T;const cols=['#1a0e0c','#2a1410','#3e1a10','#5a2412','#7a3214'];
    for(let y=y0;y<LH;y++){const k=Math.min(cols.length-1,Math.floor((y-y0)/(LH-y0)*cols.length));for(let xx=x-40;xx<x+40;xx+=2){if(((xx>>1)+y)%(5-k%3)===0||k>=3){c.fillStyle=cols[k];c.fillRect(xx,y,2,1)}}}
    for(let i=0;i<30;i++){c.fillStyle=r()<.5?C.ember:'#c4521f';c.fillRect(x-36+r()*72|0,LH-2-r()*20|0,1,1)}},
  organ(c,d,r){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle='#24222a';c.fillRect(x-60,y-30,120,30);c.fillStyle='#2f2d36';c.fillRect(x-60,y-30,120,2);
    for(let i=-9;i<=9;i++){const h=60+Math.round((1-Math.abs(i)/10)*90+(i&1?-10:0));const px=x+i*6-2;c.fillStyle='#3a3740';c.fillRect(px,y-30-h,5,h);c.fillStyle='#4e4a55';c.fillRect(px,y-30-h,1,h);c.fillStyle='#16151a';c.fillRect(px+1,y-30-h+6,3,3);c.fillStyle=C.rust;if(r()<.4)c.fillRect(px+2,y-30-r()*h|0,1,3)}
    c.fillStyle='#2a1a1c';c.fillRect(x-40,y-20,80,10);c.fillStyle=C.boneD;for(let k=-36;k<36;k+=4)c.fillRect(x+k,y-19,3,2)},
  stairDown(c,d){const x=Math.round(d.x),y=Math.round(d.y);for(let i=0;i<8;i++){c.fillStyle=i&1?'#2a2830':'#25232b';c.fillRect(x-40+i*8,y-140+i*16,30,16);c.fillStyle='#34313b';c.fillRect(x-40+i*8,y-140+i*16,30,1)}
    c.fillStyle='#0b0a0f';c.fillRect(x-44,y-150,6,150)},
  pyre(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle='#2a2830';c.fillRect(x-30,y-14,60,14);c.fillStyle='#3a3742';c.fillRect(x-30,y-14,60,2);c.fillRect(x-24,y-24,48,10);c.fillStyle='#4a4752';c.fillRect(x-24,y-24,48,1);
    c.fillStyle=C.woodD;for(let i=0;i<5;i++)c.fillRect(x-20+i*2,y-34+i*0,40-i*4,3);c.fillStyle=C.wood;c.fillRect(x-18,y-30,36,2);c.fillRect(x-14,y-36,28,2);
    c.fillStyle='#3a2a20';c.fillRect(x-2,y-60,4,26);c.fillRect(x-10,y-54,20,3);c.fillStyle=C.boneD;c.fillRect(x-1,y-66,3,6)}
});
const SERAPH_FLAMES=new Set(['pyre']);
function drawLiveDecor2(){for(const d of decorLive){if(d.t!=='pyre')continue;const X=sx(d.x),Y=sy(d.y);if(X<-60||X>VW+60)continue;flame(X-10,Y-36,1.8);flame(X,Y-38,2.2);flame(X+10,Y-36,1.7);if(rnd()<.5)emberP(d.x+(rnd()-.5)*20,d.y-44,10)}}
/* ---------- new foes ---------- */
function alertMark(X,Y,h){g.fillStyle=C.emberL;g.fillRect(X-1,Y-h-10,2,5);g.fillRect(X-1,Y-h-4,2,2)}
function drawHound(e,X,Y,R,f,fl){const ash='#47424a',ashD='#2e2a32',ashL='#6a6470',pulse=Math.sin(game.time*5+e.x)>0;
  if(e.state==='dead'){R(-10,-4,20,4,ashD);R(6,-6,6,5,ash);R(-3,-3,4,1,'#7a2a14');R(-12,-2,4,1,ash);return}
  const st=e.state;
  if(st==='lunge'){R(-10,-12,18,6,ash);R(-10,-12,18,1,ashL);R(-4,-10,3,1,C.ember);R(7,-14,7,5,ash);R(12,-12,3,2,ash);R(10,-13,1,1,C.emberW);R(12,-10,3,1,'#120f12');R(13,-10,1,1,C.bone);
    R(6,-8,6,2,ashD);R(-15,-9,6,2,ashD);R(-15,-13,5,1,ash);return}
  const run=Math.abs(e.vx)>10&&e.onGround,s=run?Math.sin(e.t2*16):0,a=Math.round(s*2),c=st==='crouch'?3:0,sit=st==='recover'?2:0;
  R(-8+a,-6+c,2,6-c,ashD);R(-5-a,-6+c,2,6-c,ash);R(4+a,-6,2,6,ashD);R(6-a,-6,2,6,ash);
  R(-9,-11+c+sit,16,6,ash);R(-9,-11+c+sit,16,1,ashL);R(-7,-12+c+sit,1,1,ashL);R(-4,-13+c+sit,1,2,ashL);R(-1,-12+c+sit,1,1,ashL);
  R(-5,-9+c+sit,3,1,pulse?C.ember:'#6a2a14');R(1,-8+c+sit,2,1,pulse?'#6a2a14':C.ember);
  const hy=-14+Math.round(c*1.4);R(5,hy,6,5,ash);R(10,hy+2,3,2,ash);R(5,hy-1,2,2,ashD);R(8,hy+1,1,1,st==='crouch'?C.emberW:C.ember);
  if(st==='crouch'||st==='alert'){R(10,hy+4,3,1,'#120f12');R(11,hy+4,1,1,C.bone)}
  R(-13,-12+c+sit+Math.round(Math.sin(e.t2*8)),4,1,ash);if(st==='alert')alertMark(X,Y,14)}
function drawPriest(e,X,Y,R,f,fl){const robe='#2c2228',robeD='#1e171c',trim='#6a2a24',st=e.state;
  if(st==='dead'){R(-11,-5,22,5,robe);R(-11,-5,22,1,trim);R(8,-6,5,4,C.bone);R(-14,-2,6,2,C.iron);return}
  R(-6,-21,12,21,robe);R(-7,-4,14,4,robeD);R(-3,-19,1,16,robeD);R(2,-17,1,14,robeD);R(-6,-21,12,1,trim);R(-6,-12,12,1,trim);R(-6,-1,14,1,trim);
  R(-5,-29,10,8,robe);R(-4,-30,8,1,robe);R(-6,-27,1,5,robeD);R(0,-27,4,5,C.bone);R(0,-23,4,1,C.boneD);
  const hot=st==='cast'||st==='burstW';R(1,-26,1,1,hot?C.emberW:'#120f12');R(3,-26,1,1,hot?C.ember:'#120f12');
  let hx,hy,cx,cy;if(st==='cast'||st==='castR'){hx=4;hy=-34;cx=hx+Math.round(Math.sin(game.time*9)*2);cy=hy-6}else{hx=6;hy=-14;cx=hx+2+Math.round(Math.sin(e.t2*3)*3);cy=hy+6}
  R(3,-20,3,2,robe);if(st==='cast'||st==='castR'){R(3,-30,2,10,robe)}R(hx,hy,2,2,C.boneD);
  const X2=f>0?X+cx:X-cx,Y2=Y+cy;line(f>0?X+hx:X-hx,Y+hy,X2,Y2,C.iron);g.fillStyle=fl?'#fff':C.iron;g.fillRect(X2-2,Y2,5,4);g.fillStyle=C.ironL;g.fillRect(X2-2,Y2,5,1);g.fillStyle=C.ember;g.fillRect(X2,Y2+2,1,1);
  if(hot)flame(X2,Y2-1,.9);
  if(st==='burstW'){const rr=Math.round(40*(1-e.st/.55));g.fillStyle=C.ember;for(let a=0;a<16;a++){const t=a/16*Math.PI*2;g.fillRect(X+Math.round(Math.cos(t)*rr),Y-14+Math.round(Math.sin(t)*rr*.6),1,1)}}
  if(st==='chase'&&e.st<.4&&e.lost===0&&e.cd>1.5)alertMark(X,Y,30)}
function drawWraith(e,X,Y,R,f,fl){const st=e.state,body=st==='rest'?'#211d27':'#2a2632',hood='#1d1a22',eye=st==='markW'||st==='dive'?C.emberW:st==='rest'?'#6a2a14':C.ember;
  if(st==='dead')return;
  if(st==='dive'){g.globalAlpha*=.5;for(let k=1;k<4;k++){g.fillStyle=body;g.fillRect(Math.round(X-e.vx*.012*k)-4,Math.round(Y-e.vy*.012*k)-12,8,9)}g.globalAlpha=Math.min(1,g.globalAlpha*2)}
  const w=Math.round(Math.sin(e.t2*5)*1.5);
  R(-5,-15,10,9,body);R(-5,-15,1,9,hood);for(let i=0;i<5;i++)R(-4+(i&1?w:-w)+i*0,-6+i,Math.max(1,8-i*2),1,i&1?hood:body);
  R(-4,-17,8,4,hood);R(-3,-18,6,1,hood);R(-2,-14,5,4,'#08070a');R(-1,-13,1,1,eye);R(2,-13,1,1,eye);
  const reach=st==='markW'||st==='dive';R(4,-10,reach?5:3,1,C.boneD);R(reach?8:6,-11,1,1,C.bone);R(-6,-9,2,1,C.boneD);
  if(st==='markW'&&e.tx!==undefined&&e.st>.15){g.globalAlpha=e.st>.45?(Math.floor(e.st*24)%2?.7:.25):.25;line(X,Y-7,sx(e.tx),sy(e.ty),'#d0502e');g.globalAlpha=1}}
function drawMatron(e,X,Y,R,f,fl){const sh='#4a4650',shD='#34313a',shL='#625e6a',veil='#5e5a66',st=e.state,pulse=(Math.sin(game.time*4)+1)/2;
  if(st==='dead'){R(-18,-7,34,7,shD);R(-18,-7,34,1,shL);R(10,-11,7,6,C.bone);R(11,-9,1,2,'#120f12');R(14,-9,1,2,'#120f12');line(X-f*22,Y-2,X+f*20,Y-3,C.boneD);return}
  const lean=st==='sweepW'?-3:st==='sweep'?3:st==='lanceW'?-1:0;
  R(-10,-7,20,7,shD);for(let i=-10;i<10;i+=3)R(i,0,2,1+((i+e.t2*4|0)&1),shD);
  R(-8+lean,-31,16,24,sh);R(-8+lean,-31,3,24,shD);R(5+lean,-30,1,22,shL);
  R(-4+lean,-29,8,9,'#2a2830');for(let k=0;k<4;k++)R(-3+lean,-28+k*2,6,1,C.boneD);R(0+lean,-29,1,9,C.boneD);
  R(-7+lean,-42,14,4,veil);R(-8+lean,-40,2,16,veil);R(6+lean,-40,2,12,veil);R(-3+lean,-40,7,8,C.bone);R(-3+lean,-40,7,1,'#d8d0bc');
  R(-2+lean,-37,2,2,'#120f12');R(2+lean,-37,2,2,'#120f12');R(-1+lean,-36,1,1,st.endsWith('W')?C.emberW:C.ember);R(3+lean,-36,1,1,st.endsWith('W')?C.emberW:C.ember);R(-1+lean,-33,4,1,C.boneD);
  for(const k of [-5,-1,3])R(k+lean,-47,2,5,'#c9bd98');
  for(const k of [-5,-1,3])if(rnd()<.85){g.fillStyle=pulse>.3?C.emberL:C.ember;g.fillRect((f>0?X+k+lean:X-k-lean-2),Y-49,2,2)}
  let ang;if(st==='sweepW')ang=-150;else if(st==='sweep'){ang=-150+Math.min(1,e.st/.18)*220}else if(st==='lanceW')ang=-20;else if(st==='handsW')ang=95;else ang=-80;
  const hx=X+f*(7+lean),hy=Y-24,r=ang*Math.PI/180,ex=hx+f*Math.cos(r)*30,ey=hy+Math.sin(r)*30;line(hx-f*Math.cos(r)*8,hy-Math.sin(r)*8,ex,ey,fl?'#fff':C.boneD);line(hx-f*Math.cos(r)*8+1,hy-Math.sin(r)*8,ex+1,ey,'#6e6858');
  g.fillStyle=C.bone;g.fillRect(Math.round(ex)-2,Math.round(ey)-2,4,4);g.fillStyle='#120f12';g.fillRect(Math.round(ex)-1,Math.round(ey)-1,1,1);
  if(st==='lanceW'||st==='handsW'){if(rnd()<.6)emberP(e.x+f*(7+Math.cos(r)*30),e.y-24+Math.sin(r)*30,3)}
  if(st==='sweep'&&e.st<.22){g.globalAlpha=.35;g.fillStyle='#d8d0bc';g.beginPath();const s0=f>0?-150*Math.PI/180:Math.PI+150*Math.PI/180,s1=f>0?r:Math.PI-r;g.arc(hx,hy,30,s0,s1,f<0);g.arc(hx,hy,18,s1,s0,f>0);g.fill();g.globalAlpha=1}
  R(6+lean,-26,3,3,C.boneD)}
function drawSeraph(e,X,Y,R,f,fl){const A='#2f2c33',AL='#4a4650',AH='#6a6570',AD='#1c1a20',st=e.state,pulse=(Math.sin(game.time*5)+1)/2;
  if(st==='dead'){R(-20,-8,40,8,AD);R(-20,-8,40,1,AL);for(let k=-26;k<26;k+=5)R(k,-3,4,3,C.rust);return}
  const ground=st==='landed'||st==='sweepW'||st==='sweep';const spread=st==='featherW'||st==='markW'||st==='pyreW'?1:ground?0:.6;
  const flap=ground?0:Math.sin(e.t2*(st==='dive'?2:7))*5;
  // wings: rusted iron pinions with ember edges
  for(const side of [-1,1]){const s0x=X+side*4,s0y=Y-30,wx=s0x+side*(13+spread*11),wy=s0y-(4+spread*12)+Math.round(flap)+(ground?10:0);
    line(s0x,s0y,wx,wy,'#3e3a42');line(s0x,s0y+1,wx,wy+1,'#2a272e');
    for(let k=0;k<8;k++){const t=k/7,ox=s0x+(wx-s0x)*t,oy=s0y+(wy-s0y)*t,len=(ground?7:9)+k*(ground?1.4:2.4)+spread*5,a=(side>0?(80-k*(ground?4:8)*(.5+spread*.6)):(100+k*(ground?4:8)*(.5+spread*.6)))*Math.PI/180;
      const ex=ox+Math.cos(a)*len,ey=oy+Math.sin(a)*len;line(ox,oy,ex,ey,k&1?'#4e4a52':'#423e47');line(ox+side,oy,ex+side,ey,'#2a272e');
      g.fillStyle=pulse>.4?C.ember:'#7a3418';g.fillRect(Math.round(ex),Math.round(ey),1,1)}
    g.fillStyle=C.rust;g.fillRect(Math.round(wx),Math.round(wy),2,2)}
  // body
  const legs=ground?0:2;R(-6,-12+legs,5,12-legs,AD);R(1,-12+legs,5,12-legs,A);R(-7,-1,6,1,'#111014');R(1,-1,6,1,AD);
  R(-8,-30,16,18,A);R(-8,-30,16,2,AL);R(-8,-30,3,18,AD);R(-1,-26,6,3,AL);R(-2,-22,1,6,pulse>.5?C.ember:'#7a3418');R(-8,-14,16,2,'#1a1418');
  R(-11,-32,7,6,AL);R(-11,-32,7,1,AH);R(4,-32,7,6,A);
  R(-4,-40,9,9,A);R(-4,-40,9,2,AL);R(-4,-40,2,9,AD);R(0,-36,5,1,st.endsWith('W')?C.emberW:C.ember);
  // halo
  for(let i=0;i<14;i++){const t=i/14*Math.PI*2+game.time*.8;if(rnd()<.85){g.fillStyle=i&1?C.emberL:C.ember;g.fillRect(X+Math.round(Math.cos(t)*9),Y-46+Math.round(Math.sin(t)*3),1,1)}}
  // glaive
  let ang;if(st==='sweepW')ang=-160;else if(st==='sweep'){ang=-160+Math.min(1,e.st/.2)*250}else if(st==='dive')ang=70;else if(st==='markW')ang=-60;else ang=50+Math.sin(e.t2*2)*5;
  const hx=X+f*8,hy=Y-22,r=ang*Math.PI/180,ex=hx+f*Math.cos(r)*30,ey=hy+Math.sin(r)*30;line(hx-f*Math.cos(r)*10,hy-Math.sin(r)*10,ex,ey,fl?'#fff':'#3a2a20');
  line(ex,ey,ex+f*Math.cos(r)*8,ey+Math.sin(r)*8,'#c9c6bd');g.fillStyle=C.ember;g.fillRect(Math.round(ex),Math.round(ey),1,1);
  if(st==='sweep'&&e.st<.24){g.globalAlpha=.4;g.fillStyle='#ffc98a';g.fillRect(X-58,Y-30,116,3);g.globalAlpha=1}
  if(st==='markW'&&e.tx!==undefined){const tx=sx(e.tx),ty=sy(16*T),k=Math.floor(game.time*12)%2;g.fillStyle=k?C.ember:'#c4521f';g.fillRect(tx-8,ty-1,17,1);g.fillRect(tx,ty-9,1,8);g.fillRect(tx-5,ty-4,11,1);
    g.globalAlpha=.15;g.fillStyle=C.ember;g.fillRect(tx-1,sy(e.y)-20,3,ty-sy(e.y)+20);g.globalAlpha=1}
  if(st==='landed'){for(let i=0;i<3;i++){const a3=game.time*5+i*2.1;g.fillStyle=C.emberL;g.fillRect(X+Math.round(Math.cos(a3)*10),Y-52+Math.round(Math.sin(a3)*2),1,1)}}}
/* ---------- new projectiles ---------- */
function drawShot2(s){if(drawShot3(s)||drawShot4(s)||drawShot5(s)||drawShotC(s))return true;const X=sx(s.x),Y=sy(s.y);
  if(s.kind==='bone'){const a=Math.atan2(s.vy,s.vx);line(X,Y,X-Math.cos(a)*9,Y-Math.sin(a)*9,C.bone);line(X,Y+1,X-Math.cos(a)*8,Y-Math.sin(a)*8+1,C.boneD);g.fillStyle='#f0e8d4';g.fillRect(X,Y,1,1);return true}
  if(s.kind==='feather'){const a=Math.atan2(s.vy,s.vx);line(X,Y,X-Math.cos(a)*8,Y-Math.sin(a)*8,'#7a3418');line(X,Y,X-Math.cos(a)*4,Y-Math.sin(a)*4,C.emberL);g.fillStyle=C.emberW;g.fillRect(X,Y,1,1);if(rnd()<.4)emberP(s.x,s.y,2);return true}
  if(s.kind==='pillar'||s.kind==='hand'){const fy=sy(s.floor);
    if(s.delay>0){const k=Math.floor(game.time*14)%2,hand=s.kind==='hand';g.fillStyle=k?(hand?C.boneD:C.ember):(hand?'#6e6858':'#c4521f');
      for(let i=0;i<20;i++){const t=i/20*Math.PI*2;g.fillRect(X+Math.round(Math.cos(t)*8),fy-1+Math.round(Math.sin(t)*2),1,1)}
      if(hand){g.fillStyle=C.ember;g.fillRect(X-3,fy-1,1,1);g.fillRect(X+2,fy-2,1,1)}else{g.globalAlpha=.15;g.fillStyle=C.ember;g.fillRect(X-4,fy-44,9,44);g.globalAlpha=1}return true}
    const p=clamp((.5-s.life)/.12,0,1);
    if(s.kind==='hand'){const h=Math.round(28*p);g.fillStyle=C.boneD;g.fillRect(X-5,fy-h,10,h);g.fillStyle=C.bone;for(const k of [-5,-2,1,4])g.fillRect(X+k,fy-h-4,2,5);g.fillRect(X-5,fy-h,1,h);g.fillStyle='#120f12';g.fillRect(X-2,fy-h+6,4,1)}
    else{const h=Math.round(46*p);for(let i=0;i<34;i++){const yy=fy-rnd()*h|0,ww=(rnd()*10|0)-5;g.fillStyle=yy<fy-h*.7?'#c4521f':yy<fy-h*.35?C.ember:C.emberL;g.fillRect(X+ww,yy,2,2)}g.fillStyle=C.emberW;g.fillRect(X-1,fy-h,3,h)}
    return true}
  return false}

/* ---------- Level 3 set pieces ---------- */
function gearAt(c,cx,cy,rad,teeth,col,colD){for(let a=0;a<360;a+=3){const t=a*Math.PI/180;for(let rr=rad-5;rr<=rad;rr++){c.fillStyle=rr>rad-2?colD:col;c.fillRect(Math.round(cx+Math.cos(t)*rr),Math.round(cy+Math.sin(t)*rr),1,1)}}
  for(let k=0;k<teeth;k++){const t=k/teeth*Math.PI*2;c.fillStyle=col;c.fillRect(Math.round(cx+Math.cos(t)*(rad+2))-2,Math.round(cy+Math.sin(t)*(rad+2))-2,4,4)}
  for(let k=0;k<4;k++){const t=k/4*Math.PI*2+.4;for(let rr=4;rr<rad-4;rr++){c.fillStyle=colD;c.fillRect(Math.round(cx+Math.cos(t)*rr),Math.round(cy+Math.sin(t)*rr),2,2)}}
  c.fillStyle='#16151a';c.fillRect(cx-4,cy-4,8,8);c.fillStyle=C.rust;c.fillRect(cx-2,cy-2,4,4)}
Object.assign(DECOR2,{
  gears(c,d){const x=Math.round(d.x),y=Math.round(d.y);gearAt(c,x,y-70,20,10,'#2e2b33','#232027');gearAt(c,x+30,y-104,13,8,'#35313b','#26232b');gearAt(c,x-22,y-118,10,7,'#2a2730','#1f1d24')},
  bellows(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle=C.woodD;c.fillRect(x-24,y-8,48,8);c.fillRect(x-22,y-56,4,48);c.fillRect(x+18,y-56,4,48);
    for(let i=0;i<5;i++){c.fillStyle=i&1?'#4a3020':'#3a2416';c.beginPath();c.moveTo(x-18,y-12-i*8);c.lineTo(x+18,y-12-i*8);c.lineTo(x+14,y-16-i*8);c.lineTo(x-14,y-16-i*8);c.fill()}
    c.fillStyle=C.wood;c.fillRect(x-20,y-54,40,4);c.fillStyle=C.iron;c.fillRect(x-20,y-50,40,2);c.fillRect(x+20,y-30,20,4);c.fillStyle=C.ironL;c.fillRect(x+20,y-30,20,1);c.fillStyle=C.rust;c.fillRect(x+36,y-29,4,3)},
  pipes(c,d){const x=Math.round(d.x),y=Math.round(d.y);for(const [ox,w] of [[-14,7],[-4,5],[6,8]]){c.fillStyle='#3a3740';c.fillRect(x+ox,y-200,w,200);c.fillStyle='#4e4a55';c.fillRect(x+ox,y-200,1,200);c.fillStyle='#24222a';c.fillRect(x+ox+w-1,y-200,1,200);
      for(let yy=y-180;yy<y;yy+=40){c.fillStyle='#4a4650';c.fillRect(x+ox-1,yy,w+2,3);c.fillStyle=C.rust;c.fillRect(x+ox,yy+3,w,1)}}
    c.fillStyle=C.iron;c.fillRect(x-6,y-60,10,4);c.fillStyle='#8a2a24';c.fillRect(x-3,y-64,4,4)},
  furnace(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle='#2a2428';c.fillRect(x-44,y-120,88,120);c.fillStyle='#342d32';c.fillRect(x-44,y-120,88,3);
    for(let yy=y-116;yy<y;yy+=8){c.fillStyle='#211c20';c.fillRect(x-44,yy,88,1);for(let xx=x-44+((yy/8)&1)*6;xx<x+44;xx+=12)c.fillRect(xx,yy-7,1,7)}
    c.fillStyle='#120c0a';c.fillRect(x-26,y-56,52,56);c.beginPath();c.moveTo(x-26,y-56);c.quadraticCurveTo(x,y-84,x+26,y-56);c.fill();
    const bands=['#3e1a10','#5a2412','#7a3214','#a8461a','#d06a24'];for(let i=0;i<bands.length;i++){c.fillStyle=bands[i];c.fillRect(x-22+i*3,y-48+i*8,44-i*6,48-i*8)}
    c.fillStyle='#ffc368';c.fillRect(x-6,y-10,12,10);c.fillStyle=C.iron;for(let k=-24;k<=24;k+=6)c.fillRect(x+k,y-58,2,58);c.fillStyle=C.ironL;c.fillRect(x-26,y-58,52,2);
    c.fillStyle='#2a2428';c.fillRect(x-10,y-150,20,30);c.fillStyle='#342d32';c.fillRect(x-10,y-150,3,30)},
  bigAnvil(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle='#2f2d36';c.fillRect(x-14,y-14,28,14);c.fillStyle='#3a3842';c.fillRect(x-14,y-14,28,1);
    c.fillStyle=C.iron;c.fillRect(x-8,y-22,16,8);c.fillRect(x-20,y-30,36,8);c.fillRect(x+16,y-28,10,4);c.fillStyle=C.ironL;c.fillRect(x-20,y-30,36,1);c.fillStyle=C.rust;c.fillRect(x-16,y-24,8,1);c.fillStyle='#7a3214';c.fillRect(x-4,y-31,6,1)},
  ventGrate(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle='#16151a';c.fillRect(x-9,y-2,18,2)}
});
function drawLiveDecor3(){const t0=Math.max(0,Math.floor(camX/T)),t1=Math.min(MW-1,Math.ceil((camX+VW)/T));
  for(let x=t0;x<=t1;x++)for(let y=12;y<ROWS;y++)if(grid[y*MW+x]===7&&rnd()<.04){const X=sx(x*T+rnd()*T),Y=sy(y*T);g.fillStyle=rnd()<.5?C.emberW:C.emberL;g.fillRect(X,Y-1,2,1);if(rnd()<.3)emberP(x*T+8,y*T-2,10)}}
function drawVent(o){const X=sx(o.x),Y=sy(o.y);if(X<-20||X>VW+20)return;const warn=o.period-(o.t??0)<.9;
  g.fillStyle='#1d1c22';g.fillRect(X-9,Y-3,18,3);g.fillStyle=C.iron;for(let k=-8;k<9;k+=3)g.fillRect(X+k,Y-3,2,3);g.fillStyle=C.ironL;g.fillRect(X-9,Y-3,18,1);
  if(warn){g.fillStyle=Math.floor(game.time*14)%2?C.ember:'#c4521f';for(let k=-7;k<9;k+=3)g.fillRect(X+k,Y-2,1,2);if(rnd()<.4)part(o.x+(rnd()-.5)*14,o.y-3,(rnd()-.5)*10,-30,.5,'#8a8590',{g:-10})}}
/* ---------- forge foes ---------- */
function drawGolem(e,X,Y,R,f,fl){const S1='#3e3632',S2='#2c2522',S3='#554b46',st=e.state,pulse=Math.sin(game.time*4+e.x)>0;
  if(st==='dead'){R(-14,-8,28,8,S2);R(-14,-8,28,1,S3);R(-6,-6,8,4,'#5a2412');R(8,-10,8,6,S1);return}
  const mv=Math.abs(e.vx)>4&&e.onGround,a=Math.round((mv?Math.sin(e.t2*5):0)*2),c=st==='pound'?3:st==='vent'?2:0;
  R(-9-a,-10,7,10,S2);R(2+a,-10,7,10,S1);R(-10-a,-2,9,2,'#1a1614');R(2+a,-2,9,2,S2);
  R(-11,-29+c,22,20,S1);R(-11,-29+c,22,2,S3);R(-11,-29+c,3,20,S2);
  R(-6,-24+c,1,6,pulse?C.ember:'#6a2a14');R(6,-20+c,1,5,pulse?'#6a2a14':C.ember);R(-8,-14+c,4,1,'#6a2a14');
  if(st==='vent'){R(-5,-24+c,10,8,'#120c0a');R(-4,-23+c,8,6,C.ember);R(-2,-22+c,4,4,C.emberW);R(-9,-25+c,3,10,S3);R(6,-25+c,3,10,S3)}
  else{R(-3,-22+c,6,5,'#2a1a14');R(-2,-21+c,4,3,st==='poundW'?C.emberL:C.ember)}
  R(-5,-36+c,10,8,S1);R(-5,-36+c,10,1,S3);R(-1,-33+c,5,2,'#120c0a');R(1,-33+c,3,1,st==='poundW'?C.emberW:C.ember);
  if(st==='poundW'){const u=Math.round(Math.min(1,e.st/.5)*12);R(-15,-30-u,6,14,S2);R(9,-30-u,6,14,S1);R(-16,-36-u,8,7,S3);R(8,-36-u,8,7,S3);R(-14,-34-u,4,1,C.ember);R(10,-34-u,4,1,C.ember)}
  else if(st==='pound'){R(-16,-20,6,14,S2);R(10,-20,6,14,S1);R(-17,-7,9,7,S3);R(9,-7,9,7,S3)}
  else{R(-15,-28+c,5,15,S2);R(10,-28+c,5,15,S1);R(-16,-14+c,7,7,S3);R(9,-14+c,7,7,S3)}}
function drawImp(e,X,Y,R,f,fl){const sk='#5a3028',skD='#3a1c16',st=e.state,pulse=Math.sin(game.time*6+e.x)>0;
  if(st==='dead'){R(-6,-3,12,3,skD);R(3,-4,4,3,sk);return}
  const air=!e.onGround;R(-3,-5,2,air?3:5,skD);R(1,-5,2,air?3:5,skD);
  R(-4,-11,8,7,sk);R(-2,-9,4,3,pulse?C.ember:'#7a3214');R(-3,-15,7,5,sk);R(-4,-17,2,3,skD);R(3,-17,2,3,skD);
  R(1,-13,1,1,C.emberL);R(3,-13,1,1,C.emberL);R(1,-11,3,1,'#120c0a');R(-7,-7,3,1,skD);R(-8,-8,1,1,skD);
  if(st==='throwW'){R(2,-20,2,6,sk);const bx=f>0?X+3:X-4,by=Y-23;g.fillStyle='#3a2a20';g.fillRect(bx-2,by-2,5,5);g.fillStyle=C.ember;g.fillRect(bx-1,by-1,3,3);flame(bx,by-3,.6)}
  else R(4,-10,3,2,sk)}
function drawReaver(e,X,Y,R,f,fl){const cl='#2c2830',clD='#1a171e',ar='#4a4650',st=e.state;
  if(st==='dead'){R(-10,-4,20,4,clD);R(6,-6,5,4,ar);line(X-f*14,Y-1,X+f*10,Y-1,C.iron);return}
  const mv=Math.abs(e.vx)>8&&e.onGround,a=Math.round((mv?Math.sin(e.t2*12):0)*2),lean=st==='slashW'?-2:st==='slash'?3:0;
  R(-3+a,-9,2,9,clD);R(1-a,-9,2,9,'#2e2a32');R(-4+a,-1,3,1,'#0f0e12');R(1-a,-1,3,1,'#0f0e12');
  R(-5+lean,-19,10,10,cl);R(-6+lean,-12,12,4,clD);R(-5+lean,-19,2,10,clD);R(-4+lean,-16,8,1,C.rust);
  R(-4+lean,-26,8,7,ar);R(-4+lean,-26,8,1,'#6a6570');R(0+lean,-23,4,2,'#0b0a0d');R(2+lean,-23,1,1,st.endsWith('W')?C.emberW:C.ember);
  if(st==='slashW'){const hx=X-f*2,hy=Y-31;line(X+f*2,Y-16,hx,hy,C.iron);g.fillStyle='#c9c6bd';g.fillRect(f>0?hx-4:hx,hy-1,5,1);g.fillRect(f>0?hx-5:hx+4,hy,1,3);g.fillStyle=C.emberW;g.fillRect(hx,hy-1,1,1)}
  else if(st==='slash'){line(X+f*4,Y-16,X+f*16,Y-12,C.iron);g.fillStyle='#c9c6bd';g.fillRect(f>0?X+16:X-20,Y-14,5,1);if(e.st<.14){g.globalAlpha=.4;g.fillStyle='#e8e2d4';g.fillRect(f>0?X+4:X-34,Y-24,30,2);g.globalAlpha=1}}
  else{line(X+f*4,Y-14,X+f*8,Y-6,C.iron);g.fillStyle='#c9c6bd';g.fillRect(f>0?X+8:X-12,Y-6,4,1)}
  if(st==='hookW'){for(let i=0;i<14;i++){const t=i/14*Math.PI*2+game.time*14;g.fillStyle=i&1?C.ironL:C.iron;g.fillRect(X+Math.round(Math.cos(t)*10),Y-34+Math.round(Math.sin(t)*4),2,2)}g.fillStyle=C.emberW;g.fillRect(X+Math.round(Math.cos(game.time*14)*10),Y-34+Math.round(Math.sin(game.time*14)*4),2,2)}}
function drawForgemaster(e,X,Y,R,f,fl){const skin='#5e5652',skinD='#3e3834',ap='#4a3020',apD='#33200f',mask='#3a3740',st=e.state,pulse=(Math.sin(game.time*4)+1)/2;
  if(st==='dead'){R(-22,-9,44,9,apD);R(-22,-9,44,1,ap);R(14,-12,9,8,mask);R(-30,-6,12,6,'#3e3c44');line(X-f*24,Y-3,X+f*8,Y-3,'#3a2a20');return}
  const mv=Math.abs(e.vx)>8&&e.onGround,a=Math.round((mv?Math.sin(e.t2*6):0)*3),c=st==='stunned'?6:st==='chargeW'?3:0,ln=st==='charge'?6:st==='hammerW'?-3:st==='hammer'?4:0;
  R(-10-a,-16,8,16,'#2a2420');R(3+a,-16,8,16,'#332a24');R(-11-a,-3,10,3,'#1a1614');R(3+a,-3,10,3,'#1a1614');
  R(-13+ln,-40+c,26,25,skin);R(-13+ln,-40+c,4,25,skinD);R(-10+ln,-34+c,20,19,ap);R(-10+ln,-34+c,20,1,'#6a4a30');R(-10+ln,-34+c,2,19,apD);
  R(-4+ln,-26+c,3,2,'#2a1810');R(3+ln,-20+c,2,3,'#2a1810');R(-13+ln,-17+c,26,2,'#2a1810');R(-2+ln,-17+c,4,2,C.rust);
  R(-16+ln,-42+c,8,7,skin);R(8+ln,-42+c,8,7,skinD);
  R(-6+ln,-50+c,13,10,mask);R(-6+ln,-50+c,13,1,'#5a5762');R(-6+ln,-50+c,2,10,'#24222a');R(0+ln,-46+c,6,2,'#0b0a0d');R(1+ln,-46+c,4,1,st.endsWith('W')?C.emberW:C.ember);R(-3+ln,-48+c,1,1,'#6a6570');R(4+ln,-48+c,1,1,'#6a6570');
  let ang;if(st==='hammerW')ang=-150;else if(st==='hammer')ang=80;else if(st==='chargeW'||st==='charge')ang=150;else if(st==='ingotW'||st==='ingotR')ang=120;else if(st==='stunned')ang=95;else ang=70+Math.sin(e.t2*2)*4;
  const hx=X+f*(12+ln),hy=Y-30+c,r=ang*Math.PI/180,L=34,ex=Math.round(hx+f*Math.cos(r)*L),ey=Math.round(hy+Math.sin(r)*L);
  line(hx-f*Math.cos(r)*4,hy-Math.sin(r)*4,ex,ey,'#3a2a20');line(hx-f*Math.cos(r)*4+1,hy-Math.sin(r)*4,ex+1,ey,'#2a1a10');
  g.fillStyle=fl?'#fff':'#3e3c44';g.fillRect(ex-7,ey-5,14,10);g.fillStyle='#5a5762';g.fillRect(ex-7,ey-5,14,1);g.fillStyle=pulse>.4?C.ember:'#7a3214';g.fillRect(ex-6,ey+3,12,1);
  if(st==='hammerW'&&rnd()<.6)emberP(e.x+f*(12+ln+Math.cos(r)*L),e.y-30+Math.sin(r)*L,6);
  if(st==='ingotW'){const tx=X-f*(6-ln),ty=Y-54-Math.round(Math.min(1,e.st/.4)*6);line(X-f*8,Y-36,tx,ty,C.iron);g.fillStyle=C.ember;g.fillRect(tx-4,ty-3,8,4);g.fillStyle=C.emberW;g.fillRect(tx-2,ty-2,4,2)}
  else R(-15+ln,-30+c,4,12,skinD);
  if(st==='stunned'){for(let i=0;i<3;i++){const a3=game.time*5+i*2.1;g.fillStyle=C.emberL;g.fillRect(X+Math.round(Math.cos(a3)*10),Y-56+Math.round(Math.sin(a3)*2),1,1)}}}
function drawQueen(e,X,Y,R,f,fl){const dr='#6a1e18',drD='#401010',ar='#4a4650',arL='#6a6570',sk='#c9b8a8',st=e.state,ph2=e.phase===2,pulse=(Math.sin(game.time*6)+1)/2;
  if(st==='dead'){R(-12,-5,24,5,drD);R(-12,-5,24,1,dr);R(8,-7,5,4,sk);line(X-f*16,Y-1,X+f*14,Y-2,'#c9c6bd');return}
  const ln=st==='thrust'?4:st==='thrustW'?-2:(st==='c1'||st==='c2'||st==='c3')?2:st==='backstep'?-3:0;
  R(-6+ln,-16,12,16,dr);R(-7,-5,14,5,drD);for(let i=-7;i<7;i+=2)R(i,0,1,1+((i+(game.time*8|0))&1),drD);R(-6+ln,-16,2,16,drD);R(3+ln,-15,1,12,'#8a2a20');
  R(-5+ln,-23,10,8,ar);R(-5+ln,-23,10,1,arL);R(-1+ln,-21,2,5,pulse>.5?C.ember:'#7a3214');
  R(-4+ln,-30,8,8,'#2a1a18');R(-3+ln,-29,6,6,sk);R(-3+ln,-29,6,1,'#e0d4c4');R(0+ln,-27,1,1,'#2a1210');R(2+ln,-27,1,1,'#2a1210');R(-5+ln,-28,2,9,'#2a1a18');
  for(const k of [-3,0,3])flame(f>0?X+k+ln:X-k-ln,Y-31,ph2?.8:.5);
  const ANG={thrustW:0,thrust:0,thrustR:20,c1W:-70,c1:40,c2W:70,c2:-50,c3W:-140,c3:60,comboR:80,leapW:-100,leap:-40,leapR:80,backstep:-20};
  const ang=ANG[st]??30,r=ang*Math.PI/180,hx=X+f*(5+ln),hy=Y-19,ex=hx+f*Math.cos(r)*26,ey=hy+Math.sin(r)*26;
  line(hx-f*Math.cos(r)*3,hy-Math.sin(r)*3,hx,hy,'#3a2a20');line(hx+f*Math.sin(r)*2,hy-Math.cos(r)*2,hx-f*Math.sin(r)*2,hy+Math.cos(r)*2,'#c9a040');
  line(hx,hy,ex,ey,fl?'#fff':'#d8d4cc');if(ph2){g.fillStyle=C.ember;g.fillRect(Math.round((hx+ex)/2),Math.round((hy+ey)/2),1,1)}
  if(st==='thrustW'){const k=Math.floor(e.st*20)%2;g.fillStyle=k?C.emberW:C.emberL;g.fillRect(Math.round(ex)-1,Math.round(ey),3,1);g.fillRect(Math.round(ex),Math.round(ey)-1,1,3);
    if(e.st>.2){g.globalAlpha=.25;g.fillStyle='#d0502e';g.fillRect(f>0?Math.round(ex):Math.round(ex)-70,Math.round(ey),70,1);g.globalAlpha=1}}
  if((st==='c1'||st==='c2'||st==='c3')&&e.st<.14){g.globalAlpha=.4;g.fillStyle=st==='c3'?'#ffc98a':'#e8e2d4';g.beginPath();const a0=(ANG[st+'W'])*Math.PI/180,s0=f>0?a0:Math.PI-a0,s1=f>0?r:Math.PI-r;g.arc(hx,hy,26,s0,s1,(ang>ANG[st+'W'])?f<0:f>0);g.arc(hx,hy,14,s1,s0,(ang>ANG[st+'W'])?f>0:f<0);g.fill();g.globalAlpha=1}
  if(st==='thrust'){g.globalAlpha=.35;g.fillStyle='#ffc98a';g.fillRect(f>0?X-30:X,Y-20,30,2);g.globalAlpha=1}}
/* ---------- forge projectiles ---------- */
function drawShot3(s){const X=sx(s.x),Y=sy(s.y);
  if(s.kind==='firebomb'){g.fillStyle='#3a2a20';g.fillRect(X-2,Y-2,5,5);g.fillStyle=C.ember;g.fillRect(X-1,Y-1,3,3);g.fillStyle=C.emberW;g.fillRect(X,Y,1,1);return true}
  if(s.kind==='ingot'){g.fillStyle='#c4521f';g.fillRect(X-4,Y-2,8,4);g.fillStyle=C.emberL;g.fillRect(X-3,Y-1,6,2);g.fillStyle=C.emberW;g.fillRect(X-1,Y-1,2,1);return true}
  if(s.kind==='puddle'){const a=Math.min(1,s.life/.5);g.globalAlpha=a;g.fillStyle='#7a2a14';g.fillRect(X-s.w/2,Y-1,s.w,1);
    for(let i=0;i<12;i++){const h=rnd()*7|0,xx=X-s.w/2+(rnd()*s.w|0);g.fillStyle=h>4?C.emberL:h>2?C.ember:'#c4521f';g.fillRect(xx,Y-1-h,1,h)}g.globalAlpha=1;return true}
  if(s.kind==='hook'){const o=s.owner,ox=sx(o.x+o.face*6),oy=sy(o.y-16),n=Math.max(1,Math.floor(Math.abs(X-ox)/3));
    for(let i=0;i<n;i++){const t=i/n;g.fillStyle=i&1?C.ironL:C.iron;g.fillRect(Math.round(ox+(X-ox)*t),Math.round(oy+(Y-oy)*t)+(i&1),2,1)}
    g.fillStyle='#c9c6bd';g.fillRect(X-1,Y-3,2,6);g.fillRect(X+(s.vx>0?1:-3),Y+2,3,1);g.fillStyle=C.emberW;g.fillRect(X,Y-3,1,1);return true}
  return false}

/* ---------- DAYLIGHT: a pale morning sky over the countryside far below the walls ---------- */
const DAYPAL={stone:'#615d68',stoneL:'#76717c',stoneD:'#4f4b57',deep:'#45414d',mortar:'#3a3742',lip:'#a69e8e',lipL:'#c8bea8',back:'#4b4853',backL:'#57545f',backD:'#3e3b46'};
const DAYLS=[];
function dayLayers(){const v=game.level>=4?1:0;if(DAYLS[v])return DAYLS[v];const r=rng32(404+v);
  const [s,sx2]=mk(VW,VH);const cols=(v?['#4d6c90','#5d7998','#70879f','#8795a3','#a1a3a3','#bdb19f','#d6b996','#e8c38e','#f0cf98']:['#5c7590','#67809a','#738ba3','#8197ac','#90a3b4','#a1b1bd','#b4c0c5','#c9cec9','#dcd8c8']).map(h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)));
  const d=sx2.createImageData(VW,VH),a=d.data;for(let y=0;y<VH;y++)for(let x=0;x<VW;x++){const t=Math.pow(y/VH,1.1)*(cols.length-1);let i=Math.floor(t);if((t-i)*16>BAYER[y&3][x&3])i++;i=Math.min(i,cols.length-1);const o=(y*VW+x)*4,c=cols[i];a[o]=c[0];a[o+1]=c[1];a[o+2]=c[2];a[o+3]=255}
  sx2.putImageData(d,0,0);const sunX=v?318:86,sunY=v?92:46;for(let rr=v?44:34;rr>12;rr-=5){sx2.globalAlpha=.07;sx2.fillStyle=v?'#ffd890':'#fff4d0';sx2.beginPath();sx2.arc(sunX,sunY,rr,0,7);sx2.fill()}sx2.globalAlpha=1;sx2.fillStyle=v?'#ffe6b0':'#fff6dc';sx2.beginPath();sx2.arc(sunX,sunY,v?14:11,0,7);sx2.fill();sx2.fillStyle=v?'#ffcf80':'#ffe9b8';sx2.beginPath();sx2.arc(sunX,sunY,v?10:8,0,7);sx2.fill();
  const [cl,cx2]=mk(1000,140);for(let k=0;k<16;k++){const x0=r()*1000,y0=14+r()*80,n=7+r()*9|0,sw=26+r()*60;for(let i=0;i<n;i++){const x=x0+(r()-.5)*sw*1.7,y=y0+(r()-.5)*sw*.2,rad=4+r()*sw*.17;cx2.fillStyle=v?'#c4a496':'#c4c9cd';cx2.beginPath();cx2.arc(x,y+3,rad,0,7);cx2.fill();cx2.fillStyle=v?'#f2dcc2':'#eeeae0';cx2.beginPath();cx2.arc(x,y,rad*.9,0,7);cx2.fill()}}harden(cl,140);
  const [fa,fx2]=mk(1000,VH);fx2.fillStyle=v?'#8f8ea0':'#8a99a7';fx2.beginPath();fx2.moveTo(0,VH);for(let x=0;x<=1000;x+=4)fx2.lineTo(x,150-Math.abs(Math.sin(x*.009+1))*36-Math.sin(x*.031)*8);fx2.lineTo(1000,VH);fx2.fill();
  fx2.fillStyle=v?'#e2c8b4':'#c7cdd2';for(let x=0;x<1000;x+=4){const y=150-Math.abs(Math.sin(x*.009+1))*36-Math.sin(x*.031)*8;if(y<124)fx2.fillRect(x,y,4,3)}harden(fa,90);
  const [mi,mx3]=mk(1600,VH);mx3.fillStyle=v?'#7f8470':'#7a8a80';mx3.beginPath();mx3.moveTo(0,VH);for(let x=0;x<=1600;x+=4)mx3.lineTo(x,168+Math.sin(x*.006)*8+Math.sin(x*.023)*3);mx3.lineTo(1600,VH);mx3.fill();
  mx3.fillStyle=v?'#6c725c':'#6a7b70';for(let i=0;i<220;i++){const x=r()*1600,y=172+Math.sin(x*.006)*8+r()*10;mx3.beginPath();mx3.arc(x,y,2+r()*3,0,7);mx3.fill()}
  for(const x of [210,780,1290]){mx3.fillStyle='#7d8691';mx3.fillRect(x,128,24,46);mx3.fillRect(x-14,144,52,30);mx3.beginPath();mx3.moveTo(x-2,128);mx3.lineTo(x+12,104);mx3.lineTo(x+26,128);mx3.fill();mx3.fillStyle='#a8574a';mx3.fillRect(x+10,96,1,8);mx3.fillRect(x+11,96,4,2)}
  for(let i=0;i<30;i++){const x=r()*1600,y=178+r()*12;mx3.fillStyle='#8a6a58';mx3.fillRect(x,y,5,3);mx3.fillStyle='#b9ad98';mx3.fillRect(x,y+3,5,2)}harden(mi,90);
  const [ne,nx3]=mk(2800,VH);nx3.fillStyle=v?'#5c5966':'#596169';for(let x=0;x<2800;x+=180){const h=40+r()*50;nx3.fillRect(x,206-h,26,h+20);for(let k=0;k<26;k+=8)nx3.fillRect(x+k,206-h-6,5,6);nx3.fillRect(x+26,190,154,40);for(let k=26;k<180;k+=10)nx3.fillRect(x+k,184,6,6)}
  nx3.fillStyle=v?'#586050':'#55625a';for(let i=0;i<60;i++){const x=r()*2800;nx3.beginPath();nx3.arc(x,214,6+r()*8,0,7);nx3.fill()}harden(ne,90);
  const [vg,vx3]=mk(VW,VH);const gr=vx3.createRadialGradient(VW/2,VH*.5,VH*.4,VW/2,VH*.5,VW*.65);gr.addColorStop(0,'rgba(40,34,30,0)');gr.addColorStop(1,v?'rgba(70,40,20,.38)':'rgba(40,34,30,.35)');vx3.fillStyle=gr;vx3.fillRect(0,0,VW,VH);
  return DAYLS[v]={sky:s,clouds:cl,far:fa,mid:mi,near:ne,vig:vg}}
function drawDayBackdrop(t){const L=dayLayers();g.drawImage(L.sky,0,-Math.round(camY*.04));
  const cw=L.clouds.width,co=-((camX*.04+t*4)%cw);g.drawImage(L.clouds,Math.round(co),-Math.round(camY*.06));g.drawImage(L.clouds,Math.round(co+cw),-Math.round(camY*.06));
  g.drawImage(L.far,-Math.round((camX*.06)%(L.far.width-VW)),-Math.round(camY*.1));
  for(let i=0;i<6;i++){const bx=((t*14+i*170)%720)-80,by=60+Math.sin(t*.7+i)*8+i*5,w=Math.floor(t*6+i)%2;g.fillStyle='#4e5a66';g.fillRect(Math.round(bx),Math.round(by),2,1);g.fillRect(Math.round(bx)+3,Math.round(by),2,1);g.fillRect(Math.round(bx)+2,Math.round(by)+1-w,1,1)}
  g.drawImage(L.mid,-Math.round((camX*.16)%(L.mid.width-VW)),-Math.round(camY*.18));
  g.drawImage(L.near,-Math.round((camX*.32)%(L.near.width-VW)),-Math.round(camY*.3)+8);
  g.globalAlpha=.18;g.fillStyle=game.level>=4?'#f0d0a8':'#e8e2d0';g.fillRect(0,150-Math.round(camY*.2),VW,40);g.globalAlpha=1}
/* ---------- Level 4 set pieces ---------- */
Object.assign(DECOR2,{
  parapet(c,d){const y=Math.round(d.y),x0=Math.round(d.x)-8,x1=d.x1*T+8;for(let x=x0;x<x1;x+=16){c.fillStyle='#57535e';c.fillRect(x+3,y-14,10,14);c.fillStyle='#a69e8e';c.fillRect(x+3,y-14,10,1);c.fillStyle='#46424d';c.fillRect(x+12,y-13,1,13);c.fillStyle='#3a3742';c.fillRect(x+6,y-9,2,4)}},
  ballista(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle=C.woodD;c.fillRect(x-14,y-8,28,4);c.fillRect(x-12,y-4,3,4);c.fillRect(x+9,y-4,3,4);c.fillStyle=C.wood;c.fillRect(x-14,y-8,28,1);
    c.save();c.translate(x,y-10);c.rotate(-.18);c.fillStyle=C.woodL;c.fillRect(-18,-2,36,3);c.fillStyle=C.iron;c.fillRect(-20,-3,3,5);c.fillRect(-1,-14,2,26);c.fillStyle='#c9c2b0';c.fillRect(2,-1,24,1);c.restore();c.fillStyle=C.woodD;c.fillRect(x+12,y-3,10,3)},
  belfry(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle='#4f4b57';c.fillRect(x-60,y-150,10,150);c.fillRect(x+50,y-150,10,150);c.fillStyle='#625e69';c.fillRect(x-60,y-150,3,150);c.fillRect(x+50,y-150,3,150);
    c.fillStyle='#4f4b57';c.beginPath();c.moveTo(x-64,y-150);c.lineTo(x,y-196);c.lineTo(x+64,y-150);c.fill();c.fillStyle='#7a2a24';c.beginPath();c.moveTo(x-56,y-152);c.lineTo(x,y-190);c.lineTo(x+56,y-152);c.fill();
    c.fillStyle=C.woodD;c.fillRect(x-50,y-130,100,6);c.fillStyle=C.wood;c.fillRect(x-50,y-130,100,1);c.fillStyle=C.iron;c.fillRect(x-2,y-124,4,14);c.fillStyle=C.rust;c.fillRect(x-6,y-112,12,3)},
  spire(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle='#4f4b57';c.fillRect(x-14,y-170,28,170);c.fillStyle='#625e69';c.fillRect(x-14,y-170,4,170);c.fillStyle='#3e3b46';c.fillRect(x+10,y-170,4,170);
    c.fillStyle='#4f4b57';c.beginPath();c.moveTo(x-18,y-170);c.lineTo(x,y-230);c.lineTo(x+18,y-170);c.fill();c.fillStyle='#16151a';c.fillRect(x-3,y-150,6,14);c.fillRect(x-3,y-100,6,14);c.fillStyle='#7a2a24';c.fillRect(x-1,y-246,2,16)},
  stairUp(c,d){const x=Math.round(d.x),y=Math.round(d.y);for(let i=0;i<7;i++){c.fillStyle=i&1?'#2a2830':'#25232b';c.fillRect(x-24+i*6,y-16-i*14,26,14+i*14);c.fillStyle='#34313b';c.fillRect(x-24+i*6,y-16-i*14,26,1)}}
});
function drawLiveDecor4(){const t=game.time;for(const d of decorLive){if(d.t!=='flag')continue;const X=sx(d.x),Y=sy(d.y);if(X<-30||X>VW+30)continue;
  g.fillStyle='#3a3742';g.fillRect(X,Y-44,1,44);g.fillStyle='#a69e8e';g.fillRect(X-1,Y-45,3,1);
  for(let i=0;i<14;i++){const w=Math.round(Math.sin(t*6+i*.55+d.x)*1.6);g.fillStyle=i%5===4?'#5a1e1a':'#7a2a24';g.fillRect(X+1+i,Y-43+w,1,9-(i>11?(i-11)*2:0))}
  g.fillStyle='#c9a040';g.fillRect(X+6,Y-40+Math.round(Math.sin(t*6+3+d.x)*1.6),2,2)}}
/* ---------- wall foes ---------- */
function drawCrow(e,X,Y,R,f,fl){const b='#1c1c22',w='#2c2c34',st=e.state;if(st==='dead'){R(-3,-2,6,2,b);return}
  const flap=Math.floor(e.t2*14)%2;R(-3,-5,7,3,b);R(3,-6,3,3,b);R(6,-5,2,1,'#8a7a50');if(st==='caw')R(6,-4,2,1,'#8a7a50');R(4,-6,1,1,st==='caw'?C.emberW:'#d8c070');R(-5,-4,2,1,b);
  if(st==='swoop'){R(-6,-6,5,1,w);R(-7,-5,2,1,w)}else if(flap){R(-2,-9,4,4,w);R(-1,-10,2,1,w)}else{R(-3,-3,5,2,w);R(-5,-2,3,1,w)}}
function drawHalberd(e,X,Y,R,f,fl){const tab='#3a4258',tabD='#2a3044',stp='#7a2a24',ar='#5a5e68',arL='#7a7e88',st=e.state;
  if(st==='dead'){R(-10,-4,20,4,tabD);R(6,-6,5,4,ar);line(X-f*18,Y-1,X+f*16,Y-2,'#5a4430');return}
  const mv=Math.abs(e.vx)>6&&e.onGround,a=Math.round((mv?Math.sin(e.t2*10):0)*2),ln=st==='thrust'?3:st==='thrustW'?-2:st==='sweepW'?-1:0;
  R(-3+a,-9,3,9,'#2a2a30');R(1-a,-9,3,9,'#34343a');R(-4+a,-1,4,1,'#1a1a1e');R(1-a,-1,4,1,'#1a1a1e');
  R(-5+ln,-21,10,12,tab);R(-5+ln,-21,2,12,tabD);R(-1+ln,-21,2,12,stp);R(-6+ln,-10,12,2,tabD);R(-6+ln,-22,4,3,ar);R(3+ln,-22,4,3,arL);
  R(-4+ln,-28,8,6,ar);R(-6+ln,-24,12,1,ar);R(-4+ln,-28,8,1,arL);R(0+ln,-25,4,1,'#121114');R(2+ln,-25,1,1,st.endsWith('W')?C.emberW:'#c9c2b0');
  let ang,hx=4,hy=-16;if(st==='thrustW'){ang=0;hx=-6}else if(st==='thrust'){ang=0;hx=12}else if(st==='sweepW')ang=-125;else if(st==='sweep')ang=-125+Math.min(1,e.st/.18)*190;else if(st==='recover')ang=40;else ang=-78;
  const r=ang*Math.PI/180,c=Math.cos(r),sn=Math.sin(r),bx=X+f*(hx+ln),by=Y+hy,tx=bx+f*c*30,ty=by+sn*30,px=-sn,py=c;
  line(bx-f*c*12,by-sn*12,tx,ty,'#5a4430');line(tx,ty,tx+f*c*6,ty+sn*6,'#c9c6bd');
  g.fillStyle=fl?'#fff':'#9a9aa2';for(let k=1;k<6;k++)g.fillRect(Math.round(tx-f*c*k+f*px*3),Math.round(ty-sn*k+py*3),2,2);
  if(st==='thrustW'&&e.st>.3){g.fillStyle=Math.floor(e.st*20)%2?C.emberW:C.emberL;g.fillRect(Math.round(tx+f*c*6),Math.round(ty+sn*6),2,1)}
  if(st==='sweepW'&&e.st>.4){g.fillStyle=C.emberW;g.fillRect(Math.round(tx),Math.round(ty),1,1)}
  if(st==='sweep'&&e.st<.2){g.globalAlpha=.35;g.fillStyle='#e8e2d4';g.fillRect(X-46,Y-26,92,2);g.globalAlpha=1}
  R(hx-1+ln,-17,3,3,arL);if(st==='alert')alertMark(X,Y,28)}
function drawBomber(e,X,Y,R,f,fl){const lea='#5a4630',leaD='#3e3022',hood='#3a2e22',st=e.state;
  if(st==='dead'){R(-8,-4,16,4,leaD);R(8,-6,10,6,'#3e3c44');return}
  const mx=10;R(mx-6,-6,14,6,C.woodD);R(mx-6,-6,14,1,C.wood);R(mx-5,-2,3,2,'#1a1614');R(mx+4,-2,3,2,'#1a1614');
  const ang=-55*Math.PI/180,bx=X+f*mx,by=Y-8;for(let k=0;k<12;k++){g.fillStyle=fl?'#fff':k>9?'#5a5762':'#3e3c44';g.fillRect(Math.round(bx+f*Math.cos(ang)*k)-2,Math.round(by+Math.sin(ang)*k)-2,5,5)}
  g.fillStyle=st==='load'?C.ember:'#1a1614';g.fillRect(Math.round(bx+f*Math.cos(ang)*12)-1,Math.round(by+Math.sin(ang)*12)-2,3,1);
  R(-5,-8,3,8,leaD);if(st==='kick')R(1,-8,8,3,leaD);else R(0,-8,3,8,leaD);
  R(-6,-17,11,10,lea);R(-6,-17,2,10,leaD);R(-6,-10,11,1,'#2a1e14');R(-5,-23,9,7,hood);R(-1,-21,5,2,'#2a1e14');R(0,-21,2,1,'#c9a040');R(3,-21,1,1,'#c9a040');
  if(st==='load'){R(3,-20,6,2,lea);const s2=X+f*9,y2=Y-24;g.fillStyle='#2a2830';g.fillRect(s2-2,y2-2,5,5);g.fillStyle=C.ember;g.fillRect(s2,y2-3,1,1)}else R(3,-15,4,2,lea);
  if(st==='kickW'){g.fillStyle=C.emberW;g.fillRect(X+f*4,Y-6,1,1)}}
function drawBell(cx,cy,glow,crack){cx=Math.round(cx);cy=Math.round(cy);for(let i=0;i<22;i++){const w=Math.round(9+i*.6+(i>18?(i-18)*2:0));g.fillStyle=i<2?'#c9a060':i>19?'#5a4224':(i%5===0?'#7a5a30':'#9a7440');g.fillRect(cx-w,cy+i,w*2,1)}
  g.fillStyle='#b48a50';g.fillRect(cx-6,cy+2,2,14);g.fillStyle='#5a4224';g.fillRect(cx-3,cy-4,6,4);
  if(glow){g.globalAlpha=.45;g.fillStyle='#ffe0a0';g.fillRect(cx-13,cy+2,26,18);g.globalAlpha=1}
  if(crack){g.fillStyle='#2a1a10';let x=cx+3,y=cy+3;for(let i=0;i<9;i++){g.fillRect(x,y,1,2);x+=i&1?1:-1;y+=2}}
  g.fillStyle='#2a1a10';g.fillRect(cx-2,cy+20,4,4)}
function wbell(cx,cy,ghost){cx=Math.round(cx);cy=Math.round(cy);const H=16;g.fillStyle=ghost?'#c8b8ff':'#2a2730';g.fillRect(cx-1,cy-3,3,3);
  for(let i=0;i<H;i++){const w=Math.round(i<2?3+i:4.6+(i-2)*.27+(i>=H-3?(i-H+4)*1.1:0));
    g.fillStyle=ghost?(i<2?'#e0d8ff':i===H-1?'#4a3aa0':i===6||i===11?'#6a5ad8':'#9a8af0'):(i<2?'#b48a50':i===H-1?'#2a1c10':i===H-2?'#c9a060':i===6||i===11?'#5a4228':'#7a5c38');g.fillRect(cx-w,cy+i,w*2,1);
    if(!ghost&&i>1&&i<H-2){g.fillStyle='#4a3622';g.fillRect(cx-w,cy+i,2,1);g.fillStyle='#a07c4a';g.fillRect(cx-w+3,cy+i,1,1)}}
  g.fillStyle=ghost?'#f4f0ff':'#d8b070';for(const x of [-4,-1,2,5])g.fillRect(cx+x,cy+8+((x+8)%2),1,1);
  g.fillStyle=ghost?'#3a2a90':'#1a120a';g.fillRect(cx-1,cy+H,2,2)}
function chainL(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.floor(d/2));for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);g.fillStyle=i&1?'#8a8494':'#4a4452';g.fillRect(x,y,1,1);g.fillStyle='#2a2630';g.fillRect(x,y+1,1,1)}}
function drawBellwarden(e,X,Y,R,f,fl){const st=e.state,ph2=e.phase===2,t=game.time;
  const rob='#2a2430',robD='#1a161e',robL='#40384a',crim='#4a1418',crimL='#7a2a2a',iron='#3a3440',ironD='#24202a',ironL='#4e4858',brz='#7a5c38',brzD='#4a3622',brzL='#b48a50';
  const P2=(x,y)=>[X+f*x,Y+y];
  if(st==='dead'){for(let x=-30;x<18;x++){const h=3+Math.round(3*Math.sin((x+30)/48*Math.PI));R(x,-h,1,h,x<-26||x>14?robD:rob)}R(-12,-6,12,6,crim);R(-30,-1,48,1,robD);for(let i=-30;i<18;i+=4)R(i,-1,2,2,i%8?robD:crim);
    for(let i=0;i<22;i++){const hw=Math.round(i<3?4+i:6+(i-3)*.18+(i>=16?(i-15)*1.1:0));R(18+i,-14-hw,1,hw*2,i<1?brzL:i===21?'#2a1c10':i===20?'#c9a060':i===5||i===17?brzD:brz)}
    const a=P2(-38,-16),b=P2(-52,-16);wbell(a[0],a[1]);wbell(b[0],b[1]);return}
  const mv=Math.abs(e.vx)>8&&e.onGround,stp=mv?Math.sin(e.t2*4.5):0,a=Math.round(stp*3);
  let c=0;if(st==='slamW')c=-2;else if(st==='slam'||st==='recover')c=3;else if(st==='ringW')c=-1;
  const glow=ph2?(Math.floor(t*14)%3?'#ffb040':'#fff0a0'):(Math.floor(t*6)%4?'#ff8a3a':'#ffc070'),hot=ph2||st.endsWith('W')||st==='ringR';
  const flame=(x,y,w,hgt)=>{const fk=Math.floor(t*14);for(let k=-w;k<w;k+=2){const hh=Math.round(hgt*(.45+.55*(((k*7+fk*5)%9+9)%9)/8)*(1-Math.abs(k)/(w+2)));g.fillStyle='#c03010';g.fillRect(x+k,y-hh,2,hh);g.fillStyle='#ff7a28';g.fillRect(x+k,y-Math.round(hh*.7),2,Math.round(hh*.7));g.fillStyle='#ffd070';g.fillRect(x+k,y-Math.round(hh*.35),2,Math.round(hh*.35))}};
  // phase 2: he burns; an aura of fire rises behind him
  if(ph2){g.save();g.globalAlpha*=.85;for(const [x,y,w,h] of [[0,-30+c,20,30],[0,-54+c,22,26],[1,-74+c,12,26],[-14,-10,10,14],[14,-10,10,14]]){const [fx,fy]=P2(x,y);flame(Math.round(fx),Math.round(fy),w,h)}g.restore()}
  // legs and greaves under the robe
  R(-9-a,-16,6,16,ironD);R(4+a,-16,6,16,iron);R(-10-a,-3,8,3,robD);R(4+a,-3,9,3,ironD);R(5+a,-11,4,1,brzD);
  // the robe: broad chest, a cinched waist, then it flares toward the floor
  for(let y=-54;y<-14;y++){const hw=Math.round(y<-34?12:y<-28?10:10+(y+28)*.46);R(-hw,y+c,hw*2,1,rob);R(-hw,y+c,3,1,robD);R(hw-2,y+c,2,1,robL)}
  for(let i=-17,k=0;i<17;i+=3,k++){const len=6+((k*7+3)%9)+Math.round(Math.sin(e.t2*2.2+k)*1.4),cr=k%4===1;R(i,-14+c,3,len,cr?crim:k&1?robD:rob);R(i+(k&1?2:0),-14+c+len-1,1,2,cr?'#2a0c0e':robD)}
  R(-3,-48+c,8,38,crim);R(-3,-48+c,8,1,crimL);R(4,-48+c,1,38,'#33100f');R(-3,-11+c,3,4,crim);R(2,-11+c,3,7,crim);
  if(ph2){const fk=Math.floor(t*12);R(-3,-44+c,1,30,fk%2?'#ff6a20':'#c03010');R(4,-40+c,1,24,fk%2?'#c03010':'#ff6a20');for(let y=-46;y<-12;y+=5)R(((y+fk)&1)?-11:9,y+c,2,2,'#ff7a28')}
  for(let k=0;k<8;k++){R(-11+k*3,-50+c+k*2,2,1,k&1?'#8a8494':'#5a5462');R(9-k*3,-50+c+k*2,2,1,k&1?'#5a5462':'#8a8494')}
  R(-10,-31+c,20,3,'#2e221a');R(0,-31+c,4,3,brzL);R(1,-30+c,2,1,brzD);
  // the back pauldron, the red cowl
  R(-20,-57+c,13,8,iron);R(-20,-57+c,13,1,brz);R(-20,-53+c,12,1,ironD);R(-19,-50+c,10,1,ironD);
  R(-10,-59+c,20,5,'#5a1a1e');R(-13,-56+c,4,12,crim);R(-13,-45+c,2,3,crim);
  // the bell head: fused, faceless, grated, with the cross on its crown
  const hy=-58+c,top=hy-22;R(0,top-9,2,9,ironD);R(-2,top-6,6,2,ironD);R(-1,top-2,4,2,brzD);
  for(let i=0;i<22;i++){const hw=Math.round(i<3?4+i:6+(i-3)*.18+(i>=16?(i-15)*1.1:0)),y=top+i;
    R(-hw+1,y,hw*2,1,i<1?brzL:i===21?'#2a1c10':i===20?'#c9a060':i===5||i===17?brzD:brz);if(i>0&&i<20){R(-hw+1,y,2,1,brzD);R(hw-2,y,1,1,brzL)}}
  for(const gx of [-2,1,4,7]){R(gx,top+7,1,10,'#120a08');if(hot||gx===1||gx===4)R(gx,top+9+((Math.floor(t*9)+gx+9)%3),1,3,glow)}
  for(let k=-5;k<9;k+=3)R(k,top+18,1,1,brzL);
  if(ph2){R(-3,top+3,1,2,'#120a08');R(-2,top+5,1,3,'#120a08');R(-3,top+8,1,2,'#120a08')}
  if(hot){const ga=ph2?.18:.35;g.globalAlpha*=ga;R(-7,top+3,18,16,glow);g.globalAlpha/=ga}
  // arms, chains and the two weapon bells
  const sw=Math.sin(e.t2*2)*1.5,wk=mv?Math.sin(e.t2*4.5)*3:0;
  let hf=[14,-30+c],bf=[17+wk,-17],hb=[-13,-30+c],bb=[-16-wk,-17],trail=null,ghostF=false;
  if(st==='swingW'){hf=[-4,-60];bf=[-24,-80+Math.round(Math.sin(e.st*20))]}
  else if(st==='swing'){const k=Math.min(1,e.st/.22),q=k*k*(3-2*k),a0=-2.6,an=a0+3.2*q;hf=[6+Math.cos(an)*17,-50+Math.sin(an)*17];bf=[6+Math.cos(an)*46,-50+Math.sin(an)*46-8];if(e.st<.34)trail=[a0,an,1-e.st/.34];
    if(e.combo){const t2=hf;hf=hb;hb=t2;const t3=bf;bf=bb;bb=t3}}
  else if(st==='slamW'){hf=[5,-72];hb=[-5,-72];bf=[11,-92+Math.round(sw)];bb=[-11,-92-Math.round(sw)]}
  else if(st==='slam'||st==='recover'){hf=[16,-24+c];hb=[7,-24+c];bf=[29,-16];bb=[16,-16]}
  else if(st==='pullW'){const an=e.st*15;hf=[-3,-58];bf=[-3+Math.cos(an)*18,-66+Math.sin(an)*12]}
  else if(st==='pullT'||st==='pullR'){hf=[18,-40];bf=[20+(e.hook||0),-32]}
  else if(st==='pullHit'){hf=[18,-40];bf=[20+(e.hook||0),-32];const k=Math.min(1,e.st/.26),q=k*k,a0=-2.4,an=a0+2.9*q;hb=[-4+Math.cos(an)*15,-50+Math.sin(an)*15];bb=[-4+Math.cos(an)*44,-50+Math.sin(an)*44-8];if(e.st>.2&&e.st<.5)trail=[a0,an,1-(e.st-.2)/.3,-4]}
  else if(st==='ringW'||st==='ringR'){const j=Math.round(Math.sin(e.st*40));hf=[25,-52];hb=[-25,-52];bf=[31+j,-48];bb=[-31-j,-48];ghostF=st==='ringW'&&Math.floor(e.st*10)%2}
  if(trail){const [a0,an,al,px=6]=trail,n=80,TC=ph2?['#ffe080','#ff6a20','#c03010']:['#ff9a80','#e0302a','#8a1a1e'];g.save();g.globalAlpha*=clamp(al,0,1)*.8;for(let i=0;i<=n;i++){const aa=a0+(an-a0)*i/n,wv=1+Math.round(4*i/n);for(let r=42;r<42+wv*2;r+=1){const [x,y]=P2(px+Math.cos(aa)*r,-50+Math.sin(aa)*r);g.fillStyle=r>=42+wv*2-2?TC[0]:i>n*.6?TC[1]:TC[2];g.fillRect(Math.round(x),Math.round(y),1,1)}}g.restore()}
  const arm=(sh,h,front)=>{const [x0,y0]=P2(sh[0],sh[1]),[x1,y1]=P2(h[0],h[1]);for(let d=-1;d<=1;d++)line(x0+d,y0,x1+d,y1,d<0?ironD:front?ironL:iron);line(x0,y0+1,x1,y1+1,ironD);R(h[0]-3,h[1]-2,5,5,ironD);R(h[0]-3,h[1]-2,5,1,brzD)};
  e.bfo=[f*bf[0],bf[1]];e.bbo=[f*bb[0],bb[1]];
  const bell=(h,b,gh)=>{const [x0,y0]=P2(h[0],h[1]),[x1,y1]=P2(b[0],b[1]);chainL(x0,y0,x1,y1-3);if(ph2&&!gh){g.save();g.globalAlpha*=.85;flame(Math.round(x1),Math.round(y1)+10,9,16);g.restore()}wbell(x1,y1,gh);if(ph2&&!gh){g.fillStyle='#ff9a40';g.fillRect(Math.round(x1)-6,Math.round(y1)+14,12,1)}};
  if(ph2){g.save();g.globalAlpha*=.9;const [fx,fy]=P2(12,-56+c);flame(Math.round(fx),Math.round(fy),5,7);g.restore()}
  bell(hb,bb,false);arm([-13,-50+c],hb,false);
  bell(hf,bf,ghostF);arm([13,-50+c],hf,true);
  // the front pauldron sits over the arm
  R(8,-58+c,14,9,'#46404c');R(8,-58+c,14,1,brzL);R(9,-54+c,12,1,ironD);R(10,-51+c,10,1,ironD);R(19,-62+c,2,4,ironL);R(14,-61+c,2,3,iron);
  if(st==='slamW'&&Math.floor(e.st*10)%2){const [x,y]=P2(22,-2);g.fillStyle='#e0483a';g.fillRect(x-16,y,32,1)}
  if(st==='pullW'||(st==='pullT'&&!e.hooked)){const [x,y]=P2(20+(e.hook||0),-24);if(Math.floor(t*12)%2){g.fillStyle='#c9c2b0';g.fillRect(x,y,1,1)}}}
function drawDrake(e,X,Y,R,f,fl){const sc='#4a404c',scD='#2f2834',scL='#685c6e',bel='#8a3a1c',mem='#3c303a',memD='#2a2028',horn='#cbbf9c',st=e.state,pulse=(Math.sin(game.time*5)+1)/2;
  const L=(x0,y0,x1,y1,c)=>line(X+f*x0,Y+y0,X+f*x1,Y+y1,fl?'#fff':c);
  const poly=(pts,c)=>{g.fillStyle=fl?'#f2ece0':c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(X+f*x,Y+y):g.moveTo(X+f*x,Y+y));g.closePath();g.fill()};
  if(st==='dead'){poly([[-50,0],[40,0],[34,-14],[-30,-16]],scD);poly([[-10,-14],[-40,-30],[-20,-10]],mem);R(30,-10,14,8,sc);return}
  const air=['takeoff','skyW','volleyW','strafeW','strafe','landW','land'].includes(st),flap=air?Math.sin(e.t2*(st==='strafe'?5:8))*14:0;
  if(air)poly([[2,-36],[-12,-72-flap],[-44,-62-flap*.6],[-30,-34]],memD);
  const tu=st==='tailW'?-14:st==='tail'?-4:0,ts=Math.sin(e.t2*2)*3,tl=[[-22,-22],[-38,-18+tu*.5+ts*.3],[-52,-14+tu+ts*.6],[-64,-10+tu+ts]];
  for(let i=0;i<tl.length-1;i++){const w=6-i*1.5;for(let k=0;k<w;k++)L(tl[i][0],tl[i][1]+k-w/2,tl[i+1][0],tl[i+1][1]+k-w/2,i&1?sc:scD)}
  poly([[-64,-12+tu+ts],[-74,-16+tu+ts],[-70,-6+tu+ts]],horn);
  if(st==='tail'&&e.st<.25){g.globalAlpha=.35;g.fillStyle='#ffc98a';g.fillRect(X-80,Y-14,160,2);g.globalAlpha=1}
  const bob=air?0:Math.round(Math.sin(e.t2*3)),by=-22+bob;
  if(!air){const s=Math.abs(e.vx)>8?Math.sin(e.t2*7):0,a=Math.round(s*3);R(-18-a,by+6,6,16-bob,scD);R(-20-a,-2,9,2,'#1a1418');R(8+a,by+6,6,16-bob,scD);R(7+a,-2,9,2,'#1a1418')}
  poly([[-24,by-6],[-6,by-14],[16,by-12],[24,by-2],[16,by+8],[-18,by+8]],sc);poly([[-14,by+2],[14,by+2],[12,by+8],[-12,by+8]],pulse>.4?bel:'#6a2a14');
  for(let k=-16;k<16;k+=5)R(k,by-13+Math.round(Math.abs(k)/6),2,2,scL);
  if(!air){const s=Math.abs(e.vx)>8?Math.sin(e.t2*7):0,a=Math.round(s*3);R(-12+a,by+7,5,15-bob,sc);R(14-a,by+7,5,15-bob,sc);R(13-a,-1,8,1,horn)}else{R(-14,by+6,5,8,scD);R(10,by+6,5,8,scD)}
  if(st==='clawW'){R(18,by-8,5,10,sc);R(20,by-14,6,5,scL);R(25,by-14,2,1,horn);R(25,by-11,2,1,horn)}
  if(st==='claw'&&e.st<.2){g.globalAlpha=.4;g.fillStyle='#ffc98a';g.fillRect(f>0?X+10:X-64,Y-34,54,3);g.globalAlpha=1}
  const hr=st==='breathW'?-10:st==='breath'?-4:0,hx=30,hy=-42+hr+bob;
  for(let k=0;k<6;k++)L(14,by-6+k,hx-4,hy+4+k,k<2?scL:sc);
  poly([[hx-6,hy-2],[hx+12,hy],[hx+16,hy+4],[hx+12,hy+8],[hx-6,hy+8]],sc);
  if(st==='breath'||(st==='breathW'&&e.st>.6)||st==='strafe')poly([[hx+4,hy+6],[hx+16,hy+6],[hx+12,hy+12],[hx+2,hy+10]],'#120c0a');
  R(hx+2,hy+1,2,2,st.endsWith('W')?C.emberW:C.ember);poly([[hx-4,hy-2],[hx-14,hy-12],[hx-2,hy]],horn);poly([[hx+2,hy-2],[hx-4,hy-14],[hx+6,hy-1]],horn);
  if(st==='breathW'){g.fillStyle=pulse>.3?C.emberL:C.ember;g.fillRect(X+f*(hx-2)-1,Y+hy+8,4,4);
    if(e.st>.2){const k=Math.floor(game.time*14)%2,gx0=X+f*(hx+6);g.fillStyle=k?C.ember:'#c4521f';for(let d=0;d<140;d+=6)g.fillRect(f>0?gx0+d:gx0-d-3,sy(16*T)-1,3,1)}}
  if(st==='strafeW'){const k=Math.floor(game.time*12)%2;g.fillStyle=k?C.ember:'#c4521f';for(let d=0;d<VW;d+=8)g.fillRect(d,sy(16*T)-1,4,1)}
  if(air){poly([[2,-36],[18,-76-flap],[48,-60-flap*.6],[24,-30]],mem);L(2,-36,18,-76-flap,scL);L(18,-76-flap,48,-60-flap*.6,scL);L(18,-76-flap,30,-34,scD)}
  else{poly([[-4,by-10],[-32,by-28],[-26,by-6]],mem);L(-4,by-10,-32,by-28,scL)}
  if(st==='landed'){for(let i=0;i<3;i++){const a3=game.time*5+i*2.1;g.fillStyle=C.emberL;g.fillRect(X+Math.round(Math.cos(a3)*12),Y-60+Math.round(Math.sin(a3)*2),1,1)}}}
/* ---------- shells, rings and the knight's flame wave ---------- */
function drawShot4(s){const X=sx(s.x),Y=sy(s.y);
  if(s.kind==='shell'){const tx=sx(s.tx),ty=sy(s.ty),k=Math.floor(game.time*12)%2;g.fillStyle=k?'#d0502e':C.ember;for(let i=0;i<20;i++){const a=i/20*Math.PI*2,rr=12-6*(1-Math.max(0,s.t));g.fillRect(tx+Math.round(Math.cos(a)*rr),ty-1+Math.round(Math.sin(a)*rr*.3),1,1)}g.fillRect(tx-1,ty-2,3,1);
    g.fillStyle='#2a2830';g.fillRect(X-2,Y-2,5,5);g.fillStyle='#5a5762';g.fillRect(X-2,Y-2,5,1);g.fillStyle=C.ember;g.fillRect(X,Y-3,1,1);return true}
  if(s.kind==='sbell'){const fa=Math.min(1,s.born/.9)*Math.min(1,s.life/.5);g.save();g.fillStyle='#8a6aff';for(const [rr,al] of [[14,.08],[10,.12],[7,.16]]){g.globalAlpha=al*fa;g.beginPath();g.arc(X,Y+1,rr,0,Math.PI*2);g.fill()}g.globalAlpha=(.75+.2*Math.sin(game.time*9+s.a*3))*fa;
    const sw=Math.round(Math.sin(game.time*6+s.a)*2);wbell(X+sw,Y-7,true);g.restore();return true}
  if(s.kind==='ring'){if(s.r<=0)return true;const n=Math.max(28,Math.floor(s.r*.9));g.globalAlpha=clamp(1.2-s.r/s.max,0,1);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;g.fillStyle=s.ghost?(i&1?'#c8b0ff':'#7a6ae0'):i&1?'#ffe0a0':'#c9a060';g.fillRect(X+Math.round(Math.cos(a)*s.r),Y+Math.round(Math.sin(a)*s.r),2,2)}g.globalAlpha=1;return true}
  if(s.kind==='pwave'){for(let i=0;i<16;i++){const h=(rnd()*16)|0;g.fillStyle=h>11?C.emberW:h>6?C.emberL:C.ember;g.fillRect(X+Math.round((rnd()-.5)*10),Y+8-h,1,1)}g.fillStyle=C.emberL;g.fillRect(X-5,Y+6,11,2);return true}
  return false}

/* ---------- Level 5 set pieces: the siege yard and the great gate ---------- */
Object.assign(DECOR2,{
  trebuchet(c,d){const x=Math.round(d.x),y=Math.round(d.y),W=C.woodD,M=C.wood,L=C.woodL;
    c.fillStyle=W;c.fillRect(x-30,y-6,60,6);c.fillStyle=M;c.fillRect(x-30,y-6,60,1);
    for(const s of [-1,1]){c.fillStyle=W;for(let i=0;i<60;i++)c.fillRect(x+s*(26-i*.38)|0,y-6-i,3,1)}
    c.fillStyle=C.iron;c.fillRect(x-3,y-70,6,6);
    c.save();c.translate(x,y-67);c.rotate(-.55);c.fillStyle=M;c.fillRect(-58,-2,86,4);c.fillStyle=L;c.fillRect(-58,-2,86,1);
    c.fillStyle=W;c.fillRect(18,-1,16,22);c.fillStyle='#3e2e22';c.fillRect(20,6,12,14);c.fillStyle=C.iron;c.fillRect(18,4,16,2);c.restore();
    c.fillStyle='#8a7a5a';c.fillRect(x-52,y-34,1,22);c.fillStyle='#5a4a36';c.fillRect(x-56,y-12,9,5);
    c.fillStyle=W;c.fillRect(x-20,y-28,40,3);c.fillRect(x-4,y-28,3,22)},
  tent(c,d){const x=Math.round(d.x),y=Math.round(d.y);
    for(let i=0;i<34;i++){const w=Math.round(i*1.1);c.fillStyle=(Math.floor((i+2)/6)&1)?'#8a6a4a':'#a88a62';c.fillRect(x-w,y-34+i,w*2,1)}
    c.fillStyle='#6a5038';for(let i=0;i<34;i++)c.fillRect(x-Math.round(i*1.1),y-34+i,1,1);
    c.fillStyle='#2a221c';c.beginPath();c.moveTo(x-8,y);c.lineTo(x,y-20);c.lineTo(x+8,y);c.fill();
    c.fillStyle=C.woodD;c.fillRect(x-1,y-42,2,8);c.fillStyle='#7a2a24';c.fillRect(x+1,y-42,7,4)},
  barricade(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle=C.woodD;c.fillRect(x-22,y-12,44,3);
    for(let i=-18;i<=18;i+=9)for(const s of [-1,1]){for(let k=0;k<18;k++){c.fillStyle=k>14?'#b8ab90':C.wood;c.fillRect(x+i+s*k*.6|0,y-2-k,2,1)}}},
  siegeTower(c,d){const x=Math.round(d.x)-8,y=Math.round(d.y),W=C.woodD,M=C.wood;
    for(const px of [x-78,x-40,x+2,x+70]){c.fillStyle=W;c.fillRect(px,y-112,5,112);c.fillStyle=M;c.fillRect(px,y-112,1,112)}
    for(const py of [y-112,y-70,y-30]){c.fillStyle=W;c.fillRect(x-80,py,155,4)}
    c.fillStyle='#4a3a2c';for(let i=0;i<8;i++){c.fillRect(x-78+i*19,y-108,1,38)}
    for(let i=0;i<14;i++){c.fillStyle=W;c.fillRect(x-78+i*5.5|0,y-70+i*3|0,3,2);c.fillRect(x+70-i*5|0,y-70+i*3|0,3,2)}
    c.fillStyle='#6a5a48';c.fillRect(x-80,y-126,60,14);c.fillStyle='#8a7a62';c.fillRect(x-80,y-126,60,1);c.fillStyle='#2a221c';c.fillRect(x-70,y-122,6,6);c.fillRect(x-48,y-122,6,6)},
  weaponRack(c,d){const x=Math.round(d.x),y=Math.round(d.y);c.fillStyle=C.woodD;c.fillRect(x-12,y-18,24,3);c.fillRect(x-11,y-18,2,18);c.fillRect(x+9,y-18,2,18);
    for(let i=-8;i<=8;i+=4){c.fillStyle='#5a4430';c.fillRect(x+i,y-34,1,34);c.fillStyle='#b8b4ac';c.fillRect(x+i-1,y-38,3,4)}},
  greatGate(c,d){const x=Math.round(d.x),y=Math.round(d.y),st='#56525d',stD='#46424d',stL='#6a6672';
    c.fillStyle=st;c.fillRect(x-90,y-170,180,170);
    for(let r=0;r<17;r++)for(let k=0;k<18;k++){c.fillStyle=(r+k)%3?st:stD;c.fillRect(x-90+k*10+((r&1)*5),y-170+r*10,9,9)}
    for(const s of [-1,1]){const tx=x+s*80-20;c.fillStyle=stD;c.fillRect(tx,y-226,40,226);c.fillStyle=stL;c.fillRect(tx,y-226,4,226);
      for(let k=0;k<40;k+=10){c.fillStyle=stD;c.fillRect(tx+k,y-234,6,8)}c.fillStyle='#16151a';c.fillRect(tx+16,y-200,7,16);c.fillRect(tx+16,y-150,7,16)}
    c.fillStyle='#121116';c.beginPath();c.moveTo(x-46,y);c.lineTo(x-46,y-96);c.arc(x,y-96,46,Math.PI,0);c.lineTo(x+46,y);c.fill();
    c.fillStyle=C.iron;for(let k=-42;k<=42;k+=10)c.fillRect(x+k,y-130,3,96);for(let r=y-120;r<y-34;r+=16)c.fillRect(x-44,r,88,2);
    for(let k=-42;k<=42;k+=10){c.fillStyle='#9a9aa2';c.fillRect(x+k,y-36,3,4)}
    c.fillStyle=stL;for(let i=0;i<14;i++){const a=Math.PI+i/13*Math.PI;c.fillRect(x+Math.cos(a)*50-3|0,y-96+Math.sin(a)*50-2|0,6,5)}
    c.fillStyle='#7a2a24';c.fillRect(x-62,y-160,14,40);c.fillRect(x+48,y-160,14,40);c.fillStyle='#c9a040';c.fillRect(x-57,y-150,4,4);c.fillRect(x+53,y-150,4,4);
    for(const s of [-1,1]){c.fillStyle=C.iron;for(let k=0;k<70;k+=4)c.fillRect(x+s*(48+k*.3)|0,y-110+k,2,3)}}
});
/* ---------- armored foes ---------- */
function thick(x0,y0,x1,y1,w,c){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,px=-dy/l,py=dx/l;for(let k=-(w-1)/2;k<=(w-1)/2;k+=.5)line(x0+px*k,y0+py*k,x1+px*k,y1+py*k,c)}
function drawBrute(e,X,Y,R,f,fl){const pl='#5d5964',plD='#45414c',plL='#7c7884',ch='#36343c',st=e.state,F=c=>fl?'#f2ece0':c;
  if(st==='dead'){R(-16,-8,32,8,plD);R(-16,-8,32,1,plL);R(14,-10,12,10,'#5a5660');return}
  const mv=Math.abs(e.vx)>6&&e.onGround,a=Math.round((mv?Math.sin(e.t2*(st==='charge'?14:7)):0)*2),lean=st==='charge'||st==='chargeW'?4:st==='stunned'||st==='stagger'?-3:0,sw=st==='stagger'?Math.round(Math.sin(e.t2*9)*2):0,o=lean+sw;
  let hx,hy,gx=8,gy=-24;
  if(st==='smashW'){hx=-8;hy=-62;gx=0;gy=-42}else if(st==='smash'||st==='smashR'){hx=42;hy=-6;gx=18;gy=-20}else if(st==='swatW'){hx=14;hy=-4;gx=10;gy=-18}
  else if(st==='swat'){hx=8;hy=-72;gx=8;gy=-44}else if(st==='chargeW'||st==='charge'){hx=-22;hy=-12;gx=-6;gy=-22}else if(st==='stunned'||st==='stagger'){hx=30;hy=-4;gx=14;gy=-20}else{hx=20;hy=-6;gx=12;gy=-20}
  const GX=X+f*(gx+o),GY=Y+gy;
  thick(X+f*(-9+o),Y-31,GX-f*3,GY+3,4,F('#3a3842'));
  R(-10+a,-13,9,13,'#2e2c33');R(3-a,-13,9,13,'#34323a');R(-11+a,-9,10,3,plD);R(2-a,-9,10,3,plD);R(-12+a,-2,11,2,'#1c1b20');R(2-a,-2,11,2,'#1c1b20');
  R(-14+o,-16,28,5,'#3a2a1e');R(-14+o,-16,8,7,plD);R(6+o,-16,8,7,plD);R(-2+o,-16,4,3,'#a08040');
  for(let y=-33;y<-15;y++){const w=y<-26?12:y<-20?14:13;R(-w+o,y,w*2,1,e.plate>0?(y===-33?plL:pl):ch)}R(-13+o,-33,4,18,plD);
  if(e.plate<=0){for(let i=0;i<14;i++)R(-11+o+(i%5)*5,-31+((i/5)|0)*5,2,2,'#4a4852')}else{for(let i=0;i<3;i++)R(-6+o+i*5,-28,3,3,i<e.plate?'#9a96a2':'#2a2830');if(e.plate<3){g.fillStyle='#1c1b20';const cx=X+f*(3+o);for(let k=0;k<6;k++)g.fillRect(cx+(k&1),Y-31+k*3,1,3)}}
  R(-18+o,-38,12,10,plL);R(-18+o,-38,12,1,'#9a96a2');R(-17+o,-41,3,3,plD);R(4+o,-39,14,11,plL);R(4+o,-39,14,1,'#9a96a2');R(9+o,-43,3,4,plD);R(5+o,-29,12,1,plD);
  R(0+o,-45,12,10,'#3e3c44');R(0+o,-45,12,1,'#5a5762');R(-1+o,-37,14,2,plD);R(4+o,-41,8,1,'#0b0a0d');R(4+o,-39,8,1,'#0b0a0d');R(8+o,-41,3,1,st.endsWith('W')?C.emberW:'#c9c2b0');R(1+o,-48,2,3,'#cbbf9c');R(10+o,-48,2,3,'#cbbf9c');
  const H1x=X+f*hx,H1y=Y+hy;line(GX,GY,H1x,H1y,'#4a3a2a');line(GX,GY+1,H1x,H1y+1,'#3a2a1e');
  thick(X+f*(10+o),Y-32,GX,GY,5,F('#55515c'));R(gx-3+o,gy-3,6,6,plL);
  R(hx-8,hy-7,16,13,'#57535e');R(hx-8,hy-7,16,2,'#7a7682');R(hx-8,hy+4,16,2,'#3e3a44');R(hx-9,hy-4,1,7,C.iron);R(hx+8,hy-4,1,7,C.iron);R(hx-2,hy-9,4,2,'#9a9aa2');
  if(st==='smashW'&&e.st>.5){g.fillStyle=C.emberW;g.fillRect(H1x,H1y-10,1,2)}
  if(st==='smash'){g.globalAlpha=.35;g.fillStyle='#e8e2d4';g.fillRect(f>0?X+4:X-58,Y-3,54,2);g.globalAlpha=1}
  if(st==='stunned'||st==='stagger'){for(let i=0;i<3;i++){const a3=game.time*5+i*2.1;g.fillStyle='#e8d890';g.fillRect(X+Math.round(Math.cos(a3)*9),Y-54+Math.round(Math.sin(a3)*2),1,1)}}
  if(st==='alert')alertMark(X,Y,50)}
function drawBulwark(e,X,Y,R,f,fl){const ar='#55596a',arD='#3e4252',arL='#767a8a',sh='#6a5a40',shD='#4a3e2c',st=e.state;
  if(st==='dead'){R(-10,-4,20,4,arD);R(6,-6,14,6,sh);return}
  const mv=Math.abs(e.vx)>6&&e.onGround,a=Math.round((mv?Math.sin(e.t2*8):0)*2),open=st==='open';
  R(-5+a,-10,4,10,'#2a2a30');R(1-a,-10,4,10,'#34343a');R(-6+a,-1,5,1,'#1a1a1e');R(1-a,-1,5,1,'#1a1a1e');
  R(-6,-22,12,12,ar);R(-6,-22,3,12,arD);R(-7,-12,14,2,arD);R(-6,-30,11,8,ar);R(-6,-30,11,1,arL);R(-1,-27,6,1,'#0b0a0d');R(2,-27,2,1,st.endsWith('W')?C.emberW:'#c9c2b0');R(-2,-33,3,3,'#7a2a24');
  const sp=st==='poke'?20:st==='pokeW'?-6:0;line(X+f*(-6+sp),Y-25,X+f*(30+sp),Y-25,'#5a4430');R(30+sp,-26,5,3,'#c9c6bd');R(34+sp,-25,2,1,'#e8e4dc');
  if(open){R(-13,-26,6,26,'#8a8a94');R(-12,-25,4,24,'#6e2624');R(-11,-14,2,4,'#c9a040')}
  else{const bx=st==='bash'?9:st==='bashW'?3:6;R(bx,-32,9,32,'#8a8a94');R(bx+1,-34,7,2,'#8a8a94');R(bx+1,-31,7,30,'#6e2624');R(bx+1,-31,2,30,'#56201e');R(bx+1,-34,7,1,'#b4b4bc');R(bx+8,-32,1,32,'#5a5a64');for(let k=0;k<4;k++){R(bx+1+k,-20+k,1,2,'#c9a040');R(bx+7-k,-20+k,1,2,'#c9a040')}R(bx+4,-27,1,4,'#c9a040');R(bx+3,-26,3,1,'#c9a040');for(const ry of [-30,-3])R(bx+1,ry,7,1,'#4a4a54')}
  if(st==='bashW'&&e.st>.25){g.fillStyle=C.emberW;g.fillRect(X+f*12,Y-36,1,2)}
  if(st==='open'){g.fillStyle=Math.floor(game.time*6)%2?C.emberL:C.ember;g.fillRect(X-1,Y-40,2,2)}
  if(st==='alert')alertMark(X,Y,34)}
function drawFlail(e,X,Y,R,f,fl){const ar='#5e5a54',arD='#46423e',arL='#7e7a72',tab='#3a4a3a',st=e.state;
  if(st==='dead'){R(-10,-4,20,4,arD);R(10,-5,6,5,'#2a2830');return}
  const mv=Math.abs(e.vx)>6&&e.onGround,a=Math.round((mv?Math.sin(e.t2*9):0)*2),wob=st==='dizzy'?Math.round(Math.sin(e.t2*7)*2):0;
  R(-5+a,-11,4,11,'#2a2a30');R(1-a,-11,4,11,'#34343a');R(-6+a,-1,5,1,'#1a1a1e');R(1-a,-1,5,1,'#1a1a1e');
  R(-6+wob,-24,12,13,tab);R(-6+wob,-24,3,13,'#2a382a');R(-7+wob,-25,5,4,ar);R(3+wob,-25,5,4,arL);R(-6+wob,-13,12,2,arD);
  R(-5+wob,-32,10,8,ar);R(-5+wob,-32,10,1,arL);R(-6+wob,-28,12,1,arD);R(0+wob,-29,5,1,'#0b0a0d');R(2+wob,-29,1,1,st.endsWith('W')?C.emberW:'#c9c2b0');for(let k=-4;k<5;k+=3)R(k+wob,-34,1,2,arL);
  const hx=X+f*(6+wob),hy=Y-18,[bx,by]=flailBall(e);const BX=Math.round(sx(bx)),BY=Math.round(sy(by));
  g.fillStyle=C.iron;const n=10;for(let i=1;i<n;i++){const t=i/n;g.fillRect(Math.round(hx+(BX-hx)*t),Math.round(hy+(BY-hy)*t+Math.sin(t*Math.PI)*(st==='spin'?0:3)),1,1)}
  R(5+wob,-19,3,4,'#5a4430');g.fillStyle=fl?'#fff':'#2a2830';g.fillRect(BX-4,BY-4,9,9);g.fillStyle='#6a6672';g.fillRect(BX-4,BY-4,9,2);g.fillStyle='#d8d4cc';g.fillRect(BX,BY-7,1,3);g.fillRect(BX,BY+5,1,3);g.fillRect(BX-7,BY,3,1);g.fillRect(BX+5,BY,3,1);g.fillRect(BX-5,BY-5,1,1);g.fillRect(BX+5,BY-5,1,1);g.fillRect(BX-5,BY+5,1,1);g.fillRect(BX+5,BY+5,1,1);
  if(st==='spin'){g.globalAlpha=.25;g.fillStyle='#e8e2d4';for(let i=0;i<24;i++){const a2=i/24*Math.PI*2;g.fillRect(X+Math.round(Math.cos(a2)*38),Y-18+Math.round(Math.sin(a2)*14),1,1)}g.globalAlpha=1}
  if(st==='dizzy'){for(let i=0;i<3;i++){const a3=game.time*6+i*2.1;g.fillStyle='#e8d890';g.fillRect(X+Math.round(Math.cos(a3)*7),Y-38+Math.round(Math.sin(a3)*2),1,1)}}
  if(st==='alert')alertMark(X,Y,34)}
/* ---------- the Iron Marshal ---------- */
function drawMarshal(e,X,Y,R,f,fl){const ar='#4a4c58',arD='#34363f',arL='#6c6e7c',tab='#7a2224',tabD='#561618',gold='#c9a040',st=e.state;
  if(st==='dead'){R(-20,-6,40,6,arD);R(-20,-6,40,1,arL);R(-12,-9,14,4,tab);line(X+f*4,Y-3,X+f*40,Y-4,'#b8b4ac');return}
  const air=st==='leapUp',mv=Math.abs(e.vx)>8&&e.onGround,a=Math.round((mv?Math.sin(e.t2*9):0)*3);
  for(let i=0;i<22;i++){const w=Math.round(Math.sin(game.time*3+i*.3)*2);R(-10-Math.min(8,i*.5)+w*(i>8?1:0),-40+i,6,1,i>17?tabD:'#3a1416')}
  if(air){R(-8,-16,6,10,arD);R(3,-14,6,8,ar)}else{R(-8+a,-16,6,16,arD);R(3-a,-16,6,16,ar);R(-9+a,-2,8,2,'#1a1a1e');R(2-a,-2,8,2,'#1a1a1e')}
  R(-9,-36,18,21,ar);R(-9,-36,4,21,arD);R(-6,-34,12,22,tab);R(-6,-34,3,22,tabD);R(-2,-30,4,6,gold);R(-10,-17,20,3,'#2a2024');R(-1,-17,3,3,gold);
  R(-12,-39,9,6,arL);R(4,-39,10,7,arL);R(-12,-39,9,1,'#9a9cac');R(4,-39,10,1,'#9a9cac');
  R(-5,-48,11,10,ar);R(-5,-48,11,1,arL);R(-6,-42,13,1,arD);R(1,-44,6,1,'#0b0a0d');R(3,-44,3,1,st.endsWith('W')?C.emberW:'#d8d0c0');R(5,-46,2,5,arD);
  for(let i=0;i<10;i++)R(-4-i,-52+Math.round(i*.6+Math.sin(game.time*5+i*.6)),3,2,i<3?'#a02a2a':tab);
  let ang,hx=8,hy=-28,len=40;
  if(st==='cutW')ang=e.hits&1?60:-130;else if(st==='cut'){const k=Math.min(1,e.st/.12);ang=e.hits&1?60-k*170:-130+k*175}else if(st==='cutR')ang=40;else if(st==='riposteW')ang=-150;else if(st==='riposte'){const k=Math.min(1,e.st/.12);ang=-150+k*190}
  else if(st==='lungeW'){ang=180;hx=-4}else if(st==='lunge'){ang=0;hx=14;len=46}else if(st==='leapW'||st==='leapUp'){ang=-95;hy=-40}else if(st==='leapLand'){ang=80;hx=14}
  else if(st==='volleyW'){ang=-80;hy=-40}else if(st==='hornW'||st==='hornR'){ang=110;hx=-2}else ang=-60;
  const r=ang*Math.PI/180,bx=X+f*hx,by=Y+hy,tx=bx+f*Math.cos(r)*len,ty=by+Math.sin(r)*len;
  line(bx,by+1,tx,ty+1,'#6a6672');line(bx,by,tx,ty,fl?'#fff':'#c9c6bd');line(bx-f*Math.cos(r)*6,by-Math.sin(r)*6,bx,by,'#4a3a2a');
  const px=-Math.sin(r),py=Math.cos(r);g.fillStyle=gold;g.fillRect(Math.round(bx+f*px*3)-1,Math.round(by+py*3)-1,2,2);g.fillRect(Math.round(bx-f*px*3)-1,Math.round(by-py*3)-1,2,2);
  if(e.phase===2){for(let k=8;k<len;k+=7){g.fillStyle=Math.floor(game.time*10+k)%3?C.ember:C.emberL;g.fillRect(Math.round(bx+f*Math.cos(r)*k),Math.round(by+Math.sin(r)*k)-1,1,1)}}
  if(st==='riposteW'){g.fillStyle=Math.floor(game.time*20)%2?C.emberW:'#fff';g.fillRect(X+f*4,Y-50,2,2)}
  if((st==='cut'&&e.st<.14)||(st==='riposte'&&e.st<.16)){g.globalAlpha=.35;g.fillStyle='#e8e2d4';g.fillRect(f>0?X:X-60,Y-30,60,2);g.globalAlpha=1}
  R(hx-2,hy-2,4,4,arL);
  if(st==='hornW'||st==='hornR'){const hX=X+f*6,hY=Y-44;for(let k=0;k<10;k++){g.fillStyle=k>7?'#e0c890':'#b89a60';g.fillRect(hX+f*(4+k)-(f<0?1:0),hY-Math.round(k*.6)-(k>7?1:0),1,2+(k>7?2:0))}
    if(st==='hornW'&&e.st>.35){g.globalAlpha=.5;g.fillStyle='#ffe8b0';for(let k=0;k<3;k++){const rr=6+((game.time*40+k*8)%24);g.fillRect(hX+f*(14+rr),hY-8-rr*.2|0,1,4+rr*.2|0)}g.globalAlpha=1}}}
/* ---------- the Siege Colossus ---------- */
function drawColossus(e,X,Y,R,f,fl){const ir='#4e4a52',irD='#36333b',irL='#6c6872',irH='#8a8692',rust='#7a4a2c',st=e.state,ph2=e.phase>=2,F=c=>fl?'#f2ece0':c;
  if(st==='dead'){R(-44,-14,88,14,irD);R(-44,-14,88,2,irL);R(34,-22,28,22,'#57535e');R(-50,-9,12,9,ir);R(-10,-22,22,10,irD);return}
  const mv=Math.abs(e.vx)>8&&e.onGround,a=Math.round((mv?Math.sin(e.t2*(st==='charge'?10:4)):0)*3),o=st==='charge'||st==='chargeW'?6:st==='stunned'?-4:0,bob=st==='stomp'&&e.st<.15?3:st==='roarW'?-2:0;
  let gx,gy,cx,cy;
  if(st==='clubW'||st==='quakeW'){gx=2;gy=-86;cx=-26;cy=-118}else if(st==='club'||st==='stuck'||st==='quake'){gx=34;gy=-38;cx=78;cy=-12}else if(st==='chainW'){gx=-14;gy=-50;cx=-40;cy=-20}else if(st==='chain'){gx=-6;gy=-46;cx=-34;cy=-18}else if(st==='sweepW'){gx=-20;gy=-40;cx=-62;cy=-18}
  else if(st==='sweep'){const k=Math.min(1,e.st/.2);gx=-20+k*50;gy=-36;cx=-62+k*134;cy=-16}else if(st==='sweepR'){gx=30;gy=-36;cx=72;cy=-16}
  else if(st==='swatW'){gx=18;gy=-46;cx=44;cy=-24}else if(st==='swat'){gx=22;gy=-90;cx=52;cy=-124}else if(st==='chargeW'||st==='charge'){gx=-12;gy=-46;cx=-44;cy=-30}
  else if(st==='roarW'){gx=34;gy=-74;cx=56;cy=-104}else if(st==='stunned'){gx=28;gy=-36;cx=60;cy=-8}else{gx=24;gy=-44;cx=46;cy=-14}
  const GX=X+f*(gx+o),GY=Y+gy,SY=Y-74+bob;
  // back arm
  {const sx0=X+f*(-20+o),ex=(sx0+GX)/2-f*6,ey=(SY+GY)/2+10;thick(sx0,SY,ex,ey,8,F('#3a3740'));thick(ex,ey,GX-f*8,GY+4,7,F('#3a3740'));R(gx-12+o,gy,8,8,irD)}
  // legs
  if(st==='stompW'){R(5,-50,15,24,irL);R(4,-30,17,4,'#1c1b20');R(4,-42,17,5,irH)}else{R(5-a,-32,15,32,irL);R(4-a,-24,17,5,irH)}
  R(-20+a,-32,15,32,ir);R(-21+a,-24,17,5,irL);R(-22+a,-4,19,4,'#1c1b20');if(st!=='stompW')R(3-a,-4,19,4,'#1c1b20');
  // skirt and belly
  R(-26+o,-40+bob,52,10,'#3a2a1e');R(-26+o,-40+bob,13,14,ir);R(13+o,-40+bob,13,14,ir);R(-8+o,-40+bob,16,12,irD);R(-3+o,-44+bob,6,6,rust);
  for(let y=-78;y<-40;y++){const t=(y+78)/38,w=Math.round(24+Math.sin(t*Math.PI)*5);R(-w+o,y+bob,w*2,1,y<-76?irL:ir)}
  R(-27+o,-76+bob,9,34,irD);
  for(let k=0;k<3;k++){R(-16+o,-70+k*10+bob,32,2,irD);R(-16+o,-69+k*10+bob,32,1,irL)}
  for(const [rx,ry] of [[-14,-72],[12,-72],[-14,-52],[12,-52]])R(rx+o,ry+bob,2,2,irH);
  if(ph2){for(let k=0;k<8;k++){g.fillStyle=Math.floor(game.time*8+k)%2?C.ember:C.emberL;g.fillRect(X+f*(-10+o+k*3),Y-66+((k*7)%22)+bob,1,4)}R(-4+o,-62+bob,8,8,Math.floor(game.time*6)%2?C.ember:'#c4521f')}
  // pauldrons
  R(-34+o,-86+bob,20,16,irL);R(-34+o,-86+bob,20,2,irH);R(-34+o,-72+bob,20,2,irD);R(-28+o,-92+bob,4,6,irD);R(-27+o,-96+bob,2,4,'#9a9aa2');
  // head: a caged great-helm, hunched forward
  const hy=(st==='roarW'?-102:-96)+bob,hx=6+o;R(hx-2,hy+12,24,6,irD);R(hx,hy,20,18,irD);R(hx,hy,20,2,irL);R(hx+19,hy+2,2,14,'#2a2830');
  for(let k=0;k<4;k++)R(hx+9+k*3,hy+6,1,8,'#1a181e');R(hx+8,hy+6,12,1,'#1a181e');R(hx+10,hy+9,8,2,st.endsWith('W')||ph2?C.emberW:'#d8c8a0');
  R(hx+2,hy-6,3,6,'#cbbf9c');R(hx+1,hy-8,2,3,'#cbbf9c');R(hx+15,hy-6,3,6,'#cbbf9c');R(hx+16,hy-8,2,3,'#cbbf9c');
  if(st==='roarW'){R(hx+12,hy+14,8,4,'#0b0a0d');g.globalAlpha=.4;g.fillStyle='#ffe8b0';for(let k=0;k<3;k++){const rr=8+((game.time*50+k*10)%30);g.fillRect(X+f*(hx+22+rr)-(f<0?2:0),Y+hy+8-rr*.3|0,2,6+rr*.6|0)}g.globalAlpha=1}
  // front pauldron, arm and club
  R(12+o,-88+bob,24,18,irL);R(12+o,-88+bob,24,2,irH);R(12+o,-72+bob,24,2,irD);for(const sx2 of [18,28])R(sx2+o,-94+bob,3,6,'#9a9aa2');
  {const sx0=X+f*(22+o),ex=(sx0+GX)/2+f*4,ey=(SY+GY)/2+8;
    const L=[[GX,GY+2,GX+f*cx*0+0,GY+2]];
    for(let k=-1;k<=2;k++)line(GX,GY+k,X+f*cx,Y+cy+k,k<0?'#6a5a40':k>1?'#2e241a':'#4a3a2a');
    thick(sx0,SY+4,ex,ey,9,F(irL));thick(ex,ey,GX,GY,8,F(ir));R(gx-5+o,gy-5,11,10,irH);R(gx-5+o,gy+3,11,2,C.iron);
    const cy2=GY+4;for(let k=0;k<7;k++){g.fillStyle=k&1?'#5a5762':'#8a8590';g.fillRect(Math.round(GX+f*(k%2)),cy2+k*3,2,2)}}
  const H1x=X+f*cx,H1y=Y+cy,ang=Math.atan2(H1y-GY,H1x-GX);g.save();g.translate(H1x,H1y);g.rotate(ang);
  g.fillStyle=fl?'#f2ece0':'#5c5862';g.fillRect(-8,-13,28,26);g.fillStyle=fl?'#fff':'#7a7682';g.fillRect(-8,-13,28,3);g.fillStyle='#3e3a44';g.fillRect(-8,10,28,3);
  g.fillStyle=C.iron;g.fillRect(-9,-13,3,26);g.fillRect(17,-13,3,26);g.fillStyle='#9a9aa2';for(const yy of [-10,-2,6]){g.fillRect(20,yy,4,3);g.fillRect(4,yy===-10?-16:14,3,3)}g.restore();
  if(st==='clubW'&&e.st>.6){g.fillStyle=C.emberW;g.fillRect(Math.round(H1x),Math.round(H1y)-16,1,3)}
  if(st==='sweep'&&e.st<.28){g.globalAlpha=.35;g.fillStyle='#e8e2d4';g.fillRect(X-118,Y-10,236,3);g.globalAlpha=1}
  if(st==='sweepW'&&e.st>.3){const k=Math.floor(game.time*12)%2;g.fillStyle=k?C.ember:'#c4521f';for(let d=-118;d<118;d+=8)g.fillRect(X+d,Y-1,4,1)}
  if(st==='stunned'){for(let i=0;i<4;i++){const a3=game.time*4+i*1.6;g.fillStyle='#e8d890';g.fillRect(X+f*(16+o)+Math.round(Math.cos(a3)*14),Y-110+Math.round(Math.sin(a3)*3),2,1)}}
  if(st==='stuck'){g.fillStyle=C.emberL;g.fillRect(X+f*(gx+o)-1,Y+gy-10,2,2)}
  if(st==='chainW'||st==='chain'){const hx2=X+f*(20+o),hy2=Y-40,k=st==='chain'?Math.sin(Math.min(1,e.st/.4)*Math.PI):0,len=20+k*170;
    for(let d=0;d<len;d+=4){const yy=hy2+Math.round(Math.sin(d*.08+game.time*20)*(st==='chainW'?3:1.5))+(st==='chainW'?Math.round(d*.3):Math.round(d*.1));g.fillStyle=(d/4)&1?'#5a5762':'#9a96a2';g.fillRect(hx2+f*d-(f<0?2:0),yy,3,2)}
    if(st==='chainW'&&e.st>.3){g.fillStyle=C.emberW;g.fillRect(hx2,hy2-6,1,2)}}
  if(st==='quakeW'){const k=Math.floor(game.time*12)%2;g.fillStyle=k?C.ember:'#c4521f';for(let d=-200;d<200;d+=10)g.fillRect(X+d,Y-1,5,1)}
  if(e.phase===3&&!fl){for(let i=0;i<10;i++){const a3=game.time*3+i*.63,rx=Math.round(Math.cos(a3)*30),ry=Math.round(Math.sin(a3*1.7)*36);g.fillStyle=i&1?C.ember:C.emberL;g.fillRect(X+rx,Y-48+ry,1,2)}}}
/* ---------- volleys and rubble ---------- */
function drawShot5(s){if(s.kind!=='rain')return false;const X=sx(s.x),F=sy(s.fl);
  if(s.delay>0||s.y<s.fl-6){const k=Math.floor(game.time*10)%2,rr=s.rock?9:5;g.fillStyle=s.rock?(k?'#2a2830':'#4e4a55'):(k?C.ember:'#d0502e');
    for(let i=-rr;i<=rr;i++)g.fillRect(X+i,F-1,1,1);if(!s.rock){g.fillRect(X,F-4,1,3)}else{g.globalAlpha=.35;g.fillRect(X-rr+2,F-3,rr*2-3,2);g.globalAlpha=1}}
  if(s.delay>0)return true;const Y=sy(s.y);
  if(s.rock){g.fillStyle='#5c5862';g.fillRect(X-5,Y-10,10,10);g.fillStyle='#7a7682';g.fillRect(X-5,Y-10,10,2);g.fillStyle='#3e3a44';g.fillRect(X-5,Y-2,10,2)}
  else{g.fillStyle='#5a4430';g.fillRect(X,Y-10,1,9);g.fillStyle='#c9c6bd';g.fillRect(X-1,Y-1,3,2);g.fillRect(X,Y+1,1,1);g.fillStyle='#e8e2d4';g.fillRect(X-1,Y-11,1,2);g.fillRect(X+1,Y-11,1,2)}
  return true}

/* ---------- live objects in the world ---------- */
function drawObjects(){
  for(const o of objs){const X=sx(o.x),Y=sy(o.y);if(X<-50||X>VW+50)continue;
    if(o.kind==='shrine'){const lit=true;
      g.fillStyle='#3b3943';g.fillRect(X-18,Y-6,36,6);g.fillRect(X-13,Y-10,26,4);g.fillStyle='#4a4752';g.fillRect(X-18,Y-6,36,1);g.fillRect(X-13,Y-10,26,1);
      g.fillStyle=C.iron;g.fillRect(X-1,Y-28,3,18);for(let k=0;k<7;k++){g.fillRect(X-9+k,Y-10-k*2,1,2);g.fillRect(X+9-k,Y-10-k*2,1,2)}
      g.fillStyle=C.ironL;g.fillRect(X-11,Y-32,23,2);g.fillStyle=C.iron;g.fillRect(X-10,Y-30,21,4);g.fillStyle=C.rust;g.fillRect(X-9,Y-27,19,1);
      g.fillStyle='#5e3424';for(let k=-8;k<=8;k+=4)g.fillRect(X+k,Y-31,2,1);
      if(lit){flame(X-4,Y-33,1.5);flame(X+4,Y-33,1.4);flame(X,Y-35,1.9);if(rnd()<.5)emberP(o.x+(rnd()-.5)*12,o.y-38,6)}
      if(game.checkpoint&&Math.abs(game.checkpoint.x-o.x)<4){g.fillStyle=C.emberL;g.fillRect(X-18,Y-1,36,1)}}
    else if(o.kind==='chest'){g.fillStyle=C.woodD;g.fillRect(X-8,Y-9,16,9);g.fillStyle=C.wood;g.fillRect(X-8,Y-9,16,2);g.fillStyle=C.iron;g.fillRect(X-8,Y-6,16,1);g.fillRect(X-6,Y-9,1,9);g.fillRect(X+5,Y-9,1,9);
      if(o.open){g.fillStyle=C.woodD;g.fillRect(X-8,Y-14,16,3);g.fillStyle=C.iron;g.fillRect(X-8,Y-14,16,1);g.fillStyle=C.emberL;g.fillRect(X-6,Y-9,12,1)}
      else{g.fillStyle=C.woodL;g.fillRect(X-8,Y-12,16,3);g.fillStyle=C.iron;g.fillRect(X-8,Y-12,16,1);g.fillStyle=Math.sin(game.time*3)>.6?C.emberW:C.ember;g.fillRect(X,Y-8,1,2)}}
    else if(o.kind==='vent')drawVent(o);
    else if(o.kind==='descent'){const open=!!game.flags[o.flag];g.fillStyle='#2f2d36';g.fillRect(X-14,Y-40,28,40);g.fillStyle='#45424d';g.fillRect(X-15,Y-43,30,3);g.fillStyle='#08070a';g.fillRect(X-10,Y-35,20,35);
      for(let i=0;i<4;i++){g.fillStyle='#1d1c22';g.fillRect(X-10+i*3,Y-9+i*2,20-i*3,2)}
      if(open){g.globalAlpha=.45+Math.sin(game.time*3)*.15;g.fillStyle=o.up?'#d8cfa8':'#7a3214';g.fillRect(X-10,Y-12,20,12);g.globalAlpha=1;if(rnd()<.3)emberP(o.x+(rnd()-.5)*14,o.y-4,4)}
      else{g.fillStyle=C.iron;for(let k=-9;k<=9;k+=4)g.fillRect(X+k,Y-35,2,35);g.fillRect(X-10,Y-24,20,2);g.fillStyle=C.rust;g.fillRect(X-10,Y-23,20,1)}}
    else if(o.kind==='remnant'){const b=Math.round(Math.sin(game.time*3)*2);g.fillStyle=C.ember;g.fillRect(X-2,Y-8+b,5,5);g.fillStyle=C.emberW;g.fillRect(X-1,Y-7+b,3,3);if(rnd()<.4)emberP(o.x,o.y-6,6)}
  }
  // iron doors (tile 6)
  for(let x=Math.max(0,Math.floor(camX/T)-1);x<Math.min(MW,Math.ceil((camX+VW)/T)+1);x++)for(let y=0;y<ROWS;y++)if(grid[y*MW+x]===6){const X=sx(x*T),Y=sy(y*T);
    g.fillStyle='#2a2830';g.fillRect(X,Y,T,T);g.fillStyle=C.iron;g.fillRect(X+1,Y,T-2,T);g.fillStyle=C.ironL;g.fillRect(X+1,Y,1,T);g.fillStyle='#1d1c22';for(let k=3;k<T;k+=4)g.fillRect(X+k,Y,1,T);
    g.fillStyle=C.rust;g.fillRect(X+2,Y+T-3,T-4,1);g.fillStyle=C.ironL;g.fillRect(X+3,Y+4,1,1);g.fillRect(X+12,Y+4,1,1)}
  if(arena&&arena.locked)for(const gx of arena.gates){const x=sx(gx*T),y=sy(13*T);g.fillStyle=C.iron;for(let k=1;k<T;k+=3)g.fillRect(x+k,y,2,48);g.fillStyle=C.ironL;g.fillRect(x,y+10,T,2);g.fillRect(x,y+30,T,2);g.fillStyle=C.rust;for(let k=1;k<T;k+=3)g.fillRect(x+k,y+44,2,4)}
}
function revealFake(tx,ty){const idx=ty*MW+tx;for(const grp of fakeGroups){if(grp.revealed||!grp.tiles.includes(idx))continue;grp.revealed=true;game.flags.secrets=(game.flags.secrets||0)+1;
  for(const j of grp.tiles){const x=j%MW,y=(j/MW)|0;fakeCtx.clearRect(x*T,y*T,T,T);for(let i=0;i<5;i++)part(x*T+8,y*T+8,(rnd()-.5)*40,(rnd()-.5)*40,.8,'#4e4a55',{g:200})}
  sfx.secret();toast('A false wall crumbles. A hidden way.')}}
function drawItem(it){const X=sx(it.x),Y=sy(it.y)-4+Math.round(Math.sin(game.time*3+it.x)*1.5);
  g.fillStyle='#07060a';g.fillRect(X-6,Y-5,12,11);
  if(it.kind==='shard'){const k=Math.floor(game.time*6)%2;g.fillStyle='#2a2050';g.fillRect(X-3,Y-5,6,10);g.fillStyle='#8a6aff';g.fillRect(X-2,Y-4,4,8);g.fillStyle='#8fd0ff';g.fillRect(X-1,Y-3,2,5);g.fillStyle='#eef8ff';g.fillRect(X-1,Y-3,1,2);
    g.fillStyle='#b8a0ff';g.fillRect(X,Y-6,1,1);g.fillRect(X,Y+5,1,1);if(k){g.fillStyle='#ffffff';g.fillRect(X+3,Y-5,1,1);g.fillRect(X-4,Y+2,1,1)}}
  else if(it.kind==='souls'){g.fillStyle=C.ember;g.fillRect(X-3,Y-2,6,5);g.fillStyle=C.emberL;g.fillRect(X-2,Y-1,4,3);g.fillStyle=C.emberW;g.fillRect(X-1,Y,2,1)}
  else if(it.kind==='whetstone'){g.fillStyle='#5a5762';g.fillRect(X-5,Y-2,10,5);g.fillStyle='#86828e';g.fillRect(X-5,Y-2,10,1);g.fillStyle=C.ember;g.fillRect(X-3,Y,6,1);g.fillStyle=C.emberW;g.fillRect(X,Y,1,1)}
  else if(it.kind==='scroll'){g.fillStyle='#c9bd98';g.fillRect(X-4,Y-3,8,6);g.fillStyle='#8a7e66';g.fillRect(X-5,Y-4,2,8);g.fillRect(X+3,Y-4,2,8);g.fillStyle=C.blood;g.fillRect(X-1,Y,3,2);g.fillStyle='#6a5e4a';g.fillRect(X-2,Y-2,4,1)}
  else{g.fillStyle='#5d5a64';g.fillRect(X-1,Y-5,3,2);g.fillStyle='#1d1c22';g.fillRect(X-3,Y-3,7,8);g.fillStyle=C.ember;g.fillRect(X-2,Y-1,5,5);g.fillStyle=C.emberW;g.fillRect(X-1,Y,1,2)}
  if(rnd()<.08)emberP(it.x,it.y-8,6)}
function icon(id,x,y){ // 14x14 HUD icons
  if(id==='light'){line(x+2,y+12,x+11,y+3,'#c9c6bd');line(x+3,y+12,x+12,y+3,'#53535c');line(x+1,y+9,x+5,y+13,KN.plL);line(x+0,y+13,x+2,y+11,KN.lea);g.fillStyle='#ddd7cb';g.fillRect(x+10,y+1,3,1);g.fillRect(x+12,y+2,1,3)}
  else if(id==='heavy'){line(x+7,y+13,x+7,y+1,'#c9c6bd');line(x+8,y+13,x+8,y+1,'#53535c');line(x+4,y+10,x+11,y+10,KN.plL);line(x+7,y+11,x+7,y+13,KN.lea);g.fillStyle=C.ember;g.fillRect(x+2,y+12,2,1);g.fillRect(x+11,y+12,2,1);g.fillRect(x+6,y,4,1);g.fillStyle=C.emberL;g.fillRect(x+3,y+13,8,1)}
  else if(id==='bomb'){g.fillStyle='#5a3a2a';g.fillRect(x+4,y+5,7,7);g.fillStyle=C.ironL;g.fillRect(x+6,y+3,3,2);g.fillStyle=C.ember;g.fillRect(x+5,y+7,5,3);g.fillStyle=C.emberL;g.fillRect(x+6,y+8,2,1)}
}
/* =========================================================
   RENDER
   ========================================================= */
function lighting(){
  const W=lightC.width,H=lightC.height;
  lx.globalCompositeOperation='source-over';lx.clearRect(0,0,W,H);
    for(let i=0;i<W;i++){const col=clamp(Math.floor((camX+i*LS+LS/2)/T),0,MW-1);const a=darkCol[col];lx.fillStyle=`rgba(7,6,11,${a})`;const y0=game.level>=3&&a>.3&&backTop[col]>=0?Math.max(0,Math.floor((backTop[col]*T-camY)/LS)):0;lx.fillRect(i,y0,1,H-y0)}
  lx.globalCompositeOperation='destination-out';
  const L=[];const add=(x,y,r,a=1)=>{const X=(x-camX)/LS,Y=(y-camY)/LS,rr=r/LS;if(X<-rr||X>W+rr||Y<-rr||Y>H+rr)return;L.push([X,Y,rr,a])};
  for(const l of staticLights)add(l.x,l.y,l.r*(l.warm?1+Math.sin(game.time*9+l.ph)*.04+(rnd()-.5)*.05:1),l.warm?1:.7);
  if(P)add(P.x,P.y-16,68);
  for(const e of foes)if(e.t==='archer'&&!e.gone&&e.state!=='dead')add(e.x,e.y-20,e.state==='aim'?34:24,.55);
  for(const e of foes){if(e.gone||e.state==='dead')continue;if(e.t==='king')add(e.x,e.y-34,e.phase===2?80:52);if(e.t==='hollow'&&(e.state==='windup'||e.state==='alert'))add(e.x,e.y-20,22,.5);if(e.t==='warden'&&e.state==='windup')add(e.x,e.y-34,30,.6)}
  for(const s of shots)if(s.kind==='cinder')add(s.x,s.delay>0?s.floor:s.y,s.delay>0?26:44,.8);
  for(const s of shots){if(s.kind==='pillar'||s.kind==='hand')add(s.x,s.floor-(s.delay>0?4:24),s.delay>0?26:s.kind==='pillar'?64:30,.85);if(s.kind==='feather')add(s.x,s.y,18,.6)}
  for(const e of foes){if(e.gone||e.state==='dead')continue;
    if(e.t==='priest')add(e.x+e.face*8,e.y-14,e.state==='cast'||e.state==='burstW'?46:28,.7*(e.alpha??1));
    if(e.t==='wraith')add(e.x,e.y-10,e.state==='markW'||e.state==='dive'?40:26,.6);
    if(e.t==='hound'&&(e.state==='crouch'||e.state==='alert'))add(e.x,e.y-8,24,.5);
    if(e.t==='matron')add(e.x,e.y-46,e.phase===2?72:56,.85*(e.alpha??1));
    if(e.t==='seraph')add(e.x,e.y-34,e.phase===2?92:66);
    if(e.t==='golem')add(e.x,e.y-20,e.state==='vent'?60:30,.7);
    if(e.t==='imp')add(e.x,e.y-10,e.state==='throwW'?34:22,.6);
    if(e.t==='reaver'&&e.state.endsWith('W'))add(e.x,e.y-22,26,.5);
    if(e.t==='forgemaster')add(e.x,e.y-40,e.phase===2?80:56,.8);
    if(e.t==='queen')add(e.x,e.y-26,e.phase===2?76:52,.85);
    if(e.t==='drake')add(e.x,e.y-26,70,.7);if(e.t==='bellwarden'&&e.state!=='dead')add(e.x,e.y-(e.phase===2?40:62),e.phase===2?95+Math.sin(game.time*17)*8:e.state==='ringW'?60:24,e.phase===2?.85:e.state==='ringW'?.8:.4)}
  for(const s of shots){if(s.kind==='shell')add(s.tx,s.ty-4,30,.6);if(s.kind==='pwave')add(s.x,s.y,40,.8);if(s.kind==='sbell')add(s.x,s.y,30,.55);if(s.kind==='arcane')add(s.x,s.y,s.big?34:24,.7);if(s.kind==='arcaneH')add(s.x,s.y,40+30*s.ch,.9);if(s.kind==='hbring')add(s.x,s.y,70,.8);if(s.kind==='judg'&&!(s.delay>0))add(s.x,s.y-40,70,.9);if(s.kind==='lightcol')add(s.x,s.y-30,70,.8)}
  for(const s of shots){if(s.kind==='puddle')add(s.x,s.y-4,34,.7*Math.min(1,s.life));if(s.kind==='firebomb'||s.kind==='ingot')add(s.x,s.y,26,.7)}
  for(const o of objs)if(o.kind==='remnant')add(o.x,o.y-6,30,.8);
  for(const s of shots){if(s.kind==='bolt'||s.kind==='bomb')add(s.x,s.y,40);if(s.kind==='wave')add(s.x,s.y-6,44)}
  for(const l of tempLights)add(l.x,l.y,l.r*(l.life/l.max));
  for(const it of items)add(it.x,it.y-6,26,.6);
  for(const o of objs)if(o.kind==='chest'&&!o.open)add(o.x,o.y-6,22,.5);
  for(const [X,Y,r,a] of L){const gr=lx.createRadialGradient(X,Y,0,X,Y,r);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(.32,`rgba(0,0,0,${.92*a})`);gr.addColorStop(.33,`rgba(0,0,0,${.62*a})`);gr.addColorStop(.62,`rgba(0,0,0,${.5*a})`);gr.addColorStop(.63,`rgba(0,0,0,${.22*a})`);gr.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=gr;lx.beginPath();lx.arc(X,Y,r,0,7);lx.fill()}
  g.drawImage(lightC,0,0,W*LS,H*LS);
  // warm bloom
  g.globalCompositeOperation='lighter';
  const dayK=game.level>=3?.35:1;const glow=(x,y,r,a)=>{a*=dayK;const X=x-camX,Y=y-camY;if(X<-r||X>VW+r||Y<-r||Y>VH+r)return;const gr=g.createRadialGradient(X,Y,0,X,Y,r);gr.addColorStop(0,`rgba(255,120,40,${a})`);gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.fillRect(X-r,Y-r,r*2,r*2)};
  for(const l of staticLights)if(l.warm)glow(l.x,l.y,l.r*.55,.13+Math.sin(game.time*9+l.ph)*.02);
  for(const l of tempLights)glow(l.x,l.y,l.r*.7,.4*l.life/l.max);
  for(const s of shots)if(s.kind==='bolt'||s.kind==='wave'||s.kind==='bomb')glow(s.x,s.y-4,24,.25);
  for(const e of foes)if((e.t==='king'||e.t==='seraph')&&!e.gone&&e.state!=='dead')glow(e.x,e.y-30,30,e.phase===2?.22:.12);
  for(const s of shots)if(s.kind==='pillar'&&!(s.delay>0))glow(s.x,s.floor-20,30,.3);
  g.fillStyle='rgba(255,140,50,.22)';for(const q of parts)if(q.glow){const X=Math.round(q.x-camX),Y=Math.round(q.y-camY);g.fillRect(X-1,Y,3,1);g.fillRect(X,Y-1,1,3)}
  g.globalCompositeOperation='source-over';
}
function render(){const ocx=camX,ocy=camY;camX=Math.round(camX);camY=Math.round(camY);try{render0()}finally{camX=ocx;camY=ocy}}
function render0(){
  const t=game.time;
  const day=game.level>=3&&MW>0;let fo=0;
  if(day)drawDayBackdrop(t);else g.drawImage(sky,0,-Math.round(camY*.05));
  if(MW){
    if(!day){g.drawImage(farL,-Math.round((camX*.08)%(farL.width-VW)),-Math.round(camY*.12));
    fo=-((camX*.15+t*3)%fogC.width);g.globalAlpha=.8;g.drawImage(fogC,Math.round(fo),120-Math.round(camY*.15));g.drawImage(fogC,Math.round(fo+fogC.width),120-Math.round(camY*.15));g.globalAlpha=1;
    g.drawImage(midL,-Math.round((camX*.2)%(midL.width-VW)),-Math.round(camY*.2));
    g.drawImage(nearL,-Math.round((camX*.4)%(nearL.width-VW)),-Math.round(camY*.35)+6);}
    const shx=shake?Math.round((rnd()-.5)*shake*2):0,shy=shake?Math.round((rnd()-.5)*shake*2):0;
    g.save();g.translate(shx,shy);
    const cx=Math.round(camX),cy=Math.round(camY);
    g.drawImage(levelBack,cx,cy,VW,VH,0,0,VW,VH);
    drawLiveDecor();drawLiveDecor2();drawLiveDecor3();drawLiveDecor4();
    g.drawImage(levelFront,cx,cy,VW,VH,0,0,VW,VH);
    drawObjects();
    for(const it of items)drawItem(it);
    {for(const e of foes)if(e.state==='dead')drawFoe(e);for(const e of foes)if(e.state!=='dead')drawFoe(e)}
    if(P)drawPlayer();
    for(const s of shots){if(drawShot2(s))continue;const X=sx(s.x),Y=sy(s.y);
      if(s.kind==='arrow'||s.kind==='earrow'){const a=Math.atan2(s.vy,s.vx);line(X,Y,X-Math.cos(a)*7,Y-Math.sin(a)*7,s.kind==='arrow'?C.woodL:'#6a5a48');g.fillStyle=s.kind==='earrow'?C.bloodL:'#c9c2b0';g.fillRect(X,Y,1,1)}
      else if(s.kind==='bolt'){line(X,Y,X-Math.sign(s.vx)*9,Y,C.emberL);g.fillStyle=C.emberW;g.fillRect(X,Y-1,2,2)}
      else if(s.kind==='bomb'){g.fillStyle='#5a3a2a';g.fillRect(X-2,Y-2,5,5);g.fillStyle=C.ember;g.fillRect(X-1,Y-1,3,2);if(rnd()<.5)emberP(s.x,s.y-3,2)}
      else if(s.kind==='cinder'){if(s.delay>0){const fy=sy(s.floor),k=Math.floor(game.time*12)%2;g.fillStyle=k?C.ember:'#c4521f';g.fillRect(X-6,fy-1,13,1);g.fillRect(X-4,fy-2,9,1);g.globalAlpha=.18;g.fillStyle=C.ember;g.fillRect(X-1,sy(s.y),3,fy-sy(s.y));g.globalAlpha=1}
        else{g.fillStyle=C.ember;g.fillRect(X-3,Y-7,7,7);g.fillStyle=C.emberL;g.fillRect(X-2,Y-6,5,5);g.fillStyle=C.emberW;g.fillRect(X-1,Y-3,3,2);g.fillStyle='rgba(255,140,46,.35)';g.fillRect(X-2,Y-16,5,9)}}
      else if(s.kind==='wave'){for(let i=0;i<10;i++){const h=(rnd()*12)|0;g.fillStyle=h>8?C.emberW:h>4?C.emberL:C.ember;g.fillRect(X+Math.round((rnd()-.5)*8),Y-h,1,1)}g.fillStyle=C.ember;g.fillRect(X-4,Y-2,9,2)}}
    for(const q of parts){const a=q.home?1:clamp(q.life/q.max*1.6,0,1);g.globalAlpha=a;g.fillStyle=q.c;g.fillRect(Math.round(q.x-camX),Math.round(q.y-camY),q.s,q.s)}g.globalAlpha=1;
    g.drawImage(levelFake,cx,cy,VW,VH,0,0,VW,VH);
    g.restore();
    if(!day){fo=-((camX*1.15+t*10)%fogC.width);g.globalAlpha=.55;g.drawImage(fogC,Math.round(fo),170-Math.round(camY*.9));g.drawImage(fogC,Math.round(fo+fogC.width),170-Math.round(camY*.9));g.globalAlpha=1}
    lighting();
  }
  g.drawImage(game.level>=3&&MW?dayLayers().vig:vig,0,0);
  present();
}
function nearestPrompt(){const p=P;if(!p||game.state!=='play')return null;let b=null,bd=1e9;
  const put=(o,d,t,s,yo,key=true)=>{if(d<bd){bd=d;b={x:o.x,y:o.y-yo,t,s,key}}};
  const NAMES={scroll:['Scroll of Ash','+15% damage, +15 health'],vial:['Ember Vial','+1 healing flask'],souls:['Soul cache',''],whetstone:['Ashen Whetstone','Crumbles into 400 souls'],shard:['Weapon Shard','Tempers your weapon at a shrine']};
  for(const it of items){const d=Math.abs(it.x-p.x);if(d<16&&Math.abs(it.y-p.y)<24){const N=NAMES[it.kind];put(it,d,N[0],it.kind==='souls'?`${it.v} souls`:N[1],16)}}
  for(const o of objs){const d=Math.abs(o.x-p.x);if(Math.abs(o.y-p.y)>24)continue;
    if(o.kind==='chest'&&!o.open&&d<16)put(o,d,'Open chest','',16);
    else if(o.kind==='descent'&&game.flags[o.flag]&&d<18)put(o,d,o.up?'Climb':'Descend',['','Into the depths below Cinderkeep','Down into the Hollow Forge','Up onto the castle walls','Down to the outer ramparts'][o.to],50);
    else if(o.kind==='shrine'&&d<22)put(o,d,'Rest at the '+(o.label||'Ashen Shrine'),'Heal, refill flasks, upgrade and save',54);
    else if(o.kind==='lockedDoor'&&!game.flags.doorOpen&&d<18)put(o,d,'Barred door','Locked from the other side',40);
    else if(o.kind==='bar'&&!game.flags.doorOpen&&d<18)put(o,d,'Lift the bar','Opens a shortcut to the courtyard',40);
    else if(o.kind==='note'&&d<22)put(o,d,o.label,o.sub,18,false)}
  return b}
function present(){
  const W=disp.width,H=disp.height,s=W/VW;dctx.imageSmoothingEnabled=false;dctx.drawImage(buf,0,0,W,H);
  const D=(txt,x,y,size,col,font=FONT_D,align='center',a=1,weight='')=>{dctx.globalAlpha=a;dctx.font=`${weight} ${Math.round(size*s)}px ${font}`;dctx.textAlign=align;dctx.textBaseline='middle';dctx.fillStyle='rgba(6,5,9,.9)';dctx.fillText(txt,x*s+Math.max(1,s*.6),y*s+Math.max(1,s*.6));dctx.fillStyle=col;dctx.fillText(txt,x*s,y*s);dctx.globalAlpha=1};
  const coarse=matchMedia('(pointer:coarse)').matches;
  if(game.state==='title'){dctx.fillStyle='rgba(8,7,12,.2)';dctx.fillRect(0,0,W,H);return}
  if(!P)return;
  for(const n of nums){const a=clamp(n.t*2,0,1);D(String(n.v),n.x-camX,n.y-camY,n.crit?9:7,n.c,FONT_B,'center',a,'700')}
  const pr=nearestPrompt();if(pr){D((pr.key?'E  ':'')+pr.t,pr.x-camX,pr.y-camY,8,C.emberL,FONT_B,'center',1,'700');if(pr.s)D(pr.s,pr.x-camX,pr.y-camY+9,6,'#b7b1ba',FONT_B,'center',1,'italic')}
  if(game.banner>0&&game.state==='play'){const a=clamp(Math.min(game.banner,3.4-game.banner)*2,0,1);if(game.bTitle)D(game.bTitle,VW/2,58,24,'#e6dfd2',FONT_D,'center',a,'700');if(game.bSub)D(game.bSub,VW/2,game.bTitle?80:58,8,'#b7b1ba',FONT_B,'center',a,'italic')}
  if(game.toast>0)D(game.toastText,VW/2,VH-44,7.5,'#d8d0c4',FONT_B,'center',clamp(game.toast*2,0,1),'italic');
  if((game.state==='dead'||game.state==='won')&&game.deadT>.8){const a=clamp((game.deadT-.8)*1.5,0,1);dctx.globalAlpha=a*.7;dctx.fillStyle='#07060a';dctx.fillRect(0,0,W,H);dctx.globalAlpha=1;
    const won=game.state==='won',m=Math.floor(game.runTime/60),sec=String(Math.floor(game.runTime%60)).padStart(2,'0');
    D(won?'Cinderkeep Is Free':'Your Ember Gutters Out',VW/2,72,26,won?C.emberL:'#c4483c',FONT_D,'center',a,'700');
    D(won?'The Colossus falls and the great gate opens. Cinderkeep is free.':'Your souls stay where you fell. Reclaim them before you fall again.',VW/2,96,8,'#b7b1ba',FONT_B,'center',a,'italic');
    D(won?`${game.kills} foes slain  ·  ${game.embers} souls  ·  ${game.flags.secrets||0} secrets  ·  ${m}:${sec}`:`${game.kills} foes slain  ·  ${m}:${sec}`,VW/2,112,8,'#d8d0c4',FONT_B,'center',a,'700');
    if(game.deadT>1.6)D(won?(coarse?'Tap to return to the title':'Press Enter to return to the title'):(coarse?'Tap to rise again':(game.checkpoint?'Press Enter to rise at the shrine':'Press Enter to rise at '+SECTIONS[0].name)),VW/2,134,11,C.emberL,FONT_D,'center',a)}
  if(game.fade>0){dctx.globalAlpha=game.fade;dctx.fillStyle='#07060a';dctx.fillRect(0,0,W,H);dctx.globalAlpha=1}
}

/* =========================================================
   INTERFACE: HTML overlay for the HUD and menus (crisp text, real buttons)
   ========================================================= */
const $=id=>document.getElementById(id);
const UIC={};
const UPG={
  sword:{key:'swordLv',name:'Temper your weapon',desc:'+12% damage per temper · bosses drop the shards',costs:[1,1,1,1,1,1,1,1,1],shard:1},
  flask:{key:'flaskLv',name:'Deepen the flasks',desc:'Each flask restores 10% more health',costs:[100,170,250,340,440]},
  edge:{key:'edgeLv',name:'Kindle the edge',desc:'Heavy attacks loose a running wave of flame',costs:[300,520,800]},
  armor:{key:'armorLv',name:'Harden the plate',desc:'Take 6% less damage per rank',costs:[200,320,460,620,800]},
  satchel:{key:'satchelLv',name:'Widen the satchel',desc:'Carry one more ember bomb and warding ash',costs:[150,260,380]},
  vigor:{key:'vigorLv',name:'Fortify the heart',desc:'+15 maximum health',costs:[260,400,560,740,940]},
  sunder:{key:'sunderLv',name:'Learn to sunder',desc:'+15% damage to armored foes; light blows can crack a brute\'s plate',costs:[350,600,900]},
  drink:{key:'drinkLv',name:'Drink of the fallen',desc:'Each kill restores a little health',costs:[300,550,850]},
  sta:{key:'staLv',name:'Harden the will',desc:'+15 stamina for swings and dodges',costs:[70,120,180,250,330]}
};
function pixIcon(draw){const [c,x]=mk(16,16);draw((px,py,w,h,col)=>{x.fillStyle=col;x.fillRect(px,py,w,h)});return c.toDataURL()}
const ICONS={
  sword:pixIcon(R=>{for(let i=0;i<10;i++){R(4+i,11-i,1,1,'#cfccc2');R(5+i,11-i,1,1,'#8c8c94');R(5+i,12-i,1,1,'#53535c')}R(2,10,2,1,'#5a5e68');R(4,12,1,2,'#5a5e68');R(3,11,1,1,'#5a5e68');R(1,13,2,2,'#3a2a20');R(0,15,1,1,'#53535c');R(9,7,1,1,'#0f0f13');R(12,4,1,1,'#0f0f13')}),
  flask:pixIcon(R=>{R(6,1,4,1,'#8a8378');R(7,2,2,3,'#5d5a64');R(4,5,8,9,'#1d1c22');R(3,6,10,7,'#1d1c22');R(5,7,6,6,'#8c2228');R(4,8,8,4,'#8c2228');R(5,7,2,3,'#d0503e');R(5,13,6,1,'#5c141a')}),
  bomb:pixIcon(R=>{R(7,1,2,2,'#5d5a64');R(8,0,2,1,'#ff8c2e');R(4,4,8,9,'#4a3024');R(3,6,10,6,'#4a3024');R(5,6,6,5,'#ff8c2e');R(6,7,3,2,'#ffc368');R(4,12,8,1,'#2a1e18');R(3,8,1,2,'#5d5a64');R(12,8,1,2,'#5d5a64')}),
  ward:pixIcon(R=>{R(5,2,6,2,'#6e3f28');R(4,4,8,1,'#3a2a20');R(3,5,10,8,'#5a4a3e');R(4,13,8,1,'#3e3428');R(5,6,6,6,'#7a6a5a');R(6,7,4,3,'#b4ab94');R(7,8,2,1,'#dcd6c8');R(2,3,1,1,'#b4ab94');R(13,2,1,1,'#b4ab94');R(12,0,1,1,'#857c69')}),
  shard:pixIcon(R=>{R(7,0,2,1,'#b8a0ff');R(6,1,4,3,'#8a6aff');R(5,4,6,7,'#8a6aff');R(6,11,4,3,'#6a4ae0');R(7,14,2,1,'#4a2ab0');R(7,2,2,9,'#8fd0ff');R(7,3,1,4,'#eef8ff');R(5,5,1,5,'#b8a0ff');R(10,6,1,4,'#4a2ab0')}),
  soul:pixIcon(R=>{R(7,1,2,2,'#ffc368');R(6,3,4,3,'#ff8c2e');R(5,5,6,5,'#ff8c2e');R(4,7,8,4,'#c4521f');R(6,6,4,4,'#ffc368');R(7,7,2,2,'#fff0b8');R(5,11,6,2,'#c4521f');R(6,13,4,1,'#7a3418')})
};
function pixCursor(draw,hx,hy,fallback){const [c,x]=mk(32,32);draw((px,py,w,h,col)=>{x.fillStyle=col;x.fillRect(px*2,py*2,w*2,h*2)});return`url(${c.toDataURL()}) ${hx} ${hy}, ${fallback}`}
const CURSOR={
  aim:pixCursor(R=>{const k='#08070a',m='#9a94a2',h='#cfc9bd';
    for(const [sx,sy] of [[1,1],[14,1],[1,14],[14,14]]){const dx=sx<8?1:-1,dy=sy<8?1:-1;R(sx-(dx<0?0:0),sy,1,1,k);
      for(let i=0;i<4;i++){R(sx+dx*i,sy,1,1,i?m:h);R(sx,sy+dy*i,1,1,i?m:h);R(sx+dx*i,sy+dy,1,1,k);R(sx+dx,sy+dy*i,1,1,k)}}
    R(7,5,2,6,k);R(5,7,6,2,k);R(7,6,2,4,'#c4521f');R(6,7,4,2,'#c4521f');R(7,7,2,2,'#ff8c2e');R(7,7,1,1,'#fff0b8')},15,15,'crosshair'),
  point:pixCursor(R=>{const k='#08070a';
    for(let i=0;i<10;i++)R(i,i,3,3,k);R(6,9,6,3,k);R(9,6,3,6,k);R(11,11,4,4,k);R(13,13,3,3,k);
    for(let i=0;i<8;i++){R(i+1,i+1,1,1,i<2?'#fff0b8':'#cfc9bd');R(i+2,i+1,1,1,'#8c8c94')}
    R(7,10,4,1,'#868c98');R(10,7,1,4,'#868c98');R(12,12,2,2,'#3a2a20');R(14,14,1,1,'#ff8c2e')},1,1,'default')
};
function initUI(){
  document.documentElement.style.setProperty('--cur-point',CURSOR.point);
  for(const [id,ic] of [['icoSword','sword'],['icoFlask','flask'],['icoFlaskS','flask'],['icoBomb','bomb'],['icoWard','ward'],['icoSoul','soul'],['icoShard','shard']])$(id).src=ICONS[ic];
  const [c,x]=mk(64,64),r=rng32(99);x.fillStyle='#17151a';x.fillRect(0,0,64,64);
  for(let i=0;i<300;i++){x.fillStyle=['#1b191f','#141217','#1e1b22','#121015'][r()*4|0];x.fillRect(r()*64|0,r()*64|0,1+r()*4|0,1+r()*2|0)}
  x.fillStyle='#0f0e12';for(let y=0;y<64;y+=16){x.fillRect(0,y,64,1);for(let k=(y/16%2)*16+8;k<64;k+=32)x.fillRect(k,y,1,16)}
  x.fillStyle='#211e25';for(let y=1;y<64;y+=16)x.fillRect(0,y,64,1);
  document.documentElement.style.setProperty('--stone-tex',`url(${c.toDataURL()})`);
  $('panel').addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.set;if(!k)return;audioInit();SET[k]=e.target.value/100;applyVolumes();saveSettings();const o=$('out_'+k);if(o)o.textContent=e.target.value+'%'});
  $('panel').addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.set==='sfx'){sfxPreview(()=>sfx.clang())}});
  $('panel').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;audioInit();const a=b.dataset.act;(ACT[a]||(()=>{}))(b)});
  $('menu').addEventListener('pointerdown',e=>e.stopPropagation());
}
function setTxt(id,v){v=String(v);if(UIC[id]!==v){UIC[id]=v;$(id).textContent=v}}
function setVar(id,k,v){const key=id+k;if(UIC[key]!==v){UIC[key]=v;$(id).style.setProperty(k,v)}}
function setHid(id,h){const key=id+'#h';if(UIC[key]!==h){UIC[key]=h;$(id).hidden=h}}
function setCls(id,c,on){const key=id+'.'+c;if(UIC[key]!==on){UIC[key]=on;$(id).classList.toggle(c,on)}}
const pct=v=>(clamp(v,0,1)*100).toFixed(1)+'%';
function updateUI(){
  const cur=game.state==='play'?'aim':'point';if(UIC.cursor!==cur){UIC.cursor=cur;stage.style.cursor=CURSOR[cur]}
  const show=game.state!=='title'&&!!P&&MW>0;
  for(const id of ['hudTL','hudBL','hudTR'])setHid(id,!show);
  if(!show){setHid('bossUI',true);return}
  const p=P;
  setVar('hpBar','--w',Math.min(40,17*p.maxHp/100).toFixed(2)+'em');setVar('hpFill','width',pct(p.hp/p.maxHp));setVar('hpTrail','width',pct(p.trail/p.maxHp));
  setVar('stBar','--w',Math.min(30,12*p.maxSta/100).toFixed(2)+'em');setVar('stFill','width',pct(p.sta/p.maxSta));setCls('stBar','flash',p.staFlash>0);
  setTxt('flaskN',`${p.flasks}/${p.maxFlasks}`);setTxt('soulN',game.embers);setTxt('shardN',p.shards||0);
  setTxt('swordLv',p.swordLv?'+'+p.swordLv:'');setTxt('flaskN2',p.flasks);setTxt('bombN',p.bombs);setTxt('wardN',p.wards);
  setCls('slotFlask','empty',p.flasks<=0);setCls('slotBomb','empty',p.bombs<=0);setCls('slotWard','empty',p.wards<=0&&p.wardT<=0);setCls('slotWard','active',p.wardT>0);
  if(UIC.abCls!==p.cls){UIC.abCls=p.cls;$('abK4').innerHTML=abKeyHtml(p.cls,3);$('abK4').classList.toggle('mouse',p.cls==='sage');$('icoSword').src=WICON[p.cls]||ICONS.sword;$('icoSword').alt=CLASSES[p.cls].weapon;$('icoSword').parentNode.title=CLASSES[p.cls].weapon;ABIL[p.cls].forEach((a,i)=>{$('abI'+(i+1)).src=ABICONS[a.icon];$('abS'+(i+1)).title=a.name+' ('+(abKey(p.cls,i)==='Click'?'left click':abKey(p.cls,i))+')'})}
  for(let i=0;i<4;i++){const cd=p.abCd[i];setVar('abC'+(i+1),'height',cd>0?pct(cd/(p.abMax[i]||1)):'0%');setCls('abS'+(i+1),'ready',cd<=0);setCls('abS'+(i+1),'flash',p.abFlash[i]>0);setTxt('abR'+(i+1),['','','II','III','IV'][p['ab'+(i+1)]]||'')}
  setVar('bombCd','height',pct(p.skillCd/.6));setVar('wardCd','height',p.wardT>0?pct(1-p.wardT/8):'0%');
  setTxt('lvName',SECTIONS[sectionAt(P.x)].name);
  const b=boss&&arena&&arena.locked&&boss.state!=='dead'&&boss.active;setHid('bossUI',!b);
  if(b){setTxt('bossName',arena.name);boss.trail=boss.trail??boss.hp;boss.trail+=(boss.hp-boss.trail)*.04;setVar('bossFill','width',pct(boss.hp/boss.max));setVar('bossTrail','width',pct(boss.trail/boss.max));setCls('ph1','on',true);setCls('ph2','on',boss.phase>=2);setCls('bossUI','enraged',boss.phase>=2)}
}
/* ---------- menus ---------- */
const MENU={view:null,stack:[]};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function opt(act,label,sub,right=''){return`<button class="opt" type="button" data-act="${act}"><span class="lab">${esc(label)}</span><em>${esc(right)}</em><small>${esc(sub)}</small></button>`}
function openMenu(v){game.state='menu';for(const k in keys)keys[k]=false;MENU.stack=[];showView(v);$('menu').hidden=false;sfx.ui&&sfx.ui()}
function closeMenu(){$('menu').hidden=true;MENU.view=null;if(game.state==='menu')game.state='play';stage.focus({preventScroll:true})}
function showView(v,push,keepFocus){if(push&&MENU.view)MENU.stack.push(MENU.view);MENU.view=v;$('menu').classList.toggle('titleMode',v==='titleMenu');$('panel').innerHTML=VIEWS[v]();
  const b=(keepFocus&&$('panel').querySelector(`[data-act="${keepFocus}"]`))||$('panel').querySelector('.opt');if(b)b.focus({preventScroll:true})}
function back(){if(MENU.stack.length)showView(MENU.stack.pop());else if(game.state!=='title')closeMenu()}
function msg(t){const m=$('menuMsg');if(m)m.textContent=t}
function upgCost(k){const u=UPG[k],lv=P[u.key];return lv>=u.costs.length?null:u.costs[lv]}
const VIEWS={
  titleMenu:()=>{const pl=SAVE&&SAVE.player||{},cls=CLASSES[pl.cls]||CLASSES.knight,f=(SAVE&&SAVE.flags)||{},bf=['kingDead','matronDead','seraphDead','forgeDead','queenDead','bellDead','drakeDead','marshalDead','colossusDead'],bd=bf.filter(k=>f[k]).length;
    const lv=SAVE?(SAVE.level||0):0,t=Math.floor((SAVE&&SAVE.time)||0),time=`${Math.floor(t/3600)?Math.floor(t/3600)+'h ':''}${Math.floor(t/60)%60}m`;
    const card=SAVE?`<div class="savecard"><img class="por" src="${classPortrait(pl.cls&&CLASSES[pl.cls]?pl.cls:'knight')}" alt=""><div class="sci"><b>${esc(cls.name)}</b><small>Level ${lv+1}: ${esc(['Cinderkeep','The Depths','The Hollow Forge','The Castle Walls','The Outer Ramparts'][lv])} · ${time}</small>
      <div class="scs"><span><img src="${ICONS.soul}" alt="">${SAVE.souls||0}</span><span><img src="${ICONS.shard}" alt="">${pl.shards||0}</span><span>${bd}/9 bosses</span></div>
      <div class="pips9">${bf.map(k=>`<i class="${f[k]?'on':''}"></i>`).join('')}</div></div></div>`:'';
    return`<h2 id="menuTitle" class="big logo">Cinder<span>keep</span></h2><p class="sub tag">Four paths. One kingdom. The Ashen King waits on his throne of cinders.</p>${card}<div class="opts">
    ${SAVE?opt('continue','Continue',['Wake at the Ashen Shrine','Wake in the depths below the keep','Wake in the Hollow Forge','Wake on the castle walls','Wake on the outer ramparts'][lv]):''}
    ${SAVE&&f.drakeDead?opt('replay5','Replay Level 5','The Outer Ramparts again, both bosses back'):''}
    ${opt('newGame','New game',SAVE?'Choose your path. Your save is replaced when you next rest.':'Choose your path and begin at the Forgotten Gate')}
    ${opt('settings','Settings','Master volume, music and sound effects')}
    ${opt('controls','Controls','Keys, mouse and touch')}</div><p class="foot">Arrow keys or mouse · Enter to choose</p>`},
  pause:()=>`<h2 id="menuTitle">Paused</h2><p class="sub">${esc(SECTIONS[sectionAt(P.x)].name)}</p><div class="opts">
    ${opt('resume','Resume','Back to the climb')}${opt('sheet','Character and weapon','Your stats, weapon, abilities and gear (Tab)')}${opt('settings','Settings','Volume')}${opt('controls','Controls','Keys and touch buttons')}
    ${opt('restart',game.checkpoint?'Restart from checkpoint':'Restart from the gate',game.checkpoint?'Reload from your last rest at the shrine':'You have not rested here yet. Return to '+SECTIONS[0].name)}
    ${opt('title','Return to title screen','Leave the keep for now')}</div><p class="msg" id="menuMsg" aria-live="polite"></p>`,
  equip:()=>{const p=P,dm=k=>Math.round(k*p.power*(1+.12*p.swordLv));return`<h2 id="menuTitle">Equipment</h2><p class="sub">What the Ashen Knight carries</p>
    <dl class="kv">
      <div><dt><img src="${ICONS.sword}" alt="">Greatsword ${p.swordLv?'+'+p.swordLv:''}</dt><dd>Light ${dm(SWORD.light[0].dmg)} · Heavy ${dm(SWORD.heavy.dmg)}</dd></div>
      <div><dt><img src="${ICONS.flask}" alt="">Healing flasks</dt><dd>${p.flasks}/${p.maxFlasks} · heal ${Math.round((.5+.1*p.flaskLv)*100)}%</dd></div>
      <div><dt><img src="${ICONS.bomb}" alt="">Ember bombs</dt><dd>${p.bombs}/${p.maxBombs}</dd></div>
      <div><dt><img src="${ICONS.ward}" alt="">Warding ash</dt><dd>${p.wards}/${p.maxWards} · halves damage for 8s</dd></div>
      <div><dt>Scrolls of Ash</dt><dd>${p.scrolls} · +${Math.round((p.power-1)*100)}% damage</dd></div>
      <div><dt>Health · Stamina</dt><dd>${p.maxHp} · ${p.maxSta}</dd></div>
      <div><dt>Ember edge · Plate</dt><dd>${p.edgeLv?'rank '+p.edgeLv+' flame wave':'none'} · ${6*p.armorLv}% less damage</dd></div>
      <div><dt>Sunder · Drink</dt><dd>${p.sunderLv?'+'+15*p.sunderLv+'% vs armor':'none'} · ${p.drinkLv?'+'+(3+3*p.drinkLv)+' health per kill':'none'}</dd></div>
      <div><dt><img src="${ICONS.soul}" alt="">Souls</dt><dd>${game.embers}</dd></div>
    </dl><div class="opts">${opt('back','Back','')}</div>`},
  sheet:()=>{const p=P,mul=p.power*(1+.12*p.swordLv),dm=k=>p.cls==='sage'?k:Math.round(k*mul),L=SWORD.light,maxLv=UPG.sword.costs.length,c=upgCost('sword');
    const t=Math.floor(game.runTime||0),time=`${Math.floor(t/3600)?Math.floor(t/3600)+'h ':''}${Math.floor(t/60)%60}m ${String(t%60).padStart(2,'0')}s`;
    const lvName=['Cinderkeep','The Depths','The Hollow Forge','The Castle Walls','The Outer Ramparts'][game.level]||'';
    const pips=(n,m)=>`<span class="pips" aria-label="${n} of ${m}">${Array.from({length:m},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>`;
    const blade=p.cls==='sage'?(p.swordLv>=4?'The orb hums with stored light':'An old staff with a cold blue orb'):p.cls==='rogue'?'Two short knives, kept sharp':p.cls==='sentinel'?'A long war spear and a painted tower shield':p.swordLv>=8?'The blade burns along its whole length':p.swordLv>=4?'Embers glow in the steel':'Plain, battered steel';
    const CC=CLASSES[p.cls];return`<h2 id="menuTitle">${p.cls==='knight'?'The Ashen Knight':'The '+CC.name}</h2><p class="sub">Level ${game.level+1}: ${esc(lvName)} · ${esc(SECTIONS[sectionAt(p.x)].name)}</p>
    <div class="sheet"><section><h3>${CC.name}</h3><dl class="kv">
      <div><dt>Health</dt><dd>${Math.ceil(p.hp)} / ${p.maxHp}</dd></div>
      <div><dt>Stamina</dt><dd>${Math.round(p.maxSta)}</dd></div>
      <div><dt>Damage taken</dt><dd>${(()=>{const v=Math.round((1-(p.def||1)*(1-.06*p.armorLv))*100);return v?'−'+v+'%':'normal'})()}${p.wardT>0?' · warded':''}</dd></div>
      <div><dt><img src="${ICONS.flask}" alt="">Healing flasks</dt><dd>${p.flasks}/${p.maxFlasks} · ${Math.round((.5+.1*p.flaskLv)*100)}% each</dd></div>
      <div><dt><img src="${ICONS.bomb}" alt="">Bombs · <img src="${ICONS.ward}" alt="">Ash</dt><dd>${p.bombs}/${p.maxBombs} · ${p.wards}/${p.maxWards}</dd></div>
      <div><dt>Heal per kill</dt><dd>${p.drinkLv?'+'+(3+3*p.drinkLv):'none'}</dd></div>
      <div><dt><img src="${ICONS.soul}" alt="">Souls</dt><dd>${game.embers}</dd></div>
      <div><dt>Foes slain · Time</dt><dd>${game.kills} · ${time}</dd></div></dl>
      <dl class="kv ranks">${[['Harden the plate','armorLv'],['Fortify the heart','vigorLv'],['Harden the will','staLv'],['Deepen the flasks','flaskLv'],['Widen the satchel','satchelLv'],['Drink of the fallen','drinkLv']].map(([n,k])=>{const u=Object.values(UPG).find(u=>u.key===k);return`<div><dt>${n}</dt><dd>${pips(p[k]||0,u.costs.length)}</dd></div>`}).join('')}</dl></section>
    <section><h3><img class="inl" src="${WICON[p.cls]}" alt=""> ${CC.weapon} ${p.swordLv?'+'+p.swordLv:''}</h3><p class="note">${blade}</p>
      <div class="dmg">${p.cls==='sage'?`<div><b>${Math.round((14+4*p.ab4)*mul)}</b><span>Arcane Bolt</span><small>left click · no cooldown</small></div><div><b>${Math.round((26+8*p.ab4)*mul*.55)}–${Math.round((26+8*p.ab4)*mul)}</b><span>Charged Bolt</span><small>right click · hold to charge · 18–40 stamina</small></div>`:`<div><b>${dm(L[0].dmg)}</b><span>Light attack</span><small>per hit · chain finisher ${dm(L[2].dmg)}</small></div>
        ${p.cls==='sentinel'?`<div><b>${Math.round(16*mul)}–${Math.round(50*mul)}</b><span>Charged thrust</span><small>hold right for the shield, hold and release left · 12–30 stamina</small></div>`:''}<div${p.cls==='sentinel'?' hidden':''}><b>${dm(SWORD.heavy.dmg)}</b><span>Heavy attack</span><small>${p.edgeLv?'+ flame wave '+Math.round((14+p.edgeLv*12)*mul):'per hit'}</small></div>`}</div>
      <dl class="kv">
      <div><dt>Temper</dt><dd>${pips(p.swordLv,maxLv)}</dd></div>
${p.cls==='sage'?'':`      <div><dt>From behind <small>(not bosses)</small></dt><dd>light ${Math.round(dm(L[0].dmg)*(p.cls==='rogue'?1.6:1.25))} · heavy ${Math.round(dm(SWORD.heavy.dmg)*(p.cls==='rogue'?1.6:1.25))}</dd></div>
      <div><dt>Staggered foe</dt><dd>light ${Math.round(dm(L[0].dmg)*1.5)} · heavy ${Math.round(dm(SWORD.heavy.dmg)*1.5)}</dd></div>`}
      <div><dt>Damage bonus</dt><dd>+${Math.round((mul-1)*100)}% · ${p.scrolls} scrolls</dd></div>
      <div><dt>Flame wave</dt><dd>${p.edgeLv?Math.round((14+p.edgeLv*12)*mul)+' · rank '+p.edgeLv:'not kindled'}</dd></div>
      <div><dt>Vs. armor</dt><dd>${p.sunderLv?'+'+15*p.sunderLv+'%'+(p.sunderLv>=2?' · light blows crack plate':''):'normal'}</dd></div>
      <div><dt>Next temper</dt><dd>${c===null?'fully tempered':'1 shard at a shrine · '+(p.shards||0)+' held'}</dd></div></dl>
      <dl class="kv ranks">${[['Kindle the edge','edgeLv'],['Learn to sunder','sunderLv']].map(([n,k])=>{const u=Object.values(UPG).find(u=>u.key===k);return`<div><dt>${n}</dt><dd>${pips(p[k]||0,u.costs.length)}</dd></div>`}).join('')}</dl></section></div>
    <div class="abstrip">${ABIL[p.cls].map((a,i)=>{const r=p['ab'+(i+1)];return`<div><img src="${ABICONS[a.icon]}" alt=""><span><b>${abKeyHtml(p.cls,i)} · ${esc(a.name)}</b><small>${pips(r,4)} ${a.cd?(a.cd*(1-.08*(r-1))).toFixed(1)+'s':'no cooldown'}</small></span></div>`}).join('')}</div>
    <div class="opts">${opt('back','Close','Tab or Esc')}</div>`},
  classSelect:()=>`<h2 id="menuTitle">Choose your path</h2><p class="sub">Four paths. One kingdom. Abilities use keys 1 to 4 and grow at the shrines.</p>
    <div class="cls-grid">${Object.entries(CLASSES).map(([id,c])=>`<button class="opt card" type="button" data-act="pick_${id}"><img class="por" src="${classPortrait(id)}" alt=""><div class="ci"><span class="lab">${c.name}</span><small class="tag">${esc(c.tag)}</small><small class="role">${c.role} · ${c.weapon}</small>
      <div class="bars">${c.bars.map((v,i)=>`<span>${STAT_NAMES[i]}<i style="--v:${v}"></i></span>`).join('')}</div>
      <div class="abs">${ABIL[id].map((a,i)=>`<span title="${esc(a.desc(1))}"><img src="${ABICONS[a.icon]}" alt=""><kbd>${abKeyHtml(id,i)}</kbd>${esc(a.name)}</span>`).join('')}</div></div></button>`).join('')}</div>
    <div class="opts">${opt('back','Back','')}</div>`,
  abUpg:()=>{const p=P,c=CLASSES[p.cls];return`<h2 id="menuTitle">${c.name} abilities</h2><p class="sub"><img class="inl" src="${ICONS.soul}" alt=""> ${game.embers} souls to spend · each rank also shortens the cooldown by 8%</p><div class="opts">
    ${ABIL[p.cls].map((a,i)=>{const r=p['ab'+(i+1)],mx=r>=4;return opt('abup_'+(i+1),`${abKey(p.cls,i)} · ${a.name}`,mx?`${a.desc(r)}. Mastered.`:`Rank ${r} of 4. Next: ${a.desc(r+1)}`,mx?'max':AB_COSTS[r]+' souls')}).join('')}
    ${opt('back','Back','')}</div><p class="msg" id="menuMsg" aria-live="polite"></p>`},
  settings:()=>{const sl=(k,label,sub)=>`<label class="slider"><span class="sl-l"><b>${label}</b><small>${sub}</small></span><input type="range" min="0" max="100" step="5" value="${Math.round(SET[k]*100)}" data-set="${k}" aria-label="${label}"><output id="out_${k}">${Math.round(SET[k]*100)}%</output></label>`;
    return`<h2 id="menuTitle">Settings</h2><p class="sub">Audio · saved on this device</p><div class="sliders">
    ${sl('master','Master volume','Everything you hear')}${sl('music','Music','The title theme and the keep\'s ambience')}${sl('sfx','Sound effects','Blades, spells, foes and footsteps')}</div>
    <div class="opts">${opt('toggleMute',AU.muted?'Unmute all sound':'Mute all sound','Also the M key')}${opt('testSfx','Play a test sound','Hear the effects volume')}${opt('back','Back','')}</div>
    ${AU.ctx?'':'<p class="note">Sound starts after your first click or key press.</p>'}`},
  controls:()=>`<h2 id="menuTitle">Controls</h2><p class="sub">Keyboard, with touch buttons shown in brackets</p><dl class="kv keys">
    ${[['A / D','Walk, hold to run (‹ ›)'],['Space / W','Jump, again in the air (⌃)'],['S + Space','Drop through a platform (⌄ ⌃)'],['Mouse','The knight faces your cursor'],['J / Left click','Light attack, chain three (†)'],['K / Right click','Heavy attack (✠)'],['1 – 4','Class abilities, shown bottom left'],['Tab','Character and weapon stats'],['Shift / L','Dodge (»)'],['F','Drink a flask (✚)'],['Q','Throw an ember bomb (Q)'],['R','Scatter warding ash (R)'],['E','Take, open, rest, enter (E)'],['P / Esc','Pause (≡)'],['M','Sound on or off']].map(([k,v])=>`<div><dt><kbd>${k}</kbd></dt><dd>${v}</dd></div>`).join('')}
    </dl><p class="note">Swings and dodges spend stamina. It refills when you stop for a moment.</p><div class="opts">${opt('back','Back','')}</div>`,
  confirmTitle:()=>`<h2 id="menuTitle">Return to the title?</h2><p class="sub">Progress since your last rest at the shrine will be lost.</p><div class="opts">
    ${opt('back','Stay','Return to the pause menu')}${opt('titleYes','Return to title screen','Your last rest is kept')}</div>`,
  rest:()=>{const c=upgCost('sword');return`<h2 id="menuTitle">${esc((game.restLantern&&game.restLantern.label)||'Ashen Shrine')}</h2><p class="sub"><img class="inl" src="${ICONS.soul}" alt=""> ${game.embers} souls</p><div class="opts">
    ${opt('rest','Rest','Restore health and flasks, save, and wake the fallen')}
    ${opt('upgradeSword','Upgrade weapon',c===null?`Your ${wname()} is fully tempered`:`${CLASSES[P.cls].weapon} +${P.swordLv} to +${P.swordLv+1} · ${P.shards||0} shard${P.shards===1?'':'s'} held`,c===null?'max':'1 shard')}
    ${opt('upgrades','View available upgrades','Everything the shrine can offer')}
    ${opt('abilities','Train your abilities',`${CLASSES[P.cls].name} abilities, keys 1 to 4`)}
    ${opt('leave','Leave','Return to the keep')}</div><p class="msg" id="menuMsg" aria-live="polite"></p>`},
  upgrades:()=>`<h2 id="menuTitle">Upgrades</h2><p class="sub"><img class="inl" src="${ICONS.soul}" alt=""> ${game.embers} souls to spend</p><div class="opts two">
    ${Object.entries(UPG).map(([k,u])=>{const c=upgCost(k),lv=P[u.key];return opt('buy_'+k,u.name,`${u.desc} · rank ${lv} of ${u.costs.length}`,c===null?'max':u.shard?`1 shard (${P.shards||0} held)`:`${c} souls`)}).join('')}
    ${opt('back','Back','')}</div><p class="msg" id="menuMsg" aria-live="polite"></p>`
};
function buyAb(i){const p=P,a=ABIL[p.cls][i-1],r=p['ab'+i];
  if(r>=4){msg(a.name+' is already mastered.');return}const c=AB_COSTS[r];
  if(game.embers<c){msg(`You need ${c} souls. You carry ${game.embers}.`);sfx.clang();return}
  game.embers-=c;p['ab'+i]++;sfx.upgrade();showView('abUpg',0,'abup_'+i);msg(`${a.name} rises to rank ${r+1}.`)}
function buy(k){const u=UPG[k],c=upgCost(k);
  if(u.shard){if(c===null){msg('Your weapon has taken all the temper it can.');return false}
    if((P.shards||0)<1){msg('You need a Weapon Shard. Every boss drops one.');sfx.clang();return false}P.shards--;P.swordLv++;sfx.upgrade();return true}
  if(c===null){msg('This has reached its peak.');return false}
  if(game.embers<c){msg(`You need ${c} souls. You carry ${game.embers}.`);sfx.clang();return false}
  game.embers-=c;P[u.key]++;if(k==='sta'){P.maxSta=CLASSES[P.cls].sta+15*P.staLv;P.sta=P.maxSta}if(k==='vigor'){P.maxHp+=15;P.hp=P.maxHp}if(k==='satchel'){P.maxBombs=3+P.satchelLv;P.maxWards=2+P.satchelLv;P.bombs=P.maxBombs;P.wards=P.maxWards}
  sfx.upgrade();for(let i=0;i<24;i++)emberP(P.x,P.y-16,16);return true}
const ACT={
  resume:closeMenu,back,leave:closeMenu,
  equip:()=>showView('equip',1),settings:()=>{audioInit();showView('settings',1)},toggleMute:()=>{audioInit();setMuted(!AU.muted);showView('settings',0,'toggleMute')},testSfx:()=>{audioInit();sfxPreview(()=>{sfx.heavy&&sfx.heavy();sfx.clang()})},sheet:()=>showView('sheet',1),controls:()=>showView('controls',1),title:()=>showView('confirmTitle',1),
  titleYes:()=>{MENU.view=null;MENU.stack=[];showTitle()},
  restart:()=>{closeMenu();respawn(false)},
  continue:()=>startGame(true),replay5:()=>startGame(true,true),newGame:()=>showView('classSelect',1),
  pick_knight:()=>{game.newCls='knight';startGame(false)},pick_sage:()=>{game.newCls='sage';startGame(false)},pick_rogue:()=>{game.newCls='rogue';startGame(false)},pick_sentinel:()=>{game.newCls='sentinel';startGame(false)},
  abilities:()=>showView('abUpg',1),abup_1:()=>buyAb(1),abup_2:()=>buyAb(2),abup_3:()=>buyAb(3),abup_4:()=>buyAb(4),
  rest:()=>{doRest();showView('rest',0,'rest');msg(saveGame()?'You rest. Health and flasks restored. Progress saved.':'You rest. Health and flasks restored. This browser blocked saving.')},
  upgradeSword:()=>{const lv=P.swordLv;if(buy('sword')){showView('rest',0,'upgradeSword');msg(`Your ${wname()} is now +${lv+1}.`)}},
  upgrades:()=>showView('upgrades',1),
  buy_sword:()=>{if(buy('sword')){showView('upgrades',0,'buy_sword');msg('The blade takes a keener edge.')}},
  buy_flask:()=>{if(buy('flask')){showView('upgrades',0,'buy_flask');msg('Your flasks run deeper.')}},
  buy_sta:()=>{if(buy('sta')){showView('upgrades',0,'buy_sta');msg('Your will hardens.')}},
  buy_edge:()=>{if(buy('edge')){showView('upgrades',0,'buy_edge');msg('Your heavy blows now loose a wave of flame.')}},
  buy_armor:()=>{if(buy('armor')){showView('upgrades',0,'buy_armor');msg('Your plate grows heavier and harder.')}},
  buy_vigor:()=>{if(buy('vigor')){showView('upgrades',0,'buy_vigor');msg('Your heart beats stronger.')}},
  buy_sunder:()=>{if(buy('sunder')){showView('upgrades',0,'buy_sunder');msg('You learn where plate gives.')}},
  buy_drink:()=>{if(buy('drink')){showView('upgrades',0,'buy_drink');msg('The fallen will feed you.')}},
  buy_satchel:()=>{if(buy('satchel')){showView('upgrades',0,'buy_satchel');msg('Your satchel holds more.')}}
};
function menuKey(e){
  if(e.code==='Escape'||e.code==='KeyP'){back();return true}
  if(e.code==='KeyM'){audioInit();setMuted(!AU.muted);return true}
  const dn=e.code==='ArrowDown'||e.code==='KeyS',up=e.code==='ArrowUp'||e.code==='KeyW';
  if(dn||up){const bs=[...$('panel').querySelectorAll('.opt,input[type=range]')];if(!bs.length)return true;let i=bs.indexOf(document.activeElement);i=i<0?0:dn?(i+1)%bs.length:(i-1+bs.length)%bs.length;bs[i].focus();return true}
  return false}
function doRest(){const p=P;p.hp=p.maxHp;p.trail=p.maxHp;p.flasks=p.maxFlasks;p.bombs=p.maxBombs;p.wards=p.maxWards;p.sta=p.maxSta;
  const o=game.restLantern;if(o){game.checkpoint={x:o.x,y:o.y}}resetFoes();sfx.heal();for(let i=0;i<20;i++)emberP(p.x,p.y-14,16)}
/* =========================================================
   FOUR PATHS: the Knight, the Sage, the Rogue and the Sentinel.
   Each shares the Ashen Knight's animation rig and differs in palette,
   head, outfit, weapon, base stats and four class abilities (keys 1 to 4).
   ========================================================= */
const PAL={
  knight:{...KN},
  sage:{pl:'#2e3a5c',plL:'#46557e',plH:'#7484ac',plD:'#1c2440',blk:'#0d0e14',ck:'#b8ad94',ckD:'#867b64',ckL:'#d8cdb2',lea:'#5a4024',
    steel:'#7a5634',steelL:'#b08a58',steelD:'#3e2a18',eye:'#8fd0ff',eyeW:'#eef8ff',ember:'#6ab4ff',emDim:'#26365a'},
  rogue:{pl:'#2e2b31',plL:'#48444c',plH:'#68646c',plD:'#1a181d',blk:'#0c0b0e',ck:'#7a2020',ckD:'#4e1414',ckL:'#9a3028',lea:'#3a2a20',
    steel:'#9a9aa4',steelL:'#e2ded6',steelD:'#55555e',eye:'#ff5a46',eyeW:'#ffd4c4',ember:'#e0402e',emDim:'#4a1a18'},
  sentinel:{pl:'#6e6046',plL:'#94805a',plH:'#cbb27a',plD:'#463c2c',blk:'#100e0c',ck:'#cbc1a6',ckD:'#958b72',ckL:'#e8dfc6',lea:'#4a3424',
    steel:'#a8a8b0',steelL:'#eceae2',steelD:'#5c5c64',eye:'#ffe08a',eyeW:'#fffae0',ember:'#ffd060',emDim:'#5a4a24'}};
const WEAPONS={
  knight:SWORD,
  rogue:{light:[
      {dur:.22,a:.05,b:.11,dmg:9,reach:25,kb:40,lunge:80,a0:-70,a1:40},
      {dur:.22,a:.05,b:.11,dmg:9,reach:25,kb:40,lunge:80,a0:50,a1:-60},
      {dur:.34,a:.09,b:.17,dmg:16,reach:28,kb:120,lunge:130,a0:-20,a1:10,big:1}],
    heavy:{dur:.62,a:.26,b:.36,dmg:34,reach:30,kb:170,lunge:160,a0:-40,a1:20,big:1}},
  sage:{light:[
      {dur:.34,a:.09,b:.17,dmg:2,reach:32,kb:60,lunge:50,a0:-120,a1:50},
      {dur:.34,a:.09,b:.17,dmg:2,reach:32,kb:60,lunge:50,a0:60,a1:-100},
      {dur:.46,a:.14,b:.24,dmg:2,reach:34,kb:120,lunge:70,a0:-150,a1:70,big:1}],
    heavy:{dur:.86,a:.42,b:.54,dmg:3,reach:36,kb:200,lunge:40,a0:-150,a1:84,big:1}},
  sentinel:{light:[
      {dur:.34,a:.09,b:.17,dmg:11,reach:42,kb:80,lunge:70,a0:-14,a1:6},
      {dur:.34,a:.09,b:.17,dmg:11,reach:42,kb:80,lunge:70,a0:12,a1:-8},
      {dur:.5,a:.16,b:.26,dmg:20,reach:46,kb:180,lunge:110,a0:-90,a1:30,big:1}],
    heavy:{dur:.9,a:.44,b:.56,dmg:42,reach:48,kb:250,lunge:45,a0:-150,a1:84,big:1}}};
const AB_COSTS=[0,300,650,1100];
const CLASSES={
  knight:{name:'Knight',tag:'Steel. Discipline. Unbreakable.',role:'Frontline · Tank',weapon:'Greatsword',
    desc:'Heavy armor and a battered greatsword. Hits hard, holds the line.',hp:110,sta:100,def:.9,spd:1,roll:22,bars:[4,3,4,2]},
  sage:{name:'Sage',tag:'Knowledge is a weapon, too.',role:'Magic · Support',weapon:'Ashwood staff',
    desc:'Robes and an old staff. Strikes from range, heals and wards herself.',hp:85,sta:115,def:1,spd:1,roll:22,bars:[2,4,2,4]},
  rogue:{name:'Rogue',tag:'Not all battles are won with strength.',role:'Assassin · Damage',weapon:'Twin daggers',
    desc:'Leather and two knives. Fast, slippery, deadly from behind.',hp:85,sta:125,def:1,spd:1.15,roll:16,bars:[2,4,1,5]},
  sentinel:{name:'Sentinel',tag:'Faith. Protection. Endurance.',role:'Support · Tank',weapon:'War spear',
    desc:'Plate, a tower shield and a long spear. Keeps distance, heals over time.',hp:120,sta:95,def:.85,spd:.95,roll:24,bars:[5,2,5,1]}};
const STAT_NAMES=['Health','Stamina','Defense','Speed'];
function atkMul(p){return(p.cryT>0?1.25+.1*(p.cryR-1):1)*(p.rallyT>0?1.2+.05*(p.rallyR-1):1)}
function wMul(p){return p.power*(1+.12*p.swordLv)*atkMul(p)}
function hiddenP(){return P&&(P.veilT>0||P.smokeT>0)}
function applyClassDerived(p){const c=CLASSES[p.cls]||CLASSES.knight;p.def=c.def;p.spd=c.spd;p.rollCost=c.roll;SWORD=WEAPONS[p.cls]||WEAPONS.knight;
  for(const k of ['ab1','ab2','ab3','ab4'])p[k]=Math.max(1,p[k]||1)}
function applyClassBase(p,cls){p.cls=CLASSES[cls]?cls:'knight';const c=CLASSES[p.cls];p.maxHp=c.hp;p.hp=c.hp;p.trail=c.hp;p.maxSta=c.sta;p.sta=c.sta;applyClassDerived(p)}
function wname(){return(CLASSES[P&&P.cls]||CLASSES.knight).weapon.toLowerCase()}
function stunFoe(e,t){if(BOSS[e.t]||e.state==='dead')return;e.stunT=Math.max(e.stunT||0,t);e.vx=0}
function foesNear(x,y,r,dy=40){return foes.filter(e=>e.state!=='dead'&&!e.gone&&Math.abs(e.x-x)<r&&Math.abs(e.y-e.h/2-y)<dy+e.h/2)}
function hitBox(p,x0,y0,x1,y1,dmg,kb,stun){let any=false;for(const e of foes){if(e.state==='dead'||e.gone||e.hitBy===p.hitId)continue;
    if(!overlap(x0,y0,x1,y1,e.x-e.w/2,e.y-e.h,e.x+e.w/2,e.y))continue;e.hitBy=p.hitId;e.active=true;any=true;
    const crit=e.stunT>0;if(damageFoe(e,dmg*(crit?1.5:1),p.face,kb,crit,'light')&&stun)stunFoe(e,stun)}
  if(any){hitstop=.028;shake=Math.max(shake,3)}return any}
function aimAngle(p){if(AIM.active){const dx=AIM.sx+camX-p.x,dy=AIM.sy+camY-(p.y-17);if(Math.abs(dx)>2||Math.abs(dy)>2)return Math.atan2(dy,dx)}return p.face>0?0:Math.PI}
function staffLocal(a,f){return Math.atan2(Math.sin(a),Math.cos(a)*f)}
function staffTip(p,a){const f=Math.cos(a)>=0?1:-1,L=staffLocal(a,f),hx=Math.round(1+Math.cos(L)*6),hy=Math.round(-17+Math.sin(L)*5);return[p.x+f*(hx+1+Math.cos(L)*22),p.y+hy+Math.sin(L)*22]}
function fireArcane(p,dmg,big,ang){const a=ang??aimAngle(p),sp=big?330:300;p.face=Math.cos(a)>=0?1:-1;if(big)p.castAng=a;
  const [ox,oy]=p.cls==='sage'?staffTip(p,big?a:p.castAng??a):[p.x+p.face*10,p.y-18];
  shots.push({x:ox,y:oy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:0,from:'p',kind:'arcane',dmg,life:1.3,w:big?8:5,h:big?8:5,pierce:big>=3?1:0,hits:new Set(),big:!!big});
  if(p.veilT>0){p.veilT=0}}
/* ---------- the sixteen abilities ---------- */
const ABIL={
  knight:[
    {name:'Heavy Strike',short:'High damage',cd:7,cost:12,ground:1,icon:'heavyStrike',
      desc:r=>`A crushing blow for ${Math.round((1.7+.3*r)*100)}% heavy damage that staggers foes ${(0.6+.2*r).toFixed(1)}s`,
      use(p,r){setState(p,'heavy');p.skillMul=1.7+.3*r;p.skillStun=.6+.2*r;for(let i=0;i<14;i++)emberP(p.x,p.y-18,16);sfx.shout()}},
    {name:'Shield Bash',short:'Stun',cd:9,cost:10,ground:1,icon:'shieldBash',
      desc:r=>`Charge forward and bash for ${12+6*r} damage, stunning foes ${(1+.3*r).toFixed(1)}s`,
      use(p,r){skill(p,'bash',.4,r);sfx.lunge()}},
    {name:'Battle Cry',short:'Attack boost',cd:20,cost:0,icon:'battleCry',
      desc:r=>`+${25+10*(r-1)}% damage for 8s; nearby foes are thrown back and stunned ${(0.5+.15*r).toFixed(1)}s`,
      use(p,r){skill(p,'cry',.55,r);p.cryT=8;p.cryR=r;sfx.shout();shake=4;ringFx(p,'#ff8c2e');
        for(const e of foesNear(p.x,p.y-16,80)){if(!BOSS[e.t]){e.vx=(e.x>p.x?1:-1)*220;stunFoe(e,.5+.15*r)}}}},
    {name:'Guard',short:'Blocks damage',cd:12,cost:0,icon:'guard',
      desc:r=>`Raise your guard for ${(2+.5*r).toFixed(1)}s: take ${70+5*(r-1)}% less damage and never stagger`,
      use(p,r){p.guardT=2+.5*r;p.guardR=r;sfx.shieldUp();skill(p,'guard',.3,r)}}],
  sage:[
    {name:'Shield of Wisdom',short:'Barrier',cd:18,cost:0,icon:'wisdom',
      desc:r=>`A barrier that absorbs ${25+15*r} damage for 10s`,
      use(p,r){p.barrier=25+15*r;p.barrierMax=p.barrier;p.barrierT=10;skill(p,'cast',.35,r);sfx.shieldUp();ringFx(p,'#8fd0ff')}},
    {name:'Healing Light',short:'Heal',cd:20,cost:0,icon:'healLight',
      desc:r=>`Restore ${18+6*r}% of your health at once`,
      use(p,r){const h=Math.round(p.maxHp*(.18+.06*r));p.hp=Math.min(p.maxHp,p.hp+h);nums.push({x:p.x,y:p.y-34,v:'+'+h,t:1,c:'#bfe6ff'});
        skill(p,'pray',.5,r);sfx.heal();shots.push({kind:'lightcol',x:p.x,y:p.y,life:.8,max:.8,col:'#bfe6ff',from:'fx',vx:0,vy:0,g:0});tempLights.push({x:p.x,y:p.y-20,r:90,life:.6,max:.6})}},
    {name:"Mind's Veil",short:'Invisibility',cd:22,cost:0,icon:'veil',
      desc:r=>`Vanish for ${3+r}s: foes lose sight of you, bosses miss more, and your next blow deals 180%`,
      use(p,r){p.veilT=3+r;sfx.blink();for(let i=0;i<24;i++)part(p.x+(rnd()-.5)*20,p.y-rnd()*28,(rnd()-.5)*30,-10-rnd()*20,.7,rnd()<.5?'#8fd0ff':'#46557e',{g:-6})}},
    {name:'Arcane Bolt',short:'Ranged damage',cd:0,cost:12,icon:'arcaneBolt',
      desc:r=>`Left click, no cooldown: hold to keep loosing bolts toward your aim for ${14+4*r} damage each, 12 stamina a bolt${r>=3?', piercing':''}${r>=4?', with two lesser bolts':''}`,
      use(p,r){skill(p,'cast',.24,r);const m=wMul(p)*(p.veilT>0?1.8:1),a=aimAngle(p);fireArcane(p,(14+4*r)*m,r,a);
        if(r>=4)for(const d of [-.2,.2])fireArcane(p,(14+4*r)*m*.45,0,a+d);sfx.cast()}}],
  rogue:[
    {name:'Shadow Step',short:'Short teleport',cd:4,cost:10,icon:'shadowStep',
      desc:r=>`Blink ${64+12*r}px through foes, untouchable for an instant`,
      use(p,r){const ix=(keys.right?1:0)-(keys.left?1:0),d=ix||p.face;blinkTo(p,d,64+12*r);p.face=d}},
    {name:'Backstab',short:'High damage',cd:8,cost:12,icon:'backstab',
      desc:r=>`Appear behind the nearest foe and stab for ${30+14*r} damage (150% on all but bosses)`,
      use(p,r){const t=foes.filter(e=>e.state!=='dead'&&!e.gone&&!e.fly&&Math.abs(e.x-p.x)<120+10*r&&Math.abs(e.y-p.y)<40).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
        if(!t){toast('No foe close enough to reach.');return false}
        let bx=t.x-t.face*(t.w/2+9);if(solidCode(tileAt(Math.floor(bx/T),Math.floor((t.y-10)/T))))bx=t.x+t.face*(t.w/2+9);
        smokePuff(p.x,p.y);p.x=bx;p.y=t.y;p.vx=p.vy=0;p.face=t.x>p.x?1:-1;p.inv=Math.max(p.inv,.3);smokePuff(p.x,p.y);
        p.stabT=t;skill(p,'stab',.32,r);sfx.blink()}},
    {name:'Smoke Bomb',short:'Reset aggro',cd:16,cost:0,icon:'smoke',
      desc:r=>`A cloud for ${(3+.5*r).toFixed(1)}s: you are hidden inside it and nearby foes choke for ${(1+.3*r).toFixed(1)}s`,
      use(p,r){shots.push({kind:'smoke',x:p.x,y:p.y-14,r:72,life:3+.5*r,max:3+.5*r,from:'fx',vx:0,vy:0,g:0});sfx.smoke();
        for(const e of foesNear(p.x,p.y-16,150,60)){stunFoe(e,1+.3*r);if(!BOSS[e.t]){e.state=e.summoned?'chase':'return';e.lost=0}}}},
    {name:'Dual Strike',short:'Quick combo',cd:6,cost:14,ground:0,icon:'dualStrike',
      desc:r=>`A ${r>=3?5:4}-cut flurry, ${7+3*r} damage per cut`,
      use(p,r){skill(p,'flurry',r>=3?.52:.43,r);sfx.swing()}}],
  sentinel:[
    {name:'Judgment Strike',short:'Holy damage',cd:7,cost:12,icon:'judgment',
      desc:r=>`Call a pillar of light ahead of you for ${24+10*r} damage, stunning foes ${(0.4+.1*r).toFixed(1)}s`,
      use(p,r){skill(p,'judg',.45,r);const tx=p.x+p.face*58;shots.push({kind:'judg',x:tx,y:groundY(tx,p.y-30)??p.y,delay:.28,life:.75,max:.75,dmg:(24+10*r)*wMul(p),stun:.4+.1*r,from:'fx',vx:0,vy:0,g:0,done:false});sfx.holy()}},
    {name:'Divine Shield',short:'Protection',cd:24,cost:0,icon:'divine',
      desc:r=>`A golden shell: untouchable for ${(1.4+.4*r).toFixed(1)}s`,
      use(p,r){p.divT=1.4+.4*r;p.inv=Math.max(p.inv,p.divT);sfx.shieldUp();sfx.holy();ringFx(p,'#ffd060')}},
    {name:'Healing Prayer',short:'Heal over time',cd:22,cost:0,icon:'prayer',
      desc:r=>`Heal ${Math.round((3+.8*r)*6)}% of your health over 6s`,
      use(p,r){p.hotT=6;p.hotRate=(.03+.008*r)*p.maxHp;skill(p,'pray',.5,r);sfx.heal()}},
    {name:'Rallying Cry',short:'Battle buff',cd:26,cost:0,icon:'rally',
      desc:r=>`For 10s: +${20+5*(r-1)}% damage, ${15+5*(r-1)}% less damage taken, faster stamina`,
      use(p,r){p.rallyT=10;p.rallyR=r;skill(p,'cry',.55,r);sfx.shout();ringFx(p,'#ffd060')}}]};
function abKey(cls,i){return cls==='sage'&&i===3?'Left click':String(i+1)}
const MOUSEICON=pixIcon(R=>{const o='#08070a',b='#8a8590',bl='#c9c2b0',d='#5a5662',e='#ff8c2e',eL='#ffc368';
  R(5,0,6,1,o);R(4,1,1,1,o);R(11,1,1,1,o);R(3,2,1,12,o);R(12,2,1,12,o);R(4,14,1,1,o);R(11,14,1,1,o);R(5,15,6,1,o);
  R(4,2,8,12,b);R(5,1,6,1,b);R(5,14,6,1,d);R(4,11,8,3,d);
  R(4,2,4,5,e);R(5,1,3,1,e);R(5,2,2,2,eL);R(8,1,1,6,o);R(4,7,8,1,o);R(9,2,2,1,bl);R(8,8,1,2,d)});
function abKeyHtml(cls,i){return cls==='sage'&&i===3?`<img class="mi" src="${MOUSEICON}" alt="Left click">`:String(i+1)}
function skill(p,kind,dur,r){p.skillKind=kind;p.skillDur=dur;p.skillR=r;setState(p,'skill')}
function ringFx(p,c){for(let i=0;i<36;i++){const a=i/36*Math.PI*2;part(p.x+Math.cos(a)*8,p.y-16+Math.sin(a)*8,Math.cos(a)*150,Math.sin(a)*90,.45,c,{g:0,drag:2,glow:1})}tempLights.push({x:p.x,y:p.y-16,r:80,life:.4,max:.4})}
function smokePuff(x,y){for(let i=0;i<16;i++)part(x+(rnd()-.5)*14,y-rnd()*26,(rnd()-.5)*40,-10-rnd()*20,.6+rnd()*.3,rnd()<.5?'#3a3640':'#5a5662',{g:-10,drag:2})}
function blinkTo(p,d,dist){smokePuff(p.x,p.y);let x=p.x;for(let s=0;s<dist;s+=4){const nx=x+d*4,tx=Math.floor((nx+d*p.w/2)/T);
    if(solidCode(tileAt(tx,Math.floor((p.y-4)/T)))||solidCode(tileAt(tx,Math.floor((p.y-22)/T))))break;x=nx}
  for(let i=0;i<5;i++)p.ghosts.push({x:p.x+(x-p.x)*i/5,y:p.y,f:d,fr:i%4,t:.18});p.x=x;p.vx=d*60;p.inv=Math.max(p.inv,.25);smokePuff(x,p.y);sfx.blink()}
function useAbility(i){const p=P;if(!p||!LIVE()||['death','hurt','heal'].includes(p.state))return;
  const a=(ABIL[p.cls]||ABIL.knight)[i],r=p['ab'+(i+1)]||1;
  if(p.abCd[i]>0){p.abFlash=p.abFlash||[0,0,0,0];p.abFlash[i]=.3;return}
  if(a.ground&&!p.onGround){toast(a.name+' needs solid ground.');return}
  if(a.cost&&!useSta(p,a.cost))return;
  if(a.use(p,r)===false){if(a.cost)p.sta=Math.min(p.maxSta,p.sta+a.cost);return}
  p.abCd[i]=a.cd*(1-.08*(r-1));p.abMax=p.abMax||[1,1,1,1];p.abMax[i]=p.abCd[i]}
PS.skill={
  enter(p){p.hitId=++swingId;p.lightBuf=0;p.heavyBuf=0;p.flurryN=0},
  update(p,dt,ix){const k=p.skillKind,r=p.skillR||1,m=wMul(p);
    if(k==='bash'){p.vx=p.st<.18?p.face*300:p.vx*Math.pow(.001,dt);const x0=p.face>0?p.x:p.x-26,x1=p.face>0?p.x+26:p.x;
      if(p.st<.26&&hitBox(p,x0,p.y-30,x1,p.y,(12+6*r)*m,200,1+.3*r))sfx.clang()}
    else if(k==='stab'){p.vx*=Math.pow(.001,dt);if(p.stabT&&p.st>=.06){const e=p.stabT;p.stabT=null;if(e.state!=='dead'){e.active=true;damageFoe(e,(30+14*r)*m*(BOSS[e.t]?1:1.5),p.face,120,true,'light');hitstop=.0225;shake=Math.max(shake,4);sfx.crit();
        for(let i=0;i<10;i++)part(e.x,e.y-e.h*.6,(rnd()-.5)*80,-30-rnd()*60,.4,'#e0402e',{g:300})}}}
    else if(k==='flurry'){p.vx=p.onGround?p.face*70:p.vx;const n=r>=3?5:4,at=.04+p.flurryN*.09;
      if(p.flurryN<n&&p.st>=at){p.flurryN++;p.hitId=++swingId;sfx.swing();const x0=p.face>0?p.x-4:p.x-30,x1=p.face>0?p.x+30:p.x+4;hitBox(p,x0,p.y-30,x1,p.y,(7+3*r)*m,40,0)}}
    else if(k==='cast')steer(p,dt,ix||0);
    else if(k==='charge'){chargeUpdate(p,dt,ix);return}
    else if(k==='stance'||k==='thrustC'||k==='thrust'){stanceUpdate(p,dt,ix);return}
    else p.vx*=Math.pow(.001,dt);
    if(p.st>=p.skillDur)setState(p,locoState(p))}};
function abilityTick(p,dt){
  for(let i=0;i<4;i++)p.abCd[i]=Math.max(0,p.abCd[i]-dt);if(p.abFlash)for(let i=0;i<4;i++)p.abFlash[i]-=dt;
  for(const k of ['cryT','guardT','veilT','divT','rallyT','smokeT'])if(p[k]>0)p[k]-=dt;
  if(p.barrierT>0){p.barrierT-=dt;if(p.barrierT<=0)p.barrier=0}
  if(p.hotT>0&&p.state!=='death'){p.hotT-=dt;const h=p.hotRate*dt;p.hp=Math.min(p.maxHp,p.hp+h);p.hotAcc=(p.hotAcc||0)+h;if(p.hotAcc>=4){nums.push({x:p.x,y:p.y-34,v:'+'+Math.round(p.hotAcc),t:.6,c:'#e8d890'});p.hotAcc=0}
    if(rnd()<dt*14)part(p.x+(rnd()-.5)*18,p.y-rnd()*26,0,-20,.7,'#ffe08a',{g:-6,glow:1})}
  if(p.rallyT>0&&p.staDelay<=0&&!['light','heavy','dodge'].includes(p.state))p.sta=Math.min(p.maxSta,p.sta+26*dt)}
/* ---------- class effects in the world ---------- */
function stepShotC(s,dt){
  if(s.kind==='judg'){s.life-=dt;if(s.delay>0){s.delay-=dt;return true}
    if(!s.done){s.done=true;shake=Math.max(shake,4);tempLights.push({x:s.x,y:s.y-30,r:100,life:.4,max:.4});
      for(const e of foes){if(e.state==='dead'||e.gone)continue;if(Math.abs(e.x-s.x)<24+e.w/2&&e.y>s.y-90&&e.y-e.h<s.y+4){e.active=true;damageFoe(e,s.dmg,e.x>s.x?1:-1,90,true,'light');stunFoe(e,s.stun)}}
      for(let i=0;i<20;i++)part(s.x+(rnd()-.5)*20,s.y-rnd()*80,(rnd()-.5)*40,-40-rnd()*60,.6,rnd()<.5?'#ffe08a':'#fff6d0',{g:-20,glow:1})}
    return true}
  if(s.kind==='smoke'){s.life-=dt;if(Math.hypot(P.x-s.x,P.y-14-s.y)<s.r)P.smokeT=.2;if(rnd()<dt*30)part(s.x+(rnd()-.5)*s.r*1.4,s.y+(rnd()-.5)*s.r*.8,(rnd()-.5)*12,-6,1,rnd()<.5?'#3a3640':'#57535e',{g:-4,drag:1});return true}
  if(s.kind==='lightcol'||s.kind==='hbring'){s.life-=dt;return true}
  if(s.kind==='arcaneH'){if(s.life<=dt){s.life=0;arcaneBurst(s);return true}for(let i=0;i<2+s.ch*3;i++)part(s.x+(rnd()-.5)*s.w,s.y+(rnd()-.5)*s.h,-s.vx*.08+(rnd()-.5)*30,-s.vy*.08+(rnd()-.5)*30,.35+rnd()*.25,HB_COL[(rnd()*HB_COL.length)|0],{g:0,drag:2,glow:1})}
  if(s.kind==='arcane'&&rnd()<.8)part(s.x,s.y,-s.vx*.05,-s.vy*.05,.3,rnd()<.5?'#8fd0ff':'#46557e',{g:0,glow:1});
  return false}
function drawShotC(s){const X=sx(s.x),Y=sy(s.y);
  if(s.kind==='arcane'){const k=s.big?1:0,t=game.time*20;g.fillStyle='#46557e';g.fillRect(X-2-k,Y-2-k,5+k*2,5+k*2);g.fillStyle='#8fd0ff';g.fillRect(X-1-k,Y-1-k,3+k*2,3+k*2);g.fillStyle='#eef8ff';g.fillRect(X,Y,1,1);
    g.fillStyle='#8fd0ff';g.fillRect(X+Math.round(Math.cos(t)*4),Y+Math.round(Math.sin(t)*4),1,1);return true}
  if(s.kind==='judg'){const a=s.delay>0?1-s.delay/.28:1,F=Y;if(s.delay>0){g.fillStyle=Math.floor(game.time*16)%2?'#ffd060':'#fff2b0';for(let i=-16;i<=16;i+=2)g.fillRect(X+i,F-1,1,1);g.globalAlpha=.25*a;g.fillStyle='#ffe08a';g.fillRect(X-2,F-120,4,120);g.globalAlpha=1;return true}
    const f=s.life/s.max;g.globalAlpha=f;g.fillStyle='#ffe08a';g.fillRect(X-10,F-130,20,130);g.fillStyle='#fff6d0';g.fillRect(X-5,F-130,10,130);g.fillStyle='#ffffff';g.fillRect(X-2,F-130,4,130);
    g.fillStyle='#ffd060';g.fillRect(X-18,F-3,36,3);g.globalAlpha=1;return true}
  if(s.kind==='smoke'){const f=Math.min(1,s.life/.6,(s.max-s.life)/.2+.2);g.globalAlpha=.55*f;for(let i=0;i<14;i++){const a=i*2.4+game.time*.6,rr=s.r*(.35+.5*((i*37)%10)/10);g.fillStyle=i&1?'#2e2b33':'#46424d';
      const cx=X+Math.round(Math.cos(a)*rr),cy=Y+Math.round(Math.sin(a)*rr*.5),w=18+((i*13)%14);g.fillRect(cx-w/2,cy-w/3,w,w*.66)}g.globalAlpha=1;return true}
  if(s.kind==='arcaneH'){const t=game.time,r=Math.round(s.w/2),k=Math.floor(t*20)%2;g.globalAlpha=.3;g.fillStyle='#7a4aff';g.beginPath();g.arc(X,Y,r+4,0,7);g.fill();g.globalAlpha=1;
    g.fillStyle='#8a5aff';g.beginPath();g.arc(X,Y,r,0,7);g.fill();g.fillStyle=k?'#6ab4ff':'#8fd0ff';g.beginPath();g.arc(X,Y,Math.max(1,r-2),0,7);g.fill();g.fillStyle='#ffffff';g.fillRect(X-1,Y-1,2+(s.ch>.6?1:0),2+(s.ch>.6?1:0));
    for(let i=0;i<5;i++){const an=t*10+i*1.26;g.fillStyle=i&1?'#d8b8ff':'#8fd0ff';g.fillRect(X+Math.round(Math.cos(an)*(r+3)),Y+Math.round(Math.sin(an)*(r+3)),1,1)}return true}
  if(s.kind==='hbring'){const f=s.life/s.max,rr=s.r*(1.2-f*.5);g.globalAlpha=f;g.strokeStyle='#a070ff';g.lineWidth=2;g.beginPath();g.arc(X,Y,rr,0,7);g.stroke();g.strokeStyle='#8fd0ff';g.lineWidth=1;g.beginPath();g.arc(X,Y,rr*.7,0,7);g.stroke();g.globalAlpha=1;return true}
  if(s.kind==='lightcol'){const f=s.life/s.max;g.globalAlpha=f*.8;g.fillStyle=s.col;g.fillRect(X-8,Y-120,16,120);g.fillStyle='#ffffff';g.fillRect(X-3,Y-120,6,120);g.globalAlpha=1;return true}
  return false}
function drawPlayerFx(p){const X=sx(p.x),Y=sy(p.y),t=game.time;
  if(p.guardT>0){g.globalAlpha=.5+.2*Math.sin(t*12);g.fillStyle='#c9ccd6';const fx=X+p.face*12;for(let k=-12;k<=4;k+=2)g.fillRect(fx,Y+k-14,1,1);g.fillRect(fx-p.face,Y-26,1,22);g.globalAlpha=1}
  if(p.barrier>0){const a=.25+.35*(p.barrier/(p.barrierMax||1));g.globalAlpha=a;g.fillStyle='#8fd0ff';for(let i=0;i<28;i++){const an=i/28*Math.PI*2+t;g.fillRect(X+Math.round(Math.cos(an)*14),Y-14+Math.round(Math.sin(an)*18),2,1)}g.globalAlpha=1}
  if(p.divT>0){g.globalAlpha=.35+.15*Math.sin(t*16);g.fillStyle='#ffd060';for(let i=0;i<32;i++){const an=i/32*Math.PI*2;g.fillRect(X+Math.round(Math.cos(an)*15),Y-14+Math.round(Math.sin(an)*19),2,2)}g.globalAlpha=1}
  if(p.cryT>0&&rnd()<.3)part(p.x+(rnd()-.5)*14,p.y-rnd()*26,0,-24,.4,'#ff6a3a',{g:-10,glow:1});
  if(p.rallyT>0&&rnd()<.3)part(p.x+(rnd()-.5)*16,p.y-rnd()*26,0,-24,.5,'#ffd060',{g:-10,glow:1});
  drawChargeOrb(p);
  if(p.state==='skill'&&p.skillKind==='flurry'&&p.st<p.skillDur-.06){g.globalAlpha=.4;g.fillStyle='#e2ded6';const n=Math.floor(p.st/.09);g.fillRect(X+p.face*(6+(n%2)*4),Y-22+(n%2)*8,p.face*22,1);g.globalAlpha=1}}
/* ---------- the Sage's charged bolt: hold right click, release to loose ---------- */
const HB_COL=['#a070ff','#6ab4ff','#d8b8ff','#8fd0ff','#7a4aff'];
function heavyBoltDmg(p,ch){return(26+8*(p.ab4||1))*wMul(p)*(.45+.55*ch)*(p.veilT>0?1.8:1)}
function heavyBoltCost(ch){return Math.round(18+22*ch)}
/* ---------- the Sentinel's shield stance: right click to raise, left click to charge a spear thrust ---------- */
function startStance(p){if(['death','hurt','heal','dodge'].includes(p.state)||(p.state==='skill'&&['stance','thrustC','thrust'].includes(p.skillKind)))return;skill(p,'stance',99,1);sfx.shieldUp()}
// the spear and shield pivot at the shoulder and follow the cursor; L is the angle from facing (0 level, negative up)
const SP_S=[2,-21],SP_LEN=34;
function spearGeom(L,k){const c=Math.cos(L),sn=Math.sin(L),hx=SP_S[0]+c*k+4*sn,hy=SP_S[1]+sn*k-4*c;return{hx,hy,c,sn,shX:SP_S[0]+c*9-3*sn,shY:SP_S[1]+sn*9+3*c}}
function spearAim(p){if(!AIM.active)return null;const a=Math.atan2(AIM.sy+camY-(p.y+SP_S[1]),AIM.sx+camX-p.x),f=Math.cos(a)>=0?1:-1;return{f,L:clamp(staffLocal(a,f),-1.45,1.45)}}
function spearWorld(p,L,k,ext){const G=spearGeom(L,k),r=SP_LEN+(ext||0);return[p.x+p.face*(G.hx+G.c*r),p.y+G.hy+G.sn*r]}
function aimSpear(p){const A=spearAim(p);if(A){p.face=A.f;p.spL=A.L}else{const a=aimFace(p);if(a)p.face=a;p.spL=p.spL||0}}
function stanceUpdate(p,dt,ix){const k=p.skillKind;
  if(k==='stance'){steer(p,dt,(ix||0)*.4);aimSpear(p);
    if(keys.a1&&p.sta>=12){p.skillKind='thrustC';p.st=0;p.thrCh=0;sfx.chargeStart();return}
    if(!keys.a2)setState(p,locoState(p));return}
  if(k==='thrustC'){steer(p,dt,(ix||0)*.2);aimSpear(p);p.thrCh=Math.min(1,p.st/.8);
    const [tx,ty]=spearWorld(p,p.spL,-2-8*p.thrCh);if(rnd()<.3+p.thrCh*.6)part(tx+(rnd()-.5)*8,ty+(rnd()-.5)*8,(rnd()-.5)*30,(rnd()-.5)*30,.3,rnd()<.5?'#ffe08a':'#fff6d0',{g:0,glow:1});
    p.humT=(p.humT||0)-dt;if(p.humT<=0){p.humT=.25;sfx.chargeHum(p.thrCh*.6)}
    if(p.thrCh>=1&&!p.thrFull){p.thrFull=true;sfx.chargeFull();for(let i=0;i<14;i++)part(tx,ty,(rnd()-.5)*120,(rnd()-.5)*120,.35,'#ffe08a',{g:0,drag:3,glow:1})}
    if(!keys.a1){const ch=Math.max(.15,p.thrCh),cost=Math.round(12+18*ch);p.thrFull=false;
      if(!useSta(p,cost)){p.skillKind='stance';p.st=0;toast('Not enough stamina to thrust.');return}
      p.skillKind='thrust';p.st=0;p.thrCh=ch;p.thrL=p.spL||0;p.hitId=++swingId;const v=150+230*ch,c=Math.cos(p.thrL),sn=Math.sin(p.thrL);
      p.vx=p.face*c*v;if(sn<-.35&&p.onGround){p.vy=sn*v*.55;p.onGround=false}else if(sn>.35&&!p.onGround)p.vy=Math.max(p.vy,sn*v*.5);
      sfx.lunge();if(ch>.6)sfx.heavy();shake=Math.max(shake,1+3*ch);
      const [ox,oy]=spearWorld(p,p.thrL,0);for(let i=0;i<10+16*ch;i++){const d=120+rnd()*200;part(ox,oy,p.face*c*d,sn*d+(rnd()-.5)*30,.25,rnd()<.5?'#ffe08a':'#e8dfc6',{g:0,drag:3,glow:1})}}
    return}
  if(k==='thrust'){const ch=p.thrCh||.15,L=p.thrL||0;p.vx*=Math.pow(.004,dt);
    if(p.st<.18){const reach=SP_LEN+8+24*ch,G=spearGeom(L,-2);let any=false;
      for(let d=0;d<=reach;d+=7){const x=p.x+p.face*(G.hx+G.c*d),y=p.y+G.hy+G.sn*d;if(hitBox(p,x-6,y-6,x+6,y+6,(16+34*ch)*wMul(p),160+200*ch,ch>=1?.5:0))any=true}
      if(any)sfx.crit()}
    if(p.st>=.32){if(keys.a2){p.skillKind='stance';p.st=0}else setState(p,locoState(p))}}}
function startCharge(p){if(['death','hurt','heal','dodge'].includes(p.state)||(p.state==='skill'&&p.skillKind==='charge'))return;
  if(p.sta<18){p.staFlash=.35;return}p.charge=0;p.chargeFull=false;skill(p,'charge',99,p.ab4||1);sfx.chargeStart()}
function chargeUpdate(p,dt,ix){steer(p,dt,(ix||0)*.45);p.charge=Math.min(1,p.st/1.1);
  const a=aimAngle(p);p.face=Math.cos(a)>=0?1:-1;const [tx,ty]=staffTip(p,a);
  const n=1+Math.floor(p.charge*3);for(let i=0;i<n;i++){const an=rnd()*Math.PI*2,r=14+rnd()*18;part(tx+Math.cos(an)*r,ty+Math.sin(an)*r,-Math.cos(an)*r*4,-Math.sin(an)*r*4,.22,HB_COL[(rnd()*HB_COL.length)|0],{g:0,glow:1})}
  p.humT=(p.humT||0)-dt;if(p.humT<=0){p.humT=.22;sfx.chargeHum(p.charge)}
  if(p.charge>=1&&!p.chargeFull){p.chargeFull=true;sfx.chargeFull();for(let i=0;i<20;i++){const an=i/20*Math.PI*2;part(tx,ty,Math.cos(an)*90,Math.sin(an)*90,.35,i&1?'#d8b8ff':'#8fd0ff',{g:0,drag:3,glow:1})}}
  if(!(keys.a2)){releaseCharge(p)}}
function releaseCharge(p){const ch=Math.max(.2,p.charge||0),cost=heavyBoltCost(ch);
  if(!useSta(p,cost)){const a=aimAngle(p),[tx,ty]=staffTip(p,a);for(let i=0;i<10;i++)part(tx,ty,(rnd()-.5)*60,(rnd()-.5)*60,.3,'#5a4a8a',{g:0});toast('Not enough stamina to loose the charge.');setState(p,locoState(p));return}
  const a=aimAngle(p);p.face=Math.cos(a)>=0?1:-1;p.castAng=a;const [ox,oy]=staffTip(p,a),sp=260+140*ch,sz=8+6*ch;
  shots.push({x:ox,y:oy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,g:0,from:'p',kind:'arcaneH',dmg:heavyBoltDmg(p,ch),life:1.5,w:sz,h:sz,pierce:1,hits:new Set(),ch});
  if(p.veilT>0)p.veilT=0;p.vx=-p.face*(60+80*ch);shake=Math.max(shake,2+3*ch);sfx.heavyCast(ch);tempLights.push({x:ox,y:oy,r:60+50*ch,life:.25,max:.25});
  for(let i=0;i<14+20*ch;i++){const an=a+(rnd()-.5)*1.2;part(ox,oy,Math.cos(an)*(80+rnd()*160),Math.sin(an)*(80+rnd()*160),.35+rnd()*.3,HB_COL[(rnd()*HB_COL.length)|0],{g:0,drag:2,glow:1})}
  p.charge=0;skill(p,'cast',.3,p.ab4||1)}
function arcaneBurst(s){const r=26+22*s.ch;shake=Math.max(shake,3+3*s.ch);sfx.arcaneBurst();tempLights.push({x:s.x,y:s.y,r:90+60*s.ch,life:.35,max:.35});
  for(let i=0;i<34+30*s.ch;i++){const an=rnd()*Math.PI*2,v=60+rnd()*200;part(s.x,s.y,Math.cos(an)*v,Math.sin(an)*v,.4+rnd()*.4,HB_COL[(rnd()*HB_COL.length)|0],{g:40,drag:2,glow:1})}
  shots.push({kind:'hbring',x:s.x,y:s.y,r:r,life:.3,max:.3,from:'fx',vx:0,vy:0,g:0});
  for(const e of foes){if(e.state==='dead'||e.gone)continue;if(Math.hypot(e.x-s.x,e.y-e.h/2-s.y)<r+e.w/2){e.active=true;damageFoe(e,s.dmg*.5,e.x>s.x?1:-1,140,false,'blast')}}}
Object.assign(sfx,{
  chargeStart:()=>{osc({type:'sine',f0:220,f1:440,dur:.25,vol:.05,a:.05,wet:.6});nz({dur:.3,type:'highpass',f0:2500,vol:.04,a:.1,wet:.5})},
  chargeHum:(c)=>{osc({type:'triangle',f0:300+c*500,f1:320+c*520,dur:.26,vol:.035+c*.02,a:.03,wet:.6});osc({type:'sine',f0:150+c*250,dur:.26,vol:.03,a:.03,wet:.5})},
  chargeFull:()=>{[880,1320,1760].forEach((f,i)=>osc({t:i*.03,type:'sine',f0:f,dur:.4,vol:.04,wet:.8}))},
  heavyCast:(c)=>{osc({type:'sawtooth',f0:180,f1:60,dur:.4,vol:.08+c*.06,lp:1400,wet:.5});nz({dur:.35,type:'highpass',f0:2000,f1:6000,vol:.12,wet:.5});osc({type:'sine',f0:900,f1:300,dur:.3,vol:.06,wet:.6})},
  arcaneBurst:()=>{nz({dur:.45,f0:3000,f1:400,q:.7,vol:.18,wet:.5});osc({type:'sine',f0:520,f1:120,dur:.4,vol:.08,wet:.6});thud(.1)}});
function drawChargeOrb(p){if(!(p.state==='skill'&&p.skillKind==='charge'))return;const a=aimAngle(p),[tx,ty]=staffTip(p,a),X=sx(tx),Y=sy(ty),c=p.charge||0,t=game.time,r=Math.round(2+5*c);
  g.globalAlpha=.35;g.fillStyle='#7a4aff';g.beginPath();g.arc(X,Y,r+3,0,7);g.fill();g.globalAlpha=1;
  g.fillStyle='#a070ff';g.beginPath();g.arc(X,Y,r,0,7);g.fill();g.fillStyle='#6ab4ff';g.beginPath();g.arc(X,Y,Math.max(1,r-2),0,7);g.fill();g.fillStyle='#eef8ff';g.fillRect(X-1,Y-1,2,2);
  for(let i=0;i<3+Math.floor(c*4);i++){const an=t*(6+i)+i*2.1,rr=r+4+Math.sin(t*9+i)*2;g.fillStyle=i&1?'#d8b8ff':'#8fd0ff';g.fillRect(X+Math.round(Math.cos(an)*rr),Y+Math.round(Math.sin(an)*rr),1,1)}
  if(c>=1&&Math.floor(t*10)%2){g.globalAlpha=.6;g.strokeStyle='#ffffff';g.beginPath();g.arc(X,Y,r+5,0,7);g.stroke();g.globalAlpha=1}}
/* ---------- the four looks: heads, outfits and weapons ---------- */
const HEADS={
  sage(h0,by,lk,e){KR(h0-3,-28+by,4,8,KN.ckD);KR(h0-4,-24+by,3,6,KN.ckD);KR(h0-1,-31+by,10,9,KN.ck);KR(h0,-32+by,7,1,KN.ckL);KR(h0-1,-31+by,2,9,KN.ckD);KR(h0+8,-29+by,1,6,KN.ckL);
    KR(h0+3,-28+by,6,6,KN.blk);KR(h0+5,-26+by+lk,1,1,e>.4?KN.eye:KN.emDim);KR(h0+7,-26+by+lk,1,1,e>.4?KN.eye:KN.emDim);if(e>.6)KR(h0+7,-26+by+lk,1,1,KN.eyeW);KR(h0+3,-22+by,6,1,KN.ckD)},
  rogue(h0,by,lk,e,pulse,t){const fl=Math.round(Math.sin(t*9)*1);KR(h0-6,-24+by+fl,5,2,KN.ck);KR(h0-9,-23+by-fl,4,2,KN.ckD);
    KR(h0,-30+by,9,8,KN.plD);KR(h0+1,-31+by,6,1,KN.pl);KR(h0,-30+by,2,8,KN.blk);KR(h0+3,-28+by,6,3,KN.blk);KR(h0+5,-27+by+lk,3,1,e>.4?KN.eye:KN.emDim);if(e>.6)KR(h0+7,-27+by+lk,1,1,KN.eyeW);
    KR(h0+2,-25+by,7,3,KN.ck);KR(h0+2,-25+by,7,1,KN.ckL);KR(h0+1,-23+by,6,1,KN.ckD)},
  sentinel(h0,by,lk,e){KR(h0-2,-31+by,11,10,KN.ck);KR(h0-1,-32+by,8,1,KN.ckL);KR(h0-2,-31+by,2,10,KN.ckD);KR(h0-3,-24+by,3,5,KN.ckD);
    KR(h0+3,-28+by,6,7,KN.pl);KR(h0+3,-28+by,6,1,KN.plH);KR(h0+4,-26+by+lk,5,1,KN.blk);KR(h0+6,-27+by,1,5,KN.blk);KR(h0+5,-26+by+lk,1,1,e>.4?KN.eye:KN.emDim);KR(h0+7,-26+by+lk,1,1,e>.4?KN.eye:KN.emDim);KR(h0+3,-22+by,6,1,KN.plD)}};
function sageRobe(q,ln,by,t){if(q.legs==='roll'||q.legs==='dead')return;const kneel=q.legs==='kneel',bot=kneel?-3:-2,top=-14+by,sw=q.legs==='run'||q.legs==='lunge'||q.legs==='brace'?2:q.legs==='walk'?1:0;
  for(let y=top;y<bot;y++){const k=(y-top)/(bot-top),w=Math.round(10+k*(4+sw*2));KR(-Math.floor(w/2)+ln-(k>.5?sw:0),y,w,1,y===top?KN.plL:KN.pl)}
  KR(-5+ln,top,2,bot-top,KN.plD);KR(1+ln,top+2,2,bot-top-2,KN.ck);
  for(let i=0;i<7;i++){const h=(i*5+Math.floor(t*6))%3;KR(-6+ln-sw+i*2,bot,1,h?1:2,KN.plD)}}
const EXTRA={
  knight(q,ln,by){if(q.buckler){KR(6+ln,-22+by,7,10,KN.plL);KR(7+ln,-21+by,5,8,KN.pl);KR(9+ln,-18+by,1,2,KN.ember);KR(6+ln,-22+by,7,1,KN.plH)}},
  sage(q,ln,by){KR(-2+ln,-20+by,3,7,KN.ck);KR(-2+ln,-14+by,6,1,KN.lea);KR(1+ln,-14+by,2,1,'#c9a040')},
  rogue(q,ln,by){KR(-6+ln,-15+by,10,2,KN.lea);KR(-3+ln,-15+by,2,2,'#7a5a3a');kline(-6+ln,-14+by,-10+ln,-7+by,KN.steelD);kline(-5+ln,-14+by,-9+ln,-7+by,KN.steel);KR(-6+ln,-15+by,2,2,KN.lea)},
  sentinel(q,ln,by){KR(-2+ln,-20+by,5,12,KN.ck);KR(-2+ln,-20+by,5,1,KN.ckL);KR(0+ln,-18+by,1,6,'#c9a040');KR(-1+ln,-16+by,3,1,'#c9a040');
    if(q.legs==='roll')return;const sy0=q.shieldUp?Math.round(q.shY)-7+by:-23+by,sx0=q.shieldUp?Math.round(q.shX)-4+ln:-1+ln;KR(sx0,sy0,8,12,'#cbb27a');KR(sx0+1,sy0+1,6,10,'#7a4a26');KR(sx0+1,sy0+11,6,1,'#cbb27a');KR(sx0+2,sy0+12,4,1,'#cbb27a');KR(sx0+3,sy0+13,2,1,'#a08a5a');KR(sx0+2,sy0+11,4,1,'#5e381c');
    KR(sx0+1,sy0+1,6,1,'#e8d49a');KR(sx0+3,sy0+2,2,8,'#e8dfc6');KR(sx0+2,sy0+4,4,2,'#e8dfc6');KR(sx0+7,sy0+1,1,11,'#8a7244');KR(sx0+3,sy0+2,1,8,'#fff6e0')}};
const WDRAW={
  sage(hx,hy,ang){const r=ang*Math.PI/180,c=Math.cos(r),s=Math.sin(r);kline(hx-c*12,hy-s*12,hx+c*20,hy+s*20,KN.steelD);kline(hx-c*12+1,hy-s*12,hx+c*20+1,hy+s*20,KN.steel);
    const ox=hx+c*22,oy=hy+s*22;KR(Math.round(ox)-2,Math.round(oy)-2,4,4,'#2a3a6a');KR(Math.round(ox)-1,Math.round(oy)-1,3,3,KN.eye);KR(Math.round(ox),Math.round(oy),1,1,KN.eyeW);
    KR(Math.round(hx+c*18)-1,Math.round(hy+s*18),3,1,'#c9a040');const tt=game.time*4;KR(Math.round(ox+Math.cos(tt)*4),Math.round(oy+Math.sin(tt)*4),1,1,KN.ember)},
  rogue(hx,hy,ang){const r=ang*Math.PI/180,c=Math.cos(r),s=Math.sin(r),px=-s,py=c;kline(hx-c*3,hy-s*3,hx,hy,KN.lea);kline(hx+px*2,hy+py*2,hx-px*2,hy-py*2,KN.steelD);
    kline(hx+c*1,hy+s*1,hx+c*12,hy+s*12,KN.steel);kline(hx+c*1+px,hy+s*1+py,hx+c*10+px,hy+s*10+py,KN.steelL);KR(Math.round(hx+c*12),Math.round(hy+s*12),1,1,KN.steelL)},
  sentinel(hx,hy,ang){const r=ang*Math.PI/180,c=Math.cos(r),s=Math.sin(r),px=-s,py=c;kline(hx-c*14,hy-s*14,hx+c*26,hy+s*26,'#4a3424');kline(hx-c*14+px,hy-s*14+py,hx+c*26+px,hy+s*26+py,'#7a5634');
    kline(hx+c*26+px*2,hy+s*26+py*2,hx+c*26-px*2,hy+s*26-py*2,KN.steelD);kline(hx+c*27,hy+s*27,hx+c*34,hy+s*34,KN.steelL);kline(hx+c*27+px,hy+s*27+py,hx+c*32+px,hy+s*32+py,KN.steel);kline(hx+c*27-px,hy+s*27-py,hx+c*32-px,hy+s*32-py,KN.steel);
    KR(Math.round(hx+c*25)-1,Math.round(hy+s*25)-1,2,2,'#a83a2c')}};
/* ---------- sounds ---------- */
Object.assign(sfx,{
  cast:()=>{nz({dur:.18,type:'highpass',f0:3000,f1:6000,vol:.08,wet:.4});osc({type:'sine',f0:600,f1:1400,dur:.18,vol:.06,wet:.5});osc({t:.05,type:'triangle',f0:1200,f1:900,dur:.25,vol:.03,wet:.6})},
  shout:()=>{osc({type:'sawtooth',f0:180,f1:120,dur:.5,vol:.08,lp:900,a:.03,wet:.4});nz({dur:.4,f0:500,f1:300,q:.8,vol:.12,a:.04,wet:.3});metal(320,.08,.4)},
  shieldUp:()=>{metal(520,.14,.6,0,.5);osc({type:'sine',f0:880,f1:1320,dur:.5,vol:.04,a:.05,wet:.7})},
  smoke:()=>{nz({dur:.8,type:'lowpass',f0:1200,f1:200,vol:.22,a:.01,wet:.3});thud(.1)},
  holy:()=>{[523.3,784,1046.5].forEach((f,i)=>osc({t:i*.04,type:'sine',f0:f,dur:.8,vol:.04,a:.02,wet:.8}));nz({dur:.5,type:'highpass',f0:4000,vol:.05,a:.05,wet:.6})}});
/* ---------- icons ---------- */
const ABICON={
  heavyStrike:R=>{for(let i=0;i<11;i++){R(2+i,13-i,2,1,'#cfccc2');R(3+i,14-i,1,1,'#53535c')}R(1,12,4,1,'#5a5e68');R(2,13,1,2,'#5a5e68');R(10,1,4,1,'#ff8c2e');R(12,3,3,1,'#ffc368');R(13,5,2,1,'#ff8c2e')},
  shieldBash:R=>{R(4,2,8,1,'#868c98');R(3,3,10,7,'#5a5e68');R(4,10,8,2,'#5a5e68');R(5,12,6,1,'#5a5e68');R(6,13,4,1,'#5a5e68');R(7,4,2,7,'#ff8c2e');R(5,6,6,2,'#ff8c2e');R(1,5,1,6,'#cfccc2');R(14,5,1,6,'#cfccc2')},
  battleCry:R=>{R(6,2,4,4,'#5a5e68');R(7,4,3,1,'#ffb04a');R(5,6,6,6,'#3e4149');R(3,7,2,4,'#3e4149');R(11,7,2,4,'#3e4149');for(let i=0;i<3;i++){R(1+i,1+i,1,1,'#ff8c2e');R(14-i,1+i,1,1,'#ff8c2e')}R(5,13,6,1,'#c4521f')},
  guard:R=>{R(3,2,10,1,'#cfccc2');R(2,3,12,6,'#868c98');R(3,9,10,2,'#868c98');R(4,11,8,1,'#868c98');R(5,12,6,1,'#868c98');R(6,13,4,1,'#868c98');R(4,4,8,5,'#3e4149');R(7,4,2,8,'#cfccc2');R(5,6,6,1,'#cfccc2')},
  arcaneBolt:R=>{for(let i=0;i<9;i++){R(2+i,13-i,1,1,'#46557e');R(3+i,13-i,1,1,'#8fd0ff')}R(10,2,4,4,'#8fd0ff');R(11,3,2,2,'#eef8ff');R(9,1,1,1,'#6ab4ff');R(14,6,1,1,'#6ab4ff')},
  wisdom:R=>{for(let i=0;i<16;i++){const a=i/16*Math.PI*2;R(Math.round(7.5+Math.cos(a)*6),Math.round(7.5+Math.sin(a)*6),1,1,'#8fd0ff')}R(6,5,4,6,'#46557e');R(7,6,2,4,'#eef8ff')},
  healLight:R=>{R(6,0,4,16,'#bfe6ff');R(7,0,2,16,'#ffffff');R(3,6,10,4,'#bfe6ff');R(4,7,8,2,'#ffffff');R(2,14,12,1,'#6ab4ff')},
  veil:R=>{R(4,2,8,10,'#46557e');R(3,4,10,8,'#46557e');R(5,5,6,5,'#0d0e14');R(6,7,1,1,'#8fd0ff');R(9,7,1,1,'#8fd0ff');for(let i=0;i<7;i++)R(3+i*2,12+(i&1),1,2,'#46557e')},
  shadowStep:R=>{R(9,3,4,10,'#9a3028');R(10,4,2,3,'#0c0b0e');R(4,5,3,7,'#46424d');R(1,7,2,4,'#2e2b33');for(let i=0;i<4;i++)R(5+i,13,1,1,'#7a2020')},
  backstab:R=>{for(let i=0;i<9;i++){R(3+i,12-i,1,1,'#e2ded6');R(4+i,12-i,1,1,'#9a9aa4')}R(2,11,3,3,'#3a2a20');R(1,12,1,3,'#7a2020');R(11,2,3,1,'#e0402e');R(12,4,2,1,'#e0402e')},
  smoke:R=>{R(4,7,8,7,'#46424d');R(3,9,10,4,'#46424d');R(6,8,4,4,'#2e2b33');R(7,4,2,3,'#5a4024');R(8,2,2,2,'#e0402e');R(2,4,3,3,'#57535e');R(11,3,3,3,'#57535e')},
  dualStrike:R=>{for(let i=0;i<9;i++){R(2+i,12-i,1,1,'#e2ded6');R(13-i,12-i,1,1,'#e2ded6')}R(1,12,3,3,'#3a2a20');R(12,12,3,3,'#3a2a20');R(7,3,2,2,'#e0402e')},
  judgment:R=>{R(6,0,4,13,'#ffe08a');R(7,0,2,13,'#fff6d0');R(2,13,12,2,'#ffd060');R(4,12,8,1,'#fff6d0');R(3,5,2,2,'#ffd060');R(11,7,2,2,'#ffd060')},
  divine:R=>{R(3,2,10,1,'#fff6d0');R(2,3,12,6,'#cbb27a');R(3,9,10,2,'#cbb27a');R(4,11,8,1,'#cbb27a');R(5,12,6,1,'#cbb27a');R(6,13,4,1,'#cbb27a');R(4,4,8,5,'#ffd060');R(7,4,2,8,'#fff6d0');R(5,6,6,1,'#fff6d0')},
  prayer:R=>{R(7,1,2,9,'#ffd060');R(4,4,8,2,'#ffd060');R(5,10,6,4,'#cbc1a6');R(4,11,8,3,'#cbc1a6');for(const [x,y] of [[2,2],[13,3],[3,9],[12,10]])R(x,y,1,1,'#fff6d0')},
  rally:R=>{R(4,2,1,12,'#7a5634');R(5,2,8,5,'#a83a2c');R(5,7,6,1,'#a83a2c');R(7,3,3,3,'#ffd060');R(2,13,6,2,'#cbb27a');for(let i=0;i<3;i++)R(11+i,9+i*2,1,1,'#ffd060')}};
const ABICONS={};for(const k in ABICON)ABICONS[k]=pixIcon(ABICON[k]);
const WICON={knight:ICONS.sword,
  sage:pixIcon(R=>{for(let i=0;i<11;i++){R(2+i,14-i,1,1,'#7a5634');R(3+i,14-i,1,1,'#3e2a18')}R(11,1,4,4,'#2a3a6a');R(12,2,2,2,'#8fd0ff');R(12,2,1,1,'#eef8ff');R(10,5,2,1,'#c9a040');R(15,3,1,1,'#6ab4ff');R(10,0,1,1,'#6ab4ff')}),
  rogue:pixIcon(R=>{for(let i=0;i<7;i++){R(2+i,11-i,1,1,'#e2ded6');R(3+i,11-i,1,1,'#9a9aa4');R(13-i,11-i,1,1,'#e2ded6');R(12-i,11-i,1,1,'#9a9aa4')}R(1,11,3,1,'#55555e');R(2,12,2,3,'#3a2a20');R(12,11,3,1,'#55555e');R(12,12,2,3,'#3a2a20')}),
  sentinel:pixIcon(R=>{for(let i=0;i<12;i++){R(1+i,15-i,1,1,'#7a5634');R(2+i,15-i,1,1,'#4a3424')}R(12,1,3,1,'#eceae2');R(13,2,2,2,'#a8a8b0');R(11,3,2,2,'#a8a8b0');R(10,5,2,1,'#5c5c64');R(9,6,2,2,'#a83a2c')})};
/* ---------- a portrait of each path for the selection screen ---------- */
const PORTRAITS={};
function classPortrait(cls){if(PORTRAITS[cls])return PORTRAITS[cls];const fp={cls,x:0,y:0,state:'idle',st:0,animT:.3,face:1,swordLv:0,combo:0},sv=P;
  const q={by:0,lean:0,legs:'stand',ang:cls==='sage'||cls==='sentinel'?-78:cls==='rogue'?40:76,hx:5,hy:-12,cloak:0,eye:1,flask:false,smear:null,ph:0,look:0};
  drawKnightSprite(fp,q);const [c,x]=mk(46,46);x.imageSmoothingEnabled=false;const OX=20,OY=43;
  const o=tintTo(kc,'#07060a');for(const [ox,oy] of [[-1,0],[1,0],[0,1],[0,-1]])x.drawImage(o,OX-KO.x+ox,OY-KO.y+oy);x.drawImage(tintTo(kc,'#7f8899'),OX-KO.x,OY-KO.y-1);x.drawImage(kc,OX-KO.x,OY-KO.y);
  Object.assign(KN,PAL[(sv&&sv.cls)||'knight']);return PORTRAITS[cls]=c.toDataURL()}

/* =========================================================
   LOOP
   ========================================================= */
// title scene: the first room of a fresh keep, no foes awake
initUI();showTitle();
let last=performance.now(),acc=0;const STEP=1/60;
function frame(now){const dt=Math.min(.1,(now-last)/1000);last=now;
  if(pressed.mute){audioInit();setMuted(!AU.muted);toast(AU.muted?'Sound off':'Sound on')}
  if(game.state==='dead'||game.state==='won'){if((pressed.start||pressed.a1)&&game.deadT>1.6){if(game.state==='won')showTitle();else respawn(true)}}
  else if(game.state==='play'&&pressed.pause)openMenu('pause');
  if(game.state==='play'&&P){const stc=P.cls==='sentinel'&&P.state==='skill'&&(P.skillKind==='stance'||P.skillKind==='thrustC'||P.skillKind==='thrust');if(pressed.a1&&P.cls!=='sage'&&!stc)P.lightBuf=.24;if(pressed.a1&&P.cls==='sage')pressed.ab4=true;if(pressed.a2&&P.cls!=='sage'&&P.cls!=='sentinel')P.heavyBuf=.24;pressed2.chg=!!(pressed.a2&&P.cls==='sage');pressed2.stance=!!(pressed.a2&&P.cls==='sentinel');pressed2.thrust=!!(pressed.a1&&stc);if(pressed.jump)P.jumpBuf=.12;if(pressed.roll)P.rollBuf=.15;pressed2.heal=!!pressed.heal;pressed2.skill=!!pressed.skill;pressed2.use=!!pressed.use;pressed2.item2=!!pressed.item2;for(let i=1;i<=4;i++)pressed2['ab'+i]=!!pressed['ab'+i]}
  for(const k in pressed)pressed[k]=false;
  if(game.state!=='menu'){let rem=dt,n=0;while(rem>1e-5&&n<8&&game.state!=='menu'){const h=Math.min(rem,STEP);step(h);rem-=h;n++}}
  render();updateUI();requestAnimationFrame(frame)}
requestAnimationFrame(frame);
})();
