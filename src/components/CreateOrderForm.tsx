import { useForm, zodResolver } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import {
	ActionIcon,
	Box,
	Button,
	Flex,
	Group,
	NumberInput,
	Text,
	TextInput,
	Divider,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useState } from 'react';
import { z } from 'zod';

const CPF_PATTERN = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/; // 000.000.000-00

const validationSchema = z.object({
	seller: z.object({
		id: z.coerce.number({
			required_error: 'Id é obrigatório',
		}),
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

export function CreateOrderForm({
	onRequestCreate,
	onRequestClose,
}: OrderFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const form = useForm({
		initialValues: {
			date: new Date(),
			seller: {
				id: undefined,
				cpf: '',
				name: '',
			},
			items: [{ key: randomId(), description: '', ammount: 1 }],
		},
		validate: zodResolver(validationSchema),
	});

	const fields = form.values.items.map((item, index) => (
		<Group key={item.key} mt="xs">
			<TextInput
				placeholder="Descrição do item"
				required
				sx={{ flex: 1 }}
				w="100%"
				{...form.getInputProps(`items.${index}.description`)}
			/>
			<NumberInput
				placeholder="0"
				required
				w={100}
				{...form.getInputProps(`items.${index}.ammount`)}
			/>
			<ActionIcon
				color="red"
				onClick={() => form.removeListItem('items', index)}
			>
				<IconTrash size="1rem" />
			</ActionIcon>
		</Group>
	));

	return (
		<form
			onSubmit={form.onSubmit((values) => {
				setIsLoading(true);
				onRequestCreate(values);
			})}
		>
			<Box maw={600} mx="auto">
				<DatePickerInput
					label="Data da venda"
					withAsterisk
					placeholder="00/00/0000"
					valueFormat="DD/MM/YYYY"
					required
					{...form.getInputProps('date')}
					w={160}
				/>
				<Text weight={700} size="sm" mt="xl" mb="sm">
					Sobre o vendedor
				</Text>
				<Flex gap={15}>
					<NumberInput
						label="ID"
						withAsterisk
						required
						placeholder="ID"
						hideControls
						w={60}
						{...form.getInputProps('seller.id')}
					/>
					<TextInput
						label="CPF"
						withAsterisk
						required
						placeholder="000.000.000-00"
						{...form.getInputProps('seller.cpf')}
					/>
					<TextInput
						label="Nome"
						withAsterisk
						required
						placeholder="Nome"
						sx={{ flex: 1 }}
						{...form.getInputProps('seller.name')}
					/>
				</Flex>
				<Text weight={700} size="sm" mt="xl" mb="sm">
					Itens
				</Text>
				{fields.length > 0 ? (
					<Group mb="xs">
						<Text weight={500} size="sm" sx={{ flex: 1 }}>
							Descrição{' '}
							<Text c="red" span>
								*
							</Text>
						</Text>
						<Text weight={500} size="sm" w={145}>
							Qntde{' '}
							<Text c="red" span>
								*
							</Text>
						</Text>
					</Group>
				) : (
					<Text color="dimmed" align="left" size="md">
						Nenhum item adicionado...
					</Text>
				)}

				{fields}

				{fields.length === 0 && form.errors.items && (
					<Text fz="xs" c="red">
						{form.errors.items?.toString()}
					</Text>
				)}

				<Group position="center" mt="md">
					<Button
						variant="subtle"
						fullWidth
						onClick={() =>
							form.insertListItem('items', {
								key: randomId(),
								description: '',
								ammount: 1,
							})
						}
					>
						Adicionar item
					</Button>
				</Group>
				<Divider my="md" />
				<Group position="right" mt="lg">
					<Button variant="default" onClick={onRequestClose}>
						Cancelar
					</Button>
					<Button type="submit" loading={isLoading}>
						Cadastrar
					</Button>
				</Group>
			</Box>
		</form>
	);
}

type OrderFormProps = {
	onRequestCreate: (data: any) => void;
	onRequestClose: () => void;
};
