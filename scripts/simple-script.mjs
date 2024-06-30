import createCsv from '../service/csvService.mjs';

const simple = async (name) => {
  const simpleData = { name: name };

  return await createCsv({ name: 'greet', data: [simpleData] });
};

export default simple;
