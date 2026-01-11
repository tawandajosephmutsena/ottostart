import React from 'react';
import TestimonialsSection from '@/components/ui/testimonial-v2';

import { TestimonialBlock as TestimonialBlockType } from '@/types/page-blocks';

const TestimonialBlock = ({ title, subtitle, description, items }: TestimonialBlockType['content']) => {
    return (
        <TestimonialsSection 
            title={title}
            label={subtitle}
            description={description}
            testimonials={items}
        />
    );
};

export default TestimonialBlock;
