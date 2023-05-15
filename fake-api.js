import express from 'express';
import bodyParser from 'body-parser';
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use((_, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
	res.header('Access-Control-Allow-Headers', '*');
	res.header(
		'Access-Control-Allow-Methods',
		'PUT,POST,GET,DELETE,OPTIONS,PATCH'
	);
	next();
});

let nextId = 2;
const orders = [
	{
		seller: {
			id: 5,
			cpf: '355.222.222-55',
			name: 'Jacqueline Alves Palheiro',
		},
		date: '2023-05-12T02:49:57.401Z',
		items: [
			{
				description: 'Cosmético',
				ammount: 1,
			},
		],
		status: 'WAITING_PAYMENT',
		id: 1,
	},
];

app.post('/orders', (req, res) => {
	const newOrder = {
		...req.body,
		id: nextId++,
	};
	orders.push(newOrder);
	return res.json(newOrder);
});

app.get('/orders/:id', (req, res) => {
	const finded = orders.find((it) => it.id == req.params.id);
	if (finded) {
		res.json(finded);
	} else {
		res.status(404).send('Not found');
	}
});

app.put('/orders/:id', (req, res) => {
	const actualIndex = orders.findIndex((it) => it.id == req.params.id);
	const newOrder = {
		...orders[actualIndex],
		...req.body,
	};
	orders[actualIndex] = newOrder;
	res.json(newOrder);
});

app.listen(port, () => {
	console.log(`Fake API is running on port ${port}`);
});
