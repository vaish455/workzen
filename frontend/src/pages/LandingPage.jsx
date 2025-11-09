import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Users, Clock, DollarSign, TrendingUp, Calendar, FileText, ArrowRight, CheckCircle } from 'lucide-react'
import Button from '../components/ui/button'

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Manage your workforce efficiently with comprehensive employee profiles and data',
      color: 'var(--color-primary)'
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Real-time attendance monitoring with automated clock-in/out systems',
      color: 'var(--color-primary)'
    },
    {
      icon: DollarSign,
      title: 'Payroll Processing',
      description: 'Automated salary calculations with support for various pay structures',
      color: 'var(--color-primary)'
    },
    {
      icon: Calendar,
      title: 'Leave Management',
      description: 'Streamlined leave requests, approvals, and balance tracking',
      color: 'var(--color-primary)'
    },
    {
      icon: FileText,
      title: 'Reports & Analytics',
      description: 'Comprehensive reports for informed decision-making',
      color: 'var(--color-primary)'
    },
    {
      icon: TrendingUp,
      title: 'Performance Insights',
      description: 'Track and analyze employee performance metrics',
      color: 'var(--color-primary)'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Companies Trust Us' },
    { value: '500K+', label: 'Employees Managed' },
    { value: '99.9%', label: 'Uptime Reliability' },
    { value: '24/7', label: 'Support Available' }
  ]

  const benefits = [
    'Easy onboarding and setup',
    'Secure cloud-based system',
    'Mobile-friendly interface',
    'Regular updates and improvements',
    'Dedicated customer support',
    'Affordable pricing plans'
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-accent-pink)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6" style={{ paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-3)' }}>
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              WorkZen
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={() => navigate('/register-admin')}
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Animated Title with Blur Effect */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              {['Simplify', 'Your', 'Workforce', 'Management'].map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className="inline-block mr-4"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Animated Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              All-in-one HR solution for modern businesses. Manage employees, attendance, payroll, and more.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/register-admin')}
                icon={ArrowRight}
              >
                Start Free Trial
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Animated Divider */}
      <div className="py-12 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="relative h-px"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <motion.div
              className="absolute top-0 left-0 h-full"
              style={{ 
                width: '200px',
                background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
              }}
              animate={{
                x: ['-200px', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Everything You Need
            </h2>
            <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
              Comprehensive features to streamline your HR operations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="rounded-2xl p-8 transition-all"
                  style={{ 
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-6" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2, type: 'spring' }}
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 px-6" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Why Choose WorkZen?
              </h2>
              <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                We provide the most reliable and user-friendly HR management solution designed for businesses of all sizes.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'white' }}>
                <div className="space-y-6">
                  {[1, 2, 3].map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ backgroundColor: 'var(--color-accent-pink)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 rounded" style={{ backgroundColor: 'var(--color-border)', width: '70%' }} />
                        <div className="h-3 rounded mt-2" style={{ backgroundColor: '#F5F5F5', width: '50%' }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl p-12 shadow-xl"
            style={{ backgroundColor: 'var(--color-surface)', border: '2px solid var(--color-border)' }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Ready to Transform Your HR?
            </h2>
            <p className="text-xl mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              Join thousands of companies already using WorkZen to streamline their operations
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/register-admin')}
                icon={ArrowRight}
              >
                Get Started Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>WorkZen</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Modern HR management made simple
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Product</h4>
              <ul className="space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Company</h4>
              <ul className="space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Legal</h4>
              <ul className="space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                <li>Privacy</li>
                <li>Terms</li>
                <li>Cookies</li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
            © 2024 WorkZen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage


