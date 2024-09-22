import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Task {
  id: string;
  name: string;
  dueDate: string;
  completed: boolean;
  priority: string;
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); 

  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    };
    loadTasks();
  }, []);

  const saveTasks = async (updatedTasks: Task[]) => {
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const handleSaveTask = () => {
    if (!newTask || !newDueDate) {
      Alert.alert('Error', 'Please enter both task name and due date.');
      return;
    }

    if (editMode && currentTaskId) {
      const updatedTasks = tasks.map(task =>
        task.id === currentTaskId ? { ...task, name: newTask, dueDate: newDueDate } : task
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    } else {
      const newTaskObj: Task = {
        id: Date.now().toString(),
        name: newTask,
        dueDate: newDueDate,
        completed: false,
        priority: 'medium',
      };
      const updatedTasks = [...tasks, newTaskObj];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }

    setNewTask('');
    setNewDueDate('');
    setEditMode(false);
    setCurrentTaskId(null);
  };

  const startEditTask = (task: Task) => {
    setNewTask(task.name);
    setNewDueDate(task.dueDate);
    setEditMode(true);
    setCurrentTaskId(task.id);
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (sortOrder === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <View style={styles.container}>
        <Text style={styles.titleText}></Text>

      <View style={styles.topContainer}>
        <Text style={styles.titleText}>{editMode ? 'Update Task' : 'New Task'}</Text>
        <TextInput
          placeholder="Task Name"
          value={newTask}
          onChangeText={setNewTask}
          style={styles.input}
        />
        <TextInput
          placeholder="Due Date (YYYY-MM-DD)"
          value={newDueDate}
          onChangeText={setNewDueDate}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSaveTask} style={styles.iconButton}>
          <Icon name={editMode ? 'check' : 'plus'} size={24} color="blue" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter('all')}>
          <Text style={filter === 'all' ? styles.filterTextSelected : styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('completed')}>
          <Text style={filter === 'completed' ? styles.filterTextSelected : styles.filterText}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('incomplete')}>
          <Text style={filter === 'incomplete' ? styles.filterTextSelected : styles.filterText}>Incomplete</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={toggleSortOrder} style={styles.sortButton}>
        <Text style={styles.sortButtonText}>{sortOrder === 'asc' ? 'Earliest Due Date' : 'Latest Due Date'}</Text>
      </TouchableOpacity>

      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => startEditTask(item)}>
              <Text style={styles.taskTextName}>{item.name}</Text>
              <Text style={styles.taskText}>Due Date: {item.dueDate}</Text>
              <Text style={styles.taskText}>{item.completed ? 'Completed' : 'Incomplete'}</Text>
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={() => toggleTask(item.id)}>
                <Icon name="check" size={20} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.icon}>
                <Icon name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  iconButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  topContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: 45,
  },
  taskContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
  },
  taskText: {
    fontSize: 16,
  },
  taskTextName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  icon: {
    marginLeft: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterText: {
    fontSize: 16,
    color: 'gray',
  },
  filterTextSelected: {
    fontSize: 16,
    color: 'blue',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  sortButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'blue',
  },
});
