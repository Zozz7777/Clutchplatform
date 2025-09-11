'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Image, 
  Video, 
  Music, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Edit,
  Eye,
  Search,
  Filter,
  Folder,
  Plus
} from 'lucide-react'

export default function MediaLibraryPage() {
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  const mediaFiles = [
    {
      id: 1,
      name: 'hero-banner.jpg',
      type: 'image',
      size: '2.4 MB',
      dimensions: '1920x1080',
      lastModified: '2 days ago',
      tags: ['banner', 'hero', 'homepage'],
      usage: 'Homepage Banner'
    },
    {
      id: 2,
      name: 'product-demo.mp4',
      type: 'video',
      size: '45.2 MB',
      dimensions: '1920x1080',
      lastModified: '1 week ago',
      tags: ['demo', 'product', 'video'],
      usage: 'Product Page'
    },
    {
      id: 3,
      name: 'notification-sound.mp3',
      type: 'audio',
      size: '1.8 MB',
      dimensions: 'N/A',
      lastModified: '3 days ago',
      tags: ['notification', 'sound', 'audio'],
      usage: 'Mobile App'
    },
    {
      id: 4,
      name: 'logo-white.png',
      type: 'image',
      size: '156 KB',
      dimensions: '512x512',
      lastModified: '1 month ago',
      tags: ['logo', 'branding', 'white'],
      usage: 'Header Logo'
    },
    {
      id: 5,
      name: 'user-guide.pdf',
      type: 'document',
      size: '3.2 MB',
      dimensions: 'N/A',
      lastModified: '2 weeks ago',
      tags: ['guide', 'documentation', 'pdf'],
      usage: 'Help Center'
    },
    {
      id: 6,
      name: 'team-photo.jpg',
      type: 'image',
      size: '4.1 MB',
      dimensions: '2048x1536',
      lastModified: '1 week ago',
      tags: ['team', 'photo', 'about'],
      usage: 'About Page'
    }
  ]

  const mediaStats = [
    {
      name: 'Total Files',
      value: '1,247',
      change: '+89',
      trend: 'up'
    },
    {
      name: 'Storage Used',
      value: '2.4 GB',
      change: '+156 MB',
      trend: 'up'
    },
    {
      name: 'Images',
      value: '892',
      change: '+45',
      trend: 'up'
    },
    {
      name: 'Videos',
      value: '156',
      change: '+12',
      trend: 'up'
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'audio': return <Music className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'text-blue-600 bg-blue-100'
      case 'video': return 'text-purple-600 bg-purple-100'
      case 'audio': return 'text-green-600 bg-green-100'
      case 'document': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === 'all' || file.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Manage images, videos, audio files, and documents
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Media Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        {mediaStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>
            </div>
            <div className="flex space-x-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Files */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {file.type === 'image' ? (
                  <Image className="h-12 w-12 text-gray-400" />
                ) : file.type === 'video' ? (
                  <Video className="h-12 w-12 text-gray-400" />
                ) : file.type === 'audio' ? (
                  <Music className="h-12 w-12 text-gray-400" />
                ) : (
                  <FileText className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <CardContent className="p-3">
                <h4 className="font-medium text-sm truncate">{file.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getTypeColor(file.type)}>
                    {file.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {file.size}
                  </span>
                </div>
                <div className="flex space-x-1 mt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredFiles.map((file) => (
                <div key={file.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTypeIcon(file.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{file.size}</span>
                          <span>{file.dimensions}</span>
                          <span>Modified {file.lastModified}</span>
                          <span>Used in: {file.usage}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {file.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Media</CardTitle>
          <CardDescription>
            Add new images, videos, audio files, or documents to your media library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Upload Media Files</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here, or click to select files
            </p>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supports: PNG, JPG, MP4, MP3, PDF (Max 100MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Media Library Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Media Library Overview</CardTitle>
          <CardDescription>
            Summary of media usage and storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Image className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Most Used Type</h3>
              <p className="text-sm text-muted-foreground">Images (71%)</p>
              <p className="text-lg font-bold">892 files</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Video className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Largest Files</h3>
              <p className="text-sm text-muted-foreground">Videos (45.2 MB avg)</p>
              <p className="text-lg font-bold">156 files</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Folder className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Storage Usage</h3>
              <p className="text-sm text-muted-foreground">2.4 GB of 10 GB</p>
              <p className="text-lg font-bold">24% used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
