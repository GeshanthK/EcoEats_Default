def calculate_bmr(weight, height, age, gender):
    if not weight or not height or not age or gender not in ['male', 'female']:
        raise ValueError("Invalid input for calculating BMR")
    if gender == 'male':
        return 10 * weight + 6.25 * height - 5 * age + 5
    elif gender == 'female':
        return 10 * weight + 6.25 * height - 5 * age - 161

def calculate_tdee(bmr, activity_level):
    activity_multipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extra_active': 1.9  # Added an extra category
    }
    return bmr * activity_multipliers.get(activity_level, 1.2)

def adjust_calories(tdee, weight_goal, speed, desired_weight=None, current_weight=None, weight_change_rate=0.75):
    speed_multipliers = {
        'slow': 0.9,
        'moderate': 1.0,
        'fast': 1.1
    }
    
    if desired_weight is not None and current_weight is not None:
        weight_change = desired_weight - current_weight
        timeframe_weeks = abs(weight_change) / weight_change_rate
        calories_per_day_change = (weight_change * 7700) / (timeframe_weeks * 7)
        return tdee + calories_per_day_change * speed_multipliers.get(speed, 1.0)
    else:
        goals = {
            'lose': tdee - 500 * speed_multipliers.get(speed, 1.0),
            'maintain': tdee,
            'gain': tdee + 500 * speed_multipliers.get(speed, 1.0)
        }
        return goals.get(weight_goal, tdee)

def calculate_macros(calories, personal_goal, weight):
    if personal_goal == 'Gain Muscle':
        protein_min = 1.6 * weight
        protein_max = 2.2 * weight
        fat_percentage = 0.25
    elif personal_goal == 'Lose Fat':
        protein_min = 2.0 * weight
        protein_max = 2.2 * weight
        fat_percentage = 0.30
    else:  # More Athletic or General
        protein_min = 1.2 * weight
        protein_max = 1.6 * weight
        fat_percentage = 0.30

    protein_calories_min = protein_min * 4
    protein_calories_max = protein_max * 4
    fat_calories_min = calories * 0.20
    fat_calories_max = calories * fat_percentage
    carbs_calories_min = calories - protein_calories_max - fat_calories_max
    carbs_calories_max = calories - protein_calories_min - fat_calories_min
    
    protein_grams_min = protein_min
    protein_grams_max = protein_max
    fat_grams_min = fat_calories_min / 9
    fat_grams_max = fat_calories_max / 9
    carbs_grams_min = carbs_calories_min / 4
    carbs_grams_max = carbs_calories_max / 4
    
    return (protein_grams_min, protein_grams_max), (fat_grams_min, fat_grams_max), (carbs_grams_min, carbs_grams_max)

def adjust_for_dietary_restrictions(macros, restrictions):
    diet_labels = []
    health_labels = []
    
    valid_diet_labels = ['balanced', 'high-fiber', 'high-protein', 'low-carb', 'low-fat', 'low-sodium']
    valid_health_labels = [
        'alcohol-free', 'celery-free', 'crustacean-free', 'dairy-free', 'DASH', 'egg-free', 'fish-free', 
        'fodmap-free', 'gluten-free', 'immuno-supportive', 'keto-friendly', 'kidney-friendly', 'kosher', 
        'low-potassium', 'low-sugar', 'lupine-free', 'mediterranean', 'mollusk-free', 'mustard-free', 
        'no-oil-added', 'paleo', 'peanut-free', 'pescatarian', 'pork-free', 'red-meat-free', 'sesame-free', 
        'shellfish-free', 'soy-free', 'sugar-conscious', 'sulfite-free', 'tree-nut-free', 'vegan', 'vegetarian', 
        'wheat-free'
    ]
    
    for restriction in restrictions:
        if restriction.lower() in valid_diet_labels:
            diet_labels.append(restriction.lower())
        if restriction.lower() in valid_health_labels:
            health_labels.append(restriction.lower())
    
    return macros, diet_labels, health_labels

def recommend_micronutrients(activity_level, personal_goal):
    base_micronutrient_needs = {
        'Vitamin A': (700, 900),
        'Vitamin C': (75, 90),
        'Vitamin D': (15, 20),
        'Vitamin E': (15, 20),
        'Vitamin K': (90, 120),
        'Calcium': (1000, 1300),
        'Iron': (8, 18),
        'Magnesium': (310, 420),
        'Potassium': (2600, 3400),
        'Zinc': (8, 11),
        'Vitamin B1': (1.1, 1.2),
        'Vitamin B2': (1.1, 1.3),
        'Vitamin B3': (14, 16),
        'Vitamin B5': (5, 6),
        'Vitamin B6': (1.3, 1.7),
        'Vitamin B12': (2.4, 2.8),
        'Biotin': (30, 35),
        'Choline': (425, 550),
        'Folate': (400, 600),
        'Selenium': (55, 70),
        'Copper': (900, 1000),
        'Iodine': (150, 200),
        'Manganese': (1.8, 2.3),
        'Phosphorus': (700, 1000),
        'Sodium': (1500, 2300)
    }

    if activity_level in ['moderately_active', 'very_active']:
        base_micronutrient_needs['Vitamin C'] = (base_micronutrient_needs['Vitamin C'][0] + 30, base_micronutrient_needs['Vitamin C'][1] + 30)
        base_micronutrient_needs['Vitamin D'] = (base_micronutrient_needs['Vitamin D'][0] + 5, base_micronutrient_needs['Vitamin D'][1] + 5)
        base_micronutrient_needs['Magnesium'] = (base_micronutrient_needs['Magnesium'][0] + 50, base_micronutrient_needs['Magnesium'][1] + 50)
        base_micronutrient_needs['Potassium'] = (base_micronutrient_needs['Potassium'][0] + 200, base_micronutrient_needs['Potassium'][1] + 200)

    important_micronutrients = {k: v for k, v in base_micronutrient_needs.items() if k in ['Vitamin C', 'Vitamin D', 'Calcium', 'Iron']}
    return important_micronutrients

def main(user_data):
    bmr = calculate_bmr(user_data['weight'], user_data['height'], user_data['age'], user_data['sex'])
    tdee = calculate_tdee(bmr, user_data['activity_level'])
    calories = adjust_calories(tdee, user_data['weight_goal'], user_data['speed'], user_data.get('desired_weight'), user_data.get('weight'))
    protein, fat, carbs = calculate_macros(calories, user_data['personal_goal'], user_data['weight'])
    adjusted_macros, diet_labels, health_labels = adjust_for_dietary_restrictions(protein, user_data['dietary_restrictions'])
    micronutrient_recommendations = recommend_micronutrients(user_data['activity_level'], user_data['personal_goal'])
    
    formatted_micronutrients = {k: f"{v[0]}-{v[1]}" for k, v in micronutrient_recommendations.items()}
    
    user_nutritional_requirements = {
        'calories': {
                'min': calories-100,
                'max': calories+100
            },
        'macros': {
            'protein': {
                'min': protein[0],
                'max': protein[1]
            },
            'fat': {
                'min': fat[0],
                'max': fat[1]
            },
            'carbs': {
                'min': carbs[0],
                'max': carbs[1]
            }
        },
        'diet_labels': diet_labels,
        'health_labels': health_labels,
        'micronutrients': formatted_micronutrients
    }
    
    return user_nutritional_requirements
