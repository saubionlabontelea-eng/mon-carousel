class FanCarousel extends HTMLElement {

  // ✏️ MODIFIE ICI — tes images et les pages Wix vers lesquelles elles pointent
  get slides() {
    return [
      { img: "https://ton-site.com/image1.jpg", label: "Lookbook", url: "/lookbook" },
      { img: "https://ton-site.com/image2.jpg", label: "Shop",     url: "/shop" },
      { img: "https://ton-site.com/image3.jpg", label: "About",    url: "/about" },
      { img: "https://ton-site.com/image4.jpg", label: "Contact",  url: "/contact" },
      { img: "https://ton-site.com/image5.jpg", label: "Blog",     url: "/blog" },
    ];
  }

  connectedCallback() {
    this.cur = 0;
    this.build();
  }

  getPos(i) {
    const n = this.slides.length;
    const diff = ((i - this.cur) % n + n) % n;
    if (diff === 0)     return 'center';
    if (diff === 1)     return 'right1';
    if (diff === 2)     return 'right2';
    if (diff === n - 1) return 'left1';
    if (diff === n - 2) return 'left2';
    return 'hidden';
  }

  build() {
    this.innerHTML = `
      <style>
        :host { display:block; background:#0a0a0a; padding:2rem 0 1.5rem; }
        .stage {
          position:relative; width:100%; height:300px;
          display:flex; align-items:center; justify-content:center;
          perspective:900px; overflow:hidden;
        }
        .slide {
          position:absolute; width:210px; height:275px;
          border-radius:3px; overflow:hidden; cursor:pointer;
          transition: all 0.55s cubic-bezier(0.25,0.46,0.45,0.94);
          transform-style:preserve-3d;
        }
        .slide img { width:100%; height:100%; object-fit:cover; display:block; pointer-events:none; }
        .center { z-index:5; transform:translateX(0) translateZ(60px) scale(1) rotateY(0deg); filter:brightness(1); }
        .left1  { z-index:3; transform:translateX(-175px) translateZ(-10px) scale(0.88) rotateY(42deg);  filter:brightness(0.6); }
        .left2  { z-index:2; transform:translateX(-295px) translateZ(-60px) scale(0.72) rotateY(55deg);  filter:brightness(0.35); }
        .right1 { z-index:3; transform:translateX(175px)  translateZ(-10px) scale(0.88) rotateY(-42deg); filter:brightness(0.6); }
        .right2 { z-index:2; transform:translateX(295px)  translateZ(-60px) scale(0.72) rotateY(-55deg); filter:brightness(0.35); }
        .hidden { opacity:0; pointer-events:none; transform:translateX(0) scale(0.3) translateZ(-200px); }
        .overlay {
          display:none; position:absolute; inset:0;
          align-items:flex-end; justify-content:center;
          background:linear-gradient(transparent 45%, rgba(0,0,0,0.7));
          padding-bottom:16px;
        }
        .center .overlay { display:flex; }
        .overlay span {
          font-family:monospace; font-size:11px; color:#fff;
          letter-spacing:0.1em; text-transform:uppercase;
          border-bottom:1px solid rgba(255,255,255,0.5); padding-bottom:2px;
        }
        .nav { display:flex; justify-content:center; align-items:center; gap:20px; margin-top:16px; }
        .btn {
          background:none; border:1px solid rgba(255,255,255,0.25); color:#fff;
          width:34px; height:34px; border-radius:50%; cursor:pointer; font-size:15px;
        }
        .dots { display:flex; gap:6px; }
        .dot {
          width:7px; height:7px; border-radius:50%;
          background:rgba(255,255,255,0.2); border:none; cursor:pointer; padding:0;
          transition:background 0.3s, transform 0.2s;
        }
        .dot.active { background:#fff; transform:scale(1.3); }
      </style>

      <div class="stage" id="stage">
        ${this.slides.map((s, i) => `
          <div class="slide ${this.getPos(i)}" data-index="${i}">
            <img src="${s.img}" alt="${s.label}" loading="lazy">
            <div class="overlay"><span>${s.label} &rarr;</span></div>
          </div>
        `).join('')}
      </div>

      <div class="nav">
        <button class="btn" id="prev">&#8592;</button>
        <div class="dots">
          ${this.slides.map((_, i) =>
            `<button class="dot ${i === this.cur ? 'active' : ''}" data-dot="${i}"></button>`
          ).join('')}
        </div>
        <button class="btn" id="next">&#8594;</button>
      </div>
    `;

    // Boutons prev / next
    this.querySelector('#prev').onclick = () => this.goTo(this.cur - 1);
    this.querySelector('#next').onclick = () => this.goTo(this.cur + 1);

    // Points de navigation
    this.querySelectorAll('[data-dot]').forEach(d => {
      d.onclick = () => this.goTo(Number(d.dataset.dot));
    });

    // Clic sur une slide
    this.querySelectorAll('.slide').forEach(el => {
      el.onclick = () => {
        const i = Number(el.dataset.index);
        if (this.getPos(i) === 'center') {
          // Navigation vers la page choisie
          window.location.href = this.slides[i].url;
        } else {
          this.goTo(i);
        }
      };
    });

    // Swipe mobile
    let startX = 0;
    const stage = this.querySelector('#stage');
    stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) this.goTo(this.cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  goTo(i) {
    const n = this.slides.length;
    this.cur = ((i % n) + n) % n;
    this.build();
  }
}

customElements.define('fan-carousel', FanCarousel);
