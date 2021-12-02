import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import { setLocale } from 'yup';
import { uniqueId } from 'lodash';
import watchedState from './view';
import ru from './locales/ru';
import parser from './parser';

const validate = (url, listRSS) => {
  setLocale({
    string: {
      url: 'wrongUrl',
    },
    mixed: {
      notOneOf: 'duplicate',
    },
  });

  const listUrl = listRSS.map((rss) => rss.url);
  const schema = yup.string().url().notOneOf(listUrl);
  return schema.validate(url);
};

const getDataPosts = (posts, feedId) => posts.reduce(
  (acc, post) => {
    const id = uniqueId();
    const { title, description, link } = post;
    acc.uiPosts = {
      ...acc.uiPosts,
      [id]: {
        title,
        description,
        link,
        visibility: 'unvisited',
      },
    };
    acc.dataPosts = acc.dataPosts.concat([
      {
        title,
        link,
        feedId,
        id,
      },
    ]);
    return acc;
  },
  { dataPosts: [], uiPosts: {} },
);

const useAllOrigins = (url) => {
  const urlOrigins = new URL(
    'https://hexlet-allorigins.herokuapp.com/get?disableCache=true',
  );
  urlOrigins.searchParams.set('url', url);
  return urlOrigins;
};

const update = (appState) => {
  const state = appState;
  const promises = state.listRSS.map((item) => {
    const rss = item;
    const { url, feedId, pubDate } = rss;
    const urlOrig = useAllOrigins(url);
    const date = new Date(pubDate);
    const time = date.getTime();
    return axios
      .get(urlOrig)
      .then((responce) => {
        const { pubDate: newPubDate, posts } = parser(responce.data.contents);
        const { dataPosts, uiPosts } = getDataPosts(posts, feedId);
        const newDate = new Date(newPubDate);
        const newTime = newDate.getTime(newDate);
        if (time === newTime) {
          return null;
        }
        rss.pubDate = newPubDate;
        state.uiState.modal = { ...state.uiState.modal, ...uiPosts };
        state.posts = [...dataPosts, ...state.posts];
        return null;
      })
      .catch(() => null);
  });
  Promise.all(promises).then(() => setTimeout(update, 5000, state));
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    elPosts: document.querySelector('.posts'),
    elFeeds: document.querySelector('.feeds'),
    modal: document.querySelector('#modal'),
    submitButton: document.querySelector('button[type="submit"]'),
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
            modal: {
              current: null,
            },
          },
        },
        elements,
        i18nInstance,
      );

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        state.form.processState = 'addition';
        validate(url, state.listRSS)
          .then((result) => axios.get(useAllOrigins(result)))
          .then((responce) => {
            const { feed, posts, pubDate } = parser(responce.data.contents);
            feed.id = uniqueId();
            const { dataPosts, uiPosts } = getDataPosts(posts, feed.id);
            state.uiState.modal = { ...state.uiState.modal, ...uiPosts };
            state.listRSS = [
              { url, pubDate, feedId: feed.id },
              ...state.listRSS,
            ];
            state.feeds = [feed, ...state.feeds];
            state.posts = [...dataPosts, ...state.posts];
            state.form.error = null;
            state.form.processState = 'success';
          })
          .catch((err) => {
            if (err.message === 'Network Error') {
              state.form.error = 'netWork';
              state.form.processState = 'failed';
            }
            if (err.message.startsWith('notRSS')) {
              state.form.error = 'notRSS';
              state.form.processState = 'failed';
            } else {
              state.form.error = err.errors?.toString() ?? err.message;
              state.form.processState = 'invalid';
            }
          });
      });
      elements.modal.addEventListener('show.bs.modal', (e) => {
        const button = e.relatedTarget;
        const id = button.getAttribute('data-id');
        state.uiState.modal[id].visibility = 'visited';
        state.uiState.modal.current = id;
      });
      setTimeout(update, 5000, state);
    });
};
