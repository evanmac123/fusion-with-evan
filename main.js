(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // nav
  const nav = $('#nav'), burger = $('.burger'), navEl = $('.nav nav');
  const onScroll = () => nav.classList.toggle('stuck', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const closeMenu = () => { navEl.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = navEl.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#menu a').forEach(a => a.addEventListener('click', closeMenu));

  // cursor glow
  const glow = $('.glow');
  addEventListener('pointermove', e => {
    glow.style.setProperty('--mx', e.clientX + 'px');
    glow.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });

  // card spotlight
  $$('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--cx', e.clientX - r.left + 'px');
    c.style.setProperty('--cy', e.clientY - r.top + 'px');
  }));

  // reveal
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // word-by-word statement
  const st = $('[data-words]');
  if (st) {
    st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
    const words = $$('.w', st);
    const lit = () => {
      const r = st.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i < n));
    };
    addEventListener('scroll', lit, { passive: true }); lit();
  }

  // counters
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, plus = 'plus' in el.dataset, t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / 1600), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = v.toLocaleString() + (p === 1 && plus ? '+' : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    reduce ? el.textContent = to.toLocaleString() + (plus ? '+' : '') : requestAnimationFrame(tick);
    cio.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  // parallax
  const par = $$('[data-parallax]');
  if (!reduce) {
    const run = () => par.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.setProperty('--py', ((r.top + r.height / 2 - innerHeight / 2) * -0.08).toFixed(1) + 'px');
    });
    addEventListener('scroll', run, { passive: true }); run();
  }

  // schedule filter
  $$('.chip').forEach(ch => ch.addEventListener('click', () => {
    $$('.chip').forEach(c => c.classList.toggle('on', c === ch));
    const f = ch.dataset.f;
    $$('.row').forEach(r => { r.hidden = f !== 'all' && r.dataset.l !== f; r.classList.add('in'); });
  }));

  // testimonials
  const qs = $$('#quotes blockquote'), dots = $('#dots');
  let qi = 0, timer;
  qs.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Testimonial ' + (i + 1));
    b.addEventListener('click', () => { show(i); start(); });
    dots.append(b);
  });
  const show = i => {
    qi = i;
    qs.forEach((q, k) => q.classList.toggle('on', k === i));
    $$('button', dots).forEach((b, k) => b.classList.toggle('on', k === i));
  };
  const start = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show((qi + 1) % qs.length), 6500); };
  show(0); start();

  // lightbox
  const lb = $('#lb'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  let last;
  $$('.tile').forEach(t => t.addEventListener('click', () => {
    last = t; lbImg.src = t.dataset.src; lbImg.alt = $('img', t).alt; lbCap.textContent = t.dataset.cap;
    lb.hidden = false; $('.lb-close', lb).focus(); document.body.style.overflow = 'hidden';
  }));
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; last && last.focus(); };
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-close')) closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  // form (static site: opens the visitor's email client; swap for Formspree/Netlify etc. when ready)
  const form = $('#form'), note = $('.form-note'), TO = 'evanmceldowney@gmail.com';
  $$('.row a.btn').forEach(a => a.addEventListener('click', () => {
    const t = $('h3', a.closest('.row')).textContent;
    const opt = [...form.topic.options].find(o => t.toLowerCase().startsWith(o.text.toLowerCase()));
    if (opt) form.topic.value = opt.value;
    form.msg.value = `I'd like to request a ${t.toLowerCase()} on ${$('time', a.closest('.row')).firstChild.textContent}.`;
  }));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email)) { note.textContent = 'Please add your name and a valid email.'; return; }
    const btn = $('button[type=submit]', form); btn.disabled = true; note.textContent = 'Sending…';
    try {
      const r = await fetch('https://formsubmit.co/ajax/' + TO, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d)
      });
      if (!r.ok) throw new Error(r.status);
      form.reset(); note.textContent = 'Thank you! Your message is on its way. I reply personally, usually within a day.';
    } catch {
      const body = `Name: ${d.name}\nEmail: ${d.email}\nInterested in: ${d.topic}\n\n${d.msg || ''}`;
      location.href = `mailto:${TO}?subject=${encodeURIComponent('Private lesson enquiry: ' + d.topic)}&body=${encodeURIComponent(body)}`;
      note.textContent = "Couldn't send directly, so your email app should open with the message ready.";
    } finally { btn.disabled = false; }
  });

  $('#yr').textContent = new Date().getFullYear();
})();
