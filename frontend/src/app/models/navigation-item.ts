export interface NavigationItem {
  text: string;
  path: string;
  icon: string;
  items?: NavigationItem[];
}
