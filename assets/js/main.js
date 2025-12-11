// ===== КЭШИРОВАНИЕ DOM ЭЛЕМЕНТОВ ===== 
const DOMCache = {
  checkbox: document.getElementById("active"),
  backToTopBtn: document.querySelector(".back-to-top"),
  header: document.querySelector("header"),
  heroBg: document.querySelector(".hero-bg"),
  carouselList: document.querySelector(".carousel__list"),
  lightbox: document.getElementById("story-lightbox"),
  gameField: document.getElementById("gameField"),
  soccerBall: document.getElementById("soccerBall"),
  startBtn: document.getElementById("startBtn"),
  viewport: document.querySelector("#projects .projects-viewport"),
};

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =========
let storySlides = [];
let parallaxAnimationId = null;
let scrollTimeout = null;
const SCROLL_THROTTLE = 100; // ms

document.addEventListener("DOMContentLoaded", () => {
  // ===== OVERLAY MENU: закрытие при клике ===== 
  if (DOMCache.checkbox) {
    document.querySelectorAll(".wrapper ul li a").forEach((link) => {
      link.addEventListener("click", () => {
        DOMCache.checkbox.checked = false;
      });
    });
  }

  // ===== HEADER SCROLL EFFECT + Back To Top ===== 
  window.addEventListener("scroll", handleScroll, { passive: true });

  // ===== SMOOTH SCROLL для якорных ссылок ===== 
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // ===== Back to Top Click ===== 
  if (DOMCache.backToTopBtn) {
    DOMCache.backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // ===== PARALLAX EFFECT (оптимизированный) ===== 
  if (window.innerWidth > 768 && DOMCache.heroBg) {
    document.addEventListener("mousemove", handleParallax, { passive: true });
  }

  // ===== PRELOADER ===== 
  window.addEventListener("load", () => {
    const preloader = document.querySelector(".preloader");
    if (preloader) {
      preloader.classList.add("hidden");
    }
  });

  // ===== CAROUSEL "ИСТОРИЯ" ===== 
  initCarousel();

  // ===== LIGHTBOX ===== 
  initLightbox();

  // ===== GOALKEEPER GAME ===== 
  GoalkeeperGame.init();

  // ===== PROJECTS CAROUSEL ===== 
  initProjectsCarousel();
});

// ========== ОПТИМИЗИРОВАННЫЙ SCROLL HANDLER ==========
function handleScroll() {
  const scrollY = window.scrollY;

  // Header effect
  if (DOMCache.header) {
    if (scrollY > 50) {
      DOMCache.header.classList.add("scrolled");
    } else {
      DOMCache.header.classList.remove("scrolled");
    }
  }

  // Back to top button
  if (DOMCache.backToTopBtn) {
    if (scrollY > 400) {
      DOMCache.backToTopBtn.classList.add("show");
    } else {
      DOMCache.backToTopBtn.classList.remove("show");
    }
  }
}

// ========== ОПТИМИЗИРОВАННЫЙ PARALLAX ==========
function handleParallax(e) {
  if (parallaxAnimationId) {
    cancelAnimationFrame(parallaxAnimationId);
  }

  parallaxAnimationId = requestAnimationFrame(() => {
    if (!DOMCache.heroBg) return;

    const moveX = (e.clientX / window.innerWidth) * 10;
    const moveY = (e.clientY / window.innerHeight) * 10;
    DOMCache.heroBg.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
}

// ========== CAROUSEL "ИСТОРИЯ" ==========
function initCarousel() {
  if (!DOMCache.carouselList) return;

  const carouselItems = DOMCache.carouselList.querySelectorAll(".carousel__item");
  storySlides = Array.from(carouselItems);

  const getPos = (current, active) => {
    const diff = current - active;
    if (Math.abs(current - active) > 2) {
      return -current;
    }
    return diff;
  };

  const update = (newActive) => {
    const newActivePos = newActive.dataset.pos;
    const current = storySlides.find((elem) => elem.dataset.pos === "0");
    const prev = storySlides.find((elem) => elem.dataset.pos === "-1");
    const next = storySlides.find((elem) => elem.dataset.pos === "1");
    const first = storySlides.find((elem) => elem.dataset.pos === "-2");
    const last = storySlides.find((elem) => elem.dataset.pos === "2");

    [current, prev, next, first, last].forEach((item) => {
      if (!item) return;
      const itemPos = item.dataset.pos;
      item.dataset.pos = getPos(Number(itemPos), Number(newActivePos));
    });
  };

  DOMCache.carouselList.addEventListener("click", (event) => {
    const newActive = event.target.closest(".carousel__item");
    if (!newActive) return;
    update(newActive);
  });
}

// ========== LIGHTBOX ==========
function initLightbox() {
  if (!DOMCache.lightbox || !storySlides.length) return;

  const lightboxImg = DOMCache.lightbox.querySelector(".lightbox__img");
  const lightboxCap = DOMCache.lightbox.querySelector(".lightbox__caption");
  const closeBtn = DOMCache.lightbox.querySelector(".lightbox__close");
  const prevBtn = DOMCache.lightbox.querySelector(".lightbox__arrow--prev");
  const nextBtn = DOMCache.lightbox.querySelector(".lightbox__arrow--next");

  let currentSlideIndex = 0;

  const openLightbox = (index) => {
    if (!storySlides[index] || !lightboxImg) return;

    currentSlideIndex = index;
    const img = storySlides[index].querySelector("img");
    if (!img) return;

    const fullSrc = img.dataset.full || img.src;
    lightboxImg.src = fullSrc;
    lightboxImg.alt = img.alt || "";

    if (lightboxCap) {
      lightboxCap.textContent = img.alt || "";
    }

    DOMCache.lightbox.classList.add("lightbox--open");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    DOMCache.lightbox.classList.remove("lightbox--open");
    document.body.style.overflow = "";
  };

  const showPrev = () => {
    if (!storySlides.length) return;
    currentSlideIndex = (currentSlideIndex - 1 + storySlides.length) % storySlides.length;
    openLightbox(currentSlideIndex);
  };

  const showNext = () => {
    if (!storySlides.length) return;
    currentSlideIndex = (currentSlideIndex + 1) % storySlides.length;
    openLightbox(currentSlideIndex);
  };

  // Клики по фото в карточках
  storySlides.forEach((slide, index) => {
    const img = slide.querySelector("img");
    if (!img) return;

    if (!slide.dataset.index) {
      slide.dataset.index = String(index);
    }

    img.addEventListener("click", (e) => {
      e.stopPropagation();
      openLightbox(index);
    });
  });

  // Кнопки управления
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showPrev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showNext();
    });
  }

  // Клик по фону
  DOMCache.lightbox.addEventListener("click", (e) => {
    if (
      e.target === DOMCache.lightbox ||
      e.target.classList.contains("lightbox__overlay")
    ) {
      closeLightbox();
    }
  });

  // Клавиатура
  document.addEventListener("keydown", (e) => {
    if (!DOMCache.lightbox.classList.contains("lightbox--open")) return;

    if (e.key === "Escape") {
      closeLightbox();
    }
    if (e.key === "ArrowLeft") {
      showPrev();
    }
    if (e.key === "ArrowRight") {
      showNext();
    }
  });
}

