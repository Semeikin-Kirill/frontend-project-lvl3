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
    modal: document.querySelector('#modal'),
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
          uiState: {
            modal: {},
          },
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
            const [dataPosts, uiPosts] = posts;
            state.listRSS = [{ url, pubDate, feedId }, ...state.listRSS];
            state.feeds = [feed, ...state.feeds];
            state.posts = [...dataPosts, ...state.posts];
            state.uiState.modal = { ...state.uiState.modal, ...uiPosts };
            state.form.processState = 'success';
          })
          .catch((err) => {
            if (err.message === 'Network Error') {
              state.form.error = 'netWork';
            } else {
              state.form.error = err.errors?.toString() ?? err.message;
            }
            state.form.processState = 'failed';
          });
        state.form.processState = 'filling';
        state.form.error = null;
      });
      elements.modal.addEventListener('show.bs.modal', (e) => {
        const button = e.relatedTarget;
        const id = button.getAttribute('data-id');
        const { description, title, link } = state.uiState.modal[id];
        const header = elements.modal.querySelector('.modal-title');
        const body = elements.modal.querySelector('.modal-body');
        const a = elements.modal.querySelector(
          'a.btn.btn-primary.full-article',
        );
        header.textContent = title;
        body.textContent = description;
        a.setAttribute('href', link);
        state.uiState.modal[id].visibility = 'visited';
        state.form.processState = 'update';
        state.form.processState = 'filling';
      });
      setTimeout(update, 5000, state);
    });
};
