(function() {
        // Data for peer coordinators (Hostel, Dept, Languages) — loaded from team.json
        let peerCoordinators = [];
        let facultyData = [];

        const searchInput = document.getElementById("search-input");
        const deptFilter = document.getElementById("department-filter");
        const hostelFilter = document.getElementById("hostel-filter");
        const langFilter = document.getElementById("language-filter");

        const coordGrid = document.getElementById("coordinators-grid");
        const facultyGrid = document.getElementById("faculty-grid");

        // The coffee / mentor dialog lives in coffee.js and is opened by the
        // banner button above. Peer cards deliberately have no per-coordinator
        // booking button: requests go to the team, not to a chosen individual.

        // Populate department options
        // Normalised before de-duplicating, so a department the peer list calls
        // "Engineering Design" and faculty.json calls "ED" is one option, not two
        // that each hide half the results.
        function populateDepts() {
          const depts = new Set();
          peerCoordinators.forEach(p => depts.add(departmentName(p.department)));
          facultyData.forEach(f => depts.add(departmentName(f.department)));

          Array.from(depts).sort().forEach(d => {
            if (!d) return;
            const opt = document.createElement("option");
            opt.value = d;
            opt.textContent = d;
            deptFilter.appendChild(opt);
          });
        }

        function escapeHtml(value) {
          return window.escapeHtml ? window.escapeHtml(value) : String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        function mailtoHref(value) {
          return window.mailtoHref ? window.mailtoHref(value) : '#';
        }

        function telHref(value) {
          return window.telHref ? window.telHref(value) : '#';
        }

        function facultyImageSrc(image) {
          if (window.isSafeImageFile && window.isSafeImageFile(image)) {
            return 'assets/images/faculty/' + encodeURIComponent(image);
          }
          return window.MITR_PLACEHOLDER_IMG || '';
        }

        function languagesOf(person) {
          if (Array.isArray(person.language)) return person.language.join(', ');
          return person.language || '';
        }

        function renderPeers(list) {
          if (!list.length) {
            coordGrid.innerHTML = `<p class="col-span-full text-center py-8 text-on-surface-variant">No peer coordinators match your search criteria.</p>`;
            return;
          }

          coordGrid.innerHTML = list.map(p => `
            <article class="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col justify-between hover:translate-y-[-4px] transition-all">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">${escapeHtml(p.designation)}</span>
                  <span class="text-xs font-semibold text-outline">${escapeHtml(p.hostel)}</span>
                </div>
                <h3 class="font-headline text-xl font-bold text-on-surface">${escapeHtml(p.name)}</h3>
                <p class="text-xs text-on-surface-variant font-medium">${escapeHtml(departmentName(p.department))}</p>

                <div class="space-y-1.5 text-xs text-on-surface-variant pt-2">
                  <p class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-primary">translate</span>
                    <span>${escapeHtml(languagesOf(p))}</span>
                  </p>
                  <p class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-primary">mail</span>
                    <a href="${mailtoHref(p.email)}" class="hover:underline truncate">${escapeHtml(p.email)}</a>
                  </p>
                </div>
              </div>
            </article>
          `).join("");
        }

        function renderFaculty(list) {
          if (!list.length) {
            facultyGrid.innerHTML = `<p class="col-span-full text-center py-8 text-on-surface-variant">No faculty coordinators match your search criteria.</p>`;
            return;
          }

          facultyGrid.innerHTML = list.map(f => {
            const imgPath = facultyImageSrc(f.image);
            return `
              <article class="glass-panel p-5 rounded-3xl border border-outline-variant/40 flex flex-col justify-between hover:translate-y-[-4px] transition-all">
                <div class="space-y-3">
                  <div class="aspect-square rounded-2xl overflow-hidden bg-surface-container relative">
                    <img loading="lazy" class="w-full h-full object-cover" src="${escapeHtml(imgPath)}" alt="${escapeHtml(f.name)}" />
                    <span class="absolute bottom-2 right-2 bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase">${escapeHtml(f.department)}</span>
                  </div>
                  <h3 class="font-headline text-xl font-bold text-on-surface">${escapeHtml(f.name)}</h3>
                  <p class="text-xs text-on-surface-variant">${escapeHtml(departmentName(f.department))}</p>
                </div>

                <div class="pt-4 border-t border-outline-variant/30 mt-4 space-y-2 text-xs">
                  <a href="${mailtoHref(f.email)}" class="flex items-center gap-2 text-secondary hover:underline truncate">
                    <span class="material-symbols-outlined text-sm">mail</span>
                    <span class="truncate">${escapeHtml(f.email)}</span>
                  </a>
                  ${f.contact ? `
                    <a href="${telHref(f.contact)}" class="flex items-center gap-2 text-secondary hover:underline">
                      <span class="material-symbols-outlined text-sm">call</span>
                      <span>${escapeHtml(f.contact)}</span>
                    </a>
                  ` : ''}
                </div>
              </article>
            `;
          }).join("");
          if (window.bindImageFallbacks) window.bindImageFallbacks(facultyGrid);
        }

        function filterAll() {
          const q = searchInput.value.toLowerCase().trim();
          const selectedDept = deptFilter.value;
          const selectedHostel = hostelFilter.value;
          const selectedLang = langFilter.value;

          const filteredPeers = peerCoordinators.filter(p => {
            const dept = departmentName(p.department);
            const matchesSearch = p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.department.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
            const matchesDept = selectedDept === "all" || dept === selectedDept;
            const matchesHostel = selectedHostel === "all" || p.hostel === selectedHostel;
            const matchesLang = selectedLang === "all" || p.language.includes(selectedLang);
            return matchesSearch && matchesDept && matchesHostel && matchesLang;
          });

          const filteredFaculty = facultyData.filter(f => {
            const dept = departmentName(f.department);
            const matchesSearch = f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q) || f.department.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
            const matchesDept = selectedDept === "all" || dept === selectedDept;
            return matchesSearch && matchesDept;
          });

          renderPeers(filteredPeers);
          renderFaculty(filteredFaculty);
        }

        // Load peer coordinators (team.json) and faculty advisors (faculty.json) together
        Promise.all([
          fetch("src/data/team.json").then(res => res.json()).catch(err => {
            console.error("Failed to load team.json", err);
            return [];
          }),
          fetch("src/data/faculty.json").then(res => res.json()).catch(err => {
            console.error("Failed to load faculty.json", err);
            return [];
          }),
        ]).then(([team, faculty]) => {
          peerCoordinators = Array.isArray(team) ? team : [];
          facultyData = Array.isArray(faculty) ? faculty : [];
          populateDepts();
          filterAll();
        });

        searchInput.addEventListener("input", filterAll);
        deptFilter.addEventListener("change", filterAll);
        hostelFilter.addEventListener("change", filterAll);
        langFilter.addEventListener("change", filterAll);

        // Counsellor schedule PDF modal, opened from the "View Full Schedule"
        // button in the Department & Hostel Professional Counsellors banner.
        const scheduleModal = document.getElementById("schedule-modal");
        const scheduleBtn = document.getElementById("view-schedule-btn");
        const scheduleClose = document.getElementById("schedule-modal-close");

        if (scheduleBtn && scheduleModal) {
          const openSchedule = () => {
            scheduleModal.classList.remove("hidden");
            scheduleModal.classList.add("flex");
          };
          const closeSchedule = () => {
            scheduleModal.classList.add("hidden");
            scheduleModal.classList.remove("flex");
          };

          scheduleBtn.addEventListener("click", openSchedule);
          scheduleClose.addEventListener("click", closeSchedule);
          scheduleModal.addEventListener("click", (e) => {
            if (e.target === scheduleModal) closeSchedule();
          });
          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !scheduleModal.classList.contains("hidden")) closeSchedule();
          });
        }
      })();
