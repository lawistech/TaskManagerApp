import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, IconButton, Button, Chip } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { selectAllTasks } from '../redux/slices/tasksSlice';
import { parseDate } from '../utils/dateUtils';
import {
  format,
  isToday,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { useNavigation } from '@react-navigation/native';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const tasks = useSelector(selectAllTasks);
  const navigation = useNavigation();

  // Filter tasks for the selected date
  const tasksForSelectedDate = tasks.filter(
    task => task.dueDate && isSameDay(parseDate(task.dueDate), selectedDate),
  );

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Function to render the calendar
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(monthStart);

    // Create an array of day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Create calendar grid
    const calendarDays = [];

    // Add day names row
    calendarDays.push(
      <View key="dayNames" style={styles.weekRow}>
        {dayNames.map(day => (
          <View key={day} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{day}</Text>
          </View>
        ))}
      </View>,
    );

    // Add empty cells for days before the first day of the month
    let days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Add days of the month
    daysInMonth.forEach(day => {
      // Count tasks for this day
      const tasksForDay = tasks.filter(
        task => task.dueDate && isSameDay(parseDate(task.dueDate), day),
      );

      days.push(
        <TouchableOpacity
          key={day.toString()}
          style={[
            styles.dayCell,
            isToday(day) && styles.todayCell,
            isSameDay(day, selectedDate) && styles.selectedCell,
          ]}
          onPress={() => setSelectedDate(day)}
        >
          <Text
            style={[
              styles.dayText,
              isToday(day) && styles.todayText,
              isSameDay(day, selectedDate) && styles.selectedText,
            ]}
          >
            {format(day, 'd')}
          </Text>
          {tasksForDay.length > 0 && (
            <View style={styles.taskIndicator}>
              <Text style={styles.taskIndicatorText}>{tasksForDay.length}</Text>
            </View>
          )}
        </TouchableOpacity>,
      );
    });

    // Group days into weeks
    const weeks = [];
    let weekIndex = 0;
    while (days.length) {
      const weekDays = days.splice(0, 7);
      weeks.push(
        <View key={`week-${weekIndex}`} style={styles.weekRow}>
          {weekDays.map((day, dayIndex) => (
            <React.Fragment key={`day-${weekIndex}-${dayIndex}`}>{day}</React.Fragment>
          ))}
        </View>,
      );
      weekIndex++;
    }

    return weeks;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Calendar</Text>

      <View style={styles.calendarContainer}>
        <View style={styles.monthSelector}>
          <IconButton icon="chevron-left" size={24} onPress={handlePrevMonth} />
          <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>
          <IconButton icon="chevron-right" size={24} onPress={handleNextMonth} />
        </View>

        <View style={styles.calendar}>{renderCalendar()}</View>
      </View>

      <View style={styles.tasksContainer}>
        <Text style={styles.tasksHeader}>
          Tasks for {format(selectedDate, 'MMMM d')}
          {isToday(selectedDate) && <Text style={styles.todayIndicator}> (Today)</Text>}
        </Text>

        {tasksForSelectedDate.length > 0 ? (
          tasksForSelectedDate.map(task => (
            <Card
              key={task.id}
              style={[styles.taskCard, task.completed && styles.completedTaskCard]}
              onPress={() =>
                navigation.navigate('Tasks', {
                  screen: 'TaskDetail',
                  params: { taskId: task.id },
                })
              }
            >
              <Card.Content>
                <Title style={task.completed ? styles.completedTaskTitle : null}>
                  {task.title}
                </Title>
                {task.description && (
                  <Paragraph style={task.completed ? styles.completedTaskText : null}>
                    {task.description}
                  </Paragraph>
                )}
                <View style={styles.taskFooter}>
                  {task.dueDate && (
                    <Text style={styles.taskTime}>{format(parseDate(task.dueDate), 'h:mm a')}</Text>
                  )}
                  {task.priority && (
                    <Chip style={styles.priorityChip} textStyle={styles.priorityChipText}>
                      {task.priority}
                    </Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text style={styles.noTasks}>No tasks for this day</Text>
        )}

        <Button
          mode="contained"
          icon="plus"
          style={styles.addTaskButton}
          onPress={() =>
            navigation.navigate('Tasks', {
              screen: 'TaskForm',
              params: { initialDate: selectedDate },
            })
          }
        >
          Add Task for This Day
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  calendarContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendar: {
    marginBottom: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayNameCell: {
    width: 40,
    alignItems: 'center',
    padding: 5,
  },
  dayNameText: {
    fontSize: 14,
    color: '#666',
  },
  dayCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    margin: 2,
  },
  dayText: {
    fontSize: 16,
  },
  todayCell: {
    backgroundColor: '#e0f7fa',
  },
  todayText: {
    fontWeight: 'bold',
    color: '#0288d1',
  },
  selectedCell: {
    backgroundColor: '#2196f3',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskIndicator: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: '#f44336',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tasksContainer: {
    flex: 1,
    padding: 16,
  },
  tasksHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  todayIndicator: {
    color: '#0288d1',
  },
  taskCard: {
    marginBottom: 16,
  },
  completedTaskCard: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  completedTaskText: {
    color: '#9e9e9e',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  taskTime: {
    color: 'gray',
  },
  priorityChip: {
    height: 24,
  },
  priorityChipText: {
    fontSize: 12,
  },
  noTasks: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: 'gray',
  },
  addTaskButton: {
    marginTop: 16,
  },
});

export default CalendarScreen;
