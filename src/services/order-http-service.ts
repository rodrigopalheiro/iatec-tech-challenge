import { ZodError, z } from 'zod';
import {
	type OrderService,
	type CreationOrderData,
	type Order,
	OrderStatus,
	UpdatedOrderStatus,
} from './order-service';
import { OrderHttpServiceError } from './order-http-service-error';

export const CPF_PATTERN = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/; // 000.000.000-00

const orderSchema = z.object({
	id: z.number(),
	seller: z.object({
		id: z.number(),
		cpf: z.string(),
		name: z.string(),
	}),
	date: z.coerce.date(),
	items: z.array(
		z.object({
			description: z.string(),
			ammount: z.coerce.number(),
		})
	),
	status: z.custom<OrderStatus>((s) =>
		[
			'WAITING_PAYMENT',
			'PAYMENT_APPROVED',
			'SENT',
			'DELIVERED',
			'CANCELED',
		].some((it) => it === s)
	),
});

/**
 * Implementação do serviço de vendas usando protocolo HTTP.
 */
export class OrderHttpService implements OrderService {
	constructor(private _baseUrl: string) {}

	/**
	 * {@inheritDoc OrderService.create}
	 */
	async create(inputData: CreationOrderData): Promise<Order> {
		const validationSchema = z.object({
			seller: z.object({
				id: z
					.number({
						required_error: 'Id é obrigatório',
					})
					.min(1),
				cpf: z
					.string({
						required_error: 'CPF é obrigatório',
					})
					.refine((cpf) => CPF_PATTERN.test(cpf), { message: 'CPF inválido' }),
				name: z
					.string({
						required_error: 'Nome é obrigatório',
					})
					.min(1),
			}),
			date: z.date(),
			items: z
				.array(
					z.object({
						description: z.string(),
						ammount: z.coerce.number(),
					})
				)
				.min(1, { message: 'A venda deve ter pelo menos 1 item.' }),
		});
		try {
			const validatedData = validationSchema.parse(inputData);
			const body = JSON.stringify({
				...validatedData,
				status: OrderStatus.WAITING_PAYMENT,
			});

			const response = await fetch(`${this._baseUrl}/orders`, {
				method: 'post',
				body,
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			return orderSchema.parse(data);
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				throw new OrderHttpServiceError('Dados inválidos.', error);
			}
			throw error;
		}
	}

	/**
	 * {@inheritDoc OrderService.updateStatus}
	 */
	async updateStatus(
		order: Order,
		updatedStatus: UpdatedOrderStatus
	): Promise<Order> {
		try {
			z.number({
				required_error: 'Identificador da venda não encontrado',
			}).parse(order.id);
		} catch (error) {
			if (error instanceof ZodError) {
				throw new OrderHttpServiceError('Dados inválidos.', error);
			}
		}

		if (!this._isUpdatedStatusValid(order.status, updatedStatus)) {
			throw new OrderHttpServiceError(
				`Não é possível atualizar o status de ${order.status} para ${updatedStatus}`
			);
		}

		const response = await fetch(`${this._baseUrl}/orders/${order.id}`, {
			method: 'put',
			body: JSON.stringify({ ...order, status: updatedStatus }),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const data = await response.json();
		return orderSchema.parse(data);
	}

	/**
	 * {@inheritDoc OrderService.getById}
	 */
	async getById(orderId: number): Promise<Order | undefined> {
		try {
			z.number({
				required_error: 'Identificador da venda não encontrado',
			}).parse(orderId);
		} catch (error) {
			if (error instanceof ZodError) {
				throw new OrderHttpServiceError('Dados inválidos.', error);
			}
		}

		const response = await fetch(`${this._baseUrl}/orders/${orderId}`, {
			method: 'get',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const data = await response.json();
		const safeData = orderSchema.optional().safeParse(data);

		if (safeData.success) {
			return safeData.data;
		}
		return undefined;
	}

	private _isUpdatedStatusValid(
		actualStatus: OrderStatus,
		updatedStatus: UpdatedOrderStatus
	) {
		const validationStatus = {
			[OrderStatus.WAITING_PAYMENT]: [
				OrderStatus.PAYMENT_APPROVED,
				OrderStatus.CANCELED,
			],
			[OrderStatus.PAYMENT_APPROVED]: [OrderStatus.SENT, OrderStatus.CANCELED],
			[OrderStatus.SENT]: [OrderStatus.DELIVERED],
			[OrderStatus.CANCELED]: [],
			[OrderStatus.DELIVERED]: [],
		};

		return validationStatus[actualStatus].find((it) => it === updatedStatus);
	}
}
