import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    Button,
    TouchableOpacity,
    StyleSheet,
    Text,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { MaterialIcons } from '@expo/vector-icons';
// import firebase from '../firebaseconfig';
import { firebase, db } from '../firebaseconfig';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import Constants from 'expo-constants';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Ensure your Firebase configuration is correct and included in your app.json under "extra"
const firebaseConfig = Constants.expoConfig.extra.firebase;

const SignUpScreen = ({ navigation }) => {//36.25
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [code, setCode] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const recaptchaVerifier = useRef(null);

    const isValidPhoneNumber = (phoneNumber) => {
        const phoneNumberObject = parsePhoneNumberFromString(phoneNumber);
        return phoneNumberObject ? phoneNumberObject.isValid() : false;
    };

    const preCheckEmailAndSendVerification = () => {
        if (password.length < 6) {
            Alert.alert("Password Too Short", "The password must be at least 6 characters long.");
            return;
        }
        if (!isValidPhoneNumber(phoneNumber)) {
            Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
            return;
        }

        // Attempt to create the user to check if the email is already in use.
        firebase.auth().fetchSignInMethodsForEmail(email)
            .then((methods) => {
                if (methods.length === 0) {
                    // Email not in use, proceed with sending verification
                    sendVerification();
                } else {
                    // Email already in use
                    Alert.alert("Email Already in Use", "The email address is already in use by another account.");
                }
            })
            .catch((error) => {
                Alert.alert("Error", error.message);
            });
    };

    const sendVerification = () => {
        if (password.length < 6) {
            Alert.alert("Password Too Short", "The password must be at least 6 characters long.");
            return;
        }
        if (!phoneNumber.startsWith('+') || phoneNumber.length < 10) {
            Alert.alert("Invalid Phone Number", "Please enter a valid phone number in international format.");
            return;
        }
        const phoneProvider = new firebase.auth.PhoneAuthProvider();
        phoneProvider
            .verifyPhoneNumber(phoneNumber, recaptchaVerifier.current)
            .then(setVerificationId)
            .catch((error) => Alert.alert("Verification Failed", error.message));
    };

    const verifyCode = () => {
        const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
        firebase.auth().signInWithCredential(credential)
            .then(() => {
                // Store user data for prototype purposes
                // Ensure you have a proper method to store and secure the user data
                createUserAccount();
            })
            .catch((error) => {
                // Verification failed: Reset verificationId and alert the user
                setVerificationId('');
                Alert.alert("Verification Failed", "The verification code is incorrect or expired. Please try sending a new code.", [
                    { text: "OK", onPress: () => { } } // Optionally add a function to handle resending verification
                ]);
            });
    };

    const createUserAccount = () => {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // User account created & signed in, you can navigate to the next screen
                // and/or update user profile here
                const user = userCredential.user;
                updateFirebaseProfile(user);
            })
            .catch((error) => {
                if (error.code === 'auth/email-already-in-use') {
                    Alert.alert("Account Creation Failed", "The email address is already in use by another account.");
                } else {
                    Alert.alert("Account Creation Failed", error.message);
                }
            });
    };

    const updateFirebaseProfile = (user) => {
        user.updateProfile({
            displayName: name,
            // You can add more user information here if needed
        }).then(() => {
            // Profile updated, decide where to navigate next
            // This is where you could check if the questionnaire has been filled out
            navigation.navigate('Questionnaire'); // Placeholder navigation
        }).catch((error) => {
            Alert.alert("Profile Update Failed", error.message);
        });
    };

    const checkIfQuestionnaireFilled = () => {
        // Implement logic to check if the user has filled the questionnaire.
        // This could involve checking a field in the Firebase user profile,
        // or storing/retrieving this information from a database.
        // For demonstration:
        navigation.navigate('Questionnaire');
    };

    return (
        <LinearGradient
            colors={['#6dd5ed', '#2193b0']} // Example gradient colors
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={firebaseConfig}
                />
                <View style={styles.inner}>
                    <Text style={styles.title}>Sign Up</Text>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="person" size={24} color="white" />
                        <TextInput
                            placeholder="Name"
                            placeholderTextColor="#eee"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />
                    </View>
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
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="phone" size={24} color="white" />
                        <TextInput
                            placeholder="Phone Number"
                            placeholderTextColor="#eee"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            style={styles.input}
                        />
                    </View>
                    {verificationId ? (
                        <>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="message" size={24} color="white" />
                                <TextInput
                                    placeholder="Verification Code"
                                    placeholderTextColor="#eee"
                                    value={code}
                                    onChangeText={setCode}
                                    style={styles.input}
                                />
                            </View>
                            <TouchableOpacity onPress={verifyCode} style={styles.button}>
                                <Text style={styles.buttonText}>Verify Code</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={preCheckEmailAndSendVerification} style={styles.button}>
                            <Text style={styles.buttonText}>Send Verification</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.bottomContainer}>
                    <Text style={styles.bottomText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={[styles.button, styles.loginButton]}>
                        <Text style={styles.buttonText}>Log In</Text>
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



export default SignUpScreen;
