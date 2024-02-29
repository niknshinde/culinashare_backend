const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
    recipeName: { type: String, required: true },
    searchName: { type: String },

    preparationTime: Number,
    ingredients: [{
        name: { type: String, required: true },
        quantity: { type: String, required: true } // You can adjust type as needed
    }],
    recipeImage: { type: String }, // URL for recipe image
    youtubeLink: { type: String }, // Link to YouTube video
    details: { type: String }, // Detailed information about creating the recipe
    options: {
        type: [String], // Multiple options
        enum: ['starter', 'vegetarian', 'non vegetarian', 'dessert', 'quick recipes'] // Allowed options
    }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
