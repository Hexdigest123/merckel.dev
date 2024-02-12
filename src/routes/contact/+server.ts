export async function POST({ request }: { request: Request }) {
	const data = await request.json();
	console.log(data);
	return new Response('WORKED');
}
