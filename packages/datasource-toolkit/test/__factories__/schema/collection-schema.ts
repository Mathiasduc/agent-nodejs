import { Factory } from 'fishery';
import { CollectionSchema } from '../../../src/interfaces/schema';

export class CollectionSchemaFactory extends Factory<CollectionSchema> {
  unsearchable(): CollectionSchemaFactory {
    return this.params({ searchable: false });
  }
}

export default CollectionSchemaFactory.define(() => ({
  actions: {},
  fields: {},
  searchable: true,
  segments: [],
}));