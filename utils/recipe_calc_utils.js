function calculateBmr(weight, height, age, gender) {
    if (!weight || !height || !age || (gender !== 'male' && gender !== 'female')) {
        throw new Error("Invalid input for calculating BMR");
    }
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

function calculateTdee(bmr, activityLevel) {
    const activityMultipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extra_active': 1.9  // Added an extra category
    };
    return bmr * (activityMultipliers[activityLevel] || 1.2);
}

function adjustCalories(tdee, weightGoal, speed, desiredWeight = null, currentWeight = null, weightChangeRate = 0.75) {
    const speedMultipliers = {
        'slow': 0.9,
        'moderate': 1.0,
        'fast': 1.1
    };

    if (desiredWeight !== null && currentWeight !== null) {
        const weightChange = desiredWeight - currentWeight;
        const timeframeWeeks = Math.abs(weightChange) / weightChangeRate;
        const caloriesPerDayChange = (weightChange * 7700) / (timeframeWeeks * 7);
        return tdee + caloriesPerDayChange * (speedMultipliers[speed] || 1.0);
    } else {
        const goals = {
            'lose': tdee - 500 * (speedMultipliers[speed] || 1.0),
            'maintain': tdee,
            'gain': tdee + 500 * (speedMultipliers[speed] || 1.0)
        };
        return goals[weightGoal] || tdee;
    }
}

function calculateMacros(calories, personalGoal, weight) {
    let proteinMin, proteinMax, fatPercentage;

    if (personalGoal === 'Gain Muscle') {
        proteinMin = 1.6 * weight;
        proteinMax = 2.2 * weight;
        fatPercentage = 0.25;
    } else if (personalGoal === 'Lose Fat') {
        proteinMin = 2.0 * weight;
        proteinMax = 2.2 * weight;
        fatPercentage = 0.30;
    } else {  // More Athletic or General
        proteinMin = 1.2 * weight;
        proteinMax = 1.6 * weight;
        fatPercentage = 0.30;
    }

    const proteinCaloriesMin = proteinMin * 4;
    const proteinCaloriesMax = proteinMax * 4;
    const fatCaloriesMin = calories * 0.20;
    const fatCaloriesMax = calories * fatPercentage;
    const carbsCaloriesMin = calories - proteinCaloriesMax - fatCaloriesMax;
    const carbsCaloriesMax = calories - proteinCaloriesMin - fatCaloriesMin;

    const proteinGramsMin = proteinMin;
    const proteinGramsMax = proteinMax;
    const fatGramsMin = fatCaloriesMin / 9;
    const fatGramsMax = fatCaloriesMax / 9;
    const carbsGramsMin = carbsCaloriesMin / 4;
    const carbsGramsMax = carbsCaloriesMax / 4;

    return {
        protein: [proteinGramsMin, proteinGramsMax],
        fat: [fatGramsMin, fatGramsMax],
        carbs: [carbsGramsMin, carbsGramsMax]
    };
}

function adjustForDietaryRestrictions(macros, restrictions) {
    const dietLabels = [];
    const healthLabels = [];

    const validDietLabels = ['balanced', 'high-fiber', 'high-protein', 'low-carb', 'low-fat', 'low-sodium'];
    const validHealthLabels = [
        'alcohol-free', 'celery-free', 'crustacean-free', 'dairy-free', 'DASH', 'egg-free', 'fish-free',
        'fodmap-free', 'gluten-free', 'immuno-supportive', 'keto-friendly', 'kidney-friendly', 'kosher',
        'low-potassium', 'low-sugar', 'lupine-free', 'mediterranean', 'mollusk-free', 'mustard-free',
        'no-oil-added', 'paleo', 'peanut-free', 'pescatarian', 'pork-free', 'red-meat-free', 'sesame-free',
        'shellfish-free', 'soy-free', 'sugar-conscious', 'sulfite-free', 'tree-nut-free', 'vegan', 'vegetarian',
        'wheat-free'
    ];

    for (const restriction of restrictions) {
        if (validDietLabels.includes(restriction.toLowerCase())) {
            dietLabels.push(restriction.toLowerCase());
        }
        if (validHealthLabels.includes(restriction.toLowerCase())) {
            healthLabels.push(restriction.toLowerCase());
        }
    }

    return {
        macros,
        dietLabels,
        healthLabels
    };
}

