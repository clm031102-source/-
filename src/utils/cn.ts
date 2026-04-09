export const cn = (...arr: Array<string | false | undefined>) => arr.filter(Boolean).join(' ');
