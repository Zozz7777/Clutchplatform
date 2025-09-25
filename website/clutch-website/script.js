// Language switching functionality
let currentLanguage = 'en'; // Default to English

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update all elements with data attributes
    document.querySelectorAll('[data-en], [data-ar]').forEach(element => {
        if (element.hasAttribute(`data-${lang}`)) {
            element.textContent = element.getAttribute(`data-${lang}`);
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-en-placeholder], [data-ar-placeholder]').forEach(element => {
        if (element.hasAttribute(`data-${lang}-placeholder`)) {
            element.placeholder = element.getAttribute(`data-${lang}-placeholder`);
        }
    });
    
    // Update select options
    document.querySelectorAll('option[data-en], option[data-ar]').forEach(option => {
        if (option.hasAttribute(`data-${lang}`)) {
            option.textContent = option.getAttribute(`data-${lang}`);
        }
    });
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update document direction
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
    }
    
    // Update navigation layout for RTL
    const navbar = document.querySelector('.navbar');
    if (lang === 'ar') {
        navbar.classList.add('rtl');
    } else {
        navbar.classList.remove('rtl');
    }
    
    // Store language preference
    localStorage.setItem('clutch-language', lang);
}

// Initialize language switcher
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('clutch-language');
    if (savedLanguage) {
        switchLanguage(savedLanguage);
    } else {
        // Default to English
        switchLanguage('en');
    }
    
    // Add click event listeners to language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
    
    // Initialize contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        console.log('🔧 Contact form found, adding submit listener');
        contactForm.addEventListener('submit', handleFormSubmission);
        
        // Add real-time validation
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');
        
        if (emailField) {
            emailField.addEventListener('blur', () => {
                if (emailField.value && !isValidEmail(emailField.value)) {
                    showError('email', 'emailError', 'Please enter a valid email address');
                } else {
                    hideError('email', 'emailError');
                }
            });
            
            emailField.addEventListener('input', () => {
                hideError('email', 'emailError');
            });
        }
        
        if (phoneField) {
            phoneField.addEventListener('blur', () => {
                if (phoneField.value && !isValidPhone(phoneField.value)) {
                    showError('phone', 'phoneError', 'Please enter a valid phone number');
                } else {
                    hideError('phone', 'phoneError');
                }
            });
            
            phoneField.addEventListener('input', () => {
                hideError('phone', 'phoneError');
            });
        }
        
        console.log('✅ Contact form initialization complete');
    } else {
        console.error('❌ Contact form not found!');
    }
    
    // Initialize statistics
    initializeStatistics();
    
    // Initialize favicon switching
    setupFaviconSwitching();
});

// Initialize Particles.js for background effects
particlesJS('particles-js', {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: "oklch(0.75 0.1 220)"
        },
        shape: {
            type: "circle",
            stroke: {
                width: 0,
                color: "oklch(0.1450 0 0)"
            },
            polygon: {
                nb_sides: 5
            }
        },
        opacity: {
            value: 0.1,
            random: false,
            anim: {
                enable: false,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: "oklch(0.75 0.1 220)",
            opacity: 0.1,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "repulse"
            },
            onclick: {
                enable: true,
                mode: "push"
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 400,
                line_linked: {
                    opacity: 1
                }
            },
            bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 8,
                speed: 3
            },
            repulse: {
                distance: 200,
                duration: 0.4
            },
            push: {
                particles_nb: 4
            },
            remove: {
                particles_nb: 2
            }
        }
    },
    retina_detect: true
});

