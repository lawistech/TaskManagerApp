import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, Portal, Modal, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import CategoryList from '../components/CategoryList';
import CategoryForm from '../components/CategoryForm';
import { 
  selectAllCategories, 
  addCategory, 
  removeCategory, 
  updateCategoryDetails 
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
  
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setModalVisible(true);
  };
  
  const handleDeleteCategory = (categoryId) => {
    dispatch(removeCategory(categoryId));
  };
  
  const handleSubmitCategory = (values) => {
    if (editingCategory) {
      dispatch(updateCategoryDetails({ id: editingCategory.id, ...values }));
    } else {
      dispatch(addCategory({ id: uuidv4(), ...values }));
    }
    setModalVisible(false);
  };
  
  return (
    <View style={styles.container}>
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
          <CategoryForm
            initialValues={editingCategory}
            onSubmit={handleSubmitCategory}
          />
        </Modal>
      </Portal>
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddCategory}
      />
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
