import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const Book = db.define("book", {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  cover_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_copies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  available_copies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  freezeTableName: true,
  timestamps: true,
});

db.sync().then(() => console.log("Database Buku synced"));

export default Book;
