import { ActionSchemaScope, PrimitiveTypes } from '@forestadmin/datasource-toolkit';
import SchemaGeneratorCollection from '../../../src/utils/forest-schema/generator-collection';
import * as factories from '../../__factories__';

describe('SchemaGeneratorCollection', () => {
  const dataSource = factories.dataSource.buildWithCollections([
    factories.collection.build({
      name: 'books',
      schema: factories.collectionSchema.build({
        fields: {
          id: factories.columnSchema.build({ columnType: PrimitiveTypes.Uuid, isPrimaryKey: true }),
          authorId: factories.columnSchema.build({ columnType: PrimitiveTypes.Uuid }),
          author: factories.manyToOneSchema.build({
            foreignCollection: 'persons',
            foreignKey: 'authorId',
          }),
        },
      }),
    }),
    factories.collection.build({
      name: 'persons',
      schema: factories.collectionSchema.build({
        actions: {
          'Make as Live': { scope: ActionSchemaScope.Single },
        },
        fields: {
          id: factories.columnSchema.build({
            columnType: PrimitiveTypes.Uuid,
            isPrimaryKey: true,
            isReadOnly: true,
          }),
        },
        segments: ['Live'],
      }),

      // Action does not have a form
      getAction: jest.fn().mockReturnValue({
        getForm: jest.fn().mockReturnValue(Promise.resolve(null)),
      }),
    }),
  ]);

  test('books should not be readonly and skip foreign keys', async () => {
    // because not all fields are readonly
    const schema = await SchemaGeneratorCollection.buildSchema(
      '/forest',
      dataSource.getCollection('books'),
    );

    // readonly
    expect(schema).toHaveProperty('isReadOnly', false);

    // fks are skipped
    expect(schema.fields).toHaveLength(2);
    expect(schema.fields[0]).toHaveProperty('field', 'id');
    expect(schema.fields[1]).toHaveProperty('field', 'author');
  });

  test('persons should be readonly and have actions and segments', async () => {
    // because all fields are readonly
    const schema = await SchemaGeneratorCollection.buildSchema(
      '/forest',
      dataSource.getCollection('persons'),
    );

    expect(schema).toHaveProperty('isReadOnly', true);
    expect(schema.actions).toHaveLength(1);
    expect(schema.segments).toHaveLength(1);
  });
});
