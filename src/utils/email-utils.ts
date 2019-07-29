export function pragmaEmailToUsername(email: string): string {
  return email.replace(/(@pragmatists\.(pl|com))|@talkie\.ai$/g, '');
}
