import { Button, Flex } from '@mantine/core';
import { OrderStatus } from '../services';

export function OrderCardAction({
	status,
	onActionPerformed,
}: OrderCardActionProps) {
	const actions = mappedStatus[status];

	return (
		<Flex gap={15} justify="flex-end" mt={40}>
			{actions.map(({ label, status }) => (
				<Button
					key={status}
					variant="outline"
					onClick={() => onActionPerformed(status)}
				>
					{label}
				</Button>
			))}
		</Flex>
	);
}

type OrderCardActionProps = {
	status: OrderStatus;
	onActionPerformed: (status: OrderStatus) => void;
};

const mappedStatus = {
	[OrderStatus.WAITING_PAYMENT]: [
		{ label: 'Pagamento Aprovado', status: OrderStatus.PAYMENT_APPROVED },
		{ label: 'Cancelado', status: OrderStatus.CANCELED },
	],
	[OrderStatus.PAYMENT_APPROVED]: [
		{
			label: 'Enviado',
			status: OrderStatus.SENT,
		},
		{ label: 'Cancelado', status: OrderStatus.CANCELED },
	],
	[OrderStatus.SENT]: [
		{
			label: 'Entregue',
			status: OrderStatus.DELIVERED,
		},
	],
	[OrderStatus.CANCELED]: [],
	[OrderStatus.DELIVERED]: [],
};
