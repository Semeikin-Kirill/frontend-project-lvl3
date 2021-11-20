import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import watchedState from './view';
import validate from './validation';
import ru from './locales/ru';
import getAllOrigins from './allOrigins';
import parser from './parser';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    elPosts: document.querySelector('.posts'),
    elFeeds: document.querySelector('.feeds'),
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
          posts: [],
          feeds: [],
        },
        elements,
        i18nInstance,
      );

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        validate(url, state.listUrl)
          .then(getAllOrigins)
          .then(axios.get)
          .then(parser)
          .then((dom) => {
            const feedTitle = dom.querySelector('title').textContent;
            const feedDescription = dom.querySelector('description').textContent;
            const feedId = uniqueId();
            const feed = {
              description: feedDescription,
              title: feedTitle,
              id: feedId,
            };
            const items = dom.querySelectorAll('item');
            const posts = Array.from(items).map((item) => {
              const description = item.querySelector('title').textContent;
              const link = item.querySelector('link').textContent;
              return {
                description,
                link,
                feedId,
                id: uniqueId(),
              };
            });
            state.listUrl = [url, ...state.listUrl];
            state.feeds = [feed, ...state.feeds];
            state.posts = [...posts, ...state.posts];
            state.form.processState = 'success';
          })
          .catch((err) => {
            if (err.message === 'netWork Error') {
              state.form.error = 'netWork';
            } else {
              state.form.error = err.errors?.toString() ?? err.message;
            }
            state.form.processState = 'failed';
          });
        state.form.processState = 'filling';
        state.form.error = null;
      });
    });
};
