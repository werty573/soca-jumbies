/* Shared demo store for the site and the band admin page.
   In a live build this is a database behind the admin login; here it lives in the viewer's browser.
   Inventory works like a stock book: every piece in or out is a log line, and the counts always
   equal the log. A held registration reserves pieces; paying takes them out of stock. */
(function(){
  var KEY='socajumbies-v2';
  var H=36e5,D=864e5,now=Date.now();
  var OPENING=[
    {name:'Band T-shirt',sizes:{XS:10,S:20,M:30,L:30,XL:20,XXL:10}},
    {name:'Bikini',sizes:{XS:10,S:10,M:10,L:10,XL:6}},
    {name:'Monokini',sizes:{XS:6,S:10,M:10,L:10,XL:6}},
    {name:'Shorts',sizes:{S:10,M:15,L:15,XL:10,XXL:6}}
  ];
  function o(item,size){return {item:item,size:size}}
  function buildDefaults(){
    var d={
      season:{
        year:2027,
        theme:'Bubble Bath',
        tagline:'Foam cannons, soap suds and soca till the sun comes up.',
        desc:'This year the whole band gets washed. Foam cannons on the truck, bubble stations down the road, and paint that comes off in the suds.',
        date:'2027-02-08T02:00:00-04:00'
      },
      rules:{deposit:250,holdMin:15,maxPer:4,usdRate:6.8,balanceDue:'31 January'},
      packages:[
        {name:'Suds',price:540,stock:150,sold:108,open:true,perks:['Band outfit: T-shirt, bikini, monokini or shorts','Foam, paint and powder','Drinks all morning','Rope security and first aid']},
        {name:'Full Lather',price:840,stock:250,sold:226,open:true,perks:['Everything in Suds','Goggles and bandana','Breakfast at the finish','Your photos from the road']},
        {name:'Bath House VIP',price:1350,stock:60,sold:60,open:true,perks:['Everything in Full Lather','Front section, behind the truck','Premium drinks bar','Private washrooms','Band pack delivered to you']}
      ],
      inventory:[],
      log:[],
      regs:[
        {ref:'SJ-4772',name:'Kezia Charles',phone:'8683916058',verified:true,pack:'Full Lather',outfits:[o('Bikini','L'),o('Bikini','L')],crew:2,currency:'TTD',plan:'full',method:'card',paid:1680,total:1680,status:'paid',at:now-10*D},
        {ref:'SJ-4788',name:'Marcus Fortune',phone:'8687273364',verified:true,pack:'Suds',outfits:[o('Shorts','XXL'),o('Band T-shirt','L'),o('Band T-shirt','M')],crew:3,currency:'TTD',plan:'deposit',method:'card',paid:0,total:1620,status:'expired',at:now-8*D},
        {ref:'SJ-4809',name:'Darren Ramdass',phone:'8686550127',verified:true,pack:'Bath House VIP',outfits:[o('Shorts','XL'),o('Bikini','L'),o('Bikini','L'),o('Monokini','M')],crew:4,currency:'USD',plan:'full',method:'card',paid:5400,total:5400,status:'paid',at:now-5*D},
        {ref:'SJ-4817',name:'Shania Baptiste',phone:'8683028841',verified:true,pack:'Suds',outfits:[o('Monokini','S')],crew:1,currency:'TTD',plan:'full',method:'card',paid:540,total:540,status:'paid',at:now-3*D-6*H},
        {ref:'SJ-4821',name:'Kerron Mohammed',phone:'8687142290',verified:true,pack:'Full Lather',outfits:[o('Band T-shirt','L'),o('Bikini','M')],crew:2,currency:'TTD',plan:'deposit',method:'card',paid:500,total:1680,status:'deposit',at:now-3*D},
        {ref:'SJ-4796',name:'Aaliyah Joseph',phone:'8684897735',verified:true,pack:'Full Lather',outfits:[o('Bikini','M')],crew:1,currency:'TTD',plan:'deposit',method:'bank',paid:0,total:840,status:'held',expires:now+19*H,at:now-5*H}
      ]
    };
    // Opening stock 14 days ago, a restock of Bikini L, earlier sales, then the paid registrations above.
    OPENING.forEach(function(it){
      var inv={name:it.name,onHand:{}};
      Object.keys(it.sizes).forEach(function(s){inv.onHand[s]=0;move(d,inv,s,it.sizes[s],'Opening stock',now-14*D)});
      d.inventory.push(inv);
    });
    var bl=d.inventory[1];
    move(d,bl,'L',-10,'Earlier registrations (before this list)',now-12*D);
    move(d,bl,'L',4,'Restock',now-11*D);
    move(d,d.inventory[0],'XXL',-10,'Earlier registrations (before this list)',now-12*D);
    d.regs.slice().sort(function(a,b){return a.at-b.at}).forEach(function(r){if(r.status==='paid'||r.status==='deposit')consume(d,r,r.at)});
    return d;
  }
  function inv(d,name){return d.inventory.filter(function(i){return i.name===name})[0]}
  function move(d,item,size,qty,note,at){
    item.onHand[size]=(item.onHand[size]||0)+qty;
    d.log.unshift({at:at||Date.now(),item:item.name,size:size,qty:qty,note:note,after:item.onHand[size]});
  }
  function consume(d,r,at){
    (r.outfits||[]).forEach(function(x){var it=inv(d,x.item);if(it)move(d,it,x.size,-1,'Registration '+r.ref+' ('+r.name+')',at)});
    r.stockOut=true;
  }
  function clone(x){return JSON.parse(JSON.stringify(x))}
  function expire(d){var t=Date.now();d.regs.forEach(function(r){if(r.status==='held'&&r.expires&&r.expires<t)r.status='expired'});return d}
  function load(){
    try{var raw=localStorage.getItem(KEY);if(raw){var d=JSON.parse(raw);if(d&&d.season&&d.inventory&&d.regs)return expire(d)}}catch(e){}
    return expire(buildDefaults());
  }
  function save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
  function held(d,name){return d.regs.reduce(function(s,r){return s+(r.status==='held'&&r.pack===name?r.crew:0)},0)}
  function heldPieces(d,item,size){
    return d.regs.reduce(function(s,r){if(r.status!=='held')return s;return s+(r.outfits||[]).filter(function(x){return x.item===item&&x.size===size}).length},0);
  }
  window.SJ={
    get:load,
    save:save,
    reset:function(){try{localStorage.removeItem(KEY)}catch(e){}return expire(buildDefaults())},
    held:held,
    left:function(d,p){return Math.max(0,p.stock-p.sold-held(d,p.name))},
    available:function(d,p){return p.open&&p.stock-p.sold-held(d,p.name)>0},
    inv:inv,
    heldPieces:heldPieces,
    pieceLeft:function(d,item,size){var it=inv(d,item);return it?Math.max(0,(it.onHand[size]||0)-heldPieces(d,item,size)):0},
    move:move,
    consume:consume,
    digits:function(s){return String(s||'').replace(/\D/g,'').replace(/^1(?=868)/,'')},
    findByPhone:function(d,phone){var k=this.digits(phone);return d.regs.filter(function(r){return r.phone===k&&r.status!=='expired'})[0]},
    outfitText:function(r){var c={};(r.outfits||[]).forEach(function(x){var k=x.item+' '+x.size;c[k]=(c[k]||0)+1});return Object.keys(c).map(function(k){return (c[k]>1?c[k]+' x ':'')+k}).join(', ')},
    money:function(n,cur){return (cur==='USD'?'US$':'TT$')+Number(n).toLocaleString('en-US')},
    toCur:function(ttd,cur,rate){return cur==='USD'?Math.ceil(ttd/rate):ttd},
    onChange:function(fn){window.addEventListener('storage',function(e){if(e.key===KEY)fn(load())})}
  };
})();
