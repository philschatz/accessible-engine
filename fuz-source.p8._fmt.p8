pico-8 cartridge // http://www.pico-8.com
version 18
__lua__
--fuz
--a fez demake by jusiv
--this version is from https://www.lexaloffle.com/bbs/?tid=34188
--also on https://jusiv.itch.io/fuz

--[[
!!!disclaimer!!!
this is a fan project based on
fez, a game released in 2012
by polytron corporation. it was
not made in collaboration with
or endorsed by them.

although i made all assets used
in this cart, they are based
heavily on those from the
original game.

i do not claim ownership of
the original game or its
assets in any way.

- j. henry "jusiv" stadolnik
]]

n1 = -1

function split(str,num)
--splits string into list
--num is bool
local ll,c1 = {},1
for i=1,#str do
 local last = i==#str
 if last or sub(str,i,i) == "," then
  --include current char if at end
  if last then i+=1 end
  --negate
  local neg = false
  if sub(str,c1,c1) == "-" then
   neg = true
   c1 += 1
  end
  --add list item
  local new = sub(str,c1,i-1)
  if num then
   new = tonum(new)
   if neg then
    new *= n1
   end
  end
  add(ll,new)
  c1 = i+1
 end
end
return ll
end

function ssplit(str)
return split(str,false)
end

function nsplit(str)
return split(str,true)
end

title,title_y,title_idle,side,area,aplus,active,intro,ending,pwait,happy = true,0,0,0,0,1,{},-30,0,0,0
function supdate()
sfront,sleft,sback,sright = side==0,side==1,side==2,side==3
end
--area
atrans,atmax,achange,anext,transcolor = 0,12,false,nsplit("0,0,0,0,0"),nsplit("6,6,5,4,5,3,2,2")
-- anext: {area id,side,px,py,pz}
a_sky,skycolor,cldcolor,cloud_y = {},nsplit("12,12,1,14,5,3,2,1"),nsplit("7,6,5,2,1,5,1,15"),nsplit("28,45,3,97,76,100,106,12")
--idle+input
idle,maxidle,keys,lastkey,lkeywait = 0,180,{false,false,false,false,false,false},6,0
function reset_input()
input = {}
for i=1,6 do
 add(input,6) -- 6=none
end
end
--items n stuff
bitget,bits,cubes,rel1,rel2,rel3,item,itname,r_wait,r_dir,r_factor,atiles,tiles = {},0,0,false,false,false,0,"anti-cube",10,1,0,{},{}
for i=1,14 do
add(bitget,false)
add(active,false)
add(atiles,{})
end
--player vars
p_xreal,p_yreal,p_zreal,cur_x,cur_y,cur_z,cur_sx,cur_sy = 48,32,73,0,0,0,0,0
function savelast()
p_slast,p_xlast,p_ylast,p_zlast,p_olast = side,p_xreal,p_yreal,p_zreal,p_open
end
function pgetpos()
p_x,p_y,p_z = from_real(p_xreal),from_real(p_yreal),from_real(p_zreal)
end
p_dpos,p_dz,p_jump,p_maxfall,p_coyotemax,p_coyote,p_floor,p_open,p_reswait = 0,0,13,-9,5,5,false,true,0
p_otrans,p_otransmax,p_otcolors = 0,4,nsplit("13,5,1,0")
p_landed,p_lwait,p_dropwait,p_dwaitmax,p_canuse,p_usewait,p_useidle,p_mir,p_frame,p_still = true,0,0,8,false,0,0,false,0,165
--dot
dot,dotsort,d_rx,d_ry = {},{},-4,-4
d_x,d_y,d_show,d_fmax,d_f,d_shrink,d_idle,d_imax,d_amax,d_da,d_axy = d_rx,d_ry,false,10,0,false,0,300,240,1,0
dvx,dvy,dvz,dvw,dv1,dv2,dv3,dv4,dcolor = nsplit("0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0"),nsplit("1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0"),nsplit("0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1"),nsplit("0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1"),nsplit("2,1,2,1,1,2,3,4,1,2,3,4,5,6,7,8"),nsplit("4,3,4,3,6,5,6,5,10,9,10,9,9,10,11,12"),nsplit("5,6,7,8,8,7,8,7,12,11,12,11,14,13,14,13"),nsplit("9,10,11,12,13,14,15,16,13,14,15,16,16,15,16,15"),{nsplit("11,7,11,6"),nsplit("11,7,11,15"),nsplit("7,12,12,6"),nsplit("7,12,12,15"),nsplit("11,11,7,6"),nsplit("11,11,7,15"),nsplit("12,7,12,6"),nsplit("12,7,12,15"),nsplit("6,10,10,9"),nsplit("15,10,10,9"),nsplit("6,10,10,9"),nsplit("15,10,10,9"),nsplit("6,9,14,14"),nsplit("15,9,14,14"),nsplit("6,9,14,14"),nsplit("15,9,14,14")}
--text
chars,chars2,rrr,talklines,talkline,talkchar,talk = {a=0,b=1,c=2,d=3,e=4,f=5,g=6,h=7,i=8,j=9,k=10,l=11,m=12,n=13,o=14,p=15,q=16,r=17,s=18,t=19,u=20,v=21,w=22,x=23,y=24,z=25},"abcdefghijklmnopqrstuvwxyz /",0,{},0,1,{ssplit("gomez...,something went wrong.,the warp gate broke!,we're stranded here!,maybe you can find,some way to fix it?,(use � and � to move)  ,(� to jump) ,(z and x to rotate),(and � to drop or interact!) "),ssplit("looks like we'll need a cube,to get through here.,you can make one,if you find 8 cube bits.,now get going,it's gomez time!"),ssplit("you assembled a cube!,that should open,a door somewhere."),ssplit("excellent find!,that should fix,the warp gate!,now let's go home!"),ssplit("this door needs 4 cubes.,...are there even that many,around here?"),ssplit("woah nice!,you found an anti-cube!,i had no idea,any were out here!"),ssplit("um... congrats?,i don't know what,the point of that is,...but...,you sure did find it!"),ssplit("what even...,that is not supposed to,be here at all.")}
-->8
--actors
function tadd(t)
add(tiles,t)
end

function tcurrent(t)
return cur_sx == t.sx and cur_sy == t.sy
end

--basic actor
function tmake(inp)
   local ii = nsplit(inp)
   local t = {
      --level coords
      sx = ii[1],
      sy = ii[2],
      --world coords
      rx = ii[3],
      ry = ii[4],
      rz = ii[5],
      scx = 0,
      --sprite
      ix = ii[6],
      iy = ii[7],
      f = 0, --frame
      w = ii[8],
      h = ii[9],
      m = false, --does it mirror
      sm = false, --mirrored
      upd = function(t) end,
      draw = function(t)
         if tcurrent(t) then
            draw_tile(t)
         end
      end,
      --front layer draw
      fdraw = function(t) end,
   }
   if ii[10] != 0 then t.m = true end
   return t
end

function checkhid(h,x,y)
if sget(x,y)%15 == 0 then
 return h
else
 return true
end
end 

function add_tile(t)
tadd(tmake(t))
end

function is_hidden(t)
local hid,sx,sy = false,t.sx,t.sy
if sfront then
 for i=sy,8*flr(sy/8+1) do
  hid = checkhid(hid,sx,i)
 end
elseif sleft then
 for i=12*ceil(sx/12-1),sx do
  hid = checkhid(hid,i,sy)
 end
elseif sback then
 for i=sy,8*ceil(sy/8-1) do
  hid = checkhid(hid,sx,i)
 end
elseif sright then
 for i=sx,12*flr(sx/12+1) do
  hid = checkhid(hid,i,sy)
 end
end
return hid
end

function add_bfly(tt)
local t = tmake(tt)
t.fp = t.rx
t.upd = function(t)
 local fp = t.fp
 local ps = 3.5*cos(fp/80)
 t.fp,t.rx,t.ry,t.rz,t.sm = incmod(fp,80),-ps,ps,sin(fp/20)-4,fp>=40
 if flr(fp/4)%2 == 0 then
  t.ix = 104
 else
  t.ix = 108
 end
end
tadd(t)
end

function add_door(tt,swl,an)
local t = tmake(tt)
local vars = nsplit(swl)
t.s,t.wd,t.lk,t.lw,t.an = vars[1],vars[2],vars[3],20,nsplit(an)
t.upd = function(t)
 local tx,ty,tz = t.sx%12,7-t.sy%8,flr(t.sy/8)-4
 --unlock
 if not istalk() and happy <= 0 and t.lk > 0 and cubes+flr(bits/8) >= t.lk and side == t.s then
  t.lw -= 1
  sfx(23)
  if t.lw <= 0 then
   t.lk = 0
  end
 end
 --player at door
 if side == t.s and p_z+1 == tz then
  if ptouch(t) then
   p_canuse = true
   if t.lk <= 0 then
    d_show = false
    if use() then
     anext,achange = t.an,true
     sfx(24)
    end
   else
    d_show = true
    if talkline <= 0 and use() then
     if t.lk == 4 then
      starttalk(5)
     else
      starttalk(2)
     end
    end
   end
  end
 end
end
t.draw = function(t)
 if tcurrent(t) then
  draw_tile(t)
  if t.lk > 0 then
   local x1,y1,dl,cb = t.scx+4,122-8*(flr(t.sy/8)-4),{},cubes
   local y2 = y1+14-min(14,t.lw)
   if bits >= 8 then
    add(dl,10)
   end
   while cb > 0 do
    cb -= 1
    add(dl,12)
   end
   while #dl < 4 do
    add(dl,5)
   end
   raid()
   rectfill(x1,y2,x1+7,y2+14,13)
   if t.lk == 1 then
    square(x1,y2,dl[1])
   else
    for i=1,4 do
     square(x1+2*cos(i/4),y2+2*sin(i/4),dl[i])
    end
   end
   hornet()
  end
 end
end
tadd(t)
end

function frcomp(n1,ff,n2)
return from_real(n1-ff) == n2 or from_real(n1+ff) == n2
end

function ptouch(t)
local tz = flr(t.sy/8)-4
if ismid(tz,p_z,p_z+1) and p_open then
 if ((sfront or sback) and frcomp((t.sx%12)*8+t.rx,t.rx,p_x)) or ((sleft or sright) and frcomp((7-t.sy%8)*8+t.ry,t.ry,7-p_y)) then
  return not istalk()
 end
end
return false
end

function remove(t,c)
 sset(t.sx,t.sy,c)
 del(tiles,t)
end

