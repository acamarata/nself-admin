import { type SearchOptions } from 'flexsearch'

declare module '@/mdx/search.mjs' {
  export type Result = {
    url: string
    title: string
    pageTitle?: string
  }

  export function search(query: string, options?: SearchOptions): Array<Result>
}

declare module '*.svg' {
  const content: any
  export default content
}

declare module '@/images/logos/*.svg' {
  const content: any
  export default content
}

declare module '@/images/*.svg' {
  const content: any
  export default content
}
