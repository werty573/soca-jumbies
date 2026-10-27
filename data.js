/* Shared demo store for the site and the band admin page.
   In a live build this is a database behind the admin login; here it lives in the viewer's browser. */
(function(){
  var KEY='socajumbies-v1';
  var H=36e5,D=864e5,now=Date.now();
  var DEFAULTS={
    season:{
      year:2027,
      theme:'Bubble Bath',
      tagline:'Foam cannons, soap suds and soca till the sun comes up.',
      desc:'This year the whole band gets washed. Foam cannons on the truck, bubble stations down the road, and paint that comes off in the suds.',
      date:'2027-02-08T02:00:00-04:00'
    },
    rules:{deposit:250,holdMin:15,maxPer:4,usdRate:6.8,balanceDue:'31 January'},
    packages:[
      {name:'Suds',price:540,stock:150,sold:108,open:true,perks:['Band T-shirt','Foam, paint and powder','Drinks all morning','Rope security and first aid']},
      {name:'Full Lather',price:840,stock:250,sold:226,open:true,perks:['Everything in Suds','Band shorts or bottoms','Goggles and bandana','Breakfast at the finish','Your photos from the road']},
      {name:'Bath House VIP',price:1350,stock:60,sold:60,open:true,perks:['Everything in Full Lather','Front section, behind the truck','Premium drinks bar','Private washrooms','Band pack delivered to you']}
    ],
    sizes:{XS:true,S:true,M:true,L:true,XL:true,XXL:false},
    regs:[
      {ref:'SJ-4821',name:'Kerron Mohammed',phone:'8687142290',verified:true,pack:'Full Lather',size:'L',crew:2,currency:'TTD',plan:'deposit',method:'card',paid:500,total:1680,status:'deposit',at:now-3*D},
      {ref:'SJ-4817',name:'Shania Baptiste',phone:'8683028841',verified:true,pack:'Suds',size:'S',crew:1,currency:'TTD',plan:'full',method:'card',paid:540,total:540,status:'paid',at:now-3*D-6*H},
      {ref:'SJ-4809',name:'Darren Ramdass',phone:'8686550127',verified:true,pack:'Bath House VIP',size:'XL',crew:4,currency:'USD',plan:'full',method:'card',paid:5400,total:5400,status:'paid',at:now-5*D},
      {ref:'SJ-4796',name:'Aaliyah Joseph',phone:'8684897735',verified:true,pack:'Full Lather',size:'M',crew:1,currency:'TTD',plan:'deposit',method:'bank',paid:0,total:840,status:'held',expires:now+19*H,at:now-5*H},
      {ref:'SJ-4788',name:'Marcus Fortune',phone:'8687273364',verified:true,pack:'Suds',size:'XXL',crew:3,currency:'TTD',plan:'deposit',method:'card',paid:0,total:1620,status:'expired',at:now-8*D},
      {ref:'SJ-4772',name:'Kezia Charles',phone:'8683916058',verified:true,pack:'Full Lather',size:'S',crew:2,currency:'TTD',plan:'full',method:'card',paid:1680,total:1680,status:'paid',at:now-10*D}
    ]
  };
  function clone(o){return JSON.parse(JSON.stringify(o))}
  function expire(d){
    var t=Date.now();
    d.regs.forEach(function(r){if(r.status==='held'&&r.expires&&r.expires<t)r.status='expired'});
    return d;
  }
  function load(){
    try{var raw=localStorage.getItem(KEY);if(raw){var d=JSON.parse(raw);if(d&&d.season&&d.packages&&d.regs)return expire(d)}}catch(e){}
    return expire(clone(DEFAULTS));
  }
  function save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
  function held(d,name){return d.regs.reduce(function(s,r){return s+(r.status==='held'&&r.pack===name?r.crew:0)},0)}
  window.SJ={
    get:load,
    save:save,
    reset:function(){try{localStorage.removeItem(KEY)}catch(e){}return expire(clone(DEFAULTS))},
    held:held,
    left:function(d,p){return Math.max(0,p.stock-p.sold-held(d,p.name))},
    available:function(d,p){return p.open&&p.stock-p.sold-held(d,p.name)>0},
    digits:function(s){return String(s||'').replace(/\D/g,'').replace(/^1(?=868)/,'')},
    findByPhone:function(d,phone){var k=this.digits(phone);return d.regs.filter(function(r){return r.phone===k&&r.status!=='expired'})[0]},
    money:function(n,cur){return (cur==='USD'?'US$':'TT$')+Number(n).toLocaleString('en-US')},
    toCur:function(ttd,cur,rate){return cur==='USD'?Math.ceil(ttd/rate):ttd},
    onChange:function(fn){window.addEventListener('storage',function(e){if(e.key===KEY)fn(load())})}
  };
})();
