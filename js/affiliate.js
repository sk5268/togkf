        /* ── Global helpers (must be defined before main.js in case main.js errors) ── */
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
        document.addEventListener('DOMContentLoaded', function() {

            /* ── Affiliation card selection ── */
            var cards = document.querySelectorAll('.affiliation-card');
            var headInstructorSection = document.getElementById('headInstructorSection');
            var orgDojoSection = document.getElementById('orgDojoSection');
            var rankDetailsSection = document.getElementById('rankDetailsSection');
            var numDojosGroup = document.getElementById('numDojosGroup');
            var rankSectionTitle = document.getElementById('rankSectionTitle');

            function updateFormVisibility() {
                var checkedRadio = document.querySelector('input[name="affiliation_type"]:checked');
                if (!checkedRadio) return;
                var selectedType = checkedRadio.value;

                if (selectedType === 'Individual Member') {
                    headInstructorSection.style.display = 'none';
                    orgDojoSection.style.display = 'none';
                    rankSectionTitle.textContent = 'Rank & Grade Details';
                } else {
                    headInstructorSection.style.display = 'block';
                    orgDojoSection.style.display = 'block';
                    rankSectionTitle.textContent = 'Head Instructor Rank & Grade';

                    if (selectedType === 'Dojo') {
                        numDojosGroup.style.display = 'none';
                    } else {
                        numDojosGroup.style.display = 'block';
                    }
                }
                rankDetailsSection.style.display = 'block';
                updateSubmitState();
            }

            cards.forEach(function(card) {
                card.addEventListener('click', function() {
                    cards.forEach(function(c) { c.classList.remove('selected'); });
                    card.classList.add('selected');
                    updateFormVisibility();
                });
            });

            updateFormVisibility();

            /* ── Submit button enable logic ── */
            var mobileInput = document.getElementById('mobile');
            var emailInput = document.getElementById('email');
            var submitBtn = document.getElementById('submitBtn');
            var mobileHint = document.getElementById('mobileHint');
            var emailHint = document.getElementById('emailHint');
            var firstNameInput = document.getElementById('firstName');
            var lastNameInput = document.getElementById('lastName');

            function isValidMobile(val) {
                return /^(\+91[\s-]?)?[0]?(91)?[6-9]\d{9}$/.test(val.replace(/\s/g, ''));
            }

            function isValidEmail(val) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
            }

            function updateSubmitState() {
                var mobileOk = isValidMobile(mobileInput.value);
                var emailOk = isValidEmail(emailInput.value);
                var nameOk = firstNameInput.value.trim().length > 0 && lastNameInput.value.trim().length > 0;

                if (mobileInput.value.length > 0) {
                    if (mobileOk) {
                        mobileInput.classList.add('valid-field');
                        mobileHint.textContent = '';
                    } else {
                        mobileInput.classList.remove('valid-field');
                        mobileHint.textContent = 'Please enter a valid 10-digit mobile number.';
                        mobileHint.style.color = '#e53935';
                    }
                } else {
                    mobileInput.classList.remove('valid-field');
                    mobileHint.textContent = '';
                }

                if (emailInput.value.length > 0) {
                    if (emailOk) {
                        emailInput.classList.add('valid-field');
                        emailHint.textContent = '';
                    } else {
                        emailInput.classList.remove('valid-field');
                        emailHint.textContent = 'Please enter a valid email address.';
                        emailHint.style.color = '#e53935';
                    }
                } else {
                    emailInput.classList.remove('valid-field');
                    emailHint.textContent = '';
                }

                if (mobileOk && emailOk && nameOk) {
                    submitBtn.disabled = false;
                    submitBtn.classList.add('enabled');
                } else {
                    submitBtn.disabled = true;
                    submitBtn.classList.remove('enabled');
                }
            }

            mobileInput.addEventListener('input', updateSubmitState);
            emailInput.addEventListener('input', updateSubmitState);
            firstNameInput.addEventListener('input', updateSubmitState);
            lastNameInput.addEventListener('input', updateSubmitState);

            submitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // TODO: handle form submission
            });

        });
