import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button, useTheme } from 'react-native-paper';

const CategoryList = ({ categories, onCategoryPress, onAddCategory, onDeleteCategory }) => {
  const theme = useTheme();
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onCategoryPress(item)} activeOpacity={0.7}>
      <Card style={[styles.card, { borderLeftColor: item.color }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.categoryInfo}>
            <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
            <Text style={styles.categoryName}>{item.name}</Text>
          </View>
          <IconButton icon="delete" size={28} onPress={() => onDeleteCategory(item.id)} />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Organize your tasks with custom categories!</Text>
      <Button
        mode="contained"
        onPress={onAddCategory}
        style={styles.addButton}
        icon="folder-plus"
        uppercase={true}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        Create Your First Category
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()} // Ensure keys are strings
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        extraData={categories.length} // Force re-render when list changes
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
    borderLeftWidth: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonContent: {
    height: 56,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CategoryList;
