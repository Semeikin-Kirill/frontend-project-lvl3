import { uniqueId } from 'lodash';

const getFeed = (dom) => {
  const feedTitle = dom.querySelector('title').textContent;
  const feedDescription = dom.querySelector('description').textContent;
  return {
    description: feedDescription,
    title: feedTitle,
    id: uniqueId(),
  };
};

const getPosts = (dom, feedId) => {
  const items = dom.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const id = uniqueId();
    return [
      {
        title,
        feedId,
        link,
        id,
      },
      {
        [id]: {
          title,
          description,
          link,
          visibility: 'unvisited',
        },
      },
    ];
  });
  const dataPosts = posts.map(([data]) => data);
  const uiPosts = posts.reduce((acc, [, ui]) => ({ ...acc, ...ui }), {});
  return [dataPosts, uiPosts];
};

export default (responce) => {
  const data = responce.data.contents;
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'application/xml');
  if (dom.querySelector('parsererror')) {
    throw new Error('notRSS');
  }
  const pubDate = dom.querySelector('pubDate').textContent;
  const feed = getFeed(dom);
  const [dataPosts, uiPosts] = getPosts(dom, feed.id);
  return {
    feed, dataPosts, uiPosts, pubDate,
  };
};
