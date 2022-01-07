/* eslint-disable max-classes-per-file */
import BaseCollection from '../src/base-collection';
import {
  Action,
  ActionForm,
  ActionResponse,
  ActionResponseType,
  ActionSchema,
  AggregateResult,
  ColumnSchema,
  DataSource,
  FieldSchema,
  RecordData,
} from '../src';

class ConcreteAction implements Action {
  async execute(): Promise<ActionResponse> {
    return {
      type: ActionResponseType.Redirect,
      path: 'https://test.com',
    };
  }

  async getForm(): Promise<ActionForm> {
    return { fields: [] };
  }
}

class ConcreteCollection extends BaseCollection {
  getById(): Promise<RecordData> {
    throw new Error('Method not implemented.');
  }

  create(): Promise<RecordData[]> {
    throw new Error('Method not implemented.');
  }

  list(): Promise<RecordData[]> {
    throw new Error('Method not implemented.');
  }

  update(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  delete(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  aggregate(): Promise<AggregateResult[]> {
    throw new Error('Method not implemented.');
  }
}

describe('BaseCollection', () => {
  it('should instanciate properly when extended', () => {
    expect(new ConcreteCollection('collection', null)).toBeDefined();
  });

  describe('addAction', () => {
    class CollectionWithAction extends ConcreteCollection {
      constructor(name: string, dataSource: DataSource) {
        super(name, dataSource);

        this.addAction('__action__', null, null);
      }
    }

    class DuplicatedActionErrorCollection extends ConcreteCollection {
      constructor(name: string, dataSource: DataSource) {
        super(name, dataSource);

        this.addAction('__duplicated__', null, null);
        this.addAction('__duplicated__', null, null);
      }
    }

    it('should prevent instanciation when adding action with duplicated name', () => {
      expect(() => new DuplicatedActionErrorCollection('__duplicated__', null)).toThrow(
        'Action "__duplicated__" already defined in collection',
      );
    });

    it('should add action with unique name', () => {
      const collection = new CollectionWithAction('__valid__', null);

      expect(collection).toBeInstanceOf(CollectionWithAction);
      expect(collection.getAction('__action__')).toBeDefined();
    });
  });

  describe('getAction', () => {
    const expectedAction = new ConcreteAction();

    class CollectionWithAction extends ConcreteCollection {
      constructor(name: string, dataSource: DataSource) {
        super(name, dataSource);

        this.addAction('__action__', {} as ActionSchema, expectedAction);
      }
    }

    it('should get action from collection schema', () => {
      const collection = new CollectionWithAction('collection', null);

      expect(collection.getAction('__action__')).toBe(expectedAction);
    });

    it('should fail to get action if one with the same name is not present', () => {
      const collection = new CollectionWithAction('collection', null);

      expect(() => collection.getAction('__no_such_action__')).toThrow();
    });
  });

  describe('addField', () => {
    const expectedField: FieldSchema = {} as ColumnSchema;
    class CollectionWithField extends ConcreteCollection {
      constructor(name: string, dataSource: DataSource) {
        super(name, dataSource);

        this.addField('__field__', expectedField);
      }
    }

    class DuplicatedFieldErrorCollection extends ConcreteCollection {
      constructor(name: string, dataSource: DataSource) {
        super(name, dataSource);

        this.addField('__duplicated__', null);
        this.addField('__duplicated__', null);
      }
    }

    it('should prevent instanciation when adding field with duplicated name', () => {
      expect(() => new DuplicatedFieldErrorCollection('__duplicated__', null)).toThrow(
        'Field "__duplicated__" already defined in collection',
      );
    });

    it('should add field with unique name', () => {
      const collection = new CollectionWithField('__valid__', null);

      expect(collection).toBeInstanceOf(CollectionWithField);
      expect(collection.schema.fields).toMatchObject({
        __field__: expectedField,
      });
    });
  });

  describe('addFields', () => {
    const firstExpectedField: FieldSchema = {} as ColumnSchema;
    const secondExpectedField: FieldSchema = {} as ColumnSchema;

    class CollectionWithFields extends ConcreteCollection {
      constructor(name: string, dataSource: DataSource) {
        super(name, dataSource);

        this.addFields({
          __first__: firstExpectedField,
          __second__: secondExpectedField,
        });
      }
    }

    it('should add all fields', () => {
      const collection = new CollectionWithFields('__valid__', null);

      expect(collection).toBeInstanceOf(CollectionWithFields);
      expect(collection.schema.fields).toMatchObject({
        __first__: firstExpectedField,
        __second__: secondExpectedField,
      });
    });
  });

  describe('enableSearch', () => {
    class CollectionSearchable extends ConcreteCollection {
      constructor(name: string, dataSource: DataSource) {
        super(name, dataSource);

        this.enableSearch();
      }
    }

    it('should set searchable to true', () => {
      const collection = new CollectionSearchable('__searchable__', null);

      expect(collection.schema.searchable).toBe(true);
    });
  });
});