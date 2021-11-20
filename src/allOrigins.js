const allOrigins = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=';

export default (url) => allOrigins.concat(encodeURIComponent(url));
