'use strict'

// Module dependencies.
const Checkit = require('checkit')

module.exports = (bookshelf, options = {}) => bookshelf.Model.extend({
  hasTimestamps: typeof options.timestamps === 'undefined' || options.timestamps,

  /**
   * Return fields that are allowed
   * to be stored in database.
   *
   * @return {Array}
   */

  permittedFields: function () {
    let fields = [this.idAttribute].concat(Object.keys(this.fields))
    if (this.hasTimestamps) {
      fields = fields.concat(['created_at', 'updated_at'])
    }
    return fields
  },

  /**
   * Return validation rules
   *
   * @return {Object}
   */

  validationRules: function () {
    let fields = this.fields
    let check = { new: 'isNew', changed: 'hasChanged' }
    return Object.keys(fields).reduce((rules, field) => {
      let validators = Array.isArray(fields[field].validate) ? fields[field].validate : []
      rules[field] = validators.reduce((memo, validator) => {
        let parts = validator.split('::')
        if (parts.length === 1 || (check[parts[0]] && this[check[parts[0]]](field))) {
          memo.push(parts[1] || parts[0])
        }
        return memo
      }, [])
      return rules
    }, {})
  },

  /**
   * Initialize model
   */

  initialize: function () {
    this.on('saving', (model, attrs, options) => {
      return Promise.resolve(this.saving(model, attrs, options)).then(() => {
        if (typeof options.validate === 'undefined' || options.validate) {
          return this.validate(model, attrs, options)
        }
      })
    })
  },

  /**
   * Validate model attributes
   *
   * @return {Promise}
   */

  validate: function () {
    return new Checkit(this.validationRules()).run(this.attributes, this)
  },

  /**
   * Hook triggered before model is saved to db
   */

  saving: function (model, attrs, options) {
    this.attributes = this.pick(this.permittedFields())
  }
}, {
  ValidationError: Checkit.Error
})
