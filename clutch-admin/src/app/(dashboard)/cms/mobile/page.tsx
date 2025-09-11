'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Smartphone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload,
  Image,
  FileText,
  Video,
  Music,
  Download,
  Share
} from 'lucide-react'

export default function MobileCMSPage() {
  const [selectedTab, setSelectedTab] = useState('content')

  const mobileContent = [
    {
      id: 1,
      title: 'Welcome Screen',
      type: 'screen',
      status: 'published',
      lastModified: '2 hours ago',
      views: 1247,
      author: 'Sarah Johnson'
    },
    {
      id: 2,
      title: 'Onboarding Tutorial',
      type: 'tutorial',
      status: 'draft',
      lastModified: '1 day ago',
      views: 0,
      author: 'Tom Brown'
    },
    {
      id: 3,
      title: 'Help Center',
      type: 'help',
      status: 'published',
      lastModified: '3 days ago',
      views: 892,
      author: 'Emily Davis'
    },
    {
      id: 4,
      title: 'Feature Announcement',
      type: 'announcement',
      status: 'scheduled',
      lastModified: '1 week ago',
      views: 0,
      author: 'Mike Wilson'
    }
  ]

  const mediaAssets = [
    {
      id: 1,
      name: 'app-icon.png',
      type: 'image',
      size: '2.4 MB',
      dimensions: '1024x1024',
      lastModified: '2 days ago'
    },
    {
      id: 2,
      name: 'welcome-video.mp4',
      type: 'video',
      size: '15.2 MB',
      dimensions: '1920x1080',
      lastModified: '1 week ago'
    },
    {
      id: 3,
      name: 'notification-sound.mp3',
      type: 'audio',
      size: '1.8 MB',
      dimensions: 'N/A',
      lastModified: '3 days ago'
    },
    {
      id: 4,
      name: 'splash-screen.jpg',
      type: 'image',
      size: '3.1 MB',
      dimensions: '1080x1920',
      lastModified: '5 days ago'
    }
  ]

  const appSettings = [
    {
      name: 'App Version',
      value: '2.1.4',
      status: 'current'
    },
    {
      name: 'Minimum OS Version',
      value: 'iOS 14.0 / Android 8.0',
      status: 'current'
    },
    {
      name: 'Force Update',
      value: 'Disabled',
      status: 'warning'
    },
    {
      name: 'Maintenance Mode',
      value: 'Disabled',
      status: 'current'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      case 'scheduled': return 'text-blue-600 bg-blue-100'
      case 'current': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      // eslint-disable-next-line jsx-a11y/alt-text
      case 'image': return <Image className="h-4 w-4" />
      // eslint-disable-next-line jsx-a11y/alt-text
      case 'video': return <Video className="h-4 w-4" />
      // eslint-disable-next-line jsx-a11y/alt-text
      case 'audio': return <Music className="h-4 w-4" />
      // eslint-disable-next-line jsx-a11y/alt-text
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mobile App CMS</h1>
          <p className="text-muted-foreground">
            Manage mobile app content, media, and settings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Content
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'content', label: 'Content' },
          { id: 'media', label: 'Media Assets' },
          { id: 'settings', label: 'App Settings' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {selectedTab === 'content' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mobile App Content</CardTitle>
              <CardDescription>
                Manage screens, tutorials, and announcements for the mobile app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mobileContent.map((content) => (
                  <div key={content.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{content.title}</h3>
                          <Badge className={getStatusColor(content.status)}>
                            {content.status}
                          </Badge>
                          <Badge variant="outline">{content.type}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Modified {content.lastModified}</span>
                          <span>By {content.author}</span>
                          <span>{content.views} views</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
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
        </div>
      )}

      {/* Media Tab */}
      {selectedTab === 'media' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Assets</CardTitle>
              <CardDescription>
                Manage images, videos, and audio files for the mobile app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mediaAssets.map((asset) => (
                  <div key={asset.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTypeIcon(asset.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{asset.name}</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{asset.size}</p>
                          <p>{asset.dimensions}</p>
                          <p>Modified {asset.lastModified}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload New Media</CardTitle>
              <CardDescription>
                Add new images, videos, or audio files to the mobile app
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
                  Supports: PNG, JPG, MP4, MP3 (Max 50MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>
                Configure mobile app version, updates, and maintenance settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appSettings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{setting.name}</h4>
                      <p className="text-sm text-muted-foreground">{setting.value}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(setting.status)}>
                        {setting.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* App Store Settings */}
          <Card>
            <CardHeader>
              <CardTitle>App Store Settings</CardTitle>
              <CardDescription>
                Manage app store listings and release information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">iOS App Store</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Version 2.1.4 - Published
                  </p>
                  <Button variant="outline" size="sm">
                    <Share className="mr-2 h-4 w-4" />
                    View Store
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Google Play Store</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Version 2.1.4 - Published
                  </p>
                  <Button variant="outline" size="sm">
                    <Share className="mr-2 h-4 w-4" />
                    View Store
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile App Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Assets</CardTitle>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">App Downloads</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K</div>
            <p className="text-xs text-muted-foreground">
              +8.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.8K</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
