'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  Upload, 
  Download, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Settings,
  Image,
  Type,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { brandCustomizer, getCurrentBrandConfig, BrandConfig, BrandColors } from '@/lib/brand-config'
import { toast } from 'sonner'

export default function BrandingPage() {
  const [config, setConfig] = useState<BrandConfig>(getCurrentBrandConfig())
  const [isLoading, setIsLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('colors')

  // Apply brand changes
  const applyBrandChanges = () => {
    brandCustomizer.updateColors(config.colors)
    brandCustomizer.updateLogo(config.logo)
    brandCustomizer.applyBrandCSS()
    
    toast.success('Brand Updated', {
      description: 'Your brand changes have been applied successfully'
    })
  }

  // Reset to default
  const resetToDefault = () => {
    const defaultConfig = getCurrentBrandConfig()
    setConfig(defaultConfig)
    brandCustomizer.updateColors(defaultConfig.colors)
    brandCustomizer.updateLogo(defaultConfig.logo)
    brandCustomizer.applyBrandCSS()
    
    toast.success('Brand Reset', {
      description: 'Brand has been reset to default configuration'
    })
  }

  // Export configuration
  const exportConfig = () => {
    const configJson = brandCustomizer.exportConfig()
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'brand-config.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Configuration Exported', {
      description: 'Brand configuration has been exported'
    })
  }

  // Import configuration
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const configJson = e.target?.result as string
        brandCustomizer.importConfig(configJson)
        setConfig(brandCustomizer.getConfig())
        
        toast.success('Configuration Imported', {
          description: 'Brand configuration has been imported successfully'
        })
      } catch (error) {
        toast.error('Import Failed', {
          description: 'Failed to import brand configuration'
        })
      }
    }
    reader.readAsText(file)
  }

  // Handle color change
  const handleColorChange = (colorKey: keyof BrandColors, value: string) => {
    setConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }))
  }

  // Handle neutral color change
  const handleNeutralColorChange = (shade: keyof BrandColors['neutral'], value: string) => {
    setConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        neutral: {
          ...prev.colors.neutral,
          [shade]: value
        }
      }
    }))
  }

  // Handle logo change
  const handleLogoChange = (logoKey: keyof BrandConfig['logo'], value: string) => {
    setConfig(prev => ({
      ...prev,
      logo: {
        ...prev.logo,
        [logoKey]: value
      }
    }))
  }

  // Color picker component
  const ColorPicker = ({ 
    label, 
    value, 
    onChange, 
    description 
  }: { 
    label: string
    value: string
    onChange: (value: string) => void
    description?: string
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Customization</h1>
          <p className="text-gray-600">
            Customize your brand colors, logos, and visual identity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={resetToDefault}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={exportConfig}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-config')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <input
            id="import-config"
            type="file"
            accept=".json"
            onChange={importConfig}
            className="hidden"
          />
          <Button
            onClick={applyBrandChanges}
            className="bg-primary hover:bg-primary-dark"
          >
            <Save className="h-4 w-4 mr-2" />
            Apply Changes
          </Button>
        </div>
      </div>

      {/* Preview Banner */}
      {previewMode && (
        <Card className="border-2 border-dashed border-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: config.colors.primary }}
                >
                  {config.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{config.name} Admin</h3>
                  <p className="text-sm text-gray-600">Brand Preview</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: config.colors.primary }}
                />
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: config.colors.secondary }}
                />
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: config.colors.accent }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="logos">Logos</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Primary Colors
                </CardTitle>
                <CardDescription>
                  Main brand colors used throughout the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorPicker
                  label="Primary"
                  value={config.colors.primary}
                  onChange={(value) => handleColorChange('primary', value)}
                  description="Main brand color for buttons, links, and highlights"
                />
                <ColorPicker
                  label="Primary Dark"
                  value={config.colors.primaryDark}
                  onChange={(value) => handleColorChange('primaryDark', value)}
                  description="Darker shade for hover states and emphasis"
                />
                <ColorPicker
                  label="Primary Light"
                  value={config.colors.primaryLight}
                  onChange={(value) => handleColorChange('primaryLight', value)}
                  description="Lighter shade for backgrounds and subtle elements"
                />
              </CardContent>
            </Card>

            {/* Secondary Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Secondary Colors
                </CardTitle>
                <CardDescription>
                  Supporting colors for variety and hierarchy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorPicker
                  label="Secondary"
                  value={config.colors.secondary}
                  onChange={(value) => handleColorChange('secondary', value)}
                  description="Secondary brand color for accents and variety"
                />
                <ColorPicker
                  label="Secondary Dark"
                  value={config.colors.secondaryDark}
                  onChange={(value) => handleColorChange('secondaryDark', value)}
                  description="Darker shade for secondary elements"
                />
                <ColorPicker
                  label="Secondary Light"
                  value={config.colors.secondaryLight}
                  onChange={(value) => handleColorChange('secondaryLight', value)}
                  description="Lighter shade for secondary backgrounds"
                />
              </CardContent>
            </Card>

            {/* Semantic Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Semantic Colors
                </CardTitle>
                <CardDescription>
                  Colors for success, warning, error, and info states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorPicker
                  label="Success"
                  value={config.colors.success}
                  onChange={(value) => handleColorChange('success', value)}
                  description="Color for success messages and positive actions"
                />
                <ColorPicker
                  label="Warning"
                  value={config.colors.warning}
                  onChange={(value) => handleColorChange('warning', value)}
                  description="Color for warning messages and caution states"
                />
                <ColorPicker
                  label="Error"
                  value={config.colors.error}
                  onChange={(value) => handleColorChange('error', value)}
                  description="Color for error messages and destructive actions"
                />
                <ColorPicker
                  label="Info"
                  value={config.colors.info}
                  onChange={(value) => handleColorChange('info', value)}
                  description="Color for informational messages and neutral states"
                />
              </CardContent>
            </Card>

            {/* Neutral Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Neutral Colors
                </CardTitle>
                <CardDescription>
                  Grayscale colors for text, borders, and backgrounds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(config.colors.neutral).map(([shade, value]) => (
                    <ColorPicker
                      key={shade}
                      label={`Neutral ${shade}`}
                      value={value}
                      onChange={(value) => handleNeutralColorChange(shade as any, value)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image className="h-5 w-5" />
                Logo Configuration
              </CardTitle>
              <CardDescription>
                Upload and configure your brand logos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Light Logo URL</Label>
                  <Input
                    value={config.logo.light}
                    onChange={(e) => handleLogoChange('light', e.target.value)}
                    placeholder="https://example.com/logo-light.svg"
                  />
                  <p className="text-xs text-gray-500">
                    Logo for light backgrounds and themes
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Dark Logo URL</Label>
                  <Input
                    value={config.logo.dark}
                    onChange={(e) => handleLogoChange('dark', e.target.value)}
                    placeholder="https://example.com/logo-dark.svg"
                  />
                  <p className="text-xs text-gray-500">
                    Logo for dark backgrounds and themes
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input
                    value={config.logo.favicon}
                    onChange={(e) => handleLogoChange('favicon', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                  <p className="text-xs text-gray-500">
                    Small icon for browser tabs and bookmarks
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Logo Dimensions</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={config.logo.width}
                      onChange={(e) => handleLogoChange('width', parseInt(e.target.value).toString())}
                      placeholder="120"
                    />
                    <Input
                      type="number"
                      value={config.logo.height}
                      onChange={(e) => handleLogoChange('height', parseInt(e.target.value).toString())}
                      placeholder="40"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Width and height in pixels
                  </p>
                </div>
              </div>

              {/* Logo Preview */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Logo Preview</h4>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-2">
                      <img
                        src={config.logo.light}
                        alt="Light Logo"
                        className="max-w-full h-auto"
                        style={{ 
                          width: config.logo.width,
                          height: config.logo.height 
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">Light Theme</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-800 p-4 rounded-lg shadow-sm mb-2">
                      <img
                        src={config.logo.dark}
                        alt="Dark Logo"
                        className="max-w-full h-auto"
                        style={{ 
                          width: config.logo.width,
                          height: config.logo.height 
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">Dark Theme</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography Settings
              </CardTitle>
              <CardDescription>
                Configure fonts and text styling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Font Family (Sans)</Label>
                  <Input
                    value={config.typography.fontFamily.sans.join(', ')}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      typography: {
                        ...prev.typography,
                        fontFamily: {
                          ...prev.typography.fontFamily,
                          sans: e.target.value.split(',').map(f => f.trim())
                        }
                      }
                    }))}
                    placeholder="Inter, system-ui, sans-serif"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Font Family (Mono)</Label>
                  <Input
                    value={config.typography.fontFamily.mono.join(', ')}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      typography: {
                        ...prev.typography,
                        fontFamily: {
                          ...prev.typography.fontFamily,
                          mono: e.target.value.split(',').map(f => f.trim())
                        }
                      }
                    }))}
                    placeholder="JetBrains Mono, Consolas, monospace"
                  />
                </div>
              </div>

              {/* Typography Preview */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Typography Preview</h4>
                <div className="space-y-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">Heading 1</h1>
                    <p className="text-sm text-gray-500">4xl / Bold</p>
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-900">Heading 2</h2>
                    <p className="text-sm text-gray-500">3xl / Semibold</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900">Heading 3</h3>
                    <p className="text-sm text-gray-500">2xl / Medium</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-700">
                      This is a paragraph with regular text. It demonstrates the default font family and sizing.
                    </p>
                    <p className="text-sm text-gray-500">Base / Normal</p>
                  </div>
                  <div>
                    <code className="text-sm bg-gray-200 px-2 py-1 rounded font-mono">
                      const code = "monospace font"
                    </code>
                    <p className="text-sm text-gray-500">Mono / Small</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
