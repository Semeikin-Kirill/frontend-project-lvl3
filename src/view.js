import onChange from 'on-change';

const render = (state, elements, i18n) => {
  const { processState, error } = state.form;
  const { form, input, feedback } = elements;
  switch (processState) {
    case 'failed': {
      input.classList.add('is-invalid');
      feedback.textContent = i18n.t(`error.${error}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      return;
    }
    case 'valid': {
      form.reset();
      input.focus();
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t('success');
      return;
    }
    default: {
      throw new Error(`Inexistent status: ${processState}`);
    }
  }
};

export default (state, elements, i18n) => onChange(state, (path) => {
  if (path === 'form.processState' || path === 'form.error') {
    render(state, elements, i18n);
  }
});
