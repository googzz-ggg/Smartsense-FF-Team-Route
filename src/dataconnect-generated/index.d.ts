import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateLocationData {
  location_insert: Location_Key;
}

export interface Inventory_Key {
  id: UUIDString;
  __typename?: 'Inventory_Key';
}

export interface ListMaterialData {
  materials: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    unitOfMeasure: string;
  } & Material_Key)[];
}

export interface ListTasksForUserData {
  tasks: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    dueDate: TimestampString;
    status: string;
  } & Task_Key)[];
}

export interface ListTasksForUserVariables {
  userId: UUIDString;
}

export interface Location_Key {
  id: UUIDString;
  __typename?: 'Location_Key';
}

export interface Material_Key {
  id: UUIDString;
  __typename?: 'Material_Key';
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface UpdateVisitCheckOutTimeData {
  visit_update?: Visit_Key | null;
}

export interface UpdateVisitCheckOutTimeVariables {
  visitId: UUIDString;
  checkOutTime: TimestampString;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Visit_Key {
  id: UUIDString;
  __typename?: 'Visit_Key';
}

interface CreateLocationRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateLocationData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateLocationData, undefined>;
  operationName: string;
}
export const createLocationRef: CreateLocationRef;

export function createLocation(): MutationPromise<CreateLocationData, undefined>;
export function createLocation(dc: DataConnect): MutationPromise<CreateLocationData, undefined>;

interface ListTasksForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTasksForUserVariables): QueryRef<ListTasksForUserData, ListTasksForUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTasksForUserVariables): QueryRef<ListTasksForUserData, ListTasksForUserVariables>;
  operationName: string;
}
export const listTasksForUserRef: ListTasksForUserRef;

export function listTasksForUser(vars: ListTasksForUserVariables): QueryPromise<ListTasksForUserData, ListTasksForUserVariables>;
export function listTasksForUser(dc: DataConnect, vars: ListTasksForUserVariables): QueryPromise<ListTasksForUserData, ListTasksForUserVariables>;

interface UpdateVisitCheckOutTimeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateVisitCheckOutTimeVariables): MutationRef<UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateVisitCheckOutTimeVariables): MutationRef<UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables>;
  operationName: string;
}
export const updateVisitCheckOutTimeRef: UpdateVisitCheckOutTimeRef;

export function updateVisitCheckOutTime(vars: UpdateVisitCheckOutTimeVariables): MutationPromise<UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables>;
export function updateVisitCheckOutTime(dc: DataConnect, vars: UpdateVisitCheckOutTimeVariables): MutationPromise<UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables>;

interface ListMaterialRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMaterialData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMaterialData, undefined>;
  operationName: string;
}
export const listMaterialRef: ListMaterialRef;

export function listMaterial(): QueryPromise<ListMaterialData, undefined>;
export function listMaterial(dc: DataConnect): QueryPromise<ListMaterialData, undefined>;

