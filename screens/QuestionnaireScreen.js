import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { firebase, db } from '../firebaseconfig'; // Ensure the path is correct
import { Picker } from '@react-native-picker/picker';

const dietOptions = [
    "None", "balanced", "high-fiber", "high-protein", "low-carb", "low-fat", "low-sodium"
];

const healthOptions = [
    "None", "alcohol-free", "crustacean-free", "dairy-free", "egg-free", "fish-free", "gluten-free",
    "immuno-supportive", "keto-friendly", "kidney-friendly", "kosher", "low-potassium", "low-sugar",
    "no-oil-added", "paleo", "peanut-free", "pescatarian", "pork-free", "red-meat-free", "sesame-free",
    "shellfish-free", "soy-free", "sugar-conscious", "vegan", "vegetarian", "wheat-free"
];

const sexOptions = ["Male", "Female"];
const activityLevelOptions = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"];
const personalGoalOptions = ["Gain Muscle", "Manage Stress", "More Athletic", "Eating Healthier", "Lose Fat"];
const speedOptions = ["Slow", "Moderate", "Fast"];

const Checkbox = ({ label, selected, onSelect }) => (
    <TouchableOpacity onPress={onSelect} style={styles.checkboxContainer}>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && <Text style={styles.checkboxTick}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
);

const QuestionnaireScreen = ({ navigation }) => {
    const [age, setAge] = useState('');
    const [sex, setSex] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [desiredWeight, setDesiredWeight] = useState('');
    const [activityLevel, setActivityLevel] = useState('');
    const [weightGoal, setWeightGoal] = useState('');
    const [personalGoal, setPersonalGoal] = useState('');
    const [speed, setSpeed] = useState('');
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [healthRestrictions, setHealthRestrictions] = useState([]);
    const [budget, setBudget] = useState('');

    useEffect(() => {
        const user = firebase.auth().currentUser;
        if (user) {
            const unsubscribe = db.collection('users').doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setAge(data.age || '');
                    setSex(data.sex || '');
                    setHeight(data.height || '');
                    setWeight(data.weight || '');
                    setDesiredWeight(data.desiredWeight || '');
                    setActivityLevel(data.activityLevel || '');
                    setWeightGoal(data.weightGoal || '');
                    setPersonalGoal(data.personalGoal || '');
                    setSpeed(data.speed || '');
                    setDietaryRestrictions(data.dietaryRestrictions || []);
                    setHealthRestrictions(data.healthRestrictions || []);
                    setBudget(data.budget || '');
                }
            }, error => {
                console.log("Error fetching data: ", error);
            });
            return () => unsubscribe(); // Clean up the listener
        }
    }, []);

    const handleCheckboxChange = (option, type) => {
        if (type === 'diet') {
            if (dietaryRestrictions.includes(option)) {
                setDietaryRestrictions(dietaryRestrictions.filter(item => item !== option));
            } else {
                setDietaryRestrictions([...dietaryRestrictions, option]);
            }
        } else if (type === 'health') {
            if (healthRestrictions.includes(option)) {
                setHealthRestrictions(healthRestrictions.filter(item => item !== option));
            } else {
                setHealthRestrictions([...healthRestrictions, option]);
            }
        }
    };

    const handleSubmit = async () => {
        if (age && sex && height && weight && desiredWeight && activityLevel && weightGoal && personalGoal && budget) {
            // All required fields are filled
            const user = firebase.auth().currentUser;
            if (user) {
                try {
                    await db.collection('users').doc(user.uid).set({
                        age: age,
                        sex: sex,
                        height: height,
                        weight: weight,
                        desiredWeight: desiredWeight,
                        activityLevel: activityLevel,
                        weightGoal: weightGoal,
                        personalGoal: personalGoal,
                        speed: speed,
                        dietaryRestrictions: dietaryRestrictions, // Updated
                        healthRestrictions: healthRestrictions, // Updated
                        budget: budget,
                        questionnaireCompleted: true // Marking the questionnaire as complete
                    }, { merge: true });
                    navigation.navigate('Recipes');
                } catch (error) {
                    console.error("Error updating user data: ", error);
                }
            } else {
                console.log("User not logged in");
                // Handle user not logged in
            }
        } else {
            // Not all fields are filled
            Alert.alert("Missing Information", "Please fill in all required fields except dietary restrictions.");
        }
    };

    return (
        <LinearGradient
            colors={['#6dd5ed', '#2193b0']}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <TextInput
                    placeholder="Age"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                    style={styles.input}
                />
                <Text style={styles.label}>Sex</Text>
                <Picker
                    selectedValue={sex}
                    onValueChange={(itemValue) => setSex(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Sex" value="" />
                    {sexOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option.toLowerCase()} />
                    ))}
                </Picker>
                <TextInput
                    placeholder="Height (cm)"
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Weight (kg)"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Desired Weight (kg)"
                    keyboardType="numeric"
                    value={desiredWeight}
                    onChangeText={setDesiredWeight}
                    style={styles.input}
                />

                <Text style={styles.sectionTitle}>Health & Fitness Goals</Text>
                <Text style={styles.label}>Activity Level</Text>
                <Picker
                    selectedValue={activityLevel}
                    onValueChange={(itemValue) => setActivityLevel(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Activity Level" value="" />
                    {activityLevelOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option.toLowerCase().replace(' ', '_')} />
                    ))}
                </Picker>

                <TextInput
                    placeholder="Weight Goal"
                    value={weightGoal}
                    onChangeText={setWeightGoal}
                    style={styles.input}
                />

                <Picker
                    selectedValue={speed}
                    onValueChange={(itemValue) => setSpeed(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Rate of Weight Gain/Loss" value="" />
                    {speedOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option.toLowerCase()} />
                    ))}
                </Picker>

                <Text style={styles.label}>Personal Goal</Text>
                <Picker
                    selectedValue={personalGoal}
                    onValueChange={(itemValue) => setPersonalGoal(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Personal Goal" value="" />
                    {personalGoalOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                    ))}
                </Picker>

                <Text style={styles.sectionTitle}>Dietary Preferences</Text>
                <Text style={styles.subSectionTitle}>Diet</Text>
                {dietOptions.map(option => (
                    <Checkbox
                        key={option}
                        label={option}
                        selected={dietaryRestrictions.includes(option)}
                        onSelect={() => handleCheckboxChange(option, 'diet')}
                    />
                ))}

                <Text style={styles.subSectionTitle}>Health</Text>
                {healthOptions.map(option => (
                    <Checkbox
                        key={option}
                        label={option}
                        selected={healthRestrictions.includes(option)}
                        onSelect={() => handleCheckboxChange(option, 'health')}
                    />
                ))}

                <Text style={styles.sectionTitle}>Budget</Text>
                <TextInput
                    placeholder="Budget per Month"
                    keyboardType="numeric"
                    value={budget}
                    onChangeText={setBudget}
                    style={styles.input}
                />

                <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        padding: 20,
        marginTop: 30, // Added top margin
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 20,
        marginBottom: 10,
    },
    subSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 10,
        marginBottom: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 10,
        marginBottom: 5,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    picker: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 20,
        borderRadius: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#2193b0',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#2193b0',
    },
    checkboxTick: {
        color: 'white',
    },
    checkboxLabel: {
        fontSize: 16,
        color: 'white',
    },
    submitButton: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    submitButtonText: {
        color: '#2193b0',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default QuestionnaireScreen;
