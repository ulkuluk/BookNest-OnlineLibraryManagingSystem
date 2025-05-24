import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UserModel.js";
import Book from "./BookModel.js";

const { DataTypes } = Sequelize;

const Reservation = db.define(
  "reservation",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: "email",
      },
      onDelete: "CASCADE",
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Book,
        key: "isbn",
      },
      onDelete: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled", "returned"),
      defaultValue: "pending",
      allowNull: false,
    },
    reserved_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    returned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

// Relasi
User.hasMany(Reservation, { foreignKey: "email" });
Reservation.belongsTo(User, { foreignKey: "email" });

Book.hasMany(Reservation, { foreignKey: "isbn" });
Reservation.belongsTo(Book, { foreignKey: "isbn", targetKey: "isbn" });

db.sync().then(() => console.log("Database Reservation synced"));

export default Reservation;
