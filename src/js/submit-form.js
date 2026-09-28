// POST MITR booking / coffee / feedback forms to the site-root PHP endpoint.
(function () {
    'use strict';

    function apiUrl() {
        var path = window.location.pathname || '/';
        var lower = path.toLowerCase();
        var idx = lower.lastIndexOf('/mitr/');
        if (idx < 0) {
            idx = lower.lastIndexOf('/mitr');
        }
        var prefix = idx >= 0 ? path.slice(0, idx) : '';
        return prefix + '/mitr_submit.php';
    }

    window.mitrSubmitForm = function (payload) {
        return fetch(apiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        }).then(function (res) {
            return res.text().then(function (text) {
                var data = null;
                try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
                if (!res.ok || !data || !data.ok) {
                    var message = (data && data.error)
                        ? data.error
                        : 'Could not send your request. Please try again.';
                    throw new Error(message);
                }
                return data;
            });
        });
    };
})();
