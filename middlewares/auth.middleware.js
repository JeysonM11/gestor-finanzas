const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader);

  // Validar si el encabezado de autorización tiene el formato adecuado
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Formato de token inválido. Debe ser "Bearer <token>"'
    });
  }

  const token = authHeader.split(" ")[1];
  console.log('Token extraído:', token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token no proporcionado"
    });
  }

  // Asegurarse de que el JWT_SECRET esté definido
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no está definido');
    return res.status(500).json({
      success: false,
      message: "Error de servidor, JWT_SECRET no está definido"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    // Adjuntar el usuario decodificado al objeto de la solicitud
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    return res.status(401).json({
      success: false,
      message: "Token inválido"
    });
  }
};

module.exports = authMiddleware;
