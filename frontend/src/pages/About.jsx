import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  Award, 
  Settings, 
  Target, 
  Heart, 
  Lightbulb,
  Globe,
  Zap,
  CheckCircle
} from 'lucide-react';

const About = () => {
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

  const roles = [
    {
      icon: Users,
      title: "Students",
      description: "Discover internships, projects, and mentorship opportunities tailored to your skills and career goals.",
      features: ["Skill Assessment", "Resume Builder", "Project Portfolio", "Mentor Matching"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Briefcase,
      title: "Employers",
      description: "Find top talent, post opportunities, and build relationships with future professionals.",
      features: ["Talent Discovery", "Skills Matching", "Project Management", "Analytics Dashboard"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: Award,
      title: "Mentors",
      description: "Share your expertise, guide the next generation, and make a meaningful impact on careers.",
      features: ["Mentee Matching", "Progress Tracking", "Resource Sharing", "Impact Metrics"],
      color: "from-purple-500 to-purple-600"
    }//,
   // {
     // icon: Settings,
     // title: "Admins",
     // description: "Manage the platform, oversee operations, and ensure quality experiences for all users.",
     // features: ["User Management", "Content Moderation", "Analytics & Reports", "System Configuration"],
     // color: "from-orange-500 to-orange-600"
   // }
  ];

  const values = [
    {
      icon: Target,
      title: "Mission",
      description: "To revolutionize career development by connecting talent with opportunities through AI-powered matching and personalized guidance."
    },
    {
      icon: Heart,
      title: "Vision",
      description: "A world where every individual can discover and pursue their ideal career path with the right support and opportunities."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Continuously evolving our platform with cutting-edge technology to provide smarter, more effective career solutions."
    },
    {
      icon: Globe,
      title: "Impact",
      description: "Building a global community that empowers millions of professionals to achieve their career aspirations."
    }
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
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-gradient">Skillsyncer</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              We're on a mission to transform the way people discover, develop, and advance their careers. 
              Through AI-powered matching and comprehensive support, we connect talent with opportunities 
              that drive meaningful growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-6">
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform serves three key user groups, each with unique needs and goals
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {roles.map((role, index) => (
              <motion.div
                key={role.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <role.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {role.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {role.description}
                    </p>
                    
                    <div className="space-y-3">
                      {role.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our Growing Impact
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Numbers that reflect our commitment to connecting talent with opportunity
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { number: "10,000+", label: "Active Users" },
              { number: "5,000+", label: "Opportunities Posted" },
              { number: "2,500+", label: "Successful Matches" },
              { number: "95%", label: "User Satisfaction" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/90 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-secondary-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-secondary-200/20 to-primary-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={itemVariants} className="relative">
              {/* Header Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full px-6 py-3 mb-8 shadow-lg"
              >
                <Zap className="w-4 h-4 text-primary-600 mr-3" />
                <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">AI Technology</span>
              </motion.div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Powered by <span className="text-gradient">Advanced AI</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Our proprietary artificial intelligence algorithms analyze skills, preferences, 
                and career goals to create perfect matches between talent and opportunities. 
                We're constantly learning and improving to provide better recommendations.
              </p>
              
              {/* Enhanced Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { text: "Machine Learning Resume Parsing", icon: "🤖" },
                  { text: "Intelligent Skill Gap Analysis", icon: "🎯" },
                  { text: "Personalized Career Recommendations", icon: "💡" },
                  { text: "Predictive Matching Algorithms", icon: "⚡" }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                        <span className="text-lg">{feature.icon}</span>
                      </div>
                      <span className="text-gray-800 font-semibold group-hover:text-primary-700 transition-colors duration-300">
                        {feature.text}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-10 flex items-center space-x-8"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-gradient">99.2%</div>
                  <div className="text-sm text-gray-600 font-medium">Accuracy Rate</div>
                </div>
                {/* <div className="text-center">
                  <div className="text-3xl font-bold text-gradient">&lt; 2s</div>
                  <div className="text-sm text-gray-600 font-medium">Processing Time</div>
                </div> */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gradient">24/7</div>
                  <div className="text-sm text-gray-600 font-medium">AI Learning</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Enhanced Visual Section */}
            <motion.div
              variants={itemVariants}
              className="relative lg:pl-8"
            >
              <div className="relative">
                {/* Main AI Visual Container */}
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600"></div>
                  </div>
                  
                  {/* Central AI Brain */}
                  <div className="relative z-10 flex items-center justify-center mb-8">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-32 h-32 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-2xl relative"
                    >
                      <Zap className="w-16 h-16 text-white" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl animate-ping opacity-20"></div>
                    </motion.div>
                  </div>

                  {/* Floating AI Elements */}
                  <div className="relative">
                    {[
                      { delay: 0, x: "20px", y: "40px", size: "w-16 h-16", icon: "🧠" },
                      { delay: 1, x: "280px", y: "60px", size: "w-12 h-12", icon: "📊" },
                      { delay: 2, x: "40px", y: "200px", size: "w-14 h-14", icon: "🎯" },
                      { delay: 0.5, x: "250px", y: "180px", size: "w-10 h-10", icon: "⚡" },
                      { delay: 1.5, x: "160px", y: "30px", size: "w-8 h-8", icon: "💡" },
                      { delay: 2.5, x: "180px", y: "220px", size: "w-12 h-12", icon: "🔍" }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className={`absolute ${item.size} bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100`}
                        style={{ left: item.x, top: item.y }}
                        animate={{
                          y: [0, -15, 0],
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 3 + index * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: item.delay
                        }}
                      >
                        <span className="text-lg">{item.icon}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Data Flow Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 0.3 }} />
                      </linearGradient>
                    </defs>
                    {[
                      { x1: "50%", y1: "30%", x2: "80%", y2: "60%" },
                      { x1: "50%", y1: "50%", x2: "20%", y2: "80%" },
                      { x1: "30%", y1: "40%", x2: "70%", y2: "70%" }
                    ].map((line, index) => (
                      <motion.line
                        key={index}
                        x1={line.x1} y1={line.y1}
                        x2={line.x2} y2={line.y2}
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: [0, 1, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                      />
                    ))}
                  </svg>
                </div>

                {/* Floating Stats Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient">AI</div>
                    <div className="text-xs text-gray-600">Powered</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gradient">ML</div>
                    <div className="text-xs text-gray-600">Learning</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;