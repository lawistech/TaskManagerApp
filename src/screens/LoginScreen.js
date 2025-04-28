import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface, Snackbar } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthStatus, selectAuthError } from '../redux/slices/authSlice';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleLogin = async values => {
    try {
      await dispatch(login(values)).unwrap();
      // If successful, the AppNavigator will automatically redirect to the main app
    } catch (err) {
      setSnackbarMessage(err.message || 'Login failed');
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Task Manager</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                error={touched.email && errors.email}
                disabled={status === 'loading'}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <TextInput
                label="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                style={styles.input}
                secureTextEntry={secureTextEntry}
                right={
                  <TextInput.Icon
                    icon={secureTextEntry ? 'eye-off' : 'eye'}
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                    disabled={status === 'loading'}
                  />
                }
                error={touched.password && errors.password}
                disabled={status === 'loading'}
              />
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={status === 'loading'}
                disabled={status === 'loading'}
              >
                Sign In
              </Button>

              <TouchableOpacity
                onPress={() => navigation.navigate('PasswordRecovery')}
                style={styles.forgotPasswordContainer}
                disabled={status === 'loading'}
              >
                <Text style={[styles.link, status === 'loading' && { opacity: 0.5 }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <View style={styles.footer}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Surface>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f6f6f6',
  },
  surface: {
    padding: 24,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: 'gray',
  },
  form: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#B00020',
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    marginTop: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'center',
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  link: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
