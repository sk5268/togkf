document.addEventListener('DOMContentLoaded', function () {
    // Class Types Selection Logic
    const classCards = document.querySelectorAll('.affiliation-card');
    const classInputs = document.querySelectorAll('input[name="class_type"]');

    // Sections
    const homeTuitionSection = document.getElementById('homeTuitionSection');
    const corporateSection = document.getElementById('corporateTrainingSection');
    const selfDefenceSection = document.getElementById('selfDefenceSection');
    const regularClassSection = document.getElementById('regularClassSection');

    // Inputs inside sections
    const homeTuitionAge = document.getElementById('homeTuitionAge');
    const homeTuitionFreq = document.getElementById('homeTuitionFreq');

    const companyName = document.getElementById('companyName');
    const designation = document.getElementById('designation');
    const numParticipants = document.getElementById('numParticipants');

    const selfDefenceFormat = document.getElementById('selfDefenceFormat');
    // size is not strictly required

    const dojoLocation = document.getElementById('dojoLocation');
    const classTiming = document.getElementById('classTiming');

    function updateClassSelection() {
        let type = '';

        classInputs.forEach(input => {
            const card = input.closest('.affiliation-card');
            if (input.checked) {
                card.classList.add('selected');
                type = input.value;
            } else {
                card.classList.remove('selected');
            }
        });

        // Hide all first
        homeTuitionSection.style.display = 'none';
        corporateSection.style.display = 'none';
        selfDefenceSection.style.display = 'none';
        regularClassSection.style.display = 'none';

        // Remove required
        const allDynamicInputs = [
            homeTuitionAge, homeTuitionFreq,
            companyName, designation, numParticipants,
            selfDefenceFormat,
            dojoLocation, classTiming
        ];
        allDynamicInputs.forEach(el => el.removeAttribute('required'));

        // Show specific and add required
        if (type === 'Home Tuition') {
            homeTuitionSection.style.display = 'block';
            homeTuitionAge.setAttribute('required', 'required');
            homeTuitionFreq.setAttribute('required', 'required');
        } else if (type === 'Corporate Training') {
            corporateSection.style.display = 'block';
            companyName.setAttribute('required', 'required');
            designation.setAttribute('required', 'required');
            numParticipants.setAttribute('required', 'required');
        } else if (type === 'Self Defence Training') {
            selfDefenceSection.style.display = 'block';
            selfDefenceFormat.setAttribute('required', 'required');
        } else if (type === 'Regular Classes') {
            regularClassSection.style.display = 'block';
            dojoLocation.setAttribute('required', 'required');
            classTiming.setAttribute('required', 'required');
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

    function checkFormValidity() {
        let isValid = true;
        const requiredInputs = classesForm.querySelectorAll('input[required], select[required], textarea[required]');

        // Remove old error highlights
        classesForm.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.closest('.form-group').classList.add('has-error');
            }
        });

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
                updateClassSelection(); // Reset specific fields

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
