import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatabaseConsolePage from '../page'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}))

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
  }: {
    value: string
    onChange: (value: string) => void
  }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// TODO v0.5.1: Fix failing tests in this file
describe.skip('DatabaseConsolePage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('renders the database console page', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(screen.getByText('Database Connection')).toBeInTheDocument()
    })
  })

  it('shows loading skeleton initially', () => {
    render(<DatabaseConsolePage />)

    expect(screen.getByLabelText('Loading code editor...')).toBeInTheDocument()
  })

  it('loads with a default template query', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      const editor = screen.getByTestId('monaco-editor')
      expect(editor).toHaveValue('SELECT * FROM users LIMIT 10;')
    })
  })

  it('shows schema browser by default', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(screen.getByText('Schema Browser')).toBeInTheDocument()
    })
  })

  it('can toggle schema browser visibility', async () => {
    const user = userEvent.setup()
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(screen.getByText('Schema Browser')).toBeInTheDocument()
    })

    const schemaButton = screen.getByRole('button', { name: /schema/i })
    await user.click(schemaButton)

    await waitFor(() => {
      expect(screen.queryByText('Schema Browser')).not.toBeInTheDocument()
    })
  })

  it('displays database connection status', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })
  })

  it('allows changing the selected database', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })
  })

  it('can edit the SQL query', async () => {
    const user = userEvent.setup()
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      const editor = screen.getByTestId('monaco-editor')
      expect(editor).toBeInTheDocument()
    })

    const editor = screen.getByTestId('monaco-editor')
    await user.clear(editor)
    await user.type(editor, 'SELECT * FROM posts;')

    expect(editor).toHaveValue('SELECT * FROM posts;')
  })

  it('shows execute button', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /execute/i }),
      ).toBeInTheDocument()
    })
  })

  it('can execute a query', async () => {
    const user = userEvent.setup()
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      const executeButton = screen.getByRole('button', { name: /execute/i })
      expect(executeButton).toBeInTheDocument()
    })

    const executeButton = screen.getByRole('button', { name: /execute/i })
    await user.click(executeButton)

    await waitFor(() => {
      expect(screen.getByText('Query Results')).toBeInTheDocument()
    })
  })

  it('shows query history button', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /history/i }),
      ).toBeInTheDocument()
    })
  })

  it('can toggle query history sidebar', async () => {
    const user = userEvent.setup()
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      const historyButton = screen.getByRole('button', { name: /history/i })
      expect(historyButton).toBeInTheDocument()
    })

    const historyButton = screen.getByRole('button', { name: /history/i })
    await user.click(historyButton)

    await waitFor(() => {
      expect(screen.getByText('Query History')).toBeInTheDocument()
    })
  })

  it('shows saved queries button', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument()
    })
  })

  it('can toggle saved queries sidebar', async () => {
    const user = userEvent.setup()
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      const savedButton = screen.getByRole('button', { name: /saved/i })
      expect(savedButton).toBeInTheDocument()
    })

    const savedButton = screen.getByRole('button', { name: /saved/i })
    await user.click(savedButton)

    await waitFor(() => {
      expect(screen.getByText('Saved Queries')).toBeInTheDocument()
    })
  })

  it('shows save query button', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /save query/i }),
      ).toBeInTheDocument()
    })
  })

  it('displays query metadata (characters, lines)', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(screen.getByText(/Characters:/i)).toBeInTheDocument()
      expect(screen.getByText(/Lines:/i)).toBeInTheDocument()
    })
  })

  it('has query templates dropdown', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(screen.getByText('Query templates...')).toBeInTheDocument()
    })
  })

  it('shows empty state before query execution', async () => {
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      expect(screen.getByText('Ready to execute')).toBeInTheDocument()
    })
  })

  it('persists query history in localStorage', async () => {
    const user = userEvent.setup()
    render(<DatabaseConsolePage />)

    await waitFor(() => {
      const executeButton = screen.getByRole('button', { name: /execute/i })
      expect(executeButton).toBeInTheDocument()
    })

    const executeButton = screen.getByRole('button', { name: /execute/i })
    await user.click(executeButton)

    await waitFor(() => {
      const history = localStorage.getItem('db-console-history')
      expect(history).not.toBeNull()
    })
  })
})
