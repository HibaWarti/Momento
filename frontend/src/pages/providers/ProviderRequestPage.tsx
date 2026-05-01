import { FileImage, IdCard, Info, Send, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import {
  getMyProviderRequests,
  submitProviderRequest,
  uploadCinPicture,
} from '../../api/providerApi'
import { useAuthStore } from '../../store/authStore'
import type { ProviderRequest } from '../../types/provider'

export function ProviderRequestPage() {
  const user = useAuthStore((state) => state.user)
  const [requests, setRequests] = useState<ProviderRequest[]>([])
  const [professionalName, setProfessionalName] = useState('')
  const [professionalDescription, setProfessionalDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [cinNumber, setCinNumber] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [cinFile, setCinFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const latestRequest = requests[0] ?? null
  const hasActiveRequest = useMemo(
    () =>
      requests.some((request) => request.status === 'PENDING' || request.status === 'REVIEWING'),
    [requests],
  )

  const loadRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getMyProviderRequests()
      setRequests(response.providerRequests)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  const resetForm = () => {
    setProfessionalName('')
    setProfessionalDescription('')
    setPhone('')
    setCity('')
    setCinNumber('')
    setAdditionalInfo('')
    setCinFile(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!cinFile) {
      setError('Please choose a CIN picture before submitting.')
      return
    }

    try {
      setIsSubmitting(true)
      const uploadResponse = await uploadCinPicture(cinFile)
      const response = await submitProviderRequest({
        professionalName,
        professionalDescription,
        phone,
        city,
        cinNumber,
        cinPicturePath: uploadResponse.cinPicturePath,
        additionalInfo: additionalInfo.trim() || undefined,
      })

      setRequests((current) => [response.providerRequest, ...current])
      setSuccessMessage(response.message)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit provider request')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-74px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-500"></div>
          <p className="mt-4 text-slate-600">Loading provider request details...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section>
          <Badge variant="purple">Become a provider</Badge>

          <h1 className="mt-4 text-4xl font-bold text-slate-950">
            Request your provider account
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Submit your professional information so the admin team can review your request.
            Once approved, you will be able to create a provider profile and publish services.
          </p>

          <Card className="mt-8">
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              {user?.role === 'PROVIDER' && (
                <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-700 md:col-span-2">
                  Your account is already approved as a provider.
                </div>
              )}

              {latestRequest && (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 md:col-span-2">
                  Latest request status: <strong>{latestRequest.status}</strong>
                </div>
              )}

              {error && (
                <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 md:col-span-2">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-700 md:col-span-2">
                  {successMessage}
                </div>
              )}

              <Input
                label="Professional name"
                placeholder="Example: Bloom Events"
                autoComplete="organization"
                value={professionalName}
                onChange={(event) => setProfessionalName(event.target.value)}
                disabled={hasActiveRequest || user?.role === 'PROVIDER' || isSubmitting}
              />

              <Input
                label="Phone number"
                placeholder="Example: 06 00 00 00 00"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={hasActiveRequest || user?.role === 'PROVIDER' || isSubmitting}
              />

              <Input
                label="City"
                placeholder="Example: Casablanca"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                disabled={hasActiveRequest || user?.role === 'PROVIDER' || isSubmitting}
              />

              <Input
                label="CIN number"
                placeholder="Example: AB123456"
                autoComplete="off"
                value={cinNumber}
                onChange={(event) => setCinNumber(event.target.value)}
                disabled={hasActiveRequest || user?.role === 'PROVIDER' || isSubmitting}
              />

              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Professional description
                </span>

                <textarea
                  rows={5}
                  placeholder="Describe your experience, services, and professional activity..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  value={professionalDescription}
                  onChange={(event) => setProfessionalDescription(event.target.value)}
                  disabled={hasActiveRequest || user?.role === 'PROVIDER' || isSubmitting}
                />
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  CIN picture
                </span>

                <div className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50 px-6 py-8 text-center transition hover:border-orange-400 hover:bg-orange-100">
                  <FileImage className="text-orange-500" size={34} />

                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Upload CIN picture
                  </p>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    This is required for verification. Accepted formats: PNG, JPG, JPEG.
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    {cinFile ? cinFile.name : 'No file selected yet'}
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setCinFile(event.target.files?.[0] ?? null)}
                    disabled={hasActiveRequest || user?.role === 'PROVIDER' || isSubmitting}
                  />
                </div>
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Additional information
                </span>

                <textarea
                  rows={4}
                  placeholder="Add any extra details that may help the admin review your request..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  value={additionalInfo}
                  onChange={(event) => setAdditionalInfo(event.target.value)}
                  disabled={hasActiveRequest || user?.role === 'PROVIDER' || isSubmitting}
                />
              </label>

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={hasActiveRequest || user?.role === 'PROVIDER' || isSubmitting}
                >
                  <Send className="mr-2 inline" size={16} />
                  {isSubmitting ? 'Submitting...' : 'Submit provider request'}
                </Button>
              </div>
            </form>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <ShieldCheck size={24} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">Verification process</h2>
                <p className="text-sm text-slate-500">Reviewed by admin</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-orange-50 p-4">
                <p className="font-semibold text-orange-800">1. Submit request</p>
                <p className="mt-1 text-sm leading-6 text-orange-700">
                  Fill your professional details and upload your CIN picture.
                </p>
              </div>

              <div className="rounded-2xl bg-violet-50 p-4">
                <p className="font-semibold text-violet-800">2. Admin review</p>
                <p className="mt-1 text-sm leading-6 text-violet-700">
                  The admin verifies your information and decides whether to approve it.
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-4">
                <p className="font-semibold text-green-800">3. Provider access</p>
                <p className="mt-1 text-sm leading-6 text-green-700">
                  Once approved, you can publish services and manage your provider profile.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <IdCard className="text-orange-500" size={22} />
              <h2 className="font-bold text-slate-950">Required information</h2>
            </div>

            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li>Professional name</li>
              <li>Professional description</li>
              <li>Phone number</li>
              <li>City</li>
              <li>CIN number</li>
              <li>CIN picture</li>
            </ul>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <Info className="mt-1 text-violet-600" size={22} />

              <p className="text-sm leading-6 text-slate-600">
                You can only have one pending provider request at a time. If your request is
                rejected, you may submit another one later.
              </p>
            </div>
          </Card>

          {requests.length > 0 && (
            <Card>
              <h2 className="font-bold text-slate-950">Previous requests</h2>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-slate-100 p-4">
                    <p className="font-semibold text-slate-950">{request.professionalName}</p>
                    <p className="mt-1">Status: {request.status}</p>
                    <p className="mt-1">City: {request.city}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </main>
  )
}
