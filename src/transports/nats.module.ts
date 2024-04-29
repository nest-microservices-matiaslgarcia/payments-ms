import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVERS, envs } from 'src/config';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: NATS_SERVERS,
                transport: Transport.NATS,
                options: {
                    servers: envs.natservers
                }
            },
        ]),
    ],
    exports: [
        ClientsModule.register([
            {
                name: NATS_SERVERS,
                transport: Transport.NATS,
                options: {
                    servers: envs.natservers
                }
            },
        ]),
    ]
})
export class NatsModule { }
