'use client'

import React, { useState, useEffect } from 'react'
import { LuxuryButton } from '@/components/ui/luxury-button'
import { LuxuryCard } from '@/components/ui/luxury-card'
import { LuxuryInput } from '@/components/ui/luxury-input'
import { 
  Bot, 
  Send, 
  Sparkles, 
  Brain, 
  Zap, 
  Crown, 
  Gem,
  X,
  Minimize2,
  Maximize2,
  MessageCircle,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Users,
  Settings
} from 'lucide-react'

interface LuxuryAIAssistantProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  isMinimized: boolean
}

export function LuxuryAIAssistant({ 
  isOpen, 
  onClose, 
  onMinimize, 
  onMaximize, 
  isMinimized 
}: LuxuryAIAssistantProps) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your luxury AI assistant. How can I help you today?',
      timestamp: new Date(),
      suggestions: [
        'Show me analytics insights',
        'Optimize user experience',
        'Generate reports',
        'Help with navigation'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState(0)

  // Auto-rotate suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion(prev => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      suggestions: []
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
        suggestions: [
          'Show me more details',
          'Generate a report',
          'Optimize this further',
          'What else can you help with?'
        ]
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (input: string) => {
    const responses = [
      "I've analyzed your request and here are my insights...",
      "Based on the data patterns, I recommend...",
      "Let me provide you with a comprehensive analysis...",
      "I've identified several optimization opportunities...",
      "Here's what I found in your system...",
      "I can help you implement this solution..."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  if (!isOpen) return null

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <LuxuryCard 
        variant="glass" 
        className={`h-full flex flex-col overflow-hidden ${
          isMinimized ? 'p-4' : 'p-0'
        }`}
        effect="glow"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 bg-gradient-to-r from-luxury-gold-500/10 to-luxury-diamond-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-luxury-gold-500 to-luxury-diamond-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                AI Assistant
                <Crown className="h-4 w-4 text-luxury-gold-500" />
              </h3>
              <p className="text-xs text-luxury-gold-600 font-medium">Premium Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LuxuryButton
              variant="glass"
              size="icon-sm"
              onClick={isMinimized ? onMaximize : onMinimize}
              className="hover:scale-110 transition-transform duration-300"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </LuxuryButton>
            <LuxuryButton
              variant="glass"
              size="icon-sm"
              onClick={onClose}
              className="hover:scale-110 transition-transform duration-300"
            >
              <X className="h-4 w-4" />
            </LuxuryButton>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-luxury-gold-500 to-luxury-diamond-500 text-white' 
                      : 'bg-white/50 backdrop-blur-md border border-white/20'
                  } rounded-2xl p-3 shadow-lg`}>
                    <p className="text-sm font-medium">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-luxury-gold-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-luxury-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-luxury-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-slate-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="p-4 border-t border-white/20 bg-gradient-to-r from-luxury-gold-500/5 to-luxury-diamond-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-luxury-gold-500" />
                <span className="text-sm font-bold text-slate-700">Quick Actions</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: BarChart3, label: 'Analytics', color: 'luxury-diamond' },
                  { icon: Users, label: 'Users', color: 'luxury-emerald' },
                  { icon: TrendingUp, label: 'Growth', color: 'luxury-gold' },
                  { icon: Settings, label: 'Settings', color: 'luxury-platinum' }
                ].map((action, index) => (
                  <LuxuryButton
                    key={index}
                    variant="glass"
                    size="sm"
                    className="justify-start hover:scale-105 transition-transform duration-300"
                    onClick={() => handleSuggestionClick(action.label)}
                  >
                    <action.icon className={`h-4 w-4 mr-2 text-${action.color}-500`} />
                    {action.label}
                  </LuxuryButton>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex gap-2">
                <LuxuryInput
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  variant="glass"
                  className="flex-1 h-8"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <LuxuryButton
                  variant="luxury"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="hover:scale-110 transition-transform duration-300"
                >
                  <Send className="h-4 w-4" />
                </LuxuryButton>
              </div>
            </div>
          </>
        )}

        {isMinimized && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-luxury-gold-500" />
              <span className="text-sm font-medium text-slate-700">AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-luxury-gold-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">Online</span>
            </div>
          </div>
        )}
      </LuxuryCard>
    </div>
  )
}