// Enhanced Car Parts Animation
function enhanceCarParts() {
    const parts = document.querySelectorAll('.part');
    
    parts.forEach((part, index) => {
        // Add random movement patterns
        setInterval(() => {
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            const randomRotation = Math.random() * 360;
            
            part.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotation}deg)`;
        }, 5000 + (index * 1000));
        
        // Add hover effects
        part.addEventListener('mouseenter', () => {
            part.style.filter = 'blur(0px)';
            part.style.opacity = '0.8';
            part.style.transform = 'scale(1.2)';
            part.style.zIndex = '10';
        });
        
        part.addEventListener('mouseleave', () => {
            part.style.filter = 'blur(1px)';
            part.style.opacity = '0.1';
            part.style.transform = 'scale(1)';
            part.style.zIndex = '1';
        });
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Dynamic navbar appearance on scroll
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements that should animate on scroll
document.querySelectorAll('.fade-in, .slide-up').forEach(el => {
    observer.observe(el);
});

// Form handling is now managed by the main handleFormSubmission function

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Enhanced notification system with red theme
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 26, 0.1)'};
        border: 1px solid ${type === 'success' ? 'oklch(0.72 0.2 145)' : 'oklch(0.75 0.1 220)'};
        border-radius: 12px;
        padding: 1rem 1.5rem;
        color: white;
        backdrop-filter: blur(20px);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Enhanced button ripple effects with red theme
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 0, 26, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Enhanced parallax effect for hero section
let ticking = false;
let lastScrollY = window.pageYOffset;

function updateParallax() {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
    
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// Enhanced counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                if (counter.textContent.includes('%')) {
                    counter.textContent = current.toFixed(1) + '%';
                } else if (counter.textContent.includes('+')) {
                    counter.textContent = Math.ceil(current) + '+';
                } else {
                    counter.textContent = Math.ceil(current);
                }
                requestAnimationFrame(updateCounter);
            } else {
                if (counter.textContent.includes('%')) {
                    counter.textContent = target + '%';
                } else if (counter.textContent.includes('+')) {
                    counter.textContent = target + '+';
                } else {
                    counter.textContent = target;
                }
            }
        };
        
        updateCounter();
    });
}

// Enhanced mobile menu toggle
const mobileMenuToggle = document.createElement('button');
mobileMenuToggle.className = 'mobile-menu-toggle';
mobileMenuToggle.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
`;
mobileMenuToggle.style.cssText = `
    display: none;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    z-index: 1001;
`;

// Add mobile menu toggle styles
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    @media (max-width: 768px) {
        .mobile-menu-toggle {
            display: flex !important;
        }
        
        .nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 100%;
            height: 100vh;
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(20px);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: right 0.3s ease;
            z-index: 1000;
        }
        
        .nav-links.active {
            right: 0;
        }
        
        .mobile-menu-toggle span {
            width: 25px;
            height: 3px;
            background: oklch(0.75 0.1 220);
            margin: 3px 0;
            transition: 0.3s;
        }
        
        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    }
`;

document.head.appendChild(mobileStyles);

// Insert mobile menu toggle
const navContainer = document.querySelector('.nav-container');
if (navContainer) {
    navContainer.appendChild(mobileMenuToggle);
}

// Mobile menu functionality
mobileMenuToggle.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    mobileMenuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    });
});

// Enhanced loading animation
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loading);
    
    setTimeout(() => {
        loading.classList.add('hidden');
        setTimeout(() => loading.remove(), 500);
    }, 1000);
}

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
    // Scroll-based animations and effects
}, 16)); // 60fps

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show loading animation
    showLoading();
    
    // Initialize car parts animation
    enhanceCarParts();
    
    // Start counter animations when mission section is visible
    const missionSection = document.querySelector('#mission');
    if (missionSection) {
        const missionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    missionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        missionObserver.observe(missionSection);
    }
    
    // Add enhanced hover effects to service cards
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add enhanced hover effects to store buttons
    document.querySelectorAll('.store-button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add enhanced form input animations
    document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Add enhanced navigation link hover effects
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.color = 'oklch(0.75 0.1 220)';
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.color = 'oklch(0.9850 0 0)';
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add enhanced button hover effects
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add enhanced card hover effects
    document.querySelectorAll('.service-card, .info-item').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = 'oklch(0.75 0.1 220)';
            this.style.boxShadow = '0 20px 40px rgba(255, 0, 26, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = 'rgba(255, 0, 26, 0.2)';
            this.style.boxShadow = 'none';
        });
    });
});

// Add enhanced scroll-triggered animations
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
    
    // Add scroll-based color changes
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (scrolled > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.borderBottom = '2px solid oklch(0.75 0.1 220)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.borderBottom = '2px solid oklch(0.75 0.1 220)';
        }
    }
});

// Add enhanced keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    }
});

// Add enhanced touch support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - could be used for navigation
            console.log('Swiped left');
        } else {
            // Swipe right - could be used for navigation
            console.log('Swiped right');
        }
    }
}

// Add enhanced accessibility features
document.addEventListener('DOMContentLoaded', () => {
    // Add ARIA labels to interactive elements
    document.querySelectorAll('.btn').forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', btn.textContent.trim());
        }
    });
    
    // Add focus indicators
    document.querySelectorAll('a, button, input, textarea').forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid oklch(0.75 0.1 220)';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
});

// Add enhanced performance monitoring
let frameCount = 0;
let lastTime = performance.now();

function measurePerformance(currentTime) {
    frameCount++;
    
    if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Log performance metrics (remove in production)
        if (fps < 30) {
            console.warn(`Low FPS detected: ${fps}`);
        }
    }
    
    requestAnimationFrame(measurePerformance);
}

// Start performance monitoring
requestAnimationFrame(measurePerformance);

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation function
function isValidPhone(phone) {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if it's a valid Egyptian phone number or international format
    const phoneRegex = /^(\+2|002|2)?01[0-9]{9}$|^(\+|00)?[1-9]\d{1,14}$/;
    return phoneRegex.test(cleanPhone) || cleanPhone.length >= 10;
}

// Show error function
function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    field.classList.add('error');
    error.style.display = 'block';
    error.textContent = message;
}

// Hide error function
function hideError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    field.classList.remove('error');
    error.style.display = 'none';
}

// Contact Form Submission - REMOVED DUPLICATE FUNCTION

// Form submission is already initialized in the main DOMContentLoaded event listener

// MongoDB Atlas Statistics Integration
async function fetchStatisticsFromMongoDB() {
  try {
    const response = await fetch('https://clutch-main-nk7x.onrender.com/api/marketing/statistics');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();
        
        // Update the statistics on the page
        updateStatisticsDisplay(stats);
        
        return stats;
    } catch (error) {
        console.error('Error fetching statistics from MongoDB:', error);
        // Return null to indicate failure
        return null;
    }
}

// Update statistics display with real data
function updateStatisticsDisplay(stats) {
    // Update Happy Customers
    const happyCustomersElement = document.querySelector('.stat-item:nth-child(1) .stat-number');
    if (happyCustomersElement) {
        happyCustomersElement.textContent = formatNumber(stats.happyCustomers);
    }
    
    // Update Verified Mechanics
    const verifiedMechanicsElement = document.querySelector('.stat-item:nth-child(2) .stat-number');
    if (verifiedMechanicsElement) {
        verifiedMechanicsElement.textContent = formatNumber(stats.verifiedMechanics);
    }
    
    // Update Satisfaction Rate
    const satisfactionRateElement = document.querySelector('.stat-item:nth-child(3) .stat-number');
    if (satisfactionRateElement) {
        satisfactionRateElement.textContent = stats.satisfactionRate;
    }
}

// Format large numbers with K, M suffixes
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Animate statistics counting up
function animateStatistics(stats) {
    const elements = document.querySelectorAll('.stat-number');
    
    elements.forEach((element, index) => {
        let finalValue;
        let suffix = '';
        
        if (index === 0) {
            finalValue = stats.happyCustomers || 0;
        } else if (index === 1) {
            finalValue = stats.verifiedMechanics || 0;
        } else {
            finalValue = parseFloat(stats.satisfactionRate) || 0;
            suffix = '%';
        }
        
        if (index === 2) {
            // Satisfaction rate - animate to final value
            animateCountUp(element, 0, finalValue, 2000, suffix);
        } else {
            // Animate counting up for numbers
            animateCountUp(element, 0, finalValue, 2000, suffix);
        }
    });
}

// Animate count up effect
function animateCountUp(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    
    function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = formatNumber(current) + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }
    
    requestAnimationFrame(updateCount);
}

// Initialize statistics when page loads
async function initializeStatistics() {
    try {
        // Show loading state
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            stat.textContent = '...';
        });
        
        // Fetch real data from MongoDB
        const stats = await fetchStatisticsFromMongoDB();
        
        if (stats && stats.data) {
            // Animate the statistics with real data
            animateStatistics(stats.data);
        } else {
            // Show error state
            statNumbers.forEach(stat => {
                stat.textContent = 'N/A';
            });
            console.warn('Failed to fetch statistics from MongoDB');
        }
        
    } catch (error) {
        console.error('Error initializing statistics:', error);
        // Show error state
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            stat.textContent = 'N/A';
        });
    }
}

// Initialize statistics when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStatistics);
} else {
    initializeStatistics();
}

// Dynamic Favicon Switching based on Color Scheme
function updateFavicon() {
    const faviconRed = document.getElementById('favicon-red');
    const faviconWhite = document.getElementById('favicon-white');
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Dark mode - use white logo
        faviconRed.setAttribute('href', '');
        faviconWhite.setAttribute('href', 'LogoWhite.svg');
        document.title = 'Clutch - The Future of Car Care 🌙';
        
        // Update color scheme indicator
        updateColorSchemeIndicator('dark');
    } else {
        // Light mode - use red logo
        faviconRed.setAttribute('href', 'LogoRed.svg');
        faviconWhite.setAttribute('href', '');
        document.title = 'Clutch - The Future of Car Care ☀️';
        
        // Update color scheme indicator
        updateColorSchemeIndicator('light');
    }
}

// Update color scheme indicator
function updateColorSchemeIndicator(scheme) {
    let indicator = document.querySelector('.color-scheme-indicator');
    
    if (!indicator) {
        // Create indicator if it doesn't exist
        indicator = document.createElement('div');
        indicator.className = 'color-scheme-indicator';
        indicator.title = `Color Scheme: ${scheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`;
        document.body.appendChild(indicator);
    }
    
    // Update indicator appearance
    indicator.className = `color-scheme-indicator ${scheme}`;
    indicator.title = `Color Scheme: ${scheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`;
}

// Contact Form Handling
function handleFormSubmission(event) {
    console.log('🚀 handleFormSubmission function called!');
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('#submitBtn');
    const formMessage = document.getElementById('formMessage');
    
    console.log('📝 Form data:', Object.fromEntries(formData));
    console.log('🔘 Submit button:', submitBtn);
    console.log('💬 Form message element:', formMessage);
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formMessage.style.display = 'none';
    
    // Validate form
    const email = formData.get('email');
    const phone = formData.get('phone');
    
    if (!isValidEmail(email)) {
        showError('email', 'emailError', 'Please enter a valid email address');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        return;
    }
    
    if (!isValidPhone(phone)) {
        showError('phone', 'phoneError', 'Please enter a valid phone number');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        return;
    }
    
    // Submit form using Formspree
    console.log('🚀 Submitting form to new Formspree endpoint:', form.action);
    console.log('📝 Form data:', Object.fromEntries(formData));
    console.log('📧 Recipient email:', formData.get('_replyto'));
    
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('✅ Formspree response status:', response.status);
        console.log('📋 Formspree response headers:', response.headers);
        
        if (response.ok) {
            // Success
            formMessage.innerHTML = `
                <div class="success-message">
                    <h3>Message Sent Successfully! 🎉</h3>
                    <p>Thank you for contacting us. We'll get back to you soon at <strong>ziad@yourclutch.com</strong></p>
                    <p><small>📧 Check your email (including spam folder) for confirmation from Formspree.</small></p>
                    <p><small>🆔 Form ID: myzprdjo</small></p>
                </div>
            `;
            formMessage.style.display = 'block';
            form.reset();
            
            // Track form submission in Google Analytics
            if (window.gtag) {
                gtag('event', 'form_submit', {
                    'event_category': 'Contact',
                    'event_label': 'Contact Form - New Endpoint'
                });
            }
        } else {
            throw new Error(`Form submission failed: ${response.status}`);
        }
    })
    .catch(error => {
        console.error('Form submission error:', error);
        formMessage.innerHTML = `
            <div class="error-message">
                <h3>Oops! Something went wrong 😔</h3>
                <p>Please try again or contact us directly at <strong>ziad@yourclutch.com</strong></p>
            </div>
        `;
        formMessage.style.display = 'block';
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^(\+2|002|2)?01[0-9]{9}$|^(\+|00)?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}

// Show error message
function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    if (field && error) {
        field.classList.add('error');
        error.style.display = 'block';
        error.textContent = message;
    }
}

// Hide error message
function hideError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    if (field && error) {
        field.classList.remove('error');
        error.style.display = 'none';
    }
}

// Listen for color scheme changes
function setupFaviconSwitching() {
    // Initial favicon setup
    updateFavicon();

    // Listen for changes in color scheme preference
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', updateFavicon);
        
        // Fallback for older browsers
        if (mediaQuery.addListener) {
            mediaQuery.addListener(updateFavicon);
        }
    }
}

// Initialize favicon switching when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFaviconSwitching);
} else {
    setupFaviconSwitching();
}
