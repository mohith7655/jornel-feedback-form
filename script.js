const API_ENDPOINT = 'https://raw1-journel.netlify.app/.netlify/functions/submit-form';
const TRACKING_ENDPOINT = 'https://raw1-journel.netlify.app/.netlify/functions/submit-form';

/* ── Token from URL ────────────────────────────────────────── */
const urlToken = new URLSearchParams(window.location.search).get('token') || null;

/* ── Default date to today ─────────────────────────────────── */
document.getElementById('feedbackDate').value = new Date().toISOString().slice(0, 10);

/* ── Pill buttons (gender, age, demoProject, purchaseIntent) ── */
document.querySelectorAll('.pill-group').forEach((group) => {
  const field     = group.dataset.field;
  const hidden    = document.getElementById(field);
  const pills     = group.querySelectorAll('.pill');

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const val       = pill.dataset.value;
      const isActive  = pill.classList.contains('active');

      // deselect all, then select clicked (toggle off if same)
      pills.forEach((p) => p.classList.remove('active'));
      if (!isActive) {
        pill.classList.add('active');
        hidden.value = val;
      } else {
        hidden.value = '';
      }

      // conditional purchase reason textarea
      if (field === 'purchaseIntent') {
        updatePurchaseReason(isActive ? '' : val);
      }
    });
  });
});

const purchaseReasonEl = document.getElementById('purchaseReason');

const PURCHASE_PLACEHOLDERS = {
  Yes:   'Main reason why you want to buy the GripCuff...',
  Maybe: 'Main reason why you are hesitant to buy or not buy the GripCuff...',
  No:    "Main reason why you don't want to buy the GripCuff...",
};

function updatePurchaseReason(intent) {
  if (intent) {
    purchaseReasonEl.placeholder = PURCHASE_PLACEHOLDERS[intent] || '';
    purchaseReasonEl.classList.remove('hidden');
  } else {
    purchaseReasonEl.classList.add('hidden');
    purchaseReasonEl.value = '';
  }
}

/* ── Star rating ───────────────────────────────────────────── */
const stars      = document.querySelectorAll('.star');
const ratingHidden = document.getElementById('rating');
let currentRating  = 0;

function paintStars(upTo) {
  stars.forEach((s) => {
    const v = parseInt(s.dataset.value);
    s.classList.toggle('selected', v <= upTo);
    s.classList.remove('hovered');
  });
}

stars.forEach((star) => {
  const val = parseInt(star.dataset.value);

  star.addEventListener('mouseenter', () => {
    stars.forEach((s) => {
      s.classList.toggle('hovered', parseInt(s.dataset.value) <= val);
      s.classList.remove('selected');
    });
  });

  star.addEventListener('mouseleave', () => {
    stars.forEach((s) => s.classList.remove('hovered'));
    paintStars(currentRating);
  });

  star.addEventListener('click', () => {
    currentRating      = val;
    ratingHidden.value = val;
    paintStars(currentRating);
  });
});

/* ── Excitement emoji buttons ──────────────────────────────── */
const emojiBtns       = document.querySelectorAll('.emoji-btn');
const excitementHidden = document.getElementById('excitementLevel');
let currentExcitement  = 5; // default matches app

// paint default
function paintEmoji(val) {
  emojiBtns.forEach((b) => b.classList.toggle('active', parseInt(b.dataset.value) === val));
}
paintEmoji(currentExcitement);

emojiBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentExcitement      = parseInt(btn.dataset.value);
    excitementHidden.value = currentExcitement;
    paintEmoji(currentExcitement);
  });
});

/* ── Validation ────────────────────────────────────────────── */
function validateForm() {
  const name = document.getElementById('personName').value.trim();
  const ok   = name.length > 0;
  document.getElementById('field-personName').classList.toggle('invalid', !ok);
  return ok;
}

document.getElementById('personName').addEventListener('input', () => {
  document.getElementById('field-personName').classList.remove('invalid');
});

/* ── Submit ────────────────────────────────────────────────── */
const form        = document.getElementById('feedback-form');
const formCard    = document.getElementById('form-card');
const successCard = document.getElementById('success-card');
const submitBtn   = document.getElementById('submit-btn');
const btnLabel    = submitBtn.querySelector('.btn-label');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    document.getElementById('field-personName').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const payload = {
    personName:        document.getElementById('personName').value.trim(),
    feedbackDate:      document.getElementById('feedbackDate').value,
    gender:            document.getElementById('gender').value,
    age:               document.getElementById('age').value,
    demoProject:       document.getElementById('demoProject').value,
    purchaseIntent:    document.getElementById('purchaseIntent').value,
    purchaseReason:    document.getElementById('purchaseReason').value.trim(),
    rating:            parseInt(document.getElementById('rating').value) || 0,
    featuresLiked:     document.getElementById('featuresLiked').value.trim(),
    featuresDisliked:  document.getElementById('featuresDisliked').value.trim(),
    changesRecommended:document.getElementById('changesRecommended').value.trim(),
    phoneNumber:       document.getElementById('phoneNumber').value.trim(),
    email:             document.getElementById('email').value.trim(),
    excitementLevel:   parseInt(document.getElementById('excitementLevel').value) || 5,
    submittedAt:       new Date().toISOString(),
  };

  submitBtn.disabled = true;
  submitBtn.classList.add('loading');
  btnLabel.textContent = 'Sending…';

  // Fire token tracking POST (non-blocking — never delays or prevents success)
  if (urlToken) {
    fetch(TRACKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: urlToken, answers: payload }),
    }).catch(() => {}); // silently ignore errors
  }

  try {
    console.log('Posting to:', API_ENDPOINT);
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('Response status:', res.status);
    const resBody = await res.text();
    console.log('Response body:', resBody);
    if (!res.ok) throw new Error(`${res.status}`);
    showSuccess();
  } catch {
    // Placeholder endpoint — show success anyway; remove catch fallback once real API is connected
    showSuccess();
  }
});

function showSuccess() {
  formCard.style.display = 'none';
  successCard.classList.add('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Reset ─────────────────────────────────────────────────── */
document.getElementById('reset-btn').addEventListener('click', () => {
  form.reset();

  // restore defaults
  document.getElementById('feedbackDate').value = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('input[type="hidden"]').forEach((h) => {
    if (h.id === 'excitementLevel') h.value = '5';
    else h.value = '';
  });

  currentRating     = 0;
  currentExcitement = 5;
  paintStars(0);
  paintEmoji(5);
  updatePurchaseReason('');

  form.querySelectorAll('.field').forEach((f) => f.classList.remove('invalid'));
  submitBtn.disabled = false;
  submitBtn.classList.remove('loading');
  btnLabel.textContent = 'Submit Feedback';

  successCard.classList.remove('visible');
  formCard.style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
