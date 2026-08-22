import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';
import { siteConfig } from '$lib/data/site-config';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_MAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 4000;

export interface ContactInput {
	name: string;
	mail: string;
	message: string;
}

export type ContactValidationError = {
	field: 'name' | 'mail' | 'message';
	error: string;
};

export function validateContactInput(input: ContactInput): ContactValidationError[] {
	const errors: ContactValidationError[] = [];

	if (!input.name) {
		errors.push({ field: 'name', error: 'name is required' });
	} else if (input.name.length > MAX_NAME_LENGTH) {
		errors.push({ field: 'name', error: 'name is too long' });
	}

	if (!input.mail) {
		errors.push({ field: 'mail', error: 'mail is required' });
	} else if (input.mail.length > MAX_MAIL_LENGTH || !EMAIL_PATTERN.test(input.mail)) {
		errors.push({ field: 'mail', error: 'mail is invalid' });
	}

	if (!input.message) {
		errors.push({ field: 'message', error: 'message is required' });
	} else if (input.message.length > MAX_MESSAGE_LENGTH) {
		errors.push({ field: 'message', error: 'message is too long' });
	}

	return errors;
}

export function isSmtpConfigured(): boolean {
	return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

export async function sendContactMessage(input: ContactInput): Promise<void> {
	if (!isSmtpConfigured()) {
		throw new Error('smtp is not configured');
	}

	const port = Number(env.SMTP_PORT ?? 587);
	const transporter = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port,
		secure: port === 465,
		auth: {
			user: env.SMTP_USER,
			pass: env.SMTP_PASS
		}
	});

	const to = env.CONTACT_TO || siteConfig.email;
	const from = env.SMTP_FROM || env.SMTP_USER;

	await transporter.sendMail({
		from,
		to,
		replyTo: input.mail,
		subject: `Kontaktanfrage von ${input.name}`,
		text: [`Name: ${input.name}`, `E-Mail: ${input.mail}`, '', input.message].join('\n')
	});
}
