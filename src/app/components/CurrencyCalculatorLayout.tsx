"use client";
import {useState} from 'react';
import EssenceCalculator from './essence/essencesheet.tsx';
import FossilCalculator from './fossils/FossilSheet.tsx';

export default function CurrencyCalculator() {
    const [currentPage, setCurrentPage] = useState<'essences' | 'fossils'>('essences');

    return (
        <>
            {currentPage === 'essences' && (
                <EssenceCalculator onNavigate={(page) => setCurrentPage(page as 'essences' | 'fossils')}/>
            )}
            {currentPage === 'fossils' && (
                <FossilCalculator onNavigate={(page) => setCurrentPage(page as 'essences' | 'fossils')}/>
            )}
        </>
    );
}