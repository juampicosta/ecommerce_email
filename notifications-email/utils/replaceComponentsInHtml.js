import Component from '../models/component.js'

/**
 * Reemplaza los componentes en el raw_html por su contenido html.
 * Soporta tanto componentes sin children {{>ComponentName}} como con children {{>ComponentName}}...{{>/ComponentName}}
 * @param {string} raw_html - El HTML original con inclusiones de componentes.
 * @returns {Promise<string>} - El HTML con los componentes reemplazados.
 */
export async function replaceComponentsInHtml(raw_html) {
  let htmlReplaced = raw_html
  let hasComponents = true

  // Procesar de forma iterativa hasta que no haya más componentes
  while (hasComponents) {
    hasComponents = false

    // Regex para capturar componentes sin children primero: {{>ComponentName}}
    const regexWithoutChildren = /{{>\s*(\w+)\s*}}/g
    let match

    // Procesar componentes sin children
    const componentsToReplace = []
    while ((match = regexWithoutChildren.exec(htmlReplaced)) !== null) {
      // Verificar que no sea parte de un componente con children
      const afterMatch = htmlReplaced.substring(match.index + match[0].length)

      // Verificar si hay una etiqueta de cierre correspondiente
      const closeTagRegex = new RegExp(`{{/\\s*${match[1]}\\s*}}`)
      if (!closeTagRegex.test(afterMatch)) {
        componentsToReplace.push({
          name: match[1],
          fullMatch: match[0],
          index: match.index,
        })
        hasComponents = true
      }
    }

    // Reemplazar componentes sin children (de atrás hacia adelante para no afectar índices)
    for (let i = componentsToReplace.length - 1; i >= 0; i--) {
      const comp = componentsToReplace[i]
      const component = await Component.findOne({
        name: comp.name,
        deleted_at: null,
      })
      if (!component) {
        throw new Error(`Componente no encontrado: ${comp.name}`)
      }

      let componentHtml = component.html_content
      // Eliminar {{children}} si existe pero no hay contenido
      componentHtml = componentHtml.replace(/{{children}}/g, '')

      htmlReplaced =
        htmlReplaced.substring(0, comp.index) +
        componentHtml +
        htmlReplaced.substring(comp.index + comp.fullMatch.length)
    }

    // Procesar componentes con children (más internos primero)
    const regexWithChildren = /{{>\s*(\w+)\s*}}(.*?){{\/\s*\1\s*}}/gs
    const componentsWithChildren = []

    let childMatch
    while ((childMatch = regexWithChildren.exec(htmlReplaced)) !== null) {
      componentsWithChildren.push({
        name: childMatch[1],
        fullMatch: childMatch[0],
        children: childMatch[2],
        index: childMatch.index,
      })
      hasComponents = true
    }

    // Reemplazar componentes con children (de atrás hacia adelante)
    for (let i = componentsWithChildren.length - 1; i >= 0; i--) {
      const comp = componentsWithChildren[i]
      const component = await Component.findOne({
        name: comp.name,
        deleted_at: null,
      })
      if (!component) {
        throw new Error(`Componente no encontrado: ${comp.name}`)
      }

      let componentHtml = component.html_content
      // Reemplazar {{children}} con el contenido real
      componentHtml = componentHtml.replace(/{{children}}/g, comp.children)

      htmlReplaced =
        htmlReplaced.substring(0, comp.index) +
        componentHtml +
        htmlReplaced.substring(comp.index + comp.fullMatch.length)
    }
  }

  return htmlReplaced
}
