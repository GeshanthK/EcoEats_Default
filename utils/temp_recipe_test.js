const { main: calculateNutritionalRequirements } = require('./recipe_calc_utils');  // Adjust the path as necessary

const appId = "f77ef723";
const appKey = "80f8ce81819bc02108f2ddf1f98a555a";

async function getRecipeData(query = "", limit = 100, dietLabels = [], healthLabels = [], mealTypes = [], perMealRequirements) {
    const fetch = (await import('node-fetch')).default;

    let url = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${appId}&app_key=${appKey}&q=${query}&field=label&field=calories&field=totalNutrients&field=yield&field=url`;

    if (dietLabels.length) {
        url += dietLabels.map(label => `&diet=${label}`).join('');
    }

    if (healthLabels.length) {
        url += healthLabels.map(label => `&health=${label}`).join('');
    }

    if (mealTypes.length) {
        url += mealTypes.map(meal => `&mealType=${meal}`).join('');
    }

    url += `&calories=${Math.round(perMealRequirements.calories[0])}-${Math.round(perMealRequirements.calories[1])}`;
    url += `&nutrients%5BPROCNT%5D=${Math.round(perMealRequirements.macros.protein[0])}-${Math.round(perMealRequirements.macros.protein[1])}`;
    url += `&nutrients%5BFAT%5D=${Math.round(perMealRequirements.macros.fat[0])}-${Math.round(perMealRequirements.macros.fat[1])}`;
    url += `&nutrients%5BCHOCDF%5D=${Math.round(perMealRequirements.macros.carbs[0])}-${Math.round(perMealRequirements.macros.carbs[1])}`;
    url += "&field=image"

    const response = await fetch(url);
    const data = await response.json();
    console.log(data)
    return data;
}

function isAboveMin(total, minValue) {
    return total >= minValue;
}

function isWithinRange(total, range) {
    return total >= range.min && total <= range.max;
}

function calculateDeviation(combo, micronutrientTargets) {
    const totalMicronutrients = Object.keys(micronutrientTargets).reduce((acc, key) => {
        acc[key] = combo.reduce((sum, recipe) => sum + (recipe[key.toLowerCase()] || 0), 0);
        return acc;
    }, {});

    const deviation = Object.keys(micronutrientTargets).reduce((sum, key) => {
        const targetRange = micronutrientTargets[key].split('-');
        const targetMid = (parseFloat(targetRange[0]) + parseFloat(targetRange[1])) / 2;
        return sum + Math.abs(totalMicronutrients[key] - targetMid);
    }, 0);

    return deviation;
}

async function generateCombinations(array, size) {
    const { combinations } = await import('simple-statistics');
    return Array.from(combinations(array, size));
}

async function findCombination(recipes, mealsPerDay, micronutrientTargets, userNutritionalRequirements) {
    const combos = await generateCombinations(recipes, mealsPerDay);
    let bestCombo = null;
    let lowestDeviation = Infinity;

    for (let combo of combos) {
        const totalCalories = combo.reduce((sum, recipe) => sum + recipe.calories, 0);
        const totalProtein = combo.reduce((sum, recipe) => sum + recipe.protein, 0);
        const totalFat = combo.reduce((sum, recipe) => sum + recipe.fat, 0);
        const totalCarbs = combo.reduce((sum, recipe) => sum + recipe.carbs, 0);

        if (isWithinRange(totalCalories, userNutritionalRequirements.calories) &&
            isWithinRange(totalProtein, userNutritionalRequirements.macros.protein) &&
            isWithinRange(totalFat, userNutritionalRequirements.macros.fat) &&
            isWithinRange(totalCarbs, userNutritionalRequirements.macros.carbs)) {

            const deviation = calculateDeviation(combo, micronutrientTargets);
            if (deviation < lowestDeviation) {
                bestCombo = combo;
                lowestDeviation = deviation;
            }
        }
    }

    if (!bestCombo) {
        for (let combo of combos) {
            const totalCalories = combo.reduce((sum, recipe) => sum + recipe.calories, 0);
            const totalProtein = combo.reduce((sum, recipe) => sum + recipe.protein, 0);
            const totalFat = combo.reduce((sum, recipe) => sum + recipe.fat, 0);
            const totalCarbs = combo.reduce((sum, recipe) => sum + recipe.carbs, 0);

            if (isAboveMin(totalCalories, userNutritionalRequirements.calories.min) &&
                isAboveMin(totalProtein, userNutritionalRequirements.macros.protein.min) &&
                isAboveMin(totalFat, userNutritionalRequirements.macros.fat.min) &&
                isAboveMin(totalCarbs, userNutritionalRequirements.macros.carbs.min)) {

                const deviation = calculateDeviation(combo, micronutrientTargets);
                if (deviation < lowestDeviation) {
                    bestCombo = combo;
                    lowestDeviation = deviation;
                }
            }
        }
    }

    if (!bestCombo) {
        for (let combo of combos) {
            const totalCalories = combo.reduce((sum, recipe) => sum + recipe.calories, 0);
            const totalProtein = combo.reduce((sum, recipe) => sum + recipe.protein, 0);
            const totalFat = combo.reduce((sum, recipe) => sum + recipe.fat, 0);
            const totalCarbs = combo.reduce((sum, recipe) => sum + recipe.carbs, 0);

            if (totalCalories <= userNutritionalRequirements.calories.max &&
                totalProtein <= userNutritionalRequirements.macros.protein.max &&
                totalFat <= userNutritionalRequirements.macros.fat.max &&
                totalCarbs <= userNutritionalRequirements.macros.carbs.max) {

                const deviation = calculateDeviation(combo, micronutrientTargets);
                if (deviation < lowestDeviation) {
                    bestCombo = combo;
                    lowestDeviation = deviation;
                }
            }
        }
    }

    return bestCombo;
}

async function generateMealPlan(userData) {
    const userNutritionalRequirements = calculateNutritionalRequirements(userData);
    const mealsPerDay = 3;
    const perMealRequirements = {
        calories: [userNutritionalRequirements.calories.min / mealsPerDay, userNutritionalRequirements.calories.max / mealsPerDay],
        macros: {
            protein: [userNutritionalRequirements.macros.protein.min / mealsPerDay, userNutritionalRequirements.macros.protein.max / mealsPerDay],
            fat: [userNutritionalRequirements.macros.fat.min / mealsPerDay, userNutritionalRequirements.macros.fat.max / mealsPerDay],
            carbs: [userNutritionalRequirements.macros.carbs.min / mealsPerDay, userNutritionalRequirements.macros.carbs.max / mealsPerDay]
        }
    };

    const recipeData = await getRecipeData("", 100, userNutritionalRequirements.dietLabels, userNutritionalRequirements.healthLabels, [], perMealRequirements);
    const allRecipes = [];

    if (recipeData.hits) {
        recipeData.hits.forEach(hit => {
            const recipeInfo = hit.recipe;
            allRecipes.push({
                name: recipeInfo.label,
                calories: recipeInfo.calories / recipeInfo.yield,
                protein: (recipeInfo.totalNutrients.PROCNT ? recipeInfo.totalNutrients.PROCNT.quantity : 0) / recipeInfo.yield,
                fat: (recipeInfo.totalNutrients.FAT ? recipeInfo.totalNutrients.FAT.quantity : 0) / recipeInfo.yield,
                carbs: (recipeInfo.totalNutrients.CHOCDF ? recipeInfo.totalNutrients.CHOCDF.quantity : 0) / recipeInfo.yield,
                vitamin_c: (recipeInfo.totalNutrients.VITC ? recipeInfo.totalNutrients.VITC.quantity : 0) / recipeInfo.yield,
                vitamin_d: (recipeInfo.totalNutrients.VITD ? recipeInfo.totalNutrients.VITD.quantity : 0) / recipeInfo.yield,
                calcium: (recipeInfo.totalNutrients.CA ? recipeInfo.totalNutrients.CA.quantity : 0) / recipeInfo.yield,
                iron: (recipeInfo.totalNutrients.FE ? recipeInfo.totalNutrients.FE.quantity : 0) / recipeInfo.yield,
                yield: recipeInfo.yield,
                url: recipeInfo.url,
                image: recipeInfo.image
            });
        });
    }

    const validCombo = await findCombination(allRecipes, mealsPerDay, userNutritionalRequirements.micronutrients, userNutritionalRequirements);

    if (validCombo) {
        const mealPlan = validCombo.map(recipe => ({
            name: recipe.name,
            calories: recipe.calories.toFixed(2),
            protein: recipe.protein.toFixed(2),
            fat: recipe.fat.toFixed(2),
            carbs: recipe.carbs.toFixed(2),
            vitamin_c: recipe.vitamin_c > 0 ? recipe.vitamin_c.toFixed(2) : null,
            vitamin_d: recipe.vitamin_d > 0 ? recipe.vitamin_d.toFixed(2) : null,
            calcium: recipe.calcium.toFixed(2),
            iron: recipe.iron.toFixed(2),
            url: recipe.url,
            image: recipe.image
        }));

        return {
            mealPlan,
            nutritionalDetails: {
                calories: userNutritionalRequirements.calories,
                macros: userNutritionalRequirements.macros,
                dietLabels: userNutritionalRequirements.dietLabels,
                healthLabels: userNutritionalRequirements.healthLabels,
                micronutrients: userNutritionalRequirements.micronutrients
            }
        };
    } else {
        throw new Error("No valid combination of recipes found.");
    }
}

module.exports = { generateMealPlan };
