import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Brain, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ChatBot = () => {
  const { user } = useAuth(); // Get user from AuthContext
  const [isOpen, setIsOpen] = useState(false);

  // Show access denied message for non-student or unauthenticated users
  if (!user || user.role !== 'student') {
    return (
      <div className="fixed bottom-4 right-4 p-4 bg-white/10 backdrop-blur-md text-blue-100 rounded-lg shadow-lg border border-white/20 flex items-center space-x-2">
        <Lock className="h-5 w-5 text-blue-300" />
        <span className="text-sm">This chatbot is only available for students.</span>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-20 right-4 w-96 h-[700px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">AI Learning Assistant</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chatbase Iframe */}
            <div className="flex-1 bg-white">
              <iframe
                src="https://www.chatbase.co/chatbot-iframe/ZGDUtXMBxveIpNdUbPfxF"
                width="100%"
                style={{ height: '100%', minHeight: '600px' }}
                frameBorder="0"
                title="AI Learning Assistant"
                className="rounded-b-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50 group"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <Brain className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
          </>
        )}
      </motion.button>
    </>
  );
};

export default ChatBot;
