import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  Building,
  Award,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: '',
    subject: '',
    message: ''
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      info: "hello@skillsyncer.com",
      description: "Drop us a line anytime!",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Phone,
      title: "Call Us",
      info: "+1 (555) 123-4567",
      description: "Mon-Fri from 8am to 6pm",
      color: "from-green-500 to-green-600"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      info: "123 Innovation Street",
      description: "Tech District, SF 94105",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Clock,
      title: "Working Hours",
      info: "24/7 Support",
      description: "Always here to help",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const departments = [
    {
      icon: Users,
      title: "General Inquiries",
      email: "hello@skillsyncer.com",
      description: "Questions about our platform"
    },
    {
      icon: Building,
      title: "Enterprise Sales",
      email: "sales@skillsyncer.com",
      description: "Custom solutions for companies"
    },
    {
      icon: MessageSquare,
      title: "Technical Support",
      email: "support@skillsyncer.com",
      description: "Help with technical issues"
    },
    {
      icon: Award,
      title: "Partnership",
      email: "partners@skillsyncer.com",
      description: "Collaboration opportunities"
    }
  ];

  const socialLinks = [
    { icon: Facebook, url: "#", color: "hover:text-blue-600" },
    { icon: Twitter, url: "#", color: "hover:text-blue-400" },
    { icon: Linkedin, url: "#", color: "hover:text-blue-700" },
    { icon: Instagram, url: "#", color: "hover:text-pink-500" },
    { icon: Github, url: "#", color: "hover:text-gray-800" }
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
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Have questions about Skillsyncer? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {info.title}
                </h3>
                <p className="text-lg text-primary-600 font-semibold mb-1">
                  {info.info}
                </p>
                <p className="text-gray-600 text-sm">
                  {info.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Contact Section */}
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                    I am a...
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="">Select your role</option>
                    <option value="student">Student</option>
                    <option value="employer">Employer</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-vertical"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary inline-flex items-center justify-center"
                >
                  <Send className="mr-2 w-5 h-5" />
                  Send Message
                </motion.button>
              </form>
            </motion.div>

            {/* Map and Additional Info */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Find Us Here
                </h2>
                
                {/* Interactive Map Placeholder */}
                <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8 h-64 flex items-center justify-center mb-8">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold">Interactive Map</p>
                    <p className="text-gray-600">123 Innovation Street, Tech District</p>
                  </div>
                </div>
              </div>

              {/* Departments */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Different Departments
                </h3>
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <motion.div
                      key={dept.title}
                      whileHover={{ x: 5 }}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <dept.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {dept.title}
                        </h4>
                        <p className="text-primary-600 font-medium text-sm mb-1">
                          {dept.email}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {dept.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Media & Footer Contact */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-white mb-6">
              Stay Connected
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Follow us on social media for the latest updates, tips, and career opportunities
            </p>
            
            <div className="flex justify-center space-x-6 mb-8">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white ${social.color} transition-colors duration-300 hover:bg-white/30`}
                >
                  <social.icon className="w-6 h-6" />
                </motion.a>
              ))}
            </div>
            
            <div className="border-t border-white/20 pt-8">
              <p className="text-white/90 mb-2">
                <strong>Quick Response:</strong> We typically respond within 2-4 hours during business hours
              </p>
              <p className="text-white/80 text-sm">
                For urgent matters, please call us directly at +1 (555) 123-4567
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Contact;