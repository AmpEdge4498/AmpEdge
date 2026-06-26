import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, Send, Phone } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

export default function ChatScreen({ navigation, route }) {
  const { otherUser, bookingId } = route.params || {};
  const { theme } = useTheme();
  const c = theme.colors;
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const params = bookingId ? `?bookingId=${bookingId}` : '';
      const res = await api.get(`/chat/${otherUser?._id || 'demo'}${params}`);
      if (res.data.success) setMessages(res.data.data);
    } catch (e) {
      // Use mock data
      if (messages.length === 0) {
        setMessages([
          { _id: '1', senderId: 'tech1', text: 'Hello! I\'m your assigned technician for the wiring installation.', createdAt: new Date(Date.now() - 60000).toISOString() },
          { _id: '2', senderId: user?._id || 'me', text: 'Great! When will you arrive?', createdAt: new Date(Date.now() - 30000).toISOString() },
          { _id: '3', senderId: 'tech1', text: 'I\'ll be there in about 30 minutes. Please keep the main switch area accessible.', createdAt: new Date().toISOString() },
        ]);
      }
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const newMsg = {
      _id: Date.now().toString(),
      senderId: user?._id || 'me',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setText('');

    try {
      await api.post('/chat', {
        receiverId: otherUser?._id || 'demo',
        text: text.trim(),
        bookingId,
      });
    } catch (e) { /* offline mode - message already added locally */ }
  };

  const isMyMessage = (msg) => msg.senderId === (user?._id || 'me');

  const renderMessage = ({ item }) => (
    <View style={[styles.msgRow, isMyMessage(item) && styles.msgRowRight]}>
      {!isMyMessage(item) && (
        <View style={[styles.avatar, { backgroundColor: '#4169E1' }]}>
          <Text style={styles.avatarText}>{otherUser?.name?.[0] || 'T'}</Text>
        </View>
      )}
      <View style={[
        styles.bubble,
        isMyMessage(item) ? styles.myBubble : [styles.otherBubble, { backgroundColor: c.surface, borderColor: c.border }]
      ]}>
        <Text style={[styles.bubbleText, { color: isMyMessage(item) ? '#fff' : c.text }]}>{item.text}</Text>
        <Text style={[styles.timeText, { color: isMyMessage(item) ? 'rgba(255,255,255,0.6)' : c.textMuted }]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#4169E1' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={{ color: '#4169E1', fontWeight: '800' }}>{otherUser?.name?.[0] || 'T'}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{otherUser?.name || 'Technician'}</Text>
            <Text style={styles.headerStatus}>Online • {bookingId ? 'Booking Chat' : 'Direct'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callBtn}>
          <Phone size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={[styles.inputBar, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: c.surfaceAlt, borderColor: c.border, color: c.text }]}
            placeholder="Type a message..."
            placeholderTextColor={c.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]}
            onPress={sendMessage}
            disabled={!text.trim()}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginLeft: 12 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  headerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerStatus: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  callBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  messagesList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  msgRowRight: { justifyContent: 'flex-end' },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  myBubble: { backgroundColor: '#4169E1', borderBottomRightRadius: 4 },
  otherBubble: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, borderTopWidth: 1 },
  textInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4169E1', alignItems: 'center', justifyContent: 'center', shadowColor: '#4169E1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
});
