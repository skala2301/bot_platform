export interface NavItem {
  label: string;
  route: string;
  svgPath: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
