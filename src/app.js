import watchedState from './view';
import validate from './validation';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const state = watchedState(
    {
      form: {
        processState: 'filling',
        error: null,
      },
      listUrl: [],
    },
    elements,
  );

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validate(url, state.listUrl)
      .then((result) => {
        state.listUrl.push(result);
        state.form.processState = 'valid';
        state.form.error = null;
      })
      .catch((error) => {
        state.form.processState = 'failed';
        state.form.error = error.type;
      });
  });
};
