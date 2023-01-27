import { ProjectionFactory, RecordValidator } from '@forestadmin/datasource-toolkit';
import Router from '@koa/router';
import { Context } from 'koa';

import CallerParser from '../../utils/query-parser/caller';
import FilterParser from '../../utils/query-parser/filter';
import CollectionRoute from '../collection-route';

export default class UpdateRoute extends CollectionRoute {
  setupRoutes(router: Router): void {
    router.put(`/${this.collection.name}/:id`, this.handleUpdate.bind(this));
  }

  public async handleUpdate(context: Context): Promise<void> {
    await this.services.authorization.assertCanEdit(context, this.collection.name);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = context.request.body as any;

    if ('relationships' in body.data) {
      delete body.data.relationships;
    }

    const record = this.services.serializer.deserialize(this.collection, body);
    RecordValidator.validate(this.collection, record);

    const scope = await this.services.authorization.getScope(this.collection, context);

    const caller = CallerParser.fromCtx(context);
    const filter = FilterParser.fromListRequest(this.collection, context).intersectWith(scope);
    await this.collection.update(caller, filter, record);

    const [updateResult] = await this.collection.list(
      caller,
      filter,
      ProjectionFactory.all(this.collection),
    );

    context.response.body = this.services.serializer.serialize(this.collection, updateResult);
  }
}
