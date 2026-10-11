import { getPublicProjectImage } from '@/lib/public-data';

const IMMUTABLE = 'public, max-age=31536000, immutable';

// Serves a public project's image. The version segment changes with every new
// upload, so responses can be cached forever by browsers and the CDN.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; version: string }> }) {
  const { id } = await params;
  const dataUrl = await getPublicProjectImage(id);

  const match = dataUrl && /^data:(image\/[\w.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(Buffer.from(match[2], 'base64'), {
    headers: {
      'Content-Type': match[1],
      'Cache-Control': IMMUTABLE,
      'CDN-Cache-Control': IMMUTABLE,
    },
  });
}
