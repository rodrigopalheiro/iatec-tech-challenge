import { TextInput, ActionIcon, useMantineTheme } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { IconSearch, IconArrowRight, IconArrowLeft } from '@tabler/icons-react';

export function SearchInput({
	searchTerm,
	onChangeSearchTerm,
	onRequestSearch,
}: SearchInputProps) {
	const theme = useMantineTheme();

	return (
		<TextInput
			icon={<IconSearch size="1.1rem" stroke={1.5} />}
			radius="xl"
			size="md"
			type="number"
			rightSection={
				<ActionIcon
					size={32}
					radius="xl"
					color={theme.primaryColor}
					variant="filled"
					onClick={() => onRequestSearch(searchTerm)}
				>
					{theme.dir === 'ltr' ? (
						<IconArrowRight size="1.1rem" stroke={1.5} />
					) : (
						<IconArrowLeft size="1.1rem" stroke={1.5} />
					)}
				</ActionIcon>
			}
			placeholder="Buscar por ID"
			rightSectionWidth={42}
			value={searchTerm}
			onChange={onChangeSearchTerm}
			onKeyDown={getHotkeyHandler([
				['Enter', () => onRequestSearch(searchTerm)],
			])}
		/>
	);
}

type SearchInputProps = {
	searchTerm: string;
	onChangeSearchTerm: (
		value: string | React.ChangeEvent<any> | null | undefined
	) => void;
	onRequestSearch: (term: string) => void;
};
