import { Chart } from '../charts/types';
import { PermissionService } from '../types';
import ActionPermission from './action-permission';
import {
  generateCollectionActionIdentifier,
  generateCustomActionIdentifier,
} from './generate-action-identifier';
import RenderingPermissionService from './rendering-permission';
import { CollectionActionEvent, CustomActionEvent } from './types';

export default class PermissionServiceWithCache implements PermissionService {
  constructor(
    private readonly actionPermissionService: ActionPermission,
    private readonly renderingPermissionService: RenderingPermissionService,
  ) {}

  public async canOnCollection({
    userId,
    collectionName,
    event,
  }: {
    userId: number;
    event: CollectionActionEvent;
    collectionName: string;
  }): Promise<boolean> {
    return this.actionPermissionService.can(
      `${userId}`,
      generateCollectionActionIdentifier(event, collectionName),
    );
  }

  public async canExecuteSegmentQuery(params: {
    userId: number;
    collectionName: string;
    renderingId: number;
    segmentQuery: string;
  }) {
    return this.renderingPermissionService.canExecuteSegmentQuery(params);
  }

  public canTriggerCustomAction({
    userId,
    collectionName,
    customActionName,
  }: {
    userId: number;
    customActionName: string;
    collectionName: string;
  }): Promise<boolean> {
    return this.actionPermissionService.can(
      `${userId}`,
      generateCustomActionIdentifier(CustomActionEvent.Trigger, customActionName, collectionName),
    );
  }

  public canApproveCustomAction({
    userId,
    collectionName,
    customActionName,
    requesterId,
  }: {
    userId: number;
    customActionName: string;
    collectionName: string;
    requesterId: number;
  }): Promise<boolean> {
    const actionIdentifier =
      requesterId === userId
        ? generateCustomActionIdentifier(
            CustomActionEvent.SelfApprove,
            customActionName,
            collectionName,
          )
        : generateCustomActionIdentifier(
            CustomActionEvent.Approve,
            customActionName,
            collectionName,
          );

    return this.actionPermissionService.can(`${userId}`, actionIdentifier);
  }

  public async canRequestCustomActionParameters({
    userId,
    collectionName,
    customActionName,
  }: {
    userId: number;
    collectionName: string;
    customActionName: string;
  }): Promise<boolean> {
    return this.actionPermissionService.canOneOf(`${userId}`, [
      generateCustomActionIdentifier(CustomActionEvent.Trigger, customActionName, collectionName),
      generateCustomActionIdentifier(
        CustomActionEvent.RequireApproval,
        customActionName,
        collectionName,
      ),
    ]);
  }

  public async canExecuteChart({
    renderingId,
    userId,
    chartRequest,
  }: {
    renderingId: number;
    userId: number;
    chartRequest: Chart;
  }): Promise<boolean> {
    return this.renderingPermissionService.canExecuteChart({
      renderingId,
      userId,
      chartRequest,
    });
  }
}