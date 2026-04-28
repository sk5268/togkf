/* ── Global helpers ── */
function addSocialLink() {
    var container = document.getElementById('socialLinksContainer');
    if (!container) return;
    var newRow = document.createElement('div');
    newRow.className = 'social-link-row';
    newRow.innerHTML =
        '<button type="button" class="btn-remove-row" title="Remove" onclick="this.parentNode.remove()">&times;</button>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Platform</label>' +
        '<select name="social_platform[]">' +
        '<option value="Website">Website</option>' +
        '<option value="Facebook">Facebook</option>' +
        '<option value="Instagram">Instagram</option>' +
        '<option value="YouTube">YouTube</option>' +
        '<option value="Twitter/X">Twitter/X</option>' +
        '<option value="Other">Other</option>' +
        '</select>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>URL</label>' +
        '<input type="url" name="social_url[]" placeholder="https://">' +
        '</div>' +
        '</div>';
    container.appendChild(newRow);
}

/* ── Form logic ── */
document.addEventListener('DOMContentLoaded', function () {

    var cards = document.querySelectorAll('.affiliation-card');
    var headInstructorSection = document.getElementById('headInstructorSection');
    var orgDojoSection = document.getElementById('orgDojoSection');
    var rankDetailsSection = document.getElementById('rankDetailsSection');
    var numDojosGroup = document.getElementById('numDojosGroup');
    var rankSectionTitle = document.getElementById('rankSectionTitle');
    var submitBtn = document.getElementById('submitBtn');
    var mobileInput = document.getElementById('mobile');
    var emailInput = document.getElementById('email');
    var mobileHint = document.getElementById('mobileHint');
    var emailHint = document.getElementById('emailHint');

    /* ── Helpers ── */
    function getFieldValue(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function getSelectedType() {
        var r = document.querySelector('input[name="affiliation_type"]:checked');
        return r ? r.value : null;
    }

    function isValidMobile(v) {
        return /^(\+91[\s-]?)?[0]?(91)?[6-9]\d{9}$/.test(v.replace(/\s/g, ''));
    }

    function isValidEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    }

    /* ── Visibility toggling based on affiliation type ── */
    function updateFormVisibility() {
        var type = getSelectedType();
        if (!type) return;

        if (type === 'Individual Member') {
            headInstructorSection.style.display = 'none';
            orgDojoSection.style.display = 'none';
            rankSectionTitle.textContent = 'Rank & Grade Details';
        } else {
            headInstructorSection.style.display = 'block';
            orgDojoSection.style.display = 'block';
            rankSectionTitle.textContent = 'Head Instructor Rank & Grade';
            numDojosGroup.style.display = (type === 'Organization') ? 'block' : 'none';
        }
        rankDetailsSection.style.display = 'block';
    }

    /* ── Build list of missing / invalid fields ── */
    function getMissingFields() {
        var missing = [];
        var type = getSelectedType();

        /* Fields required for EVERYONE */
        if (!getFieldValue('firstName')) missing.push({ label: 'First Name', id: 'firstName' });
        if (!getFieldValue('lastName')) missing.push({ label: 'Last Name', id: 'lastName' });

        var em = getFieldValue('email');
        if (!em) missing.push({ label: 'Email Address', id: 'email' });
        else if (!isValidEmail(em)) missing.push({ label: 'Valid Email Address', id: 'email' });

        var ph = getFieldValue('mobile');
        if (!ph) missing.push({ label: 'Phone Number', id: 'mobile' });
        else if (!isValidMobile(ph)) missing.push({ label: 'Valid 10-digit Phone Number', id: 'mobile' });

        if (!getFieldValue('address1')) missing.push({ label: 'Address Line 1', id: 'address1' });
        if (!getFieldValue('city')) missing.push({ label: 'City', id: 'city' });
        if (!getFieldValue('state')) missing.push({ label: 'State', id: 'state' });
        if (!getFieldValue('pincode')) missing.push({ label: 'Postal / Zip Code', id: 'pincode' });
        if (!getFieldValue('whyJoin')) missing.push({ label: 'Why you want to join TOGKF', id: 'whyJoin' });

        /* Extra fields for Dojo / Organization ONLY */
        if (type && type !== 'Individual Member') {
            if (!getFieldValue('yearsPracticing')) missing.push({ label: 'Years Practicing', id: 'yearsPracticing' });
            if (!getFieldValue('orgName')) missing.push({ label: 'Organisation / Dojo Name', id: 'orgName' });
            if (!getFieldValue('numBlackBelts')) missing.push({ label: 'Number of Black Belt Members', id: 'numBlackBelts' });
            if (!getFieldValue('numStudents')) missing.push({ label: 'Number of Students', id: 'numStudents' });
            if (type === 'Organization' && !getFieldValue('numDojos')) {
                missing.push({ label: 'Number of Dojos', id: 'numDojos' });
            }
        }

        return missing;
    }

    /* ── Checklist panel (injected once) ── */
    var checklistPanel = document.createElement('div');
    checklistPanel.id = 'validationChecklist';
    checklistPanel.className = 'validation-checklist';
    checklistPanel.hidden = true;
    submitBtn.parentNode.insertBefore(checklistPanel, submitBtn);

    /* ── Core: re-evaluate form and update UI ── */
    function updateSubmitState() {
        var missing = getMissingFields();

        /* mobile / email inline hints */
        if (mobileInput.value.length > 0) {
            var mok = isValidMobile(mobileInput.value);
            mobileInput.classList.toggle('valid-field', mok);
            mobileHint.textContent = mok ? '' : 'Please enter a valid 10-digit Indian mobile number.';
            if (!mok) mobileHint.style.color = '#e53935';
        } else {
            mobileInput.classList.remove('valid-field');
            mobileHint.textContent = '';
        }

        if (emailInput.value.length > 0) {
            var eok = isValidEmail(emailInput.value);
            emailInput.classList.toggle('valid-field', eok);
            emailHint.textContent = eok ? '' : 'Please enter a valid email address.';
            if (!eok) emailHint.style.color = '#e53935';
        } else {
            emailInput.classList.remove('valid-field');
            emailHint.textContent = '';
        }

        /* Button state */
        var ready = (missing.length === 0);
        submitBtn.classList.toggle('btn-not-ready', !ready);
        submitBtn.classList.toggle('enabled', ready);

        /* Checklist content */
        if (missing.length > 0) {
            var html = '<strong>⚠️ Please complete the following:</strong><ul>';
            missing.forEach(function (f) {
                html += '<li><a href="#' + f.id + '" onclick="document.getElementById(\'' + f.id + '\').focus();return false;">' + f.label + '</a></li>';
            });
            html += '</ul>';
            checklistPanel.innerHTML = html;
        }
        if (ready) checklistPanel.hidden = true;

        /* Debug: log to console so we can diagnose */
        console.log('[affiliate] type=' + getSelectedType() + '  missing=' + missing.length, missing.map(function (m) { return m.label; }));
    }

    /* ── Card click ── */
    cards.forEach(function (card) {
        card.addEventListener('click', function () {
            cards.forEach(function (c) { c.classList.remove('selected'); });
            card.classList.add('selected');
            var radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            updateFormVisibility();
            updateSubmitState();
        });
    });

    /* ── Input listeners on all required fields ── */
    ['firstName', 'lastName', 'email', 'mobile',
        'address1', 'city', 'state', 'pincode', 'whyJoin',
        'yearsPracticing', 'orgName', 'numBlackBelts', 'numStudents', 'numDojos'
    ].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', updateSubmitState);
        el.addEventListener('change', updateSubmitState);
    });

    /* ── Submit button click ── */
    submitBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        var missing = getMissingFields();

        /* Not ready → show checklist */
        if (missing.length > 0) {
            checklistPanel.hidden = false;
            checklistPanel.classList.remove('shake');
            void checklistPanel.offsetWidth;
            checklistPanel.classList.add('shake');
            checklistPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        /* ── Ready → submit ── */
        var originalLabel = submitBtn.textContent.trim();
        submitBtn.textContent = 'Sending Application…';
        submitBtn.classList.add('btn-not-ready');
        submitBtn.classList.remove('enabled');

        var form = document.getElementById('joinUsForm');
        var formData = new FormData(form);
        var payload = Object.fromEntries(formData.entries());

        /* Social links */
        var platforms = formData.getAll('social_platform[]');
        var urls = formData.getAll('social_url[]');
        payload.socialLinks = platforms
            .map(function (p, i) { return p + ': ' + (urls[i] || ''); })
            .filter(function (s) { return s.length > 5; })
            .join(' | ');

        /* Affiliation type */
        payload.affiliation_type = getSelectedType() || '';

        try {
            await fetch(
                'https://script.google.com/macros/s/AKfycbzlIUTiDr0eJ3upFMk2EmjspZ9EAU7ZizsxT-bGt31IpMG67ABfuZNuu8KQEt7aCbR8/exec',
                {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );

            alert('Thank you. TOGKF India has received your affiliation request.');
            form.reset();

            cards.forEach(function (c) { c.classList.remove('selected'); });
            var dc = document.getElementById('card-dojo');
            if (dc) {
                dc.classList.add('selected');
                var dr = dc.querySelector('input[type="radio"]');
                if (dr) dr.checked = true;
            }
            updateFormVisibility();
            checklistPanel.hidden = true;

        } catch (err) {
            console.error('Submission Error:', err);
            alert('There was an error sending your application. Please try again.');
        } finally {
            submitBtn.textContent = originalLabel;
            updateSubmitState();
        }
    });

    /* ── Initial run ── */
    updateFormVisibility();
    updateSubmitState();
});
