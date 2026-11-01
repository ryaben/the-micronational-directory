const socialMediaDomains = [
    [['discord.com', 'discord.gg'], 'Discord'],
    [['facebook.com'], 'Facebook'],
    [['instagram.com'], 'Instagram'],
    [['mastodon.social', 'mstdn.social'], 'Mastodon'],
    [['reddit.com'], 'Reddit'],
    [['telegram.com', 'telegram.me', 't.me'], 'Telegram'],
    [['tumblr.com'], 'Tumblr'],
    [['twitter.com', 'x.com'], 'Twitter'],
    [['vk.com', 'vk.ru'], 'VK'],
    [['whatsapp.com'], 'WhatsApp'],
    [['youtube.com'], 'YouTube'],
];

const socialMediaIcons = new Set([
    ...socialMediaDomains.map(([, icon]) => icon),
    'Email',
]);

const sourcePatterns = [
    [['mn-wiki.de'], 'MN-wiki'],
    [['wiki.namoalliance.org'], 'NAMO Wiki'],
    [['micronations.wiki'], 'MicroWiki'],
    [['wiki.micronaciones.com'], 'Wiki Micronaciones'],
    [['enciclopedia-de-las-micronaciones.fandom', 'enciclopedia-de-las-micronaciones.wikia'], 'Enciclopedia Micronaciones'],
    [['micronaciones.fandom', 'micronaciones.wikia'], 'Wiki Micronacional'],
    [['omu.fandom', 'omu.wikia'], 'Wiki OMU'],
    [['micropedia.com.br'], 'Micropedia'],
    [['wiki.mikronacje.info'], 'Micropedia POL'],
    [['dovearchives.wiki'], 'DoveArchives'],
    [['wikipedia.org'], 'Wikipedia'],
    [['web.archive.org', 'archive.is'], 'Archive'],
    [['shireroth.org/shirewiki'], 'Shireroth Wiki'],
    [['scanthel.net/wiki'], 'Scanthel Wiki'],
    [['westarctica.wiki'], 'Encyclopedia Westarctica'],
    [['liberistant.fandom'], 'Liberistant Wiki'],
    [['micras.org'], 'Micras Wiki'],
    [['micro-flag-archive'], 'Micro Flag Archive'],
    [['maps.google.com'], 'Google Maps'],
    [['forms.gle', 'docs.google.com/forms'], 'Google Forms'],
    [['themicronationaldirectory'], 'TMD'],
];

function getSocialMediaIcon(url) {
    let hostname;

    try {
        hostname = new URL(url.includes('://') ? url : `https://${url}`).hostname.toLowerCase();
    } catch {
        return undefined;
    }

    const match = socialMediaDomains.find(([domains]) => domains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    ));

    return match?.[1];
}

export function checkHref(href) {
    if (href.includes('@') && !href.includes('http')) {
        return 'mailto:' + href;
    } else if (!href.includes('@') && !href.includes('http')) {
        return 'https://api.whatsapp.com/send?phone=' + href;
    } else {
        return href;
    }
}

export function checkIcon(url, micronationName) {
    const normalizedUrl = url.toLowerCase();
    const sourceMatch = sourcePatterns.find(([patterns]) => patterns.some((pattern) => normalizedUrl.includes(pattern)));
    if (sourceMatch) return sourceMatch[1];

    const socialMediaIcon = getSocialMediaIcon(url);
    if (socialMediaIcon) return socialMediaIcon;
    if (url.includes('@') && !url.includes('http')) return 'Email';
    if (!url.includes('@') && !url.includes('http')) return 'WhatsApp';
    // if (url.toLowerCase().includes(cleanString(micronationName).replace(/\s+/g, '-')) || url.toLowerCase().includes(cleanString(micronationName).replace(/\s+/g, ''))) {
    //     return 'flag';
    // } 
    return 'www';
}

export function cleanString(string) {
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function getIconFolder(icon) {
    return socialMediaIcons.has(icon) ? 'social-media' : 'sources';
}

export default {checkHref, checkIcon, cleanString, getIconFolder};
