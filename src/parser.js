export default (responce) => {
  const data = responce.data.contents;
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'application/xml');
  if (dom.querySelector('parsererror')) {
    throw new Error('notRSS');
  }
  return dom;
};
