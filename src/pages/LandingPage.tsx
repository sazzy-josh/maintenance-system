import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import {
  Wrench01Icon,
  ShieldKeyIcon,
  BarChartIcon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  UserGroupIcon,
  Building03Icon,
  Notification01Icon,
  Camera01Icon,
} from 'hugeicons-react'

const features = [
  {
    icon: Wrench01Icon,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    title: 'Students & Staff',
    desc: 'Report faults in under 2 minutes with photo evidence. Track progress in real time from any device.',
  },
  {
    icon: ShieldKeyIcon,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    title: 'Maintenance Officers',
    desc: 'See your assigned jobs sorted by priority. Update progress and close work with proof photos.',
  },
  {
    icon: BarChartIcon,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Administrators',
    desc: 'Assign requests, monitor SLAs, manage users, and export detailed CSV and PDF reports.',
  },
]

const highlights = [
  { icon: Clock01Icon, text: 'Real-time status updates' },
  { icon: Camera01Icon, text: 'Photo & file attachments' },
  { icon: Notification01Icon, text: 'Email & in-app notifications' },
  { icon: UserGroupIcon, text: 'Role-based access control' },
]

const steps = [
  { step: '01', title: 'Submit a Request', desc: 'Fill in the fault details, pick a category, and optionally attach a photo. Done in under 2 minutes.' },
  { step: '02', title: 'Track Progress', desc: 'An officer is assigned and you receive notifications at every status change — no more chasing.' },
  { step: '03', title: 'Request Closed', desc: 'Once repairs are complete, the request is closed and a summary is saved to your history.' },
]

export const LandingPage = () => (
  <div className="min-h-screen flex flex-col bg-white">

    {/* ── Nav ── */}
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <Wrench01Icon size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">MIVA FixIt</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>

    <main className="flex-1">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#3730a3]">
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-indigo-200 mb-8 backdrop-blur-sm">
            <Building03Icon size={14} className="text-indigo-300" />
            MIVA Open University · Facilities Management
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Campus Maintenance,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
              Finally Sorted.
            </span>
          </h1>
          <p className="text-lg text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Report faults, track repairs, and close requests — all in one place.
            Built for students, officers, and admins at MIVA Open University.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-lg" asChild>
              <Link to="/register">
                Report a Fault
                <ArrowRight01Icon size={18} className="ml-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              asChild
            >
              <Link to="/login">Sign In to Dashboard</Link>
            </Button>
          </div>

          {/* Highlight pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {highlights.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm text-indigo-100 backdrop-blur-sm">
                <Icon size={14} className="text-indigo-300 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role cards ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">One System, Three Roles</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            FixIt gives every stakeholder exactly what they need — no more, no less.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, iconBg, iconColor, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-gray-100 p-6 bg-white shadow-card hover:shadow-elevated transition-shadow duration-200"
            >
              <div className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center mb-5`}>
                <Icon size={24} className={iconColor} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-3">From fault report to resolution in three steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-indigo-200 to-transparent -translate-x-4 z-0" />
                )}
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm mb-4 shadow-soft">
                    {step}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-center text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <div className="flex justify-center mb-4">
              <CheckmarkCircle01Icon size={40} className="text-indigo-200" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
            <p className="text-indigo-200 mb-8 max-w-md mx-auto">
              Create your account with your MIVA staff or matric ID and submit your first request in minutes.
            </p>
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-lg" asChild>
              <Link to="/register">
                Create Account
                <ArrowRight01Icon size={18} className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>

    {/* ── Footer ── */}
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <Wrench01Icon size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700">MIVA FixIt</span>
        </div>
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} MIVA Open University. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link to="/login" className="hover:text-gray-700 transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-gray-700 transition-colors">Register</Link>
        </div>
      </div>
    </footer>
  </div>
)
