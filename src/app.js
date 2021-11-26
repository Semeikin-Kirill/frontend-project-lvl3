import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import { setLocale } from 'yup';
import watchedState from './view';
import ru from './locales/ru';
import parser from './parser';

setLocale({
  string: {
    url: 'wrongUrl',
  },
  mixed: {
    notOneOf: 'duplicate',
  },
});

const validate = (url, listRSS) => {
  const listUrl = listRSS.map((rss) => rss.url);
  const schema = yup.string().url().notOneOf(listUrl);
  return schema.validate(url);
};

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
    const urlOrig = useAllOrigins(rss.url);
    const date = new Date(rss.pubDate);
    const time = date.getTime();
    return axios
      .get(urlOrig)
      .then((data) => {
        const { pubDate: newPubDate, dataPosts, uiPosts } = parser(data);
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
        elements.submitButton.disabled = true;
        const formData = new FormData(e.target);
        const url = formData.get('url');
        validate(url, state.listRSS)
          .then((result) => axios.get(useAllOrigins(result)))
          .then((data) => {
            const {
              feed, dataPosts, uiPosts, pubDate,
            } = parser(data);
            const feedId = feed.id;
            state.uiState.modal = { ...state.uiState.modal, ...uiPosts };
            state.listRSS = [{ url, pubDate, feedId }, ...state.listRSS];
            state.feeds = [feed, ...state.feeds];
            state.posts = [...dataPosts, ...state.posts];
            state.form.error = null;
            state.form.processState = 'success';
            elements.submitButton.disabled = false;
          })
          .catch((err) => {
            state.form.processState = 'failed';
            if (err.message === 'Network Error') {
              state.form.error = 'netWork';
            } else {
              state.form.error = err.errors?.toString() ?? err.message;
            }
            elements.submitButton.disabled = false;
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
