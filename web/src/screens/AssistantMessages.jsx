import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { safeGet, safePost } from '../api/safeGet';

// --- Helper Functions ---

function formatDateSeparator(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Hier";
  }
  
  const weekday = date.toLocaleDateString('fr-FR', { weekday: 'short' });
  const day = date.toLocaleDateString('fr-FR', { day: '2-digit' });
  const month = date.toLocaleDateString('fr-FR', { month: '2-digit' });
  const year = date.toLocaleDateString('fr-FR', { year: 'numeric' });

  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('.', '');

  return `${formattedWeekday}, ${day}/${month}/${year}`;
}


// --- Components ---

function CourseSidebar({ courses, onSelectCourse, selectedCourse }) {
  const groupedCourses = courses.reduce((acc, course) => {
    const auditoriumKey = `${course.auditorium_id}-${course.auditorium}`;
    if (!acc[auditoriumKey]) {
      acc[auditoriumKey] = {
        id: course.auditorium_id,
        name: course.auditorium,
        courses: []
      };
    }
    acc[auditoriumKey].courses.push(course);
    return acc;
  }, {});

  return (
    <div className="flex flex-col bg-slate-100 dark:bg-slate-800 w-1/4 min-h-screen p-4 border-r border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4">Discussions par Cours</h2>
      <nav className="flex flex-col gap-4">
        {Object.values(groupedCourses).map(auditorium => (
          <div key={auditorium.id} className="mb-2">
            <h3 className="text-lg font-semibold text-indigo-400 mb-2">{auditorium.name}</h3>
            {auditorium.courses.map(course => (
              <button
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className={`w-full text-left p-2 rounded-md transition-colors duration-200 mb-1 ${
                  selectedCourse?.id === course.id
                    ? 'bg-blue-500 text-white font-semibold'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <p className="font-medium">{course.title}</p>
                <p className="text-sm text-slate-400">{course.department}</p>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

function ChatArea({ course, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (!course || !course.code || !course.auditorium_id) {
        setMessages([]);
        return;
    }
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await safeGet(`/api/messaging/courses/${course.code}/auditoriums/${course.auditorium_id}/messages/`);
        setMessages(response || []);
        scrollToBottom();
      } catch (error) {
        console.error("Erreur lors de la récupération des messages:", error);
        setMessages([]);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [course]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !course || !course.code || !course.auditorium_id) return;
    try {
      const response = await safePost(`/api/messaging/courses/${course.code}/auditoriums/${course.auditorium_id}/messages/`, { text: newMessage });
      if(response) {
        setMessages(prev => [...prev, response]);
      }
      setNewMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  if (!course) {
    return <div className="flex-1 p-8 text-center text-slate-500">Sélectionnez un cours pour voir les messages.</div>;
  }

  if (loading) {
    return <div className="flex-1 p-8 text-center text-slate-500">Chargement des messages...</div>;
  }

  const chatElements = [];
  let lastDate = null;
  
  const getCurrentUserFullName = () => {
    if (currentUser && currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`.trim();
    }
    return currentUser?.full_name || '';
  };
  const currentUserFullName = getCurrentUserFullName();

  messages.forEach((msg) => {
    const msgDate = new Date(msg.timestamp).toDateString();
    if (msgDate !== lastDate) {
      chatElements.push(
        <div key={`date-${msgDate}`} className="text-center text-sm text-slate-400 my-4">
          {formatDateSeparator(msg.timestamp)}
        </div>
      );
      lastDate = msgDate;
    }

    const isSelf = msg.sender === currentUserFullName;
    const avatar = (
      <div className={`w-8 h-8 rounded-full ${isSelf ? 'bg-blue-500' : 'bg-slate-600'} flex-shrink-0 flex items-center justify-center font-bold text-white`}>
        {isSelf ? 'Moi' : msg.sender.charAt(0).toUpperCase()}
      </div>
    );
    const messageBubble = (
      <div className={`max-w-lg px-3 pt-2 pb-1 rounded-2xl ${isSelf ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 rounded-bl-none'}`}>
        {!isSelf && <p className="text-sm font-semibold text-slate-800 dark:text-white/80 mb-1">{msg.sender}</p>}
        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        <div className="text-right text-xs text-slate-500 dark:text-white/60 mt-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );

    chatElements.push(
      <div key={msg.id} className={`flex items-start gap-3 ${isSelf ? 'justify-end' : 'justify-start'}`}>
        {!isSelf && avatar}
        {messageBubble}
        {isSelf && avatar}
      </div>
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
      <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold">{course.title} ({course.auditorium})</h3>
        <p className="text-sm text-slate-400">{course.department}</p>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {chatElements.length > 0 ? chatElements : <p className="text-center text-slate-500">Aucun message pour ce cours.</p>}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-end p-1">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onInput={handleTextareaInput}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-transparent placeholder-slate-500 resize-none overflow-hidden focus:outline-none px-3 py-2"
              rows="1"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AssistantMessages() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [coursesResponse, userResponse] = await Promise.all([
            safeGet('/api/assistant/courses'),
            safeGet('/api/auth/me'),
        ]);
        const fetchedCourses = coursesResponse || [];
        setCourses(fetchedCourses);
        setCurrentUser(userResponse || {});

        const auditoriumId = searchParams.get('auditorium');
        const courseId = searchParams.get('course');

        if (courseId) {
            const courseToSelect = fetchedCourses.find(c => c.id === parseInt(courseId));
            if (courseToSelect) {
              setSelectedCourse(courseToSelect);
            }
        } else if (auditoriumId) {
          const courseToSelect = fetchedCourses.find(c => c.auditorium_id === parseInt(auditoriumId));
          if (courseToSelect) {
            setSelectedCourse(courseToSelect);
          }
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données initiales:", error);
      }
    };
    fetchInitialData();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen">
      <CourseSidebar 
        courses={courses} 
        onSelectCourse={setSelectedCourse}
        selectedCourse={selectedCourse}
      />
      <ChatArea key={selectedCourse?.id} course={selectedCourse} currentUser={currentUser} />
    </div>
  );
}
