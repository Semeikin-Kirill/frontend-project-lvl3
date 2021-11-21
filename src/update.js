import axios from 'axios';
import parser from './parser';
import getAllOrigins from './allOrigins';
import { getPosts } from './getData';

const update = (appState) => {
  const state = appState;
  if (state.listRSS.length < 1) {
    setTimeout(update, 5000, state);
  }
  state.listRSS.forEach((item) => {
    const rss = item;
    const urlOrig = getAllOrigins(rss.url);
    const date = new Date(rss.pubDate);
    const time = date.getTime();
    axios
      .get(urlOrig)
      .then(parser)
      .then((dom) => {
        const newPubDate = dom.querySelector('pubDate').textContent;
        const newDate = new Date(newPubDate);
        const newTime = newDate.getTime(newDate);
        if (time === newTime) {
          return null;
        }
        rss.pubDate = newPubDate;
        const posts = getPosts(dom, rss.feedId);
        state.posts = [...posts, ...state.posts];
        state.form.processState = 'update';
        return null;
      })
      .then(() => {
        state.form.processState = 'filling';
        setTimeout(update, 5000, state);
      })
      .catch(() => setTimeout(update, 5000, state));
  });
};

export default update;
