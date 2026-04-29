import { Link } from 'react-router-dom'
import { ArrowRight, Camera, Heart, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

const features = [
  {
    icon: Camera,
    title: 'Share memories',
    description: 'Post photos and stories from past events and unforgettable moments.',
  },
  {
    icon: Users,
    title: 'Discover providers',
    description: 'Find photographers, decorators, planners, makeup artists, and more.',
  },
  {
    icon: Heart,
    title: 'Connect socially',
    description: 'React, comment, follow people, and explore inspiring event memories.',
  },
]

export function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Badge variant="orange">Momento social platform</Badge>

          <h1 className="mt-6 max-w-2xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Share memories. Discover services. Create your next moment.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Momento is a social platform where users share memories from past events and
            discover trusted service providers for future occasions.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register">
              <Button>
                Get started
                <ArrowRight className="ml-2 inline" size={16} />
              </Button>
            </Link>

            <Link to="/services">
              <Button variant="outline">Explore services</Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-pink-300/40 blur-3xl" />
          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-violet-300/40 blur-3xl" />

          <Card className="relative overflow-hidden p-4">
            <div className="h-80 rounded-3xl bg-gradient-to-br from-orange-200 via-pink-200 to-violet-200 p-6">
              <div className="rounded-3xl bg-white/85 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-orange-500" />
                  <div>
                    <p className="font-semibold text-slate-950">Sara’s Birthday</p>
                    <p className="text-sm text-slate-500">Shared 2 hours ago</p>
                  </div>
                </div>

                <p className="mt-5 text-slate-700">
                  A beautiful evening full of lights, flowers, and unforgettable smiles.
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="h-24 rounded-2xl bg-orange-300" />
                  <div className="h-24 rounded-2xl bg-pink-300" />
                  <div className="h-24 rounded-2xl bg-violet-300" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <feature.icon className="text-orange-500" size={28} />
              <h3 className="mt-4 text-lg font-bold text-slate-950">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}