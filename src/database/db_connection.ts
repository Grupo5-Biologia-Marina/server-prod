import fs from "fs";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      ca: fs.readFileSync("./certs/tidb-ca.pem"),
      rejectUnauthorized: true,
    },
  },
  define: { timestamps: true, underscored: false },
  logging: false,
});

export default sequelize;