function add_bit(tt,id)
local t = tmake(tt..",0,0,0,0,0")
t.id = id
t.upd = function(t)
 if bitget[t.id] then
  remove(t,0)
 elseif not is_hidden(t) then
  --collect
  if ptouch(t) then
   bitget[t.id],happy,item = true,30,0
   bits += 1
   if bits == 8 then
    starttalk(3)
   end
   sfx(24+bits)
  end
 end
end
t.draw = function(t)
 if tcurrent(t) then
  get_scx(t)
  local zz,x1,c1,c2 = 117-8*cur_z,t.scx+1,10,10
  local x2 = x1+5
  local x3 = x2
  if idle < 10 then
   local ww = max(n1,1.5*sin(idle/20))
   x1 += ww
   x3 -= ww
   x2 -= idle/2
   if idle > 5 then c2 = 9 else c1 = 9 end
  end
  raid()
  rectfill(x2,zz,x3,zz+5,c1)
  rectfill(x1,zz,x2,zz+5,c2)
  hornet()
 end
end
t.fdraw = function(t)
 if idle < 30 then
  --pulse
  local x2,z2 = t.scx+4,get_scz(t)
  local x1,z1,x3,z3 = x2-idle,z2-idle,x2+idle,z2+idle
  line(x1,z2,x2,z1,10)
  line(x2,z1,x3,z2)
  line(x1,z2,x2,z3)
  line(x2,z3,x3,z2)
 end
end
tadd(t)
end

function flickerdraw(t)
if tcurrent(t) then
 local iii = t.id==11
 if iii then
  pal(12,8)
  pal(13,4)
 end
 if t.fi > 18 or flr(t.fi/3)%2 == 1 then
  blackpal()
 end
 draw_tile(t)
 if iii then
  sspr(3,41,5,5,t.scx+3,get_scz(t))
 end
 pal()
 hornet()
end
end

function add_item(tt,id)
--item (9=r1,10=r2,11+=acube)
local t = tmake(tt)
sset(t.sx,t.sy,15)
t.id,t.fi,t.zo = id,0,t.rz --fade-in
if id >= 11 then t.fi = 24 end
t.upd = function(t)
 if t.fi > 0 then t.fi -= 1 end
 if bitget[t.id] then
  remove(t,0)
 else
  t.rz = t.zo+1.5*sin(idle/90)
  if is_hidden(t) or t.fi > 2 then
   return
  end
  --collect
  if ptouch(t) then
   local iid = t.id-8
   item,happy = iid,30
   if iid == 1 then
    rel1,rrr,active[1] = true,420,true
    music(n1)
    starttalk(4)
   elseif iid == 2 then
    rel2 = true
    starttalk(7)
   elseif iid == 3 then
    rel3 = true
    starttalk(8)
   else
    cubes += 1
    if cubes == 1 then
     starttalk(6)
    end
   end
   bitget[t.id] = true
   sfx(13,0)
  end
 end
end
t.draw = function(t)
 flickerdraw(t)
end
tadd(t)
end

function add_fadeblock(tt)
local t = tmake(tt)
sset(t.sx,t.sy,15)
t.fi = 24
t.upd = function(t)
 t.fi -= 1
 if t.fi < 3 then
  remove(t,4)
 end
end
t.draw = function(t)
 flickerdraw(t)
end
tadd(t)
end

function add_obelisk(tt,p)
local t = tmake(tt)
t.p = nsplit(p) --pattern
t.upd = function(t)
 if listcomp(t.p,input) then
  activate()
 end
end
t.draw = function(t)
 if tcurrent(t) then
  local zz = 120-8*cur_z
  get_scx(t)
  --draw obelisk
  spr(204,t.scx,zz,1,2)
  spr(220,t.scx,zz+16)
  --pattern
  zz += 3
  local pp = t.p
  for i=1,#pp do
   local sym,chh = pp[i],3
   if ismid(sym,2,3) then
    chh = 2
   end
   sspr(109,40+4*sym,3,chh,t.scx+2,zz)
   zz += chh
  end
 end
end
tadd(t)
end

function add_fork(t,p)
t.p,t.pi,t.pw,t.px = nsplit(p),0,0,0 --pattern
t.upd = function(t)
 if not active[aplus] then
  t.pw += 1
  if t.pw > 20 then
   t.pi = incmod(t.pi,12)
   t.pw = 0
   if t.pi > 5 then
    local pp = t.p
    if pp[t.pi-5] == 4 then
     t.px = 0
     sfx(20)
    else
     t.px = 7
     sfx(21)
    end
   else
    t.px = 4
   end
  end
  if listcomp(t.p,input) then
   activate()
  end
 end
end
t.fdraw = function(t)
 if not active[aplus] and 
  t.px != 4 and t.pw < 10 then
  --pulse
  local zz = 112-8*(flr(t.sy/8)-4)
  circ(t.scx+t.px,zz,t.pw/2,7)
 end
end
tadd(t)
end

function add_nuish(txy,s,n)
local t = tmake(txy..",0,0,0,0,0,0,0,0")
t.s,t.n = nsplit(s),n
t.draw = function(t)
 local sl = t.s
 if tcurrent(t) and
  sl[1+side] == 1 then
  local zz = 128-8*cur_z
  get_scx(t)
  draw_nuish(t.n,t.scx,zz+1)
 end
end
tadd(t)
end

function get_scx(t)
--screen x
if sfront then
 t.scx = 16+t.rx+8*cur_x+r_factor*(cur_y-4)
elseif sleft then
 t.scx = 32-t.ry+8*cur_y+r_factor*(cur_x-6)
elseif sback then
 t.scx = 16-t.rx+8*cur_x+r_factor*(cur_y-4)
elseif sright then
 t.scx = 32+t.ry+8*cur_y+r_factor*(cur_x-6)
end
end

function get_scz(t)
 return 120-8*(flr(t.sy/8)-4)+t.rz
end

function draw_tile(t)
local mm,zz = t.sm,120+t.rz-8*cur_z
get_scx(t)
if side >= 2 then
 if t.m then mm = not mm end
end
--center sprite
t.scx -= flr((t.w-8)/2)
--draw
sspr(t.ix+t.f*t.w,t.iy,t.w,t.h,t.scx,zz,t.w,t.h,mm,false)
end

function add_cloud()
local a={
x = rnd(512)-256,
w = 16+rnd(24),
h = 4+rnd(7),
upd = function(a)
 a.x -= 1/8
 if a.x < -256 then
  a.x += 512
 end
end,
draw = function(a)
 local xx = flr(a.x)
 local yy = cloud_y[aplus]+1
 rectfill(xx,yy,xx+a.w,yy+a.h,cldcolor[aplus])
 rect(xx+1,yy+a.h+1,xx+a.w-1,yy+a.h+1)
 rect(xx-1,yy,xx+a.w+1,yy)
end
}
add(a_sky,a)
end

function sky_shift(a)
--move cloud while rotating
local dx = r_dir*128/10
a.x -= dx
if a.x < -256 then
 a.x += 512
elseif a.x >= 256 then
 a.x -= 512
end
end

function dotsort_clear()
--reset depth sorting
dotsort = {}
for i=1,32 do
 add(dotsort,{})
end
end

function add_dv(i)
--dot vertice
local a={
id = i,
ox = 2*dvx[i]-1,
oy = 2*dvy[i]-1,
oz = 2*dvz[i]-1, --depth
ow = 2*dvw[i]-1, --scale
x = 0,
y = 0,
z = 0,
w = 0,
c = dcolor[i] --edge colors
}
add(dot,a)
end

function calc_dv(v)
--calculate vertice position
local nx,ny,nz,nw = v.ox,v.oy,v.oz,v.ow
--1. yz rotate
local axyz = d_axy/d_amax
local acos,asin,ty,tz = cos(axyz),sin(axyz),ny,nz
ny,nz = ty*acos+tz*asin,-ty*asin+tz*acos
--2. xy rotate
local tx = nx
ty = ny
nx,ny = tx*acos+ty*asin,-tx*asin+ty*acos
--3. yw rotate
local ayw,tw = -axyz,nw--d_ayw/d_amax
acos,asin,ty = ny,cos(ayw),sin(ayw)
ny,nw = ty*acos+tw*asin,-ty*asin+tw*acos
--4. apply
v.x,v.y,v.z,v.w = nx,ny,nz,nw
end

function sort_dv(v)
local depth = flr(v.y*4+v.w)+16
add(dotsort[depth],v)
end

function dot_line(v1,v2,c)
line(d_x+(d_f+v1.w)*(v1.x/(3+v1.y)),d_y+(d_f+v1.w)*(v1.z/(3+v1.y)),d_x+(d_f+v2.w)*(v2.x/(3+v2.y)),d_y+(d_f+v2.w)*(v2.z/(3+v2.y)),c)
end

function draw_dv(v)
local id,cc = v.id,v.c
dot_line(v,dot[dv1[id]],cc[1])
dot_line(v,dot[dv2[id]],cc[2])
dot_line(v,dot[dv3[id]],cc[3])
dot_line(v,dot[dv4[id]],cc[4])
end

function draw_dot()
--every line drawn twice
if happy <= 0 and d_f > 0 then
 --1. reset sorting
 dotsort_clear()
 --2. depth sort
 foreach(dot,sort_dv)
 --3. iterate though depths
 if skycolor[aplus] == 12 then
  pal(12,11)
 end
 for i=#dotsort,1,n1 do
  --4. iterate through vertices
  local sortbin = dotsort[i]
  foreach(sortbin,draw_dv)
 end
 pal()
end
end
-->8
--main
function from_real(n)
return flr(n/8)
end

function incmod(n,m)
return (n+1)%m
end

function use()
if btn(3) and intro >= 85 and p_usewait <= 0 then
 p_usewait = 5
 return true
else
 return false
end
end

function listcomp(l1,l2)
local same = true
for i=1,#l1 do
 if l1[i] != l2[i] then
  same = false
 end
end
return same
end

function sc(str)
local str2 = ""
for i=1,#str do
 local ch = sub(str,i,i)
 local cc = 26
 if ch == "/" then
  cc += 1
 elseif ch != " " then
  cc = chars[ch]
 end
 cc = 1+(cc+co)%(2*co)
 str2 = str2..sub(chars2,cc,cc)
end
return str2
end

function load_map(a)
mstore(aplus)
area,aplus,a_sky = a,a+1,{}
tiles = atiles[aplus]
for i=1,16 do
 add_cloud()
end
reset_input()
if area == 5 then
 menuitem(1,itname,activate)
else
 menuitem(1)
end
supdate()
pgetpos()
end

function rotate()
r_wait += 1
if r_wait == 5 then
 side = (side+4+r_dir)%4
 supdate()
 if not title then
  p_open = false
  p_floor = find_floor(p_z)
 end
