import 'dayjs/locale/pt-br';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import { HomePage } from './pages';

function App() {
	return (
		<MantineProvider withGlobalStyles withNormalizeCSS>
			<DatesProvider settings={{ locale: 'pt-br', firstDayOfWeek: 0 }}>
				<Notifications />
				<HomePage />
			</DatesProvider>
		</MantineProvider>
	);
}

export default App;
