import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import User from "./UserModel.js";
import Book from "./BookModel.js";

const Review = db.define("review", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    references: {
        model: User,
        key: "email",
      },
      onDelete: "CASCADE",
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    references: {
        model: Book,
        key: "isbn",
      },
      onDelete: "CASCADE",
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  freezeTableName: true,
  timestamps: true,
});

User.hasMany(Review, { foreignKey: "email" });
Review.belongsTo(User, { foreignKey: "email" });

Book.hasMany(Review, { foreignKey: "isbn" });
Review.belongsTo(Book, { foreignKey: "isbn" });

db.sync().then(() => console.log("Database Review synced"));

export default Review;