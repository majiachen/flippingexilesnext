"use client";
import {useState} from 'react';
import EssenceCalculator from './essence/essencesheet';
import FossilCalculator from './fossils/fossilsheet';

type CalculatorPage = 'essences' | 'fossils' | 'catalysts' | 'oils' | 'deliriumOrbs' | 'breachstones' | 'emblems';

interface PageConfig {
    component: React.ComponentType<{ onNavigate: (page: string) => void }> | null;
    title: string;
    description: string;
}

const pageConfig: Record<CalculatorPage, PageConfig> = {
    essences: {
        component: EssenceCalculator,
        title: 'ESSENCES',
        description: 'Essence calculator'
    },
    fossils: {
        component: FossilCalculator,
        title: 'FOSSILS',
        description: 'Fossil calculator'
    },
    catalysts: {
        component: null,
        title: 'CATALYSTS',
        description: 'Catalysts calculator - Coming Soon'
    },
    oils: {
        component: null,
        title: 'OILS',
        description: 'Oils calculator - Coming Soon'
    },
    deliriumOrbs: {
        component: null,
        title: 'DELIRIUM ORBS',
        description: 'Delirium Orbs calculator - Coming Soon'
    },
    breachstones: {
        component: null,
        title: 'BREACHSTONES',
        description: 'Breachstones calculator - Coming Soon'
    },
    emblems: {
        component: null,
        title: 'EMBLEMS',
        description: 'Emblems calculator - Coming Soon'
    }
};

export default function CurrencyCalculator() {
    const [currentPage, setCurrentPage] = useState<CalculatorPage>('essences');

    const handleNavigation = (page: string) => {
        setCurrentPage(page as CalculatorPage);
    };

    const renderCurrentPage = () => {
        const config = pageConfig[currentPage];

        if (config.component) {
            const Component = config.component;
            return <Component onNavigate={handleNavigation}/>;
        }

        return (
            <div className="bg-gray-900 text-gray-200 min-h-screen p-4 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl text-yellow-500 font-bold mb-4">{config.title}</h2>
                    <p className="text-gray-400">{config.description}</p>
                </div>
            </div>
        );
    };

    return (
        <>
            {renderCurrentPage()}
        </>
    );
}