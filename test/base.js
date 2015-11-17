'use strict'
/* eslint-env mocha */

var fs = require('fs')
var assert = require('assert')
var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './mydb.sqlite'
  }
})
var bookshelf = require('bookshelf')(knex)
var BaseModel = require('..')(bookshelf)

var User = BaseModel.extend({
  tableName: 'user',

  fields: {
    username: { validate: ['required'] },
    email: { validate: ['required', 'email'] },
    foo: {}
  }
})

describe('BaseModel', function () {
  before(function (done) {
    knex.schema.createTable('user', function (table) {
      table.increments('id').primary()
      table.string('username').notNullable()
      table.string('email').notNullable().unique()
      table.string('foo')
      table.timestamps()
    }).nodeify(done)
  })
  after(fs.unlink.bind(null, 'mydb.sqlite'))

  it('should validate model attributes', function (done) {
    var user = User.forge({ email: 'invalid@email', foo: 1 })
    user
      .save()
      .then(function (user) {
        throw new Error('should not be called')
      })
      .catch(User.ValidationError, function (err) {
        assert.equal(err.message, '2 invalid values')
        assert.equal(err.errors.username.message, 'The username is required')
        assert.equal(err.errors.email.message, 'The email must be a valid email address')
      })
      .nodeify(done)
  })

  it('should save only permitted fields', function (done) {
    var user = User.forge({ username: 'test', email: 'test@testis.com', nono: 'noup' })
    user
      .save()
      .then(function (user) {
        assert.equal(user.get('nono'), undefined)
      })
      .nodeify(done)
  })
})
