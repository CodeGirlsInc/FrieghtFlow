'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth.api'
import { ShieldCheck, ArrowLeft, Loader2, Lock } from 'lucide-react'
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Placeholder authentication hook store integration mapping
const useAuthStore = () => ({
  saveSessionTokens: (accessToken: string, refreshToken: string) => {
    // Replace with your real app token store logic (e.g., localStorage or cookies)
    console.log("Tokens stored securely:", { accessToken, refreshToken })
  }
})

export default function LoginPage() {
  const router = useRouter()
  const tokenStore = useAuthStore()

  const [loading, setLoading] = React.useState<boolean>(false)
  const [globalError, setGlobalError] = React.useState<string | null>(null)

  // Password Login state captures
  const [email, setEmail] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')

  // 2FA Stepper Interception State Tracking
  const [tempToken, setTempToken] = React.useState<string | null>(null)
  const [isRecoveryMode, setIsRecoveryMode] = React.useState<boolean>(false)
  const [verificationCode, setVerificationCode] = React.useState<string>('')

  // Step 1: Handle initial password authentication
  const handlePrimaryLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setGlobalError(null)

      // Replace with your actual primary login endpoint call:
      // const response = await authApi.login({ email, password })
      
      // Simulated response payload logic for target environment integration
      const response = { requires_2fa: true, tempToken: "JWT-TEMP-SESSION-HASH" }

      if (response.requires_2fa) {
        setTempToken(response.tempToken) // Isolated component state, not exposed to cookies/localStorage
        setVerificationCode('')
        setIsRecoveryMode(false)
      } else {
        // Handle normal authenticated sessions immediately
        // tokenStore.saveSessionTokens(response.accessToken, response.refreshToken)
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      setGlobalError((err as {message?: string}).message || 'Authentication sequence failure.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Handle Multi-Factor Authentication token validation
  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempToken || !verificationCode) return

    try {
      setLoading(true)
      setGlobalError(null)
      
      const session = await authApi.verify2FA(verificationCode, tempToken, isRecoveryMode)
      tokenStore.saveSessionTokens(session.accessToken, session.refreshToken)
      
      // Successful verification path clears component states before routing
      setTempToken(null)
      router.push('/dashboard')
    } catch (err: unknown) {
      // Acceptance Criteria: Keep verification fields populated upon input rejections
      setGlobalError((err as {message?: string}).message || 'Invalid confirmation code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToPassword = () => {
    setTempToken(null)
    setVerificationCode('')
    setIsRecoveryMode(false)
    setGlobalError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      <Card className="w-full max-w-[400px] border-slate-200 shadow-xl bg-white">
        
        {/* Render Form Sheet A: Standard Login Profile Matrix */}
        {!tempToken ? (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-black tracking-tight text-slate-900">Welcome back</CardTitle>
              <CardDescription>Enter your account credentials to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePrimaryLogin} className="space-y-4">
                {globalError && (
                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-600 font-medium">
                    {globalError}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <Input type="email" required placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <Input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign In
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          
          /* Render Form Sheet B: Intercepted Two-Step Verification Profile Panel */
          <>
            <CardHeader className="space-y-1">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 w-fit mb-1">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold tracking-tight text-slate-900">
                {isRecoveryMode ? "Enter Emergency Recovery Key" : "Enter Verification Code"}
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                {isRecoveryMode 
                  ? "Input one of your 8-character backup recovery tracking phrases." 
                  : "Open your authenticator app and enter the active 6-digit session token."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMFAVerify} className="space-y-4">
                {globalError && (
                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-600 font-medium">
                    {globalError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  {isRecoveryMode ? (
                    <Input
                      autoFocus
                      required
                      placeholder="XXXXXXXX"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      className="text-center font-mono uppercase text-sm tracking-widest"
                    />
                  ) : (
                    <Input
                      autoFocus
                      maxLength={6}
                      inputMode="numeric"
                      required
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center font-mono text-xl tracking-widest"
                    />
                  )}
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading || !verificationCode}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Verify Profile
                </Button>

                <div className="flex flex-col gap-2 pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecoveryMode(!isRecoveryMode);
                      setVerificationCode('');
                      setGlobalError(null);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
                  >
                    {isRecoveryMode ? "Use authenticator app token instead" : "Use an emergency recovery code"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleBackToPassword}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mt-1.5 transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back to profile login
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}