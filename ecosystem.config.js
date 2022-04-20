module.exports = {
    apps : [
        {
            name      : "gestor",
            log_date_format : "YYYY-MM-DD HH:mm:ss Z",
            script    : "index.js",
            instances : "max",
            exec_mode : "cluster",
            listen_timeout: "5000",
            env       : {
		      	NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
              }
        }
    ]
};
