import onChange from 'on-change';

const renderPosts = (posts, statePosts, i18n, uiModal) => {
  const elPosts = posts;
  elPosts.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18n.t('posts');

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  const list = statePosts.map(({ link, title, id }) => {
    const { visibility } = uiModal[id];
    const className = visibility === 'unvisited' ? 'fw-bold' : 'fw-normal';
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'border-0',
      'border-end-0',
      'd-flex',
      'justify-content-between',
      'align-items-start',
    );
    const a = document.createElement('a');
    a.classList.add(className);
    a.setAttribute('href', link);
    a.setAttribute('data-id', id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18n.t('button');
    li.append(a, button);
    return li;
  });
  ul.append(...list);
  cardBody.append(h2);
  card.append(cardBody, ul);
  elPosts.append(card);
};

const renderFeeds = (feeds, stateFeeds, i18n) => {
  const elFeeds = feeds;
  elFeeds.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18n.t('feeds');

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  const list = stateFeeds.map(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = description;
    li.append(h3, p);
    return li;
  });
  cardBody.append(h2);
  ul.append(...list);
  card.append(cardBody, ul);
  elFeeds.append(card);
};

const render = (state, elements, i18n) => {
  const { processState, error } = state.form;
  const {
    form, input, feedback, submitButton,
  } = elements;
  switch (processState) {
    case 'failed': {
      feedback.textContent = i18n.t(`error.${error}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      submitButton.disabled = false;
      input.removeAttribute('readonly');
      return;
    }
    case 'invalid': {
      input.classList.add('is-invalid');
      feedback.textContent = i18n.t(`error.${error}`);
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      submitButton.disabled = false;
      input.removeAttribute('readonly');
      return;
    }
    case 'addition': {
      input.classList.remove('is-invalid');
      submitButton.disabled = true;
      input.setAttribute('readonly', '');
      return;
    }
    case 'success': {
      form.reset();
      input.focus();
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t('success');
      submitButton.disabled = false;
      input.removeAttribute('readonly');
      return;
    }
    default: {
      throw new Error(`Inexistent status: ${processState}`);
    }
  }
};

const renderModal = (id, { modal }, elements) => {
  const { description, title, link } = modal[id];
  const header = elements.modal.querySelector('.modal-title');
  const body = elements.modal.querySelector('.modal-body');
  const a = elements.modal.querySelector('a.btn.btn-primary.full-article');
  header.textContent = title;
  body.textContent = description;
  a.setAttribute('href', link);
};

export default (state, elements, i18n) => onChange(state, (path, value) => {
  const { elFeeds, elPosts } = elements;
  switch (path) {
    case 'form.processState': {
      render(state, elements, i18n);
      break;
    }
    case 'feeds': {
      renderFeeds(elFeeds, state.feeds, i18n);
      break;
    }
    case 'posts': {
      renderPosts(elPosts, state.posts, i18n, state.uiState.modal);
      break;
    }
    case 'uiState.modal.current': {
      renderModal(value, state.uiState, elements);
      renderPosts(elPosts, state.posts, i18n, state.uiState.modal);
      break;
    }
    default:
      break;
  }
});
