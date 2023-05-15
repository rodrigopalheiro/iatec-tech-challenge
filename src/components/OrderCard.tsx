import {
	Box,
	CloseButton,
	Flex,
	Paper,
	Space,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { Order, OrderStatus } from '../services';
import { OrderCardStatus } from './OrderCardStatus';
import { OrderCardAction } from './OrderCardAction';

export function OrderCard({
	order,
	onRequestClose,
	onRequestUpdateStatus,
}: OrderCardProps) {
	return (
		<Paper shadow="xl" radius="md" p="xl" pt="md" mt={60} withBorder>
			<CloseButton
				onClick={onRequestClose}
				aria-label="Fechar detalhes da venda"
				ml="auto"
				mb="md"
			/>

			<Flex gap={15}>
				<Title order={3} mr="auto">
					Venda ID: {order.id}
				</Title>
				<OrderCardStatus status={order.status} />
			</Flex>

			<Space my={30} />

			<Flex gap={30} my="sm">
				<Box>
					<Text size="xs" color="dimmed" tt="uppercase">
						Data da venda
					</Text>
					<Text weight={500} size="lg">
						{order.date.toLocaleString('pt-br', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
						})}
					</Text>
				</Box>
			</Flex>

			<Flex gap={30} my="sm">
				<Box>
					<Text size="xs" color="dimmed" tt="uppercase">
						ID Vendedor
					</Text>
					<Text weight={500} size="lg">
						{order.seller.id}
					</Text>
				</Box>
				<Box>
					<Text size="xs" color="dimmed" tt="uppercase">
						CPF Vendedor
					</Text>
					<Text weight={500} size="lg">
						{order.seller.cpf}
					</Text>
				</Box>
				<Box>
					<Text size="xs" color="dimmed" tt="uppercase">
						Nome do vendedor
					</Text>
					<Text weight={500} size="lg">
						{order.seller.name}
					</Text>
				</Box>
			</Flex>

			<Text size="xs" color="dimmed" tt="uppercase" mb="sm">
				Itens
			</Text>
			<Table horizontalSpacing="md" withBorder withColumnBorders>
				<thead>
					<tr>
						<th>Descrição</th>
						<th>Qntde</th>
					</tr>
				</thead>
				<tbody>
					{order.items.map((item) => (
						<tr key={item.description}>
							<td>{item.description}</td>
							<td>{item.ammount}</td>
						</tr>
					))}
				</tbody>
			</Table>

			<OrderCardAction
				status={order.status}
				onActionPerformed={onRequestUpdateStatus}
			/>
		</Paper>
	);
}

type OrderCardProps = {
	order: Order;
	onRequestClose: () => void;
	onRequestUpdateStatus: (newStatus: OrderStatus) => void;
};