end
foreach(a_sky,sky_shift)
end

function pzmove()
pgetpos()
--vertical movement
p_floor = find_floor(p_z)
-- if in the air
if not p_floor or p_dz > 0 then
 p_landed = false
end
-- if falling
if p_dz <= 0 then
 -- if floor approaching
 if p_floor then
  local znext = from_real(p_zreal+flr(p_dz/3))
  if znext < p_z then
   --land
   p_zreal = p_z*8
   if p_zreal%8 == 0 and not p_landed then
    p_landed,p_lwait,p_dz,p_coyote = true,3,0,p_coyotemax
    sfx(23)
   end
  end
 end
end
--jump/drop if landed
if intro >= 85 and talkline == 0 and (p_landed or p_coyote > 0) then
 if p_lwait <= 0 then
  --drop down
  if btn(3) and p_usewait <= 0 then
   p_dropwait += 1
  else
   p_dropwait = 0
  end
  --execute jump/drop
  if btn(2) or p_dropwait >= p_dwaitmax then
   if p_dropwait >= 5 then
    p_dz = -2
   else
    p_dz = p_jump
    sfx(8)
   end
   p_dropwait,p_floor,p_landed,p_coyote = 0,false,false,0
  else p_dz = 0
  end
 end
end
--gravity/coyote time
if not p_landed and p_dz > p_maxfall then
 if p_coyote > 0 then
  p_coyote -= 1
 else
  p_dz -= 1
 end
end
--save last safe position
if p_coyote >= p_coyotemax then
 savelast()
end
--update position
p_zreal += flr(p_dz/3)
--respawn
if p_zreal < 0 then
 if p_reswait <= 0 then
    sfx(9)
    p_reswait = 30
 else
    p_reswait -= 1
    if p_reswait <= 0 then
       p_xreal,p_yreal,p_zreal,side,p_open,p_landed,p_dz,p_coyote = p_xlast,p_ylast,p_zlast,p_slast,p_olast,true,0,p_coyotemax
    end
 end
end
end

function move_player()
--actions
if p_lwait > 0 then p_lwait -= 1 end
if intro >= 85 then
 --rotate right
 if btn(5) and p_landed then
  r_dir,r_wait = n1,0
  sfx(11)
 --rotate left
 elseif btn(4) and p_landed then
  r_dir,r_wait = 1,0
  sfx(10)
 else
  --move
  local dp = 0
  if btn(0) then dp -= 1 end
  if btn(1) then dp += 1 end
  if dp < 0 then p_mir = true
  elseif dp > 0 then p_mir = false end
  p_dpos = dp
  if sfront then
   p_xreal += p_dpos
  elseif sleft then
   p_yreal += p_dpos
  elseif sback then
   p_xreal -= p_dpos
  elseif sright then
   p_yreal -= p_dpos
  end
 end
end
--animate
if p_dpos == 0 then
 if p_still == 0 then
  p_frame = 0
 elseif p_still > 200 then
  p_frame += 1
  if p_frame > 5 then
   p_still,p_frame = 0,0
  end
 end
 p_still += 1
else
 if p_still > 0 then
  p_still,p_frame = 0,0
 end
 p_frame = incmod(p_frame,24)
end
pzmove()
end

function find_floor(layer)
local tile,minpos,maxpos,floors,walls = 0,1,8,{},{}
--min/maxpos are min/max player coord
--if outside map, don't collide
if not ismid(layer,1,12) then
 --if falling in front, move to front
 if (sfront and p_y >= 8) or (sleft and p_x <= 1) or (sback and p_y <= 1) or (sright and p_y >= 12) then
  p_open = true
 end
 return false
--front view
elseif sfront then
 if ismid(p_x,0,11) then
  local ppos,xlr = 8-p_y,p_x+12*area
  --1. grab spritesheet columns
  for i=0,7 do
   local ylr = 8*layer-i
   add(floors,sget(xlr,ylr+31))
   add(walls,sget(xlr,ylr+39))
  end
  --2. locate front wall
  -- (skip if at front)
  if not p_open and ppos > 1 then
   for i=ppos-1,1,n1 do
    tile = walls[i]
    if tile > 0 then
     minpos = i+1
     p_open = false
     break
    end
   end
   --if no walls hit
   if minpos <= 1 then
    p_open = true
   end
  else
  --already at front
   p_open = true
  end
  --3. find back wall
  if p_open then
   for i=1,8 do
    tile = walls[i]
    if tile > 0 then
     maxpos = i
     break
    end
   end
  end
  --4. find nearest floor to camera
  for i=minpos,maxpos do
   tile = floors[i]
   if ismid(tile,1,9) then
    p_yreal = (8-i)*8+4
    return true
   end
  end
  --5. if no floor, jump to front
  p_yreal = (8-minpos)*8+4
  --(then go to eof)
 else
  --if off side of map, exposed
  p_open = true
 end
--left view
elseif sleft then
 if ismid(p_y,0,7) then
  maxpos = 12
  local ppos,ylr = p_x+1,p_y+8*layer
  --1. grab spritesheet rows
  for i=0,11 do
   local xlr = i+12*area
   add(floors,sget(xlr,ylr+24))
   add(walls,sget(xlr,ylr+32))
  end
  --2. locate front wall
  -- (skip if at front)
  if not p_open and ppos > 1 then
   for i=ppos-1,1,n1 do
    tile = walls[i]
    if tile > 0 then
     minpos = i+1
     p_open = false
    break
    end
   end
   --if no walls hit
   if minpos <= 1 then
    p_open = true
   end
  else
  --already at front
   p_open = true
  end
  --3. find back wall
  if p_open then
   for i=1,12 do
    tile = walls[i]
    if tile > 0 then
     maxpos = i
     break
    end
   end
  end
  --4. find nearest floor
  for i=minpos,maxpos do
   tile = floors[i]
   if tile > 0 and tile <= 9 then
    p_xreal = i*8-4
    return true
   end
  end
  --5. if no floor, jump to front
  p_xreal = minpos*8-4
  --(then go to eof)
 else
  --if off side of map, exposed
  p_open = true
 end
--back view
elseif sback then
 if ismid(p_x,0,11) then
  local ppos,xlr = p_y+1,p_x+12*area
  --1. grab spritesheet columns
  for i=0,7 do
   local ylr = i+8*layer
   add(floors,sget(xlr,ylr+24))
   add(walls,sget(xlr,ylr+32))
  end
  --2. locate front wall
  -- (skip if at front)
  if not p_open and ppos > 1 then
   for i=ppos-1,1,n1 do
    tile = walls[i]
    if tile > 0 then
     minpos = i+1
     p_open = false
     break
    end
   end
   --if no walls hit
   if minpos <= 1 then
    p_open = true
   end
  else
   --already at front
   p_open = true   
  end
  --3. find back wall
  if p_open then
   for i=1,8 do
    tile = walls[i]
    if tile > 0 then
     maxpos = i
     break
    end
   end
  end
  --4. find nearest floor to camera
  for i=minpos,maxpos do
   tile = floors[i]
   if ismid(tile,1,9) then
    p_yreal = i*8-4
    return true
   end
  end
  --5. if no floor, jump to front
  p_yreal = minpos*8-4
  --(then go to eof)
 else
  --if off side of map, exposed
  p_open = true
 end
 --right view
 elseif sright then
  if ismid(p_y,0,7) then 
   maxpos = 12
   local ppos,ylr = 12-p_x,p_y+8*layer
   --1. grab spritesheet rows
   for i=0,11 do
    local xlr = 12*area+11-i
    add(floors,sget(xlr,ylr+24))
    add(walls,sget(xlr,ylr+32))
   end
   --2. locate front wall
   -- (skip if at front)
   if not p_open and ppos > 1 then
    for i=ppos-1,1,n1 do
     tile = walls[i]
     if tile > 0 then
      minpos = i+1
      p_open = false
      break
     end
    end
    --if no walls hit
    if minpos <= 1 then
     p_open = true
    end
   else
   --already at front
    p_open = true
   end
   --3. find back wall
   if p_open then
    for i=1,12 do
     tile = walls[i]
     if tile > 0 then
      maxpos = i
      break
     end
    end
   end
  --4. find nearest floor to camera
  for i=minpos,maxpos do
   tile = floors[i]
   if ismid(tile,1,9) then
    p_xreal = (12-i)*8+4
    return true
   end
  end
  --5. if no floor, jump to front
  p_xreal = (12-minpos)*8+4
  --(then go to eof)
 else
 --if off side of map, exposed
  p_open = true
 end
end
return false
end

function mstore(a)
atiles[a] = tiles
tiles = {}
end

function _init()
supdate()
nsh,co = ssplit("iodbnuofs,pgffsdtzwse, aa/mhwsi,s/fsdnfvsnbogesn s/g,fvsneywsenapesdhsngemfaa,fvsmqvo psdmatmfvs,tslmiszqa semkagmm,fvjmtadmbzokw/u, orsmpkmxgewhmm,s/r"),14
for i=1,16 do
 add_dv(i)
end
foreach(dot,calc_dv)
for i=1,#nsh do
 local s = sc(nsh[i])
 nsh[i] = s
end

