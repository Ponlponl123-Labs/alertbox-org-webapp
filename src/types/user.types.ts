export interface User {
  id: string;
  name: string;
  displayname: string;
  email: string;
  avatar: string | null;
  banner: string | null;
  disabled: Date | null;
  deleted: Date | null;
}
