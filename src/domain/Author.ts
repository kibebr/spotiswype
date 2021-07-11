import * as t from 'io-ts'

export const AuthorV = t.type({
  id: t.string,
  name: t.string
})

export type Author = t.TypeOf<typeof AuthorV>
