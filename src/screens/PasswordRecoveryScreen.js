import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface, Snackbar } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetPassword,
  selectPasswordResetStatus,
  selectPasswordResetError,
} from '../redux/slices/authSlice';

const PasswordRecoverySchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const PasswordRecoveryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const status = useSelector(selectPasswordResetStatus);
  const error = useSelector(selectPasswordResetError);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handlePasswordReset = async values => {
    try {
      await dispatch(resetPassword(values.email)).unwrap();
      setSnackbarMessage('Password reset instructions sent to your email');
      setSnackbarVisible(true);
      // After 3 seconds, navigate back to login
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } catch (err) {
      setSnackbarMessage(err.message || 'Failed to send reset instructions');
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email to receive reset instructions</Text>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={PasswordRecoverySchema}
          onSubmit={handlePasswordReset}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
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

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={status === 'loading'}
                disabled={status === 'loading'}
              >
                Send Reset Instructions
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                disabled={status === 'loading'}
              >
                Back to Login
              </Button>
            </View>
          )}
        </Formik>
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
  backButton: {
    marginTop: 8,
  },
});

export default PasswordRecoveryScreen;
