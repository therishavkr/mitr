// Simple micro-interaction for glass cards
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Sticky Navbar effect on scroll
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('nav');
            if (window.scrollY > 20) {
                nav.classList.add('shadow-md', 'h-16');
                nav.classList.remove('h-20');
            } else {
                nav.classList.remove('shadow-md', 'h-16');
                nav.classList.add('h-20');
            }
        });

// ---- Shared Call/Email popover ----
        (function () {
            var popover = document.getElementById('contact-popover');
            var labelEl = document.getElementById('contact-popover-label');
            var bodyEl = document.getElementById('contact-popover-body');
            var closeBtn = document.getElementById('contact-popover-close');

            function isMobileDevice() {
                var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
                var uaMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                return !!(coarse && uaMobile);
            }

            function flashCopied(btn) {
                var original = btn.dataset.originalLabel || btn.textContent;
                btn.dataset.originalLabel = original;
                btn.textContent = 'Copied!';
                setTimeout(function () { btn.textContent = original; }, 1500);
            }

            function copyToClipboard(text, btn) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () { flashCopied(btn); });
                } else {
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); } catch (e) { /* no-op fallback */ }
                    document.body.removeChild(ta);
                    flashCopied(btn);
                }
            }

            function buildRow(value, type) {
                var row = document.createElement('div');
                row.className = 'flex items-center justify-between gap-3 bg-surface-container rounded px-3 py-2';

                // The value itself is the primary action on every device:
                // tel: dials, mailto: opens the visitor's mail client.
                var link = document.createElement('a');
                if (type === 'phone') {
                    link.href = window.telHref ? window.telHref(value) : '#';
                } else {
                    link.href = window.mailtoHref ? window.mailtoHref(value) : '#';
                }
                link.className = 'text-sm text-primary font-bold truncate hover:underline';
                link.textContent = value;
                link.setAttribute('aria-label', (type === 'phone' ? 'Call ' : 'Email ') + value);
                row.appendChild(link);

                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'font-body-md text-xs font-bold text-primary border border-primary/40 rounded px-2 py-1 hover:bg-primary/10 shrink-0';
                btn.textContent = 'Copy';
                btn.addEventListener('click', function () { copyToClipboard(value, btn); });
                row.appendChild(btn);

                return row;
            }

            function positionPopover(trigger) {
                var rect = trigger.getBoundingClientRect();
                var popRect = popover.getBoundingClientRect();

                var left = rect.left;
                var maxLeft = document.documentElement.clientWidth - popRect.width - 16;
                left = Math.min(left, maxLeft);
                left = Math.max(left, 16);

                var top = rect.bottom + 8;
                if (top + popRect.height > window.innerHeight) {
                    top = rect.top - popRect.height - 8;
                }
                top = Math.max(top, 16);

                popover.style.left = left + 'px';
                popover.style.top = top + 'px';
            }

            function openPopover(trigger) {
                var type = trigger.dataset.type;
                var label = trigger.dataset.label;
                var values = trigger.dataset.values.split(',').map(function (v) { return v.trim(); });

                labelEl.textContent = label + (type === 'phone' ? ' — Phone' : ' — Email');
                bodyEl.innerHTML = '';
                values.forEach(function (v) { bodyEl.appendChild(buildRow(v, type)); });

                popover.classList.remove('hidden');
                positionPopover(trigger);
            }

            document.addEventListener('click', function (e) {
                var trigger = e.target.closest ? e.target.closest('.contact-trigger') : null;
                if (trigger) {
                    e.preventDefault();
                    var values = trigger.dataset.values.split(',').map(function (v) { return v.trim(); });
                    if (trigger.dataset.type === 'phone' && isMobileDevice() && values.length === 1) {
                        var dial = window.telHref ? window.telHref(values[0]) : '#';
                        if (dial !== '#') {
                            window.location.href = dial;
                            return;
                        }
                    }
                    openPopover(trigger);
                    return;
                }
                if (!popover.classList.contains('hidden') && !popover.contains(e.target)) {
                    popover.classList.add('hidden');
                }
            });

            closeBtn.addEventListener('click', function () { popover.classList.add('hidden'); });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') popover.classList.add('hidden');
            });
            window.addEventListener('scroll', function () { popover.classList.add('hidden'); }, true);
        })();
