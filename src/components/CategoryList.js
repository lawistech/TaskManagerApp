import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button } from 'react-native-paper';

const CategoryList = ({ categories, onCategoryPress, onAddCategory, onDeleteCategory }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onCategoryPress(item)} activeOpacity={0.7}>
      <Card style={[styles.card, { borderLeftColor: item.color }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.categoryInfo}>
            <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
            <Text style={styles.categoryName}>{item.name}</Text>
          </View>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => onDeleteCategory(item.id)}
          />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No categories found</Text>
      <Button mode="contained" onPress={onAddCategory} style={styles.addButton}>
        Add a Category
      </Button>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
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
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#6200ee',
  },
});

export default CategoryList;
