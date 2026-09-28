// Shared "Book a Coffee with MITR" modal — the informal counterpart to the
// Book a Session dialog in booking.js, and the same dialog behind "Talk to a
// Mentor" on the home page.
//
// Like booking.js: no backend. Submitting opens a pre-filled Gmail compose
// window addressed to the MITR team inbox, and the visitor sends it from their
// own account.
//
// Requests always go to the team inbox, never to an individual. Students used
// to be able to pick a specific coordinator from their directory card, which
// put one named student in a 1:1 arrangement with a stranger with no one else
// in the loop; routing through the team means a request is always visible to
// the group and can be assigned appropriately.
//
//   <button data-open-coffee                          -> opens the dialog
//           data-coffee-target="Any MITR Mentor">     -> optional label shown
//                                                        in the form
(function () {
    'use strict';

    var TEAM_INBOX = 'mitr@smail.iitm.ac.in';
    var DEFAULT_TARGET = 'Any Available MITR Coordinator';

    var SPOTS = [
        'Himalaya Food Court',
        'CCD / Library Cafe',
        'Hostel Common Room',
        'Department Quadrangle',
        'Any quiet spot on campus'
    ];

    var MODAL_HTML = [
        '<div id="coffee-modal" role="dialog" aria-modal="true" aria-labelledby="coffee-modal-title"',
        '     class="hidden fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm items-center justify-center p-4">',
        '  <div class="bg-surface max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/40 relative">',
        '    <div class="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4">',
        '      <div class="flex items-center gap-2.5 text-primary">',
        '        <span class="material-symbols-outlined text-2xl">local_cafe</span>',
        '        <h3 class="text-2xl font-bold" id="coffee-modal-title" style="font-family:\'Newsreader\',serif">Book a Coffee with MITR</h3>',
        '      </div>',
        '      <button id="coffee-modal-close" type="button" aria-label="Close"',
        '              class="text-outline hover:text-on-surface p-1 rounded-full">',
        '        <span class="material-symbols-outlined text-2xl">close</span>',
        '      </button>',
        '    </div>',
        '    <form id="coffee-form" class="space-y-4">',
        '      <div>',
        '        <label for="coffee-peer" class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Request goes to</label>',
        '        <input type="text" id="coffee-peer" readonly',
        '               class="w-full rounded-xl border-outline-variant bg-surface-container px-4 py-2.5 text-sm font-semibold text-primary">',
        '      </div>',
        '      <div>',
        '        <label for="coffee-location" class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Preferred Meeting Spot</label>',
        '        <select id="coffee-location"',
        '                class="w-full rounded-xl border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm focus:border-primary focus:ring-primary">',
        SPOTS.map(function (s) {
            return '          <option value="' + s + '">' + s + '</option>';
        }).join('\n'),
        '        </select>',
        '      </div>',
        '      <div>',
        '        <label for="coffee-note" class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Brief Note (Optional)</label>',
        '        <textarea id="coffee-note" rows="3"',
        '                  placeholder="Hi! I would love to catch up for a coffee and chat about campus life..."',
        '                  class="w-full rounded-xl border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"></textarea>',
        '      </div>',
        '      <div class="flex items-center justify-end gap-3 pt-2">',
        '        <button type="button" id="coffee-cancel"',
        '                class="px-5 py-2.5 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container">Cancel</button>',
        '        <button type="submit"',
        '                class="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 shadow-md flex items-center gap-2">',
        '          <span class="material-symbols-outlined text-sm">local_cafe</span><span>Send Coffee Request</span>',
        '        </button>',
        '      </div>',
        '    </form>',
        '  </div>',
        '</div>'
    ].join('\n');

    function init() {
        var modal = document.getElementById('coffee-modal');
        if (!modal) {
            var host = document.createElement('div');
            host.innerHTML = MODAL_HTML;
            modal = host.firstElementChild;
            document.body.appendChild(modal);
        }

        var peerInput = document.getElementById('coffee-peer');
        var form = document.getElementById('coffee-form');
        var closeBtn = document.getElementById('coffee-modal-close');
        var cancelBtn = document.getElementById('coffee-cancel');
        function open(name) {
            peerInput.value = name || DEFAULT_TARGET;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function close() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        Array.prototype.forEach.call(
            document.querySelectorAll('[data-open-coffee]'),
            function (btn) {
                btn.addEventListener('click', function () {
                    open(btn.getAttribute('data-coffee-target'));
                });
            }
        );

        if (closeBtn) closeBtn.addEventListener('click', close);
        if (cancelBtn) cancelBtn.addEventListener('click', close);
        modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var target = peerInput.value;
            var location = document.getElementById('coffee-location').value;
            var note = document.getElementById('coffee-note').value.trim();

            var subject = 'Book a Coffee with MITR — ' + target;
            var body = 'Hello Team MITR,\n\n' +
                'I would like to request a casual coffee chat as part of Book a Coffee with MITR!\n\n' +
                'Preferred Spot: ' + location + '\n\n';

            if (note) body += 'Note:\n' + note + '\n\n';

            body += 'Looking forward to hearing from you!\n\nBest regards,\nIIT Madras Student';

            var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1' +
                '&to=' + encodeURIComponent(TEAM_INBOX) +
                '&su=' + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(body);

            // Opened synchronously in response to the submit, so it isn't
            // blocked as an unrequested popup.
            window.open(gmailUrl, '_blank');
            close();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
