import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Chip, Menu, Divider } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import DatePicker from './DatePicker';

const TaskSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  dueDate: Yup.date().nullable(),
  priority: Yup.string().oneOf(['low', 'medium', 'high']).required('Priority is required'),
  categoryId: Yup.string().nullable(),
});

const TaskForm = ({ initialValues, onSubmit, categories = [] }) => {
  const [dateMenuVisible, setDateMenuVisible] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = {
    title: '',
    description: '',
    dueDate: null,
    priority: 'medium',
    categoryId: null,
    ...initialValues,
  };

  const priorityColors = {
    low: '#4CAF50',
    medium: '#FFC107',
    high: '#F44336',
  };

  return (
    <ScrollView style={styles.container}>
      <Formik initialValues={defaultValues} validationSchema={TaskSchema} onSubmit={onSubmit}>
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
          <View style={styles.form}>
            <TextInput
              label="Task Title"
              value={values.title}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              style={styles.input}
              error={touched.title && errors.title}
            />
            {touched.title && errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <TextInput
              label="Description"
              value={values.description}
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              style={styles.input}
              multiline
              numberOfLines={4}
            />

            <View style={styles.menuContainer}>
              <Text style={styles.label}>Due Date</Text>
              <Button
                mode="outlined"
                onPress={() => setDateMenuVisible(true)}
                style={styles.menuButton}
                icon="calendar"
              >
                {values.dueDate ? format(new Date(values.dueDate), 'MMM d, yyyy') : 'Select Date'}
              </Button>

              <DatePicker
                visible={dateMenuVisible}
                onDismiss={() => setDateMenuVisible(false)}
                onDateSelect={date => {
                  setFieldValue('dueDate', date);
                  setDateMenuVisible(false);
                }}
                initialDate={values.dueDate ? new Date(values.dueDate) : null}
              />
            </View>

            <View style={styles.menuContainer}>
              <Text style={styles.label}>Priority</Text>
              <Menu
                visible={priorityMenuVisible}
                onDismiss={() => setPriorityMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setPriorityMenuVisible(true)}
                    style={[styles.menuButton, { borderColor: priorityColors[values.priority] }]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priorityColors[values.priority] },
                      ]}
                    />
                    {values.priority.charAt(0).toUpperCase() + values.priority.slice(1)}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setFieldValue('priority', 'low');
                    setPriorityMenuVisible(false);
                  }}
                  title="Low"
                  leadingIcon="flag-outline"
                />
                <Menu.Item
                  onPress={() => {
                    setFieldValue('priority', 'medium');
                    setPriorityMenuVisible(false);
                  }}
                  title="Medium"
                  leadingIcon="flag-outline"
                />
                <Menu.Item
                  onPress={() => {
                    setFieldValue('priority', 'high');
                    setPriorityMenuVisible(false);
                  }}
                  title="High"
                  leadingIcon="flag-outline"
                />
              </Menu>
            </View>

            <View style={styles.menuContainer}>
              <Text style={styles.label}>Category</Text>
              <Menu
                visible={categoryMenuVisible}
                onDismiss={() => setCategoryMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setCategoryMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    {values.categoryId
                      ? categories.find(c => c.id === values.categoryId)?.name || 'Select Category'
                      : 'Select Category'}
                  </Button>
                }
              >
                {categories.map(category => (
                  <Menu.Item
                    key={category.id}
                    onPress={() => {
                      setFieldValue('categoryId', category.id);
                      setCategoryMenuVisible(false);
                    }}
                    title={category.name}
                  />
                ))}
                <Divider />
                <Menu.Item
                  onPress={() => {
                    setFieldValue('categoryId', null);
                    setCategoryMenuVisible(false);
                  }}
                  title="No Category"
                />
              </Menu>
            </View>

            <Button
              mode="contained"
              onPress={() => {
                setSubmitting(true);
                try {
                  handleSubmit();
                } catch (error) {
                  console.error('Error submitting form:', error);
                } finally {
                  // Reset submitting state after a short delay
                  setTimeout(() => setSubmitting(false), 500);
                }
              }}
              style={styles.button}
              disabled={submitting}
            >
              {submitting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loadingText}>Processing...</Text>
                </View>
              ) : initialValues ? (
                'Update Task'
              ) : (
                'Create Task'
              )}
            </Button>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#B00020',
    marginBottom: 16,
    marginLeft: 4,
  },
  menuContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  menuButton: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  button: {
    marginTop: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default TaskForm;
