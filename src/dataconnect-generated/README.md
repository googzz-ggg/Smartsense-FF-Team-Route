# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListTasksForUser*](#listtasksforuser)
  - [*ListMaterial*](#listmaterial)
- [**Mutations**](#mutations)
  - [*CreateLocation*](#createlocation)
  - [*UpdateVisitCheckOutTime*](#updatevisitcheckouttime)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListTasksForUser
You can execute the `ListTasksForUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTasksForUser(vars: ListTasksForUserVariables): QueryPromise<ListTasksForUserData, ListTasksForUserVariables>;

interface ListTasksForUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTasksForUserVariables): QueryRef<ListTasksForUserData, ListTasksForUserVariables>;
}
export const listTasksForUserRef: ListTasksForUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTasksForUser(dc: DataConnect, vars: ListTasksForUserVariables): QueryPromise<ListTasksForUserData, ListTasksForUserVariables>;

interface ListTasksForUserRef {
  ...
  (dc: DataConnect, vars: ListTasksForUserVariables): QueryRef<ListTasksForUserData, ListTasksForUserVariables>;
}
export const listTasksForUserRef: ListTasksForUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTasksForUserRef:
```typescript
const name = listTasksForUserRef.operationName;
console.log(name);
```

### Variables
The `ListTasksForUser` query requires an argument of type `ListTasksForUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTasksForUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `ListTasksForUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTasksForUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListTasksForUserData {
  tasks: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    dueDate: TimestampString;
    status: string;
  } & Task_Key)[];
}
```
### Using `ListTasksForUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTasksForUser, ListTasksForUserVariables } from '@dataconnect/generated';

// The `ListTasksForUser` query requires an argument of type `ListTasksForUserVariables`:
const listTasksForUserVars: ListTasksForUserVariables = {
  userId: ..., 
};

// Call the `listTasksForUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTasksForUser(listTasksForUserVars);
// Variables can be defined inline as well.
const { data } = await listTasksForUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTasksForUser(dataConnect, listTasksForUserVars);

console.log(data.tasks);

// Or, you can use the `Promise` API.
listTasksForUser(listTasksForUserVars).then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

### Using `ListTasksForUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTasksForUserRef, ListTasksForUserVariables } from '@dataconnect/generated';

// The `ListTasksForUser` query requires an argument of type `ListTasksForUserVariables`:
const listTasksForUserVars: ListTasksForUserVariables = {
  userId: ..., 
};

// Call the `listTasksForUserRef()` function to get a reference to the query.
const ref = listTasksForUserRef(listTasksForUserVars);
// Variables can be defined inline as well.
const ref = listTasksForUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTasksForUserRef(dataConnect, listTasksForUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tasks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

## ListMaterial
You can execute the `ListMaterial` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMaterial(): QueryPromise<ListMaterialData, undefined>;

interface ListMaterialRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMaterialData, undefined>;
}
export const listMaterialRef: ListMaterialRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMaterial(dc: DataConnect): QueryPromise<ListMaterialData, undefined>;

interface ListMaterialRef {
  ...
  (dc: DataConnect): QueryRef<ListMaterialData, undefined>;
}
export const listMaterialRef: ListMaterialRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMaterialRef:
```typescript
const name = listMaterialRef.operationName;
console.log(name);
```

### Variables
The `ListMaterial` query has no variables.
### Return Type
Recall that executing the `ListMaterial` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMaterialData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMaterialData {
  materials: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    unitOfMeasure: string;
  } & Material_Key)[];
}
```
### Using `ListMaterial`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMaterial } from '@dataconnect/generated';


// Call the `listMaterial()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMaterial();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMaterial(dataConnect);

console.log(data.materials);

// Or, you can use the `Promise` API.
listMaterial().then((response) => {
  const data = response.data;
  console.log(data.materials);
});
```

### Using `ListMaterial`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMaterialRef } from '@dataconnect/generated';


// Call the `listMaterialRef()` function to get a reference to the query.
const ref = listMaterialRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMaterialRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.materials);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.materials);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateLocation
You can execute the `CreateLocation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLocation(): MutationPromise<CreateLocationData, undefined>;

interface CreateLocationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateLocationData, undefined>;
}
export const createLocationRef: CreateLocationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLocation(dc: DataConnect): MutationPromise<CreateLocationData, undefined>;

interface CreateLocationRef {
  ...
  (dc: DataConnect): MutationRef<CreateLocationData, undefined>;
}
export const createLocationRef: CreateLocationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLocationRef:
```typescript
const name = createLocationRef.operationName;
console.log(name);
```

### Variables
The `CreateLocation` mutation has no variables.
### Return Type
Recall that executing the `CreateLocation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLocationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLocationData {
  location_insert: Location_Key;
}
```
### Using `CreateLocation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLocation } from '@dataconnect/generated';


// Call the `createLocation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLocation();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLocation(dataConnect);

console.log(data.location_insert);

// Or, you can use the `Promise` API.
createLocation().then((response) => {
  const data = response.data;
  console.log(data.location_insert);
});
```

### Using `CreateLocation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLocationRef } from '@dataconnect/generated';


