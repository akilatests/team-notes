import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ErrorShapeFilter } from './common/error-shape.filter';

/** Shared by main.ts and the e2e tests, so tests run the app exactly as it ships. */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ErrorShapeFilter());
}
