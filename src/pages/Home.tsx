import { useCallback, useState } from 'react';
import {
	Box,
	Button,
	Container,
	Divider,
	Flex,
	Modal,
	Space,
	Text,
	Title,
} from '@mantine/core';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { SearchInput, CreateOrderForm, OrderCard } from '../components';
import {
	Order,
	OrderHttpService,
	CreationOrderData,
	OrderStatus,
} from '../services';
import { notifications } from '@mantine/notifications';

const service = new OrderHttpService('http://localhost:3000');

export function HomePage() {
	const [opened, { open, close }] = useDisclosure(false);
	const [searchTerm, setSearchTerm] = useInputState('');
	const [searchedOrder, setSearchedOrder] = useState<Order>();

	const handleCreate = useCallback(
		async (data: CreationOrderData) => {
			try {
				notifications.show({
					id: 'creating-order',
					title: 'Cadastrando a venda',
					message: 'Enviando os dados da venda para o servidor.',
					icon: <IconX />,
					loading: true,
					autoClose: false,
					withCloseButton: false,
				});
				const createdOrder = await service.create(data);
				setSearchedOrder(createdOrder);
				setSearchTerm(createdOrder.id.toString());
				notifications.update({
					id: 'creating-order',
					title: 'Venda cadastrada.',
					message: 'Sua venda foi cadastrada com sucesso.',
					color: 'teal',
					icon: <IconCheck size="1rem" />,
					autoClose: 4000,
				});
			} catch (error) {
				console.error(error);
				notifications.update({
					id: 'creating-order',
					title: 'Erro de servidor.',
					message: 'Não foi possível cadastrar a nova venda.',
					color: 'red',
					icon: <IconX />,
					autoClose: false,
				});
			} finally {
				close();
			}
		},
		[close, setSearchTerm]
	);

	const handleSearch = useCallback(async (id: number) => {
		try {
			if (id !== 0) {
				const order = await service.getById(id);
				if (order) {
					setSearchedOrder(order);
				} else {
					notifications.show({
						id: 'search-order',
						message: `Nenhuma venda encontrada para o ID: ${id}`,
						color: 'red',
						icon: <IconX />,
						autoClose: 2000,
					});
				}
			} else {
				setSearchedOrder(undefined);
			}
		} catch (error) {
			notifications.show({
				id: 'search-order',
				title: 'Erro de servidor',
				message: 'Erro ao buscar as vendas',
				color: 'red',
				icon: <IconX />,
				autoClose: 2000,
			});
		}
	}, []);

	const handleClearSearch = useCallback(() => {
		setSearchTerm('');
		setSearchedOrder(undefined);
	}, [setSearchTerm]);

	const handleChangeStatus = useCallback(
		async (newStatus: OrderStatus) => {
			if (!searchedOrder) {
				return;
			}
			try {
				notifications.show({
					id: 'updating-order',
					title: 'Atualizando status da venda',
					message: 'Enviando os dados da venda para o servidor.',
					icon: <IconX />,
					loading: true,
					autoClose: false,
					withCloseButton: false,
				});
				await service.updateStatus(searchedOrder, newStatus);
				setSearchedOrder((prev) =>
					prev ? { ...prev, status: newStatus } : undefined
				);
				notifications.update({
					id: 'updating-order',
					title: 'Status atualizado.',
					message: 'Sua venda foi atualizada com sucesso.',
					color: 'teal',
					icon: <IconCheck size="1rem" />,
					autoClose: 4000,
				});
			} catch (error) {
				console.error(error);
				notifications.update({
					id: 'updating-order',
					title: 'Erro de servidor.',
					message: 'Não foi possível atualizar o status da venda.',
					color: 'red',
					icon: <IconX />,
					autoClose: false,
				});
			}
		},
		[searchedOrder]
	);

	return (
		<>
			<Box p={20}>
				<Text align="center" c="dimmed">
					Instituto Adventista de Tecnologia
				</Text>
			</Box>
			<Divider />
			<Container maw={640} mx="auto">
				<Flex justify="space-between" align="center">
					<Title my="xl">Vendas</Title>
					<Button
						leftIcon={<IconPlus />}
						variant="gradient"
						gradient={{ from: 'indigo', to: 'cyan' }}
						onClick={open}
					>
						Nova venda
					</Button>
				</Flex>
				<SearchInput
					searchTerm={searchTerm}
					onChangeSearchTerm={setSearchTerm}
					onRequestSearch={(id) => {
						if (!Number.isNaN(id)) {
							handleSearch(Number(id));
						}
					}}
				/>

				<Space />

				{searchedOrder ? (
					<OrderCard
						order={searchedOrder}
						onRequestClose={handleClearSearch}
						onRequestUpdateStatus={handleChangeStatus}
					/>
				) : (
					<Text align="center" c="dimmed" fz="lg" mt={60}>
						Nada para mostrar aqui.
					</Text>
				)}
			</Container>

			<Modal opened={opened} onClose={close} size="lg" title="Nova venda">
				<CreateOrderForm
					onRequestCreate={handleCreate}
					onRequestClose={close}
				/>
			</Modal>
		</>
	);
}
