const allowedDomains = [
  'http://dev-oracle.htbeyondcloud.com',
  'http://alpha.htbeyondcloud.com',
  'http://oracle.htbeyondcloud.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

export const checkOrigin = (req, res, next) => {
  const origin = req.headers.origin;

  if (allowedDomains.includes(origin)) {
    return next();
  }

  res.status(403).send('Access Denied');
};

export const corsOptions = {
  origin: allowedDomains,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
