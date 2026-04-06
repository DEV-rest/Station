// Age gate
(function(){
  const gate = document.getElementById('age-gate');
  const enter = document.getElementById('btn-enter');
  const leave = document.getElementById('btn-leave');
  const remember = document.getElementById('remember');

  function isVerified(){
    try{
      return localStorage.getItem('ts_age_verified') === '1';
    }catch(e){
      return false;
    }
  }

  function setVerified(rememberMe){
    try{
      if(rememberMe) localStorage.setItem('ts_age_verified','1');
    }catch(e){}

    gate.style.display = 'none';
    gate.setAttribute('aria-hidden','true');
  }

  if(isVerified()){
    gate.style.display = 'none';
    gate.setAttribute('aria-hidden','true');
  }else{
    gate.style.display = 'flex';
    gate.setAttribute('aria-hidden','false');
  }

  if(enter){
    enter.addEventListener('click',()=>setVerified(remember && remember.checked));
  }

  if(leave){
    leave.addEventListener('click',()=>{ window.location.href = 'https://www.google.com/'; });
  }

  document.addEventListener('keydown',e=>{
    if(e.key === 'Enter' && gate && gate.style.display !== 'none'){
      setVerified(remember && remember.checked);
    }
  });
})();

// Smooth anchor scrolling
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',e=>{
      const href = link.getAttribute('href');
      if(!href || href.length <= 1) return;
      const target = document.querySelector(href);
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });
})();

// FAQ accordion
(function(){
  const triggers = document.querySelectorAll('.faq-trigger');
  if(!triggers.length) return;

  function closePanel(trigger, panel){
    trigger.setAttribute('aria-expanded','false');
    panel.style.height = panel.scrollHeight + 'px';
    requestAnimationFrame(()=>{
      panel.style.height = '0px';
      panel.style.paddingTop = '0px';
      panel.style.paddingBottom = '0px';
    });

    panel.addEventListener('transitionend', function handler(e){
      if(e.propertyName !== 'height') return;
      panel.hidden = true;
      panel.style.height = '';
      panel.style.paddingTop = '';
      panel.style.paddingBottom = '';
      panel.removeEventListener('transitionend', handler);
    });
  }

  function openPanel(trigger, panel){
    trigger.setAttribute('aria-expanded','true');
    panel.hidden = false;
    panel.style.height = '0px';
    panel.style.paddingTop = '0px';
    panel.style.paddingBottom = '0px';
    requestAnimationFrame(()=>{
      panel.style.height = panel.scrollHeight + 'px';
      panel.style.paddingTop = '';
      panel.style.paddingBottom = '';
    });

    panel.addEventListener('transitionend', function handler(e){
      if(e.propertyName !== 'height') return;
      panel.style.height = 'auto';
      panel.removeEventListener('transitionend', handler);
    });
  }

  triggers.forEach(trigger=>{
    const panel = trigger.nextElementSibling;
    if(!panel) return;

    panel.style.transition = 'height 280ms ease, padding 280ms ease';

    trigger.addEventListener('click',()=>{
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      triggers.forEach(otherTrigger=>{
        const otherPanel = otherTrigger.nextElementSibling;
        if(otherTrigger !== trigger && otherPanel && otherTrigger.getAttribute('aria-expanded') === 'true'){
          closePanel(otherTrigger, otherPanel);
        }
      });

      if(isOpen){
        closePanel(trigger, panel);
      }else{
        openPanel(trigger, panel);
      }
    });
  });
})();

// Motion system: GSAP when available, IntersectionObserver fallback otherwise
(function(){
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');

  if(prefersReducedMotion){
    revealEls.forEach(el=>el.classList.add('visible'));
    return;
  }

  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);

    gsap.set('.hero-title .big', { y: 28, opacity: 0 });
    gsap.set('.hero-title .accent', { y: 38, opacity: 0 });
    gsap.set('.lead, .actions', { y: 24, opacity: 0 });
    gsap.set('.cards-stack .stack', { y: 34, opacity: 0, rotate: i => [-9, 2, 11][i] });

    const heroTl = gsap.timeline({ defaults:{ duration: 0.9, ease: 'power3.out' } });
    heroTl
      .to('.hero-title .big', { y: 0, opacity: 1 })
      .to('.hero-title .accent', { y: 0, opacity: 1 }, '-=0.62')
      .to('.lead, .actions', { y: 0, opacity: 1, stagger: 0.08 }, '-=0.55')
      .to('.cards-stack .stack', { y: 0, opacity: 1, stagger: 0.12, duration: 1 }, '-=0.9');

    revealEls.forEach((el, index)=>{
      const targets = el.querySelectorAll(
        '.section-kicker, .category-index, h2, h3, p, li, .category-media, .showcase-image, .showcase-body, .testimonial-card, .faq-item, .photo-tile, .footer-column, .footer-brand'
      );
      const animTargets = targets.length ? targets : [el];

      gsap.set(el, { opacity: 1, y: 0 });
      gsap.from(animTargets, {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: Math.min(0.08, 0.22 / animTargets.length),
        scrollTrigger: {
          trigger: el,
          start: index === 0 ? 'top 75%' : 'top 82%',
          once: true
        }
      });
    });

    if(window.innerWidth >= 780){
      gsap.to('.stack-1', {
        yPercent: -8,
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      gsap.to('.stack-3', {
        yPercent: 10,
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      gsap.utils.toArray('.category-media img, .showcase-image img, .photo-tile img').forEach(image=>{
        gsap.fromTo(image,
          { scale: 1.08, yPercent: -4 },
          {
            scale: 1,
            yPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: image,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          }
        );
      });
    }

    return;
  }

  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el=>observer.observe(el));
  }else{
    revealEls.forEach(el=>el.classList.add('visible'));
  }
})();
