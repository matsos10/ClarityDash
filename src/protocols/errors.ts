export class NotPairedError extends Error {
  constructor() {
    super('Esta TV ainda não está emparelhada com a app.');
  }
}
