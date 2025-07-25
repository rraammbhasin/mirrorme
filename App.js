import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isToday, parseISO } from 'date-fns';

const reflectionPrompts = [
  "What did you avoid today that you know you need to face?",
  "What story are you telling yourself about this problem?",
  "Who gave you energy today?",
  "What moment made you feel most alive today?",
  "What did you learn about yourself this week?"
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [reflection, setReflection] = useState('');
  const [schedule, setSchedule] = useState('');
  const [message, setMessage] = useState('');
  const [deliveredMessages, setDeliveredMessages] = useState([]);
  const [pastReflections, setPastReflections] = useState([]);

  useEffect(() => {
    const dailyPrompt = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];
    setPrompt(dailyPrompt);
    loadReflections();
    loadMessages();
  }, []);

  const loadReflections = async () => {
    const data = await AsyncStorage.getItem('reflections');
    if (data) setPastReflections(JSON.parse(data));
  };

  const loadMessages = async () => {
    const data = await AsyncStorage.getItem('futureMessages');
    if (data) {
      const messages = JSON.parse(data);
      const todays = messages.filter(msg => isToday(parseISO(msg.deliverOn)));
      setDeliveredMessages(todays);
    }
  };

  const saveReflection = async () => {
    const newEntry = { prompt, reflection, date: format(new Date(), 'PPP') };
    const updated = [...pastReflections, newEntry];
    await AsyncStorage.setItem('reflections', JSON.stringify(updated));
    setReflection('');
    setPastReflections(updated);
    Alert.alert('Saved', 'Reflection saved. Great job!');
  };

  const scheduleMessage = async () => {
    const data = await AsyncStorage.getItem('futureMessages');
    const updated = [...(data ? JSON.parse(data) : []), { message, deliverOn: schedule }];
    await AsyncStorage.setItem('futureMessages', JSON.stringify(updated));
    setMessage('');
    setSchedule('');
    Alert.alert('Scheduled', 'Message scheduled for your future self!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🪞 MirrorMe</Text>
      <Text style={styles.subtext}>Your 60-second habit for clarity and self-growth</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Today’s Prompt:</Text>
        <Text style={styles.prompt}>“{prompt}”</Text>
        <TextInput
          placeholder='Write your reflection here...'
          style={styles.input}
          value={reflection}
          onChangeText={setReflection}
          multiline
        />
        <Button title='Save Reflection' onPress={saveReflection} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📬 Message Your Future Self</Text>
        <TextInput
          placeholder='Your message...'
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TextInput
          placeholder='YYYY-MM-DD'
          style={styles.input}
          value={schedule}
          onChangeText={setSchedule}
        />
        <Button title='Schedule Message' onPress={scheduleMessage} />
      </View>

      {deliveredMessages.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.label}>📨 Messages for Today</Text>
          {deliveredMessages.map((msg, i) => (
            <Text key={i} style={styles.message}>• {msg.message}</Text>
          ))}
        </View>
      )}

      {pastReflections.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.label}>🕰️ Your Reflection Archive</Text>
          {pastReflections.map((r, i) => (
            <Text key={i} style={styles.message}>
              • {r.date}: {r.prompt} - "{r.reflection}"
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtext: { textAlign: 'center', color: '#666', marginBottom: 20 },
  card: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 10, marginBottom: 20 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  prompt: { fontStyle: 'italic', color: '#333', marginBottom: 10 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 6, borderColor: '#ccc', borderWidth: 1, marginBottom: 10 },
  message: { fontSize: 14, color: '#444', marginBottom: 4 }
});