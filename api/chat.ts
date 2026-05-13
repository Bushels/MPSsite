/**
 * Vercel Serverless Function: POST /api/chat
 *
 * Disabled until the MPS site guide is rebuilt from the approved public
 * content map. The previous implementation was an automotive assistant and
 * does not match the canonical `mpsgroup.energy` public-site direction.
 */

export async function POST() {
  return new Response(
    JSON.stringify({
      error: 'The MPS site guide is being rebuilt. Please contact info@mpsgroup.ca.',
    }),
    {
      status: 410,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    },
  );
}
