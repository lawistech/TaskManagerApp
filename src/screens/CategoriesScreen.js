import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, Portal, Modal, Text, Appbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { generateId } from '../utils/idGenerator';

import CategoryList from '../components/CategoryList';
import CategoryForm from '../components/CategoryForm';
import {
  selectAllCategories,
  addCategory,
  removeCategory,
  updateCategoryDetails,
} from '../redux/slices/categoriesSlice';

const CategoriesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleEditCategory = category => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleDeleteCategory = categoryId => {
    dispatch(removeCategory(categoryId));
  };

  const handleSubmitCategory = values => {
    try {
      if (editingCategory) {
        dispatch(updateCategoryDetails({ id: editingCategory.id, ...values }));
      } else {
        const newCategory = {
          id: generateId(),
          ...values,
          createdAt: new Date().toISOString(),
        };
        dispatch(addCategory(newCategory));
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error submitting category:', error);
      // You could add error handling UI here if needed
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Categories" />
      </Appbar.Header>

      <CategoryList
        categories={categories}
        onCategoryPress={handleEditCategory}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>
            {editingCategory ? 'Edit Category' : 'Add Category'}
          </Text>
          <CategoryForm initialValues={editingCategory} onSubmit={handleSubmitCategory} />
        </Modal>
      </Portal>

      <FAB style={styles.fab} icon="plus" onPress={handleAddCategory} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default CategoriesScreen;
