import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  FileText,
  BarChart3,
  Users,
  Target,
  Shield,
  Zap,
  Search,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  Star,
  Sparkles,
  ArrowRight,
  Play,
  Globe,
  Clock
} from 'lucide-react';

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const coreFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Resume Analysis",
      description: "Advanced machine learning algorithms analyze resumes and extract key skills, experience, and qualifications with industry-leading accuracy.",
      benefits: [
        "99.2% accuracy in skill extraction",
        "Instant parsing of multiple formats",
        "Automatic experience categorization",
        "Real-time quality scoring"
      ],
      category: "AI Technology",
      color: "from-primary-500 to-secondary-500"
    },
    {
      icon: BarChart3,
      title: "Comprehensive Skill Assessment",
      description: "Identify skill gaps and receive data-driven recommendations for professional development and career advancement.",
      benefits: [
        "Industry benchmarking",
        "Personalized learning pathways",
        "Progress tracking & analytics",
        "Certification recommendations"
      ],
      category: "Career Development",
      color: "from-secondary-500 to-primary-600"
    },
    {
      icon: Target,
      title: "Intelligent Matching System",
      description: "Sophisticated algorithms connect the right talent with the right opportunities based on skills, preferences, and career goals.",
      benefits: [
        "95% match accuracy rate",
        "Multi-factor compatibility scoring",
        "Location and salary optimization",
        "Cultural fit assessment"
      ],
      category: "Matching Technology",
      color: "from-primary-600 to-secondary-600"
    },
    {
      icon: Users,
      title: "Professional Networking Hub",
      description: "Build meaningful connections with industry professionals, mentors, and peers in a secure, professional environment.",
      benefits: [
        "Verified professional profiles",
        "Industry-specific communities",
        "Mentor-mentee pairing",
        "Collaborative project spaces"
      ],
      category: "Networking",
      color: "from-secondary-600 to-primary-500"
    }
  ];

  const businessFeatures = [
    { 
      icon: FileText, 
      title: "Resume Builder Pro", 
      description: "Professional templates with AI-powered content suggestions",
      category: "Tools"
    },
    { 
      icon: Search, 
      title: "Advanced Search Engine", 
      description: "Powerful filtering and discovery capabilities",
      category: "Discovery"
    },
    { 
      icon: MessageSquare, 
      title: "Secure Messaging", 
      description: "Enterprise-grade communication platform",
      category: "Communication"
    },
    { 
      icon: Calendar, 
      title: "Interview Management", 
      description: "Streamlined scheduling with automated workflows",
      category: "Management"
    },
    { 
      icon: Award, 
      title: "Achievement Tracking", 
      description: "Milestone tracking with digital credentialing",
      category: "Recognition"
    },
    { 
      icon: TrendingUp, 
      title: "Analytics Dashboard", 
      description: "Comprehensive insights and reporting tools",
      category: "Analytics"
    },
    { 
      icon: Shield, 
      title: "Privacy & Security", 
      description: "Enterprise-level data protection and compliance",
      category: "Security"
    },
    { 
      icon: Globe, 
      title: "Global Reach", 
      description: "Multi-language support and worldwide opportunities",
      category: "Global"
    }
  ];

  const testimonials = [
    {
      name: "Jennifer Martinez",
      role: "VP of Talent Acquisition",
      company: "Fortune 500 Corp",
      quote: "Skillsyncer has revolutionized our hiring process. We've reduced time-to-hire by 60% while improving candidate quality significantly.",
      rating: 5,
      metrics: "60% faster hiring"
    },
    {
      name: "Dr. Robert Kim",
      role: "Career Development Director",
      company: "Elite University",
      quote: "The platform's analytics provide unprecedented insights into student career trajectories. It's become essential for our career services.",
      rating: 5,
      metrics: "95% student satisfaction"
    },
    {
      name: "Sarah Thompson",
      role: "Senior Software Engineer",
      company: "Tech Innovations LLC",
      quote: "From student to senior engineer in 3 years. Skillsyncer's mentorship matching and skill development were game-changing.",
      rating: 5,
      metrics: "3x career acceleration"
    }
  ];

  const stats = [
    { number: "500K+", label: "Active Users", description: "Professionals worldwide" },
    { number: "95%", label: "Match Success", description: "Successful placements" },
    { number: "10K+", label: "Companies", description: "Partner organizations" },
    { number: "24/7", label: "Support", description: "Enterprise assistance" }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen pt-20"
    >
      {/* Hero Section */}
      <section className="gradient-bg py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={itemVariants} className="text-left">
              <div className="inline-flex items-center bg-primary-100 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-primary-800 font-medium text-sm">AI-Powered Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Powerful <span className="text-gradient">Features</span><br />
                for Career Growth
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Discover our comprehensive suite of AI-powered tools designed to accelerate careers, 
                streamline hiring, and foster meaningful professional connections.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary inline-flex items-center justify-center"
                >
                  Explore Features
                  <ArrowRight className="ml-2 w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="professional-card p-6 text-center card-hover"
                  >
                    <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
                    <div className="font-semibold text-gray-900 mb-1">{stat.label}</div>
                    <div className="text-sm text-gray-600">{stat.description}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-secondary-50/20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-gradient-to-br from-primary-200/8 to-secondary-200/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-gradient-to-br from-secondary-200/8 to-primary-200/8 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary-100/10 to-secondary-100/10 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Enhanced Header */}
          <motion.div variants={itemVariants} className="text-center mb-20">
            {/* Technology Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full px-6 py-3 mb-8 shadow-lg"
            >
              <Zap className="w-4 h-4 text-primary-600 mr-3" />
              <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Advanced Technology</span>
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Core Platform <span className="text-gradient">Capabilities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Built on cutting-edge technology to deliver exceptional results for all stakeholders
            </p>

            {/* Power Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center justify-center mt-8 space-x-8"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient">AI-Powered</div>
                <div className="text-sm text-gray-600">Technology</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient">99.2%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient">Real-time</div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Capabilities Grid */}
          <motion.div
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.15, 
                  duration: 0.8,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -12,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group relative"
              >
                {/* Card Container */}
                <div className="absolute inset-0 bg-white rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.03]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative p-8 rounded-2xl border border-gray-100 group-hover:border-primary-200 transition-all duration-500 h-full flex flex-col">
                  {/* Category Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                    className="inline-flex items-center bg-gradient-to-r from-secondary-100 to-primary-100 rounded-full px-4 py-2 mb-6 self-start"
                  >
                    <span className="text-secondary-700 font-semibold text-xs uppercase tracking-wider">{feature.category}</span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                    className="mb-6"
                  >
                    <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 mx-auto`}>
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                    className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-primary-700 transition-colors duration-300"
                  >
                    {feature.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    className="text-gray-600 text-center leading-relaxed mb-6 flex-grow"
                  >
                    {feature.description}
                  </motion.p>

                  {/* Benefits List */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    className="space-y-3"
                  >
                    {feature.benefits.slice(0, 3).map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium">{benefit}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* Learn More Link */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                    className="mt-6 pt-4 border-t border-gray-100"
                  >
                    <div className="flex items-center justify-center text-primary-600 font-semibold text-sm group-hover:text-primary-700 transition-colors duration-300 cursor-pointer">
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </motion.div>

                  {/* Hover Accent Bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                </div>

                {/* Floating Performance Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Enhancement CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="text-center mt-20"
          >
            <div className="inline-flex items-center bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Experience All Capabilities
                </h3>
                <p className="text-gray-600 mb-4">
                  See how our integrated platform transforms talent management
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  View Demo
                  <Play className="w-4 h-4 ml-2" />
                </motion.button>
              </div>
              <div className="ml-8 w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Business Features Grid */}
      <section className="py-24 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Feature Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for successful talent management and career development
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {businessFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="professional-card p-6 group card-hover bg-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="feature-icon group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                    {feature.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50/20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-gradient-to-br from-primary-200/10 to-secondary-200/10 rounded-full blur-3xl transform -translate-y-1/2"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-secondary-200/10 to-primary-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Enhanced Header */}
          <motion.div variants={itemVariants} className="text-center mb-20">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-6 py-3 mb-8 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-yellow-600 mr-3" />
              <span className="text-yellow-700 font-semibold text-sm uppercase tracking-wider">Trusted by Professionals</span>
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              What Our <span className="text-gradient">Users Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real stories from professionals who transformed their careers with Skillsyncer
            </p>

            {/* Rating Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center justify-center mt-8 space-x-2"
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                  >
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-800 ml-3">4.9/5</span>
              <span className="text-gray-600">from 10,000+ reviews</span>
            </motion.div>
          </motion.div>

          {/* Enhanced Testimonials Grid */}
          <motion.div
            variants={containerVariants}
            className="grid lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                initial={{ opacity: 0, y: 50 }}
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
                {/* Card Background with Enhanced Styling */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative p-8 rounded-2xl border border-gray-100 group-hover:border-primary-200 transition-all duration-500">
                  {/* Quote Icon */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 10c0-2.761 2.686-5 6-5 2.07 0 3.88.819 5.092 2.092l-2.184 2.185C11.235 8.614 10.392 8 9.5 8 8.119 8 7 9.119 7 10.5S8.119 13 9.5 13c.892 0 1.735-.614 2.408-1.277l2.184 2.185C12.88 15.181 11.07 16 9 16c-3.314 0-6-2.239-6-5z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Rating and Metrics */}
                  <div className="flex items-center justify-between mb-6 pt-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    <motion.span
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="text-sm font-bold text-white bg-gradient-to-r from-secondary-500 to-primary-500 px-4 py-2 rounded-full shadow-md"
                    >
                      {testimonial.metrics}
                    </motion.span>
                  </div>
                  
                  {/* Quote */}
                  <motion.blockquote
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-gray-700 mb-8 text-lg leading-relaxed font-medium relative"
                  >
                    <span className="text-4xl text-primary-300 absolute -top-2 -left-2 font-serif">"</span>
                    <span className="relative z-10">{testimonial.quote}</span>
                    <span className="text-4xl text-primary-300 absolute -bottom-4 -right-2 font-serif">"</span>
                  </motion.blockquote>
                  
                  {/* Author Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="border-t border-gray-100 pt-6"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Avatar Placeholder */}
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg group-hover:text-primary-700 transition-colors duration-300">
                          {testimonial.name}
                        </div>
                        <div className="text-gray-600 font-medium">{testimonial.role}</div>
                        <div className="text-gradient font-semibold flex items-center mt-1">
                          <span>{testimonial.company}</span>
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Hover Accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-center mt-16"
          >
            <p className="text-lg text-gray-600 mb-6">
              Join thousands of professionals who have transformed their careers
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Career Journey?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of professionals who are already using Skillsyncer 
              to accelerate their careers and find meaningful opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-all duration-300 inline-flex items-center text-lg shadow-lg hover:shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-8 rounded-lg transition-all duration-300 inline-flex items-center text-lg"
              >
                <Calendar className="mr-2 w-5 h-5" />
                Schedule Demo
              </motion.button>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-white/80">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Features;