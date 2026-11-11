(function(){
  var d=document, root=d.documentElement;
  // Theme toggle
  var tt=d.querySelector('.theme-toggle');
  function cur(){return root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}
  function apply(t){root.setAttribute('data-theme',t);if(tt){tt.setAttribute('aria-pressed',t==='dark');tt.setAttribute('aria-label',t==='dark'?'Switch to light mode':'Switch to dark mode');}}
  if(!root.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches) apply('dark'); else apply(cur());
  if(tt) tt.addEventListener('click',function(){var n=cur()==='dark'?'light':'dark';apply(n);try{localStorage.setItem('theme',n);}catch(e){}});
  // Mobile menu
  var mt=d.querySelector('.menu-toggle'), mm=d.getElementById('mobile-menu');
  function close(){mm.classList.remove('open');mt.setAttribute('aria-expanded','false');mt.setAttribute('aria-label','Open menu');}
  if(mt&&mm){
    mt.addEventListener('click',function(){var o=mm.classList.toggle('open');mt.setAttribute('aria-expanded',o);mt.setAttribute('aria-label',o?'Close menu':'Open menu');});
    mm.addEventListener('click',function(e){if(e.target.closest('a'))close();});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&mm.classList.contains('open')){close();mt.focus();}});
  }
  // Header + float CTA
  var hd=d.querySelector('.site-header'), fc=d.querySelector('.float-cta');
  function onScroll(){var y=scrollY;hd&&hd.classList.toggle('scrolled',y>8);fc&&fc.classList.toggle('show',y>700);}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  // Reveal
  var els=d.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    els.forEach(function(el){io.observe(el);});
  } else els.forEach(function(el){el.classList.add('in');});
  // Year
  var y=d.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  // Brief -> clipboard -> Telegram (no data leaves the page except via the user's own Telegram)
  var f=d.getElementById('brief');
  if(f) f.addEventListener('submit',function(e){
    e.preventDefault();
    var fd=new FormData(f), about=(fd.get('about')||'').toString().trim();
    var msg='Hi Crestpane! I found your website.\n\nProject: '+fd.get('plan')+'\nTimeline: '+fd.get('when')+(about?'\nAbout my business: '+about:'');
    var st=d.getElementById('brief-status');
    function done(ok){st.textContent=ok?'Brief copied. Paste it into the Telegram chat that just opened.':'Telegram opened. Copy your brief from the box above and paste it into the chat.';}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(msg).then(function(){done(true);},function(){done(false);});} else done(false);
    var win=window.open('https://t.me/legend_teen','_blank');
    if(win){try{win.opener=null;}catch(_){}} else location.href='https://t.me/legend_teen';
  });

  // ---- Pricing: plans, calculator, Telegram hand-off ----
  var PLANS={starter:{name:'Starter Website',std:500},business:{name:'Business Website',std:1000},premium:{name:'Premium Website',std:2000}};
  var ADDONS={content:{n:'Content upload & formatting',p:100},contact:{n:'Advanced contact form',p:100},booking:{n:'Booking / appointment system',p:300},payment:{n:'Payment gateway integration',p:200},multilingual:{n:'Multilingual setup',p:300},analytics:{n:'Google Analytics integration',p:100}};
  var MAINT=100, UNIT=50;
  function money(n){return '$'+Math.round(n).toLocaleString('en-US');}
  function $(id){return d.getElementById(id);}
  function openTelegram(text,statusEl){
    function say(ok){if(statusEl)statusEl.textContent=ok?'Copied. Paste it into the Telegram chat that just opened.':'Telegram opened. Copy the details above and paste them into the chat.';}
    if(text&&navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){say(true);},function(){say(false);});} else say(false);
    var w=window.open('https://t.me/legend_teen','_blank'); if(w){try{w.opener=null;}catch(_){}} else location.href='https://t.me/legend_teen';
  }
  function selectBrief(id){var r=d.querySelector('#brief input[data-plan="'+id+'"]'); if(r) r.checked=true;}
  function selectCalc(id){var r=d.querySelector('#calc-form input[name="pkg"][value="'+id+'"]'); if(r){r.checked=true; calc();} return r;}
  var cf=$('calc-form'), quote=null;
  function clampInput(el){var v=parseInt(el.value,10); if(isNaN(v)) v=0; v=Math.max(+el.min||0,Math.min(+el.max||99,v)); el.value=v; return v;}
  function calc(){
    if(!cf) return;
    var id=(cf.querySelector('input[name="pkg"]:checked')||{}).value||'starter', pl=PLANS[id];
    var pages=clampInput($('c-pages')), rev=clampInput($('c-rev'));
    var std=pl.std+pages*UNIT+rev*UNIT, picked=[];
    cf.querySelectorAll('.addon').forEach(function(l){
      var inp=l.querySelector('input'), inc=l.getAttribute('data-included')===id;
      l.classList.toggle('is-included',inc); inp.disabled=inc; if(inc) inp.checked=false;
      if(inp.checked&&ADDONS[inp.value]){std+=ADDONS[inp.value].p; picked.push(ADDONS[inp.value].n);}
    });
    var maint=cf.querySelector('input[value="maintenance"]').checked;
    var disc=std/2, adj=1, fin=std-disc-adj, saved=std-fin;
    $('s-name').textContent=pl.name+(pages?' + '+pages+' extra page'+(pages>1?'s':''):'')+(rev?' + '+rev+' extra revision'+(rev>1?'s':''):'');
    $('s-old').innerHTML='<span class="sr-only">Standard price </span>'+money(std);
    $('s-final').textContent=money(fin);
    $('s-save').textContent='You save '+money(saved)+' · 50% OFF + extra $1 off';
    $('r-std').textContent=money(std); $('r-disc').textContent='−'+money(disc); $('r-adj').textContent='−'+money(adj); $('r-total').textContent=money(fin);
    $('r-month-row').hidden=!maint; $('r-month').textContent=money(MAINT/2)+' / mo';
    quote={plan:pl.name,pages:pages,rev:rev,addons:picked,maint:maint,std:std,fin:fin,saved:saved};
  }
  if(cf){
    cf.addEventListener('change',calc); cf.addEventListener('input',function(e){if(e.target.type==='number')calc();});
    cf.querySelectorAll('[data-step]').forEach(function(b){b.addEventListener('click',function(){var el=$(b.getAttribute('data-for'));el.value=(parseInt(el.value,10)||0)+(+b.getAttribute('data-step'));calc();});});
    calc();
    $('c-send').addEventListener('click',function(){
      var q=quote, t='Hi Crestpane! Here is my website quote from your calculator:\n\nPackage: '+q.plan+
        (q.pages?'\nAdditional pages: '+q.pages:'')+(q.rev?'\nExtra revision rounds: '+q.rev:'')+
        (q.addons.length?'\nAdd-ons: '+q.addons.join(', '):'')+(q.maint?'\nMonthly maintenance: '+money(MAINT/2)+' / month':'')+
        '\n\nStandard price: '+money(q.std)+'\nMy 50% OFF price: '+money(q.fin)+' (USD, one-time)';
      openTelegram(t,$('c-status'));
    });
    $('c-print').addEventListener('click',function(){window.print();});
  }
  d.querySelectorAll('.plan-cta').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('data-plan'), pl=PLANS[id]; e.preventDefault();
      selectBrief(id); selectCalc(id);
      openTelegram('Hi Crestpane! I’m interested in the '+pl.name+' ('+money(pl.std/2-1)+', 50% OFF).',null);
    });
  });
  d.querySelectorAll('.plan-calc').forEach(function(b){
    b.addEventListener('click',function(){
      var id=b.getAttribute('data-plan'), r=selectCalc(id); selectBrief(id);
      var c=$('calculator'); c.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      if(r) setTimeout(function(){r.focus({preventScroll:true});},400);
    });
  });
})();
