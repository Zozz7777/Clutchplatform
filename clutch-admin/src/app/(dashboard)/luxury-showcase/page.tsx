"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Heart, 
  Zap, 
  Crown, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  User,
  Settings,
  Bell,
  Search,
  Plus,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Home,
  Users,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Gift,
  Sparkles,
  Diamond,
  Gem,
  Coins,
  Wallet,
  CreditCard,
  Banknote,
  Receipt,
  Calculator,
  Percent,
  DollarSign,
  Euro,
  PoundSterling,
  JapaneseYen,
  Bitcoin,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  RefreshCw,
  RefreshCcw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  Image,
  File,
  Folder,
  FolderOpen,
  Archive,
  Bookmark,
  BookmarkCheck,
  Flag,
  FlagOff,
  Tag,
  Tags,
  Hash,
  AtSign,
  Link,
  Link2Off,
  Share,
  Share2,
  Copy,
  Clipboard,
  ClipboardCheck,
  ClipboardCopy,
  ClipboardList,
  ClipboardX,
  Scissors,
  Undo,
  Redo,
  Save,
  FileDown,
  FileText,
  XCircle,
  X,
  Check,
  Minus,
  Plus as PlusIcon,
  Equal,
  Infinity,
  Pi,
  Sigma
} from 'lucide-react';

// Import luxury components
import { LuxuryButton } from '@/components/ui/luxury-button';
import { LuxuryCard } from '@/components/ui/luxury-card';
import { LuxuryInput } from '@/components/ui/luxury-input';
import LuxuryModal from '@/components/ui/luxury-modal';
import LuxuryTooltip from '@/components/ui/luxury-tooltip';
import LuxuryDropdown from '@/components/ui/luxury-dropdown';
import LuxuryBadge from '@/components/ui/luxury-badge';
import LuxuryProgress from '@/components/ui/luxury-progress';
import LuxuryTabs from '@/components/ui/luxury-tabs';
import LuxuryAccordion from '@/components/ui/luxury-accordion';
import LuxuryAlert from '@/components/ui/luxury-alert';
import LuxurySkeleton from '@/components/ui/luxury-skeleton';
import LuxuryToast, { useLuxuryToast } from '@/components/ui/luxury-toast';
import LuxuryAvatar from '@/components/ui/luxury-avatar';
import LuxuryDivider from '@/components/ui/luxury-divider';
import LuxurySpinner from '@/components/ui/luxury-spinner';
import LuxurySwitch from '@/components/ui/luxury-switch';
import LuxuryCheckbox from '@/components/ui/luxury-checkbox';
import LuxuryRadio from '@/components/ui/luxury-radio';
import LuxurySlider from '@/components/ui/luxury-slider';
import LuxuryRating from '@/components/ui/luxury-rating';
import LuxuryTimeline from '@/components/ui/luxury-timeline';
import LuxuryStepper from '@/components/ui/luxury-stepper';
import LuxuryCalendar from '@/components/ui/luxury-calendar';
import LuxuryPagination from '@/components/ui/luxury-pagination';
import LuxuryBreadcrumb from '@/components/ui/luxury-breadcrumb';
import LuxuryTag from '@/components/ui/luxury-tag';

const LuxuryShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [sliderValue, setSliderValue] = useState(50);
  const [ratingValue, setRatingValue] = useState(4);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedOption, setSelectedOption] = useState('option1');
  const [activeTab, setActiveTab] = useState('tab1');
  const [expandedAccordion, setExpandedAccordion] = useState<string[]>([]);

  const { toasts, addToast, removeToast, success, error, warning, info } = useLuxuryToast();

  const dropdownOptions = [
    { value: 'option1', label: 'Option 1', icon: <Star className="w-4 h-4" /> },
    { value: 'option2', label: 'Option 2', icon: <Heart className="w-4 h-4" /> },
    { value: 'option3', label: 'Option 3', icon: <Zap className="w-4 h-4" /> },
  ];

  const tabs = [
    {
      id: 'tab1',
      label: 'Overview',
      content: (
        <div className="space-y-luxury-md">
          <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-900">
            Overview Content
          </h3>
          <p className="text-luxury-platinum-600">
            This is the overview tab content with luxury styling and premium design elements.
          </p>
        </div>
      ),
    },
    {
      id: 'tab2',
      label: 'Details',
      content: (
        <div className="space-y-luxury-md">
          <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-900">
            Details Content
          </h3>
          <p className="text-luxury-platinum-600">
            This is the details tab content with luxury styling and premium design elements.
          </p>
        </div>
      ),
    },
    {
      id: 'tab3',
      label: 'Settings',
      content: (
        <div className="space-y-luxury-md">
          <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-900">
            Settings Content
          </h3>
          <p className="text-luxury-platinum-600">
            This is the settings tab content with luxury styling and premium design elements.
          </p>
        </div>
      ),
    },
  ];

  const accordionItems = [
    {
      id: 'item1',
      title: 'What is luxury design?',
      content: (
        <div className="space-y-luxury-sm">
          <p className="text-luxury-platinum-600">
            Luxury design is about creating premium experiences through sophisticated visual elements,
            refined typography, and elegant interactions.
          </p>
        </div>
      ),
    },
    {
      id: 'item2',
      title: 'How to implement luxury components?',
      content: (
        <div className="space-y-luxury-sm">
          <p className="text-luxury-platinum-600">
            Luxury components are built with premium materials, sophisticated animations,
            and attention to detail that creates a sense of exclusivity and quality.
          </p>
        </div>
      ),
    },
    {
      id: 'item3',
      title: 'Best practices for luxury UI?',
      content: (
        <div className="space-y-luxury-sm">
          <p className="text-luxury-platinum-600">
            Focus on quality over quantity, use premium materials, implement sophisticated
            micro-interactions, and maintain consistency across all design elements.
          </p>
        </div>
      ),
    },
  ];

  const timelineItems = [
    {
      id: 'step1',
      title: 'Design System',
      description: 'Created luxury design tokens and components',
      timestamp: '2 hours ago',
      status: 'completed' as const,
    },
    {
      id: 'step2',
      title: 'Component Library',
      description: 'Built comprehensive luxury component library',
      timestamp: '1 hour ago',
      status: 'completed' as const,
    },
    {
      id: 'step3',
      title: 'Integration',
      description: 'Integrating luxury components into application',
      timestamp: '30 minutes ago',
      status: 'current' as const,
    },
    {
      id: 'step4',
      title: 'Testing',
      description: 'Testing luxury components and interactions',
      timestamp: 'In progress',
      status: 'pending' as const,
    },
  ];

  const stepperSteps = [
    {
      id: 'step1',
      title: 'Design',
      description: 'Create luxury design system',
      content: <div className="p-luxury-md">Design system content</div>,
    },
    {
      id: 'step2',
      title: 'Develop',
      description: 'Build luxury components',
      content: <div className="p-luxury-md">Development content</div>,
    },
    {
      id: 'step3',
      title: 'Test',
      description: 'Test luxury interactions',
      content: <div className="p-luxury-md">Testing content</div>,
    },
    {
      id: 'step4',
      title: 'Deploy',
      description: 'Deploy luxury application',
      content: <div className="p-luxury-md">Deployment content</div>,
    },
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Luxury', href: '/luxury' },
    { label: 'Showcase', current: true },
  ];

  const handleToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        success('Luxury operation completed successfully!');
        break;
      case 'error':
        error('Luxury operation failed. Please try again.');
        break;
      case 'warning':
        warning('Luxury operation requires attention.');
        break;
      case 'info':
        info('Luxury operation information.');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-platinum-50 to-luxury-platinum-100 p-luxury-lg">
      <div className="max-w-7xl mx-auto space-y-luxury-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-luxury-5xl font-luxury-bold text-luxury-platinum-900 mb-luxury-md">
            Luxury UI Showcase
          </h1>
          <p className="text-luxury-xl text-luxury-platinum-600 max-w-3xl mx-auto">
            Experience the pinnacle of premium design with our luxury component library.
            Every element is crafted with attention to detail and sophisticated aesthetics.
          </p>
        </motion.div>

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <LuxuryBreadcrumb items={breadcrumbItems} variant="luxury" />
        </motion.div>

        {/* Buttons Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <LuxuryCard className="p-luxury-xl">
            <h2 className="text-luxury-2xl font-luxury-bold text-luxury-platinum-900 mb-luxury-lg">
              Luxury Buttons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-luxury-lg">
              <div className="space-y-luxury-md">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Variants
                </h3>
                <div className="space-y-luxury-sm">
                  <LuxuryButton variant="luxury">Luxury</LuxuryButton>
                  <LuxuryButton variant="platinum">Platinum</LuxuryButton>
                  <LuxuryButton variant="diamond">Diamond</LuxuryButton>
                  <LuxuryButton variant="emerald">Emerald</LuxuryButton>
                  <LuxuryButton variant="destructive">Destructive</LuxuryButton>
                  <LuxuryButton variant="glass">Glass</LuxuryButton>
                </div>
              </div>
              <div className="space-y-luxury-md">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Sizes
                </h3>
                <div className="space-y-luxury-sm">
                  <LuxuryButton size="sm">Small</LuxuryButton>
                  <LuxuryButton size="default">Medium</LuxuryButton>
                  <LuxuryButton size="lg">Large</LuxuryButton>
                </div>
              </div>
              <div className="space-y-luxury-md">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  With Icons
                </h3>
                <div className="space-y-luxury-sm">
                  <LuxuryButton icon={<Star className="w-4 h-4" />}>
                    Star
                  </LuxuryButton>
                  <LuxuryButton icon={<Heart className="w-4 h-4" />} variant="luxury">
                    Heart
                  </LuxuryButton>
                  <LuxuryButton icon={<Zap className="w-4 h-4" />} variant="cosmic">
                    Zap
                  </LuxuryButton>
                </div>
              </div>
            </div>
          </LuxuryCard>
        </motion.section>

        {/* Form Elements Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <LuxuryCard className="p-luxury-xl">
            <h2 className="text-luxury-2xl font-luxury-bold text-luxury-platinum-900 mb-luxury-lg">
              Form Elements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-luxury-xl">
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Inputs & Controls
                </h3>
                <div className="space-y-luxury-md">
                  <LuxuryInput
                    label="Luxury Input"
                    placeholder="Enter your text..."
                    icon={<Search className="w-4 h-4" />}
                  />
                  <LuxuryDropdown
                    options={dropdownOptions}
                    value={selectedOption}
                    onChange={setSelectedOption}
                    placeholder="Select an option"
                  />
                  <LuxurySwitch
                    checked={switchValue}
                    onChange={setSwitchValue}
                    label="Luxury Switch"
                    description="Toggle this luxury switch"
                  />
                  <LuxuryCheckbox
                    checked={checkboxValue}
                    onChange={setCheckboxValue}
                    label="Luxury Checkbox"
                    description="Check this luxury checkbox"
                  />
                  <LuxuryRadio
                    checked={radioValue === 'option1'}
                    onChange={() => setRadioValue('option1')}
                    label="Option 1"
                    name="radio-group"
                    value="option1"
                  />
                  <LuxurySlider
                    value={sliderValue}
                    onChange={setSliderValue}
                    label="Luxury Slider"
                    showValue
                  />
                </div>
              </div>
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Rating & Progress
                </h3>
                <div className="space-y-luxury-md">
                  <LuxuryRating
                    value={ratingValue}
                    onChange={setRatingValue}
                    label="Luxury Rating"
                    showValue
                  />
                  <LuxuryProgress
                    value={75}
                    label="Luxury Progress"
                    variant="luxury"
                    showLabel
                  />
                  <LuxuryProgress
                    value={60}
                    label="Premium Progress"
                    variant="luxury"
                    showLabel
                  />
                  <LuxuryProgress
                    value={90}
                    label="Success Progress"
                    variant="success"
                    showLabel
                  />
                </div>
              </div>
            </div>
          </LuxuryCard>
        </motion.section>

        {/* Components Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <LuxuryCard className="p-luxury-xl">
            <h2 className="text-luxury-2xl font-luxury-bold text-luxury-platinum-900 mb-luxury-lg">
              Luxury Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-luxury-xl">
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Badges & Tags
                </h3>
                <div className="space-y-luxury-md">
                  <div className="flex flex-wrap gap-luxury-sm">
                    <LuxuryBadge variant="default">Default</LuxuryBadge>
                    <LuxuryBadge variant="success">Success</LuxuryBadge>
                    <LuxuryBadge variant="warning">Warning</LuxuryBadge>
                    <LuxuryBadge variant="error">Error</LuxuryBadge>
                    <LuxuryBadge variant="luxury">Luxury</LuxuryBadge>
                  </div>
                  <div className="flex flex-wrap gap-luxury-sm">
                    <LuxuryTag variant="default" closable>Default</LuxuryTag>
                    <LuxuryTag variant="success" closable>Success</LuxuryTag>
                    <LuxuryTag variant="warning" closable>Warning</LuxuryTag>
                    <LuxuryTag variant="error" closable>Error</LuxuryTag>
                    <LuxuryTag variant="luxury" closable>Luxury</LuxuryTag>
                  </div>
                </div>
              </div>
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Avatars & Icons
                </h3>
                <div className="space-y-luxury-md">
                  <div className="flex items-center space-x-luxury-md">
                    <LuxuryAvatar
                      name="John Doe"
                      size="sm"
                      variant="default"
                    />
                    <LuxuryAvatar
                      name="Jane Smith"
                      size="md"
                      variant="luxury"
                    />
                    <LuxuryAvatar
                      name="Bob Johnson"
                      size="lg"
                      variant="premium"
                    />
                    <LuxuryAvatar
                      name="Alice Brown"
                      size="xl"
                      variant="vip"
                    />
                  </div>
                  <div className="flex items-center space-x-luxury-md">
                    <LuxurySpinner size="sm" variant="default" />
                    <LuxurySpinner size="md" variant="luxury" />
                    <LuxurySpinner size="lg" variant="premium" />
                  </div>
                </div>
              </div>
            </div>
          </LuxuryCard>
        </motion.section>

        {/* Tabs & Accordion Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          <LuxuryCard className="p-luxury-xl">
            <h2 className="text-luxury-2xl font-luxury-bold text-luxury-platinum-900 mb-luxury-lg">
              Navigation Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-luxury-xl">
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Luxury Tabs
                </h3>
                <LuxuryTabs
                  tabs={tabs}
                  defaultTab="tab1"
                  variant="default"
                />
              </div>
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Luxury Accordion
                </h3>
                <LuxuryAccordion
                  items={accordionItems}
                  variant="default"
                />
              </div>
            </div>
          </LuxuryCard>
        </motion.section>

        {/* Timeline & Stepper Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        >
          <LuxuryCard className="p-luxury-xl">
            <h2 className="text-luxury-2xl font-luxury-bold text-luxury-platinum-900 mb-luxury-lg">
              Timeline & Stepper
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-luxury-xl">
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Luxury Timeline
                </h3>
                <LuxuryTimeline
                  items={timelineItems}
                  variant="luxury"
                />
              </div>
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Luxury Stepper
                </h3>
                <LuxuryStepper
                  steps={stepperSteps}
                  currentStep={currentStep}
                  onStepChange={setCurrentStep}
                  variant="luxury"
                  showContent
                />
              </div>
            </div>
          </LuxuryCard>
        </motion.section>

        {/* Calendar & Pagination Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
        >
          <LuxuryCard className="p-luxury-xl">
            <h2 className="text-luxury-2xl font-luxury-bold text-luxury-platinum-900 mb-luxury-lg">
              Calendar & Pagination
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-luxury-xl">
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Luxury Calendar
                </h3>
                <LuxuryCalendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  variant="luxury"
                />
              </div>
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Luxury Pagination
                </h3>
                <LuxuryPagination
                  currentPage={currentPage}
                  totalPages={10}
                  onPageChange={setCurrentPage}
                  variant="luxury"
                />
              </div>
            </div>
          </LuxuryCard>
        </motion.section>

        {/* Alerts & Notifications Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          <LuxuryCard className="p-luxury-xl">
            <h2 className="text-luxury-2xl font-luxury-bold text-luxury-platinum-900 mb-luxury-lg">
              Alerts & Notifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-luxury-xl">
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Luxury Alerts
                </h3>
                <div className="space-y-luxury-md">
                  <LuxuryAlert
                    variant="success"
                    title="Success!"
                    dismissible
                  >
                    Your luxury operation completed successfully.
                  </LuxuryAlert>
                  <LuxuryAlert
                    variant="warning"
                    title="Warning!"
                    dismissible
                  >
                    Please review your luxury settings.
                  </LuxuryAlert>
                  <LuxuryAlert
                    variant="error"
                    title="Error!"
                    dismissible
                  >
                    Something went wrong with your luxury operation.
                  </LuxuryAlert>
                  <LuxuryAlert
                    variant="info"
                    title="Info"
                    dismissible
                  >
                    Here's some luxury information for you.
                  </LuxuryAlert>
                </div>
              </div>
              <div className="space-y-luxury-lg">
                <h3 className="text-luxury-lg font-luxury-semibold text-luxury-platinum-800">
                  Toast Notifications
                </h3>
                <div className="space-y-luxury-md">
                  <LuxuryButton
                    onClick={() => handleToastDemo('success')}
                    variant="emerald"
                  >
                    Success Toast
                  </LuxuryButton>
                  <LuxuryButton
                    onClick={() => handleToastDemo('error')}
                    variant="destructive"
                  >
                    Error Toast
                  </LuxuryButton>
                  <LuxuryButton
                    onClick={() => handleToastDemo('warning')}
                    variant="luxury"
                  >
                    Warning Toast
                  </LuxuryButton>
                  <LuxuryButton
                    onClick={() => handleToastDemo('info')}
                    variant="diamond"
                  >
                    Info Toast
                  </LuxuryButton>
                </div>
              </div>
            </div>
          </LuxuryCard>
        </motion.section>

        {/* Modal Demo */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
        >
          <LuxuryCard className="p-luxury-xl">
            <h2 className="text-luxury-2xl font-luxury-bold text-luxury-platinum-900 mb-luxury-lg">
              Modal & Tooltip
            </h2>
            <div className="flex items-center space-x-luxury-md">
              <LuxuryButton
                onClick={() => setIsModalOpen(true)}
                variant="luxury"
              >
                Open Luxury Modal
              </LuxuryButton>
              <LuxuryTooltip
                content="This is a luxury tooltip with premium styling"
                position="top"
              >
                <LuxuryButton variant="platinum">
                  Hover for Tooltip
                </LuxuryButton>
              </LuxuryTooltip>
            </div>
          </LuxuryCard>
        </motion.section>

        {/* Skeleton Loading Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
        >
          <LuxuryCard className="p-luxury-xl">
            <h2 className="text-luxury-2xl font-luxury-bold text-luxury-platinum-900 mb-luxury-lg">
              Skeleton Loading
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-luxury-lg">
              <LuxurySkeleton variant="rectangular" height={200} />
              <LuxurySkeleton variant="rectangular" height={200} />
              <LuxurySkeleton variant="rectangular" height={200} />
            </div>
          </LuxuryCard>
        </motion.section>
      </div>

      {/* Modal */}
      <LuxuryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Luxury Modal"
        size="lg"
        type="info"
      >
        <div className="space-y-luxury-md">
          <p className="text-luxury-platinum-600">
            This is a luxury modal with premium styling and sophisticated animations.
            It demonstrates the pinnacle of luxury UI design.
          </p>
          <div className="flex justify-end space-x-luxury-sm">
            <LuxuryButton
              variant="luxury-outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </LuxuryButton>
            <LuxuryButton
              variant="luxury"
              onClick={() => setIsModalOpen(false)}
            >
              Confirm
            </LuxuryButton>
          </div>
        </div>
      </LuxuryModal>

      {/* Toast Container */}
      {toasts.map((toast) => (
        <LuxuryToast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
          position="top-right"
        />
      ))}
    </div>
  );
};

export default LuxuryShowcase;
