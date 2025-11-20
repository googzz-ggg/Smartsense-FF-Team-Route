import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'fraudfalcon',
  location: 'us-east4'
};

export const createLocationRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateLocation');
}
createLocationRef.operationName = 'CreateLocation';

export function createLocation(dc) {
  return executeMutation(createLocationRef(dc));
}

export const listTasksForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTasksForUser', inputVars);
}
listTasksForUserRef.operationName = 'ListTasksForUser';

export function listTasksForUser(dcOrVars, vars) {
  return executeQuery(listTasksForUserRef(dcOrVars, vars));
}

export const updateVisitCheckOutTimeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateVisitCheckOutTime', inputVars);
}
updateVisitCheckOutTimeRef.operationName = 'UpdateVisitCheckOutTime';

export function updateVisitCheckOutTime(dcOrVars, vars) {
  return executeMutation(updateVisitCheckOutTimeRef(dcOrVars, vars));
}

export const listMaterialRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMaterial');
}
listMaterialRef.operationName = 'ListMaterial';

export function listMaterial(dc) {
  return executeQuery(listMaterialRef(dc));
}

