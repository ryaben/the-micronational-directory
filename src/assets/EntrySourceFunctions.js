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
    if (url.includes('mn-wiki.de')) {
        return 'mn-wiki';
    }
    if (url.includes('micronations.wiki')) {
        return 'microwiki';
    }
    if (url.includes('wiki.micronaciones.com')) {
        return 'wiki-micronaciones';
    }
    if (url.includes('enciclopedia-de-las-micronaciones.fandom') || url.includes('enciclopedia-de-las-micronaciones.wikia')) {
        return 'enciclopediamicronaciones';
    }
    if (url.includes('micronaciones.fandom') || url.includes('micronaciones.wikia')) {
        return 'wikimicronacional';
    }
    if (url.includes('omu.fandom') || url.includes('omu.wikia')) {
        return 'wikiomu';
    }
    if (url.includes('micropedia.com.br')) {
        return 'micropedia';
    }
    if (url.includes('wiki.mikronacje.info')) {
        return 'micropedia-pol';
    }
    if (url.includes('dovearchives.wiki')) {
        return 'dovearchives';
    }
    if (url.includes('wikipedia.org')) {
        return 'wikipedia';
    }
    if (url.includes('web.archive.org') || url.includes('archive.is')) {
        return 'archive';
    }
    if (url.includes('shireroth.org/shirewiki')) {
        return 'shireroth';
    }
    if (url.includes('scanthel.net/wiki')) {
        return 'scanthel';
    }
    if (url.includes('westarctica.wiki')) {
        return 'encyclopedia-westarctica';
    }
    if (url.includes('liberistant.fandom')) {
        return 'liberistant';
    }
    if (url.includes('micras.org')) {
        return 'micras';
    }
    if (url.includes('micro-flag-archive')) {
        return 'mfa';
    }
    if (url.includes('mstdn.social') || url.includes('mastodon.social')) {
        return 'mastodon';
    }
    if (url.includes('reddit.com')) {
        return 'reddit';
    }
    if (url.includes('twitter.com') || url.includes('//x.com')) {
        return 'twitter';
    }
    if (url.includes('facebook.com')) {
        return 'facebook';
    }
    if (url.includes('instagram.com')) {
        return 'instagram';
    }
    if (url.includes('whatsapp.com') || (!url.includes('@') && !url.includes('http'))) {
        return 'whatsapp';
    }
    if (url.includes('telegram.me') || url.includes('telegram.com') || url.includes('t.me/')) {
        return 'telegram';
    }
    if (url.includes('youtube.com')) {
        return 'youtube';
    }
    if (url.includes('discord.com') || url.includes('discord.gg')) {
        return 'discord';
    }
    if (url.includes('maps.google.com')) {
        return 'googlemaps';
    }
    if (url.includes('themicronationaldirectory')) {
        return 'tmd';
    }
    if (url.includes('@') && !url.includes('http')) {
        return 'email';
    }
    // if (url.toLowerCase().includes(cleanString(micronationName).replace(/\s+/g, '-')) || url.toLowerCase().includes(cleanString(micronationName).replace(/\s+/g, ''))) {
    //     return 'flag';
    // } 
    return 'www';
}

export function cleanString(string) {
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default {checkHref, checkIcon, cleanString};