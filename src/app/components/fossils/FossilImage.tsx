import Image from 'next/image';

interface FossilImageProps {
    fossilName: string;
}

const FossilImage = ({fossilName}: FossilImageProps) => {
    // Map fossil names to their image paths
    const getImagePath = (name: string) => {
        const fossilImages: Record<string, string> = {
            'Primitive Chaotic': '/images/fossils/primitive-chaotic.png',
            'Deft Fossil': '/images/fossils/deft.png',
            // Add all other fossil images here
        };

        return fossilImages[name] || '/images/fossils/default.png';
    };

    return (
        <div className="w-8 h-8 relative">
            <Image
                src={getImagePath(fossilName)}
                alt={fossilName}
                fill
                className="object-contain"
            />
        </div>
    );
};

export default FossilImage;