/* The constituency office form.
 *
 * Four questions, one at a time, validated as you leave each step so
 * nobody fills in four screens and is told at the end that the first
 * one was wrong. There is no backend yet, and the interface says so
 * rather than implying a submission went somewhere.
 */
const STORE = 'budadiri.issues';

const messages = {
  valueMissing: 'This one is needed before we can route your issue.',
  tooShort: 'A little more detail helps the office act on it.',
  patternMismatch: 'Check the format and try again.',
  typeMismatch: 'Check the format and try again.',
};

function describe(field) {
  const v = field.validity;
  if (v.valueMissing) return field.dataset.required || messages.valueMissing;
  if (v.tooShort) return messages.tooShort;
  if (v.patternMismatch || v.typeMismatch) return messages.patternMismatch;
  return field.validationMessage;
}

function reference() {
  const year = new Date().getFullYear();
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BE-${year}-${tail}`;
}

export function initOffice(form) {
  const steps = [...form.querySelectorAll('[data-step]')];
  const marks = [...form.querySelectorAll('[data-step-mark]')];
  const receipt = form.querySelector('[data-receipt]');
  if (!steps.length) return;

  let current = 0;

  const paint = () => {
    steps.forEach((step, i) => {
      step.hidden = i !== current;
      if (i === current) {
        step.setAttribute('data-enter', '');
        /* Re-trigger the entrance without leaving the attribute behind. */
        requestAnimationFrame(() => step.removeAttribute('data-enter'));
      }
    });
    marks.forEach((mark, i) => {
      mark.dataset.state = i < current ? 'done' : i === current ? 'current' : 'todo';
    });
  };

  const showError = (field, message) => {
    const slot = field.closest('.field-row')?.querySelector('[data-error]');
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (slot) slot.textContent = message || '';
  };

  const validate = (index) => {
    const fields = [...steps[index].querySelectorAll('input, select, textarea')];
    let ok = true;
    for (const field of fields) {
      if (field.checkValidity()) { showError(field, ''); continue; }
      showError(field, describe(field));
      if (ok) field.focus();
      ok = false;
    }
    return ok;
  };

  form.addEventListener('input', (e) => {
    const field = e.target;
    if (field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) showError(field, '');
  });

  form.addEventListener('click', (e) => {
    const next = e.target.closest('[data-next]');
    const back = e.target.closest('[data-back]');
    if (next) {
      e.preventDefault();
      if (!validate(current)) return;
      current = Math.min(steps.length - 1, current + 1);
      paint();
      steps[current].querySelector('h3, .step__question')?.focus?.();
    }
    if (back) {
      e.preventDefault();
      current = Math.max(0, current - 1);
      paint();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(current)) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const record = { ...data, ref: reference(), created: new Date().toISOString() };

    /* Prototype storage: this device only. Stated in the interface. */
    try {
      const all = JSON.parse(localStorage.getItem(STORE) || '[]');
      all.unshift(record);
      localStorage.setItem(STORE, JSON.stringify(all.slice(0, 200)));
    } catch { /* private mode — the receipt still shows */ }

    if (receipt) {
      receipt.querySelector('[data-ref]').textContent = record.ref;
      receipt.querySelector('[data-receipt-area]').textContent = record.area || '—';
      receipt.querySelector('[data-receipt-category]').textContent = record.category || '—';
      receipt.hidden = false;
    }
    form.querySelector('[data-flow]').hidden = true;
    /* The step rail described a journey that is now finished. */
    form.querySelector('.steps')?.setAttribute('hidden', '');
    receipt?.focus();
  });

  paint();
}
