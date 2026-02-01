import { test as base } from '@playwright/test'
import { BackupRestorePage } from './page-objects/BackupRestorePage'
import { BuildPage } from './page-objects/BuildPage'
import { ConfigPage } from './page-objects/ConfigPage'
import { DashboardPage } from './page-objects/DashboardPage'
import { DatabasePage } from './page-objects/DatabasePage'
import { DeploymentPage } from './page-objects/DeploymentPage'
import { HelpPage } from './page-objects/HelpPage'
import { LoginPage } from './page-objects/LoginPage'
import { LogsPage } from './page-objects/LogsPage'
import { ServicesPage } from './page-objects/ServicesPage'

type PageFixtures = {
  loginPage: LoginPage
  dashboardPage: DashboardPage
  buildPage: BuildPage
  servicesPage: ServicesPage
  databasePage: DatabasePage
  configPage: ConfigPage
  logsPage: LogsPage
  backupRestorePage: BackupRestorePage
  deploymentPage: DeploymentPage
  helpPage: HelpPage
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page))
  },
  buildPage: async ({ page }, use) => {
    await use(new BuildPage(page))
  },
  servicesPage: async ({ page }, use) => {
    await use(new ServicesPage(page))
  },
  databasePage: async ({ page }, use) => {
    await use(new DatabasePage(page))
  },
  configPage: async ({ page }, use) => {
    await use(new ConfigPage(page))
  },
  logsPage: async ({ page }, use) => {
    await use(new LogsPage(page))
  },
  backupRestorePage: async ({ page }, use) => {
    await use(new BackupRestorePage(page))
  },
  deploymentPage: async ({ page }, use) => {
    await use(new DeploymentPage(page))
  },
  helpPage: async ({ page }, use) => {
    await use(new HelpPage(page))
  },
})

export { expect } from '@playwright/test'
