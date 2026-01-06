// main.js (clean, page-safe)

// ===== Global: Nav + Back-to-top =====
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const backTop = document.querySelector(".back-to-top");

  // ✅ Create ONE floating "Quick Commission" button (site-wide) if not present
  let quickBtn = document.querySelector(".quick-commission");
  if (!quickBtn) {
    quickBtn = document.createElement("a");
    quickBtn.className = "quick-commission";
    quickBtn.href = "contact.html#commission";
    quickBtn.setAttribute("aria-label", "快速委託");
    quickBtn.innerHTML = "✦ 快速委託";
    document.body.appendChild(quickBtn);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
  }

  // ✅ Back-to-top + Quick Commission: show/hide together, quick is lower, same speed.
  if (backTop) {
    const THRESHOLD = 260; // keep your original feel
    const GAP = 56;        // distance between buttons
    const BASE = 16;       // bottom padding
    const FOOTER_GAP = 12; // keep away from footer

    const footer = document.querySelector(".site-footer");

    const applyFloatingPos = (push) => {
      // quick is lower
      if (quickBtn) quickBtn.style.bottom = `${BASE + push}px`;
      // backTop is above quick
      backTop.style.bottom = `${BASE + GAP + push}px`;
    };

    const onScroll = () => {
      const visible = window.scrollY > THRESHOLD;
      backTop.classList.toggle("show", visible);
      if (quickBtn) quickBtn.classList.toggle("show", visible);

      // push up when footer enters viewport (if footer exists)
      let push = 0;
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const vh = window.innerHeight;
        if (footerTop < vh) {
          push = (vh - footerTop) + FOOTER_GAP;
        }
      }
      applyFloatingPos(push);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

// ===== Scroll Reveal (all pages) =====
document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll(
    ".card, .hero, .gallery-work, .info-box, .contact-block"
  );
  if (!targets.length) return;

  targets.forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el) => io.observe(el));
});

// ===== Simple Carousel (index only) =====
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".carousel-track");
  const slides = Array.from(track?.querySelectorAll("img") || []);
  const prevBtn = carousel.querySelector(".carousel-btn.prev");
  const nextBtn = carousel.querySelector(".carousel-btn.next");
  const dotsWrap = carousel.querySelector(".carousel-dots");
  if (!track || !slides.length || !dotsWrap) return;

  let index = 0;
  let timer = null;

  // dots
  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "carousel-dot" + (i === 0 ? " is-active" : "");
    d.setAttribute("aria-label", `切到第 ${i + 1} 張`);
    d.addEventListener("click", () => go(i, true));
    dotsWrap.appendChild(d);
  });
  const dots = Array.from(dotsWrap.querySelectorAll(".carousel-dot"));

  function render() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }
  function go(i, userAction = false) {
    index = (i + slides.length) % slides.length;
    render();
    if (userAction) restart();
  }
  function next() {
    go(index + 1);
  }
  function prev() {
    go(index - 1);
  }

  function start() {
    timer = setInterval(next, 3500);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  function restart() {
    stop();
    start();
  }

  nextBtn?.addEventListener("click", () => go(index + 1, true));
  prevBtn?.addEventListener("click", () => go(index - 1, true));

  // hover/touch pause
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("touchstart", stop, { passive: true });
  carousel.addEventListener("touchend", start);

  // swipe (mobile)
  let startX = 0;
  let dragging = false;

  carousel.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    stop();
  });

  carousel.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) go(index + 1, true);
      else go(index - 1, true);
    } else {
      start();
    }
  });

  carousel.addEventListener("pointercancel", () => {
    dragging = false;
    start();
  });

  start();
});

// ===== Works: Filter + Search (works.html) =====
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("workGrid");
  if (!grid) return;

  const chips = Array.from(document.querySelectorAll(".filter-chip[data-work-filter]"));
  const search = document.getElementById("workSearch");
  const cards = Array.from(grid.querySelectorAll(".gallery-work"));
  if (!cards.length) return;

  let currentFilter = "all";
  let currentQuery = "";

  const normalize = (s) => (s || "").toString().toLowerCase().trim();

  function cardText(card) {
    const title = card.querySelector(".gallery-title")?.textContent || "";
    const desc = card.querySelector(".gallery-text")?.textContent || "";
    const kw = card.getAttribute("data-keywords") || "";
    const chipText = Array.from(card.querySelectorAll(".chip"))
      .map((c) => c.textContent)
      .join(" ");
    return normalize(`${title} ${desc} ${kw} ${chipText}`);
  }

