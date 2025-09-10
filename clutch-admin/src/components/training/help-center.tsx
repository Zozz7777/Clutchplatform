'use client'

import React, { useState, useEffect } from 'react'
import { useApp } from '@/hooks/use-app'
import { InteractiveTour, tours } from './interactive-tour'
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Search, 
  Filter, 
  Play, 
  Download, 
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Users,
  Zap,
  Shield,
  Smartphone,
  X
} from 'lucide-react'

interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  lastUpdated: Date
  helpful: number
  views: number
}

interface VideoTutorial {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  url: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export function HelpCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'tours' | 'support'>('articles')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [activeTour, setActiveTour] = useState<string | null>(null)
  
  const { analytics } = useApp()

  // Mock data - in a real app, this would come from an API
  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Clutch Admin v2.0',
      content: 'Learn the basics of the new Clutch Admin interface...',
      category: 'Getting Started',
      tags: ['basics', 'navigation', 'interface'],
      difficulty: 'beginner',
      estimatedTime: '5 min',
      lastUpdated: new Date('2024-12-01'),
      helpful: 45,
      views: 120
    },
    {
      id: '2',
      title: 'Using Smart Search Effectively',
      content: 'Master the intelligent search feature to find information quickly...',
      category: 'Features',
      tags: ['search', 'navigation', 'tips'],
      difficulty: 'intermediate',
      estimatedTime: '3 min',
      lastUpdated: new Date('2024-12-01'),
      helpful: 32,
      views: 89
    },
    {
      id: '3',
      title: 'Performance Optimization Guide',
      content: 'Learn how to optimize your experience for better performance...',
      category: 'Performance',
      tags: ['performance', 'optimization', 'speed'],
      difficulty: 'advanced',
      estimatedTime: '10 min',
      lastUpdated: new Date('2024-11-30'),
      helpful: 28,
      views: 67
    }
  ]

  const videoTutorials: VideoTutorial[] = [
    {
      id: '1',
      title: 'Welcome to Clutch Admin v2.0',
      description: 'Overview of new features and improvements',
      duration: '5:30',
      thumbnail: '/thumbnails/welcome.jpg',
      url: '/videos/welcome.mp4',
      category: 'Getting Started',
      difficulty: 'beginner'
    },
    {
      id: '2',
      title: 'Smart Navigation Tutorial',
      description: 'Learn how to use the enhanced navigation system',
      duration: '8:15',
      thumbnail: '/thumbnails/navigation.jpg',
      url: '/videos/navigation.mp4',
      category: 'Features',
      difficulty: 'intermediate'
    },
    {
      id: '3',
      title: 'Accessibility Features',
      description: 'Understanding accessibility features and keyboard navigation',
      duration: '12:45',
      thumbnail: '/thumbnails/accessibility.jpg',
      url: '/videos/accessibility.mp4',
      category: 'Accessibility',
      difficulty: 'beginner'
    }
  ]

  const categories = [
    'All',
    'Getting Started',
    'Features',
    'Performance',
    'Accessibility',
    'Troubleshooting',
    'API Reference'
  ]

  const difficulties = [
    'All',
    'Beginner',
    'Intermediate',
    'Advanced'
  ]

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty.toLowerCase()
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const filteredVideos = videoTutorials.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty.toLowerCase()
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const startTour = (tourId: string) => {
    setActiveTour(tourId)
    analytics.trackEvent('help_tour_started', { tourId })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Getting Started': return <Play className="h-4 w-4" />
      case 'Features': return <Zap className="h-4 w-4" />
      case 'Performance': return <Zap className="h-4 w-4" />
      case 'Accessibility': return <Shield className="h-4 w-4" />
      case 'Troubleshooting': return <HelpCircle className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
        aria-label="Open help center"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)} />
      
      <div className="fixed inset-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Help Center</h2>
            <p className="text-gray-600">Get help with Clutch Admin v2.0</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search help articles, videos, and tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Filter className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex border-b border-gray-200">
          {[
            { id: 'articles', label: 'Articles', icon: BookOpen },
            { id: 'videos', label: 'Videos', icon: Video },
            { id: 'tours', label: 'Tours', icon: Play },
            { id: 'support', label: 'Support', icon: MessageCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'articles' && (
            <div className="space-y-4">
              {filteredArticles.map(article => (
                <div key={article.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(article.difficulty)}`}>
                        {article.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{article.estimatedTime}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{article.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        {getCategoryIcon(article.category)}
                        <span>{article.category}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{article.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{article.views} views</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                        <Star className="h-4 w-4" />
                        <span>{article.helpful}</span>
                      </button>
                      <button className="text-sm text-primary hover:text-primary-dark">
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => (
                <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(video.difficulty)}`}>
                          {video.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{video.category}</span>
                      </div>
                      
                      <button className="flex items-center space-x-1 text-sm text-primary hover:text-primary-dark">
                        <Play className="h-4 w-4" />
                        <span>Watch</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tours' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Tours</h3>
                <p className="text-gray-600 mb-6">Take guided tours to learn about specific features and improvements.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(tours).map(([tourId, steps]) => (
                  <div key={tourId} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 capitalize">
                          {tourId.replace('-', ' ')} Tour
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {steps.length} steps • {Math.ceil(steps.length * 0.5)} minutes
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{Math.ceil(steps.length * 0.5)}m</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {steps[0]?.description || 'Learn about this feature with an interactive tour.'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {steps.length} steps
                        </span>
                      </div>
                      
                      <button
                        onClick={() => startTour(tourId)}
                        className="flex items-center space-x-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start Tour</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Get Support</h3>
                <p className="text-gray-600 mb-6">Need help? Contact our support team or use the feedback system.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                    <h4 className="text-lg font-semibold text-gray-900">Feedback System</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Submit feedback, report bugs, or request new features directly from the application.
                  </p>
                  <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    Open Feedback Widget
                  </button>
                </div>
                
                <div className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <ExternalLink className="h-6 w-6 text-primary" />
                    <h4 className="text-lg font-semibold text-gray-900">Contact Support</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Get direct help from our support team via email or phone.
                  </p>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Email Support
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Phone Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {activeTour && (
        <InteractiveTour
          isOpen={!!activeTour}
          onClose={() => setActiveTour(null)}
          tourId={activeTour}
          steps={tours[activeTour as keyof typeof tours] || []}
          onComplete={() => {
            analytics.trackEvent('help_tour_completed', { tourId: activeTour })
            setActiveTour(null)
          }}
        />
      )}
    </>
  )
}

export default HelpCenter