// ========== GOALKEEPER GAME ==========
const GoalkeeperGame = {
  playerScore: 0,
  computerScore: 0,
  gameActive: false,
  ballActive: false,
  ballCaught: false,
  winScore: 3,

  positions: [
    "ball-top-left",
    "ball-top-right",
    "ball-mid-left",
    "ball-mid-right",
    "ball-bot-left",
    "ball-bot-right",
  ],

  init() {
    this.setupEventListeners();
    this.updateScoreboard();
  },

  setupEventListeners() {
    if (!DOMCache.startBtn || !DOMCache.gameField) return;

    DOMCache.startBtn.addEventListener("click", () => this.startGame());
    DOMCache.gameField.addEventListener("click", (e) => this.onFieldClick(e));
    DOMCache.gameField.addEventListener("touchstart", (e) => this.onFieldClick(e));
  },

  startGame() {
    if (this.gameActive) return;

    this.gameActive = true;
    this.ballActive = false;
    this.playerScore = 0;
    this.computerScore = 0;

    this.updateScoreboard();
    this.clearMessage();
    DOMCache.startBtn.disabled = true;
    DOMCache.startBtn.textContent = "Игра идёт...";

    this.playRound();
  },

  playRound() {
    if (!this.gameActive) return;

    setTimeout(() => {
      if (!this.gameActive) return;

      const position = this.positions[Math.floor(Math.random() * this.positions.length)];

      DOMCache.soccerBall.className = "soccer-ball-game";
      this.ballCaught = false;
      this.ballActive = true;

      DOMCache.soccerBall.classList.add(position);

      const computerReaction = Math.random() > 0.4;

      setTimeout(() => {
        if (this.ballActive && !this.ballCaught) {
          if (computerReaction) {
            this.showMessage("⛔ Компьютер поймал!", "missed");
          } else {
            this.computerScore++;
            this.showMessage("🎉 Голооол! +1 тебе!", "caught");
            this.updateScoreboard();
          }
          this.ballActive = false;
          this.checkGameOver();
        }
      }, 1200);
    }, 800);
  },

  onFieldClick(e) {
    if (!this.gameActive || !this.ballActive) return;

    const rect = DOMCache.soccerBall.getBoundingClientRect();
    let clickX, clickY;

    if (e.touches) {
      clickX = e.touches[0].clientX;
      clickY = e.touches[0].clientY;
    } else {
      clickX = e.clientX;
      clickY = e.clientY;
    }

    const distance = Math.hypot(
      clickX - (rect.left + rect.width / 2),
      clickY - (rect.top + rect.height / 2)
    );

    if (distance < 50) {
      this.catchBall(clickX, rect.left + rect.width / 2);
    }
  },

  catchBall(clickX, ballCenterX) {
    if (this.ballCaught) return;

    this.ballCaught = true;
    this.ballActive = false;
    this.playerScore++;

    const goalkeeper = document.getElementById("goalkeeper");
    
    // Определяем, слева или справа был клик от мяча
    if (clickX > ballCenterX) {
      // Клик справа - вратарь прыгает вправо
      goalkeeper.classList.remove("jumping-left");
      goalkeeper.classList.add("jumping-right");
    } else {
      // Клик слева - вратарь прыгает влево
      goalkeeper.classList.remove("jumping-right");
      goalkeeper.classList.add("jumping-left");
    }

    this.showMessage("✅ Словил! +1 тебе!", "caught");
    this.updateScoreboard();

    // Убираем класс прыжка через 300ms
    setTimeout(() => {
      goalkeeper.classList.remove("jumping-left", "jumping-right");
    }, 300);

    this.checkGameOver();
  },

  updateScoreboard() {
    document.getElementById("playerScore").textContent = this.playerScore;
    document.getElementById("computerScore").textContent = this.computerScore;
  },

  showMessage(text, className = "") {
    const messageEl = document.getElementById("gameMessage");
    messageEl.textContent = text;
    messageEl.className = `game-message ${className}`;
  },

  clearMessage() {
    const messageEl = document.getElementById("gameMessage");
    messageEl.textContent = "";
    messageEl.className = "game-message";
  },

  checkGameOver() {
    if (this.playerScore >= this.winScore) {
      this.endGame(true);
    } else if (this.computerScore >= this.winScore) {
      this.endGame(false);
    } else {
      setTimeout(() => this.playRound(), 1500);
    }
  },

  endGame(playerWon) {
    this.gameActive = false;

    const messageEl = document.getElementById("gameMessage");
    messageEl.className = playerWon
      ? "game-message game-over caught"
      : "game-message game-over lost";

    if (playerWon) {
      messageEl.textContent = `🏆 ТЫ ПОБЕДИЛ! ${this.playerScore}:${this.computerScore}`;
    } else {
      messageEl.textContent = `😢 КОМПЬЮТЕР ВЫИГРАЛ! ${this.playerScore}:${this.computerScore}`;
    }

    DOMCache.startBtn.disabled = false;
    DOMCache.startBtn.textContent = "Играть снова";
  },
};

