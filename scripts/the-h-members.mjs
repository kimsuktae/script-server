import createCsv from '../service/csvService.mjs';
import mongoClient from '../util/mongoClient.mjs';
import postgresPool from '../util/postgresPool.mjs';

const theHMembers = async (parameter) => {
  const comparisonDate = getComparisonDate(parameter);

  console.log(comparisonDate);
  const rauths = await getRauths();
  const edge11Members = await getEdge11Members();
  const edge11MembersBlueIds = edge11Members.rows.reduce(
    (acc, member) => acc.add(member.login_id),
    new Set(),
  );
  const mappedRauth = rauths.map((rauth) => ({
    _id: rauth['_id'],
    blueId: rauth['blueId'],
    siteId: rauth['siteId'],
    dong: rauth['dong'],
    ho: rauth['ho'],
    createdTime: rauth['createdTime'],
  }));

  const result = mappedRauth
    .filterByBlueTokenTranslatorIds(edge11MembersBlueIds)
    .filterByDate(comparisonDate)
    .groupBySiteId()
    .formatSiteData();

  console.log(result);
  return await createCsv({ name: 'theHMembers', data: result });
};

const getComparisonDate = (parameter) => {
  const year = parseInt(parameter.year, 10);
  const month = parseInt(parameter.month, 10);

  if (isNaN(year) || year.toString().length !== 4) {
    throw new Error('Year must be a 4-digit number');
  }

  if (isNaN(month) || month < 1 || month > 12) {
    throw new Error('Month must be a number between 1 and 12');
  }

  return new Date(Date.UTC(year, month, 1));
};

const getRauths = async () => {
  const client = mongoClient();
  const query = {
    blueId: {
      $exists: true,
    },
    state: 'CREATED',
    siteId: {
      $in: ['EDGE112', 'EDGE11', 'EDGE85', 'EDGE417'],
    },
  };

  try {
    await client.connect();
    const collection = client.db('AUTHMANAGE').collection('RAUTH');
    const ratuths = await collection.find(query).toArray();

    return ratuths;
  } finally {
    await client.close();
  }
};

async function getEdge11Members() {
  const pool = postgresPool('blue-user-token-translator');
  const client = await pool.connect();

  const query =
    "SELECT login_id FROM public.login_info WHERE site_id = 'EDGE11'";
  const blueTokenTranslatorLoginIds = await client.query(query);

  client.release();

  return blueTokenTranslatorLoginIds;
}

Array.prototype.filterByBlueTokenTranslatorIds = function (
  edge11MembersBlueIds,
) {
  return this.filter(
    (rauth) =>
      !(rauth.siteId === 'EDGE11' && !edge11MembersBlueIds.has(rauth.blueId)),
  );
};

Array.prototype.filterByDate = function (comparisonDate) {
  return this.filter(
    (element) => new Date(element.createdTime) < comparisonDate,
  );
};

Array.prototype.groupBySiteId = function () {
  return this.reduce((acc, rauth) => {
    const key = rauth.siteId;
    if (!acc[key]) {
      acc[key] = { member: 0, houseHold: new Set() };
    }
    acc[key].member += 1;
    acc[key].houseHold.add(rauth.dong + rauth.ho);

    return acc;
  }, {});
};

Object.prototype.formatSiteData = function () {
  return Object.entries(this).map(([siteId, { member, houseHold }]) => ({
    siteId,
    member,
    houseHold: houseHold.size,
  }));
};

export default theHMembers;
