// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Button, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
// Add this import to your SignUpScreen and LoginScreen
import Constants from 'expo-constants';
// import firebase from '../firebaseconfig';
import { firebase, db } from '../firebaseconfig'; // Ensure this import is correct
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { MaterialIcons } from '@expo/vector-icons';

// Initialize the user database if it doesn't exist
Constants.expoConfig.extra = Constants.expoConfig.extra || {};
Constants.expoConfig.extra.userDatabase = Constants.expoConfig.extra.userDatabase || {};

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                // Fetch user data from Firestore to check if questionnaire is completed
                const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
                if (userDoc.exists && userDoc.data().questionnaireCompleted) {
                    // Navigate to Recipes screen if questionnaire is completed
                    navigation.navigate('Recipes');
                } else {
                    // Navigate to Questionnaire screen if not completed
                    navigation.navigate('Questionnaire');
                }
            })
            .catch((error) => {
                Alert.alert(
                    "Login Failed",
                    "The email or password you entered is incorrect. Please try again.",
                    [{ text: "OK" }]
                );
            });
    };

    return (
        <LinearGradient
            colors={['#6dd5ed', '#2193b0']} // Matching gradient colors
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.inner}>
                    <Text style={styles.title}>Log In</Text>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="email" size={24} color="white" />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#eee"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="lock" size={24} color="white" />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#eee"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                        />
                    </View>
                    <TouchableOpacity onPress={handleLogin} style={styles.button}>
                        <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomContainer}>
                    <Text style={styles.bottomText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={[styles.button, styles.loginButton]}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    inner: {
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        alignSelf: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 20,
        padding: 15,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: '#fff',
        fontSize: 16,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#2193b0',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    bottomText: {
        fontSize: 16,
        color: '#ffffff',
    },
    loginButton: {
        marginTop: 10,
        borderColor: '#fff',
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
});



export default LoginScreen;
