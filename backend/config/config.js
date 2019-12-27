
const config = require('./config.json');
const finalConfig = config.production;

finalConfig.node_port = takeFirstNotNull(process.env.BACKEND_PORT, finalConfig.node_port);
//MAIL ENV VIARIABLES
finalConfig.mail.host = takeFirstNotNull(process.env.MAIL_HOST, finalConfig.mail.host);
finalConfig.mail.port = takeFirstNotNull(process.env.MAIL_PORT, finalConfig.mail.port);
finalConfig.mail.address = takeFirstNotNull(process.env.MAIL_ADDR, finalConfig.mail.address);
finalConfig.mail.password = takeFirstNotNull(process.env.MAIL_PASS, finalConfig.mail.password);

//DATABASE ENV VARIABLES
finalConfig.database.address = takeFirstNotNull(process.env.DB_ADDR, finalConfig.database.address);
finalConfig.database.username = takeFirstNotNull(process.env.DB_USER, finalConfig.database.username);
finalConfig.database.password = takeFirstNotNull(process.env.DB_PASS, finalConfig.database.password);
finalConfig.database.name = takeFirstNotNull(process.env.DB_NAME, finalConfig.database.name);
finalConfig.database.port = takeFirstNotNull(process.env.DB_PORT, finalConfig.database.port);

finalConfig.frontend.address = takeFirstNotNull(process.env.FRONTEND_ADDR, finalConfig.frontend.address);
finalConfig.frontend.report_ep = process.env.FRONTEND_ADDR ? (process.env.FRONTEND_ADDR + "/report/") : finalConfig.frontend.report_ep;
finalConfig.images.path = takeFirstNotNull(process.env.ERDIMG_PATH, finalConfig.images.path);
finalConfig.auth.secret = takeFirstNotNull(process.env.AUTH_SECRET, finalConfig.auth.secret);

function takeFirstNotNull(first, second){
    return first || second;
}
global.gConfig = finalConfig;