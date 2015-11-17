'use strict';

// Module dependencies.

var Checkit = require('checkit');

module.exports = function (bookshelf) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  return bookshelf.Model.extend({
    hasTimestamps: typeof options.timestamps === 'undefined' || options.timestamps,

    /**
     * Return fields that are allowed
     * to be stored in database.
     *
     * @return {Array}
     */

    permittedFields: function permittedFields() {
      var fields = [this.idAttribute].concat(Object.keys(this.fields));
      if (this.hasTimestamps) {
        fields = fields.concat(['created_at', 'updated_at']);
      }
      return fields;
    },

    /**
     * Return validation rules
     *
     * @return {Object}
     */

    validationRules: function validationRules() {
      var _this = this;

      var fields = this.fields;
      var check = { new: 'isNew', changed: 'hasChanged' };
      return Object.keys(fields).reduce(function (rules, field) {
        var validators = Array.isArray(fields[field].validate) ? fields[field].validate : [];
        rules[field] = validators.reduce(function (memo, validator) {
          var parts = validator.split('::');
          if (parts.length === 1 || check[parts[0]] && _this[check[parts[0]]](field)) {
            memo.push(parts[1] || parts[0]);
          }
          return memo;
        }, []);
        return rules;
      }, {});
    },

    /**
     * Initialize model
     */

    initialize: function initialize() {
      var _this2 = this;

      this.on('saving', function (model, attrs, options) {
        return Promise.resolve(_this2.saving(model, attrs, options)).then(function () {
          if (typeof options.validate === 'undefined' || options.validate) {
            return _this2.validate(model, attrs, options);
          }
        });
      });
    },

    /**
     * Validate model attributes
     *
     * @return {Promise}
     */

    validate: function validate() {
      return new Checkit(this.validationRules()).run(this.attributes, this);
    },

    /**
     * Hook triggered before model is saved to db
     */

    saving: function saving(model, attrs, options) {
      this.attributes = this.pick(this.permittedFields());
    }
  }, {
    ValidationError: Checkit.Error
  });
};