-- Args1: (Level coords) sx,sy (World Coords) rx,ry,rz (Sprite) ix,iy (size?) w,h (m??) boolean
-- Args2: t.wd,t.lk,t.lw=20
-- Args3: Door destination: music,side,p_xreal,p_yreal,p_zreal
add_door("22,69,-4,4,0,96,80,16,16,0","3,4,0","0,0,48,60,16")
add_door("18,68,4,-4,0,96,80,16,16,0","1,4,1","6,0,48,60,8")
add_door("20,70,0,0,0,96,112,8,16,0","0,0,0","2,0,44,52,8")
add_nuish("13,57","1,1,1,1",2)
add_obelisk("17,110,0,0,0,96,96,8,16,0","4,2,4,1,3,5")
add_bit("20,59,0,0,0",2)
add_bfly("14,64,50,0,0,104,11,3,5,1")
add_bfly("12,80,20,0,0,104,11,3,5,1")
add_bfly("12,90,40,0,0,104,11,3,5,1")
add_tile("20,83,1,-1,0,1,8,8,8,1")
add_tile("21,84,-1,1,0,7,8,8,8,1")
mstore(2)
add_door("29,53,0,0,0,96,112,8,16,0","0,0,0","1,0,68,52,24")
add_door("29,50,0,0,0,96,112,8,16,0","2,0,0","3,0,76,36,8")
add_door("33,103,0,0,0,96,112,8,16,0","0,0,0","4,1,28,32,16")
add_door("25,97,0,0,0,96,112,8,16,0","0,0,0","5,0,52,44,8")
add_obelisk("0,0,0,0,0,96,96,8,16,0","1,2,3,0,3,2")
add_bit("34,119,4,-4,0",3)
add_bit("24,124,-4,4,0",4)
add_nuish("26,113","1,1,1,1",3)
add_nuish("32,118","1,1,1,1",3)
mstore(3)
add_door("45,51,0,0,0,96,112,8,16,0","0,0,0","2,2,44,12,8")
add_obelisk("44,115,0,0,0,96,96,8,16,0","5,5,2,0,1,4")
add_bit("46,113,4,-4,0",5)
add_bit("39,127,0,0,0",6)
add_nuish("47,35","0,0,0,1",5)
add_tile("46,81,1,-1,-8,112,88,10,16,1")
add_tile("47,82,-1,1,-8,118,88,10,16,1")
mstore(4)
add_door("52,59,4,-4,0,96,80,16,16,0","1,4,0","2,0,76,60,56")
add_fork(tmake("53,124,4,4,-8,104,96,8,16,0"),"4,4,5,4,5,5")
add_bit("49,127,4,-4,0",7)
add_tile("48,46,1,-1,0,1,8,8,8,1")
add_tile("49,47,-1,1,0,7,8,8,8,1")
add_tile("58,40,1,-1,0,1,8,8,8,1")
add_tile("59,41,-1,1,0,7,8,8,8,1")
mstore(5)
add_door("66,52,0,0,0,96,112,8,16,0","0,0,0","2,0,12,12,56")
add_bit("71,112,4,0,0",8)
add_nuish("65,100","1,0,0,0",4)
add_nuish("67,98","0,0,1,0",4)
mstore(6)
add_door("77,54,4,4,0,96,80,16,16,0","0,4,0","1,1,44,40,24")
add_door("78,49,-4,-4,0,96,80,16,16,0","2,4,4","7,2,48,12,48")
add_item("77,123,4,-4,-4,88,8,8,8,0",9)
mstore(7)
add_door("90,90,-4,-4,0,96,80,16,16,0","2,4,0","6,2,48,4,8")
add_item("88,124,4,5,-1,96,8,8,8,1",10)
add_nuish("84,32","1,1,1,1",6)
add_nuish("95,39","1,1,1,1",7)
mstore(8)
add_door("5,61,4,4,0,96,80,16,16,0","0,4,0","1,3,92,40,24")
add_nuish("6,50","0,0,1,0",1)
add_bit("9,56,0,0,0",1)
load_map(0)
poke(0x5f41,0b1000)
music(4)
end

function activate()
if not active[aplus] then
 active[aplus] = true
 if area == 1 then
  add_item("20,123,4,-4,-4,99,64,11,16,0",12)
 elseif area == 2 then
  add_item("29,75,0,-4,-4,99,64,11,16,0",11)
 elseif area == 3 then
  add_fadeblock("39,111,0,0,0,32,0,8,8,0")
  add_fadeblock("41,101,0,0,0,32,0,8,8,0")
 elseif area == 4 then
  add_item("53,83,4,-4,-4,99,64,11,16,0",13)
 elseif area == 5 then
  add_item("66,83,0,0,0,99,64,11,16,0",14)
 end
 sfx(14)
end
end

function starttalk(n)
if not istalk() then
 talklines,talkline,talkchar,d_show = talk[n],1,1,true
end
end

function istalk()
return talkline > 0
end

function ismid(v,mn,mx)
return mid(v,mn,mx) == v
end

function _update()
if rrr > 0 then
 rrr -= 1
 if rrr == 295 then
  sfx(15) --thx jwinslow23
 elseif rrr == 300 then
  sfx(n1,0)
 elseif rrr == 0 or rrr > 300 then
  sfx(13,0)
 end
 return
end
idle = incmod(idle,maxidle)
if ending > 0 then
 if ending == 1 then
  p_xreal,p_yreal = 48,32
  p_zreal += sgn(69-p_zreal)/4
  if p_zreal >= 69 then
   ending = 2
  end
 elseif ending == 2 then
  title_idle += 1
  if title_idle > 100 then
   ending = 3
  end
 elseif ending == 3 then
  if atrans < 40 then
   atrans += 1
  elseif rel2 then
   ending = 4
  end
 elseif atrans > 0 then
  atrans -= 1
  if atrans == 5 then
     sfx(13)
  end
 end
 return
end
--record input
if lkeywait > 0 then
 lkeywait -= 1
 if lkeywait <= 0 then
  lastkey = 6
 end
end
local istart = 0
if area == 4 then
 istart = 4
end
for i=istart,5 do
 local hit = keys[i]
 if btn(i) then
  if not hit then
   keys[i],lastkey,lkeywait = true,i,35
   add(input,i)
   del(input,input[1])
  end
 elseif hit then
  keys[i] = false
 end
end
--update player interaction
p_canuse = false
if p_usewait > 0 and atrans <= 0 then
 p_usewait -= 1
end
--player transition effect
if p_open then
 if p_otrans > 0 then p_otrans -= 1 end
elseif p_otrans < p_otransmax then
 p_otrans += 1
end
--title
if title then
 if title_y > 0 then
  title_y += 6
  if side > 0 and r_wait >= 10 then r_wait = 0 end
  if title_y >= 150 then
   title = false
  end
 else
  title_idle += 1
  if title_idle >= 100 then
   r_wait,title_idle = 0,0
  end
  if btn() != 0x0000 then
   title_y = 6
   music(n1,1000)
   sfx(22)
  end
 end
 if r_wait < 10 then rotate() end
--gameplay
else
 if r_wait < 10 then rotate()
 elseif achange or atrans > 0 then
  --area change
  if achange then
   atrans += 1
   if atrans >= atmax then
    side,p_xreal,p_yreal,p_zreal,achange = anext[2],anext[3],anext[4],anext[5],false
    savelast()
    local an = anext[1]
    if an >= 4 then
     if an == 6 then
      music(4,1000)
     elseif an == 4 then
      music(n1,1000)
     else
      music(0,1000)
     end
    elseif area >= 4 then
     music(13,1000)
    end
    load_map(an)
   end
  else
   atrans -= 1
  end
 elseif happy > 0 then
  happy -= 1
 elseif istalk() then
  if p_landed then
   --dialogue
   local tl = talklines[talkline]
   if talkchar < #tl then
    if talkchar%3 == 0 then
     sfx(17+flr(rnd(3)))
    end
    talkchar += 1
    if talkchar >= #tl then
     p_useidle = 0
    end
   else
    p_useidle = incmod(p_useidle,120)
    if use() then
     talkchar = 1
     talkline += 1
     if talkline > #talklines then
      talkline,p_usewait = 0,20
      if intro < 86 then
       music(13)
       intro = 86
      end
     end
    end
   end
  else
   pzmove()
  end
 else
  if area == 0 and active[1] and pwait < 15 then
   pwait += 1
  end
  --gameplay
  if intro < 85 then
   intro += 1
   if intro == 15 then
    p_otrans = p_otransmax
    sfx(16)
   elseif intro == 85 then
    starttalk(1)
   end
  end
  if intro >= 15 then
   move_player()
  end
  -- dot
  pgetpos()
  if area == 0 then
   if p_z == 7 and (ismid(p_x,5,6) or ismid(p_y,3,4))then
    if intro >= 85 then
     p_canuse = true
    end
    if active[1] then
     if use() then
      ending,title_idle = 1,0
      music(n1,250)
      sfx(12)
     end
    else
     if intro >= 85 then
      d_show = true
      if use() then
       starttalk(1)
      end
     end
    end
   else
    d_show = false
   end
  end
 end
end
--tiles/actors
if r_wait >= 10 then
 foreach(tiles,function(a) a:upd() end)
end
foreach(a_sky,function(a) a:upd() end)
--use prompt
if istalk() then
 p_dropwait = 0
else
 if p_canuse then
  if p_usewait <= 0 then
   p_useidle = incmod(p_useidle,120)
  end
 else
  p_useidle = 0
  if area > 0 then
   d_show = false
  end
 end
end
--dot
if d_show and not d_shrink then
 if sfront then
  d_rx = 16+p_xreal
 elseif sleft then
  d_rx = 32+p_yreal
 elseif sback then
  d_rx = 112-p_xreal
 elseif sright then
  d_rx = 96-p_yreal
 end
 d_x = d_rx-2.5*sin(d_idle/d_imax)
 d_ry = 104-p_zreal
 d_y = d_ry+2*sin(2*d_idle/d_imax)
 if d_f < d_fmax and p_landed and happy <= 0 then
  d_f += 2
 end
else
 if d_f > 0 then
  d_f -= 2
  d_shrink = true
 else
  d_rx = -4
  d_ry = d_rx
  d_x = d_rx
  d_y = d_ry
  d_shrink = false
 end
end
d_idle = incmod(d_idle,d_imax)
d_axy = (d_axy+d_da)%d_amax
foreach(dot,calc_dv)
end
-->8
--text
function draw_speech()
local str,xoff,mm = talklines[talkline],p_xreal-47,false
local x1,y1 = 63-2*#str,max(1,d_ry-22)
local x2,y2 = x1+4*#str,y1+10
if sleft then
 xoff = p_yreal-31
elseif sback then
 xoff = 49-p_xreal  
elseif sright then
 xoff = 32-p_yreal
end
rectfill(x1-1,y1,x2+1,y2,0)
rect(x1-2,y1+1,x2+2,y2-1)
sspr(108,8,4,4,max(x1+1,d_x-13-xoff),y2+1)
print(sub(str,1,talkchar),x1+1,y1+3,7)
if talkchar >= #str and p_useidle%60 >= 30 then
 spr(15,x2-3,y2-1)
end
end

function draw_nuish(n,x,y)
--1. size
local str,cols,rows,mrows = nsh[n],1,0,0
for i=1,#str do
 local ch = sub(str,i,i)
 if ch == "/" then
  cols += 1
  rows = 0
 else
  rows += 1
  if mrows < rows then
   mrows = rows
  end
 end
end
--2. back
rows = mrows*5
cols = cols*5
local ww,hh = 8*ceil((cols+3)/8),8*ceil((rows+3)/8) 
local x2,y1,y2 = x+ww-1,y-hh-1,y-2
rectfill(x,y1,x2,y2,15)
rect(x+1,y1,x2,y1,7)
rect(x2,y1,x2,y2-1)
rect(x,y1+1,x,y2,6)
rect(x,y2,x2-2,y2)
--3. text
local xx,ytop = x2-4-flr((ww-cols-1)/2),y1+1+flr((hh-rows-1)/2)
local yy = ytop
for i=1,#str do
 local ch = sub(str,i,i)
 if ch == "/" then
  xx -= 5
  yy = ytop
 else
  if ch != " " then
   local cid = chars[ch]
   sspr(96+4*flr(cid/8),32+4*(cid%8),4,4,xx,yy)
  end
  yy += 5
 end
