export const generateIslandName = (eWord, oWord, nWord, aWord) => {
    // 1. Prefix (from E_word)
    const prefixes = {
        'Introvert': ["Silent", "Hidden", "Whispering"],
        'Ambivert': ["Twilight", "Balanced", "Twin"],
        'Extrovert': ["Radiant", "Festival", "Shining"]
    };

    // 2. Core Noun (from O_word)
    const nouns = {
        'Traditional': ["Harbor", "Village", "Sanctum"],
        'Open-minded': ["Haven", "Bay", "Isle"], 
        'Creative': ["Dreamscape", "Mirage", "Aurora"]
    };

    // 3. Suffix (from N_word or A_word)
    const suffixes = {
        'Calm': ["Still Waters", "Quiet Tides"],
        'Sensitive': ["Gentle Storms", "Shifting Skies"],
        'Balanced': ["Equilibrium", "Harmony"],
        'Compassionate': ["Kindred Hearts", "Shared Light"],
        'Reserved': ["Solitude", "Inner Echoes"],
        'Warm': ["Summer Breeze", "Golden Rays"]
    };

    // Deterministic selection based on input strings
    const seed = (eWord + oWord + nWord + aWord).length;
    
    const prefixList = prefixes[eWord] || prefixes['Ambivert'];
    const prefix = prefixList[seed % prefixList.length];

    const nounList = nouns[oWord] || nouns['Open-minded'];
    const noun = nounList[(seed + 1) % nounList.length];

    // Priority: N_word -> A_word -> Default
    let suffixList = suffixes[nWord] || suffixes[aWord] || suffixes['Balanced'];
    const suffix = suffixList[(seed + 2) % suffixList.length];

    return `${prefix} ${noun} of ${suffix}`;
};

