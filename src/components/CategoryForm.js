import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';

const CategorySchema = Yup.object().shape({
  name: Yup.string().required('Category name is required'),
  color: Yup.string().required('Color is required'),
});

const CategoryForm = ({ initialValues, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = {
    name: '',
    color: '#6200ee',
    ...initialValues,
  };

  // Predefined colors for categories
  const colorOptions = [
    '#6200ee', // Purple
    '#03dac4', // Teal
    '#f50057', // Pink
    '#ff9800', // Orange
    '#4caf50', // Green
    '#2196f3', // Blue
    '#f44336', // Red
    '#9c27b0', // Deep Purple
  ];

  return (
    <View style={styles.container}>
      <Formik initialValues={defaultValues} validationSchema={CategorySchema} onSubmit={onSubmit}>
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View style={styles.form}>
            <TextInput
              label="Category Name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              style={styles.input}
              error={touched.name && errors.name}
            />
            {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.colorLabel}>Category Color</Text>
            <View style={styles.colorContainer}>
              {colorOptions.map(color => (
                <IconButton
                  key={color}
                  icon="circle"
                  size={30}
                  iconColor={color}
                  style={[styles.colorOption, values.color === color && styles.selectedColor]}
                  onPress={() => setFieldValue('color', color)}
                />
              ))}
            </View>
            {touched.color && errors.color && <Text style={styles.errorText}>{errors.color}</Text>}

            <Button
              mode="contained"
              onPress={() => {
                setSubmitting(true);
                handleSubmit();
                // Reset submitting state after a short delay
                setTimeout(() => setSubmitting(false), 500);
              }}
              style={styles.button}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : initialValues ? 'Update Category' : 'Create Category'}
            </Button>
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f6f6',
  },
  form: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#B00020',
    marginBottom: 16,
    marginLeft: 4,
  },
  colorLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorOption: {
    margin: 4,
  },
  selectedColor: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
  button: {
    marginTop: 16,
  },
});

export default CategoryForm;
