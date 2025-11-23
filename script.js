/* ---------- Utilities ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* ---------- State ---------- */
let cart = JSON.parse(localStorage.getItem('uv_cart') || '[]');
const cartCountEl = $('#cartCount');
const cartItemsEl = $('#cartItems');
const subtotalEl = $('#subtotal');

document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  updateCartUI();

  // Cart open/close
  $('#openCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);

  // Checkout modal open/close
  $('#checkoutBtn').addEventListener('click', openCheckout);
  $('#closeCheckout').addEventListener('click', closeCheckout);

  // Checkout form submission
  $('#checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    simulatePlaceOrder(new FormData(e.target));
  });

  // Theme toggle
  $('#themeToggle').addEventListener('click', toggleTheme);
  if(localStorage.getItem('uv_theme') === 'light') document.documentElement.classList.add('light');

  // Card tilt
  setupCardTilt();

  // Close cart clicking outside
  document.body.addEventListener('click', (ev) => {
    const cartDrawer = $('#cartDrawer');
    if(cartDrawer.classList.contains('open') &&
       !ev.target.closest('.cart-drawer') &&
       !ev.target.closest('#openCart')){
      closeCart();
    }
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){ closeCart(); closeCheckout(); }
  });
});

/* ---------- Cart functions ---------- */
function saveCart(){ localStorage.setItem('uv_cart', JSON.stringify(cart)); }
function addToCart(name,img,price){
  const idx = cart.findIndex(i=>i.name===name);
  if(idx>-1) cart[idx].qty++;
  else cart.push({name,img,price:Number(price),qty:1});
  saveCart(); updateCartUI();
  $('#openCart').animate([{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:180});
}
function updateCartUI(){ cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0); renderCart(); }
function renderCart(){
  cartItemsEl.innerHTML = '';
  if(cart.length===0){
    cartItemsEl.innerHTML = '<div class="small" style="padding:12px;color:var(--muted)">Your cart is empty — add some hoodies.</div>';
    subtotalEl.textContent = '$0.00'; return;
  }
  cart.forEach((item,idx)=>{
    const div=document.createElement('div');
    div.className='cart-item';
    div.innerHTML=`
      <img src="${item.img}" alt="${escapeHtml(item.name)}">
      <div style="flex:1">
        <strong>${escapeHtml(item.name)}</strong>
        <div class="small">$${item.price.toFixed(2)}</div>
        <div class="qty-controls small" style="margin-top:8px">
          <button onclick="decreaseQty(${idx});event.stopPropagation();">−</button>
          <div style="min-width:26px;text-align:center">${item.qty}</div>
          <button onclick="increaseQty(${idx});event.stopPropagation();">+</button>
          <button style="margin-left:8px" onclick="removeItem(${idx});event.stopPropagation();">Remove</button>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  subtotalEl.textContent=`$${subtotal.toFixed(2)}`;
}
function increaseQty(i){ cart[i].qty++; saveCart(); updateCartUI(); }
function decreaseQty(i){ cart[i].qty--; if(cart[i].qty<=0) cart.splice(i,1); saveCart(); updateCartUI(); }
function removeItem(i){ cart.splice(i,1); saveCart(); updateCartUI(); }

/* ---------- Cart drawer ---------- */
function openCart(){ 
  const drawer=$('#cartDrawer'); 
  drawer.classList.add('open'); 
  drawer.setAttribute('aria-hidden','false');
}
function closeCart(){ 
  const drawer=$('#cartDrawer'); 
  drawer.classList.remove('open'); 
  drawer.setAttribute('aria-hidden','true');
}

/* ---------- Checkout ---------- */
function openCheckout(){
  if(cart.length===0){ alert('Your cart is empty — add something first.'); return; }
  const modal = $('#checkoutModal');
  modal.setAttribute('aria-hidden','false');
  modal.style.opacity='1';
  $('#checkoutForm').style.display='block';
  $('#checkoutThanks').hidden=true;
}
function closeCheckout(){
  const modal = $('#checkoutModal');
  modal.setAttribute('aria-hidden','true');
  modal.style.opacity='0';
  $('#checkoutForm').style.display='block';
  $('#checkoutThanks').hidden=true;
}
function simulatePlaceOrder(formData){
  $('#checkoutForm').style.display='none';
  $('#checkoutThanks').hidden=false;
  cart=[]; saveCart(); updateCartUI();
  tinyConfetti();
}

/* ---------- Tiny confetti ---------- */
function tinyConfetti(){
  const count=30;
  for(let i=0;i<count;i++){
    const d=document.createElement('div');
    d.style.position='fixed';
    d.style.left=(50+Math.random()*40-20)+'%';
    d.style.top=(40+Math.random()*20)+'%';
    d.style.width='8px'; d.style.height='8px';
    d.style.background=['#ff6b35','#ff3d81','#06b6d4','#facc15'][Math.floor(Math.random()*4)];
    d.style.borderRadius='2px';
    d.style.opacity='0.95';
    d.style.transform=`translateY(-10px) rotate(${Math.random()*360}deg)`;
    d.style.zIndex=9999;
    document.body.appendChild(d);
    d.animate([
      {transform:`translateY(0) rotate(${Math.random()*360}deg)`,opacity:1},
      {transform:`translateY(180px) rotate(${Math.random()*720}deg)`,opacity:0}
    ],{duration:900+Math.random()*600,easing:'cubic-bezier(.2,.7,.2,1)'});
    setTimeout(()=>d.remove(),1800+Math.random()*800);
  }
}

/* ---------- Theme toggle (FULL FIX) ---------- */
function toggleTheme(){
  const html = document.documentElement;
  const isLight = html.classList.toggle('light');

  // Only fade background & text, don't affect transform (cards stay correct)
  html.style.transition = 'background 0.4s ease, color 0.4s ease';
  document.body.style.transition = 'background 0.4s ease, color 0.4s ease';

  localStorage.setItem('uv_theme', isLight?'light':'dark');
}

/* ---------- Helpers ---------- */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function scrollToProducts(){ document.getElementById('productsSection').scrollIntoView({behavior:'smooth'}); }
function openContact(){ alert('Contact: contact@urbanvibe.com'); }

/* ---------- Card tilt ---------- */
function setupCardTilt(){
  const cards=$$('.product.card');
  cards.forEach(card=>{
    card.addEventListener('mousemove',(e)=>{
      const rect=card.getBoundingClientRect();
      const x=e.clientX-rect.left;
      const y=e.clientY-rect.top;
      const cx=rect.width/2, cy=rect.height/2;
      const dx=(x-cx)/cx, dy=(y-cy)/cy;
      const tiltX=(dy*6), tiltY=(dx*-8), scale=1.025;
      card.style.transform=`perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
      const img=card.querySelector('.card-media img');
      if(img) img.style.transform=`translate3d(${dx*6}px,${dy*6}px,0) scale(1.06) rotate(${dx*2}deg)`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='';
      const img=card.querySelector('.card-media img');
      if(img) img.style.transform='';
    });
    card.addEventListener('click',()=>{ card.animate([{transform:'scale(0.995)'},{transform:''}],{duration:160}); });
  });
}
