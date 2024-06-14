import { trigger, transition, style, animate } from '@angular/animations';

export const fadeAnimation =
  trigger('routeAnimations', [
    transition('* <=> *', [
      style({ opacity: 0 }),
      animate('900ms ease-in-out', style({ opacity: 1 }))
    ])
  ]);
