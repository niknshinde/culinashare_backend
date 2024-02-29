const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }], // Array of bookmarked recipe IDs
    createdRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }] // Array of created recipe IDs
});

const User = mongoose.model("User", userSchema);

module.exports = User;
