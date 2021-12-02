const getFeed = (dom) => ({
  description: dom.querySelector('description').textContent,
  title: dom.querySelector('title').textContent,
});

const getPosts = (dom) => {
  const items = dom.querySelectorAll('item');
  return Array.from(items).map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
  }));
};

export default (contents) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(contents, 'application/xml');
  if (dom.querySelector('parsererror')) {
    throw new Error(`notRSS: ${dom.querySelector('parsererror').textContent}`);
  }
  const pubDate = dom.querySelector('pubDate').textContent;
  const feed = getFeed(dom);
  const posts = getPosts(dom);
  return {
    feed,
    posts,
    pubDate,
  };
};
