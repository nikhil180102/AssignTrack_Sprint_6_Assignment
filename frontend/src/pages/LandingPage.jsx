import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
  Award,
  Menu,
  X,
  Target,
  Zap,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: BookOpen,
      title: 'Skill-Based Assessments',
      description: 'Run text, MCQ, and file assessments aligned to real upskilling outcomes.',
    },
    {
      icon: Users,
      title: 'Cohort + Instructor Management',
      description: 'Assign instructors to cohorts, manage content, and scale open learning tracks.',
    },
    {
      icon: Award,
      title: 'Continuous Feedback',
      description: 'Auto-score MCQs and give structured feedback on text and file submissions.',
    },
    {
      icon: Target,
      title: 'Learning Progress Visibility',
      description: 'Track completion, submissions, and growth across every enrolled learner.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
<nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AssignTrack
              </span>
            </div>
<div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium">
                Features
              </a>
              <a href="#roles" className="text-gray-700 hover:text-indigo-600 font-medium">
                Roles
              </a>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-indigo-600 font-semibold hover:text-indigo-700"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Get Started
              </button>
            </div>
<button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              title={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
{mobileMenuOpen && (
            <div id="landing-mobile-menu" className="md:hidden border-t border-gray-100 py-4 space-y-3">
              <a href="#features" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Features
              </a>
              <a href="#roles" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Roles
              </a>
              <button
                onClick={() => navigate('/login')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="block w-full px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg text-center"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>
<section className="pt-24 pb-12 px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Build an
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Open Learning Platform
              </span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              AssignTrack is an upskilling platform where administrators map instructors to cohorts,
              instructors publish practical learning tasks, and students build verifiable skills through
              continuous practice and feedback.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => navigate('/register')}
                className="group px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Start Free Today</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>
<section id="features" className="py-12 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Purpose-built workflows for open learning, instruction, and measurable skill growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
<section id="roles" className="py-12 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Built for Instructors & Students
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
<div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Instructors</h3>
              <ul className="space-y-2.5 mb-5">
                {[
                  'Publish learning tasks by cohort',
                  'Upload course links and learning resources',
                  'Auto-grade MCQs instantly',
                  'Evaluate text/file work with clear feedback',
                  'Track learner submissions and progress',
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Start Instructing
              </button>
            </div>
<div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Students</h3>
              <ul className="space-y-2.5 mb-5">
                {[
                  'Access structured learning content',
                  'Practice with text, MCQ, and file tasks',
                  'Get instant quiz results',
                  'Receive detailed evaluation feedback',
                  'Track skill progress by cohort',
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Start Learning
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

