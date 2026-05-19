import type { OrderStatus } from "./types";

export class OrderNotFoundError extends Error {
  readonly code = "ORDER_NOT_FOUND";
  constructor(message = "Pedido não encontrado.") {
    super(message);
    this.name = "OrderNotFoundError";
  }
}

export class InvalidOrderTransitionError extends Error {
  readonly code = "ORDER_INVALID_TRANSITION";
  readonly from: OrderStatus;
  readonly to: OrderStatus;
  constructor(from: OrderStatus, to: OrderStatus) {
    super(
      `Transição de status inválida: ${from} → ${to}. Permitidas: created → approved → in_production → ready → shipped.`,
    );
    this.name = "InvalidOrderTransitionError";
    this.from = from;
    this.to = to;
  }
}