end
end
-->8
--draw
function square(x,y,c)
rect(x+3,y+6,x+4,y+7,c)
end

function blackpal()
for i=2,15 do
 pal(i,0)
end
end

function hornet()
pal(10,0)
end

function raid()
pal(10,10)
end

function pal_hidden()
local val = p_otrans
if val == 0 then
 val = min(4,1+flr(atrans/3))
end
for i=1,15 do
 pal(i,p_otcolors[val])
end
end

function draw_player(front)
if p_otrans > 0 or atrans > 0 then
 pal_hidden()
end
local sp = 48+p_frame/2
if happy > 0 then sp = 59
elseif p_dz > 0 or istalk() then sp = 60
elseif p_floor == false then sp = 61
elseif p_dpos != 0 then sp = 51+p_frame/3
end
draw_player_feet(front,sp)
draw_player_head(front,sp-16)
pal()
end

function draw_player_feet(front,sp)
if front or (p_x == cur_x and p_y == cur_y and p_z == cur_z) then
 local zz,xx = 120-p_zreal,12+p_xreal+r_factor*(p_yreal/8-4)
 if sleft then
  xx = 28+p_yreal-r_factor*(p_xreal/8-6)
 elseif sback then
  xx = 108-p_xreal-r_factor*(p_yreal/8-4)
 elseif sright then
  xx = 92-p_yreal+r_factor*(p_xreal/8-6)
 end
 spr(sp,xx,zz,1,1,p_mir,false)
end
end

function draw_player_head(front,sp)
if front or (p_x == cur_x and p_y == cur_y and p_z+1 == cur_z) then
 local zz,xx = 112-p_zreal,12+p_xreal+r_factor*(p_yreal/8-4)
 if p_usewait <= 0 and
  not istalk() and
  (p_lwait > 0 or p_dropwait > 0) then
  zz += 1
 end
 if sleft then
  xx = 28+p_yreal-r_factor*(p_xreal/8-6)
 elseif sback then
  xx = 108-p_xreal-r_factor*(p_yreal/8-4)
 elseif sright then
  xx = 92-p_yreal+r_factor*(p_xreal/8-6)
 end
 sspr(8*flr(sp-32),16,8,10,xx,zz,8,10,p_mir,false)
 end
end

function draw_front()
local p = 0
for yy=0,7 do
 cur_y = yy
 for xx=0,11 do    
  cur_x,cur_sx = xx,xx+12*area
  for zz=0,11 do
   cur_z = 11-zz
   cur_sy = yy+8*cur_z+32
   p = sget(cur_sx,cur_sy)
   if p == 15 then
    foreach(tiles,function(t) t:draw() end)
   elseif p > 0 then
    spr(p,16+8*xx+r_factor*(yy-4),120-8*cur_z)
   end
  end
 end
end
end

function draw_left()
local p = 0
for xx=0,11 do
 cur_x,cur_sx = xx,11-xx+12*area
 for yy=0,7 do
  cur_y = yy
  for zz=0,11 do
   cur_z = 11-zz
   cur_sy = yy+8*cur_z+32
   p = sget(cur_sx,cur_sy)
   if p == 15 then
    foreach(tiles,function(t) t:draw() end)
   elseif p > 0 then
    spr(p,32+8*yy+r_factor*(xx-6),120-8*cur_z)
   end
  end
 end
end
end

function draw_back()
local p = 0
for yy=0,7 do
 cur_y = yy
 for xx=0,11 do
  cur_x,cur_sx = xx,11-xx+12*area
  for zz=0,11 do
   cur_z = 11-zz
   cur_sy = 7-yy+8*cur_z+32
   p = sget(cur_sx,cur_sy)
   if p == 15 then
    foreach(tiles,function(t) t:draw() end)
   elseif p > 0 then
    spr(p,16+8*xx+r_factor*(yy-4),120-8*cur_z)
   end
  end
 end
end
end

function draw_right()
local p = 0
for xx=0,11 do
 cur_x,cur_sx = xx,xx+12*area
 for yy=0,7 do
  cur_y = yy
  for zz=0,11 do
   cur_z = 11-zz
   cur_sy = 7-yy+8*cur_z+32
   p = sget(cur_sx,cur_sy)
   if p == 15 then
    foreach(tiles,function(t) t:draw() end)
   elseif p > 0 then
    spr(p,32+8*yy+r_factor*(xx-6),120-8*cur_z)
   end
  end
 end
end
end

function r_trans()
local pos = (r_wait-5)*40*r_dir
rectfill(pos+15,0,pos+112,127,transcolor[aplus])
fillp(0b1011111111101111.1)
rectfill(pos,0,pos+127,127)
fillp(0b1010010110100101.1)
rectfill(pos+5,0,pos+122,127)
fillp(0b0000010000000001.1)
rectfill(pos+10,0,pos+117,127)
fillp()
end

function draw_title()
--borders
rectfill(0,-title_y,127,23-title_y,1)
rectfill(0,104-title_y,127,127-title_y)
rectfill(0,24-title_y,14,109-title_y)
rectfill(111,24-title_y,127,109-title_y)
fillp(0b0000010000000001.1)
rectfill(0,128-title_y,127,133-title_y)
fillp(0b1010010110100101.1)
rectfill(0,134-title_y,127,138-title_y)
fillp(0b1011111111101111.1)
rectfill(0,139-title_y,127,143-title_y)
fillp()
--logo
map(0,0,15,24-title_y,12,10)
rect(30,83-title_y,30,87-title_y)
rect(38,73-title_y,38,78-title_y)
pset(40,64-title_y)
rect(62,72-title_y,62,76-title_y)
pset(72,72-title_y)
pset(101,39-title_y)
pset(104,56-title_y)
pset(104,32-title_y)
rect(31,88-title_y,31,99-title_y,7)
rect(39,72-title_y,39,79-title_y)
pset(39,55-title_y)
pset(55,47-title_y)
pset(71,39-title_y)
rect(79,72-title_y,79,75-title_y)
pset(103,23-title_y)
rect(111,27-title_y,111,43-title_y)
rect(111,51-title_y,111,59-title_y)
if title_y == 0 then
 print("press any key",76,122,0)
end
end

function spr_outline(sp,y)
blackpal()
spr(sp,117,y)
spr(sp,119,y)
spr(sp,118,y-1)
spr(sp,118,y+1)
pal()
spr(sp,118,y)
end

function drrr()
if rrr >= 300 then
 for i=0,15 do
  for j=0,15 do
   spr(165,8*i,8*j)
  end
 end
else
 cls()
 if rrr < 295 then
  sspr(16,11,30,5,1,5)
  sspr(3,34,5,5,31,1)
 end
 if rrr < 290 then
  print("pico-8 0.1.12x",0,18,6)
 end
 if rrr < 285 then
  print("(c) 2014-xx lexaloffle games llp",0,24)
  print("type help for help",0,36)
 end
 if rrr < 280 then
  local pp = mid(7-flr((rrr+60)/40),2,5)
  print(sub("> run",1,pp),0,48,7)
  if flr(rrr/8)%2 >= 1 then
   rectfill(4*pp,48,4*pp+3,52,8)
  end
 end
end
end

function bns()
cls(13) 
if rel3 then
 for i=1,32 do
  local aa = -0.5*idle/maxidle+i/32
  print("�",61+54*cos(aa),63+54*sin(aa),14)
 end
end
for i=0,5 do
 local aa = idle/maxidle+i/5
 for j=1,10 do
  local sf = j*9
  circfill(64+sf*cos(aa),64+sf*sin(aa),sf/3,14)
 end
end
circfill(64,64,22)
draw_nuish(9,16,104)
draw_nuish(8,104,104)
sspr(88,16,8,16,48,32+2.5*sin(2*idle/maxidle),32,64)
end

function _draw()
--draw world
local pzr = 120-p_zreal
cls(skycolor[aplus])
local rff = -32*r_wait*r_dir
if ismid(r_wait,5,10) then
 rff = 32*(10-r_wait)*r_dir
end
if area == 2 then
 local x1 = 53
 if r_wait < 10 then
  x1 += rff
 end
 rectfill(x1,5,x1+19,24,7)
 rectfill(x1+1,6,x1+11,16,6)
end
rectfill(0,0,127,cloud_y[aplus],cldcolor[aplus])
local cxx = p_xreal-47
if ismid(intro,36,44) then
 cxx += (rnd(2)-1)*4
 camera(cxx,0)
end
foreach(a_sky,function(a) a:draw() end)
if area == 3 then
 for xx=0,3 do
  for yy=0,3 do
   local x1,y1 = 44+12*xx,2+12*yy
   if r_wait < 10 then
    x1 += rff
   end
   if sget(111-yy,40+xx+4*lastkey) != 0 then
     rect(x1,y1,x1+12,y1+12,13)
   end
   pset(x1,y1,7)
  end
 end
end
hornet()
if sleft then
 cxx = p_yreal-31
elseif sback then
 cxx = 49-p_xreal
elseif sright then
 cxx = 33-p_yreal
end
camera(cxx,0)
if r_wait < 5 then r_factor = r_wait*r_dir/2
elseif r_wait < 10 then r_factor = (r_wait-10)*r_dir/2
else r_factor = 0
end
if area == 0 then
 local mx,xp,yp = 17,44,24
 if active[1] or intro < 40 then
  mx,xp = 12,48
  if pwait >= 15 or flr(pwait/2)%3 >= 2 or intro < 25 or flr(intro/3)%3 == 0 then
   rectfill(54,yp+14,73,yp+33,0)
  end
 else
  yp += 1.5*cos(idle/maxidle)
 end
 map(mx,0,xp,yp,5,5)
end
if sfront then draw_front()
elseif sleft then draw_left()
elseif sback then draw_back()
else draw_right()
end
if ending == 0 and intro >= 15 then
 draw_player(true)
end
pal()
foreach(tiles,function(a) a:fdraw() end)
draw_dot()
--draw front layer
camera()
if r_wait < 10 then r_trans() end
local ypos,bts,cbs,hp = 2,bits,cubes,happy>15
if hp and item == 0 then bts -= 1 end
if bts >= 8 then
 spr_outline(26,ypos)
 bts = 1
else
 rect(120,ypos,126,ypos+6,0)
 rectfill(121,ypos+1,125,ypos+5,10)
