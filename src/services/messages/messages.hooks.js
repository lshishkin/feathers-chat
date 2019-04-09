const { authenticate } = require('@feathersjs/authentication').hooks;
const { setNow, populate } = require('feathers-hooks-common');
const hooks = require('feathers-authentication-hooks');

const messagesSchema = {
    include: {
        service: 'users',
        nameAs: 'user',
        parentField: 'userId',
        childField: '_id'
    }
};

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [
        setNow('createdAt'),
        hooks.associateCurrentUser()],
    update: [
        hooks.restrictToOwner()
    ],
    patch: [
        hooks.restrictToOwner()
    ],
    remove: [
        hooks.restrictToOwner()
    ]
  },

  after: {
    all: [ populate({schema: messagesSchema}) ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};