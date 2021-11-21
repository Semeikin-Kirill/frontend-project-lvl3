import onChange from 'on-change';
import renderPosts from './posts';
import renderFeeds from './feeds';

const render = (state, elements, i18n) => {
  const { processState, error } = state.form;
  const { posts, feeds } = state;
  const {
    form, input, feedback, elPosts, elFeeds,
  } = elements;
  switch (processState) {
    case 'filling': {
      return;
    }
    case 'failed': {
      input.classList.add('is-invalid');
      feedback.textContent = i18n.t(`error.${error}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      return;
    }
    case 'success': {
      form.reset();
      input.focus();
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t('success');
      renderPosts(elPosts, posts, i18n);
      renderFeeds(elFeeds, feeds, i18n);
      return;
    }
    case 'update': {
      renderPosts(elPosts, posts, i18n);
      return;
    }
    default: {
      throw new Error(`Inexistent status: ${processState}`);
    }
  }
};

export default (state, elements, i18n) => onChange(state, (path) => {
  if (path === 'form.processState') {
    render(state, elements, i18n);
  }
});