end
print(bts,116,ypos+1,0)
if cbs > 0 then
 ypos += 10
 if hp and item >= 3 then cbs -= 1 end
 spr_outline(26,ypos)
 pal(9,13)
 pal(10,12)
 spr(26,118,ypos)
 pal()
 print(cbs,116,ypos+1,0)
end
local yp2 = ypos
if rel1 then
 ypos += 10
 if not (hp and item == 1) then
  spr_outline(27,ypos)
 end
end
local yp3 = ypos
if rel2 then
 ypos += 10
 if not (hp and item == 2) then
  spr_outline(28,ypos)
 end
end
if hp then
 local yp = 2
 if item == 1 then
  yp = yp3
 elseif item == 2 then
  yp = ypos
 elseif item >= 3 then
  yp = yp2
 end
 local hf = (happy-15)/15
 local x1,y1 = 120-60*hf,yp+(pzr-yp-6)*hf
 if ismid(item,1,2) then
  spr(26+item,x1,y1)
 elseif item == 0 then
  rectfill(x1,y1,x1+5,y1+5,10)
 elseif item > 3 then
  sspr(98,64,12,16,x1,y1,6+6*hf,8+8*hf)
 end
end
if ending == 4 then bns()
elseif ending > 0 then
 local zz,xf = 108-p_zreal,7*title_idle/20
 color(6)
 if title_idle >= 20 then
  xf = 24-title_idle
  color(7)
 end
 if xf > 0 then
  rectfill(64-xf,zz-title_idle*3,63+xf,zz+17)
 end
 if ending < 2 or title_idle < 20 then
  spr(44,59,zz,1,2)
 end
end
hornet()
if istalk() and p_landed and happy <= 0 then
 draw_speech()
elseif p_canuse and ending == 0 and atrans <= 0 and p_usewait <= 0 and p_useidle%60 < 30 then
 local py = 106-p_zreal
 spr(15,59,py)
 sspr(104,8,4,2,59,py+6)
end
pal()
if rrr > 0 then drrr() end
if title then draw_title()
elseif atrans > 0 then
 local ff = 64-64*atrans/10
 rectfill(n1,n1,63-ff,128,0)
 rectfill(63+ff,n1,128,128)
 rectfill(n1,n1,128,pzr-2*ff)
 rectfill(n1,pzr+2*ff,128,128)
 if ending == 3 and not rel2 and atrans >= 40 then
  draw_nuish(10,112,120)
 end
