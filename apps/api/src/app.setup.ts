import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ErrorShapeFilter } from '@/common/error-shape.filter';

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
