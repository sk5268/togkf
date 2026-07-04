(() => {
  // 1. Select the Individual Member card and trigger the click event
  const individualRadio = document.querySelector('input[value="Individual Member"]');
  if (individualRadio) {
    const card = individualRadio.closest('.affiliation-card');
    if (card) {
      card.click();
    } else {
      individualRadio.click();
    }
  }

  // Helper to set values and trigger input/change events for UI validation
  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  // 2. Fill standard required fields
  setVal('firstName', 'Tester');
  setVal('lastName', 'Srimadhava');
  setVal('email', 'ksrimadhava@outlook.com'); // <-- CHANGE THIS to your email to test receipt
  setVal('mobile', '9876543210');
  setVal('address1', '123 Dojo Street');
  setVal('city', 'Hyd');
  setVal('state', 'Telangana');
  setVal('pincode', '500001');
  setVal('whyJoin', 'To practice Traditional Okinawan Goju Ryu Karate Do under TOGKF India.');

  // 3. Fill optional individual fields
  setVal('rank', '1st Dan Black Belt');
  setVal('dateGraded', '2025-01-01');
  setVal('awardedBy', 'Sensei Higaonna');

  console.log("Form populated for Individual Membership! Please replace 'your-email@example.com' if you want to test the email delivery.");
})();
