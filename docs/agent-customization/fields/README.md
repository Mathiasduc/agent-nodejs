Forest Admin is an admin panel, not a WYSIWYG on top of your database.

When designing databases and APIs, the way to go is usually to push for _normalization_. This means ensuring there is no redundancy of data (all data is stored in only one place), and that data dependencies are logical.

On the other hand, graphical user interfaces usually need duplication and shortcuts to be user-friendly.

To bridge that gap, Forest Admin allows adding, moving, removing, and overriding behaviors from fields.

## Minimal example

```javascript
collection
  // Create a new field
  .addField('fullName', {
    columnType: 'String',
    dependencies: ['firstName', 'lastName'],
    getValues: (records, context) => records.map(r => `${r.firstName} ${r.lastName}`),
  })

  // Make it writable
  .replaceFieldWriting('fullName', (value, context) => {
    const [firstName, lastName] = value.split(' ');

    return { firstName, lastName };
  })

  // Add validators
  .addFieldValidation('fullName', 'Present')
  .addFieldValidation('fullName', 'ShorterThan', 30)
  .addFieldValidation('fullName', 'LongerThan', 2)

  // Make it filterable and sortable
  .emulateFieldFiltering('fullName')
  .emulateFieldSorting('fullName')

  // Remove previous fields
  .removeField('firstName', 'lastName');
```
