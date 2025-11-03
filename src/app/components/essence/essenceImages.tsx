// src/utils/essenceImages.ts
export const essenceImages: Record<string, string> = {
    // Shrieking Essences
    'Shrieking Essence Of Anger': '/essences/Shrieking-Essence-Of-Anger.png',
    'Shrieking Essence Of Anguish': '/essences/Shrieking-Essence-Of-Anguish.png',
    'Shrieking Essence Of Contempt': '/essences/Shrieking-Essence-Of-Contempt.png',
    'Shrieking Essence Of Doubt': '/essences/Shrieking-Essence-Of-Doubt.png',
    'Shrieking Essence Of Dread': '/essences/Shrieking-Essence-Of-Dread.png',
    'Shrieking Essence Of Envy': '/essences/Shrieking-Essence-Of-Envy.png',
    'Shrieking Essence Of Fear': '/essences/Shrieking-Essence-Of-Fear.png',
    'Shrieking Essence Of Greed': '/essences/Shrieking-Essence-Of-Greed.png',
    'Shrieking Essence Of Hatred': '/essences/Shrieking-Essence-Of-Hatred.png',
    'Shrieking Essence Of Loathing': '/essences/Shrieking-Essence-Of-Loathing.png',
    'Shrieking Essence Of Misery': '/essences/Shrieking-Essence-Of-Misery.png',
    'Shrieking Essence Of Rage': '/essences/Shrieking-Essence-Of-Rage.png',
    'Shrieking Essence Of Scorn': '/essences/Shrieking-Essence-Of-Scorn.png',
    'Shrieking Essence Of Sorrow': '/essences/Shrieking-Essence-Of-Sorrow.png',
    'Shrieking Essence Of Spite': '/essences/Shrieking-Essence-Of-Spite.png',
    'Shrieking Essence Of Suffering': '/essences/Shrieking-Essence-Of-Suffering.png',
    'Shrieking Essence Of Torment': '/essences/Shrieking-Essence-Of-Torment.png',
    'Shrieking Essence Of Woe': '/essences/Shrieking-Essence-Of-Woe.png',
    'Shrieking Essence Of Wrath': '/essences/Shrieking-Essence-Of-Wrath.png',
    'Shrieking Essence Of Zeal': '/essences/Shrieking-Essence-Of-Zeal.png',

    // Deafening Essences
    'Deafening Essence Of Anger': '/essences/Deafening-Essence-Of-Anger.png',
    'Deafening Essence Of Anguish': '/essences/Deafening-Essence-Of-Anguish.png',
    'Deafening Essence Of Contempt': '/essences/Deafening-Essence-Of-Contempt.png',
    'Deafening Essence Of Doubt': '/essences/Deafening-Essence-Of-Doubt.png',
    'Deafening Essence Of Dread': '/essences/Deafening-Essence-Of-Dread.png',
    'Deafening Essence Of Envy': '/essences/Deafening-Essence-Of-Envy.png',
    'Deafening Essence Of Fear': '/essences/Deafening-Essence-Of-Fear.png',
    'Deafening Essence Of Greed': '/essences/Deafening-Essence-Of-Greed.png',
    'Deafening Essence Of Hatred': '/essences/Deafening-Essence-Of-Hatred.png',
    'Deafening Essence Of Loathing': '/essences/Deafening-Essence-Of-Loathing.png',
    'Deafening Essence Of Misery': '/essences/Deafening-Essence-Of-Misery.png',
    'Deafening Essence Of Rage': '/essences/Deafening-Essence-Of-Rage.png',
    'Deafening Essence Of Scorn': '/essences/Deafening-Essence-Of-Scorn.png',
    'Deafening Essence Of Sorrow': '/essences/Deafening-Essence-Of-Sorrow.png',
    'Deafening Essence Of Spite': '/essences/Deafening-Essence-Of-Spite.png',
    'Deafening Essence Of Suffering': '/essences/Deafening-Essence-Of-Suffering.png',
    'Deafening Essence Of Torment': '/essences/Deafening-Essence-Of-Torment.png',
    'Deafening Essence Of Woe': '/essences/Deafening-Essence-Of-Woe.png',
    'Deafening Essence Of Wrath': '/essences/Deafening-Essence-Of-Wrath.png',
    'Deafening Essence Of Zeal': '/essences/Deafening-Essence-Of-Zeal.png',

    // Special Essences
    'Essence Of Hysteria': '/essences/Essence-Of-Hysteria.png',
    'Essence Of Delirium': '/essences/Essence-Of-Delirium.png',
    'Essence Of Horror': '/essences/Essence-Of-Horror.png',
    'Essence Of Insanity': '/essences/Essence-Of-Insanity.png',
    'Remnant Of Corruption': '/essences/Remnant-Of-Corruption.png'
};

