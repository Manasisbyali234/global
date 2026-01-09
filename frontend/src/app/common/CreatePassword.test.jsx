import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreatePassword from './CreatePassword';

const originalFetch = window.fetch;
const originalAlert = window.alert;
const originalBootstrap = window.bootstrap;

const renderWithRouter = (initialEntry) => {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/create-password" element={<CreatePassword />} />
                <Route path="*" element={<div>Fallback</div>} />
            </Routes>
        </MemoryRouter>
    );
};

beforeEach(() => {
    window.fetch = jest.fn();
    window.alert = jest.fn();
    window.bootstrap = { Modal: jest.fn().mockImplementation(() => ({ show: jest.fn() })) };
});

afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
});

afterAll(() => {
    window.fetch = originalFetch;
    window.alert = originalAlert;
    window.bootstrap = originalBootstrap;
});

test('submits employer password to employer endpoint', async () => {
    jest.useFakeTimers();
    window.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
    });

    renderWithRouter('/create-password?email=employer@example.com&type=employer');

    fireEvent.change(screen.getByPlaceholderText('Password*'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password*'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /create password/i }));

    await waitFor(() => expect(window.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = window.fetch.mock.calls[0];
    expect(url).toBe('http://localhost:5000/api/employer/create-password');
    expect(JSON.parse(options.body)).toEqual({
        email: 'employer@example.com',
        password: 'Password123!'
    });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Password created successfully! Redirecting to login...'));

    await act(async () => {
        jest.runAllTimers();
    });
});

test('submits placement password to placement endpoint', async () => {
    jest.useFakeTimers();
    window.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
    });

    renderWithRouter('/create-password?email=placement@example.com&type=placement');

    fireEvent.change(screen.getByPlaceholderText('Password*'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password*'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /create password/i }));

    await waitFor(() => expect(window.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = window.fetch.mock.calls[0];
    expect(url).toBe('http://localhost:5000/api/placement/create-password');
    expect(JSON.parse(options.body)).toEqual({
        email: 'placement@example.com',
        password: 'Password123!'
    });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Password created successfully! Redirecting to login...'));

    await act(async () => {
        jest.runAllTimers();
    });
});

test('shows error when type is invalid', async () => {
    renderWithRouter('/create-password?email=test@example.com&type=unknown');

    fireEvent.change(screen.getByPlaceholderText('Password*'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password*'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /create password/i }));

    await screen.findByText('Invalid user type. Please use the link provided in your email.');
    expect(window.fetch).not.toHaveBeenCalled();
});
