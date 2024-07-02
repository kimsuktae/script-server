import createCsv from '../service/csvService.mjs';
import mongoClient from '../util/mongoClient.mjs';

const siteHouseholdMembers = async (parameters) => {
  const yearMonth = getYearMonth(parameters);
  const client = mongoClient();

  try {
    await client.connect();
    const database = client.db('AUTHMANAGE');
    const collection = database.collection('RAUTH');
    const result = (await collection.aggregate(query(yearMonth)).toArray()).map(
      (doc) => {
        return {
          siteId: doc._id,
          households: doc.households,
          members: doc.members,
        };
      },
    );

    return await createCsv({
      name: 'siteHouseholdMembers',
      data: result,
    });
  } catch (exception) {
    throw Error(exception);
  } finally {
    await client.close();
  }
};

const getYearMonth = (parameters) => {
  const { year, month } = parameters;

  if (!/^\d{4}$/.test(year)) {
    throw new Error('Year must be a 4-digit number');
  }

  // Month 검증
  const monthNum = parseInt(month, 10);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    throw new Error('Month must be a number between 1 and 12');
  }

  // 다음 달 계산
  const nextMonth = (monthNum % 12) + 1;
  const nextYear = parseInt(year) + Math.floor(monthNum / 12);

  // 년도가 10000 이상이 되면 에러 처리
  if (nextYear >= 10000) {
    throw new Error('Year cannot be 10000 or greater');
  }

  return `${nextYear}-${nextMonth.toString().padStart(2, '0')}`;
};

const query = (createTime) => [
  {
    $match: {
      blueId: { $ne: null },
      state: 'CREATED',
      siteId: { $regex: /^EDGE\d+/ },
      createdTime: { $lt: createTime },
    },
  },
  {
    $group: {
      _id: {
        siteId: '$siteId',
        dong: '$dong',
        ho: '$ho',
      },
      member: { $sum: 1 },
    },
  },
  {
    $group: {
      _id: '$_id.siteId',
      households: { $sum: 1 },
      members: { $sum: '$member' },
    },
  },
  {
    $addFields: {
      sortKey: {
        $convert: {
          input: { $substrBytes: ['$_id', 4, -1] },
          to: 'int',
        },
      },
    },
  },
  { $sort: { sortKey: 1 } },
  { $project: { sortKey: 0 } },
];

export default siteHouseholdMembers;
