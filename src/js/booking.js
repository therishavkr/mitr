// Shared "Book a Session" modal. Any page that loads this file gets it: put
// `data-open-booking` on a button and that button opens the dialog.
//
// No backend or storage is involved: submitting opens a pre-filled Gmail
// compose window addressed to the chosen venue, and the visitor sends it
// themselves from their own inbox.
//
// The markup used to be copied into each page, which left three versions that
// had already drifted apart in styling — and the copy on the directory page was
// missing entirely at one point, so its button silently did nothing. This file
// now owns the markup as well as the behaviour and injects it once per page.
(function () {
    'use strict';

    var VENUES = [
        { label: 'Institute Hospital', email: 'cmo@iitm.ac.in' },
        {
            label: 'Wellness Centre — 1st Floor, DoSt Office',
            email: 'wellness1@smail.iitm.ac.in'
        },
        {
            label: 'YourDOST — 2nd Floor, Central Library',
            // Placeholder — no real desk email was given for the library;
            // swap this for the actual address before deploy.
            email: 'library.counsellor@iitm.ac.in'
        }
    ];

    var MODAL_HTML = [
        '<div class="hidden fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm items-center justify-center p-4"',
        '     id="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">',
        '  <div class="bg-surface rounded-3xl shadow-2xl w-full max-w-lg p-6 relative border border-outline-variant/40">',
        '    <div class="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4">',
        '      <div class="flex items-center gap-2.5 text-primary">',
        '        <span class="material-symbols-outlined text-2xl">event_available</span>',
        '        <h3 class="text-2xl font-bold" id="booking-modal-title" style="font-family:\'Newsreader\',serif">Book a Session</h3>',
        '      </div>',
        '      <button id="booking-modal-close" type="button" aria-label="Close"',
        '              class="text-outline hover:text-on-surface p-1 rounded-full">',
        '        <span class="material-symbols-outlined text-2xl">close</span>',
        '      </button>',
        '    </div>',
        '    <p class="text-sm text-on-surface-variant mb-4">Choose a date, time, and venue that works for you.</p>',
        '    <form class="space-y-4" id="booking-form">',
        '      <div>',
        '        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1" for="booking-date">Date</label>',
        '        <input id="booking-date" name="date" type="date" required',
        '               class="w-full rounded-xl border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm focus:border-primary focus:ring-primary">',
        '      </div>',
        '      <div>',
        '        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1" for="booking-time">Time (optional)</label>',
        '        <input id="booking-time" name="time" type="time"',
        '               class="w-full rounded-xl border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm focus:border-primary focus:ring-primary">',
        '      </div>',
        '      <div>',
        '        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1" for="booking-venue">Venue</label>',
        '        <select id="booking-venue" name="venue" required',
        '                class="w-full rounded-xl border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm focus:border-primary focus:ring-primary">',
        '          <option disabled selected value="">Select a venue</option>',
        '        </select>',
        '      </div>',
        '      <div>',
        '        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1" for="booking-message">Message (optional)</label>',
        '        <textarea id="booking-message" name="message" rows="3"',
        '                  placeholder="Anything you would like the counsellor to know beforehand."',
        '                  class="w-full rounded-xl border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm focus:border-primary focus:ring-primary resize-y"></textarea>',
        '      </div>',
        '      <p class="hidden text-sm text-error font-bold" id="booking-error"></p>',
        '      <div class="flex items-center justify-end gap-3 pt-2">',
        '        <button type="button" id="booking-cancel"',
        '                class="px-5 py-2.5 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container">Cancel</button>',
        '        <button type="submit"',
        '                class="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 shadow-md flex items-center gap-2">',
        '          <span class="material-symbols-outlined text-sm">send</span><span>Confirm Request</span>',
        '        </button>',
        '      </div>',
        '    </form>',
        '    <p class="hidden text-sm text-primary font-bold mt-4" id="booking-success"></p>',
        '  </div>',
        '</div>'
    ].join('\n');

    function init() {
        var openers = document.querySelectorAll('[data-open-booking]');
        if (!openers.length) return;

        // Injected only when the page hasn't kept its own copy, so a page that
        // still carries the old inline markup keeps working unchanged.
        var modal = document.getElementById('booking-modal');
        if (!modal) {
            var host = document.createElement('div');
            host.innerHTML = MODAL_HTML;
            modal = host.firstElementChild;
            document.body.appendChild(modal);
        }

        var closeBtn = document.getElementById('booking-modal-close');
        var cancelBtn = document.getElementById('booking-cancel');
        var form = document.getElementById('booking-form');
        var dateInput = document.getElementById('booking-date');
        var timeInput = document.getElementById('booking-time');
        var venueInput = document.getElementById('booking-venue');
        var messageInput = document.getElementById('booking-message');
        var errorEl = document.getElementById('booking-error');
        var successEl = document.getElementById('booking-success');

        VENUES.forEach(function (venue) {
            var option = document.createElement('option');
            option.textContent = venue.label;
            venueInput.appendChild(option);
        });

        function emailForVenue(label) {
            for (var i = 0; i < VENUES.length; i++) {
                if (VENUES[i].label === label) return VENUES[i].email;
            }
            return null;
        }

        function todayStr() {
            var d = new Date();
            var yyyy = d.getFullYear();
            var mm = String(d.getMonth() + 1).padStart(2, '0');
            var dd = String(d.getDate()).padStart(2, '0');
            return yyyy + '-' + mm + '-' + dd;
        }

        function formatDateForEmail(dateVal) {
            var parts = dateVal.split('-');
            var d = new Date(parts[0], parts[1] - 1, parts[2]);
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        function formatTimeForEmail(timeVal) {
            var parts = timeVal.split(':');
            var d = new Date();
            d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10));
            return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
        }

        function openModal() {
            form.reset();
            form.classList.remove('hidden');
            errorEl.classList.add('hidden');
            successEl.classList.add('hidden');
            dateInput.min = todayStr();
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        Array.prototype.forEach.call(openers, function (btn) {
            btn.addEventListener('click', openModal);
        });
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            errorEl.classList.add('hidden');

            var dateVal = dateInput.value;
            var timeVal = timeInput.value;
            var venueVal = venueInput.value;

            if (!dateVal || !venueVal) {
                errorEl.textContent = 'Please fill in date and venue.';
                errorEl.classList.remove('hidden');
                return;
            }

            // Time is optional. With a time, the whole moment must be in the
            // future; without one, the date alone just can't be in the past.
            var chosen = timeVal
                ? new Date(dateVal + 'T' + timeVal)
                : new Date(dateVal + 'T23:59');
            if (isNaN(chosen.getTime()) || chosen.getTime() <= Date.now()) {
                errorEl.textContent = timeVal
                    ? 'Please choose a date and time in the future.'
                    : 'Please choose a date in the future.';
                errorEl.classList.remove('hidden');
                return;
            }

            var recipient = emailForVenue(venueVal);
            if (!recipient) {
                errorEl.textContent = 'This venue is not set up for booking yet.';
                errorEl.classList.remove('hidden');
                return;
            }

            var messageVal = messageInput ? messageInput.value.trim() : '';

            var subject = 'Counselling Session Request via MITR Website — '
                + formatDateForEmail(dateVal) + ', ' + venueVal;

            var body = 'Hello,\n\n' +
                'I am a member of the IIT Madras campus community and I am reaching out '
                + 'because I would like support for my emotional wellbeing. I am requesting '
                + 'a counselling session at the slot below.\n\n' +
                'Requested date:  ' + formatDateForEmail(dateVal) + '\n' +
                'Requested time:  ' + (timeVal
                    ? formatTimeForEmail(timeVal)
                    : 'No specific time — any slot that works for you') + '\n' +
                'Preferred venue: ' + venueVal + '\n\n';

            if (messageVal) {
                body += 'What I would like you to know beforehand:\n'
                    + messageVal + '\n\n';
            }

            body += 'Please confirm whether this slot works, or suggest the nearest '
                + 'available one. If this request needs to be redirected to a different '
                + 'desk, kindly let me know.\n\n' +
                'Thank you for your time and support.\n\n' +
                '—\n' +
                'Sent from the Team MITR wellness portal.\n' +
                'This request was submitted through the website booking form and is '
                + 'awaiting confirmation.';

            var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1'
                + '&to=' + encodeURIComponent(recipient)
                + '&su=' + encodeURIComponent(subject)
                + '&body=' + encodeURIComponent(body);

            // Opened synchronously in response to the click, so it isn't
            // blocked as an unrequested popup.
            window.open(gmailUrl, '_blank');

            form.classList.add('hidden');
            successEl.textContent = 'Opening Gmail with your request filled in — just hit send from there.';
            successEl.classList.remove('hidden');
            setTimeout(closeModal, 1800);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
