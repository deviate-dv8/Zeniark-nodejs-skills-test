import { ValidationPipe } from '@nestjs/common';

export default new ValidationPipe({
  skipUndefinedProperties: true,
});
