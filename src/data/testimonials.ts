export type Testimonial = {
  quote: string;
  name: string;
  location: string;
  rating: 1 | 2 | 3 | 4 | 5;
};

// Publish only reviews supplied by real customers with permission.
export const testimonials: Testimonial[] = [];
