import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Button, Text, Surface, IconButton } from 'react-native-paper';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameDay,
} from 'date-fns';
import { serializeDate } from '../utils/dateUtils';

const DatePicker = ({ visible, onDismiss, onDateSelect, initialDate = null }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Update selectedDate when initialDate changes
  useEffect(() => {
    setSelectedDate(initialDate);
  }, [initialDate]);

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
      days.push(
        <TouchableOpacity
          key={day.toString()}
          style={[
            styles.dayCell,
            isToday(day) && styles.todayCell,
            selectedDate && isSameDay(day, selectedDate) && styles.selectedCell,
          ]}
          onPress={() => {
            setSelectedDate(day);
            onDateSelect(serializeDate(day));
          }}
        >
          <Text
            style={[
              styles.dayText,
              isToday(day) && styles.todayText,
              selectedDate && isSameDay(day, selectedDate) && styles.selectedText,
            ]}
          >
            {format(day, 'd')}
          </Text>
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
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalContainer}>
        <Surface style={styles.calendarContainer}>
          <View style={styles.header}>
            <IconButton icon="close" size={24} onPress={onDismiss} />
            <Text style={styles.headerText}>Select Date</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.monthSelector}>
            <IconButton icon="chevron-left" size={24} onPress={handlePrevMonth} />
            <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>
            <IconButton icon="chevron-right" size={24} onPress={handleNextMonth} />
          </View>

          <View style={styles.calendar}>{renderCalendar()}</View>

          <View style={styles.buttonContainer}>
            <Button
              mode="text"
              onPress={() => {
                setSelectedDate(null);
                onDateSelect(serializeDate(null));
              }}
            >
              Clear
            </Button>
            <Button mode="text" onPress={onDismiss}>
              Cancel
            </Button>
            {selectedDate && (
              <Button
                mode="contained"
                onPress={() => {
                  onDateSelect(serializeDate(selectedDate));
                  onDismiss();
                }}
                style={styles.doneButton}
              >
                Done
              </Button>
            )}
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    width: '90%',
    maxWidth: 350,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendar: {
    padding: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayNameCell: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: 12,
    color: '#757575',
  },
  dayCell: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  dayText: {
    fontSize: 14,
  },
  todayCell: {
    backgroundColor: '#e0e0e0',
  },
  todayText: {
    fontWeight: 'bold',
  },
  selectedCell: {
    backgroundColor: '#6200ee',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  doneButton: {
    marginLeft: 8,
  },
});

export default DatePicker;
