import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('renders the home view', () => {
    render(<App />);
    expect(screen.getByText('Build with intent.')).toBeInTheDocument();
    expect(screen.getByText('Noch kein Projekt geöffnet')).toBeInTheDocument();
  });

  it('renders settings when settings navigation is selected', async () => {
    render(<App />);
    await userEvent.click(screen.getByTitle('Settings'));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument());
  });
});
