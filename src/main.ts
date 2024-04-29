import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs, NATS_SERVERS } from './config/index';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

  const logger = new Logger('Payment Microservice')

  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  app.setGlobalPrefix('api')
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natservers
      }
    },
    { inheritAppConfig: true }
  )

  await app.startAllMicroservices()

  logger.log(`Payment Microservices running on port ${envs.port}`)
  await app.listen(envs.port);
}
bootstrap();
