// Пишет в терминал строку вида: POST /api/products -> 201
export function logger(req, res, next) {
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`);
  });
  next();
}
