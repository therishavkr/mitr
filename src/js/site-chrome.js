// Shared site chrome — the header (with its mobile menu) and the footer, which
// every page drops in via <div data-site-header></div> / <div data-site-footer></div>.
//
// Each page used to carry its own hand-copied header and footer, and they had
// drifted: four different footers, dead links, and a hamburger button that only
// worked on the one page that remembered to load nav.js. Owning the markup here
// means a change lands everywhere at once.
//
// Two rules keep this safe to inject into any page:
//
//   1. Only stock Tailwind utilities plus the colour tokens (primary, surface-*,
//      outline-variant, ...) that all five pages define identically. The custom
//      spacing and font tokens are NOT consistent — directory.html and the
//      faculty page define `page` where the others define `margin-page`, and
//      only some define `body-md` — so a token used here would silently collapse
//      to nothing on the pages that lack it.
//   2. Paths are resolved against wherever this script was loaded from, so the
//      copy in "Faculty co  ord/" gets its ../ prefixes without extra config.
//
// The Tailwind Play CDN watches the DOM, so classes on injected markup are
// generated just like the ones present at parse time.
(function () {
    'use strict';

    // Where the site root is, relative to the current page. Taken from this
    // script's own src ("../site-chrome.js" -> "../"), so a page in a
    // subdirectory needs no configuration.
    var BASE = (function () {
        var script = document.currentScript;
        if (!script) return '';
        var src = script.getAttribute('src') || '';
        return src.replace(/site-chrome\.js.*$/, '');
    })();


    var DOST_URL = 'https://dost.iitm.ac.in';
    var CONTACT_EMAIL = 'mitrevents@smail.iitm.ac.in';
    var INSTAGRAM_URL = 'https://www.instagram.com/mitr_iitm/?hl=en';
    var LINKEDIN_URL = 'https://www.linkedin.com/company/mitr-iit-madras';

    // Material Symbols has no brand marks, so Instagram/LinkedIn are drawn as
    // inline SVGs sized to match the material-symbols-outlined icons beside them.
    var INSTAGRAM_SVG = '<svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor" aria-hidden="true">'
        + '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>'
        + '</svg>';
    var LINKEDIN_SVG = '<svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor" aria-hidden="true">'
        + '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>'
        + '</svg>';

    // key is matched against the current filename to mark the active link.
    var NAV = [
        { key: 'index', label: 'Home', href: 'index.html' },
        { key: 'emergency', label: 'Support Desk', href: 'emergency.html' },
        { key: 'directory', label: 'Contact Us', href: 'directory.html' },
        { key: 'yearbook', label: 'Gallery', href: 'yearbook.html' },
    ];

    function url(href, external) {
        return external ? href : BASE + href;
    }

    // A directory page nested under "Faculty co  ord/" is still the Contact Us
    // section, so the basename alone is enough to pick the active link.
    function activeKey() {
        var file = window.location.pathname.split('/').pop() || 'index.html';
        var key = file.replace(/\.html$/, '');
        for (var i = 0; i < NAV.length; i++) {
            if (NAV[i].key === key) return key;
        }
        return 'index';
    }

    function navLinks(active, mobile) {
        return NAV.map(function (item) {
            var isActive = !item.external && item.key === active;
            var cls;
            if (mobile) {
                cls = isActive
                    ? 'text-primary font-bold text-base py-3'
                    : 'text-on-surface-variant text-base py-3 transition-colors hover:text-primary';
            } else {
                // A tab-style underline that grows in from the left on hover
                // rather than snapping on, and stays fully drawn for the
                // active page instead of a static border.
                var underline = "relative pb-1 text-base transition-colors duration-200 after:content-[''] " +
                    'after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-primary ' +
                    'after:transition-all after:duration-300 after:ease-out';
                cls = isActive
                    ? underline + ' text-primary font-bold after:w-full'
                    : underline + ' text-on-surface-variant hover:text-primary after:w-0 hover:after:w-full';
            }
            return '<a href="' + url(item.href, item.external) + '"'
                + (item.external ? ' target="_blank" rel="noopener"' : '')
                + (isActive ? ' aria-current="page"' : '')
                + ' class="' + cls + '">' + item.label + '</a>';
        }).join('');
    }

    function headerHtml(active) {
        return '' +
        '<header class="fixed top-0 z-50 w-full bg-surface/60 backdrop-blur-md border-b border-transparent transition-all duration-500 h-20" id="main-header">' +
          '<div class="flex justify-between items-center w-full px-3 sm:px-6 lg:px-16 max-w-screen-2xl mx-auto h-full">' +
            '<a href="' + url('index.html') + '" class="flex items-center gap-1.5 sm:gap-4 min-w-0">' +
              '<img alt="IIT Madras Logo" class="h-7 sm:h-9 md:h-12 w-auto shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW1n8lOW9_eqQl9UfG96njTZrftuphW1MbaA6n6q1Xcy5pzrYEkSKoxllnCHXsVxeDOGYc-JXXD77-moN7w4CbZ3yPv9ecW6vxl6JiHqJAFx9TBBq1iwPcUO9NK_aquo5q3H_qOEVmu9pzQcTOKAh6no-dPiiJmo75zCY8EUPomFxqW5rAuUPOh9Iiv1lhD_XOJxbe4jXwJjoXUfBoZGKCdO6MsaoOb_Go1HbOQleX7Y8ZWC_kwvzYvLlOnD8yTVR4">' +
              '<span class="hidden sm:block h-8 sm:h-10 w-px bg-outline-variant/40 shrink-0"></span>' +
              '<img alt="Team MITR" class="h-7 sm:h-9 md:h-12 w-auto shrink-0" src="' + BASE + 'mitr-logo.png">' +
            '</a>' +
            // The full link row (5 links) plus the confidential badge, Support
            // button and DOST logo don't comfortably fit until genuine
            // desktop/laptop widths — even at exactly 1024px (a very common
            // tablet landscape width, e.g. iPad) it still wrapped and
            // overlapped the logo. Every tablet size, including landscape,
            // keeps the hamburger; the full row only shows from xl: (1280px).
            '<nav class="hidden xl:flex items-center space-x-6" aria-label="Main">' +
              navLinks(active, false) +
            '</nav>' +
            '<div class="flex items-center gap-1.5 sm:gap-4 xl:gap-6 shrink-0">' +
              '<span class="hidden xl:inline-flex items-center gap-1 text-secondary font-bold text-xs uppercase tracking-wide animate-pulse whitespace-nowrap" aria-hidden="true">' +
                '<span class="material-symbols-outlined text-sm">encrypted</span>Highly Confidential' +
              '</span>' +
              '<button class="relative bg-primary text-on-primary px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full font-bold text-xs sm:text-base hover:scale-95 transition-transform duration-200 whitespace-nowrap" id="sos-btn" data-support-btn type="button" aria-label="Support — every service is confidential">' +
                'Support' +
                '<span class="xl:hidden absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary animate-pulse ring-2 ring-surface" aria-hidden="true"></span>' +
              '</button>' +
              '<a href="' + DOST_URL + '" target="_blank" rel="noopener" class="shrink-0">' +
                '<img src="' + BASE + 'dostiitmlogo.svg" alt="Dost IITM" class="h-7 sm:h-10 xl:h-12 w-auto cursor-pointer hover:opacity-70 transition-opacity">' +
              '</a>' +
              '<button aria-controls="mobile-menu" aria-expanded="false" aria-label="Open menu" class="xl:hidden flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 -mr-1 sm:-mr-2 rounded-full text-primary hover:bg-primary/5 transition-colors shrink-0" id="mobile-menu-btn" type="button">' +
                '<span class="material-symbols-outlined text-2xl sm:text-3xl">menu</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<nav class="hidden xl:hidden absolute top-20 inset-x-0 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 shadow-lg px-6 py-4 flex-col opacity-0 -translate-y-2 transition-all duration-300 ease-out" id="mobile-menu" aria-label="Mobile">' +
            navLinks(active, true) +
            '<button class="bg-primary text-on-primary mt-3 px-6 py-3 rounded-full font-bold active:scale-95 transition-transform duration-200" data-support-btn type="button" aria-label="Support — every service is confidential">Support</button>' +
            '<p class="flex items-center justify-center gap-1.5 text-secondary font-bold text-xs uppercase tracking-wide animate-pulse mt-2" aria-hidden="true">' +
              '<span class="material-symbols-outlined text-sm">encrypted</span>Highly Confidential' +
            '</p>' +
          '</nav>' +
        '</header>';
    }

    function footerHtml() {
        var link = 'text-on-surface-variant hover:text-secondary transition-colors hover:underline';
        var links = NAV.map(function (item) {
            return '<a class="' + link + '" href="' + url(item.href, item.external) + '"'
                + (item.external ? ' target="_blank" rel="noopener"' : '')
                + '>' + item.label + '</a>';
        }).join('');

        return '' +
        // mt-auto keeps the footer pinned to the bottom on short pages whose
        // body is a min-h-screen flex column (directory.html); it computes to 0
        // in normal block flow, so the other pages are unaffected.
        '<footer class="w-full mt-auto px-6 lg:px-16 py-16 flex flex-col items-center gap-8 bg-surface-container border-t border-outline-variant/50">' +
          '<div class="flex flex-col items-center gap-6">' +
            // Logo only — the mark already carries the wordmark and the "In need
            // and indeed for you" line, so a repeated "IITM MITR" heading beside
            // it was saying the same thing twice.
            '<img alt="Team MITR — In need and indeed for you" class="h-20 w-auto" src="' + BASE + 'mitr-logo.png">' +
            '<nav class="flex flex-wrap justify-center gap-x-8 gap-y-3 text-base" aria-label="Footer">' +
              links +
              // Opens the feedback.js modal (mails the team + maintainers) rather
              // than a link, so this only works on pages that also load feedback.js.
              '<button type="button" data-open-feedback class="' + link + ' bg-transparent border-0 p-0 cursor-pointer">Feedback</button>' +
            '</nav>' +
          '</div>' +
          '<div class="w-full max-w-screen-xl border-t border-outline-variant/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">' +
            '<p class="text-sm text-on-surface-variant text-center">&copy; 2026 Indian Institute of Technology Madras. All rights reserved.' +
              '<span class="mx-1.5 opacity-60">&middot;</span>This site does not collect any of your data.</p>' +
            '<div class="flex gap-6 text-on-surface-variant">' +
              '<a href="' + INSTAGRAM_URL + '" target="_blank" rel="noopener" aria-label="Team MITR on Instagram" class="hover:text-primary transition-colors">' + INSTAGRAM_SVG + '</a>' +
              '<a href="' + LINKEDIN_URL + '" target="_blank" rel="noopener" aria-label="Team MITR on LinkedIn" class="hover:text-primary transition-colors">' + LINKEDIN_SVG + '</a>' +
              '<a href="' + DOST_URL + '" target="_blank" rel="noopener" aria-label="DoSt IIT Madras" class="hover:text-primary transition-colors"><span class="material-symbols-outlined">public</span></a>' +
              '<a href="mailto:' + CONTACT_EMAIL + '" aria-label="Email Team MITR" class="hover:text-primary transition-colors"><span class="material-symbols-outlined">alternate_email</span></a>' +
            '</div>' +
          '</div>' +
        '</footer>';
    }

    // The desks behind the header's Support button. Each row is a tel: link, so
    // choosing one dials it directly.
    var CAMPUS_DESKS = [
        ['Emergency Hotline', 'Available 24/7', '+91 44 2257 8000', '+914422578000'],
        ['Institute Hospital', 'Medical emergencies and clinical consultation', '044 2257 8330', '04422578330'],
        ['Campus Security', 'Immediate safety threats anywhere on campus', '044 2257 8280', '04422578280'],
        ['Wellness Centre', 'Counselling support, Mon to Sat, 10 am – 6 pm', '044 2257 8521', '04422578521']
    ];

    var NATIONAL_DESKS = [
        ['Tele-MANAS', 'Government of India mental health helpline — free, 24/7, in 20 languages', '14416', '14416'],
        ['Emergency Services', 'Police, fire and ambulance — the all-India emergency number', '112', '112']
    ];

    function deskRows(desks) {
        return desks.map(function (d) {
            return '' +
            '<a class="flex items-center justify-between gap-4 bg-surface-container hover:bg-surface-container-high rounded-2xl px-4 py-3 transition-colors" href="tel:' + d[3] + '">' +
              '<span class="flex flex-col">' +
                '<span class="font-bold text-on-surface">' + d[0] + '</span>' +
                '<span class="text-sm text-on-surface-variant">' + d[1] + '</span>' +
                '<span class="text-sm text-secondary font-bold">' + d[2] + '</span>' +
              '</span>' +
              '<span class="material-symbols-outlined text-secondary">call</span>' +
            '</a>';
        }).join('');
    }

    function sosHtml() {
        return '' +
        '<div id="sos-modal" role="dialog" aria-modal="true" aria-labelledby="sos-modal-title"' +
        '     class="hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm items-center justify-center p-6">' +
          '<div class="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-8 max-h-[85vh] overflow-y-auto">' +
            '<div class="flex items-start justify-between gap-4 mb-2">' +
              '<h3 class="text-2xl font-bold text-on-surface" id="sos-modal-title" style="font-family:\'Newsreader\',serif">Call for help</h3>' +
              '<button id="sos-modal-close" type="button" aria-label="Close"' +
              '        class="material-symbols-outlined text-on-surface-variant hover:text-primary leading-none">close</button>' +
            '</div>' +
            '<p class="text-on-surface-variant mb-6">Choose the desk you need — tapping a number dials it straight away.</p>' +
            '<div class="space-y-3">' + deskRows(CAMPUS_DESKS) + '</div>' +
            '<p class="text-xs uppercase tracking-widest text-on-surface-variant mt-8 mb-3">National helplines</p>' +
            '<div class="space-y-3">' + deskRows(NATIONAL_DESKS) + '</div>' +
            '<a class="mt-6 flex items-center justify-center gap-2 text-primary font-bold hover:underline" href="' + url('emergency.html') + '">' +
              'See all emergency contacts<span class="material-symbols-outlined text-base">arrow_forward</span>' +
            '</a>' +
          '</div>' +
        '</div>';
    }

    // Below md the desktop <nav> is hidden, so this panel is the only way to
    // move between pages. (Behaviour moved here from the old nav.js.)
    function wireMobileMenu() {
        var btn = document.getElementById('mobile-menu-btn');
        var panel = document.getElementById('mobile-menu');
        if (!btn || !panel) return;

        var CLOSE_DURATION = 250;
        var closeTimer = null;

        function isOpen() { return !panel.classList.contains('hidden'); }
        function open() {
            if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
            panel.classList.remove('hidden');
            panel.classList.add('flex');
            // Force layout so the browser registers the closed state above
            // before the class swap below — otherwise both happen in the same
            // frame and the transition never plays.
            void panel.offsetHeight;
            panel.classList.remove('opacity-0', '-translate-y-2');
            panel.classList.add('opacity-100', 'translate-y-0');
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Close menu');
        }
        function close() {
            panel.classList.remove('opacity-100', 'translate-y-0');
            panel.classList.add('opacity-0', '-translate-y-2');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Open menu');
            // Keep `flex` through the fade-out, then drop to `hidden` once the
            // transition finishes so a closed menu still has zero layout impact.
            closeTimer = window.setTimeout(function () {
                panel.classList.add('hidden');
                panel.classList.remove('flex');
                closeTimer = null;
            }, CLOSE_DURATION);
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isOpen()) close(); else open();
        });

        // Tapping outside dismisses. The button stops propagation above so its
        // own click still toggles rather than immediately re-closing.
        document.addEventListener('click', function (e) {
            if (isOpen() && !panel.contains(e.target)) close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen()) { close(); btn.focus(); }
        });

        // Widening past xl swaps the desktop nav back in; an open panel would
        // otherwise be stranded on screen with nothing to close it.
        var desktop = window.matchMedia('(min-width: 1280px)');
        var onWidthChange = function (e) { if (e.matches) close(); };
        if (desktop.addEventListener) {
            desktop.addEventListener('change', onWidthChange);
        } else {
            desktop.addListener(onWidthChange); // Safari < 14
        }
    }

    // Support opens the "Call for help" dialog on every page. It used to only
    // work on the home page, which was the one page carrying the markup;
    // everywhere else the button just navigated to the support desk page, which
    // is the slowest possible route to a phone number in an emergency.
    function wireSupportButtons() {
        var modal = document.getElementById('sos-modal');
        var buttons = document.querySelectorAll('[data-support-btn]');

        // Injected only when the page hasn't kept its own copy.
        if (!modal) {
            var host = document.createElement('div');
            host.innerHTML = sosHtml();
            modal = host.firstElementChild;
            document.body.appendChild(modal);
        }

        var closeBtn = document.getElementById('sos-modal-close');

        // Toggling `flex` rather than leaving it on avoids relying on `hidden`
        // winning the display cascade against it.
        function open() {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
        function close() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        Array.prototype.forEach.call(buttons, function (btn) {
            btn.addEventListener('click', open);
        });
        if (closeBtn) closeBtn.addEventListener('click', close);
        modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
        });
    }

    function init() {
        var headerSlot = document.querySelector('[data-site-header]');
        var footerSlot = document.querySelector('[data-site-footer]');

        if (headerSlot) headerSlot.outerHTML = headerHtml(activeKey());
        if (footerSlot) footerSlot.outerHTML = footerHtml();

        wireMobileMenu();
        wireSupportButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
