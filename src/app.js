import i18next from 'i18next';
import axios from 'axios';
import watchedState from './view';
import validate from './validation';
import ru from './locales/ru';
import getAllOrigins from './allOrigins';
import parser from './parser';
import { getFeed, getPosts } from './getData';
import update from './update';

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
          listRSS: [],
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
        validate(url, state.listRSS)
          .then(getAllOrigins)
          .then(axios.get)
          .then(parser)
          .then((dom) => {
            const pubDate = dom.querySelector('pubDate').textContent;
            const feed = getFeed(dom);
            const feedId = feed.id;
            const posts = getPosts(dom, feedId);
            state.listRSS = [{ url, pubDate, feedId }, ...state.listRSS];
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
      setTimeout(update, 5000, state);
    });
};
