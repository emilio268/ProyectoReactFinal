function index(req, res) {
  if (req.session.loggedin) {
		// Output username
    res.redirect('/');
	
  } else {
    res.render('home');
  }
}

function register(req, res) {
  res.render('login/register');
}

function auth(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  // Validar la entrada del usuario
  if (!email || !password) {
    return res.status(400).send('Correo electrónico y contraseña son obligatorios.');
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión a la base de datos:', err);
      return res.status(500).send('Error de servidor');
    }

    conn.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
      if (err) {
        console.error('Error durante la consulta:', err);
        return res.status(500).send('Error de servidor');
      }

      if (rows.length > 0) {
        const user = rows[0];

        // Comparar contraseñas en texto plano
        if (password === user.password) {
          // Iniciar sesión y redirigir según el rol del usuario
          req.session.loggedin = true;
          req.session.user = {
            id: user.email,
            name: user.name,
            role: user.role,
          };

          if (user.role === 'UsuTienda') {
            return res.render('/dash');
          }if (user.role === 'usuClie') {
            return res.redirect('/dashClie');
          }
           else {
            return res.redirect('/dash');
          }
        } else {
          console.log('Contraseña incorrecta');
          return res.render('login/index');
        }
      } else {
        console.log('Usuario no encontrado');
        return res.render('login/index');
      }
    });
  });
}



function logout(req, res) {
  if (req.session.loggedin) {
    req.session.destroy();
  }
  res.redirect('/');
}


module.exports = {
  index: index,
  register: register,
  auth: auth,
  logout: logout,
}
