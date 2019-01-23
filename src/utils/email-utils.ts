export function pragmaEmailToUsername(email: string): string {
  return email.replace(/(@pragmatists\.pl|@pragmatists\.com)$/g, '');
}
