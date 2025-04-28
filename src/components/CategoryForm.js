import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { TextInput, Button, Text, IconButton, Appbar } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';

const { width, height } = Dimensions.get('window');

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
    '#795548', // Brown
    '#607d8b', // Blue Grey
    '#ff5722', // Deep Orange
    '#8bc34a', // Light Green
  ];

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction color="white" onPress={() => onSubmit(null)} />
        <Appbar.Content
          title={initialValues ? 'Customize Your Category' : 'Create a New Category'}
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Formik initialValues={defaultValues} validationSchema={CategorySchema} onSubmit={onSubmit}>
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Category Details</Text>

              <Text style={styles.inputLabel}>Category Name</Text>
              <TextInput
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                style={styles.input}
                error={touched.name && errors.name}
                mode="outlined"
                outlineColor="#6200ee"
                activeOutlineColor="#6200ee"
                placeholder="Enter a name for your category"
                placeholderTextColor="#9e9e9e"
                theme={{ roundness: 12 }}
              />
              {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <Text style={styles.sectionTitle}>Category Color</Text>
              <Text style={styles.colorDescription}>
                Choose a color that represents this category
              </Text>

              <View style={styles.colorContainer}>
                {colorOptions.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      values.color === color && styles.selectedColor,
                    ]}
                    onPress={() => setFieldValue('color', color)}
                  >
                    {values.color === color && (
                      <IconButton
                        icon="check"
                        size={36}
                        iconColor="white"
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.selectedColorContainer}>
                <Text style={styles.selectedColorText}>Selected Color:</Text>
                <View style={[styles.colorPreview, { backgroundColor: values.color }]} />
              </View>

              {touched.color && errors.color && (
                <Text style={styles.errorText}>{errors.color}</Text>
              )}

              <Button
                mode="contained"
                icon={initialValues ? 'pencil' : 'folder-plus'}
                onPress={() => {
                  setSubmitting(true);
                  handleSubmit();
                  // Reset submitting state after a short delay
                  setTimeout(() => setSubmitting(false), 500);
                }}
                style={styles.button}
                disabled={submitting}
                uppercase={true}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {submitting
                  ? 'Processing...'
                  : initialValues
                    ? 'Update Category'
                    : 'Create New Category'}
              </Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#6200ee',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  form: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 8,
  },
  colorDescription: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
  },
  input: {
    marginBottom: 24,
    height: 70,
    fontSize: 20,
    backgroundColor: 'white',
  },
  errorText: {
    color: '#B00020',
    marginBottom: 16,
    marginLeft: 4,
    fontSize: 16,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  colorOption: {
    width: width / 5 - 20,
    height: width / 5 - 20,
    margin: 8,
    borderRadius: width / 10 - 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: 'white',
    elevation: 8,
  },
  checkIcon: {
    margin: 0,
    padding: 0,
  },
  selectedColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    height: 80,
  },
  selectedColorText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#424242',
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 16,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  button: {
    marginTop: 32,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: '#6200ee',
  },
  buttonContent: {
    height: 70,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default CategoryForm;
