// Events section: populated from events.json
    (function loadEvents() {
        var grid = document.getElementById('events-grid');
        if (!grid) return;

        fetch('src/data/events.json')
            .then(function (res) { return res.json(); })
            .then(function (events) {
                function escapeHtml(value) {
                    return String(value == null ? '' : value)
                        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                }
                function safeIcon(name) {
                    return /^[a-z0-9_]+$/i.test(name || '') ? name : 'celebration';
                }
                if (!Array.isArray(events)) {
                    throw new Error('events.json must contain an array');
                }
                grid.innerHTML = events.map(function (e) {
                    return '<div class="glass-card rounded-xl p-6 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">'
                        + '<div class="flex items-center justify-between">'
                        + '<span class="material-symbols-outlined text-primary text-3xl">' + safeIcon(e.icon) + '</span>'
                        + (e.category ? '<span class="px-2 py-1 bg-surface-container-highest text-on-surface-variant text-xs font-bold rounded">' + escapeHtml(e.category) + '</span>' : '')
                        + '</div>'
                        + '<h4 class="font-headline text-lg font-bold text-on-surface leading-snug">' + escapeHtml(e.name) + '</h4>'
                        + (e.description ? '<p class="text-on-surface-variant text-sm">' + escapeHtml(e.description) + '</p>' : '')
                        + '</div>';
                }).join('');
            })
            .catch(function (err) {
                console.error('Failed to load events.json', err);
                grid.innerHTML = '<p class="col-span-full text-center py-8 text-on-surface-variant text-sm">Unable to load events right now.</p>';
            });
    })();

    // Alumni data preview modal: one button opens a chooser for the two
    // academic-year rosters, each of which then previews that year's PDF
    // in the same modal (rather than stacking a second dialog on top).
    (function alumniPreview() {
        var openBtn = document.getElementById('alumni-preview-btn');
        var modal = document.getElementById('alumni-modal');
        if (!openBtn || !modal) return;

        var closeBtn = document.getElementById('alumni-modal-close');
        var backBtn = document.getElementById('alumni-modal-back');
        var chooser = document.getElementById('alumni-modal-chooser');
        var viewer = document.getElementById('alumni-modal-viewer');
        var iframe = document.getElementById('alumni-modal-iframe');
        var openTabDesktop = document.getElementById('alumni-modal-open-tab');
        var openTabMobile = document.getElementById('alumni-modal-open-tab-mobile');
        var title = document.getElementById('alumni-modal-title');
        var yearButtons = modal.querySelectorAll('.alumni-year-btn');

        function showChooser() {
            chooser.classList.remove('hidden');
            viewer.classList.add('hidden');
            viewer.classList.remove('flex');
            backBtn.classList.add('hidden');
            title.textContent = 'MITR Alumni Data';
            iframe.src = '';
        }

        function showYear(year, pdf) {
            if (!window.isSafeLocalPdf || !window.isSafeLocalPdf(pdf)) return;
            chooser.classList.add('hidden');
            viewer.classList.remove('hidden');
            viewer.classList.add('flex');
            backBtn.classList.remove('hidden');
            title.textContent = year + ' Roster';
            iframe.src = 'assets/docs/' + pdf;
            openTabDesktop.href = 'assets/docs/' + pdf;
            openTabMobile.href = 'assets/docs/' + pdf;
        }

        function open() {
            showChooser();
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function close() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            iframe.src = '';
        }

        openBtn.addEventListener('click', open);
        closeBtn.addEventListener('click', close);
        backBtn.addEventListener('click', showChooser);
        modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
        });

        Array.prototype.forEach.call(yearButtons, function (btn) {
            btn.addEventListener('click', function () {
                showYear(btn.getAttribute('data-alumni-year'), btn.getAttribute('data-alumni-pdf'));
            });
        });
    })();

    // Hero photo carousel: cycles through the "carousel" photos
    (function heroCarousel() {
        var root = document.getElementById('hero-carousel');
        if (!root) return;

        var PHOTOS = [
            'WhatsApp Image 2026-08-13 at 00.41.24.jpeg',
            'WhatsApp Image 2026-08-13 at 00.41.25.jpeg',
            'WhatsApp Image 2026-08-13 at 00.41.25 (1).jpeg',
            'WhatsApp Image 2026-08-13 at 00.41.25 (2).jpeg',
            'WhatsApp Image 2026-08-13 at 00.41.26 (1).jpeg',
            'WhatsApp Image 2026-08-13 at 00.41.27.jpeg',
            'WhatsApp Image 2026-08-13 at 00.41.27 (1).jpeg',
            'WhatsApp Image 2026-08-13 at 00.41.27 (3).jpeg',
            'WhatsApp Image 2026-08-13 at 00.41.28.jpeg'
        ].map(function (name) { return encodeURI('assets/images/carousel/' + name); });

        var track = document.getElementById('hero-carousel-track');
        var dotsWrap = document.getElementById('hero-carousel-dots');
        var prevBtn = document.getElementById('hero-carousel-prev');
        var nextBtn = document.getElementById('hero-carousel-next');

        var slides = PHOTOS.map(function (src, i) {
            var img = document.createElement('img');
            img.src = src;
            img.alt = 'MITR event photo ' + (i + 1);
            img.loading = i === 0 ? 'eager' : 'lazy';
            img.className = 'absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out';
            img.style.opacity = i === 0 ? '1' : '0';
            track.appendChild(img);
            return img;
        });

        var dots = PHOTOS.map(function (_, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', 'Go to photo ' + (i + 1));
            dotsWrap.appendChild(dot);
            dot.addEventListener('click', function () { goTo(i); });
            return dot;
        });

        var current = 0;
        var timer = null;

        function render() {
            slides.forEach(function (img, i) { img.style.opacity = i === current ? '1' : '0'; });
            dots.forEach(function (dot, i) {
                dot.className = 'h-2 rounded-full transition-all ' + (i === current ? 'bg-white w-5' : 'bg-white/50 w-2');
            });
        }

        function goTo(index) {
            current = (index + slides.length) % slides.length;
            render();
            restart();
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        function restart() {
            if (timer) clearInterval(timer);
            timer = setInterval(next, 4500);
        }

        if (prevBtn) prevBtn.addEventListener('click', prev);
        if (nextBtn) nextBtn.addEventListener('click', next);
        root.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
        root.addEventListener('mouseleave', restart);

        render();
        restart();
    })();

    // Existing card hover effect
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Existing header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 20) {
            header.classList.add('py-2', 'h-16');
            header.classList.remove('h-20');
        } else {
            header.classList.remove('py-2', 'h-16');
            header.classList.add('h-20');
        }
    });

    // ---------- PDF Flipbook with error handling ----------
    const PDF_URL = 'assets/docs/yearbook.pdf';
    const RENDER_SCALE = 1.5; // higher = crisper pages, slower to render
    const CHUNK_SIZE = 6; // pages rendered per batch, so the book opens after the first batch instead of waiting on the whole PDF

    // page-flip listens for window "resize" and re-fits the book on every
    // one. On mobile, scrolling shows/hides the browser's URL bar, which
    // fires resize events even though only the *height* changed — the book
    // has nothing to do with height in 'stretch' mode, but it recalculates
    // anyway, which is what makes it look like it keeps zooming in and out
    // while scrolling. This scopes a width-only guard around just the resize
    // listener page-flip registers during construction, leaving every other
    // resize listener on the page untouched.
    function createPageFlipWithResizeGuard(container, options) {
        const realAddEventListener = window.addEventListener.bind(window);
        let lastWidth = window.innerWidth;
        window.addEventListener = function (type, listener, opts) {
            if (type !== 'resize') return realAddEventListener(type, listener, opts);
            const guarded = function (e) {
                if (window.innerWidth === lastWidth) return;
                lastWidth = window.innerWidth;
                listener(e);
            };
            return realAddEventListener('resize', guarded, opts);
        };
        try {
            return new St.PageFlip(container, options);
        } finally {
            window.addEventListener = realAddEventListener;
        }
    }

    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const reloadBtn = document.getElementById('reload-pdf');
    const retryBtn = document.getElementById('retry-load');

    const yearbook = document.getElementById('yearbook');
    const emptyState = document.getElementById('yearbook-empty');
    const statusEl = document.getElementById('book-status');
    const emptyTitle = document.getElementById('empty-title');
    const emptyMessage = document.getElementById('empty-message');

    let pageFlipInstance = null;
    let currentPdf = null;
    let totalPages = 0;
    let isBookReady = false;
    let isLoading = false;
    let loadToken = 0;

    function updateStatus(text) {
        if (statusEl) statusEl.textContent = text;
    }

    function setButtonsDisabled(disabled) {
        [prevBtn, nextBtn, reloadBtn].forEach(btn => {
            if (!btn) return;
            btn.disabled = disabled;
            btn.style.opacity = disabled ? '0.5' : '1';
            btn.style.pointerEvents = disabled ? 'none' : 'auto';
        });
    }

    function showEmptyState(title, message, showRetry = false) {
        emptyTitle.textContent = title;
        emptyMessage.textContent = message;
        retryBtn.style.display = showRetry ? 'inline-flex' : 'none';
        emptyState.style.display = 'grid';
        yearbook.style.display = 'none';
    }

    function hideEmptyState() {
        emptyState.style.display = 'none';
        yearbook.style.display = 'block';
    }

    function resetViewerState() {
        isBookReady = false;
        currentPdf = null;
        totalPages = 0;
        setButtonsDisabled(true);
    }

    function clearFlipbook() {
        try {
            if (pageFlipInstance) {
                pageFlipInstance.destroy();
                pageFlipInstance = null;
            }
        } catch (error) {
            console.warn('Failed to destroy previous flipbook instance:', error);
        }

        yearbook.innerHTML = '';
    }

    function getReadablePdfError(error) {
        const name = error?.name || '';
        const message = error?.message || '';

        if (name === 'MissingPDFException') {
            return {
                title: 'PDF file not found',
                message: 'Could not find yearbook.pdf. Place it in the same folder as this HTML file.'
            };
        }

        if (name === 'InvalidPDFException') {
            return {
                title: 'Invalid PDF file',
                message: 'yearbook.pdf exists, but it is not a valid PDF or may be corrupted.'
            };
        }

        if (name === 'PasswordException') {
            return {
                title: 'Password-protected PDF',
                message: 'This PDF is protected by a password. Use an unlocked copy of yearbook.pdf.'
            };
        }

        if (name === 'UnexpectedResponseException') {
            return {
                title: 'Unable to fetch PDF',
                message: 'The browser could not fetch yearbook.pdf. Check the path and make sure the site is served correctly.'
            };
        }

        if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
            return {
                title: 'Unable to fetch PDF',
                message: 'The browser could not reach yearbook.pdf. If you opened this file directly (file:///...), serve the folder with a local web server instead — fetch() is blocked on file:// pages.'
            };
        }

        if (message) {
            return {
                title: 'Failed to load PDF',
                message
            };
        }

        return {
            title: 'Failed to load PDF',
            message: 'Something went wrong while opening yearbook.pdf.'
        };
    }

    // Renders a single PDF page onto a canvas sized to RENDER_SCALE.
    async function renderPageToCanvas(pdf, pageNumber) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: RENDER_SCALE });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, canvas, viewport }).promise;

        return canvas;
    }

    async function renderPdfToFlipbook(url = PDF_URL) {
        if (isLoading) return;

        const myToken = ++loadToken;
        isLoading = true;
        setButtonsDisabled(true);
        resetViewerState();
        clearFlipbook();
        updateStatus('Loading yearbook.pdf...');
        showEmptyState('Loading yearbook.pdf', 'The year book viewer is preparing your PDF.');

        try {
            const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            // Bail out if a newer load started while we were fetching/parsing.
            if (myToken !== loadToken) return;

            currentPdf = pdf;
            totalPages = pdf.numPages;

            if (totalPages === 0) {
                throw new Error('yearbook.pdf has no pages.');
            }

            // Render pages in batches of CHUNK_SIZE and fold each batch into
            // the book as soon as it's ready, rather than waiting for every
            // page in the PDF to render before the reader can open it.
            let loadedPages = 0;

            // Folding a batch into an already-open book (updateFromHtml) rebuilds
            // and redraws the whole flipbook, which is fast on desktop but visibly
            // flashes/strobes on slower phones if it happens every ~6 pages. Once
            // the book is open, later batches are only folded in at most this often.
            const MIN_UPDATE_INTERVAL_MS = 900;
            let lastFlipbookUpdate = 0;

            function statusForCurrentPage(pageIndex) {
                return loadedPages < totalPages
                    ? `Page ${pageIndex + 1} of ${totalPages} (${loadedPages} pages ready)`
                    : `Page ${pageIndex + 1} of ${totalPages}`;
            }

            updateStatus(`Rendering pages 1-${Math.min(CHUNK_SIZE, totalPages)} of ${totalPages}...`);

            for (let start = 1; start <= totalPages; start += CHUNK_SIZE) {
                const end = Math.min(start + CHUNK_SIZE - 1, totalPages);

                for (let i = start; i <= end; i++) {
                    if (myToken !== loadToken) return;
                    const canvas = await renderPageToCanvas(pdf, i);
                    const pageDiv = document.createElement('div');
                    pageDiv.className = 'page';
                    // Stays hidden until PageFlip claims it (adds "stf__item",
                    // which is display:none by default until that page's spread
                    // is active) at the next fold-in. Without this, a freshly
                    // rendered page sits as a plain visible block and the whole
                    // batch stacks down the page while it waits to be folded in.
                    pageDiv.style.display = 'none';
                    pageDiv.appendChild(canvas);
                    yearbook.appendChild(pageDiv);
                    loadedPages = i;
                }

                if (myToken !== loadToken) return;

                const isLastBatch = end >= totalPages;
                const dueForUpdate = !pageFlipInstance || isLastBatch
                    || (Date.now() - lastFlipbookUpdate >= MIN_UPDATE_INTERVAL_MS);

                if (!dueForUpdate) {
                    // Already rendered and appended to the DOM — it will be
                    // folded into the book at the next scheduled update.
                    continue;
                }

                const pageEls = document.querySelectorAll('#yearbook .page');
                lastFlipbookUpdate = Date.now();

                if (!pageFlipInstance) {
                    // First batch: create the book and show it immediately —
                    // the reader can start flipping while later batches render.
                    pageFlipInstance = createPageFlipWithResizeGuard(yearbook, {
                        width: 500,
                        height: 700,
                        size: 'stretch',
                        minWidth: 280,
                        maxWidth: 1000,
                        minHeight: 360,
                        maxHeight: 1350,
                        maxShadowOpacity: 0.5,
                        showCover: false,
                        mobileScrollSupport: false,
                        useMouseEvents: true
                    });

                    pageFlipInstance.loadFromHTML(pageEls);

                    pageFlipInstance.on('flip', (e) => {
                        updateStatus(statusForCurrentPage(e.data));
                    });

                    hideEmptyState();
                    isBookReady = true;
                    setButtonsDisabled(false);
                } else {
                    // Later batches: fold the newly rendered pages into the
                    // book without disturbing whatever page the reader is on.
                    pageFlipInstance.updateFromHtml(pageEls);
                }

                // Once the book is open, the status line always reflects the
                // reader's actual position (kept live by the 'flip' handler
                // above) plus how many pages are ready so far.
                updateStatus(statusForCurrentPage(pageFlipInstance.getCurrentPageIndex()));
            }
        } catch (error) {
            console.error('PDF flipbook error:', error);
            if (myToken !== loadToken) return;
            const { title, message } = getReadablePdfError(error);
            resetViewerState();
            clearFlipbook();
            showEmptyState(title, message, true);
            updateStatus('Failed to load yearbook.pdf');
        } finally {
            if (myToken === loadToken) isLoading = false;
        }
    }

    prevBtn.addEventListener('click', () => {
        if (!isBookReady || !pageFlipInstance) return;
        try {
            pageFlipInstance.flipPrev();
        } catch (error) {
            console.error('Failed to go to previous page:', error);
            updateStatus('Could not flip to previous page');
        }
    });

    nextBtn.addEventListener('click', () => {
        if (!isBookReady || !pageFlipInstance) return;
        try {
            pageFlipInstance.flipNext();
        } catch (error) {
            console.error('Failed to go to next page:', error);
            updateStatus('Could not flip to next page');
        }
    });

    reloadBtn.addEventListener('click', () => {
        if (isLoading) return;
        renderPdfToFlipbook();
    });

    retryBtn.addEventListener('click', () => {
        if (isLoading) return;
        renderPdfToFlipbook();
    });

    window.addEventListener('error', (event) => {
        console.error('Window error:', event.error || event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });

    document.addEventListener('DOMContentLoaded', () => {
        renderPdfToFlipbook();
    });
