import requests
from itertools import combinations
from recipe_calc_utils import main as calculate_nutritional_requirements

# Replace with your actual API credentials
app_id = "f77ef723"
app_key = "80f8ce81819bc02108f2ddf1f98a555a"

# Example user data derived from questionnaire inputs
user_data = {
    'age': 30,
    'sex': 'male',
    'height': 175,
    'weight': 70,
    'desired_weight': 75,
    'activity_level': 'moderately_active',
    'weight_goal': 'gain',
    'speed': 'moderate',  # Added speed input
    'personal_goal': 'Gain Muscle',
    'dietary_restrictions': ['Vegan'],
    'budget': 500  # Assuming this is just for collection, not used in algorithm
}

# Calculate user nutritional requirements
user_nutritional_requirements = calculate_nutritional_requirements(user_data)
print(user_nutritional_requirements)

# Number of meals per day
meals_per_day = 3

# Calculate per-meal requirements
per_meal_requirements = {
    'calories': (user_nutritional_requirements['calories']['min'] / meals_per_day, user_nutritional_requirements['calories']['max'] / meals_per_day),
    'macros': {
        'protein': (user_nutritional_requirements['macros']['protein']['min'] / meals_per_day, user_nutritional_requirements['macros']['protein']['max'] / meals_per_day),
        'fat': (user_nutritional_requirements['macros']['fat']['min'] / meals_per_day, user_nutritional_requirements['macros']['fat']['max'] / meals_per_day),
        'carbs': (user_nutritional_requirements['macros']['carbs']['min'] / meals_per_day, user_nutritional_requirements['macros']['carbs']['max'] / meals_per_day)
    }
}

def get_recipe_data(query="", limit=100, diet_labels=[], health_labels=[], meal_types=[]):
    url = f"https://api.edamam.com/api/recipes/v2?type=public&app_id={app_id}&app_key={app_key}&q={query}&field=label&field=calories&field=totalNutrients&field=yield&field=url"

    if diet_labels:
        url += ''.join([f"&diet={label}" for label in diet_labels])

    if health_labels:
        url += ''.join([f"&health={label}" for label in health_labels])

    if meal_types:
        url += ''.join([f"&mealType={meal}" for meal in meal_types])
  
    # Add per-meal macros and calories to the URL parameters
    url += f"&calories={int(per_meal_requirements['calories'][0])}-{int(per_meal_requirements['calories'][1])}"
    url += f"&nutrients%5BPROCNT%5D={int(per_meal_requirements['macros']['protein'][0])}-{int(per_meal_requirements['macros']['protein'][1])}"
    url += f"&nutrients%5BFAT%5D={int(per_meal_requirements['macros']['fat'][0])}-{int(per_meal_requirements['macros']['fat'][1])}"
    url += f"&nutrients%5BCHOCDF%5D={int(per_meal_requirements['macros']['carbs'][0])}-{int(per_meal_requirements['macros']['carbs'][1])}"

    response = requests.get(url)
    return response.json()

def is_above_min(total, min_value):
    return total >= min_value

def is_within_range(total, range_dict):
    return range_dict['min'] <= total <= range_dict['max']

def calculate_deviation(combo, micronutrient_targets):
    total_micronutrients = {
        key: sum(recipe.get(key.lower(), 0) for recipe in combo) for key in micronutrient_targets
    }
    deviation = sum(
        abs(total_micronutrients[key] - (float(target_range.split('-')[0]) + float(target_range.split('-')[1])) / 2)
        for key, target_range in micronutrient_targets.items()
    )
    return deviation


