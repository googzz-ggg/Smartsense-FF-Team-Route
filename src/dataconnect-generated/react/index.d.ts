import { CreateLocationData, ListTasksForUserData, ListTasksForUserVariables, UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables, ListMaterialData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateLocation(options?: useDataConnectMutationOptions<CreateLocationData, FirebaseError, void>): UseDataConnectMutationResult<CreateLocationData, undefined>;
export function useCreateLocation(dc: DataConnect, options?: useDataConnectMutationOptions<CreateLocationData, FirebaseError, void>): UseDataConnectMutationResult<CreateLocationData, undefined>;

export function useListTasksForUser(vars: ListTasksForUserVariables, options?: useDataConnectQueryOptions<ListTasksForUserData>): UseDataConnectQueryResult<ListTasksForUserData, ListTasksForUserVariables>;
export function useListTasksForUser(dc: DataConnect, vars: ListTasksForUserVariables, options?: useDataConnectQueryOptions<ListTasksForUserData>): UseDataConnectQueryResult<ListTasksForUserData, ListTasksForUserVariables>;

export function useUpdateVisitCheckOutTime(options?: useDataConnectMutationOptions<UpdateVisitCheckOutTimeData, FirebaseError, UpdateVisitCheckOutTimeVariables>): UseDataConnectMutationResult<UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables>;
export function useUpdateVisitCheckOutTime(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateVisitCheckOutTimeData, FirebaseError, UpdateVisitCheckOutTimeVariables>): UseDataConnectMutationResult<UpdateVisitCheckOutTimeData, UpdateVisitCheckOutTimeVariables>;

export function useListMaterial(options?: useDataConnectQueryOptions<ListMaterialData>): UseDataConnectQueryResult<ListMaterialData, undefined>;
export function useListMaterial(dc: DataConnect, options?: useDataConnectQueryOptions<ListMaterialData>): UseDataConnectQueryResult<ListMaterialData, undefined>;
