export function t(string: string, params?: object) {
  if (params) {
    return Object.entries(params).reduce((str, [key, value]) => {
      return str.replaceAll(`{{${key}}}`, value);
    }, string);
  }
  return string;
}
