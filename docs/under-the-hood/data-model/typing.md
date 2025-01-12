Fields on Forest Admin can either use `Primitive Types` or `Composite Types`.

## Primitive types

The primitive types which are supported by Forest Admin are the following:

| Forest Admin Type | Javascript Type                                            |
| ----------------- | ---------------------------------------------------------- |
| Boolean           | Boolean                                                    |
| Date              | String with format "1985-10-26T01:22:00-08:00Z" (ISO-8601) |
| Dateonly          | String with format "1985-10-26"                            |
| Enum              | String                                                     |
| JSON              | Any JSON compatible value                                  |
| Number            | Number                                                     |
| Point             | Array of two numbers                                       |
| String            | String                                                     |
| Timeonly          | String with format "01:22:00"                              |
| Uuid              | String with uuid v4 format                                 |

## Composite types

{% hint style="info" %}

- Fields using composite types are not sortable and do not implement validation
- Only fields which are an array of a primitive type are filterable (depending on the data source)

{% endhint %}

```javascript
// Object containing two strings
{ firstName: 'String', lastName: 'String' }

// Array of strings
['String']

// Array of objects
[{ content: 'String' }]

// Object containing an array of array of numbers
{ content: [['Number']] }
```

When using composite types, the data in the UI may not be displayed as you expect!

| Composite Type                        | Example                                         | How it gets displayed                    |
| ------------------------------------- | ----------------------------------------------- | ---------------------------------------- |
| array of primitive type               | `[ 'array', 'of', 'strings']`                   | As a custom widget in the edition form   |
| object                                | `{ title: "the godfather"}`                     | As a nested form in the edition form     |
| array of object                       | `[{ title: "the shawshank redemption"}]`        | As a new collection in related data page |
| array of object (with nested objects) | `[{ rating: { kind: 'MPA", value: "PG-13" } }]` | JSON editor in the edition form          |
| anything else                         |                                                 | JSON editor in the edition form          |

If you want to force displaying your data as a new collection in the related data page, but can't because your data model contains nested objects, you may consider typing all nested objects as `'JSON'`.