// Call the `createLocationRef()` function to get a reference to the mutation.
const ref = createLocationRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLocationRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.location_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.location_insert);
});
```

## UpdateVisitCheckOutTime
You can execute the `UpdateVisitCheckOutTime` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateVisitCheckOutTime(vars: UpdateVisitCheckOutTimeVariables): MutationPromise<UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables>;

interface UpdateVisitCheckOutTimeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateVisitCheckOutTimeVariables): MutationRef<UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables>;
}
export const updateVisitCheckOutTimeRef: UpdateVisitCheckOutTimeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateVisitCheckOutTime(dc: DataConnect, vars: UpdateVisitCheckOutTimeVariables): MutationPromise<UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables>;

interface UpdateVisitCheckOutTimeRef {
  ...
  (dc: DataConnect, vars: UpdateVisitCheckOutTimeVariables): MutationRef<UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables>;
}
export const updateVisitCheckOutTimeRef: UpdateVisitCheckOutTimeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateVisitCheckOutTimeRef:
```typescript
const name = updateVisitCheckOutTimeRef.operationName;
console.log(name);
```

### Variables
The `UpdateVisitCheckOutTime` mutation requires an argument of type `UpdateVisitCheckOutTimeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateVisitCheckOutTimeVariables {
  visitId: UUIDString;
  checkOutTime: TimestampString;
}
```
### Return Type
Recall that executing the `UpdateVisitCheckOutTime` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateVisitCheckOutTimeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateVisitCheckOutTimeData {
  visit_update?: Visit_Key | null;
}
```
### Using `UpdateVisitCheckOutTime`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateVisitCheckOutTime, UpdateVisitCheckOutTimeVariables } from '@dataconnect/generated';

// The `UpdateVisitCheckOutTime` mutation requires an argument of type `UpdateVisitCheckOutTimeVariables`:
const updateVisitCheckOutTimeVars: UpdateVisitCheckOutTimeVariables = {
  visitId: ..., 
  checkOutTime: ..., 
};

// Call the `updateVisitCheckOutTime()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateVisitCheckOutTime(updateVisitCheckOutTimeVars);
// Variables can be defined inline as well.
const { data } = await updateVisitCheckOutTime({ visitId: ..., checkOutTime: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateVisitCheckOutTime(dataConnect, updateVisitCheckOutTimeVars);

console.log(data.visit_update);

// Or, you can use the `Promise` API.
updateVisitCheckOutTime(updateVisitCheckOutTimeVars).then((response) => {
  const data = response.data;
  console.log(data.visit_update);
});
```

### Using `UpdateVisitCheckOutTime`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateVisitCheckOutTimeRef, UpdateVisitCheckOutTimeVariables } from '@dataconnect/generated';

// The `UpdateVisitCheckOutTime` mutation requires an argument of type `UpdateVisitCheckOutTimeVariables`:
const updateVisitCheckOutTimeVars: UpdateVisitCheckOutTimeVariables = {
  visitId: ..., 
  checkOutTime: ..., 
};

// Call the `updateVisitCheckOutTimeRef()` function to get a reference to the mutation.
const ref = updateVisitCheckOutTimeRef(updateVisitCheckOutTimeVars);
// Variables can be defined inline as well.
const ref = updateVisitCheckOutTimeRef({ visitId: ..., checkOutTime: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateVisitCheckOutTimeRef(dataConnect, updateVisitCheckOutTimeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.visit_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.visit_update);
});
```