end
end
__gfx__
00000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb99999999bbbbbbbbbbbbbbbb9ffffffff7777777d66666665dddddddbbbbbbbb9fffff90
00000000b3b33bb3b33b33bbbbb3bb33b3bb33bbbb3bb33bb33bbbb344444444bbbbbbbbbbbbbbbb4999999f6ffffff72dddddd62555555dbbbbbbbbfffafff0
007007003939933f3993993b3b3f33f73f33ff3333d33dd33dd33b3600055000bbbbbbbbbbbbbbbb4999999f6ffffff72dddddd62555555dbbbbbbbbfaaaaaf0
000770004999999f4999999363fffff76ffffff72dddddd62dddd3d600055000bbbbbbbbbbbbbbbb4999999f6ffffff72dddddd62555555dbbbbbbbbffaaaff0
000770004999999f4999999f6ffffff76ffffff72dddddd62dddddd600022000bbb3bbbbbbbbbbbb4999999f6ffffff72dddddd62555555dbbbbbbbbfffafff0
007007004999999f4999999f6ffffff76ffffff72dddddd62dddddd600022000bbbbbbbbbbb3bbbb4999999f6ffffff72dddddd62555555dbbbbbbbb9fffff90
000000004999999f4999999f6ffffff76ffffff72dddddd62dddddd600022000bbbbbbbbbb3b3bbb4999999f6ffffff72dddddd62555555d33b33bb349999940
000000004444449944444499666666ff666666ff222222dd222222dd00000000bbbbbbbbbbb3bbbb44444499666666ff222222dd222222553333333300000000
004444044440000000000000bb00000000000008880000000000000000000000002dd600002dd60000000a00d6600d6600000000499faaaa7100000171000001
0000040440000000bb0000b0b00d600000088800f00800000000000000000000002dd600002dd6000000aaa02dd002260099888800090aaa7100000171000001
00000444444440000b0b00b0b0d6660d60d0f000f00f000000d6666666666600002dd666666dd600000aaaaa2600002600998888000000aa7100000171000001
00000044444e440007777077770077700777700000777700002dddddddddd600002dddddddddd6000009aaaa260d6026992288880000000a7100000171100001
00000000004e440077077007700770007707700000700700002dddddddddd600002dddddddddd60000099aaa2602d02699228888e90000007100000117711001
00004444444e440077777007700770007707707707777700002dd222222dd600002222222222dd0000009aa0260000260022888899d000d07100000111177111
000444eeeee4400077000007700770007707700007700700002dd600002dd600000000000000000000000a002d666dd600228888dd5099507100000111111771
00044e4ee444000077000077770777707777000007777700002dd600002dd600000000000000000000000000222222dd0000000000009e007100000111111117
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000098000000000000000000007100000171000001
00000000000000000000000000000000009800000000000000000000000000000098000000000000000000000928000000000000000000007100000171000001
00000000000000000000000000980000092800000998000000000000009800000928000009980000000000000000000000000000009000007100000171000001
00980000009800000098000000980000067777700028000000980000009800000677777000280000009800000677777000980000009800007100001171100001
09280000092800000928000006777770677777770677777009280000067777706777777706777770092800006717771709280000002800007100117777711001
06777770067777700677777067777777671777176777777706777770677777776717771767777777067777706771117706777770067777707111771171177111
6777777767777777677777776717771767771177671777176777777767177717677777776717771767777777677e177767177717671777177177111171111771
671777176766766767dd7dd767771777067777706777117767177717677777770677777067777777671777170677777067777777677711777711111171111117
677777776777777767777777067777700006700006777770677771770677777000067000067777706777777700067000677777776777e1771000000111000000
06777770067777700677777000067000007777000006700006777770000670000067770000067000067777700777776006777770067777700000000100000000
00067000000670000006700000777700077777600777776000067000006777000067770000677700000670000077770000067000000670000000000100000000
00777700007777000077770000777700007777000077770000777700007777000076770000767700006777000067770000777700077777600000001100000011
07777760077777600777776007677760007777000067770007777760007677000077777000777700007777000067770007777760007777000000117700001177
00677700006777000067770000777700006067000077770000677700006777600670006006777700006677000060060000677700006777000011771100117711
00677700006777000067770000000700000000000067600000777600007000000000000000000670006777000000000000677700066777601177111111771111
00600600006006000060060000000600000000000006000000600000006000000000000000000060000007000000000000600600000000007711111177111111
00aaaaaaaa00000000000000aa00000000000000000badab000000000021000000000000006565656600f0000000000055555555555555507100000000001177
00aaaaaaaa00000000000000aa00070000000000000bddd000000000001200b07777700000655555560000000000000050005555555555507100000000117711
00a00800aa000000000000000000ccc0000000000000ddd000000000000000007bbb700000555555550000000000000055055555000555557100000011771111
00a097f0aa000000000000000007ccc0000000000004dddf00000000000000007bbb70000065555555000000d00d000055555500505555557100001177111111
00aa777eaa000000000000000007ccc000000000000411db00000000000000007bbb70000055555556000000d00d000055555555505550557100117711111111
00a0b7d0aa000000000000000000ccc000000000000000000000000000000000777770b000655555560000000000000050055000505550057111771111111111
00a00c00aa00000000000000000007000aa000000000000012000000000000000000000000655555550000000000000055055055005550557177111111111111
00aaaaaaaa00000000000000000000000aa000000000000021000000000000000000000000556566560000000000000f55055555555555557711111111111111
004112122b00000000000000bb0000000000000000041dab0000000000f000000000000000070000700000000000000050555555555505000000117711111177
001111111200000000000000bb000070000000000003ddd000000000000f00a000000000000dc00cd00000000000000050005555550505500011771111117711
0021111111000000000000000000c0c0000000000000ddd00000cccc000000000bbb0000000ccddcc0000000cccd000055550005550005501177111111771100
0021111112000000000000000000ddc0000000000000d0d00007cccc700000000bbb00000000dddd00000000cccc000055555055550500007711111177110000
002112111200000000dddc000000ddc000000000000000db0007cccc700000000b0b00000000dddd00000000cccc000055550055555500557111111177711000
001022201100000000dcd0000000c0c000000000000000000000cccc00000000000000a0000ccddcc0000000dccc000055055555555500557111111171177110
002111111200000000000000000000000bb0000000000000f00000000000000000000000000dc00cd00000000000000000055555055500057111111171011771
00b121211b00000000000000000000000bb00000000000000f000000000000000000000000000000000000000000000055555555055500007111111171000117
000000000300000000000000aa0000000000000000000dab0000000000ee07770000000000000000000000000000000055555555555505551111111177711111
000000000000000000000000aa000000000000000000ddd00000000000ee07b700000000000dc0fcd00000000000000055555555550005501111111171177111
0000b0fb00000000000000000000cfc0000000000000ddd00000cddc000007770aaa0000000ccddcc0000000cccd000000555505550500001111111171011771
0000bbbb0000000000cc7cc00000ddc0000000000000dfd000000ddc000000000aaa00000000dddd00000000dccd000055555505550500001111111171000117
0000bbbb0000000007ccccc70000ddc000000000000000db00000ddc000000000afa07770000dddd00000000dccd000055555055555500551111117771001177
0000b00b0000000007ccccc70000cfc000000000000000000000cddc00000000000007b7000ccddcc0000000dccc000055000055550005551111771171117711
000000000000000000cc7cc0000000000aa0000000000000ee0000000000000000000777000dcf0cd00000000000000055555055550500001177110071771101
00b000000b00000000000000000000000aa0000000000000ee000000000000000000000000000000000000000000000055555555550500007711000077110001
000000000f00000000000000bb0000000000000000000d2b00000000009800000000000000000000000000000000000055055055505500501111117717711111
0000000000000f0000000000bb000000000000000000ddd000000000008900b000000000000dccccd00000000000000050005055505500501111771101177111
0000b00b00000000000000000000211000000000000bddd00000cddc0000000004340000000cccccc0000000cccc000055555555500505551177110000011771
0000bbbb0000000000ccfcc00000112000000000000bddd00000fddc0000000004330000000cccccc000000dccccc00055555555555500007711000000000117
0000bbbb00000000000ddd000000212000000000000baaab00000ddc0000000003430000000cccccc000000cccccd00055555555555505551100000000001177
0000bf0b00000000000ddd000000211000000000000000000000cddc00000000000000b0000cccccc0000000cccc000055555505505500500000000000117711
000000000000000000cc0cc0000000000bb0000000000000890000000000000000000000007dccccd70000000000000000055005000500500000000011771101
003000000b00000000700070000000000bb000000000000098000000000000000000000000770000770000000000000055055505555500000000001177110001
00000000000000f000000000bb00000000000000000ba00b00000000000000000000000000000000000000000000000000000000c00000001100000071000000
000000000000000000000000bb00000000000000000badd000000000000000a000000000000dddddd0000000000000000000000ccc0000000000000071000000
0000b00b00000000000000000000000000000000000badd0000065660000000000000000000dddddd0000000cccc0000000000ccccc000000000000071000000
0000bbbb0000000000cc0cc00000000000000000000badd0000056650000000000000000000dddddd0000000cccc000000000cdcccdc00000000001171000011
0000bbbb0000000000fddd000000000000000000000baaab000066660000000000000000000dddddd0000000cccc00000000cccdcdccc0000000117771001177
0000bbbb00000000000dddf00000000000000000000000000000566500000000000000a0000dddddd0000000cccc0000000ccccc2ccccc000011771171117711
000000000000000000ccfcc0000000000bb0000000000000000000000000000000000000000dddddd000000000000000000dcccdcdcccc001177110071771100
000000000400000000000000000000000bb7000000000000000000000000000000000000000000000000000000000000000ddcdcccdccc007711000077110000
000000000000000000000000aa00000000000000000212210000000000000000000000000000000000000000000000000002d2cccccdcd000000117700001177
000000000000000000000000aa000000000000000002111100000000000000b000000000000556656000007777777700000d22dccccddc000011771100117711
0000aaaa0000000000000000000000000000000000011112000000000000000000000000000655556000007007700700000dd2ddccc2cc001177110011771101
0000aaaa000000000122111200000f00000000000002111100000000000000000000000000055555500000700cd007000000d22dccddc0007711000077110001
0000aaaa000000000111111100000000000000000001212200000000000000000000000000055555500000700dc00700000002d2cdcd00001100000011000001
0000aaaa0000000002111111000000000000000000000000000000000000000000000030000655556000007007700700000000dddcc000000000000000000001
00000000000000000aa11212000000000aa00000000000000000000000000000000000000006565660000077777777000000000dcc0000000000000000000001
000000000000000000000000000000000aa000000000000000000000000000000000000000000000000000000000000000000000c00000000000000100000001
000000000000f00000000000bbb700000000000000000000000000000000000000000000000000000000000000000000d6d6d666d666d6d67100117700001177
000665656000000000000000b4b0000000000000000000f00000000000000040000000000000000000000000000000002d2d222d222d2d2d7111771100117711
00055555600000000000000000000000000000000000000f0000000000000000000000000000cddc0000000cc00cd000d6d6aaaaaaaad6d67177110011771101
00065555500000000000f00000000000000000000006c00000000000000000000000000000007dd70000000cccccc0002d2daaaaaaaa2d2d7711000077110001
000555556000000000000f0000000000000000000000600000000000000000000000000000007dd70000000cccccc000d666aaaaaaaad6661100000017711001
0005555550000000000000000000000000000000000000000000000000000000000000000000cddc0000000dccccc0002dd6aaaaaaaa2dd60000000001177111
00065565500000000210000000000000bbb00000000000000000000070000000000000000000000000000000000000002dd6aaaaaaaa2dd60000000000011771
00000000000000000000000000000007b3b0000000000000000000000000000000000000000000000000000000000000222daaaaaaaa222d0000001100000117
000000000000000000000000bab000000000000000000000000000000000000000000000000000000000000000000000d666aaaaaaaad6660004040440040000
000000000000000000000000b0b00000000000000000000000000000000700000000000000000000000000ccc00ccd002dd6aaaaaaaa2dd60004440444440000
000000000000f000000000000000000000000000000000000000000000000000000000000000cddc000000ccc0fccc002dd6aaaaaaaa2dd60000044440000000
00000cc0000000000000ee0000000700000000000000500000000000000000000000000000000dd0000000cccccccc00222daaaaaaaa222d0000000444444400
00000cc0000000000000ee0000000700000000000000000000000000000000000000000000000dd0000000cccccccc00d666aaaaaaaad6660000000044444440
0000000000000000000000000000000000000000000000000000000000004000000000000000cddc000000cccccccc002dd6aaaaaaaa2dd60000000000004440
00000000000000000000000000000000bab000000000000000000000000000000000000000000000000000dccc5ccc002dd6aaaaaaaa2dd60000000000004e40
00000000000000000000000000000000b0b0000000000000000000000000000000000000000000000000000000000000222daaaaaaaa222d0000444444444e40
000000000b00000000000000bab00000000000000000000000000000000000000000000000000000000000000000000000000000d6600d660004444eeeeeee40
000000000000000000000000bfb0000000000000000000ee00000000000000000000000000070000700000cccccccd00d66666602d6002d6000444eeeeeee440
0000000000000000000000000000000000000000000000ee0000000000000000b00fb0000000dddd000000cccccccc002ddddd602d6002d6000444ee44444400
00000000000000000000980000000000000000000000000000000dd000000000bbbbb0000000dddd000000cccccccc002ddddd602d6002d6000444ee44000000
00000000000000000000890000000000000000000000000000000dd000000000bf00b0000000dddd000000cccccccc002ddddd602d6002d60004eeee44000000
0000000000000000000000000000000000000000000000000000000000000000000000000000dddd000000ccdcccdc002ddddd602d6002d60004e4ee44444000
00000000000000000000000000000000bab000000000000000000000000000000000000000077007700000dc7ccc7c002ddddd602d6002d60444e4ee44444000
00b00000000000000000000000000000bfb00000000000000000000000000000000000000000000000000000000000002ddddd602d6002d60404e4ee44004000
000000000400000000000000bbb0000000000000000000000000000000000000000000000000000000000000000000002ddddd602d6002d67100000071111177
000000000000000000000000bbb00000000000000000008900000000000000000000000000000000000000cccccccd002ddddd602d6002d67100000071117711
0000000000000000000000000000000000000000000000980000565500000000b000b00000006566000000cccccccc002ddddd602d6002d67100000071771100
00000000000000000000000000000000000000000000000000006556000000000aaa000000006555000000cccccccc002ddddd602d6002d67100000077110000
0000000000000000000000000000000000000000000000000000655500000000b000b00000005556000000cccccccc002ddddd602dd66dd67100000077711000
00000000000000000000000000000000000000000000000000005656000000000000000000006565000000cccccccc002ddddd602dddddd67100000071177110
00000000000000000f00000000000000bbb000000000000000000000000000000000000000000000000000dccccccc002ddddd60d66666667100000071011771
00b00000000000000000000000000000bbb00000000000000000000000000000000000000000000000000000000000002ddddd602dddddd67100000071000117
00000000000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000aaaaaaaa000000001000000100000001
00000000000000000000000000f0000000000000000000f0000000000000000000000000000000000000000000000000a44aa44a000000000000000100000000
0000000000000000000000000000000000000000000000000000000000000000b000b000000000000000000656655000a44aa44a666666660000000100000000
00000000000000000000000000000000000000000000f00000000cc0000000000aaa000000000dd00000000555555000eeeeeeeedddddddd0000000100000000
00000000000000000000000000000000000000000000000000000cc000000000b000b00000000dd0000000055555600044444444dddddddd0000000100000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000566556000a55aa55a222222220000000100000000
00000000000000000000000000000000f000000000000000000000000000000000000000000000000000000000000000a44aa44a000000001100000100000000
0030000000000000000000000000000000f0000000000000000000000000000000000000000000000000000000000000a44aa44a000000007100000100000011
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a44aa44a002dd6007100000111111111
0000000000000b0000000000000000000000000000000000000000000000000000000000000000000000000000000000a44aa44a002dd6007100000111111111
0000000000000000000000000000000000000000000000000000000000000000b000b000000000000000000000000000a44aa44a002dd6007100000111111111
0000000000000000000000000000000000000000000000000000000000000000bbbbb00000000f000000000000000000eeeeeeee002dd6007110000111111111
000000000000000000000000f0000000000000000000000000000f0000000000b000b0000000000000000000f000000044444444002dd6007771100111111111
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a55aa55a002dd6007117711111111111
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aa5aa55a002dd6007101177111111111
000000000000000000000000000000000000000f000000000f0000000000000000000000000000000000000000000000aaaaaaaa002dd6007100011711111111