def find_combination(recipes, meals_per_day, micronutrient_targets):
    best_combo = None
    lowest_deviation = float('inf')

    # Try to find a combination within the range
    for combo in combinations(recipes, meals_per_day):
        total_calories = sum(recipe['calories'] for recipe in combo)
        total_protein = sum(recipe['protein'] for recipe in combo)
        total_fat = sum(recipe['fat'] for recipe in combo)
        total_carbs = sum(recipe['carbs'] for recipe in combo)

        if (is_within_range(total_calories, user_nutritional_requirements['calories']) and
            is_within_range(total_protein, user_nutritional_requirements['macros']['protein']) and
            is_within_range(total_fat, user_nutritional_requirements['macros']['fat']) and
            is_within_range(total_carbs, user_nutritional_requirements['macros']['carbs'])):

            deviation = calculate_deviation(combo, micronutrient_targets)
            if deviation < lowest_deviation:
                best_combo = combo
                lowest_deviation = deviation

    # If no combination was found within the range, try to find a combination that meets at least the minimum requirements
    if best_combo is None:
        for combo in combinations(recipes, meals_per_day):
            total_calories = sum(recipe['calories'] for recipe in combo)
            total_protein = sum(recipe['protein'] for recipe in combo)
            total_fat = sum(recipe['fat'] for recipe in combo)
            total_carbs = sum(recipe['carbs'] for recipe in combo)

            if (total_calories >= user_nutritional_requirements['calories'][0] and
                total_protein >= user_nutritional_requirements['macros']['protein'][0] and
                total_fat >= user_nutritional_requirements['macros']['fat'][0] and
                total_carbs >= user_nutritional_requirements['macros']['carbs'][0]):

                deviation = calculate_deviation(combo, micronutrient_targets)
                if deviation < lowest_deviation:
                    best_combo = combo
                    lowest_deviation = deviation

    # If no combination was found that meets at least the minimum requirements, try to find a combination that meets at most the maximum requirements
    if best_combo is None:
        for combo in combinations(recipes, meals_per_day):
            total_calories = sum(recipe['calories'] for recipe in combo)
            total_protein = sum(recipe['protein'] for recipe in combo)
            total_fat = sum(recipe['fat'] for recipe in combo)
            total_carbs = sum(recipe['carbs'] for recipe in combo)

            if (total_calories <= user_nutritional_requirements['calories'][1] and
                total_protein <= user_nutritional_requirements['macros']['protein'][1] and
                total_fat <= user_nutritional_requirements['macros']['fat'][1] and
                total_carbs <= user_nutritional_requirements['macros']['carbs'][1]):

                deviation = calculate_deviation(combo, micronutrient_targets)
                if deviation < lowest_deviation:
                    best_combo = combo
                    lowest_deviation = deviation

    return best_combo

# Fetch a larger set of recipes to increase the chances of finding a valid combination
recipe_data = get_recipe_data(limit=100, diet_labels=user_nutritional_requirements['diet_labels'], health_labels=user_nutritional_requirements['health_labels'])
all_recipes = []

if 'hits' in recipe_data:
    for recipe in recipe_data['hits']:
        recipe_info = recipe['recipe']
        all_recipes.append({
            'name': recipe_info['label'],
            'calories': recipe_info['calories'] / recipe_info['yield'],
            'protein': recipe_info['totalNutrients'].get('PROCNT', {}).get('quantity', 0) / recipe_info['yield'],
            'fat': recipe_info['totalNutrients'].get('FAT', {}).get('quantity', 0) / recipe_info['yield'],
            'carbs': recipe_info['totalNutrients'].get('CHOCDF', {}).get('quantity', 0) / recipe_info['yield'],
            'vitamin_c': recipe_info['totalNutrients'].get('VITC', {}).get('quantity', 0) / recipe_info['yield'],
            'vitamin_d': recipe_info['totalNutrients'].get('VITD', {}).get('quantity', 0) / recipe_info['yield'],
            'calcium': recipe_info['totalNutrients'].get('CA', {}).get('quantity', 0) / recipe_info['yield'],
            'iron': recipe_info['totalNutrients'].get('FE', {}).get('quantity', 0) / recipe_info['yield'],
            'yield': recipe_info['yield'],
            'url': recipe_info['url']
        })


valid_combo = find_combination(all_recipes, meals_per_day, user_nutritional_requirements['micronutrients'])

if valid_combo:
    for recipe in valid_combo:
        print(f"Recipe Name: {recipe['name']}")
        print(f"Calories: {recipe['calories']:.2f} kcal per serving")
        print(f"Protein: {recipe['protein']:.2f} g per serving")
        print(f"Fat: {recipe['fat']:.2f} g per serving")
        print(f"Carbohydrates: {recipe['carbs']:.2f} g per serving")
        if recipe['vitamin_c'] > 0:
            print(f"Vitamin C: {recipe['vitamin_c']:.2f} mg per serving")
        if recipe['vitamin_d'] > 0:
            print(f"Vitamin D: {recipe['vitamin_d']:.2f} µg per serving")
        print(f"Calcium: {recipe['calcium']:.2f} mg per serving")
        print(f"Iron: {recipe['iron']:.2f} mg per serving")
        print(f"URL: {recipe['url']}")
        print("\n")
else:
    print("No valid combination of recipes found.")