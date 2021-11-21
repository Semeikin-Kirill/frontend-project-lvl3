import * as yup from 'yup';
import { setLocale } from 'yup';

setLocale({
  string: {
    url: 'wrongUrl',
  },
  mixed: {
    notOneOf: 'duplicate',
  },
});

export default (url, listRSS) => {
  const listUrl = listRSS.map((rss) => rss.url);
  const schema = yup.string().url().notOneOf(listUrl);
  return schema.validate(url);
};
