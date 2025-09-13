"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, ChevronDown } from 'lucide-react';

interface StepperStep {
  id: string;
  title: string;
  description?: string;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface LuxuryStepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'luxury' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  showContent?: boolean;
  className?: string;
}

const LuxuryStepper: React.FC<LuxuryStepperProps> = ({
  steps,
  currentStep,
  onStepChange,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  showContent = false,
  className = '',
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'w-6 h-6',
          text: 'text-luxury-sm',
          spacing: 'space-x-luxury-sm',
        };
      case 'md':
        return {
          icon: 'w-8 h-8',
          text: 'text-luxury-base',
          spacing: 'space-x-luxury-md',
        };
      case 'lg':
        return {
          icon: 'w-10 h-10',
          text: 'text-luxury-lg',
          spacing: 'space-x-luxury-lg',
        };
      default:
        return {
          icon: 'w-8 h-8',
          text: 'text-luxury-base',
          spacing: 'space-x-luxury-md',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return {
          completed: 'bg-luxury-gold-500 text-white',
          current: 'bg-luxury-gold-100 text-luxury-gold-700 border-luxury-gold-500',
          pending: 'bg-luxury-platinum-100 text-luxury-platinum-600 border-luxury-platinum-300',
          line: 'bg-luxury-gold-200',
          activeLine: 'bg-luxury-gold-500',
        };
      case 'premium':
        return {
          completed: 'bg-luxury-sapphire-500 text-white',
          current: 'bg-luxury-sapphire-100 text-luxury-sapphire-700 border-luxury-sapphire-500',
          pending: 'bg-luxury-platinum-100 text-luxury-platinum-600 border-luxury-platinum-300',
          line: 'bg-luxury-sapphire-200',
          activeLine: 'bg-luxury-sapphire-500',
        };
      default:
        return {
          completed: 'bg-luxury-sapphire-500 text-white',
          current: 'bg-luxury-sapphire-100 text-luxury-sapphire-700 border-luxury-sapphire-500',
          pending: 'bg-luxury-platinum-100 text-luxury-platinum-600 border-luxury-platinum-300',
          line: 'bg-luxury-platinum-200',
          activeLine: 'bg-luxury-sapphire-500',
        };
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepClasses = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const variantClasses = getVariantClasses();

    switch (status) {
      case 'completed':
        return variantClasses.completed;
      case 'current':
        return variantClasses.current;
      case 'pending':
      default:
        return variantClasses.pending;
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const handleStepClick = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step.disabled) {
      onStepChange(stepIndex);
      if (showContent) {
        setExpandedStep(expandedStep === stepIndex ? null : stepIndex);
      }
    }
  };

  const StepperContent = () => {
    if (orientation === 'vertical') {
      return (
        <div className={`space-y-luxury-lg ${className}`}>
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const stepClasses = getStepClasses(index);
            const isExpanded = expandedStep === index;

            return (
              <div key={step.id} className="relative flex">
                {/* Step Circle */}
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  onClick={() => handleStepClick(index)}
                  disabled={step.disabled}
                  className={`
                    flex items-center justify-center rounded-luxury-full border-2 transition-all duration-200
                    ${sizeClasses.icon}
                    ${stepClasses}
                    ${step.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                  `}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="font-luxury-semibold">{index + 1}</span>
                  )}
                </motion.button>

                {/* Content */}
                <div className="ml-luxury-md flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-luxury-semibold ${sizeClasses.text} text-luxury-platinum-900`}>
                        {step.title}
                      </h4>
                      {step.description && (
                        <p className="text-luxury-sm text-luxury-platinum-600 mt-luxury-xs">
                          {step.description}
                        </p>
                      )}
                    </div>
                    {showContent && step.content && (
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : index)}
                        className="p-luxury-xs rounded-luxury-sm hover:bg-luxury-platinum-100 transition-colors duration-200"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-luxury-platinum-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-luxury-platinum-500" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Step Content */}
                  {showContent && step.content && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="mt-luxury-md overflow-hidden"
                    >
                      {step.content}
                    </motion.div>
                  )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`
                      absolute left-1/2 transform -translate-x-1/2 w-0.5
                      ${index < currentStep ? variantClasses.activeLine : variantClasses.line}
                    `}
                    style={{ top: sizeClasses.icon, height: `calc(100% + 1rem)` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className={`flex items-center ${sizeClasses.spacing} ${className}`}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const stepClasses = getStepClasses(index);

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                onClick={() => handleStepClick(index)}
                disabled={step.disabled}
                className={`
                  flex items-center justify-center rounded-luxury-full border-2 transition-all duration-200
                  ${sizeClasses.icon}
                  ${stepClasses}
                  ${step.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                `}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="font-luxury-semibold">{index + 1}</span>
                )}
              </motion.button>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-luxury-sm
                    ${index < currentStep ? variantClasses.activeLine : variantClasses.line}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return <StepperContent />;
};

export default LuxuryStepper;
