import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import JoinAsEmployeeForm from '../components/JoinAsEmployeeForm';
import { 
  ArrowRight, 
  Users, 
  Briefcase, 
  Target,
  Brain,
  TrendingUp,
  Shield,
  Sparkles,
  CheckCircle,
  Star,
  Search,
  Filter,
  BarChart3,
  Clock,
  Award,
  Zap,
  Building,
  UserCheck,
  Globe,
  DollarSign,
  Rocket,
  Eye,
  MessageSquare,
  Calendar,
  FileText,
  Lightbulb
} from 'lucide-react';

const EmployerInfo = () => {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

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

  const features = [
    {
      icon: Briefcase,
      title: "Post Internships & Projects",
      description: "Create detailed job postings for internships and project-based work with custom requirements and skill specifications."
    },
    {
      icon: Brain,
      title: "AI-Powered Resume Matching",
      description: "Our advanced AI algorithms automatically match the best candidates to your job postings based on skills, experience, and compatibility."
    },
    {
      icon: Users,
      title: "Applicant Management",
      description: "Streamlined dashboard to review, filter, and manage all applications with integrated communication tools."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Get detailed analytics on your job postings, application rates, and candidate quality to optimize your hiring process."
    },
    {
      icon: Target,
      title: "Targeted Recruitment",
      description: "Reach the right candidates with precision targeting based on skills, location, education, and career interests."
    },
    {
      icon: Shield,
      title: "Verified Candidates",
      description: "All candidates go through our verification process ensuring you connect with genuine, qualified professionals."
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce hiring time by 60% with AI-powered matching and automated screening processes."
    },
    {
      icon: DollarSign,
      title: "Cost Effective",
      description: "Lower recruitment costs with our efficient platform and pay-per-success pricing model."
    },
    {
      icon: TrendingUp,
      title: "Higher Quality Hires",
      description: "Access to pre-screened, skill-verified candidates increases hiring success rates."
    },
    {
      icon: Globe,
      title: "Global Talent Pool",
      description: "Connect with talented students and professionals from universities worldwide."
    }
  ];

  const stats = [
    { number: "50+", label: "Partner Companies", icon: Building },
    { number: "10,000+", label: "Active Candidates", icon: Users },
    { number: "95%", label: "Successful Matches", icon: Target },
    { number: "48hrs", label: "Average Response Time", icon: Clock }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director at TechCorp",
      content: "SkillSyncer transformed our internship program. The AI matching is incredibly accurate, and we've found amazing talent.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Startup Founder",
      content: "As a small company, we needed an efficient way to find skilled interns. SkillSyncer delivered exactly what we needed.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Project Manager at InnovateLab",
      content: "The quality of candidates and the ease of management through their platform is outstanding. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="gradient-bg pt-20 lg:pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Hero Content */}
            <motion.div variants={itemVariants} className="text-center lg:text-left">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-lg mb-6"
              >
                <Building className="w-5 h-5 text-primary-600 mr-2" />
                <span className="text-sm font-semibold text-gray-700">For Employers</span>
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Find Top Talent with{' '}
                <span className="text-gradient">AI-Powered Precision</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Connect with skilled students and professionals for internships and projects. 
                Our AI-driven platform matches you with the perfect candidates, saving time and improving hiring quality.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/auth" className="btn-primary inline-flex items-center text-lg px-8 py-4">
                    Start Hiring Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button 
                    onClick={() => setShowEmployeeForm(true)}
                    className="btn-secondary inline-flex items-center text-lg px-8 py-4"
                  >
                    Join as Employee
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="relative">
                {/* Replace placeholder with static image, keep fallback */}
                <img 
                  src="/Student-internship1.jpg" 
                  alt="Recruit with us - Employer Platform"
                  className="w-full max-w-lg mx-auto h-96 object-cover rounded-3xl shadow-2xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full max-w-lg mx-auto h-96 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 rounded-3xl flex-col items-center justify-center shadow-2xl hidden">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-gray-700 font-semibold text-lg">Employer Platform</p>
                    <p className="text-sm text-gray-600 mt-2">Connect • Hire • Grow</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Hiring
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline your recruitment process and find the best talent
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SkillSyncer for Hiring?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join leading companies that trust SkillSyncer for their talent acquisition needs
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <benefit.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our simple, efficient hiring process
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 shadow-lg text-center relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Post Your Job
              </h3>
              <p className="text-gray-600">
                Create detailed job postings with specific requirements, skills, and project details in minutes.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 shadow-lg text-center relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                AI Matches Candidates
              </h3>
              <p className="text-gray-600">
                Our AI analyzes candidate profiles and automatically matches the best fits for your requirements.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 shadow-lg text-center relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Review & Hire
              </h3>
              <p className="text-gray-600">
                Review matched candidates, conduct interviews, and hire the perfect talent for your projects.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Employers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from companies that have transformed their hiring with SkillSyncer
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Hiring Process?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of companies that have found their perfect candidates through SkillSyncer's AI-powered platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/auth" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button 
                  onClick={() => setShowEmployeeForm(true)}
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Join as Employee
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join as Employee Form Modal */}
      <JoinAsEmployeeForm 
        isOpen={showEmployeeForm} 
        onClose={() => setShowEmployeeForm(false)} 
      />
    </motion.div>
  );
};

export default EmployerInfo;