function apply() {
  const q = normalize(currentQuery);
  cards.forEach((card) => {
    const type = card.getAttribute("data-type") || "";
    const matchType = currentFilter === "all" || type === currentFilter;
    const matchQuery = !q || cardText(card).includes(q);

    card.classList.toggle("is-hidden", !(matchType && matchQuery));
  });
}


  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.getAttribute("data-work-filter") || "all";
      chips.forEach((b) => b.classList.toggle("is-active", b === btn));
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", () => {
      currentQuery = search.value;
      apply();
    });
  }

  apply();
});

// ===== Works Modal (點圖片/點按鈕都能開) =====
(function setupWorksModal() {
  const modal = document.getElementById("workModal");
  if (!modal) return;

  const modalTitle = document.getElementById("workModalTitle");
  const modalContent = document.getElementById("workModalContent");
  const backdrop = modal.querySelector(".gallery-modal-backdrop");
  const closeBtn = modal.querySelector(".gallery-modal-close");
  
  const sharedTpl = document.getElementById("worksSharedTemplate");

const PROCESS = [
  { item: "01", desc: "需求確認（用途/尺寸/期限/風格）" },
  { item: "02", desc: "草稿確認（可修改3次）" },
  { item: "03", desc: "線稿（可修改2次）" },
  { item: "04", desc: "上色（不動線稿無條件修改）" },
  { item: "05", desc: "交稿（可小幅度修改1次）提供檔案：PNG/JPG/PSD 拆分另談" }
];


  const WORKS_DATA = {
    "full": {
      title: "全身立繪",
      lead: "完整角色造型與服裝細節展示，適合角色卡、設定稿、作品展示。",
      samples: [
        { src: "images/mio.JPG", alt: "全身立繪範例", caption: "全身立繪｜範例" },
        { src: "images/miocity.JPG", alt: "全身立繪範例", caption: "全身立繪｜範例" },
        { src: "images/fullzyu.jpg", alt: "全身立繪範例", caption: "全身立繪｜範例" },
        { src: "images/entrustfull.JPEG", alt: "全身立繪範例", caption: "全身立繪｜範例" },
        { src: "images/koyanaall.JPG", alt: "全身立繪範例", caption: "全身立繪｜範例" },
        { src: "images/fullessay.jpg", alt: "全身立繪範例", caption: "全身立繪｜範例" }

      ],
      priceTable: [
        { item: "全身（單人）", desc: "完整服裝設計、簡單背景/純色", price: "NT$ 1000 ~ 1400" },
        { item: "雙人", desc: "同畫面兩人（以單人價格×2為基準）", price: "×2" },
        { item: "加購：複雜服飾/道具", desc: "盔甲、機械、花紋密集等", price: "+ NT$ 200 ~ 600" },
        { item: "加購：背景", desc: "簡背景/室內/街景等", price: "+ NT$ 200 ~ 800" }
      ],
      priceTable2: PROCESS,
      details: ["若要做「設定稿多視角」或「服設拆件」，可另開一項報價。"]
    },
    "half": {
      title: "半身胸像",
      lead: "著重表情與氣氛的角色呈現，適合頭貼、社群封面、角色卡。",
      samples: [
        { src: "images/yuehaif.PNG", alt: "半身胸像範例", caption: "半身胸像｜範例" },
        { src: "images/queen.JPG", alt: "半身胸像範例", caption: "半身胸像｜範例" },
        { src: "images/killer.JPG", alt: "半身胸像範例", caption: "半身胸像｜範例" },
        { src: "images/koyana.JPG", alt: "半身胸像範例", caption: "半身胸像｜範例" },
        { src: "images/hbdhard.JPG", alt: "半身胸像範例", caption: "半身胸像｜範例" },
        { src: "images/cat.JPG", alt: "半身胸像範例", caption: "半身胸像｜範例" },

      ],
      priceTable: [
        { item: "半身（單人）", desc: "含服裝細節、簡單背景/純色", price: "NT$ 500 ~ 700" },
        { item: "雙人", desc: "同畫面兩人（以單人價格×2為基準）", price: "×2" },
        { item: "加購：道具/小動物", desc: "小型配件、簡單道具", price: "+ NT$ 100 ~ 300" }
      ],
      priceTable2: PROCESS,
      details: ["想要更像「封面插圖」的完整氛圍，可以改走插畫項目另報。"]
    },
    "costume": {
      title: "服裝設計",
      lead: "以服裝概念、配色、材質與細節為主的設計呈現。",
      samples: [
        { src: "images/CD.JPG", alt: "服裝設計範例", caption: "服裝設計｜範例" },
        { src: "images/CD1.jpg", alt: "服裝設計範例", caption: "服裝設計｜範例" },
        { src: "images/CD2.jpg", alt: "服裝設計範例", caption: "服裝設計｜範例" }
      ],
      priceTable: [
        { item: "服設（單套）", desc: "正面主視覺＋重點細節", price: "NT$ 900 ~ 1500" },
        { item: "加購：背面/側面", desc: "補足全方位視角", price: "+ NT$ 200 ~ 600" },
        { item: "加購：配件拆圖", desc: "飾品、鞋、包、武器等", price: "+ NT$ 200 ~ 800" }
      ],
      priceTable2: PROCESS,
      details: ["若你有世界觀/職業/元素關鍵字，我可以做更明確的設計推導。"]
    },
    "duo-atmo": {
      title: "氛圍插圖",
      lead: "互動與氛圍為重點，適合CP向、紀念圖、劇情插圖。",
      samples: [
        { src: "images/yuezeyzu.JPG", alt: "氛圍插圖範例", caption: "氛圍插圖｜範例" },
        { src: "images/hbdbar.JPG", alt: "氛圍插圖範例", caption: "氛圍插圖｜範例" },
        { src: "images/hbdidol.JPG", alt: "氛圍插圖範例", caption: "氛圍插圖｜範例" },
        { src: "images/Vox3rd.png", alt: "氛圍插圖範例", caption: "氛圍插圖｜範例" },
        { src: "images/hibali.JPG", alt: "氛圍插圖範例", caption: "氛圍插圖｜範例" },
        { src: "images/miolove.JPG", alt: "氛圍插圖範例", caption: "氛圍插圖｜範例" },
      ],
      priceTable: [
        { item: "氛圍插圖", desc: "+簡背景（構圖依需求）", price: "NT$ 700 起" },
        { item: "雙人", desc: "同畫面兩人（以單人價格×2為基準）", price: "×2" },
        { item: "加購：複雜背景", desc: "室內/街景/花紋密集", price: "+ NT$ 100 ~ 300" },
        { item: "加購：特效", desc: "光效、粒子、魔法感", price: "+ NT$ 50 ~ 200" }
      ],
      priceTable2: PROCESS,
      details: ["若要仿官插構圖/氛圍，請參考仿官項目。"]
    },
    "duo-dream": {
      title: "仿官插圖",
      lead: "偏「官方宣傳插畫」感的排版與氣氛，適合夢向或主題活動。",
      samples: [
        { src: "images/entrust2p.JPG", alt: "夢向仿官插圖範例", caption: "夢向仿官插圖｜範例" },
        { src: "images/IO2p.JPG", alt: "夢向仿官插圖範例", caption: "夢向仿官插圖｜範例" },
        { src: "images/entrust1p.JPG", alt: "仿官插圖範例", caption: "仿官插圖｜範例" },
      ],
      priceTable: [
        { item: "仿官插畫", desc: "氛圍＋可含簡單文字排版", price: "NT$ 500 起" },
        { item: "雙人", desc: "同畫面兩人（以單人價格×2為基準）", price: "×2" },
        { item: "加購：版面設計", desc: "標題字、活動感排版", price: "+ NT$ 100 ~ 200" },
        { item: "加購：複雜背景", desc: "場景細節較多", price: "+ NT$ 100 ~ 300" }
      ],
      priceTable2: PROCESS,
      details: ["如果你想走完全「灰階」或特殊色調，也可以當作指定風格。"]
    },
    "chibi": {
      title: "Q版大頭",
      lead: "可愛Q版頭像，適合貼圖、社群頭貼、驚喜小禮物。",
      samples: [
        { src: "images/QQ1.PNG", alt: "Q版大頭範例", caption: "Q版大頭｜範例" },
        { src: "images/QQhead.PNG", alt: "Q版大頭範例", caption: "Q版大頭｜範例" },
        { src: "images/QQ2.PNG", alt: "Q版大頭範例", caption: "Q版大頭｜範例" },
        { src: "images/QQhead2.PNG", alt: "Q版大頭範例", caption: "Q版大頭｜範例" },
        { src: "images/QQhead3.PNG", alt: "Q版大頭範例", caption: "Q版大頭｜範例" },
        { src: "images/QQhead4.PNG", alt: "Q版大頭範例", caption: "Q版大頭｜範例" },
      ],
      priceTable: [
        { item: "Q版大頭（單人）", desc: "簡單表情＋小裝飾", price: "NT$ 300 ~ 500" },
        { item: "加購：多表情", desc: "加做1個表情/版本", price: "+ NT$ 100 ~ 200" },
        { item: "雙人", desc: "同框雙人Q版", price: "+ NT$ 200 ~ 400" }
      ],
      priceTable2: PROCESS,
      details: ["若要做成「貼圖套組」，可以直接說你想要的張數。"]
    }
  };


  // 小放大：在 modal 裡點圖，會再跳一層小 viewer（避免整頁跳）
function openZoom(src, alt) {
  if (!src) return;

  // ✅ 永遠只留一層（避免堆疊）
  modal.querySelectorAll(".img-zoom").forEach((n) => n.remove());

  const wrap = document.createElement("div");
  wrap.className = "img-zoom";
  wrap.innerHTML = `
    <div class="img-zoom-backdrop" role="button" aria-label="關閉放大"></div>
    <div class="img-zoom-dialog" role="dialog" aria-modal="true">
      <button type="button" class="img-zoom-close" aria-label="關閉">×</button>
      <img class="img-zoom-img" src="${src}" alt="${alt || "作品"}">
    </div>
  `;
  modal.appendChild(wrap);

  const onKey = (e) => {
    if (e.key === "Escape") kill();
  };

  const kill = () => {
    wrap.remove();
    document.removeEventListener("keydown", onKey);
  };

  wrap.querySelector(".img-zoom-backdrop")?.addEventListener("click", kill);
  wrap.querySelector(".img-zoom-close")?.addEventListener("click", kill);
  document.addEventListener("keydown", onKey);
  wrap.querySelector(".img-zoom-img")?.addEventListener("click", kill);

}


  function openModal(card) {
  const type = card?.getAttribute("data-type") || card?.dataset?.open || "";
  const data = WORKS_DATA[type];

  modalTitle.textContent = data ? `${data.title}｜查看更多&價目` : "查看更多&價目";

  if (modalContent) {
    const sharedWrap = sharedTpl ? sharedTpl.innerHTML : "";

    if (!data) {
      modalContent.innerHTML = sharedWrap || "<div class='works-modal'><p class='works-modal-lead'>找不到此項目資料。</p></div>";
    } else {
      const samplesHtml = (data.samples || []).map(s => `
        <figure class="works-modal-sample">
          <img src="${s.src}" alt="${s.alt}">
          <figcaption>${s.caption || ""}</figcaption>
        </figure>
      `).join("");

      // 兼容兩種資料結構：
      // - 舊版：priceTable: [{ item, desc, price }]
      // - 新版：priceTable1(報價) + priceTable2(流程)
      const priceRows = (data.priceTable1 || data.priceTable || []).map(r => `
        <tr>
          <td>${r.item ?? ""}</td>
          <td>${r.desc ?? ""}</td>
          <td>${r.price ?? ""}</td>
        </tr>
      `).join("");

      const flowRows = (data.priceTable2 || []).map(r => `
        <tr>
          <td>${r.item ?? ""}</td>
          <td>${r.desc ?? ""}</td>
        </tr>
      `).join("");

      const detailsHtml = (data.details || []).map(t => `<li>${t}</li>`).join("");

      modalContent.innerHTML = `
        <div class="works-modal">
          <div class="works-modal-head">
            <p class="works-modal-lead">${data.lead || ""}</p>
          </div>

          <h3 class="works-modal-h3">此項目範例圖 <small>Samples</small></h3>
          <div class="works-modal-samples">${samplesHtml}</div>

          <h3 class="works-modal-h3">此項目報價 <small>Price</small></h3>
          <div class="works-modal-price">
            <table class="commission-table">
              <thead>
                <tr><th>項目</th><th>內容說明</th><th>價格（TWD）</th></tr>
              </thead>
              <tbody>${priceRows || "<tr><td colspan='3'>尚未設定此項目報價</td></tr>"}</tbody>
            </table>
          </div>

          ${flowRows ? `
            <h3 class="works-modal-h3">委託流程 <small>Process</small></h3>
            <div class="works-modal-price">
              <table class="commission-table is-flow">
                <thead>
                  <tr><th>步驟</th><th>說明</th></tr>
                </thead>
                <tbody>${flowRows}</tbody>
              </table>
            </div>
          ` : ""}

          ${detailsHtml ? `
            <h3 class="works-modal-h3">補充說明 <small>Details</small></h3>
            <ul class="simple-list works-modal-notes">${detailsHtml}</ul>
          ` : ""}

          ${sharedWrap ? sharedWrap.replace(/^[\s\S]*?<div class="works-modal">|<\/div>[\s\S]*?$/g, "") : ""}
        </div>
      `;


    }
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  // ✅ FIX：每次開啟 modal 都回到最上方
const scroller = document.getElementById("workModalContent");
if (scroller) {
  scroller.scrollTop = 0;
}

}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  // 保險：關閉時也重置
  const scroller = document.getElementById("workModalContent");
  if (scroller) {
    scroller.scrollTop = 0;
  }
}

// ✅ 點範例圖 → 放大（只綁一次，避免越開越多次）
modalContent?.addEventListener("click", (e) => {
  const fig = e.target.closest(".works-modal-sample");
  if (!fig) return;

  const img = fig.querySelector("img");
  if (!img) return;

  openZoom(img.src, img.alt);
});


  // 點「整張卡」或圖片或按鈕都能開（但不吃到搜尋欄/連結）
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".gallery-work");
    if (!card) return;

    // 若點到真正的互動元件（連結/輸入框等）就不要強制開
    if (e.target.closest("a") && !e.target.closest(".js-work-modal")) return;
    if (e.target.closest("input, textarea, select, label")) return;

    e.preventDefault();
    openModal(card);
  });

  backdrop?.addEventListener("click", closeModal);
  closeBtn?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
})();

