// navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import RecipeListScreen from '../screens/RecipeListScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="SignUp"
            >
                <Stack.Screen name="SignUp" component={SignUpScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen name="Login" component={LoginScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen name="Questionnaire" component={QuestionnaireScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen name="Recipes" component={RecipeListScreen}
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default AppNavigator;
