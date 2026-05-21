document.addEventListener('DOMContentLoaded', function () {
    // Class Types Selection Logic
    const classCards = document.querySelectorAll('.affiliation-card');
    const classInputs = document.querySelectorAll('input[name="class_type"]');
    const regularClassSection = document.getElementById('regularClassSection');
    const dojoLocation = document.getElementById('dojoLocation');
    const classTiming = document.getElementById('classTiming');

    function updateClassSelection() {
        let isRegular = false;

        classInputs.forEach(input => {
            const card = input.closest('.affiliation-card');
            if (input.checked) {
                card.classList.add('selected');
                if (input.value === 'Regular Classes') {
                    isRegular = true;
                }
            } else {
                card.classList.remove('selected');
            }
        });

        if (isRegular) {
            regularClassSection.style.display = 'block';
            dojoLocation.setAttribute('required', 'required');
            classTiming.setAttribute('required', 'required');
        } else {
            regularClassSection.style.display = 'none';
            dojoLocation.removeAttribute('required');
            classTiming.removeAttribute('required');
            dojoLocation.value = '';
            classTiming.value = '';
        }
    }

    classInputs.forEach(input => {
        input.addEventListener('change', updateClassSelection);
    });

    classCards.forEach(card => {
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const input = this.querySelector('input[type="radio"]');
                input.checked = true;
                updateClassSelection();
            }
        });
        card.setAttribute('tabindex', '0');
    });

    // Form validation and fake submission
    const submitBtn = document.getElementById('submitBtn');
    const classesForm = document.getElementById('classesForm');
    const requiredInputs = classesForm.querySelectorAll('input[required], select[required], textarea[required]');

    function checkFormValidity() {
        let isValid = true;

        // Remove old error highlights
        classesForm.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));

        requiredInputs.forEach(input => {
            // Only check inputs that are currently required (regularClassSection toggles some)
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                // Add simple error styling class if needed
                input.closest('.form-group').classList.add('has-error');
            }
        });

        // Additional regular class checks if visible
        if (regularClassSection.style.display === 'block') {
             if (!dojoLocation.value || !classTiming.value) {
                 isValid = false;
             }
        }

        if (isValid) {
            submitBtn.classList.remove('btn-not-ready');
            submitBtn.innerHTML = 'Submit Registration';
        } else {
            submitBtn.classList.add('btn-not-ready');
            submitBtn.innerHTML = 'Complete Required Fields';
        }

        return isValid;
    }

    classesForm.addEventListener('input', checkFormValidity);
    classesForm.addEventListener('change', checkFormValidity);

    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();

        if (checkFormValidity()) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Submitting...';
            submitBtn.style.opacity = '0.8';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = 'Registration Submitted!';
                submitBtn.style.backgroundColor = '#4caf50';
                classesForm.reset();
                updateClassSelection();

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.opacity = '1';
                    submitBtn.disabled = false;
                    checkFormValidity();
                }, 3000);
            }, 1500);
        } else {
            const firstError = classesForm.querySelector('.has-error input, .has-error select, .has-error textarea');
            if (firstError) firstError.focus();
        }
    });

    // Initialize state
    updateClassSelection();
    checkFormValidity();
});
