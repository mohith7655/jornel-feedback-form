import { loadFormByToken, submitForm, uploadAttachment } from './src/services/formService.js';

const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get('token');
let status = 'loading';
let errorMsg = '';
let productDisplayName = 'Product';

const form        = document.getElementById('feedback-form');
const formCard    = document.getElementById('form-card');
const successCard = document.getElementById('success-card');
const submitBtn   = document.getElementById('submit-btn');
const btnLabel    = submitBtn.querySelector('.btn-label');

const statusBanner = createStatusBanner();

document.getElementById('feedbackDate').value = new Date().toISOString().slice(0, 10);

/* ── Pill buttons (gender, age, demoProject, purchaseIntent) ── */
document.querySelectorAll('.pill-group').forEach((group) => {
  const field  = group.dataset.field;
  const hidden = document.getElementById(field);
  const pills  = group.querySelectorAll('.pill');

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const val      = pill.dataset.value;
      const isActive = pill.classList.contains('active');

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

function getPurchasePlaceholder(intent) {
  const name = productDisplayName;
  if (intent === 'Yes')   return `Main reason why you want to buy the ${name}...`;
  if (intent === 'Maybe') return `Main reason why you are hesitant to buy or not buy the ${name}...`;
  if (intent === 'No')    return `Main reason why you don't want to buy the ${name}...`;
  return '';
}

function updatePurchaseReason(intent) {
  if (intent) {
    purchaseReasonEl.placeholder = getPurchasePlaceholder(intent);
    purchaseReasonEl.classList.remove('hidden');
  } else {
    purchaseReasonEl.classList.add('hidden');
    purchaseReasonEl.value = '';
  }
}

function updateProductLabels(name) {
  const demoEl       = document.getElementById('lbl-product-demo');
  const purchaseEl   = document.getElementById('lbl-product-purchase');
  const rateEl       = document.getElementById('lbl-product-rate');
  const headerEl     = document.getElementById('header-product-name');
  const productField = document.getElementById('productNameDisplay');
  if (demoEl)       demoEl.textContent     = name;
  if (purchaseEl)   purchaseEl.textContent = name;
  if (rateEl)       rateEl.textContent     = name;
  if (headerEl)     headerEl.textContent   = name;
  if (productField) productField.value     = name;
}

/* ── Star rating ────────────────────────────────────────────── */
const stars        = document.querySelectorAll('.star');
const ratingHidden = document.getElementById('rating');
let currentRating  = 0;

function paintStars(upTo) {
  stars.forEach((s) => {
    const v = parseInt(s.dataset.value, 10);
    s.classList.toggle('selected', v <= upTo);
    s.classList.remove('hovered');
  });
}

stars.forEach((star) => {
  const val = parseInt(star.dataset.value, 10);

  star.addEventListener('mouseenter', () => {
    stars.forEach((s) => {
      s.classList.toggle('hovered', parseInt(s.dataset.value, 10) <= val);
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

/* ── Excitement emoji buttons ───────────────────────────────── */
const emojiBtns        = document.querySelectorAll('.emoji-btn');
const excitementHidden = document.getElementById('excitementLevel');
let currentExcitement  = 5; // default matches app

function paintEmoji(val) {
  emojiBtns.forEach((b) => b.classList.toggle('active', parseInt(b.dataset.value, 10) === val));
}
paintEmoji(currentExcitement);

emojiBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentExcitement      = parseInt(btn.dataset.value, 10);
    excitementHidden.value = currentExcitement;
    paintEmoji(currentExcitement);
  });
});

/* ── Validation ─────────────────────────────────────────────── */
function validateForm() {
  const name = document.getElementById('personName').value.trim();
  const ok   = name.length > 0;
  document.getElementById('field-personName').classList.toggle('invalid', !ok);
  return ok;
}

document.getElementById('personName').addEventListener('input', () => {
  document.getElementById('field-personName').classList.remove('invalid');
});

/* ── Submit ─────────────────────────────────────────────────── */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (status !== 'ready') return;

  if (!validateForm()) {
    document.getElementById('field-personName').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const answers = buildAnswers();

  setStatus('submitting', 'Submitting your feedback...');

  try {
    await submitForm(urlToken, answers);
    setStatus('submitted');
  } catch (err) {
    errorMsg = err?.message || 'Failed to submit form. Please try again.';
    setStatus('error', errorMsg);
  }
});

function buildAnswers() {
  return {
    personName:         document.getElementById('personName').value.trim(),
    feedbackDate:       document.getElementById('feedbackDate').value,
    gender:             document.getElementById('gender').value,
    age:                document.getElementById('age').value,
    demoProject:        document.getElementById('demoProject').value,
    purchaseIntent:     document.getElementById('purchaseIntent').value,
    purchaseReason:     document.getElementById('purchaseReason').value.trim(),
    rating:             parseInt(document.getElementById('rating').value, 10) || 0,
    featuresLiked:      document.getElementById('featuresLiked').value.trim(),
    featuresDisliked:   document.getElementById('featuresDisliked').value.trim(),
    changesRecommended: document.getElementById('changesRecommended').value.trim(),
    phoneNumber:        document.getElementById('phoneNumber').value.trim(),
    email:              document.getElementById('email').value.trim(),
    excitementLevel:    parseInt(document.getElementById('excitementLevel').value, 10) || 5,
    product_name:       productDisplayName !== 'Product' ? productDisplayName : null,
  };
}

function showSuccess() {
  const successProductEl = document.getElementById('success-product-name');
  if (successProductEl && productDisplayName !== 'Product') {
    successProductEl.textContent = productDisplayName;
  }
  formCard.style.display = 'none';
  successCard.classList.add('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createStatusBanner() {
  const banner = document.createElement('div');
  banner.id = 'status-banner';
  banner.style.textAlign = 'center';
  banner.style.margin = '12px 0';
  banner.style.fontWeight = '600';
  banner.style.color = '#475569';
  banner.classList.add('hidden');
  document.querySelector('.page').insertBefore(banner, formCard);
  return banner;
}

function setStatus(nextStatus, message = '') {
  status = nextStatus;
  errorMsg = message;

  if (message) {
    statusBanner.textContent = message;
    statusBanner.classList.remove('hidden');
    statusBanner.style.color = nextStatus === 'error' ? '#b91c1c' : '#475569';
  } else {
    statusBanner.textContent = '';
    statusBanner.classList.add('hidden');
  }

  if (nextStatus === 'loading') {
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    btnLabel.textContent = 'Loading...';
  } else if (nextStatus === 'ready') {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    btnLabel.textContent = 'Submit Feedback';
    formCard.style.display = '';
  } else if (nextStatus === 'submitting') {
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    btnLabel.textContent = 'Sending…';
  } else if (nextStatus === 'submitted') {
    submitBtn.disabled = true;
    submitBtn.classList.remove('loading');
    btnLabel.textContent = 'Submit Feedback';
    statusBanner.classList.add('hidden');
    showSuccess();
  } else if (nextStatus === 'error') {
    submitBtn.disabled = true;
    submitBtn.classList.remove('loading');
    btnLabel.textContent = 'Submit Feedback';
    formCard.style.display = 'none';
    successCard.classList.remove('visible');
  }
}

function prefillFromUrlParams(params) {
  const pName    = params.get('name');
  const pPhone   = params.get('phone');
  const pEmail   = params.get('email');
  const pProduct = params.get('product');

  if (pName)    document.getElementById('personName').value  = pName;
  if (pPhone)   document.getElementById('phoneNumber').value = pPhone;
  if (pEmail)   document.getElementById('email').value       = pEmail;

  if (pProduct) {
    productDisplayName = pProduct;
    updateProductLabels(pProduct);
  }
}

function prefillFromToken(data) {
  if (!data) return;

  const nameEl  = document.getElementById('personName');
  const phoneEl = document.getElementById('phoneNumber');
  const emailEl = document.getElementById('email');

  if (data.person_name  && !nameEl.value)  nameEl.value  = data.person_name;
  if (data.phone_number && !phoneEl.value) phoneEl.value = data.phone_number;
  if (data.email        && !emailEl.value) emailEl.value = data.email;
}

async function initFormToken() {
  setStatus('loading', 'Loading form...');

  // Prefill from URL params immediately (no async needed)
  prefillFromUrlParams(urlParams);

  if (!urlToken) {
    setStatus('error', 'No form token found in the URL.');
    return;
  }

  try {
    const data = await loadFormByToken(urlToken);
    prefillFromToken(data);
    setStatus('ready');
  } catch (err) {
    setStatus('error', err?.message || 'This form link is invalid or has expired.');
  }
}

/* ── Reset ──────────────────────────────────────────────────── */
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
  submitBtn.disabled = status !== 'ready';
  submitBtn.classList.remove('loading');
  btnLabel.textContent = 'Submit Feedback';

  successCard.classList.remove('visible');
  formCard.style.display = status === 'error' ? 'none' : '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initialize
initFormToken();
