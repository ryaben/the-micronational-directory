const ACCOUNT = 'the_micro_direc';
const POST_IDS = [
  '1829912548499734802', '1806869757930430633', '1810669133278978511',
  '1798143137354842583', '1763676546244423681', '1759267756489199847',
  '1758515270337908963', '1724417215812792675', '1710813001916264776',
  '1709033903229460701', '1702059403506004428', '1699201531675840814',
  '1692292135146394097'
];

function getMedia(post) {
  const photos = post.media?.photos || [];
  const videos = post.media?.videos || [];

  return [
    ...photos.map(media => ({ type: media.type, url: media.url, alt: media.altText || '' })),
    ...videos.filter(media => media.thumbnail_url).map(media => ({
      type: media.type,
      url: media.thumbnail_url,
      alt: 'Video preview'
    }))
  ].filter(media => media.url);
}

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  response.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  const posts = await Promise.all(POST_IDS.map(async id => {
    try {
      const result = await fetch(`https://api.fxtwitter.com/${ACCOUNT}/status/${id}`, {
        headers: { Accept: 'application/json' }
      });
      if (!result.ok) return null;

      const payload = await result.json();
      const post = payload.tweet;
      if (!post || post.author?.screen_name?.toLowerCase() !== ACCOUNT) return null;

      return {
        id: post.id || id,
        text: post.text || '',
        createdAt: post.created_at || (post.created_timestamp ? new Date(post.created_timestamp * 1000).toISOString() : null),
        media: getMedia(post),
        url: `https://x.com/${ACCOUNT}/status/${id}`
      };
    } catch {
      return null;
    }
  }));

  return response.status(200).json(posts.filter(Boolean));
};
