const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'fraudfalcon',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createLocationRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLocation');
}
createLocationRef.operationName = 'CreateLocation';
exports.createLocationRef = createLocationRef;

exports.createLocation = function createLocation(dc) {
  return executeMutation(createLocationRef(dc));
};

const listTasksForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTasksForUser', inputVars);
}
listTasksForUserRef.operationName = 'ListTasksForUser';
exports.listTasksForUserRef = listTasksForUserRef;

exports.listTasksForUser = function listTasksForUser(dcOrVars, vars) {
  return executeQuery(listTasksForUserRef(dcOrVars, vars));
};

const updateVisitCheckOutTimeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateVisitCheckOutTime', inputVars);
}
updateVisitCheckOutTimeRef.operationName = 'UpdateVisitCheckOutTime';
exports.updateVisitCheckOutTimeRef = updateVisitCheckOutTimeRef;

exports.updateVisitCheckOutTime = function updateVisitCheckOutTime(dcOrVars, vars) {
  return executeMutation(updateVisitCheckOutTimeRef(dcOrVars, vars));
};

const listMaterialRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMaterial');
}
listMaterialRef.operationName = 'ListMaterial';
exports.listMaterialRef = listMaterialRef;

exports.listMaterial = function listMaterial(dc) {
  return executeQuery(listMaterialRef(dc));
};
