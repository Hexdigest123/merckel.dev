import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const commandWhitelist = ['-sV', '-sP', '-sT', '', '-p-', '-v'];
const urlBlackList = ['.gov', '.mil'];

export async function POST({ request }: { request: Request }) {
	const { host, command } = await request.json();
	if (host === undefined || command === undefined) {
		return new Response('Invalid request', { status: 500 });
	}
	if (host.includes('merckel.dev')) {
		return new Response('Illegal content', { status: 500 });
	}
	if (urlBlackList.some((url) => host.includes(url))) {
		return new Response('Illegal remote host', { status: 500 });
	}
	for (const cmd of command.split(' ')) {
		if (!commandWhitelist.includes(cmd)) {
			return new Response('Illegal content', { status: 500 });
		}
	}

	try {
		const { stdout, stderr } = await execPromise(`nmap -T4 ${host} ${command} -oN -`);
		if (stderr) {
			console.log('stderr:', stderr);
			return new Response(stderr.replace(/(\n|\r\n)/g, '<br>'), { status: 500 });
		}
		return new Response(stdout.replace(/(\n|\r\n)/g, '<br>'), { status: 200 });
	} catch (err) {
		console.error(err);
	}
}
