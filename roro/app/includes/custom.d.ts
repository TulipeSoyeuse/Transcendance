import 'fastify'
import { Database } from '../src/plugins/dbplugin';

declare module 'fastify' {
    interface FastifyInstance {
        database: Database;
    }

    interface Session {
        authenticated?: boolean;
        userId?: number;
    }
}

declare module "ammo.js" {
    const Ammo: any;
    export default Ammo;
}
