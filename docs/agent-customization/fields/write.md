Forest Admin allows replacing the field writing behavior with your own.

This is useful when you want to change how a given field behaves, but also to make [computed fields](./computed.md) writable.

## How does it work

The `replaceFieldWriting` function allows changing the behavior of any change by creating a new patch that will be applied to the record.

You should refrain from using handlers that have side effects (to perform error handling, validation, ...) and [use hooks instead](../hooks/README.md).

## Examples

### Making a field read-only

{% hint style="info" %}
The same result can be achieved without any code [in the field settings](https://docs.forestadmin.com/user-guide/collections/customize-your-fields#basic-settings).
{% endhint %}

Making a field read-only can be achieved by passing `null` as an update handler.

```javascript
collection.replaceFieldWriting('fullName', null);
```

### Changing other fields in the same record

In the following example, editing or creating a `fullName` will update both `firstName` and `lastName` fields of the record.

```javascript
collection.replaceFieldWriting('fullName', value => {
  const [firstName, lastName] = value.split(' ');

  return { firstName, lastName };
});
```

### Having specific behavior only for updates

You can have different behavior for `creations` and `updates`.

In this example, each time the `firstName` field is edited, we also want to update a timestamp field.

```javascript
collection.replaceFieldWriting('firstName', async (value, context) => {
  switch (context.action) {
    case 'create':
      return { firstName, firstNameLastEdited: null };

    case 'update':
      return { firstName, firstNameLastEdited: new Date().toISOString() };

    default:
      throw new Error('Unexpected value');
  }
});
```

### Changing fields in related records

{% hint style="info" %}
Handling relationships inside a `replaceFieldWriting` will only work for `ManyToOne` and `OneToOne` relationships.
{% endhint %}

In this simple example, we have two collections that are linked together:

- The `Users` collection has a `job` and a `portfolioId` as foreignKey
- The `Portfolios` collection has a `title`

When the user updates his `job` field we want also to update the `title` of the portfolio by the `job` name.

```javascript
collection.replaceFieldWriting('job', (job, { action }) => {
  return { job, portfolio: { title: job } };
});
```

{% hint style="info" %}
If the relationships do not exist it will create them with the given field values.
{% endhint %}

You can also provide another `portfolioId` to update the relationships and their fields:

```javascript
collection.replaceFieldWriting('job', (job, { action }) => {
  return { job, portfolioId: 8, portfolio: { title: job } };
});
```

Of course, you can chain the relationships. For example, if a portfolio has a `one-to-one` relationship
with the `formats` collection, you can update it by writing the right path.

```javascript
collection.replaceFieldWriting('job', (job, { action }) => {
  return { job, portfolioId: 8, portfolio: { title: job, format: { name: 'pdf' } } };
});
```
