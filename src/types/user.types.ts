export interface User {
  id: string;
  create_with: string;
  time: Date;
  name: string;
  displayname: string;
  uri: string;
  email: string;
  avatar: string | null;
  banner: string | null;
  disabled: Date | null;
  deleted: Date | null;
}

export interface Connections {
  stripe: string | null;
  bmac: string | null;
  kofi: string | null;
  ffp: string | null;
}

export interface Device {
  id: string;
  time: Date;
  disabled: Date | null;
  expire: Date;
  ip_addr: string;
  user_agent: string;
  platform: string | null;
  platform_major: string | null;
  platform_ver: string | null;
  platform_type: string | null;
  cpu_architecture: string | null;
  device_model: string | null;
  device_type: string | null;
  device_vendor: string | null;
  ip_addr_asn: string | null;
  ip_addr_city: string | null;
  ip_addr_continent_code: string | null;
  ip_addr_country: string | null;
  ip_addr_country_code: string | null;
  ip_addr_country_code_iso3: string | null;
  ip_addr_isp: string | null;
  ip_addr_lat: number | null;
  ip_addr_long: number | null;
  ip_addr_postal: string | null;
  ip_addr_region: string | null;
  ip_addr_region_code: string | null;
  os: string | null;
  os_ver: string | null;
  last_used: Date;
  isThisDevice: boolean;
  isRevoked?: boolean;
}
