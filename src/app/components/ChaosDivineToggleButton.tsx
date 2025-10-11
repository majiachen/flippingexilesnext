import Image from 'next/image';
import chaosIcon from '../../assets/CurrencyRerollRare.webp';
import divineIcon from '../../assets/CurrencyModValues.webp';

interface ChaosDivineToggleButtonProps {
    currency: 'Divine' | 'Chaos';
    onToggle: (currency: 'Divine' | 'Chaos') => void;
}

export default function ChaosDivineToggleButtonWithImage({currency, onToggle}: ChaosDivineToggleButtonProps) {
    const handleClick = () => {
        const newCurrency = currency === 'Divine' ? 'Chaos' : 'Divine';
        onToggle(newCurrency);
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded"
        >
            {currency === 'Divine' ? (
                <>
                    <Image
                        src={divineIcon}
                        alt="Divine Icon"
                        width={20}
                        height={20}
                        className="w-5 h-5 mr-2"
                    />
                    <span className="font-mono min-w-[60px]">Divine</span>
                </>
            ) : (
                <>
                    <Image
                        src={chaosIcon}
                        alt="Chaos Icon"
                        width={20}
                        height={20}
                        className="w-5 h-5 mr-2"
                    />
                    <span className="font-mono min-w-[60px]">Chaos</span>
                </>
            )}
        </button>
    );
}