// ===== Index: Status bars animate when visible =====
document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("statusPanel");
  if (!panel) return;

  const bars = Array.from(panel.querySelectorAll(".status-bar[data-value]"));
  if (!bars.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function play() {
    panel.classList.add("is-animate");
    bars.forEach((bar, i) => {
      const v = Math.max(0, Math.min(100, Number(bar.dataset.value || 0)));
      const fill = bar.querySelector(".status-fill");
      if (!fill) return;

      if (reduceMotion) {
        fill.style.transition = "none";
        fill.style.width = v + "%";
        return;
      }

      // 依序長出來更有爽感
      setTimeout(() => {
        fill.style.width = v + "%";
      }, 120 + i * 90);
    });
  }

  // 進入視窗才觸發一次
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          play();
          io.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );

  io.observe(panel);
});
// ===== Scroll Reveal (for .reveal) =====
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();

// ===== MyImages: Grid Filter + Search + Modal (myimages.html) =====
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("myimagesGrid");
  if (!grid) return;

  const chips = Array.from(document.querySelectorAll(".filter-chip[data-img-filter]"));
  const search = document.getElementById("myimagesSearch");
  const cards = Array.from(grid.querySelectorAll(".myimages-item"));

  let currentFilter = "all";
  let currentQuery = "";

  const normalize = (s) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();

  function cardText(card) {
    const title = card.getAttribute("data-title") || card.querySelector(".myimages-title")?.textContent || "";
    const desc = card.getAttribute("data-desc") || card.querySelector(".myimages-desc")?.textContent || "";
    const tags = card.getAttribute("data-tags") || "";
    return normalize(`${title} ${desc} ${tags}`);
  }

  function apply() {
    const q = normalize(currentQuery);
    cards.forEach((card) => {
      const type = card.getAttribute("data-type") || "";
      const matchType = currentFilter === "all" || type === currentFilter;
      const matchQuery = !q || cardText(card).includes(q);
      card.classList.toggle("myimages-hidden", !(matchType && matchQuery));
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      currentFilter = chip.getAttribute("data-img-filter") || "all";
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", (e) => {
      currentQuery = e.target.value;
      apply();
    });
  }

  // ---- Modal ----
  const modal = document.getElementById("myimagesModal");
  const modalImg = document.getElementById("myimagesModalImg");
  const modalText = document.getElementById("myimagesModalText");
  const closeBtns = Array.from(document.querySelectorAll("[data-myimages-close]"));