const ESSENCE_ORDER: Record<string, number> = {
    // Shrieking Essences
    'Shrieking Essence Of Greed': 1,
    'Shrieking Essence Of Contempt': 2,
    'Shrieking Essence Of Hatred': 3,
    'Shrieking Essence Of Woe': 4,
    'Shrieking Essence Of Fear': 5,
    'Shrieking Essence Of Anger': 6,
    'Shrieking Essence Of Torment': 7,
    'Shrieking Essence Of Sorrow': 8,
    'Shrieking Essence Of Rage': 9,
    'Shrieking Essence Of Suffering': 10,
    'Shrieking Essence Of Wrath': 11,
    'Shrieking Essence Of Doubt': 12,
    'Shrieking Essence Of Loathing': 13,
    'Shrieking Essence Of Zeal': 14,
    'Shrieking Essence Of Anguish': 15,
    'Shrieking Essence Of Spite': 16,
    'Shrieking Essence Of Scorn': 17,
    'Shrieking Essence Of Envy': 18,
    'Shrieking Essence Of Misery': 19,
    'Shrieking Essence Of Dread': 20,

    // Deafening Essences
    'Deafening Essence Of Greed': 21,
    'Deafening Essence Of Contempt': 22,
    'Deafening Essence Of Hatred': 23,
    'Deafening Essence Of Woe': 24,
    'Deafening Essence Of Fear': 25,
    'Deafening Essence Of Anger': 26,
    'Deafening Essence Of Torment': 27,
    'Deafening Essence Of Sorrow': 28,
    'Deafening Essence Of Rage': 29,
    'Deafening Essence Of Suffering': 30,
    'Deafening Essence Of Wrath': 31,
    'Deafening Essence Of Doubt': 32,
    'Deafening Essence Of Loathing': 33,
    'Deafening Essence Of Zeal': 34,
    'Deafening Essence Of Anguish': 35,
    'Deafening Essence Of Spite': 36,
    'Deafening Essence Of Scorn': 37,
    'Deafening Essence Of Envy': 38,
    'Deafening Essence Of Misery': 39,
    'Deafening Essence Of Dread': 40,

    // Special Essences (placed after regular essences)
    'Essence Of Hysteria': 41,
    'Essence Of Delirium': 42,
    'Essence Of Horror': 43,
    'Essence Of Insanity': 44,
    'Remnant Of Corruption': 45
};

// Helper function to get essence order
export const getEssenceOrder = (essenceName: string): number => {
    // Normalize the essence name by making it lowercase for case-insensitive matching
    const normalizedEssenceName = essenceName.toLowerCase();

    // Find the key in ESSENCE_ORDER that matches (case-insensitive)
    const matchingKey = Object.keys(ESSENCE_ORDER).find(key =>
        key.toLowerCase() === normalizedEssenceName
    );

    return matchingKey ? ESSENCE_ORDER[matchingKey] : 999;
};

export const FALLBACK_ESSENCE_IMAGE = '/essences/Default.png';