import type { Plugin } from 'vite'
import { execSync } from 'child_process'

interface BuildMetadataOptions {
  element?: string
  dateFormat?: 'iso' | 'locale' | 'timestamp'
}

export function buildMetadata(options: BuildMetadataOptions = {}): Plugin {
  const { element = 'root', dateFormat = 'iso' } = options

  return {
    name: 'build-metadata',
    transformIndexHtml(html: string, context: { bundle?: unknown }) {
      // Only inject metadata during build, not in dev mode
      if (context.bundle) {
        try {
          // Get current timestamp
          const buildTime = new Date()
          let formattedTime: string

          switch (dateFormat) {
            case 'timestamp':
              formattedTime = buildTime.getTime().toString()
              break
            case 'locale':
              formattedTime = buildTime.toLocaleString()
              break
            case 'iso':
            default:
              formattedTime = buildTime.toISOString()
              break
          }

          // Get current branch name
          let branchName = 'unknown'
          try {
            branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
          } catch (error) {
            console.warn('Could not determine git branch:', error)
          }

          // Determine environment
          const environment = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'

          // Inject metadata as data attributes on the specified element
          const metadataAttributes = [
            `data-build-time="${formattedTime}"`,
            `data-build-branch="${branchName}"`,
            `data-build-env="${environment}"`
          ].join(' ')

          // Replace the element with metadata
          const elementPattern = new RegExp(`<div id="${element}"([^>]*)>`, 'g')
          return html.replace(elementPattern, `<div id="${element}"$1 ${metadataAttributes}>`)
        } catch (error) {
          console.warn('Failed to inject build metadata:', error)
          return html
        }
      }

      return html
    }
  }
}