const openModal = (card) => {
  const img = card.querySelector("img");
  if (!img) return;

  const title = card.getAttribute("data-title") || img.alt || "";
  const desc = card.getAttribute("data-desc") || "";
  const tags = card.getAttribute("data-tags") || "";

  // ✅ 重要：src 沒有就改用 data-src
  const src = img.getAttribute("src") || img.getAttribute("data-src");
  if (!src) return;

  // ✅ 若縮圖還沒載入，先補上 src（避免 modal 空白）
  if (!img.getAttribute("src") && img.getAttribute("data-src")) {
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  }

  modalImg.src = src;          // modal 顯示用（也可改成大圖 src）
  modalImg.alt = title;

  const tagLine = tags
    ? `<div class="myimages-modal-tags">${
        tags.split(/\s+/).filter(Boolean).map(t => `<span class="chip">${t}</span>`).join("")
      }</div>`
    : "";

  modalText.innerHTML = `
    <h3 class="myimages-modal-title">${title}</h3>
    <p class="myimages-modal-desc">${(desc || "").replace(/\n/g, "<br>")}</p>
    ${tagLine}
  `;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");

  const dialog = modal.querySelector(".myimages-modal-dialog");
  if (dialog) dialog.scrollTop = 0;
  modal.scrollTop = 0;

  document.body.style.overflow = "hidden";
};

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // reset src，避免你說的「第二次點其他圖點不開」/ 圖不刷新狀況
    modalImg.removeAttribute("src");
    modalImg.alt = "";
  };

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".myimages-thumb-btn");
    if (!btn) return;
    const card = btn.closest(".myimages-item");
    if (!card) return;
    openModal(card);
  });

  closeBtns.forEach((b) => b.addEventListener("click", closeModal));

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  apply();
});
/* =========================
   Add-ons: Accordion / Copy / Mailto / Status / Floating CTA
   ========================= */
