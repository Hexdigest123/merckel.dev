import nodemailer from 'nodemailer';
import type { Cookies } from '@sveltejs/kit';
import { VITE_SECRET_MAIL_EMAIL, VITE_SECRET_MAIL_PW } from '$env/static/private';

export async function POST({ request, cookies }: { request: Request; cookies: Cookies }) {
	const data = await request.json();
	const name = data.name;
	const email = data.email;
	const message = data.message;

	const cookie_verification = cookies.get('email');
	if (cookie_verification && cookie_verification !== 'verified') {
		return new Response(
			JSON.stringify({
				status: 'You are not authorized to send an email!'
			}),
			{ status: 403 }
		);
	}
	let transporter = nodemailer.createTransport({
		host: 'smtp.mail.me.com',
		port: 587,
		secure: false,
		auth: {
			user: VITE_SECRET_MAIL_EMAIL,
			pass: VITE_SECRET_MAIL_PW
		}
	});
	transporter.verify((error, success) => {
		if (error) {
			return error;
		} else {
			return success;
		}
	});

	const info = await transporter.sendMail({
		from: `Frontend Form <contact@merckel.dev>`,
		to: 'contact@merckel.dev',
		subject: 'Kontaktanfrage von merckel.dev',
		text: `Name: ${name}\nEmail: ${email}\nNachricht: ${message}`
	});
	if (!info.messageId) {
		return new Response(
			JSON.stringify({
				status: 'Something went wrong, please try again!'
			}),
			{ status: 500 }
		);
	}
	cookies.set('email', 'received', { maxAge: 60 * 60 * 24 * 7, path: '/' });
	return new Response(
		JSON.stringify({
			status: info.messageId
		}),
		{ status: 200 }
	);
}
