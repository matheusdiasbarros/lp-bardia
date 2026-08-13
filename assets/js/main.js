/* =========================================================================
   BARDiA Sistemas — comportamento da pagina
   Carregado com <script defer>, entao o DOM ja existe quando isto roda.

   Quatro coisas acontecem aqui:
     1. Menu hamburguer (abre, fecha, acessibilidade)
     2. Sombra do header quando a pagina rola
     3. Animacao de entrada das secoes (IntersectionObserver)
     4. Destaque do link do menu conforme a secao visivel

   Nao ha nenhuma dependencia externa: e JavaScript puro, sem biblioteca.
   ========================================================================= */

(function () {
  'use strict';

  /* Uma unica consulta de preferencia de movimento, reaproveitada abaixo.
     Se a pessoa pediu menos animacao no sistema operacional, a gente nao
     anima nada — nem entrada, nem rolagem suave. */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* -----------------------------------------------------------------------
     Ano do rodape — evita ter que lembrar de trocar em janeiro.
     ----------------------------------------------------------------------- */
  var ano = document.getElementById('ano');
  if (ano) { ano.textContent = new Date().getFullYear(); }


  /* -----------------------------------------------------------------------
     1. MENU HAMBURGUER
     O CSS ja esconde o menu abaixo de 900px. O JS so alterna o atributo
     data-open e mantem aria-expanded em dia para leitor de tela.
     ----------------------------------------------------------------------- */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav-principal');

  function fecharMenu() {
    if (!toggle || !nav) { return; }
    nav.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu de navegacao');
  }

  function abrirMenu() {
    nav.setAttribute('data-open', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu de navegacao');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') { fecharMenu(); }
      else { abrirMenu(); }
    });

    /* Clicou num link do menu: fecha antes de rolar */
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { fecharMenu(); }
    });

    /* Esc fecha e devolve o foco pro botao */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        fecharMenu();
        toggle.focus();
      }
    });

    /* Clique fora do menu tambem fecha */
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') !== 'true') { return; }
      if (!nav.contains(e.target) && !toggle.contains(e.target)) { fecharMenu(); }
    });

    /* Girou o celular / esticou a janela pro desktop: some com o painel aberto */
    var mqDesktop = window.matchMedia('(min-width: 901px)');
    var onDesktop = function (e) { if (e.matches) { fecharMenu(); } };
    if (mqDesktop.addEventListener) { mqDesktop.addEventListener('change', onDesktop); }
    else if (mqDesktop.addListener) { mqDesktop.addListener(onDesktop); }
  }


  /* -----------------------------------------------------------------------
     2. SOMBRA DO HEADER AO ROLAR
     O evento de scroll dispara dezenas de vezes por segundo; requestAnimation
     Frame agrupa tudo num unico calculo por quadro, entao nao trava a rolagem.
     ----------------------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  var ticking = false;

  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    window.requestAnimationFrame(function () {
      if (header) { header.classList.toggle('is-scrolled', window.scrollY > 8); }
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* -----------------------------------------------------------------------
     3. ANIMACAO DE ENTRADA
     Como funciona, em tres partes:

     a) No HTML, todo bloco que deve animar tem class="reveal".
        Alguns tem data-delay="1|2|3" — e so um transition-delay no CSS, para
        os cards de um mesmo grid entrarem em cascata em vez de todos juntos.

     b) No CSS, ".js .reveal" comeca invisivel e 16px abaixo; ".is-in" devolve
        opacidade 1 e posicao zero, com transicao de 0,65s. A animacao inteira
        e do CSS — o JS so poe e tira a classe.

     c) Aqui, o IntersectionObserver avisa quando o elemento entra na area
        visivel. rootMargin '-8%' embaixo faz o bloco animar um pouco depois
        de assomar na tela (fica mais natural que disparar no pixel exato), e
        unobserve() desliga a observacao do elemento assim que ele aparece:
        anima uma vez so, e o observer vai ficando mais leve conforme a pessoa
        desce a pagina.

     Duas saidas de emergencia: se a pessoa pediu menos movimento no sistema,
     ou se o navegador nao tem IntersectionObserver, tudo recebe .is-in de uma
     vez e a pagina aparece pronta, sem animacao nenhuma.

     (E por isso que a classe .js existe: o CSS so esconde .reveal quando o
     JavaScript esta ligado. Com JS desativado, nada some.)
     ----------------------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }


  /* -----------------------------------------------------------------------
     4. DESTAQUE DO LINK DA SECAO VISIVEL
     Mesmo mecanismo, outra finalidade. A rootMargin '-45% 0px -50% 0px'
     encolhe a area de deteccao para uma faixa fina no meio da tela: a secao
     "ativa" e a que esta passando pelo centro, e nao a que encostou na borda.
     ----------------------------------------------------------------------- */
  var secoes = document.querySelectorAll('main section[id]');
  var links = {};

  Array.prototype.forEach.call(document.querySelectorAll('.nav-list a[href^="#"]'), function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window && secoes.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (!link) { return; }
        if (entry.isIntersecting) {
          Array.prototype.forEach.call(document.querySelectorAll('.nav-list a'), function (a) {
            a.classList.remove('is-active');
          });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Array.prototype.forEach.call(secoes, function (s) { spy.observe(s); });
  }

})();
