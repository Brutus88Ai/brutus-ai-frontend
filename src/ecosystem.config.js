module.exports = {
  apps: [
    {
      name: 'brutus-ai-frontend',
      script: 'npx',
      args: 'serve dist -s -l 3000',
      cwd: '/var/www/brutus-ai',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/brutus-ai-error.log',
      out_file: '/var/log/pm2/brutus-ai-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      restart_delay: 4000
    },
    {
      name: 'brutus-ai-backend',
      script: './server/index.js',
      cwd: '/var/www/brutus-ai',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
        SUPPORT_EMAIL: 'brutusaiswebapp@gmail.com'
      },
      error_file: '/var/log/pm2/brutus-backend-error.log',
      out_file: '/var/log/pm2/brutus-backend-out.log',
      autorestart: true
    }
  ]
};
