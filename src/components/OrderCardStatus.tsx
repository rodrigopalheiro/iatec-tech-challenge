import { Badge } from '@mantine/core';
import { OrderStatus } from '../services';

export function OrderCardStatus({ status }: { status: OrderStatus }) {
	const { label, color } = mappedStatus[status];
	return (
		<Badge color={color} size="lg" variant="filled">
			{label}
		</Badge>
	);
}

const mappedStatus = {
	[OrderStatus.WAITING_PAYMENT]: {
		label: 'Aguardando pagamento',
		color: 'yellow',
	},
	[OrderStatus.PAYMENT_APPROVED]: {
		label: 'Pagamento aprovado',
		color: 'green',
	},
	[OrderStatus.SENT]: { label: 'Enviado', color: undefined },
	[OrderStatus.DELIVERED]: { label: 'Entregue', color: 'indigo' },
	[OrderStatus.CANCELED]: { label: 'Cancelado', color: 'gray' },
};