__gff__
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
__map__
ffffffffffffffffff6e7e7f000000000016ed00ed1700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
ffffffffffffffff5f8e9eee16eded1700fd000000fd000000000000000000000000000000000000000d0d0d0d000d0d0d0d0000000d0d000d0d0d0d000d0d0d0d000d000d0d000d0d0d0d000d0d0d0d000d0d0d0d000d0d0d0d0000000000000000000000000000000000000000000000000000000005060505060005000600
ffffffffffff5f7f2f8faf2efd0000fd0000000000fd000000000000000000000000000000000000000d0d0000000d0d000d000d0d0d0d000d0d000d000d0d0000000d000d0d000d0d000d000d0d0d0d000d0d0d0d000d0d00000000000000000000000000000000000000000000000000008c8d00000000000000000c000c00
ffffffff5f7f1e1edf8e9f6ffd0000fd00fd00000000000000000000000000000000000000000000000d0d000d000000000d000d0d0d0d000000000d000d0d000d0000000d0d000d00000d000d0d000d00000d0d0d000d0d000d0000000000000000000000000000000000000000000000009c9d00000000060005000c000c00
ff6e7e7f1e1e1e1e1edeef3e18eded19001800eded19000000000000000000000000000000000000000d0d000d000d0d0d0d000d0d0d0d000d0d0d0d000d0d000d000d0d0d0d000d0d000d000d0d000d00000d0d0d000d0d000d0000000000000000000000000000000000000000000000000000000005000c0000000c000c00
5f8e9e3e1e1efe1e2f4e4fff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002c0000000c000c0006000c000c00
1edeefff1edeae3effffffff00000000000000000000000000000000000000000000000000000000000d0d0d0d000d000d0d000d0d0d0d000d000d0d000d0d0d0d000d0d0d0d000d000d0d000d000d0d000d0d0d0d000d000d0d0000000000000000000000000000000000000000000000003c0000000c050c000c000c000c00
1ede5eff1f4e4fffffffffff00000000000000000000000000000000000000000000000000000000000d0d000d000d000d0d000d0d0d0d000d000d0d000d0d000d000d0d0d0d000d000d0d000d000d0d000d0d0d0d0000000d0d00000000000000000000000000000000000000000000000008090000000000000c000c000c00
1e1effffffffffffffffffff00000000000000000000000000000000000000000000000000000000000d00000d000d0d0d0d0000000d0d000d0d0d0d000d00000d000d0d0d0d0000000d0d000d0d0d0d000000000d000d000d0d0000000000000000000000000000000000000000000000000e0e0000060005000c000c000c00
1f2effffffffffffffffffff00000000000000000000000000000000000000000000000000000000000d0d000d000d0d0d0d000d0d0d0d000d0d0d0d000d0d000d000d0d0000000d0d0d0d000d0d0d0d000d0d000d000d0d0d0d000000000000000000000000000000000000000000000000101100000c0000000c000c000c00
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002010202000c0506000c000c050c00
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d000d0d000d0d0d0d000d000d0d0000000000000d0d000d000d0d0d0d000d000d0d000d0d0d0d000d0d0d0d0000000000000000000000000000000000000000000000000a0d000000000c000c00000c0000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d000d0d000d0d0000000d000d0d0000000000000d000000000d0d0d0d000d000d0d000d0d0d0d000d0d000d0000000000000000000000000000000000000000000000000000000005060c000c00000c0000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d00000d000d0d0d0d000d00000d0000000000000d0d0d0d0000000d0d000d0d0d0d0000000d0d000000000d0000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d0d0d0d000d0d0d0d000d0d0d0d0000000000000d0d0d0d000d0d0d0d000d0d0d0d000d0d0d0d000d0d0d0d0000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d000d0d000d0d0d0d000d000d0d0000000000000d0d0d0d000d0d0d0d000d000d0d0000000000000d0d0d0d0000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d0d000d0d0d0d0000000d0d0000000000000d0d0d0d000d0d000d0000000d0d0000000000000d0d0d0d0000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d000d0d00000d0d0d000d000d0d0000000000000000000d000d0d0000000d000d0d00000000000000000d0d0000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d0d0d0d00000d0d0d000d0d0d0d0000000000000d0d000d000d0d000d000d0d0d0d0000000000000d0d0d0d0000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d0d0d0d000d0d0d0d00000000000000000000000d000d0d0000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d0d0d0d000d0d000d00000000000000000000000d000d0d0000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d0d0d000d0d0000000000000000000000000000000d0d0000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d0d0d000d0d000d00000000000000000000000d0d0d0d0000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
__sfx__
001100000364609646066460c6460363609636066360c6360362609626066260c6260361609616066160c61600000000000000000000000000000000000000000000000000000000000000000000000000000000
000c00002a0452e045270452c0452a0352e035270352c0352a0252e025270252c0252a0152e015270152c0151400019000270000000000000000002c0002f0002f0002e000110002c00029000200000000000000
000c080c1356013560135501355013550135401354013540135401354013540135402d5102d5102d5102d515225002450000500005000050000500005002550021500225002450027500285002c5002b50025500
011006083363433630336213362033620336113361033610346001d000000001e0000000021000000001d0001d0002f0000000000000190001900020000240002e00034000000000000000000000000000000000
0010000000000000000000020000270002d0002c0002c000122000f2000f2001f00022200190002a2003200032000182002120027200282002b0002a0002d0002e00000000000000000000000000000000000000
00100000000001f000310002300023000230002300024000290002800000000290002b000000002e0003200036000300002d0002a000260002500025000000000000000000230002300000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000800001b03020021227250070000700007000070000700007000070000700007000070000700007000070000700007000070000700007000070000700007000070000700007000070000700007000000000000
000d0000200341b021140210b72105711017110061100601000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000800000c634216212a6202962500600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600
000800002463414631086210662500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
011000001141411412114121141011410124111241012410144211442114421164311643118441194411b4511d461204713d6723367532331303212e3112d3112b31129301273112531123301213112131500000
000700001e52422511245112452124520245202452224531245322453531555365453854038531385213851138515001000010000100001000010000100001000010000100001000010000000000000000000000
00100000315322a532235221c522315352a535235251c525315372a537235271c527315342a534235241c52431534315352a5342a5352352423520235251c5241c5201c525005000050000500005000050000500
000c0000305752b575305753556535515000000000000000000000000000000000000000000000075000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000e0000207241c71110500000002b650226503d6563d6463d6263d6171d600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0005000029314275242a5212f5003830008300363000d3000a300103000b3000d300093000b300093000b3003f30000300003000030000300003003b3003b3003b3003a3003a3003a30000300003000030000300
00050000265242a51128314295213830008300363000d3000a300103000b3000d300093000b300093000b3003f30000300003000030000300003003b3003b3003b3003a3003a3003a30000300003000030000300
000500002d524293142a5242c5003830008300363000d3000a300103000b3000d300093000b300093000b3003f30000300003000030000300003003b3003b3003b3003a3003a3003a30000300003000030000300
000800000001403012050120401500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000800000401402012000120001500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000e000004a7204a6204a6004a6204a5204a5004a5204a4204a4204a3204a3204a2204a2204a1204a1204a0100b0500a0000a0000a0000a0000a0000a0000a0000a0000a0000a0000a0000a0000a0000a0000a00
000b00000661300600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600
00100000186230e623146130060008613046130d62300600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600006000060000600
000c00001d5141d5111d52121521275212b5212b5222b5212b5112b51513500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500
000c00001e5141e5111e52122521285212c5212c5222c5212c5112c51513500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500
000c00001f5141f5111f521245212a5212d5212d5222d5212d5112d51513500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500
000c0000205142051120521255212b5212e5212e5222e5212e5112e51513500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500
000c0000215142151121521265212c5212f5212f5222f5212f5112f51513500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500
000c0000225142251122521275212d521305213052230521305113051513500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500
000c0000235142351123521285212e521315213152231521315113151513500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500005000050000500
000700002551425511255212552025520255312553025530255313155536555385403853138521385203851138515001000010000100001000010000100001000000000000000000000000000000000000000000
0028000003814090140b0210b0320b0420b0520b0520b0520b0400b0400b0300b0250381003810018150280503814120141402114031140421405214052140521404014040140301402503810038100181502805
00280000038140b0140d0210d0320d0420d0520d0520d0520d0400d0400d0300d0250381003810018150280503814120141402114031140421405214052140521404014040140301402503810038100181502805
001400002a9542a9502a9402a9402a9322a9322a9222a9222a9102a91004800048050000020800208002080020954209502094020940209322093220922209222091020910320000000000000000000000000000
001400000c9540c9500c9400c9400c9320c9320c9220c9220c9100c9102290022900229002290022900229000c9500c9500c9400c9400c9300c9300c9200c9200c9100c910320000000000000000000000000000
001400000c9540c9500c9401094010932109321092210922109101091022900229002290022900229002290010950109501094015940159301593015920159201591015910320000000000000000000000000000
001400000700005010050100700007010070100701007010070100701009020090200902005020050200502000000050100501000000000000000000000000000000000000000000000000000000000000000000
0028000022025270152b0152501522025270152b0152501522025270152a0152501522025270152a01525015220251e0252001525015220151e02520015250152202525015280152701522025250152801527015
0028002014a3014a3016a3016a3516a2500a0023a0500a0014a3014a3019a3019a3519a2519a1528a0500a0014a3014a3016a3016a3516a2516a0022a0500a0012a3012a3014a3014a3514a2514a1517a0415a00
0014002014a3014a3014a3014a3019a2019a201ea101ba201ea201ba101ea1014a0014a1014a1528a0500a0014a3014a3014a3014a3018a2516a2018a151aa0012a3012a3012a3012a3016a2518a2016a1514a00
0014002014a3014a3014a3014a3019a2019a2019a1019a1019a1219a1219a1519a1519a1200a0028a0500a0014a3014a3014a2014a2514a1214a1518a0016a0012a3012a3012a2012a2512a1212a1516a0014a00
0020000015a0015a1115a2115a3115a3015a3015a2015a2015a2015a2015a1015a1015a1115a1015a1015a011aa001aa111aa211aa311aa301aa301aa201aa201aa201aa201aa101aa101aa111aa101aa101aa01
0120000011a0011a1111a2111a3111a3011a3011a2011a2011a2011a2011a1011a1011a1111a1011a1011a0111a0011a1111a2111a3111a3011a3011a2011a2011a2011a2011a1011a1011a1111a1011a1011a01
0020000013a0013a1113a2113a3113a3013a3013a2013a2013a2013a2013a1013a1013a1113a1013a1013a0118a0018a1118a2118a3118a3018a3018a2018a2018a2018a2018a1018a1018a1118a1018a1018a01
0010000029a5029a5029a5029a4029a3029a3029a2029a2022a5022a5022a5022a4022a3022a3022a2022a201ba501ba501ba501ba401ba301ba301ba201ba2014a5014a5014a5014a4014a3014a3014a2014a20
001000001d7101d7211d7311d7301d7301d7201d7201d7201d7201d7101d7101d7101d7101d7101d7101d7101f7101f7211f7311f7301f7301f7201f7201f7201f7201f7101f7101f7101f7101f7101f7101f710
0010000026a5026a5026a5026a4027a3027a3027a2027a201da501da501da501da401da301da301da201da2020a5020a5020a5020a4020a3020a3020a2020a2019a5019a5019a5019a4019a3019a3019a2019a20
0110000029a5029a5029a5029a4029a3029a3029a2029a2029a1529a1029a1529a15299002990029900299001ba501ba501ba501ba401ba301ba301ba201ba201ba151ba101ba151ba151ba001ba001ba001ba00
0110000022a5022a5022a5022a4022a3022a3022a2022a2022a1522a1022a1522a1522a0022a0022a0022a0014a5014a5014a5014a4014a3014a3014a2014a2014a1514a1014a1514a1514a0014a0014a0014a00
01100000000000000014a1414a2114a2114a3114a3014a2014a2514a1014a1514a1500000000000000000000000000000022a1422a2122a2122a3122a3022a2022a2522a1022a1522a1500000000000000000000
0110000000000000001ba141ba211ba211ba311ba301ba201ba251ba101ba151ba1500000000000000000000000000000029a1429a2129a2129a3129a3029a2029a2529a1029a1529a1500000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
__music__
01 41424327
00 41422827
00 41422927
02 41422a27
01 416d2b2c
02 416d2d2c
01 416d2f2e
00 416d2f2e
00 416d2f30
00 416d2f30
00 416d2f31
00 416d2f32
00 416d2f70
00 416d2f70
00 416d2f33
02 416d2f34
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344
00 41424344

