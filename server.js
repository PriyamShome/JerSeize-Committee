const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');

const app = express();
const PORT = 3000;

const usersFile = path.join(__dirname, 'users.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false
}));

// Routes
app.get('/', (req, res) => {
  res.render('firstpage', { user: req.session.user });
});
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));

// Signup: Save user data to users.json
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).send('Missing username or password');

  try {
    const data = fs.existsSync(usersFile)
      ? fs.readFileSync(usersFile, 'utf8')
      : '[]';

    let users = JSON.parse(data);
    const existingUser = users.find(u => u.username === username);
    if (existingUser) return res.send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.redirect('/login');
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).send('Internal server error');
  }
});

// Login: Validate user from users.json
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!fs.existsSync(usersFile)) return res.send('No users registered');

    const data = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(data);

    const user = users.find(u => u.username === username);
    if (!user) return res.send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Invalid password');

    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Internal server error');
  }
});

// Optional: Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
