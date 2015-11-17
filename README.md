# bookshelf-base-model

Base model for [bookshelf](http://bookshelfjs.org/).

## Install

```
npm install bookshelf-base-model --save
```

## Usage

```js
const knex = require('knex')({...})
const bookshelf = require('bookshelf')(knex)
const BaseModel = require('bookshelf-base-model')(bookshelf)

const User = BaseModel.extend({
  tableName: 'user',

  fields: {
    username: {
      validate: ['required']
    },
    email: {
      validate: ['required', 'email']
    },
    other: {}
  }
})
```

## Features

### Permitted fields

Allow only attributes from `fields` hash to go into database.

```js
let user = User.forge({
  username: 'some-user-name',
  email: 'user@name.com',
  nonofield: 'invalid field'
})
user
  .save()
  .then(user => {
    // user saved without error
    // user.get('nonofield') === undefined
  })
```

### Validation

Add validation to your fields using awesome [Checkit](https://github.com/tgriesser/checkit) module. It supports both sync and async validation.
List of all available validators can be found [here](https://github.com/tgriesser/checkit/blob/master/README.md#available-validators).

```js
let user = User.forge({ email: 'invalid@email' })
user
  .save()
  .catch(User.ValidationError, function (err) {
    // handle validation error
  })
  .catch(function (err) {
    // handle db/other error
  })
```

## Test

```
npm test
```

## Licence

MIT
