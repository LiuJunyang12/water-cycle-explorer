/**
 * Entries of the floating slide-out menu on the home page.
 * Labels are shown to pupils exactly as requested by the project owner.
 */

export type MenuSectionId = 'student' | 'ebook' | 'objectives';

export interface MenuItem {
  id: MenuSectionId;
  label: string;
  description: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'student',
    label: 'MAKLUMAT PELAJAR',
    description: 'Maklumat pembina laman',
  },
  {
    id: 'ebook',
    label: 'OFFLINE E-BOOK',
    description: 'Muat turun bahan bacaan',
  },
  {
    id: 'objectives',
    label: 'OBJEKTIF',
    description: 'Objektif pembelajaran RPH',
  },
];
