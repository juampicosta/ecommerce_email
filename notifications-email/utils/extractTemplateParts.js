export const extractTemplateParts = html => {
  if (typeof html !== 'string') {
    throw new Error('HTML must be a string')
  }

  // Regex para capturar components con children: {{>ComponentName}}...{{>/ComponentName}}
  const componentWithChildrenRegex =
    /\{\{\s*>\s*([\w-]+)\s*\}\}.*?\{\{\s*\/\s*\1\s*\}\}/gs

  // Regex para capturar components simples ({{> nombre}})
  const componentRegex = /\{\{\s*>\s*([\w-]+)\s*\}\}/g

  // Regex para capturar variables normales ({{variable}}) excluyendo children y components
  const variableRegex = /\{\{\s*(?!>|\/|children)([\w-]+)\s*\}\}/g

  const components = []
  const variables = []

  let match

  // Buscar componentes con children primero
  while ((match = componentWithChildrenRegex.exec(html)) !== null) {
    components.push(match[1])
  }

  // Crear una copia del HTML sin los componentes con children para buscar componentes simples
  const htmlWithoutChildrenComponents = html.replace(
    componentWithChildrenRegex,
    ''
  )

  // Buscar componentes simples en el HTML sin componentes con children
  while (
    (match = componentRegex.exec(htmlWithoutChildrenComponents)) !== null
  ) {
    components.push(match[1])
  }

  // Buscar variables (excluyendo 'children' que es una palabra reservada)
  while ((match = variableRegex.exec(html)) !== null) {
    if (match[1] !== 'children') {
      variables.push(match[1])
    }
  }

  // Eliminar duplicados
  const uniqueComponents = [...new Set(components)]
  const uniqueVariables = [...new Set(variables)]

  return {
    components: uniqueComponents,
    variables: uniqueVariables,
  }
}
