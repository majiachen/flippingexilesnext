import Image from 'next/image';
import {essenceImages, FALLBACK_ESSENCE_IMAGE} from './essenceImages';

interface EssenceImageProps {
    essenceName: string;
    size?: number;
}

export const EssenceImage = ({
                                 essenceName,
                                 size = 24
                             }: EssenceImageProps) => {
    // Normalize the essence name to match your mapping
    const normalizedEssenceName = essenceName
        .split(' ')
        .map(word => {
            // Capitalize first letter of each word
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');

    const imageSrc = essenceImages[normalizedEssenceName] || FALLBACK_ESSENCE_IMAGE;

    return (
        <Image
            src={imageSrc}
            alt={essenceName}
            width={size}
            height={size}
            className="mr-2"
            onError={(e) => {
                console.error(`Image failed to load for: ${essenceName}`, imageSrc);
                (e.target as HTMLImageElement).src = FALLBACK_ESSENCE_IMAGE;
            }}
        />
    );
};