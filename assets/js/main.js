document.addEventListener("DOMContentLoaded", () => {
  // OVERLAY MENU: закрытие при клике по ссылке
  const checkbox = document.getElementById("active");
  document.querySelectorAll(".wrapper ul li a").forEach((link) => {
    link.addEventListener("click", () => {
      if (checkbox) {
        checkbox.checked = false;
      }
    });
  });

  // HEADER SCROLL EFFECT + кнопка "наверх"
  const backToTopBtn = document.querySelector(".back-to-top");

  window.addEventListener("scroll", () => {
    const header = document.querySelector("header");

    // Эффект при скроле хедера
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    // Показываем/скрываем кнопку "наверх"
    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    }
  });

  // Скролл к верхней части при клике на кнопку
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // SMOOTH SCROLL для всех якорных ссылок
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

  // BUTTON CLICK EFFECTS
  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", function () {
      console.log("Кнопка нажата!");
    });
  });

  // PARALLAX EFFECT для фона (только на десктопе)
  if (window.innerWidth > 768) {
    const heroBg = document.querySelector(".hero-bg");
    if (heroBg) {
      window.addEventListener("mousemove", (e) => {
        const moveX = (e.clientX / window.innerWidth) * 10;
        const moveY = (e.clientY / window.innerHeight) * 10;
        heroBg.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    }
  }

  // PRELOADER
  window.addEventListener("load", () => {
    const preloader = document.querySelector(".preloader");
    if (preloader) {
      preloader.classList.add("hidden");
    }
  });

  // ===== КАРУСЕЛЬ "ИСТОРИЯ" =====
  const carouselList = document.querySelector(".carousel__list");
  let storySlides = [];

  if (carouselList) {
    const carouselItems = carouselList.querySelectorAll(".carousel__item");
    const elems = Array.from(carouselItems);

    storySlides = elems;

    const getPos = (current, active) => {
      const diff = current - active;
      if (Math.abs(current - active) > 2) {
        return -current;
      }
      return diff;
    };

    const update = (newActive) => {
      const newActivePos = newActive.dataset.pos;

      const current = elems.find((elem) => elem.dataset.pos === "0");
      const prev = elems.find((elem) => elem.dataset.pos === "-1");
      const next = elems.find((elem) => elem.dataset.pos === "1");
      const first = elems.find((elem) => elem.dataset.pos === "-2");
      const last = elems.find((elem) => elem.dataset.pos === "2");

      [current, prev, next, first, last].forEach((item) => {
        if (!item) return;
        const itemPos = item.dataset.pos;
        item.dataset.pos = getPos(Number(itemPos), Number(newActivePos));
      });
    };

    carouselList.addEventListener("click", (event) => {
      const newActive = event.target.closest(".carousel__item");
      if (!newActive) return;

      update(newActive);
    });
  }

  // ===== LIGHTBOX для слайдера "История" =====
  const lightbox = document.querySelector("#story-lightbox");
  if (lightbox && storySlides.length) {
    const lightboxImg = lightbox.querySelector(".lightbox__img");
    const lightboxCap = lightbox.querySelector(".lightbox__caption");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    const prevBtn = lightbox.querySelector(".lightbox__arrow--prev");
    const nextBtn = lightbox.querySelector(".lightbox__arrow--next");

    let currentSlideIndex = 0;

    const openLightbox = (index) => {
      const slide = storySlides[index];
      if (!slide || !lightboxImg) return;

      currentSlideIndex = index;

      const img = slide.querySelector("img");
      if (!img) return;

      const fullSrc = img.dataset.full || img.src;
      lightboxImg.src = fullSrc;
      lightboxImg.alt = img.alt || "";

      if (lightboxCap) {
        lightboxCap.textContent = img.alt || "";
      }

      lightbox.classList.add("lightbox--open");
      document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      lightbox.classList.remove("lightbox--open");
      document.body.style.overflow = "";
    };

    const showPrev = () => {
      if (!storySlides.length) return;
      currentSlideIndex =
        (currentSlideIndex - 1 + storySlides.length) % storySlides.length;
      openLightbox(currentSlideIndex);
    };

    const showNext = () => {
      if (!storySlides.length) return;
      currentSlideIndex = (currentSlideIndex + 1) % storySlides.length;
      openLightbox(currentSlideIndex);
    };

    // клики по фоткам в карточках
    storySlides.forEach((slide, index) => {
      const img = slide.querySelector("img");
      if (!img) return;

      // на всякий случай проставим data-index, если в HTML забудешь
      if (!slide.dataset.index) {
        slide.dataset.index = String(index);
      }

      img.addEventListener("click", (e) => {
        e.stopPropagation(); // чтобы не переключалась карусель при открытии модалки
        openLightbox(index);
      });
    });

    // кнопки управления в модалке
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

    // клик по тёмному фону — закрыть
    lightbox.addEventListener("click", (e) => {
      if (
        e.target === lightbox ||
        e.target.classList.contains("lightbox__overlay")
      ) {
        closeLightbox();
      }
    });

    // закрытие по Esc и стрелки с клавиатуры
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("lightbox--open")) return;

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
      const startBtn = document.getElementById("startBtn");
      const gameField = document.getElementById("gameField");
      const soccerBall = document.getElementById("soccerBall");

      startBtn.addEventListener("click", () => this.startGame());
      gameField.addEventListener("click", (e) => this.onFieldClick(e));
      gameField.addEventListener("touchstart", (e) => this.onFieldClick(e));
    },

    startGame() {
      if (this.gameActive) return;

      this.gameActive = true;
      this.ballActive = false;
      this.playerScore = 0;
      this.computerScore = 0;

      this.updateScoreboard();
      this.clearMessage();
      document.getElementById("startBtn").disabled = true;
      document.getElementById("startBtn").textContent = "Игра идёт...";

      this.playRound();
    },

    playRound() {
      if (!this.gameActive) return;

      setTimeout(() => {
        if (!this.gameActive) return;

        const ball = document.getElementById("soccerBall");
        const position =
          this.positions[Math.floor(Math.random() * this.positions.length)];

        // Reset ball
        ball.className = "soccer-ball-game";
        this.ballCaught = false;
        this.ballActive = true;

        // Add position class
        ball.classList.add(position);

        // Simulate computer reaction (random chance)
        const computerReaction = Math.random() > 0.4; // 60% computer catches

        // If ball reaches goal without being caught
        setTimeout(() => {
          if (this.ballActive && !this.ballCaught) {
            if (computerReaction) {
              // Computer caught
              this.showMessage("⛔ Компьютер поймал!", "missed");
            } else {
              // Computer missed
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

      const ball = document.getElementById("soccerBall");
      const rect = ball.getBoundingClientRect();
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

      // Catch zone radius
      if (distance < 50) {
        this.catchBall();
      }
    },

    catchBall() {
      if (this.ballCaught) return;

      this.ballCaught = true;
      this.ballActive = false;
      this.playerScore++;

      // Goalkeeper animation
      const goalkeeper = document.getElementById("goalkeeper");
      goalkeeper.classList.add("catching");

      this.showMessage("✅ Словил! +1 тебе!", "caught");
      this.updateScoreboard();

      setTimeout(() => {
        goalkeeper.classList.remove("catching");
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
        // Continue game
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

      const startBtn = document.getElementById("startBtn");
      startBtn.disabled = false;
      startBtn.textContent = "Играть снова";
    },
  };

  // Initialize game
  GoalkeeperGame.init();

  // ===== PROJECTS CAROUSEL =====
  const viewport = document.querySelector("#projects .projects-viewport");
  if (viewport) {
    const stage = viewport.querySelector(".projects-stage");
    if (stage) {
      const cards = Array.from(stage.querySelectorAll(".project-card"));
      if (cards.length) {
        const dotsWrap = viewport.querySelector(".pr-dots");
        const prevBtn = viewport.querySelector(".prev");
        const nextBtn = viewport.querySelector(".next");

        if (dotsWrap) {
          let i = 0;
          let timer = null;
          const interval = +(viewport.dataset.interval || 5000);
          const autoplay = viewport.dataset.autoplay !== "false";
          const reduce =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

          nextBtn &&
            nextBtn.addEventListener("click", () => {
              next();
              play();
            });

          prevBtn &&
            prevBtn.addEventListener("click", () => {
              prev();
              play();
            });

          dotsWrap.addEventListener("click", (e) => {
            const idx = dots.indexOf(e.target);
            if (idx > -1) {
              show(idx);
              play();
            }
          });

          viewport.addEventListener("mouseenter", stop);
          viewport.addEventListener("mouseleave", play);
          viewport.addEventListener("focusin", stop);
          viewport.addEventListener("focusout", play);

          if (supportsIO()) {
            const sectionObserver = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.target !== viewport) return;
                  if (entry.isIntersecting) {
                    play();
                  } else {
                    stop();
                  }
                });
              },
              { threshold: 0.2 }
            );
            sectionObserver.observe(viewport);
          }
        }
      }
    }
  }
});
