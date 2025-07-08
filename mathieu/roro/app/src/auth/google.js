import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import fastifyPassport from 'fastify-passport';
export function setupGoogleStrategy() {
    fastifyPassport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        // Here you find or create your user in DB.
        const user = {
            id: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0].value,
        };
        done(null, user);
    }));
    fastifyPassport.registerUserSerializer(async (user, req) => user);
    fastifyPassport.registerUserDeserializer(async (user, req) => user);
}
export async function googleAuthCallback(fastify) {
    fastify.post('/auth/google/callback', async (request, reply) => {
        const { token } = request.body;
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload)
                return reply.status(401).send({ error: 'Invalid token' });
            // Extract user info from Google payload
            const { email, name, sub: googleId, picture } = payload;
            // TODO: Check user in DB or create new user
            const user = await fastify.database.getUserByGoogleId(googleId) ||
                await fastify.database.createUserWithGoogle({ googleId, email, name, picture });
            // Create session
            request.session.authenticated = true;
            request.session.userId = user.id;
            return reply.send({ success: true, user });
        }
        catch (err) {
            fastify.log.error(err);
            return reply.status(401).send({ error: 'Invalid token' });
        }
    });
}
// export async function registerGoogleRoutes(fastify: FastifyInstance) {
//     fastify.get(
//         '/auth/google',
//         { preValidation: fastifyPassport.authenticate('google', { scope: ['profile', 'email'] }) },
//         async (_request, reply) => {
//         // Redirect happens automatically
//         }
//     );
//     fastify.get(
//         '/auth/google/callback',
//         {
//             preValidation: fastifyPassport.authenticate('google', {
//                 failureRedirect: '/',
//                 session: true,
//         }),
//         },
//         async (request, reply) => {
//         // Successful login
//         reply.redirect('/game/pong'); // or dashboard
//         }
//     );
// }
// export default { setupGoogleStrategy, registerGoogleRoutes };
