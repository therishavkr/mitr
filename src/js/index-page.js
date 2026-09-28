// The SOS modal above is opened by the header's Support button, which
      // site-chrome.js owns and wires up on every page.

      // Smooth intersection observer for bento cards
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("opacity-100", "translate-y-0");
              entry.target.classList.remove("opacity-0", "translate-y-10");
            }
          });
        },
        { threshold: 0.1 },
      );

      document.querySelectorAll(".glass, .glass-dark").forEach((card) => {
        card.classList.add(
          "transition-all",
          "duration-700",
          "opacity-0",
          "translate-y-10",
        );
        observer.observe(card);
      });

      // Section-level reveal: .reveal-on-scroll starts hidden (see the CSS
      // above), and only actually plays the fadeInUp keyframe once it's
      // scrolled into view — previously "animate-fade-in-up" was a static
      // class in the markup, so the animation fired once at page load
      // instead of on scroll, and had already finished by the time anyone
      // scrolled down to see it.
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate-fade-in-up");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
      );

      document.querySelectorAll(".reveal-on-scroll").forEach((section) => {
        revealObserver.observe(section);
      });

      // Sound toggle for each institutional support video embed
      document.querySelectorAll("[data-video-embed]").forEach((embed) => {
        const video = embed.querySelector("[data-intro-video]");
        const muteBtn = embed.querySelector("[data-mute-toggle]");

        if (!video || !muteBtn) return;

        const muteIcon = muteBtn.querySelector(".material-symbols-outlined");

        muteBtn.addEventListener("click", () => {
          video.muted = !video.muted;

          const icon = video.muted ? "volume_off" : "volume_up";
          muteIcon.textContent = icon;
          muteIcon.dataset.icon = icon;
          muteBtn.setAttribute(
            "aria-label",
            video.muted ? "Unmute video" : "Mute video",
          );
          muteBtn.setAttribute("aria-pressed", String(!video.muted));

          // Autoplay only survives while muted, so resume if the browser paused it.
          if (!video.muted && video.paused) {
            video.play();
          }

          // Only one embed should be audible at a time.
          if (!video.muted) {
            document.querySelectorAll("[data-video-embed]").forEach((other) => {
              if (other === embed) return;
              const otherVideo = other.querySelector("[data-intro-video]");
              const otherBtn = other.querySelector("[data-mute-toggle]");
              if (!otherVideo || otherVideo.muted) return;
              otherVideo.muted = true;
              const otherIcon = otherBtn.querySelector(
                ".material-symbols-outlined",
              );
              otherIcon.textContent = "volume_off";
              otherIcon.dataset.icon = "volume_off";
              otherBtn.setAttribute("aria-label", "Unmute video");
              otherBtn.setAttribute("aria-pressed", "false");
            });
          }
        });
      });

(function () {
        const btn = document.getElementById("gen-positive-btn");
        const display = document.getElementById("positive-msg-display");
        if (!btn || !display) return;

        let quotes = [];
        let lastIndex = -1;

        fetch("src/data/quotes.json")
          .then((res) => res.json())
          .then((data) => {
            quotes = (data && Array.isArray(data.quotes)) ? data.quotes : [];
          })
          .catch((err) => console.error("Failed to load quotes.json", err));

        btn.addEventListener("click", () => {
          if (!quotes.length) return;
          let index;
          do {
            index = Math.floor(Math.random() * quotes.length);
          } while (quotes.length > 1 && index === lastIndex);
          lastIndex = index;
          const { quote, author } = quotes[index];
          display.textContent = `"${quote}" — ${author}`;
        });
      })();
