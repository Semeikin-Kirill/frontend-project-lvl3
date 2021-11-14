import * as yup from 'yup';

export default (url, listUrl) => {
  const schema = yup.string().url().notOneOf(listUrl);
  return schema.validate(url);
};
