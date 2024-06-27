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
        return 'MN-wiki';
    }
    if (url.includes('micronations.wiki')) {
        return 'MicroWiki';
    }
    if (url.includes('wiki.micronaciones.com')) {
        return 'Wiki Micronaciones';
    }
    if (url.includes('enciclopedia-de-las-micronaciones.fandom') || url.includes('enciclopedia-de-las-micronaciones.wikia')) {
        return 'Enciclopedia Micronaciones';
    }
    if (url.includes('micronaciones.fandom') || url.includes('micronaciones.wikia')) {
        return 'Wiki Micronacional';
    }
    if (url.includes('omu.fandom') || url.includes('omu.wikia')) {
        return 'Wiki OMU';
    }
    if (url.includes('micropedia.com.br')) {
        return 'Micropedia';
    }
    if (url.includes('wiki.mikronacje.info')) {
        return 'Micropedia POL';
    }
    if (url.includes('dovearchives.wiki')) {
        return 'DoveArchives';
    }
    if (url.includes('wikipedia.org')) {
        return 'Wikipedia';
    }
    if (url.includes('web.archive.org') || url.includes('archive.is')) {
        return 'Archive';
    }
    if (url.includes('shireroth.org/shirewiki')) {
        return 'Shireroth Wiki';
    }
    if (url.includes('scanthel.net/wiki')) {
        return 'Scanthel Wiki';
    }
    if (url.includes('westarctica.wiki')) {
        return 'Encyclopedia Westarctica';
    }
    if (url.includes('liberistant.fandom')) {
        return 'Liberistant Wiki';
    }
    if (url.includes('micras.org')) {
        return 'Micras Wiki';
    }
    if (url.includes('micro-flag-archive')) {
        return 'Micro Flag Archive';
    }
    if (url.includes('mstdn.social') || url.includes('mastodon.social')) {
        return 'Mastodon';
    }
    if (url.includes('reddit.com')) {
        return 'Reddit';
    }
    if (url.includes('twitter.com') || url.includes('//x.com')) {
        return 'Twitter';
    }
    if (url.includes('facebook.com')) {
        return 'Facebook';
    }
    if (url.includes('instagram.com')) {
        return 'Instagram';
    }
    if (url.includes('whatsapp.com') || (!url.includes('@') && !url.includes('http'))) {
        return 'WhatsApp';
    }
    if (url.includes('telegram.me') || url.includes('telegram.com') || url.includes('t.me/')) {
        return 'Telegram';
    }
    if (url.includes('youtube.com')) {
        return 'YouTube';
    }
    if (url.includes('discord.com') || url.includes('discord.gg')) {
        return 'Discord';
    }
    if (url.includes('maps.google.com')) {
        return 'Google Maps';
    }
    if (url.includes('themicronationaldirectory')) {
        return 'TMD';
    }
    if (url.includes('@') && !url.includes('http')) {
        return 'Email';
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