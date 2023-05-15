import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { OrderStatus, type CreationOrderData } from './order-service';
import { OrderHttpService } from './order-http-service';
import { OrderHttpServiceError } from './order-http-service-error';

describe('OrderHttpService', () => {
	let fetchMock: any;
	const baseUrl = 'http://example.com';
	const service = new OrderHttpService(baseUrl);

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('create', () => {
		it('deve cadastrar uma nova venda', async () => {
			const mockDate = new Date();
			const inputData = createOrderMock(mockDate);
			fetchMock.mockResolvedValueOnce(
				createFetchResponse({
					id: 1,
					status: 'WAITING_PAYMENT',
					...inputData,
					date: inputData.date.toISOString(),
				})
			);

			const order = await service.create(inputData);

			expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/orders`, {
				method: 'post',
				body: JSON.stringify({
					...inputData,
					status: 'WAITING_PAYMENT',
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			});
			expect(order).toEqual({
				date: mockDate,
				id: 1,
				items: [
					{
						ammount: 2,
						description: 'Item 1',
					},
				],
				seller: {
					cpf: '123.456.789-01',
					id: 1,
					name: 'John Doe',
				},
				status: 'WAITING_PAYMENT',
			});
		});

		it('lança excessão ao receber `cpf` inválido', async () => {
			const inputData: CreationOrderData = {
				date: new Date(),
				items: [
					{
						description: 'Item 1',
						ammount: 200,
					},
				],
				seller: {
					id: 2,
					name: 'John Apple',
					cpf: 'wrong data',
				},
			};

			await expect(service.create(inputData)).rejects.toThrow(
				OrderHttpServiceError
			);
			await expect(service.create(inputData)).rejects.toHaveProperty('issues', [
				{
					code: 'custom',
					message: 'CPF inválido',
					path: ['seller', 'cpf'],
				},
			]);
			expect(fetchMock).toHaveBeenCalledTimes(0);
		});

		it('lança excessão ao receber `itens` vazio', async () => {
			const inputData = {
				date: new Date(),
				items: [],
				seller: {
					id: 2,
					name: 'John Apple',
					cpf: '555.555.555-55',
				},
			};

			await expect(service.create(inputData)).rejects.toThrow(
				OrderHttpServiceError
			);
			await expect(service.create(inputData)).rejects.toHaveProperty('issues', [
				{
					code: 'too_small',
					minimum: 1,
					type: 'array',
					inclusive: true,
					exact: false,
					message: 'A venda deve ter pelo menos 1 item.',
					path: ['items'],
				},
			]);
			expect(fetchMock).toHaveBeenCalledTimes(0);
		});

		it('lança excessão ao receber `date` vazio', async () => {
			const inputData = JSON.stringify({
				items: [
					{
						description: 'Item 1',
						ammount: 200,
					},
				],
				seller: {
					id: 2,
					name: 'John Apple',
					cpf: '555.555.555-55',
				},
			});

			await expect(service.create(JSON.parse(inputData))).rejects.toThrow(
				OrderHttpServiceError
			);
			await expect(
				service.create(JSON.parse(inputData))
			).rejects.toHaveProperty('issues', [
				{
					code: 'invalid_type',
					expected: 'date',
					message: 'Required',
					path: ['date'],
					received: 'undefined',
				},
			]);
			expect(fetchMock).toHaveBeenCalledTimes(0);
		});

		it('lança excessão ao receber `seller` vazio', async () => {
			const inputData = JSON.stringify({
				items: [
					{
						description: 'Item 1',
						ammount: 200,
					},
				],
			});
			const parsed = { ...JSON.parse(inputData), date: new Date() };

			await expect(service.create(parsed)).rejects.toThrow(
				OrderHttpServiceError
			);
			await expect(service.create(parsed)).rejects.toHaveProperty('issues', [
				{
					code: 'invalid_type',
					expected: 'object',
					message: 'Required',
					path: ['seller'],
					received: 'undefined',
				},
			]);
			expect(fetchMock).toHaveBeenCalledTimes(0);
		});
	});

	describe('updateStatus', () => {
		it('deve atualizar o status de uma venda', async () => {
			const persistedData = createPersistedOrderMock(
				OrderStatus.WAITING_PAYMENT
			);
			const updatedStatus = OrderStatus.PAYMENT_APPROVED;
			fetchMock.mockResolvedValueOnce(
				createFetchResponse({
					...persistedData,
					status: updatedStatus,
					date: persistedData.date.toISOString(),
				})
			);

			const order = await service.updateStatus(persistedData, updatedStatus);

			expect(fetchMock).toHaveBeenCalledWith(
				`${baseUrl}/orders/${persistedData.id}`,
				{
					method: 'put',
					body: JSON.stringify({
						...persistedData,
						status: updatedStatus,
					}),
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			expect(order).toEqual({
				...persistedData,
				status: updatedStatus,
			});
		});

		it('lança exessão ao receber o `id` vazio', async () => {
			const persistedDataWithoutId = JSON.parse(
				JSON.stringify(
					createPersistedOrderWithourIdMock(OrderStatus.WAITING_PAYMENT)
				)
			);
			const updatedStatus = OrderStatus.PAYMENT_APPROVED;

			await expect(
				service.updateStatus(persistedDataWithoutId, updatedStatus)
			).rejects.toThrow(OrderHttpServiceError);
			await expect(
				service.updateStatus(persistedDataWithoutId, updatedStatus)
			).rejects.toHaveProperty('issues', [
				{
					code: 'invalid_type',
					expected: 'number',
					message: 'Identificador da venda não encontrado',
					path: [],
					received: 'undefined',
				},
			]);
			expect(fetchMock).toHaveBeenCalledTimes(0);
		});

		it.each`
			fromStatus                      | toForbiddenStatus
			${OrderStatus.WAITING_PAYMENT}  | ${OrderStatus.SENT}
			${OrderStatus.WAITING_PAYMENT}  | ${OrderStatus.DELIVERED}
			${OrderStatus.WAITING_PAYMENT}  | ${OrderStatus.WAITING_PAYMENT}
			${OrderStatus.PAYMENT_APPROVED} | ${OrderStatus.WAITING_PAYMENT}
			${OrderStatus.PAYMENT_APPROVED} | ${OrderStatus.DELIVERED}
			${OrderStatus.PAYMENT_APPROVED} | ${OrderStatus.PAYMENT_APPROVED}
			${OrderStatus.SENT}             | ${OrderStatus.WAITING_PAYMENT}
			${OrderStatus.SENT}             | ${OrderStatus.PAYMENT_APPROVED}
			${OrderStatus.SENT}             | ${OrderStatus.CANCELED}
			${OrderStatus.SENT}             | ${OrderStatus.SENT}
		`(
			'lança excessão ao tentar atualizar o status de $fromStatus para $toForbiddenStatus',
			async ({ fromStatus, toForbiddenStatus }) => {
				const persistedData = createPersistedOrderMock(fromStatus);

				await expect(
					service.updateStatus(persistedData, toForbiddenStatus)
				).rejects.toThrow(OrderHttpServiceError);
				await expect(
					service.updateStatus(persistedData, toForbiddenStatus)
				).rejects.toThrow(
					`Não é possível atualizar o status de ${fromStatus} para ${toForbiddenStatus}`
				);
				expect(fetchMock).toHaveBeenCalledTimes(0);
			}
		);
	});

	describe('getById', () => {
		it('deve obter uma venda pelo Id', async () => {
			const mockDate = new Date();
			const persistedData = createPersistedOrderMock(
				OrderStatus.SENT,
				mockDate
			);
			fetchMock.mockResolvedValueOnce(
				createFetchResponse({
					...persistedData,
					date: persistedData.date.toISOString(),
				})
			);

			const order = await service.getById(5);

			expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/orders/5`, {
				method: 'get',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			expect(order).toEqual(persistedData);
		});

		it('lança exessão ao receber o `Id` vazio', async () => {
			const ID = JSON.parse(JSON.stringify({}));

			await expect(service.getById(ID)).rejects.toThrow(OrderHttpServiceError);
			await expect(service.getById(ID)).rejects.toHaveProperty('issues', [
				{
					code: 'invalid_type',
					expected: 'number',
					message: 'Expected number, received object',
					path: [],
					received: 'object',
				},
			]);
			expect(fetchMock).toHaveBeenCalledTimes(0);
		});
	});
});

function createOrderMock(date: Date) {
	return {
		seller: {
			id: 1,
			cpf: '123.456.789-01',
			name: 'John Doe',
		},
		date,
		items: [
			{
				description: 'Item 1',
				ammount: 2,
			},
		],
	};
}

function createPersistedOrderMock(orderStatus: OrderStatus, date?: Date) {
	return {
		id: 5,
		seller: {
			id: 1,
			cpf: '123.456.789-01',
			name: 'John Doe',
		},
		date: date || new Date(),
		items: [
			{
				description: 'Item 1',
				ammount: 2,
			},
		],
		status: orderStatus,
	};
}

function createPersistedOrderWithourIdMock(orderStatus: OrderStatus) {
	return {
		seller: {
			id: 1,
			cpf: '123.456.789-01',
			name: 'John Doe',
		},
		date: new Date(),
		items: [
			{
				description: 'Item 1',
				ammount: 2,
			},
		],
		status: orderStatus,
	};
}

function createFetchResponse(data: any) {
	return { json: () => new Promise((resolve) => resolve(data)) };
}
