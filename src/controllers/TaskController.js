const path = require('path');
const fileUpload = require('express-fileupload');

// ...
function index(req, res) {
  req.getConnection((err, conn) => {
    // Elimina la condición que filtra por tienda
    const query = `
      SELECT dulces.*, tiendulces.nomTien
      FROM dulces
      JOIN tiendulces ON dulces.Tiendulces_prod = tiendulces.idTien
      ORDER BY tiendulces.nomTien, dulces.nom_dulce;
    `;

    conn.query(query, (err, productos) => {
      if (err) {
        res.json(err);
      }
      res.render('home', { productos });
    });
  });
}

function indexTien(req, res) {
  // Obtén el ID del usuario de la sesión
  const id = req.session.user.id;

  req.getConnection((err, conn) => {
    // Utiliza una consulta JOIN para obtener los productos de la tienda del usuario
    conn.query('SELECT dulces.* FROM dulces JOIN Tiendulces ON dulces.Tiendulces_prod = Tiendulces.idTien WHERE Tiendulces.id = ?', [id], (err, tasks) => {
      if (err) {
        res.json(err);
      }
      res.render('tasks/dash', { tasks });
    });
  });
}

function indexClie(req, res) {
  req.getConnection((err, conn) => {
    // Elimina la condición que filtra por tienda
    const query = `
      SELECT dulces.*, tiendulces.nomTien
      FROM dulces
      JOIN tiendulces ON dulces.Tiendulces_prod = tiendulces.idTien
      ORDER BY tiendulces.nomTien, dulces.nom_dulce;
    `;

    conn.query(query, (err, productos) => {
      if (err) {
        res.json(err);
      }
      res.render('tasks/dashClie', { productos });
    });
  });
}


function indexProductos(req, res) {
  // Obtén el ID del usuario de la sesión
  const id = req.session.user.id;

  req.getConnection((err, conn) => {
    // Utiliza una consulta JOIN para obtener todos los productos de la tienda del usuario
    const query = `
      SELECT * from dulces;
    `;

    conn.query(query, [id], (err, dulces) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      console.log("Dulces data from database:", dulces);

      // Render the 'tasks/dash' view with the retrieved dulces data
      res.render('tasks/dash', { dulces });
    });
  });
}

function create(req, res) {

  res.render('tasks/create');
}

function store(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No se han seleccionado archivos.');
  }

  const data = req.body;
  const imagen_producto = req.files.imagen_producto;

  // Mueve el archivo a la carpeta de imágenes
  const uploadPath = path.join(__dirname, '..', 'public', 'img', imagen_producto.name);

  imagen_producto.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Verifica si la sesión del usuario y la propiedad id existen
    if (req.session && req.session.user && req.session.user.id) {
      console.log('Session:', req.session);
      console.log('User:', req.session.user);

      const id = req.session.user.id;

      // Verifica si el usuario es una tienda válida
      req.getConnection((err, conn) => {
        conn.query('SELECT * FROM Tiendulces WHERE id = ?', [id], (err, result) => {
          if (err) {
            return res.status(500).send('Error de servidor');
          }

          if (result.length === 0) {
            // Si el usuario no es una tienda, asigna un valor predeterminado o lanza un error
            data.Tiendulces_prod = null; // o asigna un valor predeterminado válido para tienda_prod
          } else {
            // Si el usuario es una tienda, asigna el ID de la tienda a tienda_prod
            data.Tiendulces_prod = result[0].idTien;
          }

          // Asigna la ruta de la imagen al campo imagen_producto
          data.imagen_producto = `/img/${imagen_producto.name}`;

          // Continúa con la inserción en la tabla productos
          req.getConnection((err, conn) => {
            conn.query('INSERT INTO dulces SET ?', [data], (err, rows) => {
              if (err) {
                console.error('Error al insertar el producto:', err);
                return res.status(500).send('Error de servidor');
              }
              res.redirect('/dashTiend');
            });
          });
        });
      });
    } else {
      return res.status(401).send('Acceso no autorizado'); // O maneja la falta de sesión de usuario de otra manera
    }
  });
}




function createUsu(req, res) {
  res.render('createUsu/create');
}

function storeUsu(req, res) {
  const data = req.body;

  console.log('Received data:', data); 

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).send('Error de servidor');
    }

    const query = 'INSERT INTO users SET ?';

    conn.query(query, [data], (err, userResult) => {
      if (err) {
        console.error('Error inserting data into the users table:', err);
        return res.status(500).send('Error de servidor');
      }

      console.log('User registration successful!');
      res.redirect('/login/index');
    });
  });
}


function storeTien(req, res) {
  const userData = {
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    role: 'usuTien',
  };

  const tiendaData = {
    nomTien: req.body.nomTien,
    DescTien: req.body.DescTien,
    RegTien: req.body.RegTien,
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión a la base de datos:', err);
      return res.status(500).send('Error de servidor');
    }

    conn.beginTransaction((err) => {
      if (err) {
        console.error('Error al iniciar la transacción:', err);
        return res.status(500).send('Error de servidor');
      }

      conn.query('INSERT INTO users SET ?', [userData], (err, userResult) => {
        if (err) {
          return conn.rollback(() => {
            console.error('Error al insertar en users:', err);
            return res.status(500).send('Error de servidor');
          });
        }

        const id = userResult.insertId;

        tiendaData.id = id;

        conn.query('INSERT INTO Tiendulces SET ?', [tiendaData], (err, tiendaResult) => {
          if (err) {
            return conn.rollback(() => {
              console.error('Error al insertar en tienda:', err);
              return res.status(500).send('Error de servidor');
            });
          }

          conn.commit((err) => {
            if (err) {
              console.error('Error al confirmar la transacción:', err);
              return res.status(500).send('Error de servidor');
            }

            res.redirect('/login/index');
          });
        });
      });
    });
  });
}

function destroy(req, res) {
  const id = req.body.id;

  req.getConnection((err, conn) => {
    conn.query('DELETE FROM dulces WHERE iddulce = ?', [id], (err, rows) => {
      res.redirect('/dashTiend');
    });
  });
}

function edit(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM dulces WHERE iddulce = ?', [id], (err, tasks) => {
      if (err) {
        res.json(err);
      }
      res.render('tasks/edit', { tasks });
    });
  });
}

function update(req, res) {
  const id = req.params.id;
  const data = req.body;

  req.getConnection((err, conn) => {
    conn.query('UPDATE dulces SET ? WHERE iddulce = ?', [data, id], (err, rows) => {
      res.redirect('/dashTiend');
    });
  });
}

module.exports = {
  index: index,
  indexProductos: indexProductos,
  indexClie: indexClie,
  indexTien: indexTien,
  create: create,
  createUsu: createUsu,
  storeUsu: storeUsu,
  storeTien: storeTien,
  store: store,
  destroy: destroy,
  edit: edit,
  update: update,
};



