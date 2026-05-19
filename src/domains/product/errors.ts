export class ProductNotFoundError extends Error {
  readonly code = "PRODUCT_NOT_FOUND";
  constructor(message = "Produto não encontrado.") {
    super(message);
    this.name = "ProductNotFoundError";
  }
}

export class InactiveProductError extends Error {
  readonly code = "PRODUCT_INACTIVE";
  constructor(message = "Este produto não está disponível para compra.") {
    super(message);
    this.name = "InactiveProductError";
  }
}
