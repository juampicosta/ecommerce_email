/**
 * Reemplaza las variables en el HTML por sus valores.
 * @param {string} html - El HTML donde se buscarán las variables.
 * @param {Array<{name: string, value: string}>} variables - Array de variables a reemplazar.
 * @returns {string} - El HTML con las variables reemplazadas.
 */
export function replaceVariablesInHtml(html, variables) {
  let replacedHtml = html
  for (const { name, value } of variables) {
    // Reemplaza todas las ocurrencias de {{variable}} con espacios opcionales
    const varRegex = new RegExp(`{{\\s*${name}\\s*}}`, 'g')
    replacedHtml = replacedHtml.replace(varRegex, value)
  }
  return replacedHtml
}
