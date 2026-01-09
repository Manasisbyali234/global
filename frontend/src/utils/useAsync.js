import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing async operations with loading, error, and data states
 * Provides better control over async workflows
 */
const useAsync = (asyncFunction, immediate = true, onSuccess = null, onError = null) => {
    const [status, setStatus] = useState('idle');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    // Use ref to track mounted component to prevent memory leaks
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const execute = useCallback(async (...args) => {
        if (!isMounted.current) return;

        setStatus('pending');
        setData(null);
        setError(null);

        try {
            const result = await asyncFunction(...args);
            if (isMounted.current) {
                setData(result);
                setStatus('success');
                onSuccess?.(result);
                return result;
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err);
                setStatus('error');
                onError?.(err);
            }
        }
    }, [asyncFunction, onSuccess, onError]);

    // Automatically execute on mount if immediate is true
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    const retry = useCallback(() => {
        execute();
    }, [execute]);

    return {
        execute,
        retry,
        status,
        data,
        error,
        isLoading: status === 'pending',
        isSuccess: status === 'success',
        isError: status === 'error',
        isIdle: status === 'idle'
    };
};

export default useAsync;