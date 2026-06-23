'use client'

import * as React from 'react'
import { authApi, Setup2FAResponse } from '@/lib/api/auth.api'
import { 
  Shield, ShieldAlert, ShieldCheck, Copy, Check, 
  Download, Loader2, KeyRound, Smartphone, AlertTriangle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

export default function SecuritySettingsPage() {
  const [is2FAEnabled, setIs2FAEnabled] = React.useState<boolean>(false) // Default updated via profile check hooks
  const [loading, setLoading] = React.useState<boolean>(false)
  const [copiedText, setCopiedText] = React.useState<boolean>(false)

  // Modals state engines
  const [setupModalOpen, setSetupModalOpen] = React.useState<boolean>(false)
  const [disableModalOpen, setDisableModalOpen] = React.useState<boolean>(false)

  // Setup Wizard State Tracking
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [setupData, setSetupData] = React.useState<Setup2FAResponse | null>(null)
  const [otpValue, setOtpValue] = React.useState<string>('')
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[]>([])
  const [confirmSavedCodes, setConfirmSavedCodes] = React.useState<boolean>(false)
  const [inlineError, setInlineError] = React.useState<string | null>(null)

  // Disable Flow State Tracking
  const [confirmPassword, setConfirmPassword] = React.useState<string>('')

  const handleOpenSetup = async () => {
    try {
      setLoading(true)
      setInlineError(null)
      const data = await authApi.setup2FA()
      setSetupData(data)
      setStep(1)
      setSetupModalOpen(true)
    } catch (err: unknown) {
      alert((err as { message?: string }).message || 'Could not initialize 2FA configuration.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEnable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpValue.length !== 6) return
    try {
      setLoading(true)
      setInlineError(null)
      const data = await authApi.enable2FA(otpValue)
      setRecoveryCodes(data.recoveryCodes)
      setIs2FAEnabled(true)
      setStep(3)
    } catch (err: any) {
      setInlineError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setInlineError(null)
      await authApi.disable2FA(confirmPassword)
      setIs2FAEnabled(false)
      setDisableModalOpen(false)
      setConfirmPassword('')
    } catch (err: any) {
      setInlineError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
  }

  const downloadRecoveryCodesTxt = () => {
    const element = document.createElement("a")
    const file = new Blob([recoveryCodes.join("\n")], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = "yieldladder-recovery-codes.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-slate-900">Security Credentials Layout</h3>
        <p className="text-sm text-muted-foreground">Manage multi-factor verification keys and authorization checkpoints.</p>
      </div>
      <Separator />

      {/* 2FA Status Card Component Block */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-md font-bold flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-indigo-600" /> Two-Factor Authentication (2FA)
            </CardTitle>
            <CardDescription>Secure your ecosystem account using standard time-based tokens (TOTP).</CardDescription>
          </div>
          <div>
            {is2FAEnabled ? (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none text-white font-semibold flex items-center gap-1 px-2.5 py-1">
                <ShieldCheck className="h-3 w-3" /> Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 border-none text-slate-600 font-semibold flex items-center gap-1 px-2.5 py-1">
                <ShieldAlert className="h-3 w-3" /> Disabled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {is2FAEnabled ? (
            <p>Your account context is verified using a hardware or software authenticator app before granting entry credentials.</p>
          ) : (
            <p>Multi-factor verification is not configured yet. We recommend enabling 2FA to protect your transactions and balances.</p>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 px-6 py-3 justify-end">
          {is2FAEnabled ? (
            <Button variant="destructive" size="sm" onClick={() => { setInlineError(null); setDisableModalOpen(true); }}>
              Disable Two-Factor Auth
            </Button>
          ) : (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={handleOpenSetup} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Configure 2FA
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Dynamic 3-Step Setup Verification Modal */}
      <Dialog open={setupModalOpen} onOpenChange={(open) => !loading && step !== 3 && setSetupModalOpen(open)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Configure Authenticators</DialogTitle>
            <DialogDescription>Enhance your account security using a 3-step setup framework.</DialogDescription>
          </DialogHeader>

          {inlineError && (
            <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-600 font-medium">
              {inlineError}
            </div>
          )}

          {step === 1 && setupData && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 font-semibold">Step 1: Scan this QR matrix using your mobile authenticator app (Google Authenticator, Duo, or 1Password).</div>
              <div className="flex justify-center p-3 bg-white border rounded-xl w-fit mx-auto shadow-inner">
                <img src={setupData.qrCodeDataUrl} alt="2FA Setup QR Matrix" className="w-44 h-44" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Manual Account Key Configuration</label>
                <div className="flex gap-2">
                  <Input readOnly value={setupData.secret} className="font-mono text-xs bg-slate-50 select-all" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(setupData.secret)}>
                    {copiedText ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button className="w-full bg-indigo-600" onClick={() => setStep(2)}>Continue to Verification</Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyEnable} className="space-y-4">
              <div className="text-xs text-slate-600 font-semibold">Step 2: Enter the 6-digit confirmation token visible inside your app.</div>
              <div className="space-y-2">
                <Input 
                  autoFocus 
                  maxLength={6} 
                  inputMode="numeric"
                  placeholder="000000" 
                  value={otpValue} 
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  className="text-center font-mono text-lg tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="w-1/3" onClick={() => setStep(1)} disabled={loading}>Back</Button>
                <Button type="submit" className="w-2/3 bg-indigo-600" disabled={loading || otpValue.length !== 6}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enable 2FA
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div className="text-[11px] leading-relaxed font-medium">
                  <strong>Warning:</strong> Keep these emergency backup recovery phrases safe. They will not be displayed again.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900 rounded-xl font-mono text-xs text-slate-200 text-center shadow-inner">
                {recoveryCodes.map((code, idx) => <div key={idx} className="p-1">{code}</div>)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-1/2 text-xs" onClick={() => copyToClipboard(recoveryCodes.join('\n'))}>
                  Copy Archive Codes
                </Button>
                <Button variant="outline" size="sm" className="w-1/2 text-xs" onClick={downloadRecoveryCodesTxt}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download .txt
                </Button>
              </div>
              <Separator />
              <div className="flex items-start space-x-2 pt-1">
                <Checkbox id="confirm-save" checked={confirmSavedCodes} onCheckedChange={(checked) => setConfirmSavedCodes(!!checked)} />
                <label htmlFor="confirm-save" className="text-xs leading-none text-slate-600 font-medium select-none cursor-pointer">
                  I confirm that I have safely backed up all 8 recovery keys.
                </label>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!confirmSavedCodes} onClick={() => {
                setSetupModalOpen(false)
                setOtpValue('')
                setRecoveryCodes([])
                setConfirmSavedCodes(false)
              }}>
                Finish Configuration
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Danger-Zone Deactivation Confirmation Modal */}
      <Dialog open={disableModalOpen} onOpenChange={(open) => !loading && setDisableModalOpen(open)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <KeyRound className="h-5 w-5" /> Confirm Deactivation
            </DialogTitle>
            <DialogDescription>To disable 2FA protections, confirm your primary identity profile parameters below.</DialogDescription>
          </DialogHeader>

          {inlineError && (
            <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-600 font-medium">
              {inlineError}
            </div>
          )}

          <form onSubmit={handleDisable2FA} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Account Password</label>
              <Input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDisableModalOpen(false)} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="destructive" size="sm" disabled={loading || !confirmPassword}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Deactivation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}