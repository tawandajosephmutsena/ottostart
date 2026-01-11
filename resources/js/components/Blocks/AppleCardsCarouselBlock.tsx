import React from 'react';
import { Carousel, Card } from '@/components/ui/apple-cards-carousel';

interface AppleCardsCarouselBlockProps {
    title?: string;
    items?: {
        category: string;
        title: string;
        image: string;  // Matches page-blocks.d.ts
        content?: string;
        link?: string;
    }[];
}

const AppleCardsCarouselBlock: React.FC<AppleCardsCarouselBlockProps> = ({
    title,
    items = []
}) => {
    const cards = items.map((card, index) => (
        <Card 
            key={card.image + index} 
            card={{
                src: card.image,  // Map image to src for the Card component
                title: card.title,
                category: card.category,
                link: card.link,
                content: <div dangerouslySetInnerHTML={{ __html: card.content || '' }} className="prose dark:prose-invert max-w-none text-base md:text-xl font-sans" />
            }} 
            index={index} 
            layout={true} 
        />
    ));

    if (items.length === 0) {
        return (
            <div className="w-full py-20 bg-background text-center border-dashed border-2 rounded-xl my-4">
                <p className="text-muted-foreground">Apple Cards Carousel: No cards added. Add cards in the editor.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full py-20 bg-background overflow-hidden">
             {title && (
                 <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans mb-4">
                    {title}
                 </h2>
             )}
             <Carousel items={cards} />
        </div>
    );
};

export default AppleCardsCarouselBlock;
