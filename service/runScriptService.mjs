import siteHouseholdMembers from '../scripts/site-households-members.mjs';
import theHMembers from '../scripts/the-h-members.mjs';

const runScript = async (scriptName, parameters) => {
  const chosenScript = script[scriptName];

  if (!chosenScript) {
    throw Exception('Can not find script to run');
  }

  const createdFilePath = await chosenScript(parameters);

  return createdFilePath;
};

const script = {
  'site-households-members': siteHouseholdMembers,
  'the-h-members': theHMembers,
};

export default runScript;
