import React from 'react';
import CoverDemo from '@/components/cover-demo';

interface CoverDemoBlockProps {
    titleOne?: string;
    titleTwo?: string;
    coverText?: string;
    fontSize?: string;
    fontWeight?: string;
}

const CoverDemoBlock: React.FC<CoverDemoBlockProps> = (props) => {
    const titleClassName = `${props.fontSize || 'text-4xl md:text-4xl lg:text-6xl'} ${props.fontWeight || 'font-semibold'}`;
    
    return (
        <section className="bg-background py-16 overflow-hidden">
            <CoverDemo 
                titleOne={props.titleOne}
                titleTwo={props.titleTwo}
                coverText={props.coverText}
                titleClassName={titleClassName}
            />
        </section>
    );
};

export default CoverDemoBlock;
