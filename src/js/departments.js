// Department names, shared by both directory pages.
//
// The two data sources disagree on how a department is written: faculty.json
// stores short codes ("ED"), while the peer coordinator list in directory.html
// was typed by hand and mixes full names with ad-hoc abbreviations ("CSE",
// "Mech", "Biotech"). Everything is normalised through departmentName() so the
// cards read the same on both pages and the department filter offers one option
// per department instead of one per spelling.
(function () {
    'use strict';

    // Official code -> name, as used in faculty.json.
    var CODES = {
        AE: 'Aerospace Engineering',
        AMBE: 'Applied Mechanics and Biomedical Engineering',
        BT: 'Biotechnology',
        CE: 'Civil Engineering',
        CH: 'Chemical Engineering',
        CS: 'Computer Science and Engineering',
        CY: 'Chemistry',
        DSAI: 'Data Science and Artificial Intelligence',
        ED: 'Engineering Design',
        EE: 'Electrical Engineering',
        HSS: 'Humanities and Social Sciences',
        MA: 'Mathematics',
        ME: 'Mechanical Engineering',
        MME: 'Metallurgical and Materials Engineering',
        MS: 'Management Studies',
        MST: 'Medical Sciences and Technology',
        OE: 'Ocean Engineering',
        PH: 'Physics'
    };

    // Informal spellings that appear in the hand-typed peer list.
    var ALIASES = {
        cse: 'Computer Science and Engineering',
        mech: 'Mechanical Engineering',
        biotech: 'Biotechnology',
        maths: 'Mathematics'
    };

    // Anything already spelled out, or not recognised at all, is returned
    // unchanged rather than dropped — an unknown department still shows.
    window.departmentName = function (value) {
        if (!value) return '';
        var trimmed = String(value).trim();
        if (CODES[trimmed.toUpperCase()]) return CODES[trimmed.toUpperCase()];
        if (ALIASES[trimmed.toLowerCase()]) return ALIASES[trimmed.toLowerCase()];
        return trimmed;
    };
})();
