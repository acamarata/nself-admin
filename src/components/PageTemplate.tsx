import { HeroPattern } from '@/components/HeroPattern'

interface PageTemplateProps {
  title: string
  description: string
  children?: React.ReactNode
}

export function PageTemplate({ title, description, children }: PageTemplateProps) {
  return (
    <>
      <HeroPattern />
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-10 pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-white bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-lg">
            {description}
          </p>
        </div>
        
        {children || (
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-700">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Coming Soon
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                This feature is currently under development. Check back soon for updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}