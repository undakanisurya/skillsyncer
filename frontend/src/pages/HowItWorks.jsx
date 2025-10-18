import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus,
  FileText,
  Brain,
  Users,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Play,
  Zap,
  Target,
  Award,
  TrendingUp,
  ChevronDown,
  Clock,
  Shield,
  Star,
  Rocket,
  ArrowDown
} from 'lucide-react';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create Your Profile",
      subtitle: "Set up your professional identity",
      description: "Begin by creating your comprehensive profile. Choose your role, add your skills, experience, and career objectives to help our AI understand your professional journey.",
      features: [
        "Quick 3-minute registration process",
        "Role-based profile customization", 
        "Skills assessment and validation",
        "Career goal alignment"
      ],
      image: "/api/placeholder/400/300"
    },
    {
      number: "02", 
      icon: FileText,
      title: "Upload & Analyze",
      subtitle: "Let AI optimize your content",
      description: "Upload your resume, portfolio, or job requirements. Our advanced AI technology parses, analyzes, and optimizes your content for maximum visibility and matching accuracy.",
      features: [
        "AI-powered document parsing",
        "Automatic skill extraction",
        "Content optimization suggestions",
        "Real-time quality scoring"
      ],
      image: "/api/placeholder/400/300"
    },
    {
      number: "03",
      icon: Brain,
      title: "Smart Matching",
      subtitle: "Find perfect opportunities",
      description: "Our intelligent algorithms work continuously to match you with the most relevant opportunities, candidates, or mentors based on compatibility, preferences, and career goals.",
      features: [
        "Advanced matching algorithms",
        "Multi-factor compatibility analysis",
        "Real-time opportunity updates",
        "Preference-based filtering"
      ],
      image: "/api/placeholder/400/300"
    },
    {
      number: "04",
      icon: Users,
      title: "Connect & Grow",
      subtitle: "Build meaningful relationships", 
      description: "Connect with matched partners, collaborate on projects, and build lasting professional relationships. Track your progress and celebrate career milestones.",
      features: [
        "Direct messaging and communication",
        "Collaborative project workspaces",
        "Progress tracking and analytics",
        "Achievement recognition system"
      ],
      image: "/api/placeholder/400/300"
    }
  ];

  const userTypes = [
    {
      title: "Students & Graduates",
      icon: Target,
      description: "Launch your career with internships and entry-level positions",
      benefits: ["Resume optimization", "Interview preparation", "Mentor matching", "Skill development"],
      color: "from-primary-500 to-primary-600"
    },
    {
      title: "Professionals",
      icon: Briefcase,
      description: "Advance your career with better opportunities and connections",
      benefits: ["Career advancement", "Network expansion", "Skill assessment", "Industry insights"],
      color: "from-secondary-500 to-secondary-600"
    },
    {
      title: "Employers",
      icon: Award,
      description: "Find and hire the best talent for your organization",
      benefits: ["Quality candidates", "Efficient screening", "Team collaboration", "Hiring analytics"],
      color: "from-primary-600 to-secondary-500"
    }
  ];

  const stats = [
    { number: "500K+", label: "Active Users", icon: Users },
    { number: "95%", label: "Match Accuracy", icon: Target },
    { number: "24H", label: "Average Response", icon: Clock },
    { number: "99.9%", label: "Platform Uptime", icon: Shield }
  ];

  const testimonialQuotes = [
    {
      quote: "The process was incredibly smooth. I found my dream internship in just 2 weeks!",
      author: "Sarah M., Computer Science Student",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b932?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80"
    },
    {
      quote: "Skillsyncer's AI matching saved us months of recruiting time. Highly recommended.",
      author: "Mark J., Tech Startup Founder", 
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80"
    },
    {
      quote: "As a mentor, I love how easy it is to connect with motivated students.",
      author: "Dr. Lisa K., Industry Professional",
      rating: 5,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80"
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen pt-20 bg-white"
    >
      {/* Hero Section */}
      <section className="gradient-bg py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center bg-secondary-100 rounded-full px-4 py-2 mb-6">
              <Rocket className="w-4 h-4 text-secondary-600 mr-2" />
              <span className="text-secondary-800 font-medium text-sm">Simple 4-Step Process</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              How <span className="text-gradient">Skillsyncer</span> Works
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Transform your career journey with our AI-powered platform. From profile creation to meaningful connections, 
              discover how simple professional growth can be.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary inline-flex items-center text-lg px-8 py-3"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary inline-flex items-center text-lg px-8 py-3"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Bar */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gradient mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Process Steps */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50/20 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-br from-primary-200/8 to-secondary-200/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-br from-secondary-200/8 to-primary-200/8 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary-100/10 to-secondary-100/10 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Enhanced Header */}
          <motion.div variants={itemVariants} className="text-center mb-20">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full px-6 py-3 mb-8 shadow-lg"
            >
              <Rocket className="w-4 h-4 text-primary-600 mr-3" />
              <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Proven Process</span>
            </motion.div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Your Journey to <span className="text-gradient">Success</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Follow our proven 4-step process to unlock career opportunities and build meaningful professional relationships
            </p>

            {/* Enhanced Progress Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex justify-center items-center space-x-6 mb-16"
            >
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                    className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-300 ${
                      index <= activeStep 
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-xl' 
                        : 'bg-white border-2 border-gray-200 text-gray-400 hover:border-primary-300'
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                    {index <= activeStep && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl animate-pulse opacity-20"></div>
                    )}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: index < activeStep ? 1 : 0.3 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="w-20 h-1 mx-4 bg-gray-200 rounded-full overflow-hidden origin-left"
                    >
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        index < activeStep ? 'bg-gradient-to-r from-primary-500 to-secondary-500 w-full' : 'bg-gray-200 w-0'
                      }`}></div>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Professional Steps Grid */}
          <motion.div
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={stepVariants}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                onViewportEnter={() => setActiveStep(index)}
                transition={{ 
                  delay: index * 0.2, 
                  duration: 0.8,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -12,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group relative"
              >
                {/* Enhanced Card Container */}
                <div className="absolute inset-0 bg-white rounded-3xl shadow-lg group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative p-6 rounded-3xl border border-gray-100 group-hover:border-primary-200 transition-all duration-500 h-full flex flex-col">
                  {/* Step Number Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
                    className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg z-10"
                  >
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </motion.div>

                  {/* Icon Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                    className="mb-6 text-center"
                  >
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      <div className={`w-full h-full bg-gradient-to-r ${
                        index === 0 ? 'from-blue-500 to-purple-500' :
                        index === 1 ? 'from-green-500 to-blue-500' :
                        index === 2 ? 'from-purple-500 to-pink-500' :
                        'from-orange-500 to-red-500'
                      } rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Floating Ring Animation */}
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 10, 
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute inset-0 border-2 border-primary-200 rounded-xl opacity-30"
                      ></motion.div>
                    </div>
                  </motion.div>

                  {/* Content Section */}
                  <div className="text-center mb-6 flex-grow">
                    {/* Title */}
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                      className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors duration-300"
                    >
                      {step.title}
                    </motion.h3>

                    {/* Subtitle */}
                    <motion.h4
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                      className="text-secondary-600 font-semibold mb-3 text-xs uppercase tracking-wider"
                    >
                      {step.subtitle}
                    </motion.h4>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      className="text-gray-600 leading-relaxed mb-4 text-xs"
                    >
                      {step.description}
                    </motion.p>
                  </div>

                  {/* Key Features */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    className="space-y-2"
                  >
                    {step.features.slice(0, 3).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-left">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-gray-700 text-xs font-medium">{feature}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* CTA Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                    className="mt-6 pt-4 border-t border-gray-100"
                  >
                    <div className="flex items-center justify-center text-primary-600 font-semibold text-xs group-hover:text-primary-700 transition-colors duration-300 cursor-pointer">
                      <span>Learn More</span>
                      <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </motion.div>

                  {/* Hover Accent Bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    index === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                    index === 1 ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                    index === 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}></div>
                </div>

                {/* Success Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="absolute -top-3 -left-3 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </motion.div>

                {/* Card Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl scale-110"></div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center mt-20"
          >
            <div className="inline-flex items-center bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-gray-600 mb-4">
                  Join thousands of professionals who've transformed their careers
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              </div>
              <div className="ml-8 w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Built for Every Professional
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're starting your career, advancing professionally, or building a team, 
              our platform adapts to your unique needs
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid lg:grid-cols-3 gap-8"
          >
            {userTypes.map((type, index) => (
              <motion.div
                key={type.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="professional-card p-8 text-center group bg-white"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <type.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{type.description}</p>
                
                <div className="space-y-2">
                  {type.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-left text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3 flex-shrink-0"></div>
                      {benefit}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 gradient-bg relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-br from-primary-100/20 to-secondary-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-br from-secondary-100/20 to-primary-100/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Enhanced Header */}
          <motion.div variants={itemVariants} className="text-center mb-20">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-6 py-3 mb-8 shadow-lg"
            >
              <Award className="w-4 h-4 text-green-600 mr-3" />
              <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">Success Stories</span>
            </motion.div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Transforming <span className="text-gradient">Careers</span> Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Join thousands of professionals who've accelerated their career growth with our AI-powered platform
            </p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex justify-center items-center space-x-12 mb-12"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-1">10K+</div>
                <div className="text-sm text-gray-600 font-medium">Success Stories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-1">95%</div>
                <div className="text-sm text-gray-600 font-medium">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-1">50+</div>
                <div className="text-sm text-gray-600 font-medium">Countries</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Testimonials Grid */}
          <motion.div
            variants={containerVariants}
            className="grid lg:grid-cols-3 gap-8"
          >
            {testimonialQuotes.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.2, 
                  duration: 0.8,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group relative"
              >
                {/* Enhanced Card Background */}
                <div className="absolute inset-0 bg-white rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-secondary-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative p-6 rounded-3xl border border-gray-100 group-hover:border-primary-200 transition-all duration-500">
                  {/* Quote Mark */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="text-white font-bold text-lg">"</div>
                  </div>

                  {/* Star Rating */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                    className="flex justify-center mb-4"
                  >
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                      >
                        <Star className="w-5 h-5 text-yellow-400 fill-current mx-0.5" />
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* Quote Text */}
                  <motion.blockquote
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                    className="text-gray-700 mb-6 leading-relaxed text-sm font-medium text-center relative"
                  >
                    "{testimonial.quote}"
                  </motion.blockquote>
                  
                  {/* Author Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                    className="text-center border-t border-gray-100 pt-4"
                  >
                    {/* Author Avatar */}
                    <div className="w-12 h-12 rounded-full mx-auto mb-3 shadow-lg overflow-hidden ring-2 ring-primary-200 group-hover:ring-primary-400 transition-all duration-300">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.author.split(',')[0]}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to gradient avatar if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center hidden">
                        <span className="text-white font-bold text-sm">
                          {testimonial.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Author Info */}
                    <div className="text-primary-700 font-bold text-sm mb-1">
                      {testimonial.author.split(',')[0]}
                    </div>
                    <div className="text-secondary-600 font-semibold text-xs uppercase tracking-wider">
                      {testimonial.author.split(',')[1]?.trim() || 'Professional'}
                    </div>

                    {/* Success Metrics */}
                    <div className="mt-3 inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-3 py-1">
                      <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                      <span className="text-green-700 font-semibold text-xs">
                        {index === 0 && "Career Accelerated"}
                        {index === 1 && "Hiring Success"}
                        {index === 2 && "Mentorship Impact"}
                      </span>
                    </div>
                  </motion.div>

                  {/* Hover Accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Success Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </motion.div>

                {/* Card Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl scale-110"></div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="text-center mt-20"
          >
            <div className="inline-flex flex-col sm:flex-row items-center bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to Write Your Success Story?
                </h3>
                <p className="text-gray-600 mb-4">
                  Join our community of successful professionals today
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.button>
              </div>
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-xl">
                <Rocket className="w-10 h-10 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the advantages of AI-powered career development
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Zap, title: "Fast Results", description: "Get matched 95% faster than traditional methods", color: "bg-yellow-100 text-yellow-600" },
              { icon: Target, title: "Precise Matching", description: "AI ensures perfect compatibility scores", color: "bg-blue-100 text-blue-600" },
              { icon: TrendingUp, title: "Career Growth", description: "Track progress and unlock opportunities", color: "bg-green-100 text-green-600" },
              { icon: Shield, title: "Secure Platform", description: "Enterprise-grade security and privacy", color: "bg-purple-100 text-purple-600" }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="professional-card p-6 text-center bg-white group"
              >
                <div className={`w-12 h-12 ${benefit.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who are already accelerating their careers with Skillsyncer
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-all duration-200 inline-flex items-center text-lg shadow-lg"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-all duration-200 inline-flex items-center text-lg"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </motion.button>
            </div>
            
            <div className="mt-8 text-white/80 text-sm">
              ✓ Free to get started  ✓ No credit card required  ✓ 24/7 support
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default HowItWorks;