function recommendMicronutrients(activityLevel, personalGoal) {
    const baseMicronutrientNeeds = {
        'Vitamin A': [700, 900],
        'Vitamin C': [75, 90],
        'Vitamin D': [15, 20],
        'Vitamin E': [15, 20],
        'Vitamin K': [90, 120],
        'Calcium': [1000, 1300],
        'Iron': [8, 18],
        'Magnesium': [310, 420],
        'Potassium': [2600, 3400],
        'Zinc': [8, 11],
        'Vitamin B1': [1.1, 1.2],
        'Vitamin B2': [1.1, 1.3],
        'Vitamin B3': [14, 16],
        'Vitamin B5': [5, 6],
        'Vitamin B6': [1.3, 1.7],
        'Vitamin B12': [2.4, 2.8],
        'Biotin': [30, 35],
        'Choline': [425, 550],
        'Folate': [400, 600],
        'Selenium': [55, 70],
        'Copper': [900, 1000],
        'Iodine': [150, 200],
        'Manganese': [1.8, 2.3],
        'Phosphorus': [700, 1000],
        'Sodium': [1500, 2300]
    };

    if (activityLevel === 'moderately_active' || activityLevel === 'very_active') {
        baseMicronutrientNeeds['Vitamin C'] = [baseMicronutrientNeeds['Vitamin C'][0] + 30, baseMicronutrientNeeds['Vitamin C'][1] + 30];
        baseMicronutrientNeeds['Vitamin D'] = [baseMicronutrientNeeds['Vitamin D'][0] + 5, baseMicronutrientNeeds['Vitamin D'][1] + 5];
        baseMicronutrientNeeds['Magnesium'] = [baseMicronutrientNeeds['Magnesium'][0] + 50, baseMicronutrientNeeds['Magnesium'][1] + 50];
        baseMicronutrientNeeds['Potassium'] = [baseMicronutrientNeeds['Potassium'][0] + 200, baseMicronutrientNeeds['Potassium'][1] + 200];
    }

    const importantMicronutrients = {};
    for (const [key, value] of Object.entries(baseMicronutrientNeeds)) {
        if (['Vitamin C', 'Vitamin D', 'Calcium', 'Iron', 'Magnesium', 'Potassium'].includes(key)) {
            importantMicronutrients[key] = value;
        }
    }
    return importantMicronutrients;
}

function main(userData) {
    const bmr = calculateBmr(userData.weight, userData.height, userData.age, userData.sex);
    const tdee = calculateTdee(bmr, userData.activityLevel);
    const calories = adjustCalories(tdee, userData.weightGoal, userData.speed, userData.desiredWeight, userData.weight);
    const { protein, fat, carbs } = calculateMacros(calories, userData.personalGoal, userData.weight);
    const { macros: adjustedMacros, dietLabels, healthLabels } = adjustForDietaryRestrictions(protein, userData.dietaryRestrictions);
    const micronutrientRecommendations = recommendMicronutrients(userData.activityLevel, userData.personalGoal);

    const formattedMicronutrients = {};
    for (const [key, value] of Object.entries(micronutrientRecommendations)) {
        formattedMicronutrients[key] = `${value[0]}-${value[1]}`;
    }

    const userNutritionalRequirements = {
        calories: {
            min: calories - 100,
            max: calories + 100
        },
        macros: {
            protein: {
                min: protein[0],
                max: protein[1]
            },
            fat: {
                min: fat[0],
                max: fat[1]
            },
            carbs: {
                min: carbs[0],
                max: carbs[1]
            }
        },
        dietLabels: dietLabels,
        healthLabels: healthLabels,
        micronutrients: formattedMicronutrients
    };

    return userNutritionalRequirements;
}

module.exports = { main };