// ========== PROJECTS CAROUSEL ==========
function initProjectsCarousel() {
  if (!DOMCache.viewport) return;

  const stage = DOMCache.viewport.querySelector(".projects-stage");
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll(".project-card"));
  if (!cards.length) return;

  const dotsWrap = DOMCache.viewport.querySelector(".pr-dots");
  const prevBtn = DOMCache.viewport.querySelector(".prev");
  const nextBtn = DOMCache.viewport.querySelector(".next");

  if (!dotsWrap) return;

  let i = 0;
  let timer = null;
  const interval = +(DOMCache.viewport.dataset.interval || 5000);
  const autoplay = DOMCache.viewport.dataset.autoplay !== "false";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  dotsWrap.innerHTML = cards.map(() => "<i></i>").join("");
  const dots = Array.from(dotsWrap.children);

  const show = (idx) => {
    i = (idx + cards.length) % cards.length;
    cards.forEach((c, k) => c.classList.toggle("is-active", k === i));
    dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
  };

  const next = () => show(i + 1);
  const prev = () => show(i - 1);

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const play = () => {
    if (reduce || !autoplay) return;
    stop();
    timer = setInterval(next, interval);
  };

  show(0);
  play();

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      next();
      play();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prev();
      play();
    });
  }

  dotsWrap.addEventListener("click", (e) => {
    const idx = dots.indexOf(e.target);
    if (idx > -1) {
      show(idx);
      play();
    }
  });

  DOMCache.viewport.addEventListener("mouseenter", stop);
  DOMCache.viewport.addEventListener("mouseleave", play);
  DOMCache.viewport.addEventListener("focusin", stop);
  DOMCache.viewport.addEventListener("focusout", play);

  // Intersection Observer
  if (supportsIO()) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== DOMCache.viewport) return;
          if (entry.isIntersecting) {
            play();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.2 }
    );
    sectionObserver.observe(DOMCache.viewport);
  }
}

// Проверка поддержки IntersectionObserver
function supportsIO() {
  return typeof window !== "undefined" && "IntersectionObserver" in window;
}