(function(){
  // Toast
  const toast = (() => {
    const el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
    let t = null;
    return (msg) => {
      el.textContent = msg;
      el.classList.add("is-show");
      clearTimeout(t);
      t = setTimeout(()=> el.classList.remove("is-show"), 1400);
    };
  })();

  // Accordion (FAQ)
  document.querySelectorAll("[data-accordion]").forEach((wrap) => {
    wrap.querySelectorAll(".faq-q").forEach((btn) => {
      btn.addEventListener("click", () => {
        const a = btn.nextElementSibling;
        const open = btn.classList.toggle("is-open");
        if (a) a.classList.toggle("is-open", open);
      });
    });
  });

  // Copy helper: <button class="js-copy" data-copy="#id">
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".js-copy");
    if (!btn) return;
    const sel = btn.getAttribute("data-copy");
    const box = sel ? document.querySelector(sel) : null;
    if (!box) return;
    const text = box.innerText || box.textContent || "";
    try{
      await navigator.clipboard.writeText(text.trim());
      toast("已複製 ✅");
    }catch{
      toast("複製失敗（瀏覽器限制）");
    }
  });

  // Copy Email button
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".js-copy-email");
    if (!btn) return;
    const email = btn.getAttribute("data-email");
    if (!email) return;
    try{
      await navigator.clipboard.writeText(email);
      toast("Email 已複製 ✅");
    }catch{
      toast("複製失敗（瀏覽器限制）");
    }
  });

  // Commission status cycle (for you)
  const statusMap = [
    { key:"open", text:"委託開放中", sub:"可排到：2026 / 01" },
    { key:"busy", text:"排程較滿", sub:"可排到：2026 / 02" },
    { key:"closed", text:"暫停接單", sub:"可先排隊／等候名單" },
  ];
  const applyPill = (pill, subEl) => {
    if (!pill) return;
    const k = localStorage.getItem("commissionStatus") || "open";
    const cur = statusMap.find(s=>s.key===k) || statusMap[0];
    pill.dataset.status = cur.key;
    const t = pill.querySelector(".status-text");
    const s = pill.querySelector(".status-subtext");
    if (t) t.textContent = cur.text;
    if (s) s.textContent = cur.sub;
    if (subEl) subEl.textContent = cur.sub;
  };

  const pill1 = document.getElementById("commissionPill");
  const pill2 = document.getElementById("commissionPillWorks");
  applyPill(pill1, document.getElementById("commissionSubtext"));
  applyPill(pill2);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-status-cycle");
    if (!btn) return;
    const now = localStorage.getItem("commissionStatus") || "open";
    const idx = statusMap.findIndex(s=>s.key===now);
    const next = statusMap[(idx+1) % statusMap.length];
    localStorage.setItem("commissionStatus", next.key);
    applyPill(pill1, document.getElementById("commissionSubtext"));
    applyPill(pill2);
    toast("狀態已更新");
  });

  // Floating quick commission CTA (site-wide)
  if (!document.querySelector(".quick-commission")){
    const a = document.createElement("a");
    a.className = "quick-commission";
    a.href = "contact.html#commission";
    a.innerHTML = `<span>✦</span> 快速委託`;
    document.body.appendChild(a);
  }

  // Contact form -> mailto (no backend)
