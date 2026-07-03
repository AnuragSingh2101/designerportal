const cleanNoSql = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          cleanNoSql(obj[key]);
        }
      }
    }
  }
};

const sanitizeInput = (req, res, next) => {
  if (req.body) cleanNoSql(req.body);
  if (req.query) cleanNoSql(req.query);
  if (req.params) cleanNoSql(req.params);
  next();
};

module.exports = { sanitizeInput };
