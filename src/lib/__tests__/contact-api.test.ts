import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetContactRateLimit, POST } from '../../routes/api/contact/+server';

type PostEvent = Parameters<typeof POST>[0];

function createEvent(body: string | Record<string, unknown>, clientIp = '127.0.0.1'): PostEvent {
	const requestBody = typeof body === 'string' ? body : JSON.stringify(body);

	return {
		request: new Request('http://localhost/api/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: requestBody
		}),
		getClientAddress: () => clientIp
	} as PostEvent;
}

async function getJson(response: Response) {
	return (await response.json()) as {
		success: boolean;
		message: string;
		errors?: Record<string, string>;
	};
}

describe('POST /api/contact', () => {
	beforeEach(() => {
		__resetContactRateLimit();
		delete process.env.RESEND_API_KEY;
		delete process.env.CONTACT_TO_EMAIL;
		delete process.env.RESEND_TO_EMAIL;
		delete process.env.CONTACT_FROM_EMAIL;
		vi.unstubAllGlobals();
	});

	it('returns 400 for invalid JSON body', async () => {
		const response = await POST(createEvent('{"name":'));
		const body = await getJson(response);

		expect(response.status).toBe(400);
		expect(body.success).toBe(false);
		expect(body.message).toContain('valid JSON');
	});

	it('returns 400 and field errors for invalid payload', async () => {
		const response = await POST(createEvent({ name: '', email: 'bad-email', message: '' }));
		const body = await getJson(response);

		expect(response.status).toBe(400);
		expect(body.success).toBe(false);
		expect(body.errors).toEqual({
			name: 'Name is required.',
			email: 'Email must be valid.',
			message: 'Message is required.'
		});
	});

	it('accepts submission without Resend key in local mode', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const response = await POST(
			createEvent({ name: 'Alex', email: 'alex@example.com', message: 'Need a landing page.' })
		);
		const body = await getJson(response);

		expect(response.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.message).toContain('accepted');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('enforces one request per minute per client IP', async () => {
		const firstResponse = await POST(
			createEvent(
				{ name: 'Alex', email: 'alex@example.com', message: 'Need a landing page.' },
				'10.0.0.1'
			)
		);
		const secondResponse = await POST(
			createEvent(
				{ name: 'Alex', email: 'alex@example.com', message: 'Second message.' },
				'10.0.0.1'
			)
		);
		const secondBody = await getJson(secondResponse);

		expect(firstResponse.status).toBe(200);
		expect(secondResponse.status).toBe(429);
		expect(secondBody.success).toBe(false);
		expect(secondBody.message).toContain('wait a minute');
	});

	it('sends with Resend when configured', async () => {
		process.env.RESEND_API_KEY = 're_test_key';
		process.env.CONTACT_TO_EMAIL = 'owner@example.com';
		const fetchMock = vi.fn().mockResolvedValue({ ok: true });
		vi.stubGlobal('fetch', fetchMock);

		const response = await POST(
			createEvent(
				{ name: 'Alex', email: 'alex@example.com', message: 'Can we work together?' },
				'10.0.0.2'
			)
		);
		const body = await getJson(response);

		expect(response.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.message).toContain('sent successfully');
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('returns 502 when Resend request fails', async () => {
		process.env.RESEND_API_KEY = 're_test_key';
		const fetchMock = vi.fn().mockResolvedValue({ ok: false });
		vi.stubGlobal('fetch', fetchMock);

		const response = await POST(
			createEvent(
				{ name: 'Alex', email: 'alex@example.com', message: 'Can we work together?' },
				'10.0.0.3'
			)
		);
		const body = await getJson(response);

		expect(response.status).toBe(502);
		expect(body.success).toBe(false);
		expect(body.message).toContain('Unable to send');
	});
});
