{
  "apps": [
    {
      "name": "portfolio-backend",
      "script": "dist/server.js",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": 5000
      },
      "env_production": {
        "NODE_ENV": "production",
        "PORT": 5000
      },
      "env_staging": {
        "NODE_ENV": "staging",
        "PORT": 5000
      },
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "error_file": "logs/err.log",
      "out_file": "logs/out.log",
      "log_file": "logs/combined.log",
      "time": true,
      "max_memory_restart": "1G",
      "node_args": "--max-old-space-size=1024",
      "watch": false,
      "ignore_watch": ["node_modules", "logs"],
      "max_restarts": 10,
      "min_uptime": "10s",
      "restart_delay": 4000,
      "kill_timeout": 5000,
      "listen_timeout": 3000,
      "reload_delay": 0,
      "wait_ready": true,
      "autorestart": true,
      "cron_restart": "0 2 * * *",
      "merge_logs": true,
      "combine_logs": true,
      "log_type": "json"
    }
  ],
  "deploy": {
    "production": {
      "user": "node",
      "host": "your-server.com",
      "ref": "origin/main",
      "repo": "git@github.com:Krishnadas-N/Personal-Portfolio-Backend.git",
      "path": "/var/www/portfolio-backend",
      "post-deploy": "pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production"
    },
    "staging": {
      "user": "node",
      "host": "staging-server.com",
      "ref": "origin/develop",
      "repo": "git@github.com:Krishnadas-N/Personal-Portfolio-Backend.git",
      "path": "/var/www/portfolio-backend-staging",
      "post-deploy": "pnpm install && pnpm build && pm2 reload ecosystem.config.js --env staging"
    }
  }
}
