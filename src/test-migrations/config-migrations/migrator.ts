const Umzug = require("umzug")
import { join } from "path"
import { Sequelize } from "sequelize"

export const migrator = (
  sequelize: Sequelize
) => {
  return new Umzug({
    migrations: {
      path: join(__dirname, "../migrations"),
      params: [sequelize.getQueryInterface()],
      pattern: /\.ts$/,
    },
    storage: "sequelize",
    storageOptions: {
      sequelize: sequelize,
    },
    logger: console
  })
}