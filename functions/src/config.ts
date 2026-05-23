export const ADMIN_UIDS = [
  "gYhf2cyummQW10nXo6SV8ails833", // your account
  "cUuSeqAN77VkADtHpjX286J0Xm33", // wife's account
];

export function isAdmin(uid: string | undefined): boolean {
  return !!uid && ADMIN_UIDS.includes(uid);
}
