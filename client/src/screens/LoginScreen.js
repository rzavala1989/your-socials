import React, { Component } from 'react';
import {
  LayoutAnimation,
  ScrollView,
  Text,
  View,
  Alert,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import FadeIn from '../components/animated/FadeIn';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

class LoginScreen extends Component {
  static contextType = AuthContext;
  static navigationOptions = {
    headerShown: false,
  };

  state = {
    login: true,
  };

  login = async (email, pass) => {
    const success = await this.context.login(email, pass);
    success
      ? this.props.navigation.navigate('App')
      : Alert.alert('Unauthorized', 'Email or password are incorrenct');
  };

  register = async (email, password, username) => {
    const res = await fetch('http://192.168.0.49:3000/auth/register', {
      headers: {
        'content-type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify({
        email,
        password,
        username,
      }),
    });
    res.ok ? this.toggleLogin() : Alert.alert('Error Registering');
  };

  toggleLogin = () => {
    LayoutAnimation.easeInEaseOut();
    this.setState({ login: !this.state.login });
  };

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.Os == 'ios' ? 'padding' : 'height'}
        enabled
        style={{ backgroundColor: 'indigo', flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            zIndex: 1,
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <View style={{ marginLeft: '12.5%', width: '75%' }}>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 28,
                marginBottom: 32,
              }}
            >
              {this.state.login
                ? 'Sign in to Your Socials'
                : 'Create Your Socials Account'}
            </Text>
          </View>
          {this.state.login ? (
            <LoginForm
              onLogin={this.login}
              onNavigateToRegister={this.toggleLogin}
            />
          ) : (
            <RegisterForm
              onRegister={this.register}
              onNavigateToLogin={this.toggleLogin}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}
export default LoginScreen;
