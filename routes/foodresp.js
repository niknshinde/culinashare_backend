const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const User = require("../models/Users");
const Recipe = require("../models/Recipe");
const { route } = require("./auth");
const router = express.Router();

function convertToLowerCaseAndRemoveSpaces(inputString) {
    // Convert string to lowercase
    let lowercaseString = inputString.toLowerCase();
    
    // Remove spaces from the lowercase string
    let stringWithoutSpaces = lowercaseString.replace(/\s/g, '');
    
    return stringWithoutSpaces;
}

router.post('/create', fetchuser, async (req, res) => {
    try {
        const { recipeName, preparationTime, ingredients, recipeImage, youtubeLink, details, options } = req.body;

        // Create new recipe object
        var searchName = convertToLowerCaseAndRemoveSpaces(recipeName);

        const recipe = new Recipe({
            recipeName,
            searchName,
            preparationTime,
            ingredients,
            recipeImage,
            youtubeLink,
            details,
            options
        });

        // Save recipe to database
        const savedRecipe = await recipe.save();

        // Add created recipe ID to user's createdRecipes array
        const user = await User.findById(req.user.id);
        user.createdRecipes.push(savedRecipe._id);
        await user.save();

        res.json(savedRecipe);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.post('/search-recipe', async (req, res) => {
    try {
        const recipeName = req.body.name;
        var searchName = convertToLowerCaseAndRemoveSpaces(recipeName);

        console.log(searchName);
        // Check if the name parameter is provided
        if (!searchName) {
            return res.status(400).json({ msg: 'Recipe name parameter is required' });
        }

        // Search for recipes by name
        const recipes = await Recipe.find({ searchName: { $regex: new RegExp(searchName, 'i') } });

        // Check if any recipes were found
        if (recipes.length === 0) {
            return res.status(404).json({ msg: 'No recipes found with that name' });
        }

        res.json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


router.get('/user-created', fetchuser, async (req, res) => {
    try {
        // Find the user based on the authenticated user's ID
        const user = await User.findById(req.user.id).populate('createdRecipes');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Extract user's created recipes
        const createdRecipes = user.createdRecipes;

        res.json(createdRecipes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/random-recipes', async (req, res) => {
    try {
        // Get 10 random recipes
        const recipes = await Recipe.aggregate([{ $sample: { size: 10 } }]);

        // Check if any recipes were found
        if (recipes.length === 0) {
            return res.status(404).json({ msg: 'No recipes found' });
        }

        res.json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});



router.get('/user-bookmarks', fetchuser, async (req, res) => {
    try {
        // Find the user based on the authenticated user's ID
        const user = await User.findById(req.user.id).populate('bookmarks');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Extract user's created recipes
        const bookmarks = user.bookmarks;

        res.json(bookmarks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


router.post('/user-bookmarks/:recipeId', fetchuser, async (req, res) => {
    try {
        // Find the user based on the authenticated user's ID
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if the recipe ID provided is valid
        const recipe = await Recipe.findById(req.params.recipeId);
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        // Check if the recipe is already bookmarked by the user
        if (user.bookmarks.includes(req.params.recipeId)) {
            return res.status(400).json({ msg: 'Recipe already bookmarked' });
        }

        // Add the recipe ID to the user's bookmarks array
        user.bookmarks.push(req.params.recipeId);
        await user.save();

        res.json({ msg: 'Recipe bookmarked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


router.delete('/delete-user-bookmarks/:bookmarkId', fetchuser, async (req, res) => {
    try {
        // Find the user based on the authenticated user's ID
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if the bookmark ID provided is valid
        const bookmarkIndex = user.bookmarks.indexOf(req.params.bookmarkId);
        if (bookmarkIndex === -1) {
            return res.status(404).json({ msg: 'Bookmark not found' });
        }

        // Remove the bookmark ID from the user's bookmarks array
        user.bookmarks.splice(bookmarkIndex, 1);
        await user.save();

        res.json({ msg: 'Bookmark deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.post('/detailedrecipe/:recipeId', fetchuser, async (req, res) => {
    try {
        // Find the user based on the authenticated user's ID
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if the recipe ID provided is valid
        const recipe = await Recipe.findById(req.params.recipeId);
        if (!recipe) {
            return res.status(404).json({ msg: 'Recipe not found' });
        }

        // Check if the recipe is already bookmarked by the user

        // Fetch detailed information about the recipe
        const detailedRecipe = await Recipe.findById(req.params.recipeId);
        var bookmarkStatus = false;
        if (user.bookmarks.includes(req.params.recipeId)) {
            bookmarkStatus = true;
        }
        res.json({ 
            isBookmark: bookmarkStatus,
            recipe: detailedRecipe  // Send detailed recipe information
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


router.post('/search-recipe-base-options', async (req, res) => {
    try {
        let options = req.body.options; // Assuming options are sent in the request body
        console.log(options);
       

        // Search for recipes based on options
        const recipes = await Recipe.find({ options: { $in: options } });

        // Check if any recipes were found
        if (recipes.length === 0) {
            return res.status(404).json({ msg: 'No recipes found with the provided options' });
        }

        res.json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});





module.exports = router;
