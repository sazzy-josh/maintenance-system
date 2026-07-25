import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../lib/axios'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Mail01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffIcon,
  UserIcon,
  Call02Icon,
  Building03Icon,
  IdentificationIcon,
  ArrowRight01Icon,
  UserAdd01Icon,
  ShieldKeyIcon,
  SparklesIcon,
} from 'hugeicons-react'

// ─── Validation schema ────────────────────────────────────────────────────────

const PASS_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    matricOrStaffId: z
      .string()
      .min(6, 'Must be at least 6 characters')
      .max(20, 'Must be 20 characters or fewer')
      .regex(/^[a-zA-Z0-9]+$/, 'Alphanumeric characters only'),
    phone: z.string().optional(),
    department: z.string().optional(),
    password: z
      .string()
      .regex(
        PASS_REGEX,
        'Min 8 characters with uppercase, lowercase, number and symbol'
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'Engineering',
  'Sciences',
  'Arts & Humanities',
  'Business',
  'Law',
  'Medicine & Health',
  'Education',
  'ICT',
  'Administration',
  'Other',
]

const LEFT_PANEL_POINTS = [
  {
    icon: ShieldKeyIcon,
    text: 'Your data is always encrypted and safe',
  },
  {
    icon: UserAdd01Icon,
    text: 'Free to register — no approval needed',
  },
  {
    icon: SparklesIcon,
    text: 'Submit requests in under two minutes',
  },
]

// ─── Password strength helpers ────────────────────────────────────────────────

const getStrength = (p: string): number => {
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[a-z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^a-zA-Z0-9]/.test(p)) s++
  return s
}

const STRENGTH_META: Record<
  number,
  { label: string; color: string; textColor: string }
> = {
  0: { label: '', color: 'bg-border', textColor: 'text-muted-foreground' },
  1: { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' },
  2: { label: 'Fair', color: 'bg-orange-400', textColor: 'text-orange-600' },
  3: { label: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  4: { label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  5: {
    label: 'Very Strong',
    color: 'bg-emerald-600',
    textColor: 'text-emerald-700',
  },
}

// ─── Field wrapper helper ─────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-xs text-destructive mt-1" role="alert">
      {message}
    </p>
  ) : null

// ─── Component ────────────────────────────────────────────────────────────────

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const strength = getStrength(passwordValue)
  const strengthMeta = STRENGTH_META[strength]

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/register', data)
      toast('Registration successful! Please sign in.', 'success')
      navigate('/login')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Registration failed. Please try again.'
      setError('root', { message: msg })
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left branding panel (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-2/5 relative overflow-hidden flex-col"
        style={{
          background:
            'linear-gradient(140deg, #1e1b4b 0%, #4338ca 50%, #6d28d9 100%)',
        }}
      >
        {/* Dot-grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.10) 1.5px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

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

          {/* Headline + bullets */}
          <div className="space-y-10">
            <div>
              <h2 className="text-[2.4rem] font-extrabold leading-[1.15] tracking-tight mb-4">
                Join MIVA FixIt.
                <br />
                Report issues.
                <br />
                See them fixed.
              </h2>
              <p className="text-white/65 text-[15px] leading-relaxed max-w-[300px]">
                Create a free account and start submitting maintenance requests
                for your campus in minutes.
              </p>
            </div>

            <div className="space-y-5">
              {LEFT_PANEL_POINTS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="h-9 w-9 bg-white/12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/15">
                    <Icon size={16} className="text-white" />
                  </div>
                  <p className="text-sm text-white/80 leading-snug">{text}</p>
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
      <div className="flex-1 flex items-start justify-center p-6 sm:p-10 lg:p-12 bg-[#f4f5fb] overflow-y-auto">
        <div className="w-full max-w-[500px] py-6">
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
              Create your account
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Fill in your details below to get started
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-6"
            >
              {/* Root error */}
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

              {/* ── Section: Personal info ── */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3">
                  Personal Information
                </p>

                {/* Full name */}
                <div className="space-y-1.5 pb-1">
                  <Label htmlFor="fullName">Full name *</Label>
                  <div className="relative">
                    <UserIcon
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      className="pl-9"
                      aria-invalid={!!errors.fullName}
                      {...register('fullName')}
                    />
                  </div>
                  <FieldError message={errors.fullName?.message} />
                </div>

                {/* Email + Matric/Staff ID — two columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email">Email address *</Label>
                    <div className="relative">
                      <Mail01Icon
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@miva.university"
                        className="pl-9"
                        aria-invalid={!!errors.email}
                        {...register('email')}
                      />
                    </div>
                    <FieldError message={errors.email?.message} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="matricOrStaffId">Matric / Staff ID *</Label>
                    <div className="relative">
                      <IdentificationIcon
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        id="matricOrStaffId"
                        type="text"
                        placeholder="MTR2024001"
                        className="pl-9"
                        aria-invalid={!!errors.matricOrStaffId}
                        {...register('matricOrStaffId')}
                      />
                    </div>
                    <FieldError message={errors.matricOrStaffId?.message} />
                  </div>
                </div>

                {/* Phone + Department — two columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">
                      Phone{' '}
                      <span className="text-muted-foreground font-normal text-xs">
                        (optional)
                      </span>
                    </Label>
                    <div className="relative">
                      <Call02Icon
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+234 800 000 0000"
                        className="pl-9"
                        {...register('phone')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="department">
                      Department{' '}
                      <span className="text-muted-foreground font-normal text-xs">
                        (optional)
                      </span>
                    </Label>
                    <div className="relative">
                      <Building03Icon
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                      />
                      <select
                        id="department"
                        className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer text-foreground"
                        {...register('department')}
                      >
                        <option value="">Select department…</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50" />

              {/* ── Section: Security ── */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3">
                  Security
                </p>

                {/* Password */}
                <div className="space-y-1.5 pb-1">
                  <Label htmlFor="reg-password">Password *</Label>
                  <div className="relative">
                    <LockPasswordIcon
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      id="reg-password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="pl-9 pr-10"
                      aria-invalid={!!errors.password}
                      {...register('password', {
                        onChange: (e) => setPasswordValue(e.target.value),
                      })}
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

                  {/* Strength meter */}
                  {passwordValue.length > 0 && (
                    <div className="pt-1.5 space-y-1.5">
                      <div className="flex gap-1" aria-hidden>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength
                                ? strengthMeta.color
                                : 'bg-border'
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs font-medium ${strengthMeta.textColor}`}
                        aria-live="polite"
                      >
                        {strengthMeta.label}
                        {strength < 3 && passwordValue.length > 0
                          ? ' — add uppercase, numbers & symbols'
                          : ''}
                      </p>
                    </div>
                  )}

                  <FieldError message={errors.password?.message} />
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="confirmPassword">Confirm password *</Label>
                  <div className="relative">
                    <LockPasswordIcon
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="pl-9 pr-10"
                      aria-invalid={!!errors.confirmPassword}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showConfirm
                          ? 'Hide confirm password'
                          : 'Show confirm password'
                      }
                    >
                      {showConfirm ? (
                        <ViewOffIcon size={16} />
                      ) : (
                        <ViewIcon size={16} />
                      )}
                    </button>
                  </div>
                  <FieldError message={errors.confirmPassword?.message} />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-11 text-[15px] font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Create account
                    <ArrowRight01Icon size={17} />
                  </>
                )}
              </Button>
            </form>

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
