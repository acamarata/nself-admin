import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(expectedText: string | RegExp): R
      toBeVisible(): R
      toBeEnabled(): R
      toBeDisabled(): R
      toHaveValue(expectedValue: string | string[] | number): R
      toHaveAttribute(expectedAttribute: string, expectedValue?: string): R
      toHaveClass(...expectedClassNames: string[]): R
      toHaveStyle(expectedStyles: string | Record<string, unknown>): R
      toBeChecked(): R
      toBeEmptyDOMElement(): R
      toHaveFocus(): R
      toBeInvalid(): R
      toBeValid(): R
      toBeRequired(): R
      toContainElement(expectedElement: HTMLElement | SVGElement | null): R
      toContainHTML(expectedHTML: string): R
      toHaveDescription(expectedDescription: string | RegExp): R
      toHaveDisplayValue(
        expectedValue: string | RegExp | string[] | RegExp[],
      ): R
      toHaveFormValues(expectedValues: Record<string, unknown>): R
      toHaveErrorMessage(expectedErrorMessage: string | RegExp): R
      toHaveAccessibleDescription(expectedDescription: string | RegExp): R
      toHaveAccessibleName(expectedName: string | RegExp): R
      toBePartiallyChecked(): R
    }
  }
}
