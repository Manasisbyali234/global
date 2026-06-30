import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AssessmentDashboard from './AssessmentDashboard';
import { api } from '../../../../../utils/api';

jest.mock('../../../../../utils/api', () => ({
	api: {
		getEmployerAssessments: jest.fn(),
		getEmployerProfile: jest.fn()
	}
}));

jest.mock('../../../../../utils/popupNotification', () => ({
	showSuccess: jest.fn(),
	showError: jest.fn(),
	showWarning: jest.fn(),
	showConfirmation: jest.fn()
}));

const buildAssessment = (overrides) => ({
	_id: overrides._id,
	serialNumber: overrides.serialNumber,
	title: overrides.title,
	designation: 'software-engineer',
	createdAt: overrides.createdAt || '2026-01-01T00:00:00.000Z',
	timer: 30,
	totalQuestions: 3,
	status: overrides.status,
	isAssigned: overrides.isAssigned,
	assignedJobsCount: overrides.isAssigned ? 1 : 0,
	questions: [],
	...overrides
});

const renderDashboard = () =>
	render(
		<MemoryRouter>
			<AssessmentDashboard />
		</MemoryRouter>
	);

beforeEach(() => {
	api.getEmployerProfile.mockResolvedValue({
		success: true,
		profile: {
			employerId: { employerType: 'company' },
			employerCategory: 'company'
		}
	});
});

afterEach(() => {
	jest.clearAllMocks();
});

test('draft status filter only shows assessments with draft status', async () => {
	api.getEmployerAssessments.mockResolvedValue({
		success: true,
		assessments: [
			buildAssessment({
				_id: 'published-unassigned',
				serialNumber: 1,
				title: 'Published Unassigned',
				status: 'published',
				isAssigned: false,
				createdAt: '2026-01-03T00:00:00.000Z'
			}),
			buildAssessment({
				_id: 'draft-assessment',
				serialNumber: 2,
				title: 'Draft Assessment',
				status: 'draft',
				isAssigned: false,
				createdAt: '2026-01-02T00:00:00.000Z'
			}),
			buildAssessment({
				_id: 'published-assigned',
				serialNumber: 3,
				title: 'Published Assigned',
				status: 'published',
				isAssigned: true,
				createdAt: '2026-01-01T00:00:00.000Z'
			})
		]
	});

	renderDashboard();

	await screen.findByText('Published Unassigned');
	expect(screen.getByText('Draft Assessment')).toBeTruthy();
	expect(screen.getByText('Published Assigned')).toBeTruthy();

	fireEvent.change(screen.getByRole('combobox'), { target: { value: 'draft' } });

	await waitFor(() => {
		expect(screen.getByText('Draft Assessment')).toBeTruthy();
		expect(screen.queryByText('Published Unassigned')).toBeNull();
		expect(screen.queryByText('Published Assigned')).toBeNull();
	});
});
