import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Mail01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffIcon,
  ShieldKeyIcon,
  Activity01Icon,
  ChartLineData02Icon,
  ArrowRight01Icon,
} from 'hugeicons-react'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

const FEATURE_BULLETS = [
  {
    icon: Activity01Icon,
    label: 'Real-time status updates',
    detail: 'Live notifications at every stage of your request',
  },
  {
    icon: ChartLineData02Icon,
    label: 'Analytics & reporting',
    detail: 'Full performance dashboards for administrators',
  },
  {
    icon: ShieldKeyIcon,
    label: 'Secure role-based access',
    detail: 'Every action is audited and traceable',
  },
]

export const LoginPage = () => {
  const { login, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  })

  useEffect(() => {
    if (user) {
      const dest =
        user.role === 'ADMIN'
          ? '/admin'
          : user.role === 'OFFICER'
          ? '/officer'
          : '/dashboard'
      navigate(dest, { replace: true })
    }
  }, [user, navigate])

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      toast('Welcome back!', 'success')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Invalid email or password. Please try again.'
      setError('root', { message })
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left branding panel (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-1/2 relative overflow-hidden flex-col"
        style={{
          background:
            'linear-gradient(140deg, #312e81 0%, #4f46e5 45%, #7c3aed 100%)',
        }}
      >
        {/* Dot-grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.12) 1.5px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Decorative blurred circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="h-11 w-11 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                <ShieldKeyIcon size={22} className="text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                MIVA FixIt
              </span>
            </div>
            <p className="text-white/55 text-sm pl-14">
              Maintenance Management Portal
            </p>
          </div>

          {/* Hero copy + bullets */}
          <div className="space-y-10">
            <div>
              <h2 className="text-[2.6rem] font-extrabold leading-[1.15] tracking-tight mb-4">
                Manage requests.
                <br />
                Track progress.
                <br />
                Get results.
              </h2>
              <p className="text-white/65 text-[15px] leading-relaxed max-w-sm">
                The university's centralised platform for maintenance and
                service requests — from submission through to resolution.
              </p>
            </div>

            <div className="space-y-4">
              {FEATURE_BULLETS.map(({ icon: Icon, label, detail }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="h-9 w-9 bg-white/12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/15">
                    <Icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90 leading-snug">
                      {label}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} MIVA Open University. All rights
            reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-[#f4f5fb]">
        <div className="w-full max-w-[420px]">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow">
              <ShieldKeyIcon size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-lg text-primary tracking-tight">
              MIVA FixIt
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[1.7rem] font-extrabold text-foreground tracking-tight leading-tight">
              Sign in to your account
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              {/* Root / server error */}
              {errors.root && (
                <div
                  role="alert"
                  className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                >
                  <span className="text-base mt-px select-none" aria-hidden>
                    ⚠
                  </span>
                  <span>{errors.root.message}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail01Icon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@miva.university"
                    className="pl-9"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline underline-offset-2"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockPasswordIcon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="pl-9 pr-10"
                    aria-invalid={!!errors.password}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? (
                      <ViewOffIcon size={16} />
                    ) : (
                      <ViewIcon size={16} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5 pt-0.5">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
                  {...register('rememberMe')}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-muted-foreground cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-11 text-[15px] font-semibold mt-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight01Icon size={17} />
                  </>
                )}
              </Button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary hover:underline underline-offset-2"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
