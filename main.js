(function(){

/* ---------- helpers ---------- */
function hash(i, seed){
  var x = Math.sin(i*127.1 + seed*311.7) * 43758.5453123;
  return x - Math.floor(x);
}
function lerp(a,b,t){ return a + (b-a)*t; }
function rotY(x,z,a){ var c=Math.cos(a), s=Math.sin(a); return [x*c - z*s, x*s + z*c]; }
function rotX(y,z,a){ var c=Math.cos(a), s=Math.sin(a); return [y*c - z*s, y*s + z*c]; }
function rotZ(x,y,a){ var c=Math.cos(a), s=Math.sin(a); return [x*c - y*s, x*s + y*c]; }

var BLUE=[0.30,0.56,1.00], PINK=[1.00,0.37,0.69], RED=[1.00,0.30,0.37];
function mixc(a,b,t){ return [lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t)]; }
function scalec(c,s){ return [c[0]*s, c[1]*s, c[2]*s]; }

var N = 3600;
var GOLD = 2.399963229728653;

/* ---------- shape 1: pista de carreras ---------- */
var TRACK_RUNNERS = 60, TRACK_LANES = 5;
function shapeTrack(i,n,t){
  var trackN = n - TRACK_RUNNERS;
  if(i < trackN){
    var lane = i % TRACK_LANES;
    var idx = Math.floor(i/TRACK_LANES);
    var perLane = Math.floor(trackN/TRACK_LANES);
    var theta = (idx/perLane) * Math.PI*2;
    var rx = 1.15 - lane*0.16, ry = 2.15 - lane*0.22;
    var jz = (hash(i,3)-0.5)*0.08;
    return [rx*Math.cos(theta), ry*Math.sin(theta), jz];
  } else {
    var j = i - trackN;
    var g = Math.floor(j/(TRACK_RUNNERS/TRACK_LANES));
    var lane2 = g % TRACK_LANES;
    var rx2 = 1.15 - lane2*0.16, ry2 = 2.15 - lane2*0.22;
    var angle = t*0.42 + (hash(i,4)-0.5)*0.06;
    var cx = rx2*Math.cos(angle), cy = ry2*Math.sin(angle);
    var ox = (hash(i,5)-0.5)*0.12, oy=(hash(i,6)-0.5)*0.12, oz=(hash(i,7)-0.5)*0.12;
    return [cx*1.1+ox, cy*1.1+oy, oz];
  }
}
function colorTrack(i,n){
  var trackN = n - TRACK_RUNNERS;
  var lane;
  if(i<trackN) lane = i % TRACK_LANES;
  else lane = Math.floor((i-trackN)/(TRACK_RUNNERS/TRACK_LANES)) % TRACK_LANES;
  return lane===0?BLUE:(lane===1?PINK:RED);
}

/* ---------- shape 2: cubo ---------- */
var CUBE_V = [
  [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
  [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
];
var CUBE_E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
function shapeCube(i,n,t){
  var e = i % 12;
  var perEdge = Math.floor(n/12);
  var slot = Math.floor(i/12) / perEdge;
  var v0 = CUBE_V[CUBE_E[e][0]], v1 = CUBE_V[CUBE_E[e][1]];
  var s = 1.35;
  var x = lerp(v0[0],v1[0],slot)*s + (hash(i,8)-0.5)*0.03;
  var y = lerp(v0[1],v1[1],slot)*s + (hash(i,9)-0.5)*0.03;
  var z = lerp(v0[2],v1[2],slot)*s + (hash(i,10)-0.5)*0.03;
  var a = t*0.06;
  var r1 = rotY(x,z,a); x=r1[0]; z=r1[1];
  var r2 = rotX(y,z,t*0.025); y=r2[0]; z=r2[1];
  return [x,y,z];
}
function colorCube(i,n){
  var e = i % 12;
  return e%3===0?BLUE:(e%3===1?PINK:RED);
}

/* ---------- shape 3: planeta tierra ---------- */
function earthAngles(i,n){
  var phi = Math.acos(1 - 2*(i+0.5)/n);
  var theta = GOLD * i;
  return [phi, theta];
}
function shapeEarth(i,n,t){
  var a = earthAngles(i,n), phi=a[0], theta=a[1];
  var R = 1.85;
  var x = Math.sin(phi)*Math.cos(theta)*R;
  var y = Math.cos(phi)*R;
  var z = Math.sin(phi)*Math.sin(theta)*R;
  var rot = t*0.16;
  var r = rotY(x,z,rot); x=r[0]; z=r[1];
  return [x,y,z];
}
function colorEarth(i,n){
  var a = earthAngles(i,n), phi=a[0], theta=a[1];
  var v = Math.sin(theta*2.1) + Math.sin(phi*3.7+1.0) + Math.sin(theta*0.7 - phi*2.0);
  if(v>0.65) return RED;
  if(v>0.05) return PINK;
  return scalec(BLUE,0.85);
}

/* ---------- shape 4: rio en tres lineas ---------- */
function shapeRiver(i,n,t){
  var line = i % 3;
  var idx = Math.floor(i/3);
  var perLine = Math.floor(n/3);
  var L = 8;
  var s = idx/perLine;
  var y = ((s*L - t*0.55) % L + L) % L - L/2;
  var offX = (line-1)*2;
  var x = offX + 0.42*Math.sin(y*1.3 + line*2.0) + (hash(i,11)-0.5)*0.05;
  var z = (hash(i,12)-0.5)*0.12;
  return [x,y,z];
}
function colorRiver(i,n){
  var line = i%3;
  return line===0?BLUE:(line===1?PINK:RED);
}

/* ---------- shape 5: fuegos artificiales ---------- */
var FW_CENTERS = [[-1.1,0.7,0],[1.0,0.95,-0.3],[-0.55,-0.85,0.35],[0.85,-0.65,0.2],[0.0,1.5,-0.45]];
var FW_CYCLE = 6.5;
function shapeFireworks(i,n,t){
  var groups = FW_CENTERS.length;
  var perGroup = Math.floor(n/groups);
  var g = Math.min(Math.floor(i/perGroup), groups-1);
  var phase = ((t - g*1.3) % FW_CYCLE + FW_CYCLE) % FW_CYCLE;
  var progress = phase/FW_CYCLE;
  var theta = hash(i,13)*Math.PI*2;
  var phi = Math.acos(2*hash(i,14)-1);
  var dx = Math.sin(phi)*Math.cos(theta), dy=Math.sin(phi)*Math.sin(theta), dz=Math.cos(phi);
  var maxR = 1.7;
  var r = maxR * Math.sin(progress*Math.PI);
  var c = FW_CENTERS[g];
  return [c[0]+dx*r, c[1]+dy*r, c[2]+dz*r*0.6];
}
function colorFireworks(i,n){
  var groups = FW_CENTERS.length;
  var perGroup = Math.floor(n/groups);
  var g = Math.min(Math.floor(i/perGroup), groups-1);
  var pal=[PINK,BLUE,RED,PINK,BLUE];
  return pal[g%pal.length];
}

/* ---------- shape 6: circulo que muta ---------- */
function shapeBlobCircle(i,n,t){
  var theta = (i/n)*Math.PI*2;
  var noise = 0.5*Math.sin(3*theta + t*0.22) + 0.3*Math.sin(7*theta - t*0.15) + 0.2*Math.sin(11*theta + t*0.09);
  var R = 3 + noise*0.55;
  var x = R*Math.cos(theta), y=R*Math.sin(theta);
  var z = (hash(i,15)-0.5)*0.1;
  return [x,y,z];
}
function colorBlobCircle(i,n){
  var theta = (i/n)*Math.PI*2;
  var m = (Math.sin(theta)+1)/2;
  return mixc(BLUE,PINK,m);
}

/* ---------- shape 7: flor que rota ---------- */
function shapeFlower(i,n,t){
  var theta = (i/n)*Math.PI*2;
  var k = 5;
  var r = 1.8 + 1.55*Math.abs(Math.cos(k*theta));
  var rot = t*0.2;
  var x = r*Math.cos(theta), y = r*Math.sin(theta);
  var rr = rotZ(x,y,rot); x=rr[0]; y=rr[1];
  var z = (hash(i,16)-0.5)*0.08;
  return [x,y,z];
}
function colorFlower(i,n){
  var theta = (i/n)*Math.PI*2;
  var petal = Math.floor(((theta%(Math.PI*2))/(Math.PI*2))*5)%3;
  return petal===0?PINK:(petal===1?RED:BLUE);
}

/* ---------- shape 8: camino grueso con loop (fluye) ---------- */
var LOOP_LANES = 4;
function shapeLoop(i,n,t){
  var lane = i % LOOP_LANES;
  var idx = Math.floor(i/LOOP_LANES);
  var perLane = Math.floor(n/LOOP_LANES);
  var s = idx/perLane;
  var theta = (s*Math.PI*2 + t*0.35) % (Math.PI*2);
  var base = 0.5 + 3.7*Math.cos(theta);
  var laneOffset = (lane-1.5)*0.16;
  var r = base + laneOffset;
  var x = r*Math.cos(theta)*2-4, y = r*Math.sin(theta)*1.5;
  var z = (hash(i,17)-0.5)*0.1;
  return [x,y,z];
}
function colorLoop(i,n){
  var lane = i % LOOP_LANES;
  return lane<1?BLUE:(lane<3?PINK:RED);
}

/* ---------- shape 9: mobius ---------- */
function shapeMobius(i,n,t){
  var u = (i/n)*Math.PI*2;
  var v = (hash(i,18)*2-1)*0.55;
  var R = 1.65;
  var x = (R + v*0.65*Math.cos(u/2)) * Math.cos(u);
  var y = (R + v*0.65*Math.cos(u/2)) * Math.sin(u);
  var z = v*0.65*Math.sin(u/2);
  var rr = rotX(y,z, t*0.14); y=rr[0]; z=rr[1];
  return [x*2,y*2,z];
}
function colorMobius(i,n){
  var v = (hash(i,18)*2-1);
  if(Math.abs(v)<0.12) return RED;
  return v<0?BLUE:PINK;
}

/* ---------- shape 10: escaleras electricas ---------- */
var ESC_STEPS = 9, ESC_W=0.34, ESC_H=0.34;
function shapeEscalator(i,n,t){
  var perStep = Math.floor(n/ESC_STEPS);
  var stepIndex = i % ESC_STEPS;
  var sub = Math.floor(i/ESC_STEPS) % perStep;
  var half = perStep/2;
  var isTread = sub < half;
  var localT = (isTread ? sub : sub-half) / half;
  var localX = isTread ? localT*ESC_W : 0;
  var localY = isTread ? 0 : localT*ESC_H;
  var shiftUnits = t*0.75;
  var effStep = (stepIndex + shiftUnits) % ESC_STEPS;
  var bx = effStep*ESC_W + localX;
  var by = effStep*ESC_H + localY;
  bx -= (ESC_STEPS*ESC_W)/2;
  by -= (ESC_STEPS*ESC_H)/2;
  var z = (hash(i,19)-0.5)*0.08;
  return [bx*1.3, by*1.3, z];
}
function colorEscalator(i,n){
  var perStep = Math.floor(n/ESC_STEPS);
  var sub = Math.floor(i/ESC_STEPS) % perStep;
  return sub < perStep/2 ? BLUE : PINK;
}

/* ---------- shape 11: bandera ondeando ---------- */
var FLAG_POLE_FRAC = 0.12, FLAG_COLS = 40;
function shapeFlag(i,n,t){
  var poleCount = Math.floor(n*FLAG_POLE_FRAC);
  var poleX = -1.55;
  if(i < poleCount){
    var y = -1.5 + (i/poleCount)*3.05;
    var x = poleX + (hash(i,20)-0.5)*0.03;
    var z = (hash(i,21)-0.5)*0.03;
    return [x,y,z];
  } else {
    var j = i - poleCount;
    var flagCount = n - poleCount;
    var rows = Math.ceil(flagCount/FLAG_COLS);
    var col = j % FLAG_COLS;
    var row = Math.floor(j/FLAG_COLS) % rows;
    var gx = col/(FLAG_COLS-1);
    var gy = rows>1 ? row/(rows-1) : 0;
    var flagW=3.05, flagH=1.85;
    var x2 = poleX + gx*flagW;
    var baseY = 1.5 - gy*flagH;
    var damp = gx;
    var waveZ = 0.36*damp*Math.sin(gx*6 - t*1.5 + row*0.3);
    var waveY = 0.07*damp*Math.sin(gx*6 - t*1.5 + row*0.3 + 1.0);
    return [x2, baseY+waveY, waveZ];
  }
}
function colorFlag(i,n){
  var poleCount = Math.floor(n*FLAG_POLE_FRAC);
  if(i<poleCount) return scalec(BLUE,0.7);
  var j = i - poleCount;
  var gx = (j % FLAG_COLS)/(FLAG_COLS-1);
  if(gx<0.5) return mixc(RED,PINK,gx*2);
  return mixc(PINK,BLUE,(gx-0.5)*2);
}

/* ---------- shape 12: representacion conica del tiempo ---------- */
function shapeTimeCone(i,n,t){
  var topCount = Math.floor(n*0.42), botCount = Math.floor(n*0.42);
  var H=1.55, R=1.35;
  var x,y,z;
  if(i < topCount){
    var frac = i/topCount;
    y = frac*H;
    var radius = frac*R;
    var angle = i*GOLD;
    x = radius*Math.cos(angle); z = radius*Math.sin(angle);
  } else if(i < topCount+botCount){
    var j = i - topCount;
    var frac2 = j/botCount;
    y = -frac2*H;
    var radius2 = frac2*R;
    var angle2 = j*GOLD + 1.0;
    x = radius2*Math.cos(angle2); z = radius2*Math.sin(angle2);
  } else {
    var k = i - topCount - botCount;
    var streamCount = n - topCount - botCount;
    var slot = k/streamCount;
    var fallY = (slot*2*H - t*0.7);
    fallY = ((fallY % (2*H)) + (2*H)) % (2*H) - H;
    y = fallY;
    x = (hash(k,22)-0.5)*0.07;
    z = (hash(k,23)-0.5)*0.07;
  }
  var a = t*0.08;
  var r = rotY(x,z,a);
  return [r[0], y, r[1]];
}
function colorTimeCone(i,n){
  var topCount = Math.floor(n*0.42), botCount = Math.floor(n*0.42);
  if(i<topCount) return BLUE;
  if(i<topCount+botCount) return PINK;
  return RED;
}

/* ---------- shape 13: QR ---------- */
var QR_SIZE = 21, QR_MOD = 0.155;
function qrInFinder(r,c){
  function inBlock(rr,cc,r0,c0){
    var dr=rr-r0, dc=cc-c0;
    if(dr<0||dr>6||dc<0||dc>6) return null;
    if(dr===0||dr===6||dc===0||dc===6) return true;
    if(dr===1||dr===5||dc===1||dc===5) return false;
    return true;
  }
  var v = inBlock(r,c,0,0); if(v!==null) return v;
  v = inBlock(r,c,0,QR_SIZE-7); if(v!==null) return v;
  v = inBlock(r,c,QR_SIZE-7,0); if(v!==null) return v;
  return null;
}
function qrOn(r,c){
  var f = qrInFinder(r,c);
  if(f!==null) return f;
  return hash(r*QR_SIZE+c, 30) > 0.55;
}
function shapeQR(i,n,t){
  var cells = QR_SIZE*QR_SIZE;
  var m = i % cells;
  var r = Math.floor(m/QR_SIZE), c = m % QR_SIZE;
  var start = -(QR_SIZE*QR_MOD)/2;
  var x = start + c*QR_MOD + (hash(i,24)-0.5)*QR_MOD*0.55;
  var y = start + (QR_SIZE-1-r)*QR_MOD + (hash(i,25)-0.5)*QR_MOD*0.55;
  var z = 0.03*Math.sin(t*0.4 + i*0.05);
  return [x,y,z];
}
function colorQR(i,n){
  var cells = QR_SIZE*QR_SIZE;
  var m = i % cells;
  var r = Math.floor(m/QR_SIZE), c = m % QR_SIZE;
  var on = qrOn(r,c);
  return on ? mixc(PINK,[1,1,1],0.35) : scalec(BLUE,0.18);
}

var SHAPES = [
  {pos:shapeTrack, col:colorTrack},
  {pos:shapeCube, col:colorCube},
  {pos:shapeEarth, col:colorEarth},
  {pos:shapeRiver, col:colorRiver},
  {pos:shapeFireworks, col:colorFireworks},
  {pos:shapeBlobCircle, col:colorBlobCircle},
  {pos:shapeFlower, col:colorFlower},
  {pos:shapeLoop, col:colorLoop},
  {pos:shapeMobius, col:colorMobius},
  {pos:shapeEscalator, col:colorEscalator},
  {pos:shapeFlag, col:colorFlag},
  {pos:shapeTimeCone, col:colorTimeCone},
  {pos:shapeQR, col:colorQR}
];

/* ---------- three.js setup ---------- */
var canvas = document.getElementById('bg-canvas');
var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(window.innerWidth, window.innerHeight);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0,0,9);

var OFFSET_X = 2.35;

function makeGlowTexture(){
  var size=128;
  var c = document.createElement('canvas'); c.width=size; c.height=size;
  var ctx = c.getContext('2d');
  var g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  g.addColorStop(0,'rgba(255,255,255,1)');
  g.addColorStop(0.35,'rgba(255,255,255,0.6)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,size,size);
  var tex = new THREE.CanvasTexture(c);
  return tex;
}

var positions = new Float32Array(N*3);
var colors = new Float32Array(N*3);
for(var i=0;i<N;i++){
  var theta0 = hash(i,99)*Math.PI*2;
  var phi0 = Math.acos(2*hash(i,98)-1);
  var r0 = 3.5 + hash(i,97)*2.5;
  positions[i*3] = Math.sin(phi0)*Math.cos(theta0)*r0;
  positions[i*3+1] = Math.cos(phi0)*r0;
  positions[i*3+2] = Math.sin(phi0)*Math.sin(theta0)*r0;
  colors[i*3]=0.2; colors[i*3+1]=0.2; colors[i*3+2]=0.3;
}

var geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors,3));

var material = new THREE.PointsMaterial({
  size:0.088,
  map: makeGlowTexture(),
  transparent:true,
  depthWrite:false,
  blending:THREE.AdditiveBlending,
  vertexColors:true,
  sizeAttenuation:true
});

var points = new THREE.Points(geometry, material);
points.position.x = OFFSET_X;
scene.add(points);

var currentShapeIndex = 0;
var clock = new THREE.Clock();

function animate(){
  requestAnimationFrame(animate);
  var dt = Math.min(clock.getDelta(), 0.05);
  var elapsed = clock.elapsedTime;
  var factor = 1 - Math.exp(-dt/1.15);
  var shape = SHAPES[currentShapeIndex];
  var posAttr = geometry.attributes.position.array;
  var colAttr = geometry.attributes.color.array;
  for(var i=0;i<N;i++){
    var t = shape.pos(i,N,elapsed);
    var c = shape.col(i,N);
    var ix = i*3;
    posAttr[ix]   = lerp(posAttr[ix],   t[0], factor);
    posAttr[ix+1] = lerp(posAttr[ix+1], t[1], factor);
    posAttr[ix+2] = lerp(posAttr[ix+2], t[2], factor);
    colAttr[ix]   = lerp(colAttr[ix],   c[0], factor);
    colAttr[ix+1] = lerp(colAttr[ix+1], c[1], factor);
    colAttr[ix+2] = lerp(colAttr[ix+2], c[2], factor);
  }
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;

  points.rotation.y = Math.sin(elapsed*0.05)*0.03;
  camera.position.y = Math.sin(elapsed*0.08)*0.08;

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------- slide navigation ---------- */
var deck = document.getElementById('deck');
var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
var dotsWrap = document.getElementById('dots');
slides.forEach(function(s, idx){
  var b = document.createElement('button');
  b.className = 'dot' + (idx===0?' active':'');
  b.setAttribute('aria-label', 'Ir a la diapositiva ' + (idx+1));
  b.addEventListener('click', function(){
    s.scrollIntoView({behavior:'smooth'});
  });
  dotsWrap.appendChild(b);
});
var dotEls = Array.prototype.slice.call(dotsWrap.children);

function setActive(idx){
  currentShapeIndex = idx;
  slides.forEach(function(s,i){ s.classList.toggle('is-active', i===idx); });
  dotEls.forEach(function(d,i){ d.classList.toggle('active', i===idx); });
}

var observer = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting && entry.intersectionRatio > 0.55){
      var idx = parseInt(entry.target.getAttribute('data-index'), 10);
      setActive(idx);
    }
  });
}, {root: deck, threshold:[0.55]});

slides.forEach(function(s){ observer.observe(s); });
setActive(0);

})();