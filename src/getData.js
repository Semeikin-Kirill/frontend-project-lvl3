import { uniqueId } from 'lodash';

export const getFeed = (dom) => {
  const feedTitle = dom.querySelector('title').textContent;
  const feedDescription = dom.querySelector('description').textContent;
  return {
    description: feedDescription,
    title: feedTitle,
    id: uniqueId(),
  };
};

export const getPosts = (dom, feedId) => {
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
  return posts;
};
