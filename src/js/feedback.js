// Shared "Share Your Feedback" modal — same pattern as booking.js / coffee.js.
//
// No backend: submitting opens a pre-filled Gmail compose window addressed to
// the MITR team inbox plus the two site maintainers, and the visitor sends it
// themselves from their own account.
//
//   <button data-open-feedback>   -> opens the dialog
(function () {
    'use strict';

    var RECIPIENTS = [
        'mitr@smail.iitm.ac.in'
    ];

    var CATEGORIES = [
        'General Feedback',
        'Website / Portal Feedback',
        'Event Feedback',
        'Suggestion',
        'Other'
    ];

    var MODAL_HTML = [
        '<div id="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title"',
        '     class="hidden fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm items-center justify-center p-4">',
        '  <div class="bg-surface max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/40 relative">',
        '    <div class="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4">',
        '      <div class="flex items-center gap-2.5 text-primary">',
        '        <span class="material-symbols-outlined text-2xl">rate_review</span>',
        '        <h3 class="text-2xl font-bold" id="feedback-modal-title" style="font-family:\'Newsreader\',serif">Share Your Feedback</h3>',
        '      </div>',
        '      <button id="feedback-modal-close" type="button" aria-label="Close"',
        '              class="text-outline hover:text-on-surface p-1 rounded-full">',
        '        <span class="material-symbols-outlined text-2xl">close</span>',
        '      </button>',
        '    </div>',
        '    <p class="text-sm text-on-surface-variant mb-4">Tell us what is working, what is not, or what you would like to see.</p>',
        '    <form id="feedback-form" class="space-y-4">',
        '      <div>',
        '        <label for="feedback-category" class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Category</label>',
        '        <select id="feedback-category"',
        '                class="w-full rounded-xl border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm focus:border-primary focus:ring-primary">',
        CATEGORIES.map(function (c) {
            return '          <option value="' + c + '">' + c + '</option>';
        }).join('\n'),
        '        </select>',
        '      </div>',
        '      <div>',
        '        <label for="feedback-message" class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Your Feedback</label>',
        '        <textarea id="feedback-message" rows="4" required',
        '                  placeholder="Share your thoughts here..."',
        '                  class="w-full rounded-xl border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm focus:border-primary focus:ring-primary resize-y"></textarea>',
        '      </div>',
        '      <p class="hidden text-sm text-error font-bold" id="feedback-error"></p>',
        '      <div class="flex items-center justify-end gap-3 pt-2">',
        '        <button type="button" id="feedback-cancel"',
        '                class="px-5 py-2.5 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container">Cancel</button>',
        '        <button type="submit"',
        '                class="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 shadow-md flex items-center gap-2">',
        '          <span class="material-symbols-outlined text-sm">send</span><span>Send Feedback</span>',
        '        </button>',
        '      </div>',
        '    </form>',
        '  </div>',
        '</div>'
    ].join('\n');

    function init() {
        var openers = document.querySelectorAll('[data-open-feedback]');
        if (!openers.length) return;

        var modal = document.getElementById('feedback-modal');
        if (!modal) {
            var host = document.createElement('div');
            host.innerHTML = MODAL_HTML;
            modal = host.firstElementChild;
            document.body.appendChild(modal);
        }

        var closeBtn = document.getElementById('feedback-modal-close');
        var cancelBtn = document.getElementById('feedback-cancel');
        var form = document.getElementById('feedback-form');
        var categoryInput = document.getElementById('feedback-category');
        var messageInput = document.getElementById('feedback-message');
        var errorEl = document.getElementById('feedback-error');

        function open() {
            form.reset();
            errorEl.classList.add('hidden');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function close() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        Array.prototype.forEach.call(openers, function (btn) {
            btn.addEventListener('click', open);
        });
        if (closeBtn) closeBtn.addEventListener('click', close);
        if (cancelBtn) cancelBtn.addEventListener('click', close);
        modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var messageVal = messageInput.value.trim();
            if (!messageVal) {
                errorEl.textContent = 'Please enter your feedback before sending.';
                errorEl.classList.remove('hidden');
                return;
            }
            errorEl.classList.add('hidden');

            var category = categoryInput.value;
            var subject = 'MITR Website Feedback — ' + category;
            var body = 'Hello Team MITR,\n\n' +
                'Category: ' + category + '\n\n' +
                messageVal + '\n\n' +
                '—\nSent from the Team MITR wellness portal.';

            var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1' +
                '&to=' + encodeURIComponent(RECIPIENTS.join(',')) +
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
