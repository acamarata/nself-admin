'use client'

import { ProjectSetupWizard } from '@/components/ProjectSetupWizard'
import { HeroPattern } from '@/components/HeroPattern'

export default function SetupPage() {
  return (
    <>
      <HeroPattern />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectSetupWizard />
      </div>
    </>
  )
}