const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value || "（未填）";
    const email = document.getElementById("email")?.value || "（未填）";
    const type = document.getElementById("type")?.value || "一般問題";
    const msg = document.getElementById("message")?.value || "（未填）";

    const content =
`【IGU 聯絡表單】
稱呼：${name}
Email：${email}
類型：${type}

內容：
${msg}
`;

    // ✅ 1. 先「同步」開 Gmail（一定成功）
const to = "michaela950327@gmail.com";
const subject = `[IGU 委託/詢問] ${type} - ${name}`;

const gmailUrl =
  "https://mail.google.com/mail/?view=cm&fs=1" +
  `&to=${encodeURIComponent(to)}` +
  `&su=${encodeURIComponent(subject)}` +
  `&body=${encodeURIComponent(content)}`;

window.open(gmailUrl, "_blank");


    // ✅ 2. 再嘗試複製內容（失敗也不影響開 Gmail）
    navigator.clipboard.writeText(content).then(() => {
      alert("內容已複製，請在 Gmail 直接貼上（Ctrl + V）");
    }).catch(() => {
      alert("請手動複製內容後貼到 Gmail");
      console.log(content);
    });
  });
}})();

// ===== FIX: Back-to-top 不要壓到 footer =====
(function(){
  const btn = document.querySelector(".back-to-top");
  const footer = document.querySelector(".site-footer");
  if (!btn || !footer) return;

  const baseBottom = 16;

  const updatePos = () => {
    const footerTop = footer.getBoundingClientRect().top;
    const vh = window.innerHeight;

    if (footerTop < vh){
      const overlap = vh - footerTop + 12;
      btn.style.bottom = `${baseBottom + overlap}px`;
    }else{
      btn.style.bottom = `${baseBottom}px`;
    }
  };

  window.addEventListener("scroll", updatePos, { passive:true });
  window.addEventListener("resize", updatePos);
})();
// ===== FIX: quick-commission 最低停在 footer 上緣 =====
// ✅ 讓「快速委託」浮動按鈕：最低停在 footer 上方（不壓到 footer）
(function(){
  const btn = document.querySelector(".quick-commission");
  const footer = document.querySelector(".site-footer");
  if (!btn || !footer) return;

  const baseBottom = 16; // 平常離底部距離
  const gap = 12;        // 與 footer 保持距離

  const update = () => {
    const footerTop = footer.getBoundingClientRect().top;
    const vh = window.innerHeight;

    // footer 進入視窗 → 把按鈕往上推
    if (footerTop < vh) {
      const push = (vh - footerTop) + gap;
      btn.style.bottom = `${baseBottom + push}px`;
    } else {
      btn.style.bottom = `${baseBottom}px`;
    }
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
// ===== 浮動按鈕：快速委託在下、回到頁首在上（一起避開 footer）=====
(function(){
  const footer = document.querySelector(".site-footer");
  const cta = document.querySelector(".quick-commission");
  const backTop = document.querySelector(".back-to-top");
  if (!footer) return;

  const baseCTA = 16;    // 快速委託基準（最低）
  const gap = 56;        // 兩顆之間距離

  const update = () => {
    const footerTop = footer.getBoundingClientRect().top;
    const vh = window.innerHeight;

    let push = 0;
    if (footerTop < vh){
      push = (vh - footerTop) + 12;
    }

    if (cta){
      cta.style.bottom = `${baseCTA + push}px`;
    }

    if (backTop){
      backTop.style.bottom = `${baseCTA + gap + push}px`;
    }
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
// ===== Hide quick-commission on homepage hero =====
(function(){
  const btn = document.querySelector(".quick-commission");
  if (!btn) return;

  // 只在首頁做這件事
  const hero =
    document.querySelector(".hero") ||
    document.querySelector(".carousel") ||
    document.querySelector(".hero-carousel");

  if (!hero) return; // 不是首頁或找不到輪播，就不處理

  const update = () => {
    const rect = hero.getBoundingClientRect();
    const passedHero = rect.bottom <= 0; 
    btn.classList.toggle("is-hidden", !passedHero);
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
// === 延後載入輪播圖片 ===
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const imgs = Array.from(track.querySelectorAll('img'));

  function loadImage(img) {
    if (!img || !img.dataset || !img.dataset.src) return;
    if (!img.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  }

  // 預載第二張（1 秒後）
  setTimeout(() => loadImage(imgs[1]), 1000);

  // 監聽輪播按鈕
  document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      imgs.forEach(loadImage);
    });
  });

  // IntersectionObserver：真正進視窗才載
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        loadImage(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '200px' });

    imgs.forEach(img => {
      if (img.dataset && img.dataset.src) io.observe(img);
    });
  }
});
// === myimages 真・延遲載入系統 ===
document.addEventListener('DOMContentLoaded', () => {
  const imgs = document.querySelectorAll('.myimages-thumb[data-src]');
  if (!imgs.length) return;

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      observer.unobserve(img);
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => io.observe(img));
});
// === works 真・延遲載入系統 ===
document.addEventListener("DOMContentLoaded", () => {
  const imgs = document.querySelectorAll(".work-thumb[data-src]");
  if (!imgs.length) return;

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
      observer.unobserve(img);
    });
  }, { rootMargin: "200px" });

  imgs.forEach(img => io.observe(img));
});
// ===== Theme Toggle =====
(() => {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const root = document.documentElement;

  // 讀取上次狀態
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    root.classList.add('dark');
    btn.textContent = '☀️';
  }

  btn.addEventListener('click', () => {
    root.classList.toggle('dark');

    const isDark = root.classList.contains('dark');
    btn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
})();
