const cleanEnvVar = (val) => val ? val.replace(/^['"]|['"]$/g, '') : val;

const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGODB_URI;
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!mongoUri) {
    console.error('CRITICAL: MONGODB_URI environment variable is not defined!');
    process.exit(1);
  }
  
  if (!jwtSecret) {
    if (isProduction) {
      console.error('CRITICAL: JWT_SECRET environment variable is not defined in production mode!');
      process.exit(1);
    } else {
      console.warn('WARNING: JWT_SECRET is not defined. Falling back to an insecure default key.');
    }
  } else {
    const cleanedSecret = cleanEnvVar(jwtSecret);
    const insecureDefaults = [
      'supersecretkeyfortokensingning12345',
      'supersecretkeyfortokensingning123456',
      'supersecretkeyfortokensingning1234567'
    ];
    if (insecureDefaults.includes(cleanedSecret)) {
      if (isProduction) {
        console.error('CRITICAL: Insecure default JWT_SECRET cannot be used in production mode!');
        process.exit(1);
      } else {
        console.warn('WARNING: Running with an insecure default JWT_SECRET. Do not use this in production!');
      }
    }
  }

  // Check admin configurations
  const adminEmail = cleanEnvVar(process.env.ADMIN_EMAIL);
  const adminPassword = cleanEnvVar(process.env.ADMIN_PASSWORD);
  
  if (!adminEmail || !adminPassword) {
    console.warn('WARNING: ADMIN_EMAIL or ADMIN_PASSWORD is not configured. Admin features may not function properly.');
  }

  console.log('Environment configuration check passed successfully.');
};

module.exports = { validateEnv };
