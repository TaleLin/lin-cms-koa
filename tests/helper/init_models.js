const { db } = require('lin-mizar/lin/db');
// eslint-disable-next-line no-unused-vars
const { User, Group, Auth } = require('lin-mizar/lin');
const {
  UserInterface,
  GroupInterface,
  AuthInterface
} = require('lin-mizar/lin/interface');
const lodash = require('lodash');

const initModels = async () => {
  User.init(
    Object.assign({}, UserInterface.attributes),
    lodash.merge(
      {
        sequelize: db,
        tableName: 'lin_user',
        modelName: 'user'
      },
      UserInterface.options
    )
  );

  Group.init(
    Object.assign({}, GroupInterface.attributes),
    lodash.merge(
      {
        sequelize: db,
        tableName: 'lin_group',
        modelName: 'group'
      },
      GroupInterface.options
    )
  );

  Auth.init(
    Object.assign({}, AuthInterface.attributes),
    lodash.merge(
      {
        sequelize: db,
        tableName: 'lin_auth',
        modelName: 'auth'
      },
      AuthInterface.options
    )
  );
};

module.exports = { initModels };
