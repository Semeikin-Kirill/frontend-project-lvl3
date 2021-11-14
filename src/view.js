import onChange from 'on-change';

const feedbackText = {
  notOneOf: 'RSS уже существует',
  url: 'Ссылка должна быть валидным URL',
  success: 'RSS успешно загружен',
};

const render = (state, elements) => {
  const { processState, error } = state.form;
  const { form, input, feedback } = elements;
  switch (processState) {
    case 'failed': {
      input.classList.add('is-invalid');
      feedback.textContent = feedbackText[error];
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
      feedback.textContent = feedbackText.success;
      return;
    }
    default: {
      throw new Error(`Inexistent status: ${processState}`);
    }
  }
};

export default (state, elements) => onChange(state, (path) => {
  if (path === 'form.processState' || path === 'form.error') {
    render(state, elements);
  }
});
