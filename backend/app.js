const express = require('express');
const db = require('./db');

const app = express();

app.use(express.json());

db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

app.use('/users', require('./routes/userRoutes'));
app.get('/', (req, res) => {
  res.send('User Management API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
