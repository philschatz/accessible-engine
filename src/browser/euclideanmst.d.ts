// TypeScript definition for the package
declare module 'euclideanmst' {
  type DistFn<T> = (a: T, b: T) => number
  type Vertex = number[] // because of the delaunay package

  interface E {
    euclideanMST(verts: Vertex[], distance: DistFn<Vertex>): Vertex[]
  }
  var v: E
  export = v

}
