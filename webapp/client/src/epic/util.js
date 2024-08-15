export const apis = {
  publicStructures: '/api/public/structures',
  userStructures: '/api/auth-user/structures',
  userStructuresAll: '/api/auth-user/structures/all',
  adminStructures: '/api/admin/structures',
  publicTrame: '/api/public/trame',
  userTrame: '/api/auth-user/trame',
}

export const structureUrl = process.env.REACT_APP_API_URL + '/structures'

// validators
export const isValidChromosome = (name) => {
  const regexp = new RegExp(/^[a-zA-Z0-9\-_.]{3,}$/)
  return regexp.test(name.trim())
}

export const isValidTextInput = (name) => {
  const regexp = new RegExp(/^[a-zA-Z0-9\-_.\s]{1,}$/)
  return regexp.test(name.trim())
}
