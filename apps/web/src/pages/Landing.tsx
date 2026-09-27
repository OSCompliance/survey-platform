import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useEffect } from 'react';

export function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-teal-600">Survey Platform</div>
          <nav className="flex gap-6 items-center">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition">Features</a>
            <a href="#how" className="text-sm font-medium text-gray-700 hover:text-teal-600 transition">How it Works</a>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-md border border-teal-600 text-sm font-semibold text-teal-600 hover:bg-teal-50 transition"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-md bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Collect Research Data at Scale
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, distribute, and analyze surveys in minutes. Real-time responses, enterprise security, and global reach.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 rounded-md bg-teal-600 font-semibold text-white hover:bg-teal-700 transition"
            >
              Start Free Trial
            </button>
            <button
              className="px-8 py-3 rounded-md border border-teal-600 font-semibold text-teal-600 hover:bg-teal-50 transition"
            >
              View Demo
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-b border-gray-200">
          <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Instant Deployment', desc: 'Launch surveys globally in seconds with Cloudflare\'s 200+ edge locations.' },
              { icon: '📊', title: 'Real-time Analytics', desc: 'Watch responses come in live with instant charts, heatmaps, and insights.' },
              { icon: '🔒', title: 'Enterprise Security', desc: 'PBKDF2-SHA256 hashing, JWT tokens, and compliance with data regulations.' },
              { icon: '🌍', title: 'Global Scale', desc: 'Reach respondents worldwide with 99.9% uptime and <500ms latency.' },
              { icon: '📱', title: 'Mobile Optimized', desc: 'Surveys look perfect on any device. Desktop, tablet, mobile—all seamless.' },
              { icon: '🔌', title: 'API First', desc: 'Build custom integrations with our comprehensive REST API and webhooks.' },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Create', desc: 'Design your survey with drag-and-drop questions, logic, and branching.' },
              { num: '2', title: 'Distribute', desc: 'Share via link, email, QR code, or embed on your website instantly.' },
              { num: '3', title: 'Analyze', desc: 'Watch real-time responses with automatic analysis and visual reports.' },
              { num: '4', title: 'Export', desc: 'Download data as CSV, PDF, or connect to your analytics platform.' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gray-50 border-t border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { num: '10k+', label: 'Survey Responses' },
                { num: '99.9%', label: 'Uptime SLA' },
                { num: '<500ms', label: 'API Latency' },
                { num: '24/7', label: 'Support' },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-4xl font-bold text-teal-600 mb-2">{stat.num}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Ready to Launch Your Research?</h2>
          <p className="text-lg text-gray-600 mb-8">Join researchers and organizations using Survey Platform to collect insights at scale.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 rounded-md bg-teal-600 font-semibold text-white hover:bg-teal-700 transition"
          >
            Start Your Free Trial Today
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {[
              {
                title: 'Product',
                links: ['Features', 'How It Works', 'Pricing', 'FAQ']
              },
              {
                title: 'Company',
                links: ['About Us', 'Blog', 'Careers', 'Contact']
              },
              {
                title: 'Resources',
                links: ['Documentation', 'API Reference', 'Guides', 'Community']
              },
              {
                title: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Security', 'Compliance']
              },
            ].map((section, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a href="#" className="text-sm text-gray-600 hover:text-teal-600 transition">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2026 Survey Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
