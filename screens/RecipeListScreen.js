// screens/RecipeListScreen.js
import React, { useEffect, useState } from 'react';
// import firebase from '../firebaseconfig'; // Adjust this path according to your Firebase config file's location

import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Collapsible from 'react-native-collapsible';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; // Example icon libraries
import { firebase, db } from '../firebaseconfig';
import { fetchMealPlan } from '../utils/index';


// const recipeData = {
//     Breakfast: [
//         {
//             id: '1',
//             name: 'Pancakes',
//             mainIngredients: 'Flour, Eggs, Milk',
//             // image: require('../assets/pancakes.jpg'),
//         },
//         {
//             id: '2',
//             name: 'Omelette',
//             mainIngredients: 'Eggs, Cheese, Ham',
//             // image: require('../assets/omelette.jpg'),
//         },
//     ],
//     Lunch: [
//         {
//             id: '1',
//             name: 'Chicken Caesar Salad',
//             mainIngredients: 'Chicken, Lettuce, Parmesan',
//             image: require('../assets/chicken-caesar-salad.jpg'),
//         },
//         // Add more lunch recipes as needed
//     ],
//     Dinner: [
//         {
//             id: '1',
//             name: 'Spaghetti Carbonara',
//             mainIngredients: 'Pasta, Eggs, Pancetta',
//             image: require('../assets/spaghetti-carbonara.jpg'),
//         },
//         // Add more dinner recipes as needed
//     ],
//     Snacks: [
//         // Add snack recipes here
//     ],
// };

const RecipeListScreen = ({ navigation }) => {
    const [collapsed, setCollapsed] = useState({
        Breakfast: true,
        Lunch: true,
        Dinner: true,
        Snacks: true,
    });


    const [userName, setUserName] = useState('');
    const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false); // Initialize this based on user's questionnaire completion
    const [mealPlan, setMealPlan] = useState([]);
    const [nutritionalDetails, setNutritionalDetails] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(async user => {
            if (user) {
                const name = user.displayName || "User"; // Fallback to "User" if name not set
                setUserName(name);
                try {
                    const doc = await db.collection('users').doc(user.uid).get();
                    if (doc.exists) {
                        const userInfo = doc.data();
                        setHasCompletedQuestionnaire(userInfo.questionnaireCompleted || false);
                        console.log("User data from Firebase:", userInfo);
                        setUserData(userInfo);
                    } else {
                        console.log("No user data found in Firestore");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        });

        // Clean up the subscription on component unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function loadMealPlan() {
            if (userData) {
                const result = await fetchMealPlan(userData);
                setMealPlan(result.mealPlan);
                setNutritionalDetails(result.nutritionalDetails);
            }
        }

        if (hasCompletedQuestionnaire) {
            loadMealPlan();
        }
    }, [hasCompletedQuestionnaire, userData]);


    const toggleCollapsed = (category) => {
        setCollapsed((prevState) => ({ ...prevState, [category]: !prevState[category] }));
    };

    const renderRecipeItem = (item) => (
        <TouchableOpacity key={item.name} style={styles.recipeItem} onPress={() => alert(`${item.name} tapped!`)}>
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.recipeImage} />
            ) : (
                <Image source={require('../assets/chicken-caesar-salad.jpg')} style={styles.recipeImage} />  // Default image
            )}
            <View style={styles.recipeTextContainer}>
                <Text style={styles.recipeTitle}>{item.name}</Text>
                <Text style={styles.recipeSubtitle}>
                    Calories: {item.calories} kcal, Protein: {item.protein} g, Fat: {item.fat} g, Carbs: {item.carbs} g
                </Text>
            </View>
        </TouchableOpacity>
    );


    const renderFoldableSection = (title, recipes) => (
        <>
            <TouchableOpacity onPress={() => toggleCollapsed(title)} style={styles.foldableHeader}>
                <Text style={styles.foldableTitle}>{title}</Text>
            </TouchableOpacity>
            <Collapsible collapsed={collapsed[title]}>
                {recipes.map(renderRecipeItem)}
            </Collapsible>
        </>
    );

    const handleLogout = () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: async () => {
                        await firebase.auth().signOut();
                        navigation.navigate('Login');  // Adjust to your login screen name
                    }
                }
            ]
        );
    };

    return (
        <LinearGradient colors={['#6dd5ed', '#2193b0']} style={styles.gradient}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <Text style={styles.headerText}>{userName}</Text>
                    <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
                            <Ionicons name="settings-outline" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconButton}>
                            <Ionicons name="home-outline" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Questionnaire')} style={styles.iconButton}>
                            <FontAwesome5 name="clipboard-check" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {/* Other function */ }} style={styles.iconButton}>
                            <FontAwesome5 name="ellipsis-v" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {hasCompletedQuestionnaire ? (
                    <ScrollView style={styles.foldablesContainer}>
                        {renderFoldableSection('Meal Plan', mealPlan)}
                        {nutritionalDetails && (
                            <View style={styles.nutritionalDetails}>
                                <Text style={styles.nutritionalTitle}>Nutritional Details</Text>
                                <Text>Calories: {nutritionalDetails.calories.min} - {nutritionalDetails.calories.max} kcal</Text>
                                <Text>Protein: {nutritionalDetails.macros.protein.min} - {nutritionalDetails.macros.protein.max} g</Text>
                                <Text>Fat: {nutritionalDetails.macros.fat.min} - {nutritionalDetails.macros.fat.max} g</Text>
                                <Text>Carbs: {nutritionalDetails.macros.carbs.min} - {nutritionalDetails.macros.carbs.max} g</Text>
                                <Text>Diet Labels: {nutritionalDetails.dietLabels.join(', ')}</Text>
                                <Text>Health Labels: {nutritionalDetails.healthLabels.join(', ')}</Text>
                                {Object.entries(nutritionalDetails.micronutrients).map(([key, value]) => (
                                    <Text key={key}>{key}: {value}</Text>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                ) : (
                    <View style={styles.centeredMessage}>
                        <Text>Please complete the questionnaire to view this content.</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.respinButton} onPress={() => {/* Future functionality */ }}>
                    <Text style={styles.respinButtonText}>Respin</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 10,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
    iconContainer: {
        flexDirection: 'row',
    },
    iconButton: {
        paddingHorizontal: 8, // Slightly more space between icons
    },
    foldablesContainer: {
        flex: 1,
    },
    foldableHeader: {
        padding: 10,
        backgroundColor: '#eaeaea',
    },
    foldableTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    respinButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 100,
        borderRadius: 25,
        backgroundColor: 'blue', // Choose your color
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },
    respinButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    centeredMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18, // Slightly larger for emphasis
        color: '#2193b0', // Consistent with the app's theme
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4, // Added space between title and subtitle
    },

    recipeItem: {
        flexDirection: 'row',
        padding: 10,
        marginVertical: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    recipeImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    recipeTextContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 10,
    },
    recipeTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#2193b0',
    },
    recipeSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    nutritionalDetails: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
        margin: 10,
    },
    nutritionalTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#2193b0',
        marginBottom: 10,
    },
});

export default RecipeListScreen;