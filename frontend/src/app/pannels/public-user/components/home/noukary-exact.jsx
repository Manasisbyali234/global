import { useState } from "react";

// Inline SVG icons (from noukary.html)
const SearchIcon = (props) => (
  <svg {...props} className={(props.className || "") + " w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const MapPin = (props) => (
  <svg {...props} className={(props.className || "") + " w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const Briefcase = (props) => (
  <svg {...props} className={(props.className || "") + " w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const Menu = (props) => (
  <svg {...props} className={(props.className || "") + " w-6 h-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const X = (props) => (
  <svg {...props} className={(props.className || "") + " w-6 h-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12,5 19,12 12,19"></polyline>
  </svg>
);

const UserCheck = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <polyline points="16,11 18,13 22,9"></polyline>
  </svg>
);

const FileText = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14,2 14,8 20,8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10,9 9,9 8,9"></polyline>
  </svg>
);

const Phone = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const Mail = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const Facebook = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Twitter = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const Linkedin = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const Instagram = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.52.204 5.02.43a5.105 5.105 0 00-1.852 1.207 5.105 5.105 0 00-1.207 1.852C1.734 4.989 1.612 5.563 1.578 6.51.013 7.458 0 7.865 0 11.486v1.028c0 3.621.013 4.028.048 4.976.034.947.156 1.521.43 2.021a5.105 5.105 0 001.207 1.852 5.105 5.105 0 001.852 1.207c.5.226 1.074.348 2.021.43.948.035 1.355.048 4.976.048h1.028c3.621 0 4.028-.013 4.976-.048.947-.034 1.521-.156 2.021-.43a5.105 5.105 0 001.852-1.207 5.105 5.105 0 001.207-1.852c.226-.5.348-1.074.43-2.021.035-.948.048-1.355.048-4.976v-1.028c0-3.621-.013-4.028-.048-4.976-.034-.947-.156-1.521-.43-2.021a5.105 5.105 0 00-1.207-1.852A5.105 5.105 0 0019.021.43C18.521.204 17.947.082 17 .048 16.052.013 15.645 0 12.024 0h-1.007zm-.017 2.17c3.573 0 3.996.013 5.408.048.947.034 1.462.156 1.805.26.453.176.778.387 1.12.73.343.342.554.667.73 1.12.104.343.226.858.26 1.805.035 1.412.048 1.835.048 5.408s-.013 3.996-.048 5.408c-.034.947-.156 1.462-.26 1.805-.176.453-.387.778-.73 1.12-.342.343-.667.554-1.12.73-.343.104-.858.226-1.805.26-1.412.035-1.835.048-5.408.048z"/>
    <path d="M12.017 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12.017 16a4 4 0 110-8 4 4 0 010 8z"/>
    <circle cx="18.406" cy="5.594" r="1.44"/>
  </svg>
);

export default function HomeNoukaryExact() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const jobCategories = [
    { name: "Technology & IT", jobs: "15,000+", icon: "💻" },
    { name: "Sales & Business Development", jobs: "12,000+", icon: "📈" },
    { name: "Finance & Accounting", jobs: "8,500+", icon: "🏦" },
    { name: "Healthcare & Medical", jobs: "9,200+", icon: "🏥" },
    { name: "Engineering & Manufacturing", jobs: "11,000+", icon: "⚙️" },
    { name: "Education & Training", jobs: "6,800+", icon: "📚" },
    { name: "Human Resources", jobs: "7,500+", icon: "👥" },
    { name: "Creative & Design", jobs: "4,200+", icon: "🎨" },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Register & Create Profile",
      description:
        "Join Tale platform and build a comprehensive profile showcasing your professional expertise",
      icon: <UserCheck className="w-8 h-8" />,
    },
    {
      step: 2,
      title: "Explore Opportunities",
      description:
        "Browse curated job opportunities from verified employers and top-tier companies",
      icon: <SearchIcon className="w-8 h-8" />,
    },
    {
      step: 3,
      title: "Connect & Get Hired",
      description:
        "Connect directly with employers and get hired through our streamlined recruitment process",
      icon: <FileText className="w-8 h-8" />,
    },
  ];

  const stats = [
    { value: "25K+", label: "Active Jobs" },
    { value: "500K+", label: "Registered Professionals" },
    { value: "5K+", label: "Partner Companies" },
    { value: "100K+", label: "Successful Placements" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Briefcase />
                </div>
                <span className="text-2xl font-bold text-gray-900">Tale</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">Find Jobs</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">For Employers</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">HR Solutions</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">About Us</a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-gray-700 hover:text-orange-500 font-medium transition-colors">Login</button>
              <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">Register</button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <a href="#" className="text-gray-700 hover:text-orange-500 font-medium">Find Jobs</a>
                <a href="#" className="text-gray-700 hover:text-orange-500 font-medium">For Employers</a>
                <a href="#" className="text-gray-700 hover:text-orange-500 font-medium">HR Solutions</a>
                <a href="#" className="text-gray-700 hover:text-orange-500 font-medium">About Us</a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <button className="text-gray-700 hover:text-orange-500 font-medium text-left">Login</button>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors text-left">Register</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Professional <span className="text-orange-500"> Journey</span> Starts Here
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Tale connects talented professionals with leading employers. Discover career opportunities that align with your expertise and ambitions through our comprehensive recruitment platform.
            </p>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-lg max-w-4xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <SearchIcon />
                  </div>
                  <input type="text" placeholder="Job title, keywords, or company" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <MapPin />
                  </div>
                  <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>
                <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2">
                  <SearchIcon />
                  <span>Search Jobs</span>
                </button>
              </div>
            </div>

            {/* Quick Search Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Remote Work", "Full Time", "Contract", "Executive Roles", "Consulting"].map((tag) => (
                <button key={tag} className="bg-white text-gray-600 px-4 py-2 rounded-full border border-gray-200 hover:border-orange-500 hover:text-orange-500 transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white rounded-xl p-8 shadow-lg">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Industry Expertise</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tale specializes in connecting professionals across diverse industries with opportunities that match their expertise and career aspirations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobCategories.map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-orange-500">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">{category.name}</h3>
                <p className="text-gray-600 mb-4">{category.jobs} available jobs</p>
                <div className="flex items-center text-orange-500 font-medium">
                  <span>View Jobs</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works for Candidates */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Tale Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience our streamlined recruitment process designed to connect the right talent with the right opportunities efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <div className="text-orange-500">{step.icon}</div>
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 right-0 transform translate-x-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join Tale's professional network and discover opportunities that align with your career goals and expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Join Tale Today</button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-500 transition-colors">Employer Solutions</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Briefcase />
                </div>
                <span className="text-2xl font-bold">Tale</span>
              </div>
              <p className="text-gray-400 mb-6">
                Tale is your trusted recruitment partner, connecting exceptional talent with leading organizations. We specialize in professional placements across diverse industries.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Facebook className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Twitter className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Linkedin className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Instagram className="w-6 h-6" /></a>
              </div>
            </div>

            {/* Job Seekers */}
            <div>
              <h3 className="text-lg font-semibold mb-4">For Professionals</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Find Opportunities</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Career Guidance</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Profile Enhancement</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Industry Insights</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Skill Assessment</a></li>
              </ul>
            </div>

            {/* Employers */}
            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Talent Acquisition</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Executive Search</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">HR Consulting</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Recruitment Process</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Employer Solutions</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">About Tale</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Our Team</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Terms of Service</a></li>
              </ul>
              <div className="mt-6">
                <div className="flex items-center text-gray-400 mb-2">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>contact@tale.websitescheckup.in</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 Tale. All rights reserved.</p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
