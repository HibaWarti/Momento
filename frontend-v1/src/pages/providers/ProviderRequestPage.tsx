import { FileImage, IdCard, Info, Send, ShieldCheck } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

export function ProviderRequestPage() {
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
            <form className="grid gap-5 md:grid-cols-2">
              <Input
                label="Professional name"
                placeholder="Example: Bloom Events"
                autoComplete="organization"
              />

              <Input
                label="Phone number"
                placeholder="Example: 06 00 00 00 00"
                autoComplete="tel"
              />

              <Input label="City" placeholder="Example: Casablanca" />

              <Input
                label="CIN number"
                placeholder="Example: AB123456"
                autoComplete="off"
              />

              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Professional description
                </span>

                <textarea
                  rows={5}
                  placeholder="Describe your experience, services, and professional activity..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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

                  <input type="file" accept="image/*" className="hidden" />
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
                />
              </label>

              <div className="md:col-span-2">
                <Button type="button" className="w-full">
                  <Send className="mr-2 inline" size={16} />
                  Submit provider request
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
        </aside>
      </div>
    </main>
  )
}