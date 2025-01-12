You may want to read about the following topics before using those features:

- [Unlocking filtering, scopes, and segments on the UI](./../../datasources/custom/capabilities.md#unlock-filtering-scopes-and-segments-on-ui)
- [Structure of a `ConditionTree`](../../under-the-hood/queries/filters.md#examples)
- [List of all filtering Operators](../../under-the-hood/queries/filters.md#operators)
- [Operator equivalence system](../../under-the-hood/queries/filters.md#operator-equivalence)

## Disabling operators

{% hint style="info" %}
Disabling filtering can be made without any code [in the field settings](https://docs.forestadmin.com/user-guide/collections/customize-your-fields#basic-settings).
{% endhint %}

Filtering operators can be disabled one by one.

This is used mostly for performance reasons: on big collections, it can be interesting to let users filter only on fields that are indexed in your database to avoid [full-table scans](https://en.wikipedia.org/wiki/Full_table_scan).

```javascript
collection.replaceFieldOperator('fullName', 'Equal', null);
```

## Substitution

Operation substitution can be used for two motives:

- Performance: provide a more efficient way to perform a given filtering operation
- Capabilities: enable filtering on a computed field or other non-filterable fields

```javascript
collection.replaceFieldOperator('fullName', 'Equal', (value, context) => {
  const [firstName, ...lastNames] = value.split(' ');

  return {
    aggregation: 'And',
    conditions: [
      { field: 'firstName', operator: 'Equal', value: firstName },
      { field: 'lastName', operator: 'Equal', value: lastNames.join(' ') },
    ],
  };
});
```

## Emulation

Filtering emulation allows making fields filterable automatically.

{% hint style="warning" %}
Filtering emulation performance cost is **linear** with the number of records in the collection. It is a convenient way to get things working quickly for collections that have a low number of records (in the thousands at most).
{% endhint %}

```javascript
// Add support for all operators
collection.emulateFieldFiltering('fullName');

// Add support for a single operator
collection.emulateFieldOperator('fullName', 'Equal');
```
