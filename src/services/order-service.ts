/**
 * Contrato de serviço de vendas.
 */
export interface OrderService {
	/**
	 * Cadastra uma venda.
	 *
	 * @param seller - dados do vendedor
	 * @param date - data da venda
	 * @param items - itens vendidos
	 */
	create({ seller, items, date }: CreationOrderData): Promise<Order>;

	/**
	 * Atualiza o status de uma venda.
	 *
	 * Mudanças de status perimitidas:
	 * `WAITING_PAYMENT` -> `PAYMENT_APPROVED`
	 * `WAITING_PAYMENT` -> `CANCELED`
	 * `PAYMENT_APPROVED` -> `SENT`
	 * `PAYMENT_APPROVED` -> `CANCELED`
	 * `SENT` -> `DELIVERED`
	 *
	 * @param order - dados atuais da venda
	 * @param updatedStatus - novo status
	 */
	updateStatus(order: Order, updatedStatus: UpdatedOrderStatus): Promise<Order>;

	/**
	 * Obtém uma venda pelo seu identificador.
	 *
	 * @param orderId - identificador da venda
	 */
	getById(orderId: number): Promise<Order | undefined>;
}

/** Representa uma venda */
export type Order = {
	/** Identificador da venda */
	id: number;
	/** Dados do vendedor */
	seller: {
		/** Identificador do vendedor */
		id: number;
		/** CPF do vendedor */
		cpf: string;
		/** Nome do vendedor */
		name: string;
	};
	/** Data da venda */
	date: Date;
	/** Itens da venda */
	items: OrderItem[];
	/** Status da venda */
	status: OrderStatus;
};

/** Item da venda */
type OrderItem = {
	/** Descrição do item */
	description: string;
	/** Quantidade do item */
	ammount: number;
};

/** Status de uma venda. */
export enum OrderStatus {
	/** Aguardando pagamento */
	WAITING_PAYMENT = 'WAITING_PAYMENT',
	/** Pagamento aprovado */
	PAYMENT_APPROVED = 'PAYMENT_APPROVED',
	/** Enviado */
	SENT = 'SENT',
	/** Entregue */
	DELIVERED = 'DELIVERED',
	/** Cancelado */
	CANCELED = 'CANCELED',
}

/** Dados para criação de uma venda */
export type CreationOrderData = Omit<Order, 'id' | 'status'>;

/** Status atualizado de uma venda */
export type UpdatedOrderStatus = Omit<OrderStatus, 'WAITING_PAYMENT'>;
