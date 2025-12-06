// cookie.ts

/**
 * Cookie 配置选项
 */
export interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: Date | string | number;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * 设置 Cookie
 * @param name Cookie 名称
 * @param value Cookie 值
 * @param options 配置选项
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // 处理选项
  if (options.path) cookieText += `; path=${options.path}`;
  if (options.domain) cookieText += `; domain=${options.domain}`;
  if (options.expires) {
    const expires = options.expires instanceof Date ? options.expires : new Date(options.expires);
    cookieText += `; expires=${expires.toUTCString()}`;
  }
  if (options.maxAge) cookieText += `; max-age=${options.maxAge}`;
  if (options.secure) cookieText += '; secure';
  if (options.sameSite) cookieText += `; samesite=${options.sameSite}`;

  document.cookie = cookieText;
}

/**
 * 获取 Cookie 值
 * @param name Cookie 名称
 * @returns Cookie 值或 null
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  
  if (!cookie) return null;
  
  const value = cookie.split('=').slice(1).join('=');
  return decodeURIComponent(value);
}

/**
 * 删除 Cookie
 * @param name Cookie 名称
 * @param options 配置选项（需与设置时的 path/domain 一致）
 */
export function deleteCookie(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  setCookie(name, '', {
    ...options,
    maxAge: -1, // 设置为过期
    expires: new Date(0) // 设置为过去时间
  });
}

/**
 * 检查 Cookie 是否存在
 * @param name Cookie 名称
 * @returns 是否存在
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * 获取所有 Cookie
 * @returns 所有 Cookie 的键值对
 */
export function getAllCookies(): Record<string, string> {
  return document.cookie.split('; ').reduce((cookies, cookie) => {
    const [name, value] = cookie.split('=').map(c => c.trim());
    cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    return cookies;
  }, {} as Record<string, string>);
}

/**
 * 删除所有 Cookie
 */
export function clearAllCookies(){
  const cookies = getAllCookies() ;
  const cookieKeys = cookies && Object.keys(cookies) || [];
  cookieKeys.forEach((value, key) => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
}