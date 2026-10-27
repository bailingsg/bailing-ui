/**
 * 员工联系方式数据层出口
 *
 * 页面统一从 `@/lib/contacts` 引入，不直接引用 repository 内部实现。
 */
export type { PublicContact } from './types';
export type { GetPublicContactsOptions } from './repository';
export { getPublicContacts, getPublicTeam } from './repository';
