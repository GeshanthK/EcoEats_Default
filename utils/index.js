const { generateMealPlan } = require('./temp_recipe_test');  // Adjust the path as necessary

// const userData = {
//     age: 30,
//     sex: 'male',
//     height: 175,
//     weight: 70,
//     desiredWeight: 75,
//     activityLevel: 'moderately_active',
//     weightGoal: 'gain',
//     speed: 'moderate',
//     personalGoal: 'Gain Muscle',
//     dietaryRestrictions: ['Vegan'],
//     budget: 500
// };

// generateMealPlan(userData)
//     .then(result => {
//         console.log('Generated Meal Plan:', result.mealPlan);
//         console.log('Nutritional Details:', result.nutritionalDetails);
//         console.log(result.mealPlan[0].image)
//     })
//     .catch(error => {
//         console.error('Error generating meal plan:', error);
//     });


// async function fetchMealPlan() {
//     try {
//         const result = await generateMealPlan(userData);
//         console.log('Nutritional Details:', result.nutritionalDetails);
//         console.log('Generated Meal Plan:', result.mealPlan);
//         return result;
//     } catch (error) {
//         console.error('Error generating meal plan:', error);
//         throw error;
//     }
// }

async function fetchMealPlan(userData) {
    try {
        const result = await generateMealPlan(userData);
        return result;
    } catch (error) {
        console.error('Error generating meal plan:', error);
        throw error;
    }
}

module.exports = { fetchMealPlan };