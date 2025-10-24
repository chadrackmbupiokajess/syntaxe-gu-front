import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

// --- Composants de la page ---

function CourseSidebar({ courses, onSelectCourse, selectedCourseId }) {
  return (
    <div className="flex flex-col bg-slate-800 text-white w-1/4 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Mes Cours</h2>
      <nav className="flex flex-col gap-2">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => onSelectCourse(course.id)}
            className={`text-left p-2 rounded-md transition-colors duration-200 ${
              selectedCourseId === course.id
                ? 'bg-blue-600 font-semibold'
                : 'hover:bg-slate-700'
            }`}
          >
            <p className="font-medium">{course.title}</p>
            <p className="text-sm text-white/60">{course.auditorium}</p>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ChatArea({ courseId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (!courseId) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/assistant/courses/${courseId}/messages`);
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error("Erreur lors de la récupération des messages:", error);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [courseId]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const response = await axios.post(`/api/assistant/courses/${courseId}/messages`, { body: newMessage });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  if (!courseId) {
    return <div className="flex-1 p-8 text-center text-white/70">Sélectionnez un cours pour voir les messages.</div>;
  }

  if (loading) {
    return <div className="flex-1 p-8 text-center text-white/70">Chargement des messages...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.is_self ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg p-3 rounded-lg ${msg.is_self ? 'bg-blue-700' : 'bg-slate-700'}`}>
                {!msg.is_self && <p className="text-sm font-semibold text-white/80 mb-1">{msg.sender}</p>}
                <p>{msg.body}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 bg-slate-800">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="input flex-1"
          />
          <button type="submit" className="btn">Envoyer</button>
        </form>
      </div>
    </div>
  );
}

export default function AssistantMessages() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/assistant/courses');
        const fetchedCourses = response.data;
        setCourses(fetchedCourses);

        const auditoriumCode = searchParams.get('auditorium');
        if (auditoriumCode) {
          const courseToSelect = fetchedCourses.find(c => c.auditorium === auditoriumCode);
          if (courseToSelect) {
            setSelectedCourseId(courseToSelect.id);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des cours:", error);
      }
    };
    fetchCourses();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <CourseSidebar 
        courses={courses} 
        onSelectCourse={setSelectedCourseId}
        selectedCourseId={selectedCourseId}
      />
      <ChatArea courseId={selectedCourseId} />
    </div>
  );
}
