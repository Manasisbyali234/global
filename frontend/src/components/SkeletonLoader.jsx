import React from 'react';

/**
 * Skeleton Loader Components for better loading states
 */

// Skeleton card for job cards
export const JobCardSkeleton = () => (
    <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}>
        <div style={{
            height: '20px',
            background: '#e5e7eb',
            borderRadius: '4px',
            marginBottom: '12px',
            width: '80%'
        }} />
        <div style={{
            height: '16px',
            background: '#e5e7eb',
            borderRadius: '4px',
            marginBottom: '8px',
            width: '100%'
        }} />
        <div style={{
            height: '16px',
            background: '#e5e7eb',
            borderRadius: '4px',
            width: '60%'
        }} />
    </div>
);

// Skeleton for stats counter
export const StatsSkeleton = () => (
    <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}>
        <div style={{
            height: '32px',
            background: '#e5e7eb',
            borderRadius: '4px',
            marginBottom: '12px'
        }} />
        <div style={{
            height: '16px',
            background: '#e5e7eb',
            borderRadius: '4px'
        }} />
    </div>
);

// Skeleton for recruiter cards
export const RecruiterSkeleton = () => (
    <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}>
        <div style={{
            width: '60px',
            height: '60px',
            background: '#e5e7eb',
            borderRadius: '50%',
            margin: '0 auto 12px'
        }} />
        <div style={{
            height: '16px',
            background: '#e5e7eb',
            borderRadius: '4px'
        }} />
    </div>
);

// Skeleton container with animation styles
export const SkeletonContainer = ({ children, count = 1 }) => {
    return (
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
            {[...Array(count)].map((_, i) => (
                <div key={i}>
                    {children}
                </div>
            ))}
        </>
    );
};

export default {
    JobCardSkeleton,
    StatsSkeleton,
    RecruiterSkeleton,
    SkeletonContainer
};