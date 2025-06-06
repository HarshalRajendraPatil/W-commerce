import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('story');
  const [visibleSections, setVisibleSections] = useState({});

  // Observer for revealing sections on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      bio: 'With over 15 years of experience in e-commerce, Alex founded W-Commerce with a vision to revolutionize online shopping.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'
    },
    {
      id: 2,
      name: 'Sarah Williams',
      role: 'CTO',
      bio: 'Sarah leads our technical strategy and ensures our platform is always at the cutting edge of e-commerce technology.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Head of Product',
      bio: 'Michael focuses on creating intuitive user experiences that make shopping on our platform a joy.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      role: 'Marketing Director',
      bio: 'Emily brings brands and customers together through innovative marketing strategies and campaigns.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'
    }
  ];

  // Company milestones
  const milestones = [
    {
      year: 2016,
      title: 'Company Founded',
      description: 'W-Commerce was founded with a mission to create a seamless online shopping experience.'
    },
    {
      year: 2017,
      title: 'First 1,000 Products',
      description: 'Reached our first milestone of 1,000 products available on the platform.'
    },
    {
      year: 2018,
      title: 'Mobile App Launch',
      description: 'Launched our mobile app to provide customers with a convenient shopping experience on the go.'
    },
    {
      year: 2019,
      title: 'International Expansion',
      description: 'Expanded our operations to 10 countries, making our platform available to millions more shoppers.'
    },
    {
      year: 2020,
      title: 'Partnership Program',
      description: 'Launched our vendor partnership program, allowing small businesses to reach a wider audience.'
    },
    {
      year: 2021,
      title: '10 Million Users',
      description: 'Proudly celebrated reaching 10 million registered users on our platform.'
    },
    {
      year: 2023,
      title: 'AI Shopping Assistant',
      description: 'Introduced our AI-powered shopping assistant to help customers find the perfect products.'
    }
  ];

  // Stats
  const stats = [
    { label: 'Products', value: '50K+' },
    { label: 'Vendors', value: '5,000+' },
    { label: 'Countries', value: '25+' },
    { label: 'Happy Customers', value: '10M+' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-indigo-700 text-white py-20">
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute right-0 top-0 h-full w-1/2 transform translate-x-1/4" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
            <path d="M0 0L100 0L100 100L0 100L60 50L0 0Z" fill="rgba(255,255,255,0.1)" />
          </svg>
          <svg className="absolute left-0 bottom-0 h-full w-1/3 transform -translate-x-1/4" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
            <path d="M0 0L100 0L100 100L0 100L40 50L0 0Z" fill="rgba(255,255,255,0.05)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About W-Commerce</h1>
            <p className="text-xl text-indigo-100 mb-8">Revolutionizing the way people shop online since 2016. We're on a mission to make e-commerce more accessible, efficient, and enjoyable for everyone.</p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setActiveTab('story')}
                className={`px-6 py-2 rounded-full transition-colors ${activeTab === 'story' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              >
                Our Story
              </button>
              <button 
                onClick={() => setActiveTab('mission')}
                className={`px-6 py-2 rounded-full transition-colors ${activeTab === 'mission' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              >
                Mission & Vision
              </button>
              <button 
                onClick={() => setActiveTab('team')}
                className={`px-6 py-2 rounded-full transition-colors ${activeTab === 'team' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              >
                Our Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Our Story */}
          {activeTab === 'story' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
              <div className="prose prose-lg mx-auto">
                <p>W-Commerce began in 2016 with a simple idea: to create an online shopping platform that puts both customers and sellers first. Our founder, Alex Johnson, experienced firsthand the challenges of online retail from both sides – as a consumer frustrated with complicated checkout processes and as a small business owner struggling to reach customers online.</p>
                
                <p>That's when the idea for W-Commerce was born – a platform designed to simplify e-commerce for everyone involved. We started small, with just a handful of products and a small but dedicated team working out of a tiny office space.</p>
                
                <p>Fast forward to today, and W-Commerce has grown into a global marketplace connecting millions of shoppers with thousands of vendors across 25 countries. Despite our growth, we've stayed true to our core principles: user-friendly design, transparent business practices, and exceptional customer service.</p>
                
                <p>Along the way, we've pioneered numerous innovations in the e-commerce space, from our advanced recommendation engine to our streamlined checkout process. We've also built a community of passionate users who provide constant feedback and help shape the future of our platform.</p>
                
                <p>As we look to the future, we remain committed to our original mission of making online shopping better for everyone. We're constantly exploring new technologies and approaches to improve the W-Commerce experience, always with our users' needs at the forefront of our minds.</p>
              </div>

              {/* Stats */}
              <div id="stats" className="scroll-section mt-16">
                {visibleSections.stats && (
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    {stats.map((stat, index) => (
                      <motion.div 
                        key={index} 
                        className="bg-white p-6 rounded-lg shadow-md text-center"
                        variants={itemVariants}
                      >
                        <div className="text-3xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                        <div className="text-gray-600">{stat.label}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Timeline */}
              <div id="timeline" className="scroll-section mt-16">
                <h3 className="text-2xl font-bold mb-8 text-center">Our Journey</h3>
                {visibleSections.timeline && (
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-indigo-200"></div>
                    
                    {milestones.map((milestone, index) => (
                      <div key={index} className={`relative mb-12 ${index % 2 === 0 ? 'md:ml-auto md:mr-[50%] md:pr-12' : 'md:mr-auto md:ml-[50%] md:pl-12'}`}>
                        <div className="md:w-[90%] bg-white p-6 rounded-lg shadow-md relative">
                          {/* Circle on the timeline */}
                          <div className="absolute top-6 md:top-1/2 md:transform md:-translate-y-1/2 right-0 md:-right-6 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold z-10 md:translate-x-1/2">
                            {milestone.year}
                          </div>
                          
                          <h4 className="text-xl font-semibold mb-2">{milestone.title}</h4>
                          <p className="text-gray-600">{milestone.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mission & Vision */}
          {activeTab === 'mission' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Mission & Vision</h2>
              
              <div id="mission-vision" className="scroll-section grid md:grid-cols-2 gap-12">
                {visibleSections['mission-vision'] && (
                  <>
                    <motion.div 
                      className="bg-white p-8 rounded-lg shadow-md"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="mb-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Our Mission</h3>
                      </div>
                      <p className="text-gray-700 mb-4">
                        To create a global marketplace that empowers businesses of all sizes to reach customers worldwide, and enables consumers to discover and purchase products with ease and confidence.
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Provide a secure, reliable platform for e-commerce
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Support small businesses and entrepreneurs
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Simplify the online shopping experience
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Promote ethical and sustainable commerce
                        </li>
                      </ul>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white p-8 rounded-lg shadow-md"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="mb-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Our Vision</h3>
                      </div>
                      <p className="text-gray-700 mb-4">
                        To be the world's most customer-centric e-commerce platform, where people can find and discover anything they might want to buy online, and where businesses can thrive in a digital economy.
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Revolutionize global commerce through technology
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Connect people across borders through commerce
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Lead in AI-powered personalized shopping
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Set new standards for customer satisfaction
                        </li>
                      </ul>
                    </motion.div>
                  </>
                )}
              </div>
              
              {/* Values */}
              <div id="values" className="scroll-section mt-16">
                <h3 className="text-2xl font-bold mb-8 text-center">Our Core Values</h3>
                {visibleSections.values && (
                  <motion.div 
                    className="grid md:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    <motion.div 
                      className="bg-white p-6 rounded-lg shadow-md"
                      variants={itemVariants}
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Innovation</h4>
                      <p className="text-gray-600">We constantly push the boundaries of what's possible in e-commerce, experimenting with new technologies and approaches to create better experiences.</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white p-6 rounded-lg shadow-md"
                      variants={itemVariants}
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Trust</h4>
                      <p className="text-gray-600">We build trust through transparency, security, and reliability. Our users know they can count on us to deliver on our promises.</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white p-6 rounded-lg shadow-md"
                      variants={itemVariants}
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Community</h4>
                      <p className="text-gray-600">We foster connections between buyers and sellers, creating a vibrant community that goes beyond mere transactions.</p>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Team */}
          {activeTab === 'team' && (
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Meet Our Team</h2>
              <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">Behind W-Commerce is a diverse team of passionate individuals dedicated to transforming e-commerce. Here are some of our key team members who make it all happen.</p>
              
              <div id="team-members" className="scroll-section">
                {visibleSections['team-members'] && (
                  <motion.div 
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    {teamMembers.map((member) => (
                      <motion.div 
                        key={member.id} 
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                        variants={itemVariants}
                      >
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          className="w-full h-64 object-cover object-center"
                        />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                          <p className="text-indigo-600 mb-3">{member.role}</p>
                          <p className="text-gray-600">{member.bio}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
              
              <div className="mt-16 text-center">
                <h3 className="text-2xl font-bold mb-4">Join Our Team</h3>
                <p className="text-gray-600 mb-6">We're always looking for talented individuals to join our mission. Check out our current openings.</p>
                <a 
                  href="/careers" 
                  className="inline-block bg-indigo-600 text-white py-3 px-8 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  View Open Positions
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience W-Commerce?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">Join millions of satisfied customers who have discovered a better way to shop online.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/products" className="bg-white text-indigo-700 py-3 px-8 rounded-md hover:bg-gray-100 transition-colors">
              Start Shopping
            </a>
            <a href="/contact" className="bg-transparent border-2 border-white text-white py-3 px-8 rounded-md hover:bg-white hover:text-indigo-700 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 