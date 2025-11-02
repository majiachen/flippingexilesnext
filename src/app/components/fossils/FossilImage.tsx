import Image from 'next/image';
import {FALLBACK_FOSSIL_IMAGE, fossilImages} from './fossilImages';

interface FossilImageProps {
    fossilName: string;
    size?: number;
}

export const FossilImage = ({
                                fossilName,
                                size = 24
                            }: FossilImageProps) => {
    // Normalize the fossil name to match your mapping
    const normalizedFossilName = fossilName
        .split(' ')
        .map(word => {
            // Capitalize first letter of each word
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');

    const imageSrc = fossilImages[normalizedFossilName] || FALLBACK_FOSSIL_IMAGE;

    return (
        <Image
            src={imageSrc}
            alt={fossilName}
            width={size}
            height={size}
            className="mr-2"
            onError={(e) => {
                console.error(`Image failed to load for: ${fossilName}`, imageSrc);
                (e.target as HTMLImageElement).src = FALLBACK_FOSSIL_IMAGE;
            }}
        />
    );
};