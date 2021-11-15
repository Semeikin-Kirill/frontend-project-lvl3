import i18next from 'i18next';
import watchedState from './view';
import validate from './validation';
import ru from './locales/ru';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    })
    .then(() => {
      const state = watchedState(
        {
          form: {
            processState: 'filling',
            error: null,
          },
          listUrl: [],
        },
        elements,
        i18nInstance,
      );
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        validate(url, state.listUrl)
          .then((correctUrl) => {
            state.listUrl.push(correctUrl);
            state.form.processState = 'valid';
            state.form.error = null;
          })
          .catch((err) => {
            state.form.processState = 'failed';
            state.form.error = err.errors.toString();
          });
      });
    });
};
