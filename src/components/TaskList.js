import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Searchbar, Chip, Menu, Button, Divider } from 'react-native-paper';
import TaskCard from './TaskCard';

const TaskList = ({ 
  tasks, 
  categories, 
  onTaskPress, 
  onToggleComplete,
  onAddTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate', 'priority', 'title', 'createdAt'
  
  // Filter tasks based on search query, category, and completion status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory ? task.categoryId === selectedCategory : true;
    const matchesCompletion = showCompleted ? true : !task.completed;
    
    return matchesSearch && matchesCategory && matchesCompletion;
  });
  
  // Sort tasks based on the selected sort option
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority': {
        const priorityValues = { high: 0, medium: 1, low: 2 };
        return priorityValues[a.priority] - priorityValues[b.priority];
      }
      case 'title':
        return a.title.localeCompare(b.title);
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });
  
  const getCategoryById = (categoryId) => {
    return categories.find(category => category.id === categoryId);
  };
  
  const renderItem = ({ item }) => (
    <TaskCard
      task={item}
      category={getCategoryById(item.categoryId)}
      onPress={() => onTaskPress(item)}
      onToggleComplete={onToggleComplete}
    />
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No tasks found</Text>
      <Button mode="contained" onPress={onAddTask} style={styles.addButton}>
        Add a Task
      </Button>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search tasks..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.filtersContainer}>
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Button 
              mode="outlined" 
              onPress={() => setFilterMenuVisible(true)}
              icon="filter-variant"
              style={styles.filterButton}
            >
              Filter
            </Button>
          }
        >
          <Menu.Item 
            title="All Categories" 
            onPress={() => {
              setSelectedCategory(null);
              setFilterMenuVisible(false);
            }} 
          />
          <Divider />
          {categories.map(category => (
            <Menu.Item 
              key={category.id}
              title={category.name}
              onPress={() => {
                setSelectedCategory(category.id);
                setFilterMenuVisible(false);
              }}
            />
          ))}
          <Divider />
          <Menu.Item 
            title={`${showCompleted ? 'Hide' : 'Show'} Completed`}
            onPress={() => {
              setShowCompleted(!showCompleted);
              setFilterMenuVisible(false);
            }}
          />
        </Menu>
        
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <Button 
              mode="outlined" 
              onPress={() => setSortMenuVisible(true)}
              icon="sort"
              style={styles.sortButton}
            >
              Sort
            </Button>
          }
        >
          <Menu.Item 
            title="Due Date" 
            onPress={() => {
              setSortBy('dueDate');
              setSortMenuVisible(false);
            }} 
          />
          <Menu.Item 
            title="Priority" 
            onPress={() => {
              setSortBy('priority');
              setSortMenuVisible(false);
            }} 
          />
          <Menu.Item 
            title="Title" 
            onPress={() => {
              setSortBy('title');
              setSortMenuVisible(false);
            }} 
          />
          <Menu.Item 
            title="Created Date" 
            onPress={() => {
              setSortBy('createdAt');
              setSortMenuVisible(false);
            }} 
          />
        </Menu>
      </View>
      
      {selectedCategory && (
        <View style={styles.activeFiltersContainer}>
          <Chip 
            onClose={() => setSelectedCategory(null)}
            style={styles.filterChip}
          >
            {getCategoryById(selectedCategory)?.name || 'Category'}
          </Chip>
        </View>
      )}
      
      <FlatList
        data={sortedTasks}
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
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    marginRight: 8,
  },
  sortButton: {
    flex: 1,
    marginLeft: 8,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
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

export default TaskList;
